// Copies the user MCP servers of Claude Code to Codex and Kimi Code, or takes
// them out with --uninstall. ~/.claude.json stays the one list.
// Usage: node sync-mcp.mts <.claude.json> <codex config.toml> <kimi mcp.json> [--uninstall]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

type Server = {
  type?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  headers?: Record<string, string>;
};

const [claudeFile, codexFile, kimiFile, flag] = process.argv.slice(2);
if (!kimiFile)
  throw new Error("usage: node sync-mcp.mts <.claude.json> <config.toml> <mcp.json> [--uninstall]");
const uninstall = flag === "--uninstall";
// PowerShell 5.1 writes a BOM, which JSON.parse rejects and trimStart drops.
const read = (file: string) => (existsSync(file) ? readFileSync(file, "utf8").trimStart() : "");
// An install from agent-skills-private wrote its own marker, so its block counts as this one.
const ours = (file: string) => read(file).replaceAll("# agent-skills-private:", "# agent-skills:");
const servers: Record<string, Server> = JSON.parse(read(claudeFile) || "{}").mcpServers ?? {};

function write(file: string, text: string, what: string): void {
  if (read(file) === text.trimStart()) return console.log(`MCP servers already ${what} ${file}`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, text);
  console.log(`MCP servers ${uninstall ? "removed from" : "written to"} ${file}`);
}

// Codex: a marked block at the end of config.toml, so the person's tables stay.
const open = "# agent-skills: MCP servers of Claude Code";
const close = "# agent-skills: end";
const toml = (value: unknown): string =>
  typeof value === "string"
    ? JSON.stringify(value)
    : Array.isArray(value)
      ? `[${value.map(toml).join(", ")}]`
      : `{ ${Object.entries(value as object)
          .map(([k, v]) => `${JSON.stringify(k)} = ${toml(v)}`)
          .join(", ")} }`;
if (existsSync(dirname(codexFile))) {
  const text = ours(codexFile);
  // Codex drops the open comment when it saves config.toml itself. The block then starts
  // at the first table in the quoted form this script writes.
  const quoted = Object.keys(servers)
    .map((name) => text.indexOf(`[mcp_servers.${JSON.stringify(name)}]`))
    .filter((i) => i >= 0);
  const start =
    text.indexOf(open) >= 0 || !text.includes(close) || !quoted.length
      ? text.indexOf(open)
      : Math.min(...quoted);
  const end = text.indexOf(close, start);
  // With no end line the block's length is unknown, and the cut would take the person's tables after it.
  const broken = start >= 0 && end < 0;
  const own =
    start < 0 || broken ? text : text.slice(0, start) + text.slice(end + close.length + 1);
  // A server the person set up in Codex keeps their table.
  const block = Object.entries(servers)
    .filter(
      ([name]) =>
        !own.includes(`[mcp_servers.${name}]`) && !own.includes(`[mcp_servers."${name}"]`),
    )
    .map(([name, s]) => {
      const lines = [`[mcp_servers.${JSON.stringify(name)}]`];
      if (s.url) lines.push(`url = ${toml(s.url)}`);
      if (s.headers && Object.keys(s.headers).length)
        lines.push(`http_headers = ${toml(s.headers)}`);
      if (s.command) lines.push(`command = ${toml(s.command)}`);
      if (s.args?.length) lines.push(`args = ${toml(s.args)}`);
      if (s.env && Object.keys(s.env).length) lines.push(`env = ${toml(s.env)}`);
      return lines.join("\n");
    });
  const body = own.trimEnd();
  const next =
    uninstall || !block.length
      ? `${body}\n`
      : `${body}\n\n${open}\n${block.join("\n\n")}\n${close}\n`;
  if (broken)
    console.error(
      `left ${codexFile} alone, its MCP block has no end line. Put "${close}" after it and run install.sh again`,
    );
  else write(codexFile, next.trimStart(), uninstall ? "out of" : "in");
}

// Kimi takes the Claude Code shape, so each server goes in under its own name.
if (existsSync(dirname(kimiFile))) {
  const kimi = JSON.parse(read(kimiFile) || "{}");
  const list: Record<string, Server> = (kimi.mcpServers ??= {});
  for (const [name, server] of Object.entries(servers)) {
    if (!uninstall) list[name] = server;
    else if (JSON.stringify(list[name]) === JSON.stringify(server)) delete list[name];
  }
  write(kimiFile, `${JSON.stringify(kimi, null, 2)}\n`, uninstall ? "out of" : "in");
}
