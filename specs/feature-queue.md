# Feature queue

## What it does for the person

Sessions claim every file they plan to edit. A clean `main` checkout with no
overlapping claim and direct push allowed can be edited directly. Overlapping
files wait and recheck; dirty or protected branches use a worktree and PR.

## User flows

1. The person starts a session per feature.
2. Each session lists every file it plans to edit and writes a claim on the
   board of the repo.
3. A clean `main` checkout with no overlap, no local edits and direct push
   allowed can be used directly. Overlapping work waits and rechecks; dirty or
   protected checkouts use a worktree.
4. Direct work is committed and pushed to `main`; worktree changes use a PR.
5. Each session removes its claim after the push or merge. CI releases each
   push to `main`.

## How it works: modules, files, data

- **Skill** `skills/feature-queue/SKILL.md` holds the steps. The agent runs
  them through bash and `gh`, with no program of its own.
- **Board** `%USERPROFILE%\.agents\queue\<repo>\<session>.md`, a file per
  session, so two sessions don't write the same file.
- **Branch shared files** `CHANGELOG.md`, `TODO.md`, the feature docs and the
  translation catalogs get `merge=union` in `.gitattributes`. A lockfile
  takes the version on `main` and gets rebuilt.
- **Release** `templates/release.yml` of `repo-ci` builds beside Checks on
  each push and publishes once they pass. Open PRs hold no release.
- **Draft PR** worktree changes open a draft PR after the spec commit. Direct
  changes commit and push to `main` without a PR.
- **Rules** the `ship` skill and "Ship every change" in
  `workflow.instructions.md` call the skill.

## Limits

- **One PC** the board sits on this PC. A cloud session or another machine
  doesn't see it.
- **Planned files** a session claims the files it plans to edit. A file found
  later needs a second check of the board.
- **Dead session** a claim of a session that died can stay until its owner or
  another session finds it stale.

## Changes

### 2026-11-02 Queue the sessions of one app, release once at the end

- **Why** 10 sessions on one app conflicted on merge, and each built its own
  release and tested on the phone.
- **Changes** a new `feature-queue` skill. `workflow.instructions.md` adds the
  queue step, and the batch test session releases repos whose board is
  empty. `repo-ci` releases on dispatch only.
- **Steps** this spec, the skill, the rules and `repo-ci`, the docs.
- **Docs** `README.md` "Workflow rules", `docs/features.md`, `CHANGELOG.md`.
  The skills table and the CI lines of `conventions.md` in the workspace repo.

### 2026-11-02 Release stays automatic, with a gate

- **Why** the person wants releases to run by themselves, held only while
  other sessions still work on the app.
- **Changes** `templates/release.yml` goes back to running after Checks and
  gets a `gate` job. Sessions open a draft PR right after the spec commit.
  `audit.sh` flags `no release gate`. Each org repo gets the gate in a PR.
- **Docs** `README.md`, `docs/features.md`, `workflow.instructions.md`,
  `conventions.md` of the workspace repo.

### 2026-11-05 Use clean main when files are free

- **Why** the owner asked to skip branches and PRs when the checkout is clean
  and no active session edits the same files.
- **Changes** sessions claim every planned file. `ship` commits directly to
  `main` when no local edit or overlapping claim exists, and keeps the
  worktree and PR path for dirty or protected branches.
- **Docs** `workflow.instructions.md`, `skills/ship`, `README.md`,
  `docs/features.md`, `docs/user-flows.md`, `docs/architecture.md`.
