// Scans a repo for the facts a legal check starts from: licenses, data SDKs, permissions, legal pages.
//   node scan.ts [repo dir] [--json]
import { resolve } from "node:path";
import { scanLicenses } from "./licenses.ts";
import { scanSignals } from "./signals.ts";

const args = process.argv.slice(2);
const dir = resolve(args.find((arg) => !arg.startsWith("--")) ?? ".");
const licenses = scanLicenses(dir);
const signals = scanSignals(dir);

if (args.includes("--json")) {
  console.log(JSON.stringify({ dir, licenses, ...signals }, null, 2));
  process.exit(0);
}

const lines = [`# Legal scan of ${dir}`, "", "## Licenses", ""];
lines.push(`${licenses.total} dependencies.`, "");
for (const [license, count] of Object.entries(licenses.counts).sort((a, b) => b[1] - a[1]))
  lines.push(`- **${license}** ${count}`);
lines.push("", "### Flagged", "");
if (!licenses.flags.length) lines.push("None.");
else {
  lines.push("| Package | Version | From | License | Risk |", "| --- | --- | --- | --- | --- |");
  for (const f of licenses.flags)
    lines.push(`| ${f.name} | ${f.version} | ${f.from} | ${f.license} | ${f.risk} |`);
}
for (const note of licenses.notes) lines.push(`- **Not read** ${note}`);

lines.push("", "## Data the app sends or reads", "");
const sdks = Object.entries(signals.sdks);
if (!sdks.length) lines.push("None found.");
for (const [sdk, files] of sdks)
  lines.push(
    `- **${sdk}** ${files.slice(0, 3).join(", ")}${files.length > 3 ? ` and ${files.length - 3} more` : ""}`,
  );

lines.push("", "## Sensitive permissions", "");
lines.push(
  signals.permissions.length ? signals.permissions.map((p) => `- ${p}`).join("\n") : "None found.",
);

lines.push("", "## Legal pages", "");
for (const { page, files } of signals.pages)
  lines.push(`- **${page}** ${files.length ? files.slice(0, 3).join(", ") : "missing"}`);

console.log(lines.join("\n"));
