# A new skill in the repo shows up in every agent without a rerun

## Why

- **Symptom** `rewrite-repo` landed on `main` and the agents on this machine
  didn't see it. The installer links each skill folder on its own, so a new
  folder waits for the next manual run.
- **Removed skills** a deleted skill leaves a broken link in every agent
  folder.

## User flows it touches

1. The user installs once, from a clone or with the one line installer.
2. The installer adds git hooks to the clone it links from.
3. A `git pull`, `merge`, `checkout` or `rebase` in that clone runs the
   installer again, quietly, with the language already chosen.
4. New skills get links, links to removed skills go.

## Changes

- **`install.sh`**
  - reuses the language in `LANGUAGE.md` when `--lang` is missing, so a rerun
    asks no question.
  - writes `post-merge`, `post-checkout` and `post-rewrite` hooks into the
    clone, leaving a hook it didn't write alone. A worktree gets none, since
    its folder goes away.
  - removes links in agent folders that point at a skill no longer there.
  - `--uninstall` removes its hooks.
- **`scripts/test-install.sh`** a new skill merged in a git clone gets a
  link, a removed one loses it.
- **`README.md`** the auto link, the reused language.
- **`CHANGELOG.md`** an entry under Unreleased.

## Steps, in commit order

1. This plan.
2. The installer and its test.
3. README and changelog.

## Docs to update

- `README.md`: What it does, Change the language later.
