# Plan in specs/, docs with every change, launch planned with a new app

## Why

- **Plans get lost** the agent writes the plan in the chat, and it is gone
  after the session.
- **Docs go stale** a change updates the code and leaves the README, the
  architecture and the user flows behind.
- **Launch comes late** a new app gets search, ads, Google Play and marketing
  after it is built, when the layout has no room for ads and the site has no
  privacy page.

## What changes for the user

Every agent, in every repo:

1. Writes the plan to `specs/` and commits it before the code. The plan stays.
2. Updates `README.md`, `docs/architecture.md` and `docs/user-flows.md` in the
   same PR as the code. An app without them gets them.
3. Plans search, ads, Google Play and marketing in the first spec of a new app.

## Changes

- **`writing-style.instructions.md`** new sections: plan first, docs, a new
  app. The frontmatter description names them.
- **`skills/implement-ticket/SKILL.md`** step 4 writes the plan to `specs/`
  and commits it. Step 5 updates the docs.
- **`skills/create-pr/SKILL.md`** the spec goes under Sources.
- **`README.md`** the list of rules the instructions file sets.
- **`install.sh`** the Codex line names the new rules.
- **`CHANGELOG.md`** an entry under Unreleased.

## Steps

1. This plan.
2. The instructions file.
3. `implement-ticket`.
4. `create-pr`.
5. README, installer line, changelog.

## Docs to update

- `README.md`: the rules the instructions file sets.
- This repo holds skills, no app, so it has no architecture or user flow docs.
