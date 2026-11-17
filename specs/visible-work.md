# Visible work

## One-pager

- **Rule** each step an app takes MUST show on screen while it runs, from the tap or the voice command to the result.
- **Why** Lumiere went quiet for 5 s after "Hey Lumi, play", then showed a song that didn't play. The person couldn't tell if it worked.
- **Skill** `visible-work` loads before code a person sees work from: a tap, a voice command, a load, a sync.
- **Load line** `conventions.md` of the workspace lists it beside `translations`, so each UI change loads it.
- **Review** the UX lens of `reviewer` looks for a step with no sign on screen.

## What it does for the person

The person sees what the app does at each moment. A wait shows its step, a
failure says so in words, and a "play" plays without a second tap.

## User flows

1. The agent plans a change that runs work after a tap, a command or a timer.
2. It loads `visible-work` and lists each step of the flow.
3. It gives each step a sign on screen, and the end a result or an error.
4. It checks the flow on the device and fixes a step that shows no sign.

## How it works: modules, files, data

- **`skills/visible-work/SKILL.md`** the rule, the step list, the signs for each kind of wait and the check.
- **`skills/reviewer/references/lenses.md`** the UX lens names the silent step.
- **`conventions.md` of the workspace** the skills table row that loads it.

## Limits

- **Signs** the skill names the kinds of sign. Each app picks its own look.
- **Background work** a sync the person didn't start MAY stay off screen until it fails or changes what they see.

## Changes

### 2026-11-17 A skill for work that shows on screen

- **Why** the owner said "Hey Lumi, play Enrique Iglesias". The glow went out with the beep, the screen showed no sign for 5 s, and the song then waited for a tap on Play. The owner wants this rule in the skills for every app.
- **Changes** the new `visible-work` skill, a line in the UX lens of `reviewer`, the README entry and the CHANGELOG line.
- **Steps** this spec, the skill, the lens, the docs.
- **Docs** `README.md`, `CHANGELOG.md`.
