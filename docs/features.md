# Features

Skills for a coding agent. Each skill is a folder in `skills/` with a `SKILL.md`. The agent reads it when a request matches the skill's description.

## Writing style

- **Skill** `writing-style`.
- **What it gives** every text the agent writes comes out short and plain: chat, commits, PRs, docs, UI copy. Answer first, one idea per sentence, no em dash, no AI filler.
- **Where** the short rules in `writing-style.instructions.md` load on every turn. The full skill loads before the first piece of text.

Spec: [writing-only-rules](../specs/writing-only-rules.md), [agent-doc-keywords](../specs/agent-doc-keywords.md), [agent-instructions](../specs/agent-instructions.md), [token-budget](../specs/token-budget.md).

## Code review

- **Skill** `review`.
- **What it gives** a review of a PR, a branch or a diff: what it solves, the user flow, the reading order, then one table of every problem with the line, the input that breaks it and the fix.
- **Where** "review this" and a PR link. Comments for the PR stay in English, and the review comes back in the language picked at install.

Spec: [review-skill](../specs/review-skill.md).

## Reviewer lenses

- **Skill** `reviewer`.
- **What it gives** the core that `review` and `app-audit` share. It picks the lenses, starts one subagent per lens and keeps only the findings it can prove.
- **Lenses** bugs, security, architecture, speed, state, UX, reliability, PR size and free libraries over hand-written code. A domain lens such as legal or SEO loads a skill for it.

Spec: [reviewer-core](../specs/reviewer-core.md).

## Pull requests

- **Skill** `create-pr`.
- **What it gives** a PR body under 20 lines: the problem, the solution, related PRs, the code reused and the packages picked. It opens or updates the PR with `gh`.
- **Diagrams** each flow comes as a Before and After pair, with nodes green for new, amber for changed, red for removed and gray for the rest.

Spec: [create-pr-skill](../specs/create-pr-skill.md).

## Review comments

- **Skill** `address-comments`.
- **What it gives** each open review thread gets the smallest commit that does what the thread asked, then a reply with the SHA and one sentence on the fix.
- **Limits** the PR description changes only when a fix changes what the PR does.

Spec: [address-comments-and-implement-ticket](../specs/address-comments-and-implement-ticket.md).

## Ticket to merge

- **Skill** `implement-ticket`.
- **What it gives** a Jira ticket goes from plan to merge. The plan lands in `specs/`, each step gets a commit with the ticket key, and the ticket moves to the matching status.
- **Where** "do PROJ-123". It reads Jira through the Atlassian MCP server or `acli`, and follows the repo's checkout rules: a clean default branch where the repo allows it, otherwise a worktree and a PR.

Spec: [address-comments-and-implement-ticket](../specs/address-comments-and-implement-ticket.md).

## App audit

- **Skill** `app-audit`.
- **What it gives** a check of a whole app in one go. Through `reviewer`, one agent per lens works in its own worktree, proves its findings and commits the safe fixes.
- **Where** "audit the app". The main agent picks each fix onto one branch, runs the checks and the app, and merges the PR. The rest goes to `TODO.md` with the reason.

Spec: [app-audit](../specs/app-audit.md).

## Specs first

- **Skill** `specs`.
- **What it gives** one spec per feature in `specs/<feature>.md`, written before the code. A change adds a dated entry, and a bug fix gets none unless it changes the design, the data or several modules.

Spec: [specs-skill](../specs/specs-skill.md).

## One-pager

- **Skill** `one-pager`.
- **What it gives** a spec, a design doc or a write-up comes in 2 passes: the full text with every fact and open question, then a one-screen summary on top under `## One-pager`.
- **Limits** the one-pager adds no fact of its own, and it changes with the text in the same commit.

Spec: [one-pager](../specs/one-pager.md).

## Commands through mise

- **Skill** `mise`.
- **What it gives** each command runs at the versions the repo pins: a task through `mise run`, any other command through `mise x --`. A new tool goes in `mise.toml` with `mise use`.

Spec: [mise-skill](../specs/mise-skill.md).

## Translations

- **Skill** `translations`.
- **What it gives** each string a person sees reaches every language the app ships, in the same change and in each catalog's tone. English errors from native code or a server map to translated keys.
- **Limits** a test keeps the catalogs on the same keys. The skill picks the i18n tool for the stack.

Spec: [translations-skill](../specs/translations-skill.md).

## Worktrees

- **Skill** `git-worktrees`.
- **What it gives** isolated work gets its own folder beside the repo, with the ignored files it needs, its trust and its dependencies. Your checkout stays as it is.
- **Clean up** once the PR merges, the folder moves to a trash folder in a second and gets deleted in the background. The branch goes, local and remote, and other merged worktrees go with it.
- **No stash** agents in worktrees set work aside with a WIP commit or a patch. The stash is shared by every worktree, so 2 agents could swap their work.

