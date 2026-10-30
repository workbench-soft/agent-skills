# Ship rules, TODO.md, app-update and app-audit skills

Done on 2025-10-28, before the history was reset to one commit. The old commits sit under `refs/backup/main` in the local backup mirror of `agent-skills`.

## Why

Agents left work half done and changes sat unmerged.

## User flows it touches

- **Any change** goes through a worktree, a PR with a changelog entry and a merge on green CI.
- **Left over** goes to `TODO.md` in English.
- **Audit** app-audit reviews a whole app and fixes what it finds.
- **Updates** app-update adds in-app updates from GitHub releases.

## Changes

- **`writing-style.instructions.md`** changed.
- **`install.sh`** changed.
- **`skills/app-audit/SKILL.md`** new.
- **`skills/app-audit/references/verify.md`** new.
- **`skills/app-update/SKILL.md`** new.
- **`skills/app-update/references/stacks.md`** new.
- **`skills/app-audit/references/briefs.md`** new.
- **`skills/app-audit/references/triage.md`** new.

## Steps, in commit order

1. instructions: list work left undone in TODO.md, in English (cc79bbe, 2025-10-28)
2. app-update: add a skill for in-app updates from GitHub releases (aeafd45, 2025-10-28)
3. instructions: ship every change through a worktree and a PR that merges on green CI (2d2e305, 2025-10-28)
4. instructions: add a changelog entry to every PR (4c742bc, 2025-10-28)
5. app-audit: add a skill that audits a whole app and fixes what it finds (3c9836d, 2025-10-28)
6. app-audit: merge the PR on green CI, with no force push (26021aa, 2025-10-28)

## Docs to update

- `AGENTS.md`
- `CHANGELOG.md`
- `README.md`
