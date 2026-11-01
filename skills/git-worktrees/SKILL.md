---
name: git-worktrees
description: 'Use when a piece of work needs a checkout of its own, and again once that work is finished, in any repository and in any language: "make a worktree", "work in a separate folder", "clean up the worktrees", "remove the branch", "сделай ворктри", "удали ворктри". implement-ticket, app-audit, review and the ship rule call it too. It creates a worktree beside the main repo folder off the latest default branch and gives it the local files, trust and dependencies it needs to run. When the PR merges or the work is dropped, it removes the worktree, its folder and its branch, local and remote. On the way it sweeps the other finished worktrees of the repo.'
---

# Git worktrees

A worktree is an extra checkout of the repo, in a folder of its own. The
user's checkout MUST stay as it is, and the worktree MUST go once its work is
finished.

Each `gh` call MUST start with `GH_PAGER=cat`, since a pager would hang it.

## 1. Read the repo's own setup

A worktree skill or doc in the repo MUST beat the steps below. The agent MUST
search for one before running the first command:

```bash
git ls-files | grep -iE '(^|/)(skills/[^/]*worktree[^/]*/SKILL|[^/]*worktree[^/]*\.md)$'
grep -il worktree AGENTS.md CLAUDE.md CONTRIBUTING.md README.md 2>/dev/null
```

## 2. Sweep finished worktrees

The agent SHOULD run step 6 for every other worktree of this repo whose
branch has a merged PR. It MUST skip the main checkout. A worktree that fails
any check of step 6 MUST stay, and no question SHOULD go to the user.

```bash
git worktree list --porcelain | awk '/^branch /{sub("refs/heads/","",$2); print $2}'
GH_PAGER=cat gh pr list --state merged --head "<branch>" --json number -q 'length'
```

## 3. Create

The agent MUST create the worktree off the latest default branch:

```bash
remote=$(git remote | grep -qx origin && echo origin || git remote | head -1)
default=$(GH_PAGER=cat gh repo view --json defaultBranchRef -q .defaultBranchRef.name)
git fetch "$remote" "$default"
main=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
dir="$(dirname "$main")/$(basename "$main")-<branch>"
git worktree add --no-track -b <branch> "$dir" "$remote/$default"
```

- **Location** the folder MUST sit beside the main repo folder, named
  `<repo>-<branch>`. The path is built from the main repo, so starting in a
  subfolder ends in the same spot.
- **Upstream** `--no-track` MUST stop the branch from tracking the default
  branch. The first push MUST give it one: `git push -u "$remote" HEAD`.
- **Already there** when the branch or the folder exists, the agent MUST stop
  and ask, since it might hold someone's work.
- **Existing branch** to check one out, such as a PR under review, the agent
  MUST fetch it first and leave out `-b`:
  `git fetch "$remote" pull/<number>/head:<branch>`.
- **Where to run** from now on each command MUST run inside `$dir`.

## 4. Make it runnable

A new worktree is missing every file git ignores. The agent MUST copy over
from the main checkout what the checks and the app need:

- **Local config** the agent MUST copy `.env`, `.env.local`,
  `local.properties` (the Android SDK path), and certificates in a folder such
  as `.config/certs`, with `cp -a`.
- **Trust** the agent MUST run `mise trust` if the repo has a mise config, and
  `direnv allow` if it has `.envrc`.
- **Dependencies** the agent MUST install them with the repo's command and
  lockfile: `pnpm install --frozen-lockfile`, `bundle install`, `uv sync`.
- **Port** a dev server MUST pick a free port, so the user's copy keeps
  running apart.

The agent SHOULD list the ignored files to copy with this:

```bash
git -C "$main" ls-files --others --ignored --exclude-standard --directory \
  | grep -E '(^|/)(\.env[^/]*|local\.properties|[^/]*\.(pem|crt|key))$|^\.config/certs/'
```

- **Out of commits** a copied file MUST stay out of all commits. Git already
  ignores it, so `git add <files>` with only the change's names leaves it out.
- **On this machine** a copied file MUST NOT leave this machine.

## 5. Work

The agent SHOULD treat the worktree as a normal checkout. It MUST commit, push
and open the PR as the task's own skill says. Before step 6, the shell MUST be
out of `$dir`.

## 6. Remove

This step MUST run only once the work is finished:

- **Merged** the branch's PR MUST show as merged.
- **Review over** for a worktree made to read someone else's branch, the
  review MUST be posted or handed back.
- **Dropped** the user MUST have said to drop the work.

The agent MUST check from the main checkout first. Unless the user dropped the
work, each line MUST print empty:

```bash
cd "$main"
git -C "$dir" status --short
git -C "$dir" stash list
head=$(GH_PAGER=cat gh pr view <branch> --json headRefOid -q .headRefOid)
[ "$(git -C "$dir" rev-parse HEAD)" = "$head" ] || echo "HEAD is not the PR head"
```

- **Unpushed commits** the PR head SHOULD be the reference. `@{u}` fails once
  GitHub deletes the merged branch, and its empty output would pass.

Any line with output MUST halt the removal. The worktree MUST stay, and a line
in `TODO.md` MUST give the path and what remains in it. Otherwise the agent
MUST remove it:

```bash
git worktree remove "$dir"
git branch -D <branch>
git ls-remote --exit-code --heads "$remote" <branch> >/dev/null && git push "$remote" --delete <branch>
git worktree prune
```

- **Branch delete** the agent MAY use `git branch -D` here, because the PR
  state or the user's word already settled that the work landed or isn't
  wanted. After a squash merge, `git branch -d` sees the branch as unmerged.
- **Someone else's branch** the remote branch MUST stay, as with a PR under
  review. Only the folder and the local branch MAY go.
- **Force** `git worktree remove --force` MUST NOT be used unless the user
  dropped the work. In other cases a refusal means a file remains, one the
  check above failed to catch.
- **Folder left over** a folder still on disk after `git worktree remove` held
  only ignored files, such as `node_modules`. Once `ls "$dir"` shows no source
  files, the agent SHOULD delete it by its full path written out, such as
  `rm -rf -- "C:/code/app-fix-login"`. It MUST NOT remove a path held in a
  variable, since the safety check blocks that.

## 7. Report back

The answer MUST give a line for each worktree: its path, and whether it was
removed or kept, with the reason.

## Guardrails

- **User's checkout** it MUST stay on its branch, its files unchanged.
- **Unsaved work** a worktree holding uncommitted, stashed or unpushed work
  MUST NOT be removed.
- **Default branch** it MUST NOT be deleted, local or remote.
