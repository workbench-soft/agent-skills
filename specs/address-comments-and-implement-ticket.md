# address-comments and implement-ticket skills

## One-pager

- **Problem** `implement-ticket` always creates a worktree and PR.
- **Fix** it follows the repo's checkout and shipping rules.
- **How** a repo may allow clean, conflict free work on its default branch.
- **Risk** repositories without such a rule keep the isolated worktree path.
- **Next** ship the skill and update its README description.

## What it does for the person

Answering review threads and carrying a ticket from plan to shipped code were manual every time.

## User flows

- **Address comments** one small commit and one reply per thread.
- **Do a ticket** follows the repo's checkout rules, then moves to the status
  that matches its direct push or PR.
- **Review** each comment is tagged C1 with its explanation E1.

## How it works: modules, files, data

Each entry below names the files it changed.

## Limits

Ticket status transitions vary by project. Repositories without checkout
instructions keep using a worktree and PR.

## Changes

### 2025-10-01 address-comments and implement-ticket skills

Done from 2025-10-01 to 2025-10-07, before the history was reset to one commit. The old commits sit under `refs/backup/main` in the local backup mirror of `agent-skills`.

#### Why

Answering review threads and doing a ticket from start to PR were manual every time.

#### User flows it touches

- **Address comments** one small commit and one reply per thread.
- **Do a ticket** follows the repo's checkout rules, then moves to the status
  that matches its direct push or PR.
- **Review** each comment is tagged C1 with its explanation E1.

#### Changes

- **`skills/address-comments/SKILL.md`** new.
- **`skills/review/references/final-checklist.md`** changed.
- **`skills/review/references/finding-shape.md`** changed.
- **`skills/review/references/part-4-findings.md`** changed.
- **`skills/review/SKILL.md`** changed.
- **`skills/review/references/architecture-pass.md`** changed.
- **`skills/review/references/deep-dive.md`** changed.
- **`skills/review/references/report-language.md`** changed.
- **`skills/implement-ticket/SKILL.md`** new.

#### Steps, in commit order

1. address-comments: one commit and one reply per review thread (d44ebea, 2025-10-01)
2. review: list every comment first, explanations after (a218787, 2025-10-01)
3. review: tag each comment C1 and its explanation E1 (7eca06b, 2025-10-02)
4. implement-ticket: do a ticket in a worktree, PR it, move it to In Review (dc41f43, 2025-10-02)
5. address-comments: keep each fix to the smallest diff (e243257, 2025-10-02)
6. address-comments: update the PR description when a fix changes behaviour (0037fac, 2025-10-07)

#### Docs to update

- `README.md`

### 2026-11-05 Follow repo checkout rules for tickets

- **Why** work should use clean `main` when the repo allows it and no active
  session edits the same files.
- **Changes** `implement-ticket` follows the repo's checkout and ship rules,
  with the worktree and PR path as its fallback.
- **Files** `skills/implement-ticket/SKILL.md`, `README.md` and this spec.
- **Steps** update this spec first, then the skill, README and changelog.
- **Docs** `README.md`, `CHANGELOG.md` and this spec.
