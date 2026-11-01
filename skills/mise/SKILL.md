---
name: mise
description: 'Use before running any shell command in a repository, in any language: tests, builds, linters, a dev server, a script, a one-off CLI through npx, uvx or pipx, installing, pinning or upgrading a tool, checking a version. Also on "run it through mise", "install node", "add a tool", "pin the version", "запусти через mise", "поставь инструмент". Each command mise can run goes through it: a mise task with `mise run`, any other command with `mise x --` so the pinned versions and env apply, a new tool with `mise use` in place of brew, winget, npm -g or a version manager. Produces the command run the mise way, and the pin in mise.toml for each tool added.'
---

# Commands through mise

mise pins the tools, the env vars and the tasks of a repo. Each command it can
run MUST go through it, so the agent gets the versions the repo pins.

## 1. Check mise

The agent MUST check that mise runs:

```bash
mise --version
```

- **Missing** the agent MUST install mise itself, the one install outside
  mise: `winget install jdx.mise` on Windows, `brew install mise` on a Mac, or
  `curl https://mise.run | sh` on Linux. The answer MUST say so.
- **Old** a warning that a newer mise exists MAY be ignored. The agent SHOULD
  run `mise self-update` when a command fails on a setting the old one lacks.

## 2. Read the repo's setup

The agent MUST read the repo's config, tasks and versions first:

```bash
mise config ls
mise tasks ls
mise ls --current
```

- **Not trusted** the agent SHOULD run `mise trust` in a repo the person works
  in, and in each new worktree of it. A config from a repo they just
  downloaded MUST wait for their yes, since trust lets its env and hooks run.
- **Not installed** the agent MUST run `mise install` to bring the pinned
  versions.
- **Other pin files** mise reads `.tool-versions`. A repo pinned with `.nvmrc`
  or `.python-version` SHOULD get a `mise.toml` with the same versions.

## 3. Run the command

The agent MUST pick the command form by the job:

| The job                                        | Command                                  |
| ---------------------------------------------- | ---------------------------------------- |
| a mise task does it                            | `mise run <task> -- <args>`              |
| any other command in the repo                  | `mise x -- <command>`                    |
| several commands in one call                   | `mise x -c "pnpm lint && pnpm test"`     |
| a tool at a version the repo doesn't pin, once | `mise x node@22 -- node script.js`       |
| a one-off CLI from npm or PyPI                 | `mise x npm:oxfmt@0.75 -- oxfmt --check` |

- **Task first** a mise task SHOULD win over the same script in
  `package.json`, a Makefile or a justfile. The task sets its env and its
  dependent tasks.
- **Each call** an agent shell loses `mise activate` between calls. In a repo
  with a mise config, each command MUST start with `mise x --`, so a bare
  `node` can't pick the machine's version.
- **Out of scope** `git` and `mise` itself MAY run as they are.
- **No config** when the repo pins no tools, commands MAY run as they are. A
  tool they need MUST still come through step 4.
- **Rerun on change** the agent SHOULD use `mise watch <task>` in place of
  nodemon or entr.

The same lines MAY run in PowerShell and in bash alike.

## 4. Add or change a tool

- **Add** the agent MUST run `mise use <tool>@<version>`, which installs the
  tool and pins it in the repo's `mise.toml`. A tool for the machine, outside
  any repo, MUST take `-g`.
- **Find the name** the agent SHOULD run `mise search <word>`. A tool outside
  the registry MAY come through a backend: `npm:`, `pipx:`, `cargo:`, `go:`,
  `github:`.
- **Replaced** `brew`, `winget`, `npm i -g`, `pipx install`, nvm, pyenv and
  asdf MUST NOT install a dev tool that mise can install. The agent SHOULD
  read [references/commands.md](references/commands.md) for the mise command
  that replaces each.
- **Pin style** the pin MUST match how `mise.toml` already pins: `"22"` or
  `"22.11.0"`.
- **Upgrade** the agent SHOULD run `mise outdated`, then
  `mise use <tool>@<version>` for each bump the task needs.

A library the OS links, such as `libpq` or `openssl`, SHOULD stay with the OS
package manager.

## 5. Env vars

- **Repo values** the agent SHOULD run `mise set KEY=value`, which writes them
  to the `[env]` table of `mise.toml`.
- **Secrets** a secret MUST NOT go in `mise.toml`, since git tracks it. It
  MUST stay in a git-ignored `.env`, loaded with `_.file = ".env"` under
  `[env]`.
- **Read** the agent MAY run `mise env` to print what a command run through
  mise sees.

## 6. When it fails

- **Setup problem** the agent SHOULD run `mise doctor`, which names it.
- **Wrong binary** the agent SHOULD run `mise which <bin>` for the path mise
  picks, and `mise ls` for the versions.
- **Unknown tool** when `mise search` finds no match and no backend fits, the
  agent MAY install it the old way. The answer MUST give the reason.

## 7. Report back

The answer MUST name each tool added or bumped in `mise.toml`, and each
command that ran outside mise with the reason.
