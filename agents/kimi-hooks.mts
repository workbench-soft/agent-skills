// Adds the Kimi Code hooks to its config.toml in a marked block, or takes them
// out with --uninstall. Kimi takes only event, matcher, command and timeout.
// Usage: node kimi-hooks.mts <config.toml> [--uninstall]
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const [file, flag] = process.argv.slice(2);
if (!file) throw new Error("usage: node kimi-hooks.mts <config.toml> [--uninstall]");
const uninstall = flag === "--uninstall";
const open = "# agent-skills: hooks";
const close = "# agent-skills: end";
// Kimi puts the output of UserPromptSubmit into the context. The Codex list holds
// the time hook for both systems, so the two agents run the same command.
const [time] = JSON.parse(readFileSync(new URL("codex-hooks.json", import.meta.url), "utf8"));
const { command, commandWindows, timeout } = time.group.hooks[0];
const hooks = [
  { event: time.event, command: process.platform === "win32" ? commandWindows : command, timeout },
];

const raw = existsSync(file) ? readFileSync(file, "utf8") : "";
// An install from agent-skills-private wrote its own marker, so its block counts as this one.
const text = raw.replaceAll("# agent-skills-private:", "# agent-skills:");
const start = text.indexOf(open);
const end = text.indexOf(close, start);
// With no end line the block's length is unknown, and the cut would take the person's tables after it.
if (start >= 0 && end < 0) {
  console.error(
    `left ${file} alone, its hooks block has no end line. Put "${close}" after it and run install.sh again`,
  );
  process.exit(0);
}
const own = (
  start < 0 ? text : text.slice(0, start) + text.slice(end + close.length + 1)
).trimEnd();
const block = hooks.map((h) =>
  ["[[hooks]]", ...Object.entries(h).map(([k, v]) => `${k} = ${JSON.stringify(v)}`)].join("\n"),
);
// [[hooks]] tables go last, so no later key lands inside one.
const next = uninstall ? own : `${own}${own ? "\n\n" : ""}${open}\n${block.join("\n\n")}\n${close}`;
if (next.trimEnd() === raw.trimEnd()) {
  console.log(`Hooks already ${uninstall ? "out of" : "in"} ${file}`);
} else {
  writeFileSync(file, next ? `${next}\n` : "");
  console.log(`Hooks ${uninstall ? "removed from" : "written to"} ${file}`);
}
