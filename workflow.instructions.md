# Workflow rules

These rules MUST set how each change gets planned, run, shipped and reported.
The writing rules MUST come from `writing-style.instructions.md` and the code
rules from `code.instructions.md`, both beside this file. A private rules file
of the person MAY add to these rules, and its line MUST win where both speak.

Each paragraph and list item an agent writes for agents, in `AGENTS.md`, a
skill or an instructions file, MUST carry a BCP 14 key word in capitals:
`MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT` or `MAY`.

## Skills for each job

This file loads on every turn, so a rule that one job needs MUST sit in a
skill. The agent MUST load the skill in a job's row before that job:

| Job                                                   | Skill           |
| ----------------------------------------------------- | --------------- |
| Any change to a git repo: queue, Main, worktree, PR   | `ship-change`   |
| A new or broken MCP server                            | `mcp-setup`     |
| Any step on a site or a console, Google Play included | `guide-on-site` |
| A hung command, a busy port, a file lock              | `hung-process`  |

## A spec per feature

A feature or a change to one MUST start as a spec under `specs/` at the repo
root. The agent MUST load the `specs` skill before the first edit, and the
work MUST then follow the spec.

- **One per feature** each feature MUST have one `specs/<feature>.md`, such as
  `specs/photo-upload.md`. Work on a feature that has a spec MUST add an entry
  to that file.
- **Same session** a further tweak to the same feature SHOULD extend the entry
  the session already wrote.
- **Bug fix** a bug fix MAY skip the spec, unless it changes the design, the
  data or several modules.
- **First commit** the spec MUST land before any code, and the agent SHOULD go
  on without asking.
- **Kept** a spec MUST remain in the repo after the work is done.

## Commands through mise

In a repo with a `mise.toml`, each command mise can run MUST go through it.
The agent MUST load the `mise` skill before the first command of a session.

- **Tasks** the agent SHOULD use `mise run <task>` when a mise task does the
  job.
- **Other commands** the agent MUST run `mise x -- <command>`, so the pinned
  versions apply. A tool the repo pins MUST NOT run through `npx`, which hangs
  on a download.
- **New tools** the agent MUST use `mise use <tool>@<version>`, in place of
  `brew`, `winget` or `npm i -g`.

## Commands that don't hang

A command SHOULD run with a timeout and without prompts: `CI=1`, `--yes`,
`GH_PAGER=cat`. A hang MUST go through the `hung-process` skill.

- **Background** a dev server, a watch, a runner or an emulator MUST run in
  the background. Before a build or a server start, the agent SHOULD check
  its port for leftovers.
- **Search** a recursive `grep` over the folder that holds every clone MUST
  NOT run, since it walks every `node_modules`. A search across repos SHOULD
  go through a code search MCP server where one is set up. Work in one repo
  MUST go through `git grep` or the Grep tool with a path.

## Docs with every change

A change MUST update each doc it makes stale, in the same change. The agent MUST
find and fix those docs unasked.

- **Agent rules** a change to how agents work, in a rules file, a skill or a
  hook, MUST update each README and doc that describes it. For this file that
  is the "Workflow rules" section of the `agent-skills` README.
- **Find them** before shipping, the agent SHOULD search the repo docs for the
  section and skill names it changed.

## Ship every change

Each change to a git repo MUST ship through the `ship-change` skill, unless the
repo's rules say otherwise. The skill picks a direct push to clean `main` or
a worktree and PR. Checks MUST follow the repo's test rules.

- **Safety** force push, `--no-verify` and `gh pr merge --admin` MUST NOT be
  used. A push to `main` MUST follow the clean checkout path in `ship-change`.
- **Shared systems** a test MUST NOT touch a shared or production
  environment.
- **Deploy** once a change is on `main`, a repo with a `deploy` mise task
  MUST go live from this machine at once, through `ship-change`. The agent MUST NOT
  wait for CI to deploy.
- **Risky builds** a change to a shrink or build setting, keep rules, native
  code or a native package MUST pass a launch check on its release build
  before the merge, since each push to `main` ships.
- **Crash first** a crash in a published build MUST be fixed before other
  work, and the fix MUST add a check that catches that crash.

A broken build, test, lint or CI check that the agent meets, in any repo,
MUST get its own session at once. That session MUST fix it and merge the fix
to `main` through `ship-change`.

