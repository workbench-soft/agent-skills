// The license of each npm and Cargo dependency, with the ones that need a look flagged.
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { trackedFiles } from "./signals.ts";

export type Dependency = { name: string; version: string; license: string; from: "npm" | "cargo" };
export type Flag = Dependency & { risk: string };

// Strong copyleft asks for the app's own source, weak copyleft for the changed files only.
const RISKS: [RegExp, string][] = [
  [/\b(AGPL|SSPL|GPL|EUPL|OSL|CC-BY-SA)/i, "copyleft"],
  [/\b(LGPL|MPL|EPL|CDDL)/i, "weak copyleft"],
  [/\bNC\b|non-?commercial|Hippocratic|BUSL|Elastic|PolyForm|Commons-Clause|\bJSON\b/i, "use limits"],
  [/^(UNKNOWN|UNLICENSED|NONE|)$|SEE LICENSE|custom/i, "no clear license"],
];

export function riskOf(license: string): string | undefined {
  // An OR leaves the choice to the app, so the easiest branch counts.
  // Old Cargo manifests write "MIT/Apache-2.0" for the same choice.
  const branches = license.replace(/[()]/g, "").split(/\s+OR\s+|\//i);
  const risks = branches.map((branch) => RISKS.find(([pattern]) => pattern.test(branch.trim()))?.[1]);
  return risks.includes(undefined) ? undefined : risks[0];
}

const run = (command: string, cwd: string) =>
  execSync(command, { cwd, encoding: "utf8", maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "ignore"] });

function npm(dir: string): Dependency[] {
  if (!existsSync(join(dir, "node_modules"))) throw new Error("no node_modules, run pnpm install");
  const byLicense: Record<string, { name: string; versions: string[] }[]> = JSON.parse(
    run("pnpm licenses list --json --prod", dir),
  );
  return Object.entries(byLicense).flatMap(([license, packages]) =>
    packages.map((p) => ({ name: p.name, version: p.versions.join(", "), license, from: "npm" as const })),
  );
}

function cargo(dir: string): Dependency[] {
  const meta = JSON.parse(run("cargo metadata --format-version 1", dir));
  // A crate with no registry source is the repo's own code, through a workspace or a path.
  return meta.packages
    .filter((p: { source: string | null }) => p.source)
    .map((p: { name: string; version: string; license: string | null }) => ({
      name: p.name,
      version: p.version,
      license: p.license ?? "UNKNOWN",
      from: "cargo" as const,
    }));
}

// A lockfile marks a workspace root, so a monorepo gets read once per root.
const READERS: Record<string, (dir: string) => Dependency[]> = {
  "pnpm-lock.yaml": npm,
  "Cargo.lock": cargo,
};
const BY_HAND = /^(build\.gradle(\.kts)?|Podfile|pyproject\.toml|package-lock\.json|yarn\.lock)$/;

export function scanLicenses(dir: string) {
  const deps = new Map<string, Dependency>();
  const notes: string[] = [];
  for (const file of trackedFiles(dir)) {
    const name = basename(file);
    if (BY_HAND.test(name)) notes.push(`${file}: check its dependencies by hand`);
    if (!READERS[name]) continue;
    try {
      for (const dep of READERS[name](join(dir, dirname(file))))
        deps.set(`${dep.from}:${dep.name}@${dep.version}`, dep);
    } catch (error) {
      notes.push(`${file}: ${error instanceof Error ? error.message.split("\n")[0] : error}`);
    }
  }
  const all = [...deps.values()];
  const flags: Flag[] = all.flatMap((dep) => {
    const risk = riskOf(dep.license);
    return risk ? [{ ...dep, risk }] : [];
  });
  const counts: Record<string, number> = {};
  for (const dep of all) counts[dep.license] = (counts[dep.license] ?? 0) + 1;
  return { total: all.length, counts, flags, notes };
}
