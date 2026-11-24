---
name: feature-queue
description: 'Use in a git repo before any change and after it ships. Also on "queue it", "what are the other sessions doing", "поставь в очередь", "кто ещё работает над приложением". Each session claims its files on this PC and waits when claims overlap. Clean main with no overlapping claim and direct push allowed can be edited directly; dirty or protected branches use a worktree and PR.'
---

# Feature queue

Sessions on one repo MUST take turns on the files they share. They SHOULD run
side by side on the rest. Each change MUST use the clean `main` checkout only
when no claim overlaps its files and the checkout has no local edits.

## 1. Plan the area

Before choosing a checkout, the agent MUST list every file the change edits or
adds, from the spec entry and a read of the code.

- **Folder** a change that rewrites a whole folder MAY claim the folder as
  `src/upload/`. A claim on a folder covers each file inside.
- **Shared files** the agent MUST include shared files in the area so direct
  edits cannot overlap silently. Branch PRs MUST still merge shared files by
  keeping both sides where `.gitattributes` allows it.

## 2. Read the board

The board MUST be `~/.agents/queue/<repo>/`, a file per session
named `<session>.md`. The agent MUST read each claim of the repo:

```bash
board=~/.agents/queue/<repo>; mkdir -p "$board"
for f in "$board"/*.md; do [ -e "$f" ] && echo "== $f" && cat "$f"; done
```

The agent MUST delete a stale claim before it compares:

- **Merged** a claim with a `branch` value MUST go when
  `gh pr list --head <branch> --state all` shows its PR merged or closed.
- **Gone** a `working` claim MUST go when its worktree folder is missing.
- **Silent** a `waits for` claim MUST go when its file is older than 30 minutes,
  since a waiting session touches it on each check.
- **Main** a direct `main` claim MUST be refreshed every 10 minutes and
  removed as soon as its commit is pushed. A claim older than 30 minutes MAY
  be removed after the session is confirmed ended.

## 3. Claim

The agent MUST write its claim before the worktree, in this shape:

```markdown
state: working
since: 2026-11-02 16:55
session: <session title or link>
branch: <branch or main>
worktree: ~/code/memories
area: src/upload/queue.ts, src/upload/ui/
```

- **No overlap** the state MUST be `working`, and `ship-change` chooses the checkout.
- **Overlap** a path in two areas, or a file inside a claimed folder, MUST
  set the state to `waits for <session>`. The session MUST be the working
  claim it overlaps, or else the waiting claim with the earliest `since`.
- **Race** the agent MUST read the board once more after the write. When two
  claims overlap and both say `working`, the later `since` MUST switch to
  `waits`. On a tie, the session name later in sort order MUST switch.

## 4. Wait

A waiting agent MUST check every 2 minutes in a background loop, touch its
claim each time, and pick the work up when the loop ends:

```bash
while [ -e "$board/<blocker>.md" ]; do touch "$board/<session>.md"; sleep 120; done
```

- **Turn** the agent SHOULD end its turn with `⏳ !!!RUNNING!!!` and the
  session it waits for, and resume on the loop's exit.
- **Next** once the blocker's claim is gone, the agent MUST run steps 2 and 3
  again, since another claim MAY be first in line.
- **Fresh base** the worktree MUST then come off the latest `main`, through
  `git-worktrees`, so it holds the blocker's merge.

## 5. Open the PR

On the worktree path, the agent MUST open the draft PR right after the spec
commit, as step 7 of `ship-change` says, so other sessions see the work.

- **Dropped** work the person drops MUST close its PR.

## 6. Grow the area

A file outside the area, found mid-work, MUST send the agent back to the
board.

- **Free** the agent MUST add the file to its `area` line.
- **Claimed** the agent SHOULD ship what it has, then queue the rest under a
  new branch from step 3.

## 7. Merge shared files

The repo's `.gitattributes` MUST keep both sides of the shared files on a
merge. The agent MUST add the lines missing for the repo's files in its PR:

```text
CHANGELOG.md merge=union
TODO.md merge=union
docs/features.md merge=union
docs/user-flows.md merge=union
src/i18n/*.ts merge=union
```

- **GitHub** the merge on GitHub ignores the driver. On a conflict there, the
  agent MUST merge `origin/main` into the branch locally and push it.
- **Lockfile** a lockfile conflict MUST take the file from `main`, then the
  install MUST rebuild it: `git checkout --theirs pnpm-lock.yaml` and
  `mise x -- pnpm install --lockfile-only`. `Cargo.lock` MUST rebuild with
  `mise x -- cargo metadata --format-version 1 >/dev/null`.
- **Check** after a union merge the agent SHOULD read the merged catalog or
  changelog for a duplicate key or a doubled line.
- **Other files** a conflict in a file of the area means the queue missed a
  path. The agent MUST fix it by hand and add the path to the area rule of
  step 1 in its answer.

## 8. Leave

Right after the commit is pushed or the PR merges, the agent MUST delete its
claim, then drop stale claims from step 2.

- **Release** the agent MUST NOT start Release, build an APK or touch the
  phone, apart from the launch check of "Risky builds" in `ship-change`. A direct
  push or the last PR merge releases through CI.
- **Phone test** when the board is empty and queued PRs remain, the answer
  MUST tell the person the repo is ready for "test the merged work". Direct
  pushes already run CI and release.
- **Old workflow** a repo whose Release holds a runner while it waits for
  Checks, such as through `wait-for-checks.sh`, SHOULD move to a workflow
  that starts both at once, in a PR of its own.
