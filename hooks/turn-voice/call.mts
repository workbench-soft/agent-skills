// The Mac twin of call.cs: a call holds the microphone, so the voice stays quiet.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const source = fileURLToPath(new URL("mic.swift", import.meta.url));

// mic.swift asks Core Audio. It gets built once per source, so an edit builds it again.
function micHelper(cache: string): string | undefined {
  if (!existsSync(source)) return undefined;
  const hash = createHash("sha1").update(readFileSync(source)).digest("hex").slice(0, 12);
  const bin = join(cache, `mic-${hash}`);
  if (existsSync(bin)) return bin;
  mkdirSync(cache, { recursive: true });
  const build = spawnSync("swiftc", ["-O", source, "-o", bin], {
    stdio: "ignore",
    timeout: 120000,
  });
  return build.status === 0 && existsSync(bin) ? bin : undefined;
}

// TURN_VOICE_MEETING=1 or 0 forces the state, for the tests and for a call the check misses.
// Without swiftc, a Zoom meeting still shows as its CptHost process.
export function onCall(cache: string): boolean {
  const force = process.env.TURN_VOICE_MEETING;
  if (force === "1" || force === "0") return force === "1";
  if (process.platform !== "darwin") return false;
  const helper = micHelper(cache);
  if (helper) return spawnSync(helper, [], { timeout: 5000 }).status === 0;
  return spawnSync("pgrep", ["-x", "CptHost"], { stdio: "ignore" }).status === 0;
}
