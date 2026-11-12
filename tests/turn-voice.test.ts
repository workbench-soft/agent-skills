// The Mac turn-voice: the phrase logic, a hook run with a fake edge-tts and
// player, and the installer against a temporary home.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { cueWav, trim } from "../hooks/turn-voice/sound.mts";
import { agentName, clean, fromMarker, lead, runs } from "../hooks/turn-voice/voice.mts";

const dir = join(import.meta.dirname, "..", "hooks", "turn-voice");

test("the last marker picks the outcome", () => {
  assert.equal(fromMarker("done\n✅ !!!COMPLETED!!!"), "done");
  assert.equal(fromMarker("⚠️ !!!NOT COMPLETED!!! tests fail"), "notDone");
  assert.equal(fromMarker("quoted ✅ !!!COMPLETED!!! then\n❓ !!!QUESTION!!! pick one"), "ask");
  assert.equal(fromMarker("👤 !!!USER STEPS!!! log in"), "userSteps");
  assert.equal(fromMarker("a short answer"), "replied");
});

test("the phrase names the folder and splits per language", () => {
  assert.equal(agentName("/Users/me/agent-skills/"), "agent skills");
  assert.equal(agentName(undefined), "Claude");
  assert.equal(clean('✅ "Fix login"'), "Fix login");
  const phrase = `${lead("done", true, "agent skills")}: Fix login 2`;
  assert.deepEqual(runs(phrase), ["Агент", "agent skills", "сделал задачу:", "Fix login 2"]);
});

test("a clip with no mp3 frames stays whole, and the cue is a WAV", () => {
  const junk = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.equal(trim(junk, true, true), junk);
  const wav = cueWav("ask");
  assert.equal(wav.toString("ascii", 0, 4), "RIFF");
  assert.equal(wav.readUInt32LE(40), wav.length - 44);
});

test("the hook plays the cue then the voice, once per event", () => {
  const tmp = mkdtempSync(join(tmpdir(), "tv-"));
  const tts = join(tmp, "tts.mts");
  writeFileSync(
    tts,
    'import { writeFileSync } from "node:fs";\nconst a = process.argv;\nwriteFileSync(a[a.indexOf("--write-media") + 1], "x");\n',
  );
  const transcript = join(tmp, "t.jsonl");
  writeFileSync(transcript, '{"type":"x","customTitle":"✅ Fix login"}\n');
  const env = {
    ...process.env,
    TURN_VOICE_CACHE: join(tmp, "cache"),
    TURN_VOICE_LOG: join(tmp, "log"),
    TURN_VOICE_PLAYER: process.execPath,
    TURN_VOICE_DONE: "done.aiff",
  };
  const event = JSON.stringify({
    session_id: "s1",
    cwd: "/x/my-app",
    transcript_path: transcript,
    last_assistant_message: "ok\n✅ !!!COMPLETED!!!",
  });
  for (let i = 0; i < 2; i++) {
    const file = join(tmp, `in${i}.json`);
    writeFileSync(file, event);
    spawnSync(
      process.execPath,
      [join(dir, "turn-voice.mts"), `@${file}`, "stop", "ru", "v1", "v2", tts],
      { env },
    );
  }
  const log = readFileSync(join(tmp, "log"), "utf8");
  assert.match(log, /says done: Fix login/);
  assert.match(log, /play done\.aiff\n.*play .*-joined\.mp3/);
  assert.match(log, /skip repeat stop/);
});

test("the installer adds the hooks once and keeps the person's", () => {
  const home = mkdtempSync(join(tmpdir(), "tvh-"));
  for (const d of [".claude", ".codex", ".kimi-code"]) mkdirSync(join(home, d));
  const mine = { Stop: [{ hooks: [{ type: "command", command: "mine" }] }] };
  writeFileSync(join(home, ".claude", "settings.json"), JSON.stringify({ hooks: mine }));
  writeFileSync(join(home, ".kimi-code", "config.toml"), 'model = "k"\n');
  const install = (...args: string[]) =>
    spawnSync(process.execPath, [join(dir, "install-mac.mts"), ...args], {
      env: { ...process.env, HOME: home, CI: "1" },
    });
  install("--lang", "en");
  install();
  const settings = readFileSync(join(home, ".claude", "settings.json"), "utf8");
  assert.equal(settings.match(/turn-voice\.mts/g)?.length, 5);
  assert.match(settings, /"mine"/);
  assert.match(settings, /'archive' 'en'/);
  assert.equal(
    readFileSync(join(home, ".codex", "hooks.json"), "utf8").match(/turn-voice\.mts/g)?.length,
    2,
  );
  const kimi = readFileSync(join(home, ".kimi-code", "config.toml"), "utf8");
  assert.equal(kimi.match(/\[\[hooks\]\]/g)?.length, 2);
  assert.match(kimi, /^model = "k"/);
  install("--uninstall");
  assert.doesNotMatch(readFileSync(join(home, ".claude", "settings.json"), "utf8"), /turn-voice/);
  assert.doesNotMatch(readFileSync(join(home, ".kimi-code", "config.toml"), "utf8"), /hooks/);
});
