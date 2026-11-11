# Hooks and generic skills from agent-skills-private

## One-pager

- **Goal** a PC without access to `agent-skills-private` gets the agent hooks
  and the generic skills from this repo alone.
- **Hooks** the time hook, the Chrome only hook and the archive block go to
  Claude Code. Codex and Kimi Code get the time hook.
- **MCP copy** the user MCP servers of Claude Code get copied to Codex and
  Kimi Code.
- **Skills** `guide-on-site`, `hung-process` and `rewrite-repo` move here.
- **Stays private** the workflow rules, the MCP gateway and the skills tied
  to the `workbench-soft` org.

## What it does for the person

The person installs this repo on a work PC and gets the message time, the
browser and archive guards and the MCP servers in every agent. The private
repo is no longer needed for those.

## User flows

1. The person runs `install.ps1` or `./install.sh`.
2. The install links the skills, as before.
3. With Node on the PATH, it merges the hooks into
   `%USERPROFILE%\.claude\settings.json` and `%USERPROFILE%\.codex\hooks.json`,
   and the Kimi hook into `%USERPROFILE%\.kimi-code\config.toml`.
4. It copies the user MCP servers of `%USERPROFILE%\.claude.json` to Codex
   and Kimi Code.
5. `--uninstall` takes the hooks and the copied servers out, and keeps the
   person's own.

## How it works

- **`claude/`** `hooks.json` and `install-hooks.mts`, moved as they are.
- **`agents/`** `codex-hooks.json`, `kimi-hooks.mts` and `sync-mcp.mts`.
- **Markers** the Kimi and Codex blocks take `# agent-skills:` markers. The
  scripts also strip a block with the old `# agent-skills-private:` marker,
  so an older install leaves no second copy.
- **`install.sh`** runs the Node scripts with the mise trust trick of the
  private installer. Without Node it skips them and says so.
- **Skills** the moved skills lose their links to the private workflow rules
  and keep their steps.

## Limits

- **Node** the hooks and the MCP copy need Node 24.
- **Opinions** the Chrome only hook blocks the built-in browser of the Claude
  app. A person who wants that browser removes the group from `settings.json`.

## Changes

### 2026-11-12 the move

- **Why** the owner wants the public repo on a work PC, with no access to the
  private one.
- **Changes** `claude/`, `agents/`, the three skills, `install.sh` and its
  test, the moved specs `claude-hooks.md`, `any-agent.md` and
  `rewrite-repo-skill.md`.
- **Steps** this spec, then the files, then the private repo drops its
  copies in its own commit.
- **Docs** `README.md`, `docs/features.md`, `docs/architecture.md`,
  `docs/user-flows.md`, `CHANGELOG.md`.
