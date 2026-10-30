---
name: legal-check
description: 'Use when someone wants the legal risks of an app, a site, a repo or an idea checked, in any language: "check the legal risks", "is this legal", "can I ship this", "license check", "do I need a privacy policy", "trade mark risk", "проверь юридические риски", "можно ли это выпускать", "проверь лицензии". Runs a script over the repo for dependency licenses, data SDKs, sensitive permissions and missing legal pages, then walks each risk area: the name and trade marks, licenses and assets, privacy and consent, store and ad policy, and whether the feature is lawful in each market. Writes docs/legal-risks.md with a row per risk, its proof, its severity and the fix, fixes the safe ones in a PR and puts the rest in TODO.md.'
---

# Check the legal risks of an app

The result is `docs/legal-risks.md` in the repo: each risk with its proof, how
bad it is and the fix. The safe fixes ship in a PR, and the rest go to
`TODO.md`.

Load `writing-style` before the first line a person reads, unless it is in
context.

## 1. Set the scope

Read the README, the store listing and the site of the app. Ask through the
question tool only for what the repo doesn't show:

- **Markets** the countries the app ships to. Default: the EU, the US, the UK
  and Australia.
- **Money** ads, purchases, subscriptions, or free.
- **Users** adults, or children too.
- **An idea** with no repo, skip step 2 and judge the plan.

## 2. Scan the repo

```bash
mise x node@24 -- node <skill-dir>/scripts/scan.ts <repo-dir>
```

`<skill-dir>` is the folder of this file. `--json` prints the same facts as
JSON.

- **What it reads** the licenses from `pnpm licenses` and `cargo metadata`,
  the data SDKs and the sensitive permissions in the tracked files, and the
  legal pages the repo holds.
- **Not read** a line for Gradle, CocoaPods or Python means those dependencies
  SHOULD get a look by hand.
- **Hints** an SDK row is a match in a file. Open the file before calling it a
  risk.

## 3. Walk the risk areas

Read `references/areas.md` and go through each area for the scope.

- **Name** run `domain-check` on the app name, and search WIPO for the other
  markets. Reuse a name check the repo already holds.
- **Proof** each risk MUST point at a file and line, a store page or a policy
  link. A risk with no proof stays out.
- **Sources** each rule cited MUST come from the policy page itself, opened
  in this run. Memory of a policy is out of date.

## 4. Rate each risk

| Severity | Meaning |
| --- | --- |
| high | the store can pull the app, a rights holder can sue, or a regulator can fine |
| medium | a policy or a license gets broken, with a fix that takes a day |
| low | a gap that matters later, such as a missing notice |

- **Owner** each risk gets one: `agent` for a code or text fix, `person` for a
  form or an account, `lawyer` for a judgement call.
- **Lawyer** a high risk in a launch with money behind it goes to `lawyer`.

## 5. Write the report

Write `docs/legal-risks.md` in the repo:

```markdown
# Legal risks

Checked 2026-10-31 for the EU, the US, the UK and Australia. A check by an agent, not legal advice.

| Risk | Severity | Proof | Fix | Owner |
| --- | --- | --- | --- | --- |
```

- **Order** high first, then medium, then low.
- **Left out** each market or area left out gets a line under the table.
- **Rerun** a later run updates the same file and keeps the risks still open.

## 6. Fix and hand over

- **Safe fixes** the `agent` rows ship in one PR by the repo's ship rules:
  a notices file, a privacy page that names each SDK, a missing attribution.
- **Policy text** a privacy policy or terms the agent writes SHOULD say what
  the code does, with no promise the code doesn't keep.
- **The rest** each `person` and `lawyer` row goes to `TODO.md` with its
  link.
- **No forms** the agent MUST NOT file a trade mark, sign an agreement or send
  a store declaration. It links the page, and the person does it.

## 7. Answer

1. One line with the worst risk and its fix.
2. The high and medium rows from the report.
3. The PR link and the lines added to `TODO.md`.

The answer MUST say the check is a signal, and that a lawyer reviews a launch
with money behind it.
