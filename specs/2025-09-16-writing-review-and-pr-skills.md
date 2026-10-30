# Writing style, review and create-pr skills with one installer

Done from 2025-09-16 to 2025-09-17, before the history was reset to one commit. The old commits sit under `refs/backup/main` in the local backup mirror of `agent-skills`.

## Why

Each agent wrote PRs and reviews its own way. Shared skills give every agent the same rules, and one script links them into each agent.

## User flows it touches

- **Install** one command, piped from curl, links the skills into every agent folder.
- **Write** the writing rules apply to every text an agent writes.
- **PR** create-pr puts the Jira ticket at the top of the body.

## Changes

- **`install.sh`** new.
- **`skills/review/SKILL.md`** new.
- **`skills/writing-style/SKILL.md`** new.
- **`skills/create-pr/SKILL.md`** new.
- **`.github/workflows/check.yml`** new.
- **`writing-style.instructions.md`** new.
- **`.gitignore`** new.
- **`skills/review/references/comment-style.md`** new.
- **`skills/review/references/getting-the-code.md`** new.
- **`skills/review/references/pr-links.md`** new.
- **Other files** 4 more.

## Steps, in commit order

1. Add writing-style, review and create-pr skills (2486416, 2025-09-16)
2. Add installer, make the review language configurable, neutralise examples (54a5631, 2025-09-16)
3. Drop the hardcoded language from the skill descriptions (e6c4f31, 2025-09-16)
4. Shorten the README (ae03899, 2025-09-16)
5. Let install.sh run piped from curl (ea6e3e6, 2025-09-16)
6. Lead the README with the one-line install (f8e6076, 2025-09-16)
7. Stop pointing at one agent's skills folder, add a licence and a CI check (a0cfa5f, 2025-09-16)
8. Fix the CI check so it does not depend on terminal rendering (dae6ff7, 2025-09-16)
9. Make the skills language-neutral, keep Russian as one worked example (793c4cc, 2025-09-16)
10. Split the review skill, add uninstall, accept any language name (26666af, 2025-09-16)
11. One install path: symlinks from every agent to one folder (f2838e9, 2025-09-16)
12. One install path: symlinks from every agent to one folder (6351a3a, 2025-09-16)
13. Name what changed instead of counting it (6f6c38e, 2025-09-16)
14. Wire the writing rules into every agent in the same install (ad0e7fb, 2025-09-16)
15. Keep one blank line before the block on every install (66f3918, 2025-09-16)
16. Cover the wiring in CI and say up front that gh is needed (2efad31, 2025-09-16)
17. Put Jira ticket name atop PR body (a9b3f1d, 2025-09-16)
18. Make the skills output scannable and cap their prose (80b1a16, 2025-09-17)

## Docs to update

- `AGENTS.md`
- `README.md`