- **No question** the agent MUST start the session without asking, with the
  command, the error and what it found in the brief, then go on with its own
  task.
- **Own change** a failure the agent's own change caused MUST get fixed in
  that change instead.
- **Once** a failure that a running session or an open PR already fixes MUST
  NOT get a second session.
- **Tools** Claude Code MUST use `mcp__ccd_session__start_session`, or
  `mcp__ccd_session__hand_off_to_session` when the fix is the task at hand.
  An agent with no session tool MUST fix it first, in its own worktree and PR.

Each session MUST start in the folder of its repo with `use_worktree: false`
and stay there. The Claude app keeps a record of each folder's git dir. Once
that record points at a gone worktree, the app refuses each
`use_worktree: true` start there with "could not anchor this repository". A
`use_worktree: false` start skips that check.

- **Start there** a session for another repo MUST start with `cwd` set to
  that repo's main checkout and `use_worktree: false`. A proposal card can't
  set `cwd`, so its brief MAY move it once with `change_directory` before the
  first step.
- **Own worktree** the brief MUST tell the session to make its own worktree
  through `git-worktrees` before the first edit. The session MUST work there
  through absolute paths and `git -C`, and leave the main checkout as it is.
- **Stay there** a session MUST NOT leave its folder with `cd` or
  `change_directory`. A command in another folder MUST use `git -C`, an
  absolute path or a subshell, `(cd <dir> && <command>)`.
- **App worktrees** a worktree under `.claude/worktrees/` MUST stay until
  the app removes it, when its session is archived.
- **Failed start** a start that fails with "could not anchor this
  repository" MUST get one retry at once with the same `cwd`,
  `use_worktree: false` and the worktree step in its brief. Only a second
  failure MAY go to the person, as a new session opened in that folder from
  the app, through "Steps for the person".

Each change MUST ship fast, in this order:

1. **Code first** the agent MUST merge the code as soon as the repo's checks
   pass on this machine, before any site, console or phone step.
2. **While it builds** site and console steps, such as Play Console or
   AdMob, MUST run while CI builds the merged change.
3. **Phone last** a phone check MUST wait for that build, then run on it.
4. **Follow up** a gap found later MUST go in a new small PR. A working first
   version SHOULD ship over a perfect one held back.

## Emails

A request to write an email MUST end in a draft. The agent MUST NOT send it.

- **Draft** the agent MUST save it in the mail app as a draft, such as Gmail
  `create_draft`. With no mail tool, the text MUST go in the answer.
- **Send** the person MUST send it. `send_message`, `reply` and `forward`
  MUST stay unused, even when the request says "send".
- **Answer** the answer MUST name the draft and the address it goes to.

## Do it yourself

An agent MUST do each step it has a tool for, to the end, without asking
first. It MUST NOT hand that step to the person or leave it in `TODO.md`.

- **Permission given** the person has said yes in advance to each step the
  agent has a tool for: a command, a script, an install, a page, a setting.
  The agent MUST run it and MUST NOT ask "shall I run it?".
- **Command and page** a command the agent can run MUST run in its own shell,
  and a page it can reach MUST open in the person's Chrome.
- **Sites** a task in Google Play Console, AdMob, Cloudflare or any other site
  MUST go to that site at once, through `guide-on-site`. A question such as
  "shall I open the console?" MUST NOT be asked.
- **Consent** the person has said yes in advance to each consent, accept,
  agree, allow and permission prompt: terms, cookie banners, OAuth screens,
  API and account access. The agent MUST press it and go on.
- **Buttons** the agent MUST press Save, Submit, Publish, Send for review,
  Verify and Continue itself. A payment, a permanent delete and a message to
  a person MUST still wait for the person's yes.

The agent MUST also keep to these:

- **To the end** the agent MUST reach the final state and check it there. A
  hang or an error MUST get a reload and a second try, then another route.
- **Personal data** passwords, new accounts, card and bank numbers, tax and
  passport numbers MUST stay with the person.
- **Check** the agent MUST check its own result: the output, a screenshot, a
  reload. "Check that it works" MUST NOT go to the person.
- **Choice** a choice with any reasonable default MUST NOT become a
  question. The agent MUST pick, go on and name the pick in the final
  answer. A choice without one MUST wait for the end of the work, per
  "Decisions for the person".
