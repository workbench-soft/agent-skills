// The Mac twin of turn-voice.exe: Claude Code, Codex and Kimi Code run it at
// the end of a turn, and it plays a cue and says how the turn ended.
//   node turn-voice.mts <mode> <lang> [<Russian voice> <English voice> <edge-tts> [<Russian pitch> <English pitch>]]
// The modes and the args match turn-voice.cs. The hook JSON comes on stdin.
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { cueWav, trim } from "./sound.mts";
import { agentName, cyrillic, fromMarker, lead, runs, taskTitle, type Outcome } from "./voice.mts";

const hash = (s: string) => createHash("sha1").update(s).digest("hex").slice(0, 16).toUpperCase();
const cache = process.env.TURN_VOICE_CACHE ?? join(homedir(), "Library", "Caches", "turn-voice");
const log = (line: string) => {
  const path = process.env.TURN_VOICE_LOG;
  if (path) fs.appendFileSync(path, `${new Date().toISOString()} ${line}\n`);
};
const sleep = (ms: number) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const age = (file: string) =>
  fs.existsSync(file) ? Date.now() - fs.statSync(file).mtimeMs : Infinity;
const touch = (file: string) => fs.utimesSync(file, new Date(), new Date());
const marker = (key: string) => join(cache, "runs", hash(key));

// The desktop app can run one hook twice for one event. The first run claims a
// marker file, and a twin within 30 seconds stays quiet.
function seenRecently(key: string): boolean {
  const file = marker(key);
  fs.mkdirSync(join(cache, "runs"), { recursive: true });
  for (const old of fs.readdirSync(join(cache, "runs")))
    if (age(join(cache, "runs", old)) > 300000)
      fs.rmSync(join(cache, "runs", old), { force: true });
  try {
    fs.closeSync(fs.openSync(file, "wx"));
    return false;
  } catch {
    if (age(file) < 30000) return true;
    touch(file);
    return false;
  }
}

// Older hosts send only the transcript path, so its last assistant entry holds the marker.
function tail(path: unknown, from = '"type":"assistant"'): string {
  if (typeof path !== "string") return "";
  try {
    const text = fs.readFileSync(path, "utf8").slice(-65536);
    const i = text.lastIndexOf(from);
    return i >= 0 ? text.slice(i) : text;
  } catch {
    return "";
  }
}

// Kimi Code sends only the session id. session_index.jsonl gives its folder, and wire.jsonl the reply.
function kimiTail(session: unknown): string {
  const home = process.env.KIMI_CODE_HOME ?? join(homedir(), ".kimi-code");
  try {
    const line = fs
      .readFileSync(join(home, "session_index.jsonl"), "utf8")
      .split("\n")
      .findLast((l) => l.includes(`"${session}"`));
    const dir = line && JSON.parse(line).sessionDir;
    return dir ? tail(join(dir, "agents", "main", "wire.jsonl"), '"role":"user"') : "";
  } catch {
    return "";
  }
}

// edge-tts as a .mts script is the test's fake, which runs through node.
function fetchRun(
  text: string,
  voice: string,
  pitch: string | undefined,
  tts: string,
): string | undefined {
  const file = join(cache, `${hash(`${voice}|${pitch ? `${pitch}|` : ""}${text}`)}.mp3`);
  if (fs.existsSync(file)) return (touch(file), file);
  const part = `${file}.part`;
  const args = [
    "--voice",
    voice,
    ...(pitch ? [`--pitch=${pitch}`] : []),
    "--text",
    text,
    "--write-media",
    part,
  ];
  const [cmd, ...pre] = /\.m?[jt]s$/.test(tts) ? [process.execPath, tts] : [tts];
  const run = spawnSync(cmd, [...pre, ...args], { timeout: 30000, stdio: "ignore" });
  if (run.status !== 0 || !fs.existsSync(part) || !fs.statSync(part).size)
    return log(`edge-tts exit ${run.status}`);
  fs.renameSync(part, file);
  return file;
}

