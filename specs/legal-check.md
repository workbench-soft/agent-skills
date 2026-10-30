# Legal risk check

## What it does for the person

The person names an app, a site, a repo or an idea. The agent reads the code
and the store listing, then lists each legal risk with its proof, how bad it
is and the fix. It fixes the safe ones in a PR and puts the rest in
`TODO.md`, with the ones that need a lawyer marked.

## User flows

1. The person asks for a legal check, in Archon or in chat.
2. The agent loads `legal-check` and runs `scripts/scan.ts` on the repo.
3. The script prints the dependency licenses, the SDKs and permissions that
   collect data, and the legal pages the repo lacks.
4. The agent walks the risk areas in `references/areas.md`, checks the name
   through `domain-check` and the WIPO brand database, and opens each policy
   page it cites.
5. It writes `docs/legal-risks.md`, fixes the safe items in a PR and writes
   the rest to `TODO.md`.

## How it works: modules, files, data

- **`skills/legal-check/SKILL.md`** the steps: scope, scan, areas, name, the
  report, the fixes.
- **`skills/legal-check/scripts/scan.ts`** Node 24 with no packages. It reads
  `pnpm licenses list --json` and `cargo metadata`, greps the manifests and
  the source for data SDKs and permissions, and prints JSON or Markdown.
- **`skills/legal-check/references/areas.md`** each risk area, what to look
  for and the page with the rule.
- **The report** `docs/legal-risks.md` in the checked repo: a row per risk
  with severity, proof, fix and owner.

## Limits

- **A signal** the report is a check by an agent. A launch with money behind
  it goes to a lawyer.
- **Markets** the areas cover the EU, the US, the UK and Australia. Other
  countries get a line in the report saying they were left out.
- **Licenses** the script reads npm and Cargo. Gradle, CocoaPods and Python
  dependencies get checked by hand.

## Changes

### 2026-10-31 A skill that lists the legal risks of an app

- **Why** the person asked for a legal risk check they can start from
  Archon, beside the name and domain search.
- **Changes**
  - `skills/legal-check/` the skill, its reference and the scan script.
  - `README.md`, `docs/features.md`, `CHANGELOG.md` the new skill.
- **Steps** this spec, then the skill and the script, then the docs.
- **Docs** `README.md`, `docs/features.md`.
