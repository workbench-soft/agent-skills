# git-worktrees skill makes a worktree and removes it once merged

Done on 2025-10-28, before the history was reset to one commit. The old commits sit under `refs/backup/main` in the local backup mirror of `agent-skills`.

## Why

Worktrees, folders and branches piled up after their PRs merged.

## User flows it touches

- **Start work** a worktree off the latest default branch, ready to run.
- **PR merged** the worktree, its folder and its branch go, local and remote.

## Changes

- **`skills/git-worktrees/SKILL.md`** new.
- **`skills/app-audit/SKILL.md`** changed.
- **`skills/implement-ticket/SKILL.md`** changed.
- **`skills/review/references/getting-the-code.md`** changed.
- **`writing-style.instructions.md`** changed.

## Steps, in commit order

1. git-worktrees: add a skill that makes a worktree and removes it when the work is done (34d3937, 2025-10-28)
2. instructions: remove each worktree with its folder and branch once its PR merges (ee403d5, 2025-10-28)

## Docs to update

- `CHANGELOG.md`
- `README.md`
