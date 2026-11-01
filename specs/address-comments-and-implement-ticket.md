# address-comments and implement-ticket skills

## What it does for the person

Answering review threads and doing a ticket from start to PR were manual every time.

## User flows

- **Address comments** one small commit and one reply per thread.
- **Do a ticket** a worktree, a PR, then the ticket moves to In Review.
- **Review** each comment is tagged C1 with its explanation E1.

## How it works: modules, files, data

Each entry below names the files it changed.

## Limits

None written down yet.

## Changes

### 2025-10-01 address-comments and implement-ticket skills

Done from 2025-10-01 to 2025-10-07, before the history was reset to one commit. The old commits sit under `refs/backup/main` in the local backup mirror of `agent-skills`.

#### Why

Answering review threads and doing a ticket from start to PR were manual every time.

#### User flows it touches

- **Address comments** one small commit and one reply per thread.
- **Do a ticket** a worktree, a PR, then the ticket moves to In Review.
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
