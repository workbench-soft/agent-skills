# Agent docs in MUST, SHOULD and MAY

## What it does for the person

Each line an agent reads from this repo says how hard the rule is. An agent
MUST follow MUST, SHOULD follow SHOULD, and MAY pick either branch of MAY.

## How it works: modules, files, data

- **Scope** `AGENTS.md`, `writing-style.instructions.md`, each `SKILL.md`
  and each file under `references/`.
- **Rule** each paragraph and list item MUST hold MUST, MUST NOT, SHOULD,
  SHOULD NOT or MAY in capitals. Lowercase forms MUST NOT appear outside code
  and quotes.
- **Check** `scripts/keyword-check.ts`, copied from the workspace repo, runs
  in `mise run lint`.

## Limits

- **Left out** headings, tables, fenced code, quotes and front matter. The
  line above a table or a block MUST hold the key word for it.

## Changes

### 2026-11-01 Every rule gets a key word

- **Why** the owner asked that every agent doc follow the BCP 14 key words
  and use them in each rule. The old `AGENTS.md` kept steps and descriptions
  free of modals, and the owner's ask replaces that.
- **Changes** `AGENTS.md` rewrites its key word section, the lint task runs
  the check, and every skill and reference gets rewritten to pass it.
- **Steps** this spec, then `AGENTS.md` and the check, then the skills in
  groups.
