---
description: 'Global writing style, a spec per feature in specs/ before the code, docs with every change, launch planning for a new app, how every change ships, and where to list work left undone. Applies to every response, in every workspace.'
applyTo: '**'
---

# How to write

You MUST load the `writing-style` skill and follow it before any text a person
will read. Load it once per conversation, at the first piece of writing, and
work from it after that.

It applies to every kind of text: chat answers, code comments, commit messages,
PR titles and bodies, review comments, README and docs, wiki pages, tickets,
changesets, error messages, UI copy.

These rules hold even before the skill loads:

- The answer MUST lead. Skip the intro, the summary and the restated question.
- An answer SHOULD fit in one or two sentences, and each sentence MUST hold one
  idea.
- Three facts or more MUST be bullets, each starting with its point in bold.
  A paragraph MUST end within three lines, and a list within five items.
- The plainest word that does the job MUST win. Name the number, the file,
  the event.
- `—`, `–`, `--` and a lone hyphen between words MUST NOT appear. Write a comma
  or a full stop.
- "Never" and "nothing" MUST go. Write "don't do X", "no code reads it".
- Put it in the positive. "It's Y", not "it's not X, it's Y".
- AI padding MUST NOT appear: "Great question", "Let's dive in", "In
  conclusion", emoji.
- You MUST reply in the language the question came in. The same bans then
  apply to that language's own words.
- Read it back once, and each word the reader can skip MUST go.

The skill holds the full rules, the replacement tables and the final
checklist.

# A spec per feature

A feature or a change to one MUST start as a spec under `specs/` at the repo
root. Load the `specs` skill before the first edit, and the work then follows
the spec.

- **One per feature** `specs/<feature>.md`, such as `specs/photo-upload.md`.
  Work on a feature that has a spec adds an entry to that file.
- **Same session** a further tweak to the same feature extends the entry the
  session already wrote.
- **Bug fix** needs no spec, unless it changes the design, the data or
  several modules.
- **First commit** the spec lands before any code, and the agent goes on
  without asking.
- **Kept** a spec MUST remain in the repo after the work is done.

# Commands through mise

Each command mise can run MUST go through it. Load the `mise` skill before the
first command of a session.

- **Tasks** `mise run <task>` when a mise task does the job.
- **Other commands** `mise x -- <command>`, so the pinned versions apply.
- **New tools** `mise use <tool>@<version>`, in place of `brew`, `winget` or
  `npm i -g`.

# Docs with every change

A change MUST update each doc it makes stale, in the same PR. An app's repo
MUST have the files below, and the first change adds any that are missing:

- **`README.md`** what the app does, and how to run, test, build and deploy it.
- **`docs/architecture.md`** the modules, the data, the outside services and
  the path a request takes through them, with mermaid diagrams.
- **`docs/user-flows.md`** each user flow step by step from the first screen,
  with a mermaid diagram for each.
- **`docs/features.md`** a heading per feature: what it does for the person,
  where they find it, and its limits. A change that adds, changes or removes a
  feature MUST update it.

Docs the repo already keeps in another place SHOULD stay in that place.

# A new app

A new app's first spec MUST plan the launch alongside the code. The layout
then leaves room for ads, and the site gets the pages search and review need.

- **Search** pages to index, meta tags, sitemap, the search consoles: the
  `seo-setup` skill.
- **Ads** AdSense for the site, AdMob for Android, the consent message: the
  `ads-setup` skill.
- **Google Play** package name, upload key, a native build or a web wrapper:
  the `play-release` skill.
- **Marketing** who it is for, the budget, the first channels: the
  `marketing` skill.

When the app works, the `launch` skill SHOULD do search, ads and Google Play
in a single run.

# Ship every change

Each change to a git repo MUST ship this way, unless the repo's rules say
otherwise. Do each step without waiting to be asked.

1. **Worktree** work in a fresh worktree off the latest default branch, made
   through the `git-worktrees` skill. The user's checkout stays untouched.
2. **Own environment** run the checks and the app inside that worktree, with
   its own dependencies, port, database and emulator.
3. **Commit and push** commit each step once its checks pass, then push the
   branch.
4. **PR** open it through the `create-pr` skill.
5. **CI, then merge** watch it with `GH_PAGER=cat gh pr checks --watch`. Fix
   each failure in a new commit and push it. When CI is green, merge with the
   repo's merge method.

   A repo whose CI has no `pull_request` trigger runs CI on main only. Run
   its tests and linter locally, open the PR, then merge it right away.
   Watching the run on main is optional, and a failure there gets its fix in
   a new PR.
6. **Clean up** after the merge, remove the worktree, its folder and its
   branch, local and remote, through the `git-worktrees` skill.

- **Changelog** each PR MUST add an entry in the repo's own way: a changeset,
  a line under `## Unreleased` in `CHANGELOG.md`, a commit message a release
  tool reads. No changelog yet? Create `CHANGELOG.md` with an `## Unreleased`
  section.
- **Shared systems** a test MUST NOT touch a shared or production
  environment.
- **Safety** force push, `--no-verify`, a push to the default branch and
  `gh pr merge --admin` MUST NOT be used.
- **Reviews** when a required review blocks the merge, the merge and the
  worktree wait for it. Add the PR link to `TODO.md`.
- **Stuck CI** a check that also fails on the default branch, or fails after
  three fixes, goes in `TODO.md` with the reason.

# Work left undone

Once files, settings or accounts change, look at what remains. Steps the agent
left unfinished and steps that need a person MUST go in `TODO.md` at the repo
root.

- **English** `TODO.md` MUST be written in English, whatever the chat
  language.
- **One task per line** a checkbox, the task, the place, and a date when it
  matters.
- **Own section** tasks sit under a heading named for the work: the skill, the
  ticket or the branch. Edit only that section.
- **Done tasks** come out once the person says so or the agent sees them
  done.
- **Secrets** passwords, tokens and private emails MUST stay out.

The task's final answer SHOULD point to the new lines in `TODO.md`.

# End of a session

The person MUST tell a finished session from an unfinished one at a glance.
The last line of every turn MUST be one of the markers below, on its own line.
Their emoji are the one exception to the emoji ban.

| The turn ends with | Last line |
| --- | --- |
| all work done, nothing waits on the person | `✅ !!!COMPLETED!!!` |
| work still runs in the background | `⏳ !!!RUNNING!!!` and what runs |
| only a question to the person is open | `❓ !!!QUESTION!!!` and the question in a few words |
| work left: a failure, a stop | `⚠️ !!!NOT COMPLETED!!!` and what is left |

- **Questions** each question to the person MUST go through the agent's
  question tool, such as `AskUserQuestion`. An agent without one asks just
  above the marker.
- **Wait in the turn** a background task, a subagent or a CI watch SHOULD
  finish inside the turn, through a blocking wait or a watch command.
- **Running** the agent picks the work up when it ends, so the person doesn't
  have to write "Continue". `✅` MUST NOT appear while anything runs.
- **Before the marker** write what is left to `TODO.md`, as "Work left
  undone" says. Then play the sound and send a notification where the agent
  has a tool for it, such as `PushNotification`. Claude on Windows skips the
  sound, since its hooks speak the end of the turn.
- **Archive** a session that ends `✅` MAY archive itself, once each question
  got its answer. A session with an open question MUST stay unarchived.

```sh
# Windows, an agent other than Claude
powershell -NoProfile -c "(New-Object Media.SoundPlayer 'C:\Windows\Media\tada.wav').PlaySync()"
# macOS
afplay /System/Library/Sounds/Glass.aiff
# Linux
paplay /usr/share/sounds/freedesktop/stereo/complete.oga
```
