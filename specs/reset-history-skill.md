# A skill that resets a repo's history to one fresh initial commit

## What it does for the person

- **Ask** the owner wants the whole git history of a repo gone, with the
  files as they are now in one new initial commit.
- **Risk** the reset rewrites the default branch with a force push. Old
  branches, tags, open PRs and other clones still hold the old commits, and a
  missed step leaves the history in place or loses work.
- **Gap** no skill here covers it. The ship rule bans force push, so the skill
  has to say when and how this one push is allowed.

## User flows

None written down yet.

## How it works: modules, files, data

Each entry below names the files it changed.

## Limits

None written down yet.

## Changes

### 2025-10-29 A skill that resets a repo's history to one fresh initial commit

#### Why

- **Ask** the owner wants the whole git history of a repo gone, with the
  files as they are now in one new initial commit.
- **Risk** the reset rewrites the default branch with a force push. Old
  branches, tags, open PRs and other clones still hold the old commits, and a
  missed step leaves the history in place or loses work.
- **Gap** no skill here covers it. The ship rule bans force push, so the skill
  has to say when and how this one push is allowed.

#### User flows it touches

1. The user asks to reset the history or squash the repo into one commit.
2. The agent loads `reset-history`, reads the repo and lists what the reset
   touches: branches, tags, releases, open PRs, branch rules, forks.
3. It saves a bundle of the whole repo outside it, as the way back.
4. It builds one commit from the default branch's tree, checks the tree is the
   same, and asks once for a yes before the push.
5. It pushes with a lease, puts back any branch rule it lifted, and cleans up
   the old branches, tags and local objects the user agreed to.
6. It resets the user's checkout, checks CI on the new commit, and writes
   `TODO.md` with what only a person can do.

#### Changes

- **`skills/reset-history/SKILL.md`** the steps: read, inventory, backup,
  build the commit, confirm, push, clean up, check, leftovers.
- **`skills/reset-history/references/github.md`** reading and lifting branch
  protection and rulesets, and what GitHub keeps after a force push.
- **`README.md`** the skill under What you get, a line under Use it.
- **`CHANGELOG.md`** an entry under Unreleased.

#### Steps, in commit order

1. This plan.
2. The skill and its reference file.
3. README and changelog.

#### Docs to update

- `README.md`: the new skill and a prompt for it.
- This repo holds skills, no app, so it has no architecture or user flow docs.
