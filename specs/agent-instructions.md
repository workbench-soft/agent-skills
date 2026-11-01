# Agent instructions

## What it does for the person

The shared rules every agent follows: specs, docs, the ship flow and TODO.md.

## User flows

- **Any change** goes through a worktree, a PR with a changelog entry and a merge on green CI.
- **Left over** goes to `TODO.md` in English.
- **Audit** app-audit reviews a whole app and fixes what it finds.
- **Updates** app-update adds in-app updates from GitHub releases.

## How it works: modules, files, data

Each entry below names the files it changed.

## Limits

None written down yet.

## Changes

### 2025-10-28 Plan in specs/, docs with every change, launch planned with a new app

#### Why

- **Plans get lost** the agent writes the plan in the chat, and it is gone
  after the session.
- **Docs go stale** a change updates the code and leaves the README, the
  architecture and the user flows behind.
- **Launch comes late** a new app gets search, ads, Google Play and marketing
  after it is built, when the layout has no room for ads and the site has no
  privacy page.

#### What changes for the user

Every agent, in every repo:

1. Writes the plan to `specs/` and commits it before the code. The plan stays.
2. Updates `README.md`, `docs/architecture.md` and `docs/user-flows.md` in the
   same PR as the code. An app without them gets them.
3. Plans search, ads, Google Play and marketing in the first spec of a new app.

#### Changes

- **`writing-style.instructions.md`** new sections: plan first, docs, a new
  app. The frontmatter description names them.
- **`skills/implement-ticket/SKILL.md`** step 4 writes the plan to `specs/`
  and commits it. Step 5 updates the docs.
- **`skills/create-pr/SKILL.md`** the spec goes under Sources.
- **`README.md`** the list of rules the instructions file sets.
- **`install.sh`** the Codex line names the new rules.
- **`CHANGELOG.md`** an entry under Unreleased.

#### Steps

1. This plan.
2. The instructions file.
3. `implement-ticket`.
4. `create-pr`.
5. README, installer line, changelog.

#### Docs to update

- `README.md`: the rules the instructions file sets.
- This repo holds skills, no app, so it has no architecture or user flow docs.

### 2025-10-28 Ship rules, TODO.md, app-update and app-audit skills

Done on 2025-10-28, before the history was reset to one commit. The old commits sit under `refs/backup/main` in the local backup mirror of `agent-skills`.

#### Why

Agents left work half done and changes sat unmerged.

#### User flows it touches

- **Any change** goes through a worktree, a PR with a changelog entry and a merge on green CI.
- **Left over** goes to `TODO.md` in English.
- **Audit** app-audit reviews a whole app and fixes what it finds.
- **Updates** app-update adds in-app updates from GitHub releases.

#### Changes

- **`writing-style.instructions.md`** changed.
- **`install.sh`** changed.
- **`skills/app-audit/SKILL.md`** new.
- **`skills/app-audit/references/verify.md`** new.
- **`skills/app-update/SKILL.md`** new.
- **`skills/app-update/references/stacks.md`** new.
- **`skills/app-audit/references/briefs.md`** new.
- **`skills/app-audit/references/triage.md`** new.

#### Steps, in commit order

1. instructions: list work left undone in TODO.md, in English (cc79bbe, 2025-10-28)
2. app-update: add a skill for in-app updates from GitHub releases (aeafd45, 2025-10-28)
3. instructions: ship every change through a worktree and a PR that merges on green CI (2d2e305, 2025-10-28)
4. instructions: add a changelog entry to every PR (4c742bc, 2025-10-28)
5. app-audit: add a skill that audits a whole app and fixes what it finds (3c9836d, 2025-10-28)
6. app-audit: merge the PR on green CI, with no force push (26021aa, 2025-10-28)

#### Docs to update

- `AGENTS.md`
- `CHANGELOG.md`
- `README.md`
