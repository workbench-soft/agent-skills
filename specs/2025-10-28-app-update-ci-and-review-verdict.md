# app-update checks the Play bundle in CI, review picks a verdict

Done on 2025-10-28, before the history was reset to one commit. The old commits sit under `refs/backup/main` in the local backup mirror of `agent-skills`.

## Why

An update URL could slip into the Play bundle, and reviews posted without a verdict.

## User flows it touches

- **CI** fails when the Play bundle holds the GitHub release URL.
- **Review** approves, requests changes or comments, from the findings.

## Changes

- **`skills/app-update/SKILL.md`** changed.
- **`skills/review/SKILL.md`** changed.
- **`skills/review/references/final-checklist.md`** changed.
- **`skills/review/references/posting-comments.md`** changed.
- **`skills/review/references/verdict.md`** new.

## Steps, in commit order

1. app-update: check the Play bundle in CI and build one repo at a time (b22eccf, 2025-10-28)
2. review: approve, request changes or just comment, picked from the findings (3656ba4, 2025-10-28)

## Docs to update

- `CHANGELOG.md`
- `README.md`
