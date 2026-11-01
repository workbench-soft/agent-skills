---
name: reset-history
description: 'Use when the user asks to fully reset, wipe or squash the git history of a repo and start over with one fresh initial commit, in any language: "reset the history", "squash everything into one commit", "make a fresh initial commit", "wipe the git history", "start the repo from scratch", "сбрось историю", "сделай один начальный коммит", "удали историю коммитов". Lists the branches, tags, releases, open PRs and branch rules the reset touches, saves a bundle of the old history outside the repo, builds one commit from the current tree of the default branch and checks the files match, asks once, force pushes with a lease, puts the branch rules back, cleans up old branches and tags, resets the local checkout, and writes TODO.md with the clones, forks and secrets a person still has to handle.'
---

# Reset a repo's history to one fresh commit

The default branch MUST end up with one commit. Its files MUST be the ones it
held before the reset, and `git diff` between the two MUST come back empty.

The agent MUST load the `writing-style` skill before the first line a person
reads, unless it is in context. Every `gh` MUST carry the `GH_PAGER=cat`
prefix.

## 1. Read the repo

Repo rules MUST win over this skill. The agent MUST read `AGENTS.md`,
`CLAUDE.md`, `CONTRIBUTING.md` and the README, then MUST set the names the
rest uses:

```bash
remote=$(git remote | grep -qx origin && echo origin || git remote | head -1)
default=$(GH_PAGER=cat gh repo view --json defaultBranchRef -q .defaultBranchRef.name)
repo=$(GH_PAGER=cat gh repo view --json nameWithOwner -q .nameWithOwner)
git fetch "$remote" --prune --tags
old=$(git rev-parse "$remote/$default")
tree=$(git rev-parse "$old^{tree}")
```

This skill MAY push to the default branch with force, since the user asked for
exactly that. The ship rule's worktree and PR steps MUST NOT apply to the
reset. Any file change after it, such as `TODO.md`, MUST ship the normal way.

## 2. List what the reset touches

The agent MUST collect these, then show them to the user in step 5:

```bash
git rev-list --count "$remote/$default"
git branch -r | grep -v "$remote/HEAD"
git tag
GH_PAGER=cat gh pr list --state open --json number,title,headRefName
GH_PAGER=cat gh release list
GH_PAGER=cat gh repo view --json isFork,forkCount,visibility
```

- **Open PRs** each one loses its base and GitHub closes it after the push. An
  open PR SHOULD merge or close first, on the user's word.
- **Other branches** each one keeps the old history alive on the remote, so
  the agent MUST list it.
- **Tags and releases** each tag points into the old history. A release keeps
  its notes and files, and its tag goes stale. The agent MUST list both.
- **Submodules and LFS** `.gitmodules` and `.gitattributes` with `filter=lfs`
  keep working, since the tree stays the same. The agent SHOULD note them
  anyway.
- **Branch rules** the agent MUST find protection or a ruleset that blocks
  force push, as [references/github.md](references/github.md) shows.

The user's checkout MUST be clean: `git status --short` empty and
`git stash list` empty. Otherwise the agent MUST stop and ask, since it might
hold work.

## 3. Save the way back

The agent MUST write a bundle of every ref outside the repo, then check it
reads back:

```bash
backup="$HOME/repo-backups/$(basename "$repo")-$(date +%Y%m%d-%H%M%S).bundle"
mkdir -p "$(dirname "$backup")"
git bundle create "$backup" --all
git bundle verify "$backup"
```

The bundle MUST pass `verify` before step 6. It is the only copy once the
remote and the local objects are gone. The user MAY restore from it with
`git clone "$backup"`.

## 4. Build the new commit

The agent MUST make the commit from the tree of the remote default branch.
The checkout MUST NOT change, so the user's folder and ignored files stay as
they are:

```bash
msg="Initial commit"
new=$(git commit-tree "$old^{tree}" -m "$msg")
git diff --stat "$old" "$new"
git rev-list --count "$new"
```

- **Same files** the diff MUST come back empty and the count MUST be 1.
- **Message** the agent SHOULD use the repo's commit style when it has one,
  such as `chore: initial commit` for Conventional Commits.
- **Author** the commit SHOULD take the local git user and today's date. The
  user MAY ask for another, set through `GIT_AUTHOR_NAME` and
  `GIT_AUTHOR_EMAIL`.
