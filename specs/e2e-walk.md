# Agent end to end walk of a release

## What it does for the person

- **Newest release** the agent installs the newest release of the repo's app:
  the APK on an emulator or the phone over adb, the live web build, or the
  desktop installer.
- **Main flows** the agent walks each main flow the way a user does, taps and
  types included, and checks each screen against what the flow promises.
- **No data lost** the agent deletes no data, even where a button allows it.
  It skips each control that deletes, clears, resets, signs out or sends,
  and cancels each dialog that asks to confirm one.
- **Report** a table of flows with pass or fail, a screenshot for each
  failure, and each bug as a line in `TODO.md`.
- **Rerun** the flow list stays in `e2e/flows.json`, so the next walk checks
  the same flows.

## User flows

1. The person installs a release from the CI tab of Archon, or lets the agent
   install the newest one.
2. The person ticks repos on the Repos tab of Archon and picks E2E walk.
3. The agent reads the repo and writes or reads `e2e/flows.json`.
4. The agent walks each flow and checks every tap against the stop words.
5. The agent reports the results and writes the bugs to `TODO.md`.

## How it works: modules, files, data

- **`skills/e2e-walk/SKILL.md`** the safety rules, the install, the flow
  list, the walk and the report.
- **`references/stop-words.md`** the labels of controls that lose data or
  reach other people, in the 9 app languages.
- **`references/drive.md`** the commands that install the release and drive
  Android over adb, the web in a browser and a Windows app.
- **Releases** the private app repos publish to
  `workbench-soft/workbench-soft.github.io` with the tag `<repo>-v<version>`,
  as the `local-ci` Install button reads them.
- **Data the walk makes** rows it adds start with `E2E`, and the report lists
  them for the person to remove by hand.

## Limits

- **Rule, not a lock** the agent follows the stop words. An unlabelled icon
  that deletes on one tap is a risk, so the agent skips each unlabelled icon.
- **Sign in** the agent signs in to no account. A flow behind a sign in is
  skipped and reported.
- **Phone data** the release goes in with `adb install -r`, which keeps the
  app data. Uninstall and `pm clear` stay out.

## Changes

### 2026-10-31 E2E walk skill

- **Why** the person wants an agent to install a release and walk the main
  flows from Archon, and to delete no data even where the app allows it.
- **Changes** new `skills/e2e-walk` with its two reference files. The
  README, the features doc and the changelog list it.
- **Steps** this spec, then the skill, then the docs.
- **Docs** `README.md`, `docs/features.md`, `CHANGELOG.md`.
