// Names the mods in mods/ in CLAUDE_CODE_PLUGIN_DIRS of a Claude Code
// settings.json, so each session, the desktop app's included, loads them.
// --uninstall takes them out. Other folders in the list stay.
// Usage: node install-mods.mts <settings.json> [--uninstall]
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { delimiter, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const [file, ...rest] = process.argv.slice(2);
if (!file) throw new Error("usage: node install-mods.mts <settings.json> [--uninstall]");
const uninstall = rest.includes("--uninstall");
const root = fileURLToPath(new URL("../mods", import.meta.url));
const mods = readdirSync(root).map((name) => join(root, name));

// PowerShell 5.1 writes a BOM, which JSON.parse rejects and trimStart drops.
const text = (existsSync(file) ? readFileSync(file, "utf8").trimStart() : "") || "{}";
const settings = JSON.parse(text);
const env: Record<string, string> = (settings.env ??= {});
const others = (env.CLAUDE_CODE_PLUGIN_DIRS ?? "")
  .split(delimiter)
  .filter((dir) => dir && !mods.some((mod) => resolve(dir) === mod));
const dirs = uninstall ? others : [...others, ...mods];

const before = env.CLAUDE_CODE_PLUGIN_DIRS;
if (dirs.length) env.CLAUDE_CODE_PLUGIN_DIRS = dirs.join(delimiter);
else delete env.CLAUDE_CODE_PLUGIN_DIRS;
if (!Object.keys(env).length) delete settings.env;

if (env.CLAUDE_CODE_PLUGIN_DIRS === before) {
  console.log(`Mods already ${uninstall ? "out of" : "in"} ${file}`);
} else {
  writeFileSync(file, JSON.stringify(settings, null, 2) + "\n");
  console.log(`Mods ${uninstall ? "removed from" : "written to"} ${file}: ${mods.join(", ")}`);
}
