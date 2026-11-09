# Releases

## What it does for the person

Each push to `main` gets a GitHub release once its `check` run passes,
in this repo, such as `v2026.10.30.1`. Its notes list the commits since the
release before, so a reader sees what changed without reading the log.

## User flows

1. A PR merges into `main`.
2. `check` runs on the push.
3. Once `check` passes, Release starts through `workflow_run`, tags the commit and publishes the notes on the Releases page.

## How it works

- **`.github/workflows/release.yml`** starts through `workflow_run` once
  `check.yml` passes on a push to `main`. One release runs at a time, and a
  newer push cancels the stale one. It runs on `ubuntu-latest`. The repo is public, so GitHub runners cost 0 minutes and fork code stays off the PC.
- **`.github/scripts/next-version.sh`** picks the tag: the date, then the
  number of the release that day.
- **`.github/scripts/release-notes.sh`** writes the notes from the commits
  since the last tag.

## Limits

- **Notes only** the repo builds no file, so the release carries none.
- **Failed check** a red `check` run or a PR run starts no release.

## Changes

### 2026-10-30 a release after each passing check

- **Why** the repo had checks and shipped no release, so a merge left no
  tagged point to go back to.
- **Changes** the Release workflow and its two scripts come from the
  `repo-ci` templates. `.gitattributes` keeps LF endings on `*.sh`.
- **Steps** this spec, then the workflow and scripts, then the docs.
- **Docs** `README.md`, `CHANGELOG.md`, `docs/features.md` and `docs/architecture.md`.

### 2026-11-09 week review of the parallel release

- **Why** #55 started Release on the push but dropped its concurrency group, so two quick merges could pick the same tag. The check run of `main` lost its group too, and a comment and three doc blocks were left over.
- **Changes** Release gets back `concurrency: release`, picks the version after the wait, and `check.yml` cancels stale PR runs only. `wait-for-checks.sh` gets its run bit and the lint.
- **Docs** `README.md`, `docs/architecture.md`, `docs/user-flows.md`, `CHANGELOG.md`.

### 2026-11-09 Release starts after check, through workflow_run

- **Why** Release waited in `wait-for-checks.sh` and held a runner. With every runner busy, `check` starved and the release timed out.
- **Changes** `release.yml` starts on `workflow_run` of `check`, from the `repo-ci` template, and `wait-for-checks.sh` goes. A run by hand on `main` first checks that `check` passed on the commit.
- **Docs** `README.md`, `docs/architecture.md`, `docs/features.md` and this spec.

### 2026-11-10 audit: lint names only scripts that exist

- **Why** f5b1b56 deleted `wait-for-checks.sh`, but `mise run lint` still passed it to shellcheck and shfmt, so `check` failed on `main` and no release went out.
- **Changes** `mise.toml` drops the deleted script. This spec and `docs/architecture.md` describe the `workflow_run` start.
- **Docs** `README.md`, `docs/architecture.md`, `CHANGELOG.md`.
