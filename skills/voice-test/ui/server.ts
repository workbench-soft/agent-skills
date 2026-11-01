// Serves the voice-test page on 127.0.0.1 and opens it as an app window.
// The page asks for the voice list, then Play runs voice_test.py with the picked voices
// and streams its lines back. Node 24 runs this file as is, with no packages.
//   mise x -- node server.ts
import { spawn, type ChildProcess } from "node:child_process";
import { readFileSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { stripTypeScriptTypes } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const script = join(here, "..", "scripts", "voice_test.py");
const win = process.platform === "win32";
const python = win ? "python" : "python3";

// A double click starts this from a console. The real server runs detached and hidden,
// so the console closes at once.
if (!process.env.VOICE_TEST_SERVER) {
  spawn(process.execPath, [fileURLToPath(import.meta.url), ...process.argv.slice(2)], {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
    env: { ...process.env, VOICE_TEST_SERVER: "1" },
  }).unref();
  process.exit(0);
}

type Pick = { line: string; groups: string[]; lang: string; ids?: string[]; pitch?: number };

const clients = new Set<ServerResponse>();
let player: ChildProcess | undefined;
let idle: NodeJS.Timeout | undefined;

function send(event: object): void {
  for (const client of clients) client.write(`data: ${JSON.stringify(event)}\n\n`);
}

function scriptArgs(pick: Pick): string[] {
  const args = [script, "--group", pick.groups.join(",") || "female,male,child"];
  if (pick.line) args.push("--line", pick.line);
  // With = argparse reads a negative pitch as the value, not as a flag.
  if (pick.pitch) args.push(`--pitch=${Math.trunc(pick.pitch)}`);
  if (pick.ids) args.push("--voice", pick.ids.join(","));
  else if (pick.lang === "all") args.push("--all");
  else args.push("--lang", pick.lang || "en,ru");
  return args;
}

function run(args: string[]): ChildProcess {
  return spawn(python, args, {
    windowsHide: true,
    env: { ...process.env, PYTHONUNBUFFERED: "1", PYTHONIOENCODING: "utf-8" },
  });
}

function stop(): void {
  if (!player?.pid) return;
  // The clip plays inside the script, so its whole tree goes, edge-tts too.
  if (win) spawn("taskkill", ["/T", "/F", "/PID", String(player.pid)], { windowsHide: true });
  else player.kill();
  player = undefined;
}

function voices(pick: Pick, res: ServerResponse): void {
  const proc = run([...scriptArgs(pick), "--list"]);
  let out = "";
  let err = "";
  proc.stdout?.setEncoding("utf8").on("data", (chunk: string) => (out += chunk));
  proc.stderr?.setEncoding("utf8").on("data", (chunk: string) => (err += chunk));
  proc.on("error", (e) => json(res, 500, { error: `${python}: ${e.message}` }));
  proc.on("close", (code) =>
    code === 0 ? json(res, 200, JSON.parse(out)) : json(res, 500, { error: err.trim() }),
  );
}

function play(pick: Pick): void {
  stop();
  const proc = run(scriptArgs(pick));
  player = proc;
  let rest = "";
  const lines = (chunk: string) => {
    const parts = (rest + chunk).split(/\r?\n/);
    rest = parts.pop() ?? "";
    for (const text of parts) if (text.trim()) send({ type: "line", text });
  };
  proc.stdout?.setEncoding("utf8").on("data", lines);
  proc.stderr?.setEncoding("utf8").on("data", lines);
  // A missing python fails the spawn. Unhandled, the error would take the server down.
  proc.on("error", (e) => send({ type: "line", text: `${python}: ${e.message}` }));
  proc.on("close", () => {
    if (player === proc) player = undefined;
    send({ type: "done" });
  });
}

function json(res: ServerResponse, status: number, body: unknown): void {
  if (res.headersSent) return;
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

async function body(req: IncomingMessage): Promise<Pick> {
  let text = "";
  for await (const chunk of req) text += chunk;
  return JSON.parse(text || "{}");
}

function file(res: ServerResponse, name: string, type: string): void {
  let text = readFileSync(join(here, name), "utf8");
  // The browser gets the client as JavaScript, with the types stripped.
  if (name.endsWith(".ts")) text = stripTypeScriptTypes(text);
  res.writeHead(200, { "content-type": `${type}; charset=utf-8`, "cache-control": "no-store" });
  res.end(text);
}

// The server quits a few seconds after the last window closes.
function watchIdle(): void {
  clearTimeout(idle);
  if (clients.size === 0) idle = setTimeout(() => (stop(), process.exit(0)), 8000);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  try {
    if (url.pathname === "/") return file(res, "index.html", "text/html");
    if (url.pathname === "/app.js") return file(res, "app.ts", "text/javascript");
    if (url.pathname === "/api/voices" && req.method === "POST")
      return voices(await body(req), res);
    if (url.pathname === "/api/play" && req.method === "POST")
      return (play(await body(req)), json(res, 200, {}));
    if (url.pathname === "/api/stop" && req.method === "POST") return (stop(), json(res, 200, {}));
    if (url.pathname === "/api/events") {
      res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-store" });
      res.write(": open\n\n");
      clients.add(res);
      watchIdle();
      req.on("close", () => (clients.delete(res), watchIdle()));
      return;
    }
    json(res, 404, { error: "not found" });
  } catch (e) {
    json(res, 500, { error: String(e) });
  }
});

server.listen(0, "127.0.0.1", () => {
  const address = server.address();
  const url = `http://127.0.0.1:${typeof address === "object" && address ? address.port : 0}/`;
  // --no-open prints the address in place of a window, for a test in another browser.
  if (process.argv.includes("--no-open")) return console.log(url);
  // Edge opens the page as an app window, with no tabs or address bar.
  if (win) {
    spawn(
      "cmd.exe",
      ["/d", "/s", "/c", `start "" msedge --app=${url} --window-size=820,900 || start "" ${url}`],
      {
        windowsHide: true,
        windowsVerbatimArguments: true,
      },
    );
  } else {
    spawn(process.platform === "darwin" ? "open" : "xdg-open", [url], { stdio: "ignore" });
  }
  // A window that never connects leaves the server to quit on its own.
  idle = setTimeout(() => clients.size === 0 && process.exit(0), 60000);
});
