# agent-skills

Skills for a coding agent: write like a person, review code, do a ticket, open
a pull request and answer the review threads. One skill audits a whole app and
fixes what it finds. Another set takes a site live with search, ads and Google
Play, then brings in the first users.

## Install

The skills work in Claude Code, Codex, Cursor, Copilot, Windsurf, Goose and
about 50 other agents. The installer finds each one on the machine and links
the skills into it.

Every agent links to one clone. An edit to a rule there reaches them at once.

### Windows

In PowerShell:

```powershell
git clone https://github.com/workbench-soft/agent-skills "$HOME\.agent-skills"
powershell -ExecutionPolicy Bypass -File "$HOME\.agent-skills\install.ps1" -Lang English
```

The script finds the bash that ships with Git for Windows and runs the same
installer through it. Without Git, it installs Git through `winget` first. The
macOS lines below also work unchanged in Git Bash.

- **Developer Mode** MAY stay off. The agents then get a junction to each
  skill folder, and a copy of the writing rules file.
- **While it is off** rerun the install after each edit to
  `writing-style.instructions.md`, so the copy stays current.
- **Turning it on** Settings, then System, then For developers. The next
  install then makes real symlinks.

### macOS and Linux

```sh
git clone https://github.com/workbench-soft/agent-skills ~/.agent-skills
~/.agent-skills/install.sh --lang English
```

It needs `git` and a POSIX shell, and a Mac comes with both.

### Take only one skill

Each skill is a folder with a `SKILL.md`. Copy `skills/<name>` into your
agent's skills folder, such as `~/.claude/skills/`, and it works alone.
`review`, `create-pr` and a few more load `writing-style`, so copy that one
too.

### What it does

The command keeps one folder on disk and links it into each agent installed on
the machine: Claude Code, Codex, Cursor, Copilot, Crush, Goose, Roo, Windsurf
and others. The writing rules also land where an agent reads them on every
turn, unasked: the VS Code prompts folder, `~/.claude/CLAUDE.md`,
`~/.codex/AGENTS.md`. On Windows `~` means your user folder, and VS Code reads
`%APPDATA%\Code\User\prompts`. The rules file holds the short version of
`writing-style`, so each answer follows it before the skill loads.

- **Spoken turn end** on Windows, `install.ps1` gives Claude hooks that play
  a cue and say the folder, the outcome and the session title. The outcome
  comes from a marker on the last line, such as `!!!COMPLETED!!!` or
  `!!!QUESTION!!!`, when your own rules ask the agent to write one.
- **Voice language** English by default, apart from the review language,
  read by `en-GB-MaisieNeural`. `install.ps1 -VoiceLang Russian` switches the
  phrases to Russian.
- **What it adds for the voice** hooks in `~/.claude/settings.json`,
  `turn-voice.exe` in `~/.claude/hooks`, and `uv` and `edge-tts` in your
  global mise config when mise is installed.

New skills reach the agents by themselves. The installer adds git hooks to
the folder the agents link to. After a `git pull`, `merge`, `checkout` or
`rebase` there, the hooks link each new skill and drop links to removed ones.

- **Language** the hooks reuse the one you picked.
- **Your own hook** in that folder is left alone. A pull then needs an install
  rerun by hand.

Rerun it after installing a new agent, or to switch language.

`--lang`, or `-Lang` in PowerShell, sets the language your code review comes
back in. Any language works:

```sh
~/.agent-skills/install.sh --lang Russian
~/.agent-skills/install.sh --lang 日本語
```

```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\.agent-skills\install.ps1" -Lang Russian
```

Comments for the PR MUST stay in English, since the whole team reads them.

`review`, `create-pr`, `address-comments`, `implement-ticket` and `app-audit`
also read pull requests through `gh`. `implement-ticket` reads Jira as well,
through the Atlassian MCP server or `acli`.

## What you get

**`writing-style`** tidies every line a person reads: chat, comments, commits,
PRs, docs, UI copy. It asks for plain words, the answer first and one idea per
sentence, with no em dash and no AI filler. It sets the layout too: bullets in
place of paragraphs, each led by its point in bold, and no block past three
lines.

**`review`** reads a PR, a branch or a diff. It says what the change solves,
draws the user flow and what each file does, and gives the order to read the
files in. Then comes one table of every problem, and each problem in detail:
the line number, the input that breaks it, the fix. Each one ends with a short
comment ready to paste on the line. When posted, the comments go up with a
verdict: approve, request changes for a real blocker, or comments only.

