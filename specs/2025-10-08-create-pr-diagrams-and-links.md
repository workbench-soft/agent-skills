# create-pr draws the flows and links its sources, review comments sound less sure

Done from 2025-10-08 to 2025-10-14, before the history was reset to one commit. The old commits sit under `refs/backup/main` in the local backup mirror of `agent-skills`.

## Why

PR bodies missed how to try the change and what it built on. Review comments read as orders.

## User flows it touches

- **Open a PR** the body shows user flows, new commands, database changes, related PRs and the commands that generated code.
- **Review** comments use hedges and the skill searches them for "never".

## Changes

- **`skills/create-pr/SKILL.md`** changed.
- **`skills/review/references/comment-style.md`** changed.
- **`skills/review/references/final-checklist.md`** changed.
- **`skills/implement-ticket/SKILL.md`** changed.
- **`skills/review/references/finding-shape.md`** changed.
- **`skills/review/references/posting-comments.md`** changed.

## Steps, in commit order

1. create-pr: draw the user flows, show how to try a new command, list reused code (c23ead2, 2025-10-08)
2. create-pr: list the commands that generated or rewrote code (8aab3c4, 2025-10-09)
3. create-pr: link the designs and docs the change used (6a44f65, 2025-10-09)
4. review: make every comment sound unsure, search comments for never (4577433, 2025-10-12)
5. review: offer an assertive comment version, rotate openers, check each comment for never (4770eb8, 2025-10-12)
6. create-pr: show table changes, relations and data flow when the database changes (0797afd, 2025-10-13)
7. create-pr: link the related PRs the change builds on or ships with (7be7c88, 2025-10-14)

## Docs to update

- `README.md`
