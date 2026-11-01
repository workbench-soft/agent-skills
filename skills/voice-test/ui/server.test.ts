// The server answers its own page only, so another site or a rebound DNS name can't drive it.
//   mise run test
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { request } from "node:http";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

const server = spawn(
  process.execPath,
  [fileURLToPath(new URL("server.ts", import.meta.url)), "--no-open"],
  { env: { ...process.env, VOICE_TEST_SERVER: "1" }, stdio: ["ignore", "pipe", "ignore"] },
);
let base = "";

before(async () => {
  let out = "";
  for await (const chunk of server.stdout) {
    out += chunk;
    base = out.match(/http:\/\/\S+\//)?.[0] ?? "";
    if (base) break;
  }
});

after(() => server.kill());

function call(method: string, headers: Record<string, string>): Promise<number | undefined> {
  return new Promise((resolve, reject) =>
    request(`${base}api/stop`, { method, headers }, (res) => {
      res.resume();
      resolve(res.statusCode);
    })
      .on("error", reject)
      .end("{}"),
  );
}

test("the page's own POST goes through", async () => {
  const origin = base.slice(0, -1);
  assert.equal(await call("POST", { origin, "content-type": "application/json" }), 200);
});

test("another site's POST gets 403", async () => {
  const headers = { origin: "https://evil.example", "content-type": "text/plain" };
  assert.equal(await call("POST", headers), 403);
});

test("a rebound DNS name gets 403", async () => {
  assert.equal(await call("POST", { host: "evil.example" }), 403);
});
