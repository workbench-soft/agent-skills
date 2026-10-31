---
name: git-worktrees
description: 'Use when a piece of work needs a checkout of its own, and again once that work is finished, in any repository and in any language: "make a worktree", "work in a separate folder", "clean up the worktrees", "remove the branch", "сделай ворктри", "удали ворктри". implement-ticket, app-audit, review and the ship rule call it too. It creates a worktree beside the main repo folder off the latest default branch and gives it the local files, trust and dependencies it needs to run. When the PR merges or the work is dropped, it removes the worktree, its folder and its branch, local and remote. On the way it sweeps the other finished worktrees of the repo.'
---

# Git worktrees

A worktree is an extra checkout of the repo, in a folder of its own. The user's
checkout is left alone, and the worktree is removed when its work is finished.

Each `gh` call MUST start with `GH_PAGER=cat`, since a pager would hang it.

## 1. Read the repo's own setup

A worktree skill or doc in the repo MUST beat the steps below. Search for one
before running the first command:

```bash
git ls-files | grep -iE '(^|/)(skills/[^/]*worktree[^/]*/SKILL|[^/]*worktree[^/]*\.md)$'
grep -il worktree AGENTS.md CLAUDE.md CONTRIBUTING.md README.md 2>/dev/null
```

## 2. Sweep finished worktrees

For every other worktree of this repo whose branch has a merged PR, run step 6.
Skip the main checkout. A worktree that fails any check of step 6 is kept, and
no question goes to the user.

```bash
git worktree list --porcelain | awk '/^branch /{sub("refs/heads/","",$2); print $2}'
GH_PAGER=cat gh pr list --state merged --head "<branch>" --json number -q 'length'
```

## 3. Create

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
- **Upstream** `--no-track` stops the branch from tracking the default branch.
  The first push gives it one: `git push -u "$remote" HEAD`.
- **Already there** the branch or the folder exists? Stop and ask, since it may
  hold someone's work.
- **Existing branch** to check one out, such as a PR under review, fetch it
  first and leave out `-b`: `git fetch "$remote" pull/<number>/head:<branch>`.
- **Where to run** from now on each command MUST run inside `$dir`.

## 4. Make it runnable

A new worktree is missing every file git ignores. Copy over from the main
checkout what the checks and the app need:

- **Local config** `.env`, `.env.local`, `local.properties` (the Android SDK
  path), and certificates in a folder such as `.config/certs`. Copy them with
  `cp -a`.
- **Trust** run `mise trust` if the repo has a mise config, and `direnv allow`
  if it has `.envrc`.
- **Dependencies** install them with the repo's command and lockfile:
  `pnpm install --frozen-lockfile`, `bundle install`, `uv sync`.
- **Port** a dev server picks a free port, and the user's copy keeps running
  apart.

```bash
git -C "$main" ls-files --others --ignored --exclude-standard --directory \
  | grep -E '(^|/)(\.env[^/]*|local\.properties|[^/]*\.(pem|crt|key))$|^\.config/certs/'
```

- **Out of commits** a copied file MUST stay out of all commits. Git already
  ignores it, so `git add <files>` with only the change's names leaves it out.
- **On this machine** a copied file MUST NOT leave this machine.

## 5. Work

Treat the worktree as a normal checkout. Commit, push and open the PR as the
task's own skill says. Before step 6, the shell MUST be out of `$dir`.

## 6. Remove

This step runs once the work is finished:

- **Merged** the branch's PR shows as merged.
- **Review over** for a worktree made to read someone else's branch, the review
  is posted or handed back.
- **Dropped** the user said to drop the work.

Check from the main checkout first. Unless the user dropped the work, each line
MUST print empty:

```bash
cd "$main"
git -C "$dir" status --short
git -C "$dir" stash list
head=$(GH_PAGER=cat gh pr view <branch> --json headRefOid -q .headRefOid)
[ "$(git -C "$dir" rev-parse HEAD)" = "$head" ] || echo "HEAD is not the PR head"
```

- **Unpushed commits** the PR head SHOULD be the reference. `@{u}` fails once
  GitHub deletes the merged branch, and its empty output would pass.

Any line with output halts the removal. The worktree is kept, and a line in
`TODO.md` gives the path and what remains in it.

```bash
git worktree remove "$dir"
git branch -D <branch>
git ls-remote --exit-code --heads "$remote" <branch> >/dev/null && git push "$remote" --delete <branch>
git worktree prune
```

- **Branch delete** `git branch -D` is safe here, because the PR state or the
  user's word already settled that the work landed or isn't wanted. After a
  squash merge, `git branch -d` sees the branch as unmerged.
- **Someone else's branch** the remote branch MUST stay, as with a PR under
  review. Only the folder and the local branch go.
- **Force** `git worktree remove --force` MUST NOT be used unless the user
  dropped the work. In other cases a refusal means a file remains, one the
  check above failed to catch.
- **Folder left over** still on disk after `git worktree remove`? Then it held
  only ignored files, such as `node_modules`. Once `ls "$dir"` shows no source
  files, delete it by its full path written out, such as
  `rm -rf -- "C:/code/app-fix-login"`. The safety check blocks a removal on a
  variable.

## 7. Report back

A line for each worktree: its path, and whether it was removed or kept, with
the reason.

## Guardrails

- **User's checkout** it MUST stay on its branch, its files unchanged.
- **Unsaved work** a worktree holding uncommitted, stashed or unpushed work
  MUST NOT be removed.
- **Default branch** it MUST NOT be deleted, local or remote.
