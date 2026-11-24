# Progress reports every minute

## One-pager

- **Ask** the person had to ask each long running agent how far it got.
- **Rule** once a turn runs past a minute, the agent posts text bars each
  minute: the script, the step and the whole task, with minutes left.
- **Mod** in Claude Code the `progress` mod draws the bars, keeps a Progress
  pane beside the chat and reminds the agent after 60 quiet seconds.
- **Install** `install.sh` names the mod in `CLAUDE_CODE_PLUGIN_DIRS` of
  `%USERPROFILE%\.claude\settings.json`, so each session loads it.
- **Other agents** Codex and Kimi Code write the same block by hand.

## What it does for the person

The person sees how far long work has gone without asking. Each minute of a
long turn brings a message with bars like these:

```text
Скрипт build-apk  ██████░░░░░░░░░░░░░░  30%  осталось 4 мин из 6 мин
Шаг 1/7 Тесты     ███████░░░░░░░░░░░░░  35%  осталось 7 мин из 40 мин
Всего             █████████░░░░░░░░░░░  45%  осталось 4 ч из 8 ч 30 мин
```

The Progress pane in Claude Code shows the last report, its age and each
tool call still running with its time.

## User flows

1. The person gives a task that runs for minutes or hours.
2. After 60 seconds the agent calls `mcp__progress__report` with its rows,
   in the same message as its next tool call.
3. The tool returns the block, and the agent pastes it into its message.
4. The Progress pane opens on the first report and updates on each one.
5. When 60 seconds pass with no report, the mod adds a reminder to the next
   tool result the model reads.

## How it works: modules, files, data

- **`mods/progress/hooks/bar.ts`** draws a 20 cell bar per row and the
  minutes in Russian or English.
- **`mods/progress/hooks/register.tsx`** registers the `report` tool and the
  `/progress` command, serves the tool at `tool.call` so no permission
  prompt appears, tracks running tool calls of the main agent, adds the
  reminder as tool result context, and draws the pane.
- **`mods/progress/types/index.d.ts`** declares the session state: the last
  snapshot, the running calls and a clock tick every 5 seconds.
- **`claude/install-mods.mts`** adds each folder in `mods/` to
  `env.CLAUDE_CODE_PLUGIN_DIRS` of the settings file, and `--uninstall` takes
  them out. Other folders in the list stay.
- **Rule** "Progress every minute" in `workflow.instructions.md` of
  `agent-skills-private` sets when and how agents report.

## Limits

- **Estimates** the percent and the minutes come from the agent, so they are
  guesses the agent corrects as it goes.
- **Inside a command** the agent can't speak while a tool call runs. A long
  command goes to the background, and the agent reads it once a minute.
- **Restart** a session loads the mod only after a restart of Claude Code or
  the desktop app that follows the install.
- **Subagents** their tool calls get no reminder, since they can't talk to
  the person.

## Changes

### 2026-11-24 progress bars, the pane and the reminder

- **Why** the person had to ask agents on long work how it was going.
- **Changes** `mods/progress/`, `claude/install-mods.mts`, the mod step in
  `install.sh` and its check in `scripts/install-in-temp-home.sh`. The rule
  sits in `workflow.instructions.md` of `agent-skills-private`.
- **Steps** the mod with its tests, the installer, the docs.
- **Docs** `README.md`, `docs/features.md`, `docs/architecture.md`,
  `CHANGELOG.md`.
