// Adds the Mac turn-voice hooks to Claude Code, Codex and Kimi Code, with the
// events and args install.ps1 gives the Windows exe. install.sh runs it on macOS.
// Usage: node install-mac.mts [--lang ru|en] [--ru-voice <v>] [--en-voice <v>]
//                             [--ru-pitch <hz>] [--en-pitch <hz>] [--uninstall]
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const { values: opt } = parseArgs({
  options: {
    lang: { type: "string" },
    "ru-voice": { type: "string" },
    "en-voice": { type: "string" },
    "ru-pitch": { type: "string" },
    "en-pitch": { type: "string" },
    uninstall: { type: "boolean" },
  },
});
const home = process.env.HOME ?? "";
const script = fileURLToPath(new URL("turn-voice.mts", import.meta.url));
const quote = (s: string) => `'${s.replace(/'/g, "'\\''")}'`;
const read = (file: string) => (existsSync(file) ? readFileSync(file, "utf8").trimStart() : "");
type Group = { matcher?: string; hooks: Record<string, unknown>[] };
const ours = (g: Group) => JSON.stringify(g).includes("turn-voice.mts");

// The hooks already there keep the voices and pitches picked by hand: <mode> <lang> <ru> <en> <tts> [<ru Hz> <en Hz>].
const settingsFile = join(home, ".claude", "settings.json");
const settings = JSON.parse(read(settingsFile) || "{}");
const hooks: Record<string, Group[]> = (settings.hooks ??= {});
const old = Object.values(hooks).flat().find(ours)?.hooks[0]?.command as string | undefined;
const kept = [...(old ?? "").matchAll(/'((?:[^']|'\\'')*)'/g)]
  .map((m) => m[1].replace(/'\\''/g, "'"))
  .slice(3);
const lang = opt.lang ?? process.env.TURN_VOICE_LANG ?? kept[0] ?? "ru";
const ru = opt["ru-voice"] ?? kept[1] ?? "de-DE-SeraphinaMultilingualNeural";
const en = opt["en-voice"] ?? kept[2] ?? "de-DE-SeraphinaMultilingualNeural";
const hz = (v: string | undefined, k: string | undefined) =>
  v === undefined ? k : `${Number(v) >= 0 ? "+" : ""}${Number(v)}Hz`;
const pitches = [hz(opt["ru-pitch"], kept[4]), hz(opt["en-pitch"], kept[5])];

// edge-tts gives the free Microsoft neural voices through mise. CI skips it, as install.ps1 does.
let tts = "";
if (!opt.uninstall && !process.env.CI && spawnSync("mise", ["--version"]).status === 0) {
  spawnSync("mise", ["use", "-g", "--quiet", "uv@0.9", "pipx:edge-tts@7.3.1"], {
    stdio: "ignore",
    cwd: home,
  });
  tts =
    spawnSync("mise", ["which", "edge-tts"], { cwd: home, encoding: "utf8" }).stdout?.trim() ?? "";
  if (!tts) console.warn("turn-voice: edge-tts is missing, so only the cues play.");
}
const voice = [
  lang.startsWith("ru") || lang.startsWith("рус") ? "ru" : "en",
  ...(tts ? [ru, en, tts] : []),
];
if (tts && (pitches[0] !== "+0Hz" || pitches[1] !== "+0Hz") && pitches[0] && pitches[1])
  voice.push(...(pitches as string[]));
const line = (mode: string) => [process.execPath, script, mode, ...voice].map(quote).join(" ");

// Claude Code: the same five groups as on Windows.
const group = (mode: string, matcher?: string, sync = false): Group => ({
  ...(matcher ? { matcher } : {}),
  hooks: [{ type: "command", command: line(mode), ...(sync ? { timeout: 20 } : { async: true }) }],
});
const own: [string, Group][] = [
  ["Stop", group("stop")],
  ["StopFailure", group("fail")],
  ["Notification", group("ask", "permission_prompt")],
  ["PreToolUse", group("ask", "AskUserQuestion")],
  // Archiving ends the session, so that hook runs to the end before the tool does.
  ["PreToolUse", group("archive", "mcp__ccd_session_mgmt__archive_session", true)],
];
function merge(list: Record<string, Group[]>, groups: [string, Group][]): void {
  for (const event of Object.keys(list)) {
    list[event] = list[event].filter((g) => !ours(g));
    if (!list[event].length) delete list[event];
  }
  if (!opt.uninstall) for (const [event, g] of groups) (list[event] ??= []).push(g);
}
if (existsSync(join(home, ".claude"))) {
  merge(hooks, own);
  if (!Object.keys(hooks).length) delete settings.hooks;
  writeFileSync(settingsFile, `${JSON.stringify(settings, null, 2)}\n`);
}

// Codex: Stop and StopFailure in hooks.json, which takes the Claude Code shape.
const codexFile = join(home, ".codex", "hooks.json");
if (existsSync(join(home, ".codex"))) {
  const codex = JSON.parse(read(codexFile) || "{}");
  const timed = (mode: string): Group => ({
    hooks: [{ type: "command", command: line(mode), timeout: 10 }],
  });
  merge((codex.hooks ??= {}), [
    ["Stop", timed("stop")],
    ["StopFailure", timed("fail")],
  ]);
  writeFileSync(codexFile, `${JSON.stringify(codex, null, 2)}\n`);
}

// Kimi Code: a marked block last in config.toml, since [[hooks]] tables take each key after them.
const kimiFile = join(home, ".kimi-code", "config.toml");
if (existsSync(join(home, ".kimi-code"))) {
  const text = read(kimiFile)
    .replace(/# agent-skills: turn-voice\n[\s\S]*?# agent-skills: end\n?/, "")
    .trimEnd();
  const tables = [
    ["Stop", "stop"],
    ["StopFailure", "fail"],
  ].map(
    ([event, mode]) =>
      `[[hooks]]\nevent = "${event}"\ncommand = ${JSON.stringify(line(mode))}\ntimeout = 10`,
  );
  const block = opt.uninstall
    ? ""
    : `\n\n# agent-skills: turn-voice\n${tables.join("\n\n")}\n# agent-skills: end`;
  writeFileSync(kimiFile, `${(text + block).trimStart()}\n`);
}
console.log(
  `turn-voice: ${opt.uninstall ? "hooks removed" : `Claude Code, Codex and Kimi Code speak the end of each turn in ${voice[0]}`}.`,
);
