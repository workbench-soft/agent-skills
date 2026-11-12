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

- **Spoken turn end** `install.ps1` on Windows and `install.sh` on a Mac
  give Claude Code, Codex and Kimi Code hooks that play a cue and say the folder, the outcome and the
  session title. The outcome comes from a marker on the last line, such as
  `!!!COMPLETED!!!`, `!!!USER STEPS!!!` or `!!!QUESTION!!!`, when your own
  rules ask the agent to write one.
- **Voice language** the phrases are in Russian by default, whatever the
  review language. `install.ps1 -VoiceLang English` switches them to English, and
  `TURN_VOICE_LANG=en ./install.sh` does it on a Mac.
- **Voice** the multilingual `de-DE-SeraphinaMultilingualNeural` reads each
  run of Russian or English apart, right after the cue.
- **What it adds for the voice** hooks in `~/.claude/settings.json`,
  `~/.codex/hooks.json` and `~/.kimi-code/config.toml`,
  `turn-voice.exe` in `~/.claude/hooks` on Windows, and `uv` and `edge-tts`
  in your global mise config when mise is installed. A Mac runs
  `hooks/turn-voice/turn-voice.mts` from the clone with Node and plays it
  through `afplay`.
- **What leaves the PC** `edge-tts` sends each phrase, with the folder name
  and the session title, to Microsoft's online read aloud service. Each clip
  is then cached in `%LOCALAPPDATA%\turn-voice`, or
  `~/Library/Caches/turn-voice` on a Mac. Without `edge-tts` only the cue
  plays.

With Node 24 on the PATH, the installer also adds agent hooks. Your own
hooks and tables stay:

- **Time** each prompt in Claude Code, Codex and Kimi Code starts with
  `Now: yyyy-MM-dd HH:mm:ss`, so the agent knows the time.
- **Chrome only** Claude Code can't open its built-in browser, and the
  message sends it to Claude in Chrome. Remove that group from
  `~/.claude/settings.json` to keep the built-in browser.
- **Archive block** Claude Code can't archive a session. You archive each one.
- **MCP copy** the user MCP servers of `~/.claude.json` go to
  `~/.codex/config.toml` and `~/.kimi-code/mcp.json`. Codex asks you to
  trust its hook once, in `/hooks`.

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
files in. The lenses run in parallel subagents through `reviewer`. Then comes
one table of every problem, and each problem in detail:
the line number, the input that breaks it, the fix. Each one ends with a short
comment ready to paste on the line. When posted, the comments go up with a
verdict: approve, request changes for a real blocker, or comments only.

**`create-pr`** writes the PR description and opens the PR with `gh`. The
description holds the problem, the solution and a diagram of the user flows.
Each diagram comes as a Before and After pair, with nodes green for new, amber
for changed and red for removed. It adds what to type and expect from any new
command, and links to the designs and docs the work used. It also lists the
code reused, the packages added and the commands that generated code.

**`address-comments`** works through the open review threads on a PR. Each
thread gets the smallest commit that does what the thread agreed on. Then it
gets a reply with the SHA and one sentence on the fix. The skill pushes and
replies without asking, and updates the PR description when a fix changes
what the PR does.

**`implement-ticket`** carries a Jira ticket through the repo's checkout and
shipping rules. It writes the plan to `specs/` first. It works on a clean
default branch when the repo allows it, otherwise in a new worktree and PR. It
makes the smallest change, updates the docs, commits each step with the ticket
key, then moves the ticket to the matching status.

**`specs`** keeps one spec per feature in `specs/<feature>.md`, written before
the code. Work on a feature with a spec adds a dated entry to that file, and a
further tweak in the same session extends the entry. A bug fix gets no spec,
unless it changes the design, the data or several modules. Each spec opens
with a one-pager.

**`one-pager`** writes a spec, a design doc or a write-up in 2 passes. The
full text comes first, with every fact and decision. Then a one-pager on top
sums it up in one screen, with no fact of its own.

**`mise`** runs each command through mise, so tools come at the versions the
repo pins. A mise task runs with `mise run`, any other command with
`mise x --`. A new tool goes in `mise.toml` with `mise use`, in place of
`brew`, `winget` or `npm i -g`.