- **Left over** the person MUST only log in, pass a CAPTCHA, copy a secret,
  pay, say yes to an admin prompt, or take a step the permission check
  denied. Those steps MUST reach the person as one script, per "Steps for
  the person".

The tools below MUST come first:

- **Scripts over clicks** a step that a CLI, an API or a script can do MUST
  go through it, in place of clicks on a site or in an app.
- **API first** a console with an MCP server or a CLI MUST go through it
  before the browser: the AdMob, AdSense, Google Play and GitHub servers,
  `gcloud`, `wrangler`, `gh`.
- **Phone first** before a check on the phone, the agent MUST run
  `adb devices` and read the lock state. A phone that shows `unauthorized` or
  is locked MUST get one request to the person, at the start of the work.
- **Text over pictures** a page MUST be read with `get_page_text`, `find` or
  `read_page`. A screenshot SHOULD come only for a visual check, at
  `scale: 0.5` when only the agent reads it, since browser screenshots cost
  the most tokens of any tool.

## Secrets

Each token, API key or password the work makes or needs MUST sit in the
person's secret manager, such as Bitwarden Secrets Manager or 1Password.

- **Read** a command that needs a token MUST get it through the manager's run
  wrapper, such as `bws run` or `op run`. The agent MUST NOT print a value,
  read it off a page or paste it into the chat.
- **Store** a value kept only in a CI secret, a file or the chat MUST get
  stored in the manager.

## Steps for the person

The steps left over from "Do it yourself" MUST reach the person as one
script, started by one line. The agent MUST run each part it can before it
hands the script over. Two commands or a list of clicks MUST NOT go to the
person.

The script MUST follow these:

- **One file** each task MUST get one script in the repo of the work,
  shipped through `ship-change`: `scripts/person-steps/<task>.ps1` on Windows,
  `scripts/person-steps/<task>.sh` on macOS and Linux. A single command MAY
  go as that one line, with no file.
- **Does the rest** the script MUST run each step a tool can do: `gh`,
  `gcloud`, `wrangler`, the secret manager's CLI, the package manager,
  `mise`. A console page with no API or CLI MUST open at its exact screen,
  through `Start-Process <url>` or `open <url>`, with one line that names
  the button to press.
- **Pauses** the script MUST stop only for a login, a secret, a CAPTCHA or a
  payment, with `Read-Host` or `read`, and say in one line what to do. A
  secret MUST go from a hidden prompt into the secret manager or
  `gh secret set` without a print.
- **Rerun** each step MUST check its state first and skip once done, so a
  second run is safe. The script MUST stop on the first error, through
  `$ErrorActionPreference = 'Stop'` or `set -eu`, and the end MUST print each
  step as done or left.
- **Admin** a step that needs admin rights MUST raise itself inside the
  script, through `Start-Process powershell -Verb RunAs -Wait` or `sudo`.

The handover MUST follow these:

- **One line** the answer MUST give one fenced line in the person's shell
  that runs the script, with no value to fill in, in the shape below.
- **Parse first** the agent MUST parse the script in its own shell before
  the handover, as the second line of each shape shows.
- **Check** once the person has run it, the agent MUST check the final state
  itself and take the done steps out of the script and `TODO.md`.
- **Site** a site step in the session MUST go through `guide-on-site`, in
  the person's Chrome. The built-in browser of the Claude app MUST NOT be
  used, and a hook in `~/.claude/settings.json` blocks it.
- **TODO.md** the task line MUST hold the same one line.