**`create-pr`** writes the PR description and opens the PR with `gh`. The
description holds the problem, the solution and a diagram of the user flows.
It adds what to type and expect from any new command, and links to the designs
and docs the work used. It also lists the code reused, the packages added and
the commands that generated code.

**`address-comments`** works through the open review threads on a PR. Each
thread gets the smallest commit that does what the thread agreed on. Then it
gets a reply with the SHA and one sentence on the fix. The skill pushes and
replies without asking.

**`implement-ticket`** carries a Jira ticket to review, in a new worktree off
the latest `main` or `master`. It makes the smallest change that does the job,
split into modules, with one commit per step carrying the ticket key. Then it
opens the PR through `create-pr` and moves the ticket to In Review.

**`specs`** keeps one spec per feature in `specs/<feature>.md`, written before
the code. Work on a feature with a spec adds a dated entry to that file, and a
further tweak in the same session extends the entry. A bug fix gets no spec,
unless it changes the design, the data or several modules.

**`mise`** runs each command through mise, so tools come at the versions the
repo pins. A mise task runs with `mise run`, any other command with
`mise x --`. A new tool goes in `mise.toml` with `mise use`, in place of
`brew`, `winget` or `npm i -g`.

**`app-audit`** checks a whole app in one go, without questions. Reviewers run
in parallel, one per angle:

- **Code** bugs, simplicity and tests, architecture and data formats.
- **Safety** security and privacy, dependencies and CI.
- **The person** speed, UX and accessibility, reliability offline.
- **Mobile** the platform and its store.

The agent checks each finding against the code and fixes the safe ones in a
new worktree, one commit each. It runs the checks, a build and the app itself,
and has a fresh reviewer read its own diff. Then it opens the PR and merges it
when CI is green. Migrations, product calls and anything touching money or
keys go in `TODO.md` with the reason.

**`git-worktrees`** puts each piece of work in its own folder, and your
checkout stays as it is. It copies the ignored files the app needs, such as
`.env` and certificates, installs the dependencies and runs the app on a port
of its own. When the PR merges it removes the folder and the branch, local and
remote, and clears other merged worktrees as it goes. `implement-ticket`,
`app-audit` and `review` rely on it.

**`javascript`** keeps JS and TS code fast and safe. Independent calls run
together, request data stays out of shared module state, and lookups go
through a `Map`. Heavy imports load when the user opens the feature. Micro
rewrites a modern engine already does are left alone. The rules come from
Vercel's
[`react-best-practices`](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices)
(MIT), minus the React and Next.js parts.

**`architecture`** lays out an app, a monorepo or a web platform. It picks the
smallest shape the teams need: one app, packages in a monorepo, or micro
frontends behind a shell and edge workers. Packages sit in layers that import
downward, and each piece of shared page state has one owning package. Each
rule turns into a generator, a lint rule or a CI check. The design goes in
`docs/architecture.md`, with diagrams and the options weighed. The techniques
come from a production Nx monorepo of micro frontends. The workspace setup
itself goes to `monorepo`.

**`monorepo`** sets up one repo for the web apps, the mobile apps and the
backend. It picks the task runner and keeps one native workspace per language:
pnpm, Gradle, Swift packages, `go.work`, uv. Every tool version gets pinned in
`mise.toml`, and one API schema gives each platform a generated client. Expo
or native mobile, Docker images for services and CI with affected runs, a
remote cache and a deploy per app come with it. Old repos move in with their
history.

**`reset-history`** wipes a repo's git history and leaves one fresh initial
commit with the same files. It saves a bundle of the old history outside the
repo first, then asks once before the push.

- **Same files** the new commit takes the tree of the default branch, and the
  agent checks the two match.
- **Safe push** a force push with a lease, so a commit pushed in the meantime
  stops it. A branch rule lifted for the push goes back right after.
- **Clean up** old branches, tags and local objects go on your yes.
- **Leftovers** other clones, forks, secrets to rotate and what GitHub keeps
  go in `TODO.md`.

**`seo-setup`** gets a site found in search. It finds where the domain lives,
Cloudflare first. It audits the live site for tags, sitemap, structured data
and the pages ad review asks for, and fixes the gaps in code. Then it goes
through Cloudflare Web Analytics, Google Search Console and Bing in the
browser, and plans the content.

