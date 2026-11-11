// Adds the hooks in hooks.json, or another list, to a Claude Code settings.json
// or a Codex hooks.json, which share the shape. --uninstall takes them out.
// Other hooks stay where they are.
// Usage: node install-hooks.mts <settings.json> [<list.json>] [--uninstall]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

type Group = Record<string, unknown>;
type Entry = { event: string; marker: string; group: Group };

const [file, ...rest] = process.argv.slice(2);
if (!file)
  throw new Error("usage: node install-hooks.mts <settings.json> [<list.json>] [--uninstall]");
const uninstall = rest.includes("--uninstall");
const list = rest.find((arg) => arg.endsWith(".json")) ?? new URL("hooks.json", import.meta.url);
const entries: Entry[] = JSON.parse(readFileSync(list, "utf8"));

// PowerShell 5.1 writes a BOM, which JSON.parse rejects and trimStart drops.
// An empty file, as a person or an editor leaves it, counts as no settings.
const text = (existsSync(file) ? readFileSync(file, "utf8").trimStart() : "") || "{}";
const settings = JSON.parse(text);
const before = JSON.stringify(settings);
const hooks: Record<string, Group[]> = (settings.hooks ??= {});

for (const { event, marker, group } of entries) {
  const groups = hooks[event] ?? [];
  // An older copy, such as the PowerShell time hook, counts as this group.
  const ours = (g: Group) => JSON.stringify(g).includes(marker);
  const at = groups.findIndex(ours);
  const kept = groups.filter((g) => !ours(g));
  if (!uninstall) kept.splice(at < 0 ? kept.length : at, 0, group);
  if (kept.length) hooks[event] = kept;
  else delete hooks[event];
}
if (!Object.keys(hooks).length) delete settings.hooks;

if (JSON.stringify(settings) === before) {
  console.log(`Hooks already ${uninstall ? "out of" : "in"} ${file}`);
} else {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(settings, null, 2) + "\n");
  console.log(`Hooks ${uninstall ? "removed from" : "written to"} ${file}`);
}
