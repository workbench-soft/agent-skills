---
name: add-skill
description: Use in the agent-skills repo when the user asks to add a new shared skill, change or split one in skills/, move a section to a reference file, or fix a failing check. Writes the skill to the rules in AGENTS.md, runs the skill and prose checks and the temp home install, and relinks the skills on this machine.
---

# Add or change a shared skill

The skills in `skills/` reach every agent on the machine through `install.sh`. Repo skills for one app belong in that app's `.agents/skills/`, not here.

## 1. Write it

1. Read `AGENTS.md` here and load `writing-style`.
2. Put the skill in `skills/<name>/SKILL.md`: frontmatter, then the steps in the order the agent runs them.
3. The `description` names when the skill fires, with trigger phrases in English and Russian, and what it produces. It stays under 1024 characters.
4. Detail for one branch of the work goes to `skills/<name>/references/<topic>.md`. `SKILL.md` says when to read it.
5. Work with a fixed result goes into a script beside the skill, which `SKILL.md` runs.

## 2. Check

```sh
mise x -- python scripts/check-skills.py
mise x -- python scripts/check-prose-budget.py skills/*/SKILL.md skills/*/references/*.md
mise x -- shellcheck install.sh scripts/install-in-temp-home.sh
sh scripts/install-in-temp-home.sh
```

Each MUST exit 0. Then run the "Before you commit" list in `AGENTS.md`.

## 3. Ship

- **Commit** the subject starts with the skill: `review: ...`.
- **Changelog** a line under `## Unreleased` in `CHANGELOG.md`.
- **Relink** after the merge, run `./install.sh` from the main checkout, so the agents on this machine get a new skill. A changed skill reaches them through the existing link.
