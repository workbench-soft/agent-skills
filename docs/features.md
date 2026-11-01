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
- **Legal risks** `legal-check` scans a repo for dependency licenses, data SDKs, sensitive permissions and missing legal pages, then rates each risk in `docs/legal-risks.md`. It fixes the safe ones in a PR. The report is a signal for a lawyer, not advice.
- **Reddit comments** `reddit-comments` picks hot threads the repo can answer, drafts a human-sounding reply for each, and types it into the comment box in Chrome. The person presses Comment. It needs the Reddit MCP server and Google Chrome.

## App icons

- **What it gives** `icon-styles` draws 10 icons for the repo's app, each in a style picked for its theme, and shows them in a picker in the chat. A click selects one, and buttons send Use, Redo with a comment, or Draw 10 new styles. Without chat widgets, a small local page does the same.
- **Where** the drafts stay in `design/icons/<date>/` in every repo, committed with the pick. A script exports the pick to PNG, `.ico`, Android, iOS, Expo and PWA sets.
- **Limits** the agent draws flat SVG shapes by hand, and the export needs `resvg` through mise. macOS `.icns` needs `iconutil` on a Mac.

## Demo screenshots and store media

- **What it gives** `demo-media` runs the app with made-up demo data, takes screenshots and short videos, checks each frame for real people and private data, and shows them in the README. `store-media` uploads the same media and the icon to Google Play, checks AdMob and AdSense, and swaps the icon in every other place.
- **Where** the media sits in `docs/screenshots/` and the shot list in `demo/shots.json`, so a rerun takes the same shots. The `marketing` skill attaches them to Reddit posts.
- **Limits** a README plays a GIF and links the MP4. Play takes a YouTube link for the video. AdMob and AdSense take no media, so they read it from the Play listing and the site.

## End to end walk of a release

- **What it gives** `e2e-walk` installs the newest release and walks each main flow of the app, then reports pass or fail per flow with a screenshot of each failure. Bugs go to `TODO.md`.
- **Where** Archon's Repos tab runs it as E2E walk in each ticked repo. The flow list stays in `e2e/flows.json`, so a rerun walks the same flows.
- **No data lost** the agent skips each control that deletes, clears, resets, signs out, sends or pays, and cancels each confirm dialog. Rows it adds start with `E2E` and stay for the person to remove.
- **Limits** an unlabelled icon gets skipped, and so does a flow behind a sign in. The stop words are a rule the agent follows, with no lock in the app behind them.

## Voice at the end of a turn

- **What it gives** the `turn-voice` hook speaks a short line when the agent finishes.
- **Where** `hooks/turn-voice`, Windows only.
- **Outcomes** the last marker of the turn picks the cue and the phrase: done, user steps, question, running or not done. `!!!USER STEPS!!!` rings a doorbell and says the person's steps wait.
- **Pick a voice** `voice-test` plays each `edge-tts` voice by number, so the person can choose one for the hook.
- **Pitch** `install.ps1 -RuPitch -10 -EnPitch 5` moves each voice up or down in Hz. A reinstall keeps the pitch.

## Hear and pick a voice

- **What it gives** `voice-test` plays each `edge-tts` voice: its number and name, then English, Russian, a mixed line and the mix joined from chunks.
- **Where** ask the agent to play the voices, double click `voice-test.cmd` for a page in an Edge app window, or run `voice_test.py` with flags.
- **Filters** one line with `--line`, women, men or children with `--group`, names with `--voice`, locales with `--lang`, a pitch in Hz with `--pitch`. The page has the same filters, a pitch slider and a dropdown with a checkbox tree, where a group's box ticks all its voices.
- **Limits** `edge-tts` gives no age past the child `Cartoon` voices, and no child voice reads Russian. The page needs Node 24 and the network for the Web Awesome tree, and the double click is Windows only.

## Install

- **What it gives** one clone linked into each agent on the machine. An edit reaches all of them at once.
- **Where** `install.sh` on macOS and Linux, `install.ps1` on Windows.

## Releases

- **What it gives** a tagged release such as `v2026.10.30.1` for each push to `main` that passes `check`. Its notes list the commits since the release before.
- **Where** the [Releases page](https://github.com/workbench-soft/agent-skills/releases).
- **Limits** notes only, with no files to download.