**`ads-setup`** adds AdSense to the site and AdMob to an Android app. Debug
builds get test ads, the consent message goes live, and the Play Console ads
and data safety pages get filled in. A Trusted Web Activity app hides
AdSense, because the policy bans it inside apps.

**`play-release`** brings an Android app to Google Play internal testing. It
finds or makes the upload key outside the repo and builds a signed bundle.
Then it creates the app in Play Console, rolls it out to testers and hands
back the join link. A site with no app MAY turn into one through Bubblewrap.

**`app-update`** lets an app installed outside a store update itself from
GitHub releases. It checks on each start, and a Check for updates button says
when it is checking and what it found. The download shows percent, MB, a bar
and a cancel cross in the header. A notification says when the update is
ready.

**`launch`** runs `seo-setup`, `ads-setup` and `play-release` in order and asks
the shared questions once. It ends with one table: each service, its state,
the next step.

**`marketing`** finds the first users for someone new to marketing. It asks
for the budget first, then shows what that money buys and what the next tier
adds. It writes the message and a launch calendar, and readies the site for
visitors. It registers on Reddit, Hacker News and the forums that fit, posts,
answers comments and writes to journalists. The plan goes in
`docs/marketing.md`, where the next run picks up the calendar.

**`domain-check`** finds a free name for a business, an app or a site. It
suggests names for the topic and checks them in batches with a Python script:
`.com`, `.com.au` and `.au`, the Australian Business Register and the IP
Australia trade marks. The answer is a table of free, risky and taken names,
and the picks with the reason for each. It needs no API keys.

**`icon-styles`** draws 10 icons for the app in the repo, each in its own
style. It reads the repo first and picks the styles that fit, such as neon for
a hacker tool. A picker in the chat shows all 10 at 16 to 96 px. You click
one and press Use, or ask for a redo with a comment. An agent without chat
widgets serves the same picker as a local page. A Python script then writes
the PNG sizes, the Windows
`.ico` and the Android, iOS and PWA sets through `resvg`. All 10 drafts stay
in the repo under `design/icons/<date>/`.

**`voice-test`** plays the Microsoft neural voices of `edge-tts` one after
another. Each says its number and name, then an English line, a Russian line,
a line that mixes both, and the same mix joined from chunks the way
`turn-voice` builds it. You note the numbers you like and pick a voice for
`turn-voice` or an app.

On Windows, double click `skills/voice-test/scripts/voice-test.cmd`. A page
opens in its own Edge window, with no tabs and no console windows. Pick the
line, women, men or children and the languages, then tick the voices in the
dropdown. It holds a checkbox tree: a group's box ticks or unticks all its
voices, and a group with part of them on shows a half tick. A search box and
All and None sit on top. Play starts them, the page
shows the voice that speaks, and Stop ends it. The page keeps your choices
for the next time. A desktop shortcut can point to the copy in
`~/.agents/skills/voice-test/scripts`.

Elsewhere, run `mise x -- node server.ts` in `skills/voice-test/ui`. It opens
the page in the default browser. `server.ts` is a Node 24 server with no
packages. It serves `index.html` and `app.ts`, which loads the Web Awesome
tree from jsDelivr, runs `voice_test.py` for the
list and the playback, and quits a few seconds after the page closes.

The same choices work from the terminal:

```bash
mise x -- python skills/voice-test/scripts/voice_test.py --line chunks --group female,child
```

| Flag | What it does |
| --- | --- |
| `--line en\|ru\|mix\|chunks` | each voice says only that line |
| `--group female,male,child` | only those groups. A child voice is a `Cartoon` one |
| `--voice Ava,Emma` | only voices whose name holds a word |
| `--lang en,ru` | those locales, plus the multilingual voices |
| `--start 12 --count 5` | resume at a number, stop after a few |

The clips stay in `%LOCALAPPDATA%\voice-test`, so a second run plays without
the network. It needs `edge-tts` on `PATH`, and Node 24 for the page.

**`reddit-comments`** finds Reddit threads your repo can answer and gets the
reply as far as the Comment button. It reads the hot threads through the
Reddit MCP server, keeps the ones where a question matches a practice in the
repo, and writes a short comment in a human voice for each. A Playwright
script then opens each thread in Chrome and types the draft into the comment
box. You read it and press Comment.