Spec: [git-worktrees-skill](../specs/git-worktrees-skill.md).

## Fast JavaScript

- **Skill** `javascript`.
- **What it gives** JS and TS code with fewer round trips, a smaller bundle and less main thread work: parallel awaits, lazy heavy imports, `Map` lookups, no request data in module scope.
- **Limits** each review finding gives the rule, the line and its cost. The rules come from Vercel's `react-best-practices`, minus the React and Next.js parts.

Spec: [javascript-skill](../specs/javascript-skill.md).

## Architecture

- **Skill** `architecture`.
- **What it gives** the smallest shape for an app, a monorepo or a web platform. Packages sit in layers that import downward, and lint or CI enforces each rule.
- **Where** the design lands in `docs/architecture.md` with diagrams and a decision for each choice. A restructure draws Before and After diagrams.

Spec: [architecture-skill](../specs/architecture-skill.md).

## Monorepos

- **Skill** `monorepo`.
- **What it gives** one repo for the web apps, the mobile apps and the backend: the task runner, one native workspace per language, pinned tools and one API schema with a generated client per platform.
- **CI** affected runs, a remote cache and a deploy per app. Old repos move in with their history.

Spec: [monorepo-skill](../specs/monorepo-skill.md).

## History reset

- **Skill** `reset-history`.
- **What it gives** one fresh initial commit with the same files as the default branch. A bundle of the old history stays outside the repo.
- **Limits** it asks once, then force pushes with a lease. Other clones, forks and secrets to rotate go to `TODO.md`.

Spec: [reset-history-skill](../specs/reset-history-skill.md).

## Rewrite a repo

- **What it gives** `rewrite-repo` renames files and functions, moves folders and rewrites the docs, with the same behaviour.
- **Limits** ends with a single fresh commit in place of the history.

Spec: [rewrite-repo-skill](../specs/rewrite-repo-skill.md).

## Help on a site

- **What it gives** `guide-on-site` opens each screen in the person's Chrome, fills the known fields and stops at the login, the secret or the payment.
- **Limits** the person types passwords and card numbers.

Spec: [move-from-private](../specs/move-from-private.md).

## Hung runs

- **What it gives** `hung-process` finds the dev tool that holds a port or a lock, ends its process tree and reruns the step.
- **Limits** Windows only. An "Access is denied" gets an elevated command for the person.

Spec: [move-from-private](../specs/move-from-private.md).

## Search setup

- **Skill** `seo-setup`.
- **What it gives** a site found in search. It finds where DNS sits, audits the live site and the repo, fixes the code, then sets up Cloudflare Web Analytics, Google Search Console and Bing with you logged in.

Spec: [launch-skills](../specs/launch-skills.md).

## Ads

- **Skill** `ads-setup`.
- **What it gives** AdSense on a site and AdMob in an Android app, with test ads in debug, the consent message and the Play Console ads and data safety answers.
- **Before review** an app site first gets a home page with 300 words of visible text and 5 content pages, since a reviewer who sees only a map or a button refuses the account.
- **Your own device** the app hides ads on the developer's phone in every build, with a switch in the app to show them.

Spec: [launch-skills](../specs/launch-skills.md).

## Google Play release

- **Skill** `play-release`.
- **What it gives** a signed bundle with a new version code on Google Play internal testing, and the tester link back. The upload key stays outside the repo.
- **Limits** a site with no app MAY become one through Bubblewrap.

Spec: [launch-skills](../specs/launch-skills.md).

## Launch in one run

- **Skill** `launch`.
- **What it gives** `seo-setup`, `ads-setup` and `play-release` in order, with the shared questions asked once. It ends with a table of each service, its state and the next step.

Spec: [launch-skills](../specs/launch-skills.md).

## Marketing

- **Skill** `marketing`.
- **What it gives** the first users, starting from the budget. It writes the message and a launch calendar, signs up and posts on Reddit, Hacker News and the forums that fit, and replies to comments.
- **Where** the plan sits in `docs/marketing.md`, where the next run picks up the calendar.

Spec: [launch-skills](../specs/launch-skills.md).

## In-app updates

- **Skill** `app-update`.
- **What it gives** an app installed outside a store updates itself from GitHub releases: a check at launch and on resume, a Check for updates button, a download bar with a cancel cross and a notification.
- **Limits** the code stays out of the Google Play build.

Spec: [app-update-skill](../specs/app-update-skill.md).

## Names and domains

- **Skill** `domain-check`.
- **What it gives** names for a business, an app or a site, checked by a script against `.com`, `.com.au` and `.au`, the Australian Business Register and IP Australia trade marks.
- **Limits** the answer is a table of free, risky and taken names. It needs no API keys.

Spec: [domain-check](../specs/domain-check.md).

## Legal risks