The line MUST take the shape for the person's system:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "<repo>\scripts\person-steps\<task>.ps1"
[ScriptBlock]::Create((Get-Content -Raw '<file>')) | Out-Null
```

```sh
sh "<repo>/scripts/person-steps/<task>.sh"
sh -n '<file>'
```

## Decisions for the person

A session MUST run as far as it can without the person. A question MUST wait
until no other step can move without its answer.

- **Questions last** the agent MUST first do each step that needs no answer.
  It MAY ask only once the rest of the work, the next tasks of the plan
  included, can't move without an answer.
- **Default first** a decision with any reasonable default MUST go ahead on
  that default. The final answer MUST name each pick in one line, so the
  person can reverse it later.
- **No midway pause** a session MUST NOT stop halfway to wait for the
  person. A blocked part MUST go aside while the agent goes on with the
  rest.
- **One batch** the questions left MUST go together at the end of the work,
  in one `AskUserQuestion` call of up to 4 questions. The agent MUST act on
  each answer in the same session.

Each question MUST follow these:

- **Options** each decision MUST go through the question tool, such as
  `AskUserQuestion`, with 2 to 4 options. Each option's description MUST say
  what the agent does on that pick. The agent's pick MUST come first, with
  "(Recommended)" in its label.
- **Context** each question MUST stand alone: what the decision is about and
  why it matters, in one or two sentences. The person MUST NOT need to scroll
  back or open a file to answer.
- **More than 4** the questions past the first 4 MUST follow in the next
  calls until each one has an answer.
- **Not in TODO.md** a decision MUST NOT go to `TODO.md`. A subagent MUST
  hand its decision back to the main agent, which asks the person.
- **Old lines** a `(decision)` line the agent finds in a `TODO.md` MUST
  become a question to the person. Once answered, the line MUST come out.

## Work left undone

Once files, settings or accounts change, the agent MUST look at what remains.
Steps the agent left unfinished and steps that need a person MUST go in
`TODO.md` at the repo root.

- **Last resort** a task MUST go in `TODO.md` only after the agent tried it
  with each tool it has. A task its tools can finish MUST get done instead.
- **Format** `TODO.md` MUST be in English, with one checkbox task per line:
  the task, the place, a date when it matters, and what stopped the agent in
  brackets: `(login)`, `(CAPTCHA)`, `(secret)`, `(payment)`, `(admin)`,
  `(denied)`, `(wait)`. Passwords, tokens and private emails MUST stay out.
  A decision MUST go through "Decisions for the person" instead.
- **Own section** tasks MUST sit under a heading named for the work: the
  skill, the ticket or the branch. The agent MUST edit only that section.
- **Denied** a call the permission check denies MUST NOT get retried in
  another form. Its step MUST go in the person's script and `TODO.md`.
- **Done tasks** MUST come out once the person says so or the agent sees them
  done.

The agent MUST also keep to these:

- **No phone checks** a check on the phone, the emulator or TalkBack MUST NOT
  go in `TODO.md`. The merged PR MUST carry the `untested` label instead, so
  a later batch test finds it.
- **Worktrees** a merged worktree and its branches MUST go through
  `remove-merged.sh` of `git-worktrees`. The install allows it and the git
  cleanup commands, so the agent MUST remove them itself and MUST NOT leave
  them in `TODO.md`.
- **Answer** the task's final answer SHOULD point to the new lines in
  `TODO.md`.

Auto mode refuses these, so the agent SHOULD put the step in the person's
script and `TODO.md` at once instead of a first try: `rm -rf` of a folder, a
delete of a remote tag, `gh secret delete`, an archived session, a scheduled
task, a write to `~/.claude/settings.json`, a link from an email,
`gh repo archive`.

## Time on each message

Each message to the person MUST start with the time it was written, as
`[yyyy-MM-dd HH:mm:ss]` in the machine's time zone, then a space and the
text. The first line of a turn, each update between tool calls and the final
answer MUST each get the prefix on their first line.

- **Source** in Claude Code, Codex and Kimi Code, a `UserPromptSubmit` hook
  prints `Now: 2026-11-01 12:58:56` into the context at the start of each
  turn. The agent MUST take the time from that line.
- **Later in the turn** after about 5 minutes of tool calls the agent SHOULD
  run `date '+%Y-%m-%d %H:%M:%S'` once more before the message, or
  `Get-Date -Format 'yyyy-MM-dd HH:mm:ss'` in PowerShell.
- **No hook** an agent without the hook MUST run that command at the start
  of the turn. When the hook is missing in Claude Code, Codex or Kimi Code,
  the person MUST run the install of `agent-skills`. Codex also MUST get the
  hook trusted once in `/hooks`.

## Progress every minute

The person MUST see how far long work has gone without asking. Once a turn
has run 60 seconds, the agent MUST post a progress report at least once a
minute until the turn ends.

- **Bars** each report MUST hold a text bar per row in a code fence: a
  running script, the current step, then the whole task. Each row MUST give
  the percent and the minutes left of the total, both the agent's estimate.
- **Claude Code** the agent MUST call `mcp__progress__report` from the
  `progress` mod of `agent-skills`, in the same message as its next tool
  call, and paste the block it returns. The call also updates the Progress
  pane, and the mod reminds the agent after 60 quiet seconds.
- **Other agents** an agent without the mod MUST write the same block by
  hand, as below.
- **Long commands** a command that MAY run past a minute MUST run in the
  background. The agent MUST read its output once a minute, with a wait such
  as Monitor, and report from it: a line count, a test count, a percent.
- **Estimates** the agent SHOULD set the total at the start from its plan,
  and MUST correct it in the next report once it proves wrong.

The block MUST follow this shape, in the person's language:

```text
Script build-apk  ██████░░░░░░░░░░░░░░  30%  left 4 min of 6 min
Step 1/7 Tests    ███████░░░░░░░░░░░░░  35%  left 7 min of 40 min
Total             █████████░░░░░░░░░░░  45%  left 4 h of 8 h 30 min
```

## End of a session

The person MUST tell a finished session from an unfinished one at a glance.
The last line of every turn MUST be one of the markers below, on its own line.
Their emoji MAY appear as the one exception to the emoji ban.

| The turn ends with                        | Last line                                           |
| ----------------------------------------- | --------------------------------------------------- |
| work merged, at most a phone test is left | `✅ !!!COMPLETED!!!`                                |
| agent work done, the person owes a step   | `👤 !!!USER STEPS!!!` and what the script asks for  |
| work still runs in the background         | `⏳ !!!RUNNING!!!` and what runs                    |
| all else done, only questions are open    | `❓ !!!QUESTION!!!` and the question in a few words |
| work left: a failure, a stop              | `⚠️ !!!NOT COMPLETED!!!` and what is left           |

- **Questions** each question to the person MUST go through the agent's
  question tool, such as `AskUserQuestion`. An agent without one MUST ask
  just above the marker.
- **Completed** once the work is merged, with its tests where it has any, a
  turn with only a phone check or a manual test left MUST end with `✅`.
  Cleanup that already sits in `TODO.md`, such as a locked folder or an old
  branch, MUST NOT block `✅` either.
- **User steps** `👤` MUST stay for a real step the person owes: a login, a
  key, a payment, a wait for an outside email, or work the agent left
  unfinished. A turn that waits on a decision MUST end with `❓`, and only
  once each step that needs no answer is done. The steps
  MUST sit in one script, per "Steps for the person". `TODO.md` and the
  answer MUST give the one line that runs it, and one plain sentence on what
  it asks the person to do.
- **Every turn** each turn MUST end with a status message and a marker,
  short answers and questions included. A turn MUST NOT end on a tool call.
- **Running** a background task, a subagent or a CI watch SHOULD finish
  inside the turn. The agent MUST pick the work up when it ends, and `✅` MUST
  NOT appear while anything runs.

The session title and the end MUST follow these:

- **Title** right before the final message of every turn, the agent MUST put
  the emoji of that turn's marker and a space before the session title, such
  as `✅ Fix login`, and replace the emoji an earlier turn left there. Claude
  Code MUST call `mcp__ccd_session_mgmt__set_session_title`, loaded through
  `ToolSearch` when deferred. Another agent MUST use its own rename tool.
  Codex and Kimi Code have none, so they MUST skip this step.
- **New turn** when a new message comes to a session whose title holds a
  marker emoji, the agent MUST swap it for `⏳` with its first tool call.
  `✅` MUST come back only once that follow-up is done.
- **Before the marker** the agent MUST write what is left to `TODO.md`. Then
  it SHOULD send a notification where it has a tool for it. Claude Code, Codex
  and Kimi Code on Windows SHOULD skip the sound, since the `turn-voice` hook
  speaks the end of the turn.
- **Archive** the agent MUST NOT archive a session or offer to. Only the
  person archives a session, by hand.

Another agent SHOULD play the sound with the line for its system:

```sh
powershell -NoProfile -c "(New-Object Media.SoundPlayer 'C:\Windows\Media\tada.wav').PlaySync()"
afplay /System/Library/Sounds/Glass.aiff
paplay /usr/share/sounds/freedesktop/stereo/complete.oga
```
