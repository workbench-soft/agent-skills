// The Mac twin of fetch.cs: gets the clips of one phrase from edge-tts. Python
// takes seconds to import edge_tts, so fetch.py gets every missing run in one process.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export type Clip = { text: string; voice: string; pitch?: string; rate?: string; file: string };

const script = fileURLToPath(new URL("fetch.py", import.meta.url));

// A clip at the voice's own pitch and rate keeps the name it had before them.
export function clip(
  cache: string,
  text: string,
  voice: string,
  pitch?: string,
  rate?: string,
): Clip {
  const key = `${voice}|${pitch ? `${pitch}|` : ""}${rate ? `${rate}|` : ""}${text}`;
  const name = createHash("sha1").update(key).digest("hex").slice(0, 16).toUpperCase();
  return { text, voice, pitch, rate, file: join(cache, `${name}.mp3`) };
}

// The Python of the edge-tts venv, from the shebang of its script.
function python(tts: string): string | undefined {
  try {
    const line = fs.readFileSync(fs.realpathSync(tts), "utf8").split("\n", 1)[0];
    const path = line.startsWith("#!") ? line.slice(2).trim() : "";
    if (/python[\d.]*$/.test(path) && fs.existsSync(path)) return path;
  } catch {}
  const venv = join(dirname(tts), "..", "edge-tts", "bin", "python");
  return fs.existsSync(venv) ? venv : undefined;
}

// One edge-tts run per clip. edge-tts as a .mts script is the test's fake, which runs through node.
function cli(c: Clip, tts: string, log: (line: string) => void): boolean {
  const part = `${c.file}.part`;
  const args = [
    "--voice",
    c.voice,
    ...(c.pitch ? [`--pitch=${c.pitch}`] : []),
    ...(c.rate ? [`--rate=${c.rate}`] : []),
    "--text",
    c.text,
    "--write-media",
    part,
  ];
  const [cmd, ...pre] = /\.m?[jt]s$/.test(tts) ? [process.execPath, tts] : [tts];
  const run = spawnSync(cmd, [...pre, ...args], { timeout: 30000, stdio: "ignore" });
  if (run.status !== 0 || !fs.existsSync(part) || !fs.statSync(part).size) {
    log(`edge-tts exit ${run.status}`);
    return false;
  }
  fs.renameSync(part, c.file);
  return true;
}

// True once each clip sits in the cache. A run the batch missed goes through the CLI.
export function fetchAll(clips: Clip[], tts: string, log: (line: string) => void): boolean {
  const py = python(tts);
  if (py) {
    const jobs = join(tmpdir(), `turn-voice-jobs-${process.pid}.json`);
    const list = clips.map((c) => ({
      text: c.text,
      voice: c.voice,
      pitch: c.pitch ?? "+0Hz",
      rate: c.rate ?? "+0%",
      out: c.file,
    }));
    fs.writeFileSync(jobs, JSON.stringify(list));
    const start = Date.now();
    spawnSync(py, ["-I", script, jobs], { timeout: 45000, stdio: "ignore" });
    fs.rmSync(jobs, { force: true });
    log(`fetched ${clips.length} clips in ${Date.now() - start} ms`);
  } else log(`no batch fetch for ${tts}`);
  return clips.every((c) => fs.existsSync(c.file) || cli(c, tts, log));
}
