# app-audit

The skill started in `2025-10-28-ship-rules-app-update-and-app-audit.md`.
This file holds it from 2026-10-31 on.

## What it does for the person

The person asks to audit a whole app. The agent reviews it through several
lenses, fixes the safe findings and merges one PR, with no question in between.

## User flows

1. The person asks "audit the app" or "что можно улучшить".
2. The agent reads the repo and picks the lenses.
3. One agent per lens reviews and fixes, each in its own worktree.
4. The main agent checks each commit as its report lands and picks it onto the
   audit branch.
5. The agent verifies the branch, has a fresh reviewer read it, opens the PR
   and merges it on green CI.
6. `TODO.md` gets what was left and why.

## How it works: modules, files, data

- **`skills/app-audit/SKILL.md`** the steps.
- **`references/briefs.md`** the brief for each lens agent and the fresh
  reviewer.
- **`references/triage.md`** the Fix and Leave rules. Lens agents sort their
  own findings with it, and the main agent checks each commit against it.
- **`references/verify.md`** checks, build, running app and CI.

## Limits

- **Conflicts** two lenses can touch the same lines. A large conflict goes to
  the redo list, and the main agent fixes it on the audit branch at the end.
- **Disk and installs** each lens worktree installs its own dependencies.

## Changes

### 2026-10-31 Lens agents fix their own findings, and fixes land as reports arrive

- **Why** the main agent waited for every reviewer, then made each fix itself.
  The slowest lens held up the rest, and the fixes ran one by one.
- **Changes**
  - `SKILL.md` makes the worktrees before the lenses start: one for the audit
    branch and one per lens. A lens agent reviews, sorts with `triage.md` and
    commits each fix in its worktree. The main agent reviews each commit as
    soon as its report lands and cherry-picks it onto the audit branch.
  - `references/briefs.md` gives the lens agent a frame that fixes and
    commits, and drops the brief for a separate part.
  - `references/triage.md` speaks to the lens agent and the main agent both.
- **Steps** this spec, then the skill and its references, then the README and
  the changelog.
- **Docs** `README.md`, `CHANGELOG.md`.