- **Skill** `legal-check`.
- **What it gives** a scan for dependency licenses, data SDKs, sensitive permissions and missing legal pages, then each risk rated in `docs/legal-risks.md`. The safe fixes ship in a PR.
- **Limits** the report flags risks for a lawyer to read. It gives no legal advice.

Spec: [legal-check](../specs/legal-check.md).

## App icons

- **Skill** `icon-styles`.
- **What it gives** 10 icons for the repo's app, each in a style picked for its theme, in a picker in the chat. A click selects one, and buttons send Use, Redo with a comment, or Draw 10 new styles. Without chat widgets, a local page does the same.
- **Where** the drafts stay in `design/icons/<date>/`. A script exports the pick to PNG, `.ico`, Android, iOS, Expo and PWA sets. The pick shows beside the app name in the header, the home page and the site nav, and `store-media` then updates Google Play, AdMob and AdSense.
- **Limits** the agent draws flat SVG shapes by hand, and the export needs `resvg` through mise.

Spec: [icon-styles](../specs/icon-styles.md).

## Demo screenshots

- **Skill** `demo-media`.
- **What it gives** the app runs with made-up demo data, and the agent takes screenshots and short videos, checks each frame for real people and private data, and shows them in the README.
- **Where** the media sits in `docs/screenshots/` and the shot list in `demo/shots.json`, so a rerun takes the same shots.

Spec: [demo-media](../specs/demo-media.md).

## Store media

- **Skill** `store-media`.
- **What it gives** the same media and the icon reach Google Play, the site, the GitHub preview and each installer. It asks before any send for review.
- **Limits** Play takes a YouTube link for the video. AdMob and AdSense take no media, so the skill only checks them.

Spec: [demo-media](../specs/demo-media.md).

## End to end walk of a release

- **Skill** `e2e-walk`.
- **What it gives** the newest release installed on an emulator or a phone, or the web build or desktop installer, then each main flow walked with pass or fail and a screenshot of each failure.
- **No data lost** the agent skips each control that deletes, resets, signs out, sends or pays. Bugs go to `TODO.md`, and the flow list stays in `e2e/flows.json`.

Spec: [e2e-walk](../specs/e2e-walk.md).

## Hear and pick a voice

- **Skill** `voice-test`.
- **What it gives** each `edge-tts` voice says its number and name, then English, Russian, a mixed line and the mix joined from chunks.
- **Where** ask the agent, double click `voice-test.cmd` for a page in an Edge app window, or run `voice_test.py` with flags.
- **Limits** the page needs Node 24 and the network, and the double click is Windows only.

Spec: [voice-test](../specs/voice-test.md).

## Reddit comments

- **Skill** `reddit-comments`.
- **What it gives** hot threads the repo can answer, a short human reply for each, typed into the comment box in Chrome. The person reads it and presses Comment.
- **Limits** it needs the Reddit MCP server and Google Chrome.

Spec: [reddit-comments](../specs/reddit-comments.md).

## Voice at the end of a turn

- **What it gives** the `turn-voice` hook plays a cue and speaks the folder, the outcome and the session title when the agent finishes.
- **Where** `hooks/turn-voice`, on Windows and macOS, for Claude Code, Codex and Kimi Code. A Mac plays it through `afplay`, with a short gap between the cue and the voice. Kimi sends no reply in the hook, so the hook reads it from the session's `wire.jsonl`.
- **Outcomes** the marker on the last line picks the cue and the phrase: done, user steps, question, running or not done.
- **Pitch** `hooks\turn-voice\install.ps1 -RuPitch -10 -EnPitch 5` moves each voice up or down in Hz. The root `install.ps1` takes no pitch, and its rerun keeps the one set here. A Mac takes `node hooks/turn-voice/install-mac.mts --ru-pitch -10 --en-pitch 5`.

Spec: [session-end](../specs/session-end.md).

## Install

- **What it gives** one clone linked into each agent on the machine. An edit reaches all of them at once, and a `git pull` links new skills by itself.
- **Where** `install.sh` on macOS and Linux, `install.ps1` on Windows.

Spec: [install](../specs/install.md), [install-auto-link](../specs/install-auto-link.md).

## Agent hooks

- **What it gives** the time on each prompt, the Chrome only hook and the archive block in Claude Code, and the time hook in Codex and Kimi Code.
- **MCP copy** the user MCP servers of Claude Code go to Codex and Kimi Code.
- **Limits** needs Node 24. An install from `agent-skills-private` left its own markers, and the install takes those blocks over.

Spec: [claude-hooks](../specs/claude-hooks.md), [any-agent](../specs/any-agent.md).

## Releases

- **What it gives** a tagged release such as `v2026.10.30.1` once `check` passes on a push to `main`. Its notes list the commits since the release before.
- **Where** the [Releases page](https://github.com/workbench-soft/agent-skills/releases).
- **Limits** notes only, with no files to download.

Spec: [releases](../specs/releases.md).
