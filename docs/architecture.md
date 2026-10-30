# Architecture

The repo is plain Markdown and scripts. No server and no build. The installer links one clone into each coding agent.

```mermaid
flowchart LR
  repo["Clone ~/.agent-skills<br/>skills/*/SKILL.md"] --> install["install.sh / install.ps1"]
  install -->|links| claude["Claude Code"]
  install -->|links| codex["Codex"]
  install -->|links| other["Cursor, Copilot and more"]
  claude --> hook["hooks/turn-voice<br/>C#, speaks at turn end"]
  ci["CI: check-skills.py,<br/>check-prose-budget.py"] --> repo
```

| Part | Technology | Job |
| --- | --- | --- |
| Skills | Markdown with front matter | Instructions the agent loads on a match |
| Installer | POSIX shell, PowerShell | Links the skills into each agent |
| Hook | C# | Speaks a line at the end of a turn |
| Checks | Python | Checks the skill format and text length |
