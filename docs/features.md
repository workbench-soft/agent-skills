# Features

Skills for a coding agent. Each skill is a folder in `skills/` with a `SKILL.md` the agent reads when a request matches.

## Writing

- **What it gives** `writing-style` makes every text the agent writes short and plain.
- **Where** loads by itself before chat answers, commits, PRs and docs.

## Code work

- **What it gives** skills to do a ticket, open a PR, answer review threads, review a PR and audit a whole app.
- **Skills** `implement-ticket`, `create-pr`, `address-comments`, `review`, `app-audit`, `specs`, `git-worktrees`.

## Project setup

- **What it gives** skills to plan an architecture, set up a monorepo, run commands through mise and speed up JavaScript.
- **Skills** `architecture`, `monorepo`, `mise`, `javascript`, `app-update`.

## Launch and growth

- **What it gives** skills to take a site live with search, ads and Google Play, then find the first users.
- **Skills** `launch`, `seo-setup`, `ads-setup`, `play-release`, `marketing`, `domain-check`.

## Voice at the end of a turn

- **What it gives** the `turn-voice` hook speaks a short line when the agent finishes.
- **Where** `hooks/turn-voice`, Windows only.

## Install

- **What it gives** one clone linked into each agent on the machine. An edit reaches all of them at once.
- **Where** `install.sh` on macOS and Linux, `install.ps1` on Windows.
