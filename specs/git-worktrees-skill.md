# git-worktrees skill makes a worktree and removes it once merged

## What it does for the person

Worktrees, folders and branches piled up after their PRs merged.

## User flows

- **Start work** a worktree off the latest default branch, ready to run.
- **PR merged** the worktree, its folder and its branch go, local and remote.

## How it works: modules, files, data

Each entry below names the files it changed.

## Limits

None written down yet.

## Changes

### 2025-10-28 git-worktrees skill makes a worktree and removes it once merged

Done on 2025-10-28, before the history was reset to one commit. The old commits sit under `refs/backup/main` in the local backup mirror of `agent-skills`.

#### Why

Worktrees, folders and branches piled up after their PRs merged.

#### User flows it touches

- **Start work** a worktree off the latest default branch, ready to run.
- **PR merged** the worktree, its folder and its branch go, local and remote.

#### Changes

- **`skills/git-worktrees/SKILL.md`** new.
- **`skills/app-audit/SKILL.md`** changed.
- **`skills/implement-ticket/SKILL.md`** changed.
- **`skills/review/references/getting-the-code.md`** changed.
- **`writing-style.instructions.md`** changed.

#### Steps, in commit order

1. git-worktrees: add a skill that makes a worktree and removes it when the work is done (34d3937, 2025-10-28)
2. instructions: remove each worktree with its folder and branch once its PR merges (ee403d5, 2025-10-28)

#### Docs to update

- `CHANGELOG.md`
- `README.md`

### 2026-11-02 Remove a worktree without waiting for the delete

- **Why** the owner saw agents stall at the cleanup after a merge. `git worktree remove` on a `memories` worktree ran past 2 minutes and left 50,933 files in `node_modules`. `rd /s /q` then took 5 min 16 s on them, and a rename of the folder took 0.8 s.
- **Changes** `skills/git-worktrees/SKILL.md` step 6 moves the folder to `.trash` beside the repos, runs `git worktree prune`, and deletes the trash in a detached process. Step 2 empties the trash a stopped run left.
- **Limits** a locked file stops the move, as it stopped `git worktree remove`. The disk space comes back only once the background delete ends.
- **Steps** spec, the skill, docs.
- **Docs** `README.md`, `CHANGELOG.md`.

### 2026-11-11 No git stash in a worktree

- **Why** in a farnear app audit, 2 lens subagents each ran `git stash` in their own worktree. The stash is shared by every worktree of a repo, so one popped the other's stash and their uncommitted work got swapped.
- **Changes** `skills/git-worktrees/SKILL.md` step 5 bans `git stash` and sets work aside with a WIP commit or `git diff > <file>`. The fix mode frame in `skills/reviewer/references/brief.md` carries the ban, and `skills/app-audit/SKILL.md` step 4 keeps it in each lens brief.
- **Steps** spec, the skills, docs.
- **Docs** `README.md`, `docs/features.md`, `CHANGELOG.md`.

### 2026-11-13 Agents remove their own worktrees and branches

- **Why** auto mode in Claude Code denied every `git worktree remove`, `git branch -D` and `git push --delete` after a merge, so the cleanup piled up in `TODO.md` for the owner. A narrow allow rule skips that check.
- **Script** `skills/git-worktrees/scripts/remove-merged.sh <worktree>` MUST remove only a worktree with no uncommitted files and no stash of its branch. Its PR MUST show as merged with the same head, or a detached HEAD MUST sit on the default branch. `--dropped` skips the PR check once the person drops the work, and `--keep-remote` keeps someone else's branch.
- **Rules** the install MUST add an allow rule for the script, plus the git commands as a fallback: `git worktree remove`, `git worktree prune`, `git branch -d`, `git branch -D`, `git push origin --delete`. Claude Code gets them in `permissions.allow` for Bash and PowerShell, and Codex in `~/.codex/rules/agent-skills.rules`. Kimi Code has no command rules, so it gets none.
- **Uninstall** `--uninstall` MUST take out only these rules. The person's own rules stay.
- **Steps** spec, the script and its test, the install, the skill, docs.
- **Docs** `README.md`, `docs/features.md`, `CHANGELOG.md`, and the auto mode list in `workflow.instructions.md` of `agent-skills-private`.
