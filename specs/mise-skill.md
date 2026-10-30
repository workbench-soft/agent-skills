# A skill that runs commands through mise

## What it does for the person

The agent runs each command that mise can handle through mise. Tools come at
the versions the repo pins, and installs land in `mise.toml` in place of the
machine's global state.

## User flows

1. The agent is about to run a command: tests, a build, a linter, a dev server.
2. It loads `mise` and reads the repo's mise config and tasks.
3. A mise task does the job? It runs `mise run <task>`.
4. Otherwise it runs the command with the pinned tools: `mise x -- <command>`.
5. A tool is missing? It adds it with `mise use`, in place of `brew`, `winget`,
   `npm i -g` or a version manager.

## How it works: modules, files, data

- **`skills/mise/SKILL.md`** the steps: check mise, read the config, pick
  `mise run`, `mise x` or `mise use`, handle the errors.
- **`skills/mise/references/commands.md`** the table of commands mise
  replaces: installs, one-off tools, env vars, versions, CI.
- **`writing-style.instructions.md`** a rule that sends each command through
  the skill, so the agent loads it unasked.

## Limits

- **No mise** the one install outside mise is mise itself.
- **System packages** a library the OS links, such as `libpq`, stays with the
  OS package manager. The mise registry has no entry for it.
- **Trust** `mise trust` runs only in a repo the person works in.

## Changes

### 2025-10-29 Add the skill (owner's ask)

- **Why** the owner wants each command mise supports to run through mise. Now
  agents call `npx`, `brew` or a bare `node`, and get versions the repo didn't
  pin.
- **Changes** the skill and its reference file, a rule in the instructions
  file, README and changelog.
- **Steps** this plan, the skill, the instructions rule, README and changelog.
- **Docs** `README.md`. The repo holds skills and no app, so it has no
  architecture or user flow docs.
