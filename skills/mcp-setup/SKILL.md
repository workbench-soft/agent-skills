---
name: mcp-setup
description: 'Use when an MCP server needs adding, installing, fixing or moving: "add the MCP server", "connect the GitHub MCP", "the MCP is not connected", "подключи MCP", "добавь MCP сервер". Adds it at user scope to Claude Code and Claude Desktop, copies it to Codex and Kimi, runs Python servers through uvx and npm ones through npx, keeps tokens in the user config, and counts it added only once it shows connected and a real tool call returns data.'
---

# Add an MCP server

A new MCP server MUST go into Claude Code, Claude Desktop, Codex and Kimi. It MUST
count as added only once a real tool call returns data.

## Steps

1. **Claude Code** the agent MUST run
   `claude mcp add-json <name> '<json>' --scope user` in a POSIX shell, Git
   Bash on Windows. Windows PowerShell strips the quotes inside the JSON.
2. **Claude Desktop** the same entry MUST go under `mcpServers` in
   `claude_desktop_config.json`, then the app MUST restart. The file sits in
   `%APPDATA%\Claude\` on Windows and `~/Library/Application Support/Claude/`
   on macOS.
3. **Codex and Kimi** the agent MUST run `./install.sh` of `agent-skills`.
   It copies the Claude Code servers to `~/.codex/config.toml` and
   `~/.kimi-code/mcp.json`.
4. **Check** `claude mcp list` MUST show `✔ Connected`. Then a script through
   `uv run --no-project --with mcp` MUST list the tools and call one.

## Rules

- **Launch** a Python server SHOULD run through `uvx`, and a module it lacks
  MUST go in as `--with <package>`. An npm server MUST run as `npx`, and as
  `cmd /c npx` on Windows.
- **Secrets** a token MUST go in the user config, since a repo's `.mcp.json`
  is in git.
- **Accounts** a new token or account SHOULD get its line in the accounts doc
  the person's rules name, with the value left out.
- **Gateway** a person's rules MAY name an MCP gateway that holds rarely used
  servers. A server MUST then go where those rules say.