These skills open dashboards in the agent's browser and ask you to log in
there. They don't type passwords or card details. Each leaves `TODO.md` in the
repo with the tasks still yours and the dates to check back.

`review`, `create-pr`, `address-comments`, `implement-ticket` and `app-audit`
load `writing-style` first, so their writing matches.

## What a review looks like

The review opens with a table, so the whole verdict fits on one screen:

| # | Severity | Where | What |
| --- | --- | --- | --- |
| 1 | Blocker | `SaveName.tsx:42` | the typed name is lost when the save is slow |
| 2 | Should fix | `profile.ts:88` | the save error is swallowed, so the page stays silent |
| 3 | Nit | `SaveName.tsx:20` | no code reads the `isLoading` flag |

<details>
<summary>One finding out of that table</summary>

### 1. Blocker: the typed name is lost when the server is slow

[src/features/profile/SaveName.tsx:42](src/features/profile/SaveName.tsx#L42) · [on GitHub](https://github.com/acme/shop/blob/9f2c1ab/src/features/profile/SaveName.tsx#L42)

**The name field clears before the server answers, so a failed save loses what
the person typed. Clear it after the answer.**

- **Who hits it** a person opens Settings, types a new name and presses Save.
  No other path reaches this code.
- **Now** line 42 empties the field, then waits for the server:
  `setName(""); await saveName(name);`
- **Comes out** the server answers two seconds later, or fails. The field is
  already empty, so the typed name is neither on screen nor on the server, and
  no message appears. Walked the code with that input.
- **Costs** the person thinks it saved, leaves the page and loses the data. On a
  slow network this is every second try.

Fix, clear the field after the confirmation and leave the text alone on error:

```tsx
const saved = await saveName(name);
if (saved.ok) setName("");
```

**Comment on** line 42, added in this PR, the green side of the diff.

```markdown
this clears the input before saveName comes back - if the save fails the typed
name is gone. can we clear it after the call resolves ok?
```

</details>

The part above the table holds three bullets on what the change solves, two
mermaid diagrams and the reading order. One diagram shows the user flow, the
other what each file does. Each comes with a mermaid.live link, for chats that
show it as code. Below the table come the findings, then a comment ready to
paste on the PR.

## Use it

Ask in plain words:

- "review this" and a PR link
- "open a PR for this branch"
- "do PROJ-123"
- "write a spec for photo upload"
- "clean up the worktrees"
- "install jq through mise"
- "audit the app and fix what you can"
- "why is this page slow"
- "where does this package go" or "split it into micro frontends"
- "set up a monorepo for the web app, the mobile app and the API"
- "reset the history and make a fresh initial commit"
- "address the comments on this PR"
- "rewrite this so it sounds human"
- "set up SEO for this site"
- "add AdSense and AdMob"
- "put the app on Google Play internal testing"
- "launch the site and the app"
- "do the marketing, I can spend $100 a year"
- "suggest a name for a dog grooming van and check the domains"

## Change the language later

Rerun the install with another `--lang` or `-Lang`. A rerun without it keeps
the last language. Each skill keeps a copy in its `LANGUAGE.md`, and the next
install or pull writes them all again, so an edit by hand goes away.

## Remove them

```sh
~/.agent-skills/install.sh --uninstall
```

On Windows, in PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\.agent-skills\install.ps1" -Uninstall
```

It lists the folders it will clear and asks before it deletes. Your own notes
in `CLAUDE.md` and `AGENTS.md` stay, and only the installer's block goes.
`--yes` MAY be added to skip the question.

## Editing the skills

[AGENTS.md](AGENTS.md) sets the rules for each `.md` file here: the prose
budget under `skills/`, when a line earns a `MUST`, and what stays verbatim.
Check a file against the budget, then every skill's frontmatter, links and
banned words:

```sh
mise x -- python scripts/check-prose-budget.py skills/*/SKILL.md skills/*/references/*.md
mise x -- python scripts/check-skills.py
```

## Releases

Each push to `main` that passes `check` gets a release on the
[Releases page](https://github.com/workbench-soft/agent-skills/releases), such
as `v2026.10.30.1`. Its notes list the commits since the release before. The
release carries no files, so the install above stays the same.

## Licence

MIT.
