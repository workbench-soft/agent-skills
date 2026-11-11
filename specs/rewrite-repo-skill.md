# A skill that rewrites a whole repo so it reads new and works the same

## What it does for the person

- **Ask** the owner wants a deep refactor of their own repo: new file names,
  new names for the key functions and variables, a new folder layout, modern
  syntax, and every line of prose in the docs and skills said a new way.
- **Result** the code differs from the original in every file, and does the
  same thing: the same tests pass, the same commands give the same output.
- **On the way** flaws found during the rewrite get fixed in the same PR, one
  commit each, and the palette shifts a little with contrast kept.
- **Gap** no skill here covers a whole repo rewrite. `app-audit` fixes
  findings and keeps names as they are.

## User flows

None written down yet.

## How it works: modules, files, data

Each entry below names the files it changed.

## Limits

None written down yet.

## Changes

### 2025-10-28 A skill that rewrites a whole repo so it reads new and works the same

#### Why

- **Ask** the owner wants a deep refactor of their own repo: new file names,
  new names for the key functions and variables, a new folder layout, modern
  syntax, and every line of prose in the docs and skills said a new way.
- **Result** the code differs from the original in every file, and does the
  same thing: the same tests pass, the same commands give the same output.
- **On the way** flaws found during the rewrite get fixed in the same PR, one
  commit each, and the palette shifts a little with contrast kept.
- **Gap** no skill here covers a whole repo rewrite. `app-audit` fixes
  findings and keeps names as they are.

#### User flows it touches

1. The user asks to rewrite or deeply refactor the repo.
2. The agent loads `rewrite-repo`, makes a worktree and records how the repo
   behaves now: tests, build, CLI output, public API.
3. It plans the new layout and a rename map, then moves files, renames
   symbols, updates the syntax and rewrites the prose, one commit per step.
4. It fixes the bugs and slow spots it finds, each in its own commit with a
   test, and turns the colors a few degrees.
5. After each step the checks run and the behaviour must match the baseline,
   apart from the fixes.
6. It opens a PR with the rename map and merges it once CI is green.

#### Changes

- **`skills/rewrite-repo/SKILL.md`** the steps: baseline, plan, layout,
  renames, syntax, fixes, colors, prose, verify, ship.
- **`skills/rewrite-repo/references/code.md`** how to rename, move and
  restyle code per language, and what has to keep its name.
- **`skills/rewrite-repo/references/prose.md`** how to rewrite docs and
  skills without losing meaning, and how to check it.
- **`README.md`** the skill under What you get, a line under Use it.
- **`CHANGELOG.md`** an entry under Unreleased.

#### Steps, in commit order

1. This plan.
2. The skill and its reference files.
3. README and changelog.

#### Docs to update

- `README.md`: the new skill and a prompt for it.
- This repo holds skills, no app, so it has no architecture or user flow docs.

### 2026-11-12 moved to agent-skills

- **Why** a PC without the private repo gets the same setup from the public
  install.
- **Changes** the files move from `agent-skills-private` as they are. The
  install step sits in the public `install.sh`. See
  [move-from-private](move-from-private.md).
