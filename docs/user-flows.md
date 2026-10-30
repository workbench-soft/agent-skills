# User flows

Each flow starts in a terminal or in an agent chat. The README holds the exact
commands.

## Install

1. The person clones the repo to `~/.agent-skills`.
2. They run `install.sh`, or `install.ps1` on Windows, with `--lang`.
3. The installer writes `LANGUAGE.md` into each skill folder.
4. It links each skill into every agent folder it finds under `~`.
5. It adds the writing rules to `~/.claude/CLAUDE.md` and `~/.codex/AGENTS.md`,
   and git hooks to the clone. On Windows it also adds the turn-voice hooks.

```mermaid
flowchart LR
  clone["git clone"] --> run["install.sh --lang"]
  run --> lang["LANGUAGE.md in each skill"]
  run --> links["links in each agent folder"]
  run --> rules["writing rules in CLAUDE.md, AGENTS.md"]
  run --> hooks["git hooks in the clone"]
```

## Use a skill

1. The person asks the agent in plain words, such as "review this PR".
2. The agent matches the request to a skill description and loads its
   `SKILL.md`.
3. The agent follows the steps. A review comes back in the language from
   `LANGUAGE.md`.

```mermaid
flowchart LR
  ask["request in chat"] --> match["agent matches a description"]
  match --> load["loads SKILL.md"]
  load --> work["runs the steps"]
  work --> answer["review in the picked language"]
```

## Get new skills

1. The person runs `git pull` in the clone.
2. The git hook reruns the install with the last language.
3. A new skill gets its links, and a removed one loses them.

```mermaid
flowchart LR
  pull["git pull"] --> hook["post-merge hook"]
  hook --> rerun["install.sh, last language"]
  rerun --> add["links for new skills"]
  rerun --> drop["links of removed skills go"]
```

## Change the language

1. The person reruns the install with another `--lang`.
2. Each `LANGUAGE.md` gets the new language.

```mermaid
flowchart LR
  rerun["install.sh --lang Russian"] --> write["LANGUAGE.md rewritten"]
  write --> next["next review in Russian"]
```

## Remove

1. The person runs the install with `--uninstall`.
2. The installer lists each link, rules block and git hook it found.
3. On a yes, or with `--yes`, it deletes them. The clone stays.

```mermaid
flowchart LR
  un["install.sh --uninstall"] --> list["list of what goes"]
  list -->|yes| delete["links, rules block, hooks removed"]
  list -->|no| keep["left alone"]
```