**`translations`** keeps each string a person sees in every language the app
ships, in the same change. It picks the i18n tool for the stack, matches the
tone of each catalog and maps English errors from native code to translated
keys. A test keeps the catalogs on the same keys.

**`reviewer`** is the core that `review` and `app-audit` share. It picks the
lenses, starts one subagent per lens on the strongest model and checks each
finding before it goes on:

- **Lenses** bugs, security, architecture, simplicity, speed, state, UX,
  reliability, platform and agent instructions.
- **PR size** a change stays small and stands on its own, with a split plan
  past 400 lines.
- **Libraries** hand-written code gives way to the platform or a free,
  maintained library.
- **Domains** legal, SEO and other fields run on an installed skill, or on
  the best match from skills.sh, read before use.

**`app-audit`** checks a whole app in one go, without questions. Through
`reviewer`, agents run in parallel, one per angle, each in its own worktree:

- **Code** bugs, simplicity and tests, architecture and data formats.
- **Safety** security and privacy, dependencies and CI.
- **The person** speed, UX and accessibility, reliability offline.
- **Mobile** the platform and its store.

Each agent proves its findings and fixes the safe ones, one commit each. The
main agent checks each commit as soon as its report lands and picks it onto the
audit branch, so a slow angle holds up no fix. Then it runs the checks, a
build and the app itself, and has a fresh reviewer read the diff. It opens the
PR and merges it when CI is green. Migrations, product calls and anything touching money or
keys go in `TODO.md` with the reason.

**`git-worktrees`** puts isolated work in its own folder, and your
checkout stays as it is. It copies the ignored files the app needs, such as
`.env` and certificates, installs the dependencies and runs the app on a port
of its own. Agents there set work aside in a WIP commit, since the stash is
shared by every worktree. When the PR merges, it moves the folder to a trash folder in a
second and deletes it in the background. The branch goes too, local and
remote, and so do other merged worktrees. `implement-ticket` uses it when the
repo's rules call for isolation, and `app-audit` and `review` rely on it.

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
`docs/architecture.md`, with diagrams and a decision for each choice: the
pick, the trade-off and why each rival lost. The techniques
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

**`ads-setup`** adds AdSense to the site and AdMob to an Android app. An app
site first gets a home page with 300 words of visible text and 5 content
pages, since a reviewer who sees a map or a button refuses the account. Debug
builds get test ads, the consent message goes live, and the Play Console ads
and data safety pages get filled in. A Trusted Web Activity app hides
AdSense, because the policy bans it inside apps. The developer's own phone
sees no ads in any build, and a switch in the app shows them again.

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

**`legal-check`** lists the legal risks of an app before it ships. A Node
script reads the dependency licenses, the SDKs that send data, the sensitive
Android permissions and the legal pages the repo lacks. The agent then checks
the name, the store and ad policies and whether the feature is lawful in each
market. Each risk lands in `docs/legal-risks.md` with its proof, severity and
fix. The safe fixes ship in a PR, and the rest go to `TODO.md`.

**`icon-styles`** draws 10 icons for the app in the repo, each in its own
style. It reads the repo first and picks the styles that fit, such as neon for
a hacker tool. A picker in the chat shows all 10 at 16 to 96 px. You click
one and press Use, or ask for a redo with a comment. An agent without chat
widgets serves the same picker as a local page. A Python script then writes
the PNG sizes, the Windows
`.ico` and the Android, iOS and PWA sets through `resvg`. All 10 drafts stay
in the repo under `design/icons/<date>/`. The pick also shows beside the app
name in the header and on the home page, and right after the merge
`store-media` puts it in Google Play, AdMob and AdSense.

**`demo-media`** takes screenshots and short videos of the app for the
README. It writes made-up demo data that looks like real use, runs the app on
the web, the desktop, an emulator or a phone over adb, and records each flow.
It checks every frame for real people, faces, emails and tokens. The files go
in `docs/screenshots/`, with a GIF for each video, and the README shows them.

**`store-media`** puts those shots, the video and the icon in each place the
app shows. It uploads the Play listing graphics with you logged in, links the
promo video, checks AdMob and AdSense, and swaps the icon on the site, the
GitHub preview and each installer. It asks before any send for review.

