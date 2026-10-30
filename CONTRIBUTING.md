# Contributing

Issues and pull requests are welcome: a new skill, a fix to a rule, an agent
the installer misses.

- **One change per PR** with a line under `## Unreleased` in `CHANGELOG.md`.
- **Spec first** a new skill or a change to one starts as a file in `specs/`.
- **Skill shape** read `AGENTS.md`. It holds the structure, the size caps and
  the writing rules each skill follows.
- **Checks** run them before you push:

```sh
mise x -- shellcheck install.sh scripts/install-in-temp-home.sh
mise x -- python scripts/check-skills.py
mise x -- python scripts/check-prose-budget.py skills/*/SKILL.md skills/*/references/*.md
sh scripts/install-in-temp-home.sh
```

CI runs the same checks on every PR.
