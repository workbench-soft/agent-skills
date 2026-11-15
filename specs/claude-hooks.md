# Claude Code hooks from the installer

## What it does for the person

A new PC gets the hooks the workflow rules lean on from one `./install.sh`
run. The person no longer copies a script into `%USERPROFILE%\.claude` or
edits `settings.json` by hand.

## User flows

1. The person runs `./install.sh` in Git Bash.
2. The installer adds the time hook, the Chrome only hook, the archive
   block and the `TODO.md` reminder to
   `%USERPROFILE%\.claude\settings.json`, beside the hooks already there.
3. A second run changes nothing. `./install.sh --uninstall` takes both hooks
   out and keeps the rest.

## How it works

- **`claude/hooks.json`** holds each hook group, its event and a text that
  marks an older copy of it in `settings.json`.
- **`claude/install-hooks.mts`** replaces each marked group in place, or
  adds it at the end. It writes the file only when the hooks change.
- **Time hook** a `UserPromptSubmit` hook prints `Now: yyyy-MM-dd HH:mm:ss`
  through bash `date`, so one command serves Windows and macOS.
- **Chrome only hook** a `PreToolUse` hook stops the built-in browser tools
  and names Claude in Chrome in its message.
- **Archive block** a `PreToolUse` hook stops
  `mcp__ccd_session_mgmt__archive_session`, so only the person archives a
  session.
- **TODO.md reminder** a `PostToolUse` hook on `Edit`, `Write` and
  `MultiEdit` of a `TODO.md` tells the agent to finish the task with its
  tools first, and to name what stopped it in brackets.

## Limits

- **Node** the merge runs on Node. Without Node the installer skips the hooks
  and says so.
- **Auto mode** Claude Code blocks an agent from writing its own settings, so
  the person runs the install when an agent can't.

## Changes

### 2026-11-02 the installer adds the hooks

- **Why** the hooks lived only in `%USERPROFILE%\.claude`, so a new PC lost
  the message time and the Chrome only block.
- **Changes** `claude/hooks.json`, `claude/install-hooks.mts`, the hook step
  in `install.sh` and its test in `scripts/install-in-temp-home.sh`. The time
  hook moves from PowerShell to bash `date`.
- **Docs** `README.md`, `docs/features.md`, `docs/architecture.md`,
  `workflow.instructions.md`, `CHANGELOG.md`.

### 2026-11-02 Node runs past an untrusted mise.toml

- **Why** in a fresh clone the mise `node` shim read the untrusted
  `mise.toml` and stopped the install.
- **Changes** `install.sh` sets `MISE_TRUSTED_CONFIG_PATHS` to the repo and
  `MISE_CEILING_PATHS` to its parent for the Node call.
- **Docs** `CHANGELOG.md`.

### 2026-11-03 only the person archives a session

- **Why** agents archived sessions anyway: their own after `✅`, the ones they
  started, and old ones in a sweep. The person archives each one by hand.
- **Changes** the Archive rule in `workflow.instructions.md` bans the agent
  from archiving any session and from offering to. `claude/hooks.json` gets
  a `PreToolUse` hook that stops the archive tool on every PC.
- **Docs** `README.md`, `docs/features.md`, `docs/architecture.md`,
  `CHANGELOG.md`.

### 2026-11-12 moved to agent-skills

- **Why** a PC without the private repo gets the same setup from the public
  install.
- **Changes** the files move from `agent-skills-private` as they are. The
  install step sits in the public `install.sh`. See
  [move-from-private](move-from-private.md).

### 2026-11-15 a reminder on each TODO.md write

- **Why** agents left site tasks in `TODO.md` that Claude in Chrome could
  finish, Google Play Console ones among them. The owner asked that agents
  do each such task to the end and press consent prompts themselves.
- **Changes** `claude/hooks.json` gets a `PostToolUse` group. Its bash
  command greps the tool input for a `file_path` that ends in `TODO.md` and
  prints the reminder as `additionalContext`. Other files pass silently.
- **Skills** `guide-on-site` does the whole site task and presses each
  consent, accept and permission prompt. `store-media` and `icon-styles`
  send the Play listing for review without a question. `play-release`,
  `ads-setup` and `seo-setup` write a `TODO.md` task only after a try,
  with what stopped the agent in brackets.
- **Limits** Codex edits through `apply_patch`, so the hook stays in Claude
  Code.
- **Docs** `README.md`, `docs/features.md`, `docs/user-flows.md`,
  `CHANGELOG.md`.