- **Signed** a repo that requires signed commits MUST get
  `git commit-tree -S`.

A secret in the old history stays valid after the reset. The bundle, other
clones and forks still hold it. The agent MUST add a line to `TODO.md` to
rotate it.

## 5. Ask once

The push can't be undone from the remote side. The agent MUST show the user,
in one short block:

- **Goes** the block MUST name the commit count, and the branches and tags
  from step 2 to delete.
- **Stays** it SHOULD name the files, issues, releases with their notes,
  stars, settings.
- **Branch rules** it MUST name any rule step 6 lifts for the push and puts
  back.
- **Backup** it MUST give the bundle path from step 3.

The agent MUST wait for a clear yes. The user's request already said to push
without asking? Then the agent MAY go on.

## 6. Push

The agent MUST lift a rule that blocks force push first, with the steps in
[references/github.md](references/github.md). Then it MUST push with a lease,
so a commit that landed since step 1 stops the push:

```bash
git push --force-with-lease="refs/heads/$default:$old" "$remote" "$new:refs/heads/$default"
```

- The lease failed? Someone pushed. The agent MUST fetch, show the user the
  new commits, and start again from step 2.
- The agent MUST put each lifted rule back right after the push, as it was,
  and check it with the same read as before.

## 7. Clean up the old history

On the user's yes from step 5, the agent MUST run, for each branch and tag:

```bash
git push "$remote" --delete <branch>
git push "$remote" --delete "refs/tags/<tag>"
git tag -d <tag>
```

- **Branches** the agent MUST delete each remote branch from the list. A
  branch with work the user wants SHOULD get a rebase onto the new commit
  instead: `git rebase --onto "$new" "$old" <branch>`.
- **Tags** the agent MUST delete each old tag. The user MAY ask to tag the new
  commit with the latest version: `git tag <version> "$new"`.
- **Releases** a release whose tag is gone turns into a draft. The agent MUST
  ask whether to delete it, or keep it as a draft for its notes.

## 8. Reset the local checkout

The user's checkout still sits on the old commits. The agent MUST move it to
the new one, then drop the old objects:

```bash
git switch "$default"
git reset --hard "$remote/$default"
git branch --format='%(refname:short)' | grep -vx "$default"
git worktree list
```

- **Local branches** each one keeps the old history. The agent SHOULD delete
  it with `git branch -D`, unless it holds work the user wants.
- **Worktrees** a worktree on an old branch MUST go through the
  `git-worktrees` skill.
- **Objects** the agent MUST drop them last, once the bundle passed `verify`:

```bash
git reflog expire --expire=now --all
git gc --prune=now
git rev-list --all --count
```

The count SHOULD come back 1, plus any branch the user kept.

## 9. Check

1. `git log --oneline "$remote/$default"` MUST show the one commit.
2. `git rev-parse "$remote/$default^{tree}"` MUST print the `$tree` saved in
   step 1, so the files match.
3. CI MUST run on the new commit: `GH_PAGER=cat gh run list --branch "$default" -L 1`.
   The agent SHOULD watch it with `GH_PAGER=cat gh run watch`. A check that
   failed before the reset MUST go in `TODO.md` with that reason.

## 10. Leftovers

The agent MUST write these to `TODO.md` under `## reset-history`, then ship
`TODO.md` the way the repo ships a change:

- **Other clones** each one MUST run `git fetch` then
  `git reset --hard origin/<default>`. A push from an old clone brings the
  history back.
- **Forks** a fork keeps the old history. Only its owner MAY reset it.
- **Secrets** each one found in the old history MUST get a line, to rotate.
- **Backup** the bundle path MUST appear, and when to delete it.
- **GitHub copies** the list MUST name what GitHub keeps after the push, from
  [references/github.md](references/github.md).

The agent MUST report back in two lines: the new commit SHA, and the branches
and tags that went.

## Guardrails

- The push MUST use `--force-with-lease` with the old SHA, so it can't drop a
  commit pushed after step 1.
- The bundle MUST exist and pass `verify` before the push.
- The new tree MUST match the old one. A file change MUST go in its own commit
  after the reset.
- A branch rule lifted for the push MUST be put back in the same run.