// Each Russian and each English run gets its own voice, joined into one mp3 with the silence cut.
function neural(
  text: string,
  [ruVoice, enVoice, tts, ruPitch, enPitch]: string[],
): string | undefined {
  if (!ruVoice || !enVoice || !tts || !fs.existsSync(tts)) return log(`no edge-tts at ${tts}`);
  fs.mkdirSync(cache, { recursive: true });
  for (const old of fs.readdirSync(cache))
    if (age(join(cache, old)) > 30 * 86400000)
      fs.rmSync(join(cache, old), { force: true, recursive: true });
  const files: string[] = [];
  for (const run of runs(text)) {
    const ru = cyrillic(run);
    const file = fetchRun(run, ru ? ruVoice : enVoice, valid(ru ? ruPitch : enPitch), tts);
    if (!file) return undefined;
    files.push(file);
  }
  if (!files.length) return undefined;
  const joined = join(cache, `${hash(files.join("|"))}-joined.mp3`);
  if (fs.existsSync(joined)) touch(joined);
  else
    fs.writeFileSync(
      joined,
      Buffer.concat(files.map((f, i) => trim(fs.readFileSync(f), i > 0, i < files.length - 1))),
    );
  return joined;
}

const valid = (pitch: string | undefined) =>
  pitch && /^[+-][1-9]\d{0,2}Hz$/.test(pitch) ? pitch : undefined;

// Sessions that end together speak one after another. mkdir is atomic, so the folder is the lock.
function play(outcome: Outcome, clip: string | undefined): void {
  const lock = join(cache, "lock");
  for (const start = Date.now(); Date.now() - start < 90000; sleep(200)) {
    if (age(lock) > 120000) fs.rmSync(lock, { recursive: true, force: true });
    try {
      fs.mkdirSync(lock);
      break;
    } catch {}
  }
  try {
    let cue = process.env.TURN_VOICE_DONE ?? "/System/Library/Sounds/Glass.aiff";
    if (outcome !== "done" && outcome !== "archived") {
      cue = join(cache, `cue-${outcome}.wav`);
      if (!fs.existsSync(cue)) fs.writeFileSync(cue, cueWav(outcome));
    }
    const player = process.env.TURN_VOICE_PLAYER ?? "afplay";
    for (const file of clip ? [cue, clip] : [cue]) {
      log(`play ${file}`);
      spawnSync(player, [file], { stdio: "ignore", timeout: 60000 });
    }
  } finally {
    fs.rmSync(lock, { recursive: true, force: true });
  }
}

const [first, ...rest] = process.argv.slice(2);
if (!first?.startsWith("@")) {
  // Codex and Kimi Code wait for a hook's pipes to close, so the speech runs on in a detached child.
  const file = join(tmpdir(), `turn-voice-${process.pid}-${Date.now()}.json`);
  fs.writeFileSync(file, fs.readFileSync(0, "utf8"));
  spawn(process.execPath, [process.argv[1], `@${file}`, first ?? "stop", ...rest], {
    detached: true,
    stdio: "ignore",
  }).unref();
  // Codex reads a Stop hook's stdout as JSON and fails the hook on none.
  process.stdout.write("{}");
} else {
  const raw = fs.readFileSync(first.slice(1), "utf8");
  fs.rmSync(first.slice(1), { force: true });
  let input: Record<string, unknown> = {};
  try {
    input = JSON.parse(raw);
  } catch {}
  const [mode = "stop", lang = "en", ...voices] = rest;
  const session = String(input.session_id ?? raw);
  if (seenRecently(`${mode}|${session}`)) log(`skip repeat ${mode}`);
  // An archive already said the task is done, so the Stop after it stays quiet.
  else if (mode === "stop" && age(marker(`archive|${session}`)) < 120000)
    log("skip stop after archive");
  else {
    const message = input.last_assistant_message;
    const outcome: Outcome =
      mode === "fail"
        ? "error"
        : mode === "ask"
          ? "ask"
          : mode === "archive"
            ? "archived"
            : fromMarker(
                typeof message === "string"
                  ? message
                  : input.transcript_path
                    ? tail(input.transcript_path)
                    : kimiTail(input.session_id),
              );
    const head = lead(outcome, lang === "ru", agentName(input.cwd as string | undefined));
    const task = taskTitle(input);
    log(`says ${outcome}: ${task}`);
    play(outcome, neural(task ? `${head}: ${task}` : head, voices));
  }
}
