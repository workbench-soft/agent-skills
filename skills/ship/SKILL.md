---
name: ship
description: 'Use in a git repo once a change is planned, right after specs, and again at commit, merge and cleanup. Also on "ship it", "open the PR", "merge it", "залей", "смёржи". Checks for overlapping sessions and local edits, then commits straight to clean main or uses a worktree, branch and PR. Also the changelog entry and safety bans.'
---

# Ship every change

Each change to a git repo MUST ship this way, unless the repo's rules say
otherwise. The agent MUST do each step without waiting to be asked.

## Steps

1. **Queue** the agent MUST claim every file it plans to change through
   `feature-queue`, then check `git status` and overlapping claims.
2. **Main path** when the checkout is on `main`, has no local changes, no
   claim overlaps and direct push is allowed, the agent MUST fast forward it
   to `origin/main`, then edit and stage only claimed files. A failed fast
   forward MUST use the isolated path.
3. **Overlap** when a claim overlaps, the agent MUST wait for its owner, then
   repeat steps 1 and 2. Dirty or protected checkouts MUST use a fresh worktree
   off the latest default branch through `git-worktrees`.
4. **Changelog** each change MUST add an entry in the repo's own way: a
   changeset, a line under `## Unreleased`, a commit message a release tool
   reads. A repo without one MUST get `CHANGELOG.md` with `## Unreleased`.
5. **Worktree setup** the agent MUST install its own dependencies and use a
   free port. It MUST NOT start a Release, build an APK or touch the phone,
   apart from the launch check of "Risky builds" below.
   An APK it builds SHOULD carry the release key, so it installs over the
   release and keeps the app's data.
6. **Commit to Main** on the Main path, the agent MUST commit its changes and
   push `main` directly. If the remote advances, the agent MUST integrate its
   unpublished commits and retry without force. If branch rules reject the
   push, the agent MUST use the PR path.
7. **PR path** on the isolated path, the agent MUST push the spec commit and
   open a draft PR with the `untested` label, then commit and push the code.
   Before `gh pr ready`, the agent MUST rewrite the body through `create-pr`,
   with its Step by step list of the whole work. The agent MUST run `gh pr ready` and merge at once with the repo's merge
   method. A conflict MUST be fixed by merging the latest default branch.
8. **Deploy** once the change is on `main`, a repo with a `deploy` mise task
   MUST go live from this machine at once, through "Deploy from this machine"
   below. The agent MUST NOT wait for CI to deploy it.
9. **Clean up** after either path, the agent MUST delete its claim. On the PR
   path, it MUST also remove the worktree and branch through `git-worktrees`.

The agent MUST create the label once per repo and use it for PR path changes:

```bash
GH_PAGER=cat gh label create untested --color FBCA04 --force
GH_PAGER=cat gh pr create --draft --label untested --title "<title>" --body-file <file>
GH_PAGER=cat gh pr ready
GH_PAGER=cat gh pr merge --squash --delete-branch
```

## Deploy from this machine

The agent MUST run the deploy from a checkout whose `HEAD` is the fresh
`origin/main`: the main checkout after a fast forward, or on the PR path its
worktree after `git checkout --detach origin/main`, before cleanup.

```bash
git fetch -q origin && git checkout -q --detach origin/main
CI=1 mise run deploy
```

- **Tokens** a task that needs a token MUST run through the run wrapper of
  the secret manager, such as
  `mise x -- bws run --project-id <id> -- mise run deploy`. A push to a
  GitHub repo SHOULD take `gh auth token`.
- **Background** the deploy MUST run in the background, and the agent MUST
  pick its result up before the end of the turn.
- **Check** the agent MUST load the live page and see the new build, such as
  the new version or a changed line.
- **Newest only** the task MUST stop when `HEAD` is behind `origin/main`, so
  an older commit doesn't put an old build back.
- **Missing task** a repo whose CI deploys a site with no `deploy` task MUST
  get one in the agent's next change to that repo. CI MUST then call the same
  task, so this machine and CI run one script.
- **Left to CI** an Android or Play release, a deploy that restarts a shared
  server, and a Worker deploy that drops live calls MUST stay with CI. Such a
  Worker MUST keep its own task, such as `deploy:signal`.
- **Failure** a failed deploy MUST get fixed in a new change. CI deploys the
  same commit later, so the site doesn't stay behind.

## Rules on the way

- **Safety** the bans in "Ship every change" of the workflow rules MUST hold
  on both paths.
- **Reviews** when a required review blocks the merge, the merge and the
  worktree MUST wait for it. The agent MUST add the PR link to `TODO.md`.
- **Skills** this order MUST win over a skill that waits for CI or a build
  before the merge, such as `app-audit`.
- **rewrite-repo** a run of `rewrite-repo` MUST follow that skill: it works
  on the default branch with no PR and ends in one fresh commit.
- **Risky builds** a change to a shrink or build setting, keep rules, native
  code or a native package MUST build the release APK and pass the repo's
  launch check, such as `.github/scripts/launch-check.sh`, before the merge.
  A crash MUST block the merge, since each push to `main` ships.
- **Launch gate** an app release SHOULD open the new build and stop on a
  crash before it publishes. A release without that gate SHOULD get it in the
  agent's next change there.

## After the merge

- **Fast** the merge MUST come first. Site, console and phone steps MUST
  wait for it, and a gap found later MUST ship as a new small PR.
- **Sites while CI builds** site and console steps MUST run right after the
  merge, while CI builds, through `guide-on-site`.
- **Feature docs** a change that adds, changes or removes a feature MUST
  update the docs that describe it before the session ends, through the docs
  skill the person's rules name.
- **Phone check** a change that needs one MUST get it in this session, on the
  CI build of the merge, once that build is ready. The batch test of other
  merged work MUST run in its own session.
