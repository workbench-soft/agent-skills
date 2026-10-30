# Features

Skills for a coding agent. Each skill is a folder in `skills/` with a `SKILL.md` the agent reads when a request matches.

## Writing

- **What it gives** `writing-style` makes every text the agent writes short and plain.
- **Where** loads by itself before chat answers, commits, PRs and docs.

## Code work

- **What it gives** skills to do a ticket, open a PR, answer review threads, review a PR and audit a whole app.
- **Skills** `implement-ticket`, `create-pr`, `address-comments`, `review`, `app-audit`, `specs`, `git-worktrees`, `reset-history`.

## Project setup

- **What it gives** skills to plan an architecture, set up a monorepo, run commands through mise and speed up JavaScript.
- **Skills** `architecture`, `monorepo`, `mise`, `javascript`, `app-update`.

## Launch and growth

- **What it gives** skills to take a site live with search, ads and Google Play, then find the first users.
- **Skills** `launch`, `seo-setup`, `ads-setup`, `play-release`, `marketing`, `domain-check`.
- **Reddit comments** `reddit-comments` picks hot threads the repo can answer, drafts a human-sounding reply for each, and types it into the comment box in Chrome. The person presses Comment. It needs the Reddit MCP server and Google Chrome.

## Voice at the end of a turn

- **What it gives** the `turn-voice` hook speaks a short line when the agent finishes.
- **Where** `hooks/turn-voice`, Windows only.
- **Pick a voice** `voice-test` plays each `edge-tts` voice by number, so the person can choose one for the hook.

## Install

- **What it gives** one clone linked into each agent on the machine. An edit reaches all of them at once.
- **Where** `install.sh` on macOS and Linux, `install.ps1` on Windows.

## Releases

- **What it gives** a tagged release such as `v2026.10.30.1` for each push to `main` that passes `check`. Its notes list the commits since the release before.
- **Where** the [Releases page](https://github.com/workbench-soft/agent-skills/releases).
- **Limits** notes only, with no files to download.
