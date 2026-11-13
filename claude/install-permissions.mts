// Lets agents clean up a merged worktree without a prompt: the allow rules of
// permissions.json go into a Claude Code settings.json and a Codex rules file.
// --uninstall takes out only these rules. The person's own rules stay.
// Usage: node install-permissions.mts <settings.json> <codex rules file> [--uninstall]
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const [settingsFile, codexFile, ...rest] = process.argv.slice(2);
if (!settingsFile || !codexFile)
  throw new Error(
    "usage: node install-permissions.mts <settings.json> <codex rules> [--uninstall]",
  );
const uninstall = rest.includes("--uninstall");
const ours: { claude: string[]; codex: string[][] } = JSON.parse(
  readFileSync(new URL("permissions.json", import.meta.url), "utf8"),
);

// Claude Code reads permissions.allow. A missing folder means no Claude Code here.
if (existsSync(dirname(settingsFile))) {
  // PowerShell 5.1 writes a BOM, which JSON.parse rejects and trimStart drops.
  const text =
    (existsSync(settingsFile) ? readFileSync(settingsFile, "utf8").trimStart() : "") || "{}";
  const settings = JSON.parse(text);
  const before = JSON.stringify(settings);
  const permissions = (settings.permissions ??= {});
  const kept: string[] = (permissions.allow ?? []).filter(
    (rule: string) => !ours.claude.includes(rule),
  );
  permissions.allow = uninstall ? kept : [...kept, ...ours.claude];
  if (!permissions.allow.length) delete permissions.allow;
  if (!Object.keys(permissions).length) delete settings.permissions;
  if (JSON.stringify(settings) !== before)
    writeFileSync(settingsFile, JSON.stringify(settings, null, 2) + "\n");
  console.log(`Cleanup rules ${uninstall ? "out of" : "in"} ${settingsFile}`);
}

// Codex reads each *.rules file in ~/.codex/rules, so this one file is ours alone.
if (existsSync(dirname(dirname(codexFile)))) {
  if (uninstall) rmSync(codexFile, { force: true });
  else {
    mkdirSync(dirname(codexFile), { recursive: true });
    const lines = ours.codex.map(
      (pattern) => `prefix_rule(pattern=${JSON.stringify(pattern)}, decision="allow")`,
    );
    writeFileSync(
      codexFile,
      `# Written by agent-skills install.sh. It lets agents remove merged worktrees.\n${lines.join("\n")}\n`,
    );
  }
  console.log(`Cleanup rules ${uninstall ? "out of" : "in"} ${codexFile}`);
}
