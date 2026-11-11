# Codex and Kimi get the Claude Code setup

## One-pager

- **Problem** the rules, hooks and MCP servers of this setup reach Claude
  Code. Codex gets the rules and the skills only, and Kimi Code gets the
  skills only.
- **Fix** `install.sh` also wires Codex and Kimi: the rules, the time hook,
  the turn voice and the MCP servers of Claude Code.
- **Source** `~/.claude.json` stays the one list of user MCP servers. The
  installer copies it to the other agents on each run.
- **Kimi Code** the new CLI from npm, `@moonshot-ai/kimi-code`. It reads
  `~/.kimi-code/AGENTS.md`, `~/.agents/skills` and hooks in its
  `config.toml`, so it gets the same pieces as Codex.

## What it does for the person

The person starts `codex` or `kimi` in any workbench-soft repo. The agent
follows the same workflow rules, skills and end markers as Claude Code, with
mempalace and the MCP gateway connected.

## User flows

1. The person pulls the repo and runs `./install.sh` in Git Bash.
2. The installer links the skills into `~/.agents/skills`, which Codex and
   Kimi read.
3. It writes the hooks to `~/.codex/hooks.json` and copies the MCP servers
   into `~/.codex/config.toml` and `~/.kimi-code/mcp.json`.
4. It wires the rules into `~/.kimi-code/AGENTS.md` and adds the time hook
   to `~/.kimi-code/config.toml`.
5. The person trusts the new Codex hooks once with `/hooks` in Codex.

## How it works

| Piece         | Claude Code                    | Codex                         | Kimi Code                    |
| ------------- | ------------------------------ | ----------------------------- | ---------------------------- |
| Rules         | `@` lines in `CLAUDE.md`       | `~/.codex/AGENTS.md`          | `~/.kimi-code/AGENTS.md`     |
| Skills        | `~/.claude/skills`             | `~/.agents/skills`            | `~/.agents/skills`           |
| Time hook     | `UserPromptSubmit` in settings | `UserPromptSubmit` hooks.json | `[[hooks]]` in `config.toml` |
| Browser block | `PreToolUse` hook              | no built-in browser           | no built-in browser          |
| Archive block | `PreToolUse` hook              | no archive tool               | no archive tool              |
| MCP servers   | `~/.claude.json`               | `[mcp_servers]` in config     | `~/.kimi-code/mcp.json`      |

- **`agents/codex-hooks.json`** the Codex hook groups, in the shape of
  `claude/hooks.json`. `claude/install-hooks.mts` merges either list into
  its file.
- **`agents/sync-mcp.mts`** reads the user servers of `~/.claude.json`. It
  writes them between marker lines at the end of `~/.codex/config.toml`, and
  merges them by name into `~/.kimi-code/mcp.json`. A server the person defined
  outside the markers stays theirs.
- **`agents/kimi-hooks.mts`** writes the Kimi `[[hooks]]` tables between
  marker lines at the end of `config.toml`. Kimi rejects any key past
  `event`, `matcher`, `command` and `timeout`. It takes the time hook from
  `agents/codex-hooks.json`, so both agents run one command.
- **Windows time hook** Codex runs a hook through the system shell, so the
  Windows command calls PowerShell `Get-Date` in `commandWindows`.

## Limits

- **Codex trust** Codex runs a new or changed hook only after the person
  trusts it in `/hooks`.
- **Old Kimi CLI** the pip package `kimi-cli` is out of support and reads
  no global `AGENTS.md`. The setup targets Kimi Code only.
- **Session title** Codex and Kimi give the agent no rename tool, so the
  title emoji stays a Claude Code step.

## Changes

### 2026-11-04 Codex and Kimi get the rules, hooks and MCP servers

- **Why** the person starts using Codex and Kimi beside Claude Code.
- **Changes** `agents/`, `claude/install-hooks.mts`, `install.sh`,
  `scripts/install-in-temp-home.sh`, `workflow.instructions.md`,
  `skills/mcp-setup`.
- **Docs** `README.md`, `docs/features.md`, `docs/architecture.md`,
  `CHANGELOG.md`.

### 2026-11-12 moved to agent-skills

- **Why** a PC without the private repo gets the same setup from the public
  install.
- **Changes** the files move from `agent-skills-private` as they are. The
  install step sits in the public `install.sh`. See
  [move-from-private](move-from-private.md).
