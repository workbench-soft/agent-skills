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

### 2026-11-17 Trash on the worktree drive

- **Why** `remove-merged.sh` moved a worktree on `D:` into `.trash` beside its repo on `C:`. The move became a copy that hung 40 minutes on `node_modules`, failed on pnpm junctions and left a partial copy.
- **Changes** the script and step 6 of `skills/git-worktrees/SKILL.md` put `.trash` beside the worktree folder, so the rename stays on one drive. Step 2 empties the trash beside each worktree.
- **Steps** spec, the script, the skill, docs.
- **Docs** `CHANGELOG.md`.

### 2026-11-25 Sessions keep their folder

- **Why** new Claude Desktop sessions in `memories`, `songfactory` and the workspace root failed to start with `worktree_backlink_broken`. The app logs showed the cause: the app had recorded a folder's git dir as a worktree that was gone, such as `.git/worktrees/shuttrix-raw-out-of-beta-49f08d` for `C:\WBS\memories`. A session in an app worktree ran `cd "$main"` from step 6, which moved the session to the main checkout, then removed its own worktree. Each later worktree from that folder then got refused.
- **Script** `remove-merged.sh` MUST stop on a worktree under `.claude/worktrees/`, since the Claude app made it and removes it when its session is archived.
- **Skill** step 6 MUST run the script from a subshell, `(cd "$main" && sh ...)`, so the cd doesn't move the session.
- **Rules** `workflow.instructions.md` gets a "Session folder" list: a session for another repo MUST start with `cwd` set to that repo, and a session MUST NOT move out of its worktree with `cd` or `change_directory`.
- **Steps** spec, the script and its test, the skill, the rules, docs.
- **Docs** `README.md`, `CHANGELOG.md`.

### 2026-11-25 Sessions start without an app worktree

- **Why** 2 starts into `C:\WBS\guitar-upscale` with `use_worktree: true` failed with "could not anchor this repository" after the fix above shipped. In `git-worktrees.json` of the Claude app, the anchor of `C:\WBS\guitar-upscale` names the git dir `.git/worktrees/strange-almeida-f8c0fe`. That app worktree was removed before `remove-merged.sh` learned to keep app worktrees. Folders whose anchor has no git dir, such as `C:\WBS\neuroigry`, start fine. A `use_worktree: false` start into the same folder worked.
- **Rules** a session for another repo MUST start with `cwd` set to its main checkout and `use_worktree: false`. Its brief MUST tell it to make its own worktree through `git-worktrees`. A failed start MUST get that retry at once, and only a second failure goes to the person.
- **Not changed** the stale record sits in the app's own state, so no script here edits it. The rule works around it.
- **Steps** spec, the rules, the skill, docs.
- **Docs** `README.md`, `CHANGELOG.md`, `docs/agent-lessons.md` of `workspace`.