**`e2e-walk`** tests the newest release by hand, the way a user would. It
installs the APK on an emulator or the phone over adb, opens the web build or
runs the desktop installer, then walks each main flow and checks each screen.
It reads each label before a tap and skips each control that deletes, resets,
signs out or sends, in all 9 app languages. Bugs go to `TODO.md`, and the flow
list stays in `e2e/flows.json` for the next run.

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

| Flag                         | What it does                                        |
| ---------------------------- | --------------------------------------------------- |
| `--line en\|ru\|mix\|chunks` | each voice says only that line                      |
| `--group female,male,child`  | only those groups. A child voice is a `Cartoon` one |
| `--pitch -10`                | each voice 10 Hz lower, or higher with a plus       |
| `--voice Ava,Emma`           | only voices whose name holds a word                 |
| `--lang en,ru`               | those locales, plus the multilingual voices         |
| `--start 12 --count 5`       | resume at a number, stop after a few                |

The clips stay in `%LOCALAPPDATA%\voice-test`, so a second run plays without
the network. It needs `edge-tts` on `PATH`, and Node 24 for the page.

**`reddit-comments`** finds Reddit threads your repo can answer and gets the
reply as far as the Comment button. It reads the hot threads through the
Reddit MCP server, keeps the ones where a question matches a practice in the
repo, and writes a short comment in a human voice for each. A Playwright
script then opens each thread in Chrome and types the draft into the comment
box. You read it and press Comment.

**`rewrite-repo`** reworks a repo so each file reads new and the app behaves
the same. It records the tests and the output first, moves the files into a
new layout, renames functions after what they do and moves the code to modern
syntax. At the end it wipes the git history into one commit through
`reset-history`.

**`guide-on-site`** walks you through a console or a form in your Chrome. It
clicks to the exact screen, fills the fields it knows and stops at the one step
only you can take, such as a login or a CAPTCHA. Then it checks the page and
opens the next one.

**`hung-process`** frees a stuck run on Windows: a command silent for 5
minutes, a busy port, a file lock. It stops only the dev tools of its own
worktree, or the one holding the port, and reruns the step.

These skills open dashboards in the agent's browser and ask you to log in
there. They don't type passwords or card details. Each leaves `TODO.md` in the
repo with the tasks still yours and the dates to check back.

`review`, `create-pr`, `address-comments`, `implement-ticket` and `app-audit`
load `writing-style` first, so their writing matches.

## What a review looks like

The review opens with a table, so the whole verdict fits on one screen:

| #   | Severity   | Where             | What                                                  |
| --- | ---------- | ----------------- | ----------------------------------------------------- |
| 1   | Blocker    | `SaveName.tsx:42` | the typed name is lost when the save is slow          |
| 2   | Should fix | `profile.ts:88`   | the save error is swallowed, so the page stays silent |
| 3   | Nit        | `SaveName.tsx:20` | no code reads the `isLoading` flag                    |

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
- "write a one-pager for this design"
- "translate the new buttons"
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
- "take screenshots and a demo video for the README"
- "upload the screenshots to Google Play and change the icon everywhere"

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

It lists the folders it will clear and asks before it deletes. On a yes the
agent hooks and the MCP copies go too. Your own notes
in `CLAUDE.md` and `AGENTS.md` stay, and only the installer's block goes.
`--yes` MAY be added to skip the question.

## Editing the skills

[AGENTS.md](AGENTS.md) sets the rules for each `.md` file here: the prose
budget under `skills/`, when a line earns a `MUST`, and what stays verbatim.
Run the checks CI runs. `test` covers the budget, every skill's frontmatter,
links and banned words, the unit tests and an install in a temporary home:

```sh
mise run lint
mise run test
```

## Releases

Release starts once the `check` run of a push to `main` passes. A failed
`check` starts no release. Release tags the commit with the date, such as
`v2026.10.30.1`, and publishes it on the
[Releases page](https://github.com/workbench-soft/agent-skills/releases). Its
notes list the commits since the release before. The release carries no
files, so the install above stays the same.

## Licence

MIT.
