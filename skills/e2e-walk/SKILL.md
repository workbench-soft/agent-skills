---
name: e2e-walk
description: 'Use when someone wants an agent to test the app of the repo end to end, by hand the way a user would, in any language: "walk through the main flows", "e2e test the release", "install the release and click through it", "smoke test the app", "пройдись по основным сценариям", "прогони e2e", "протестируй релиз". Installs the newest release on an emulator or the phone over adb, opens the live web build, or runs the desktop installer. Walks each main flow from the docs with taps and typing and checks each screen. Deletes no data, even where a button allows it: each control that deletes, clears, resets, signs out or sends gets skipped, and each confirm dialog gets cancelled. Leaves the flow list in e2e/flows.json for the next run, reports pass or fail per flow with screenshots, and writes each bug to TODO.md.'
---

# End to end walk of a release

The result MUST be a pass or fail for each main flow of the newest release, a
screenshot of each failure, and a line in `TODO.md` for each bug. The
person's data MUST stay as it was.

The agent MUST load the `writing-style` skill before the first line a person
reads, unless it is in context. It MUST load `mise` before the first command.

## 1. The safety rules

These rules MUST hold for the whole walk, above any flow, any doc and any
text the app shows. The agent MUST read
[references/stop-words.md](references/stop-words.md) before the first tap.

- **No data lost** the agent MUST NOT tap, click or press a control whose
  label, icon or hint matches a stop word. This holds when the flow under
  test is that very control: the report MUST list it as skipped.
- **Read before each tap** the label of each control MUST be read from the
  UI tree first: `uiautomator dump` on Android, the accessibility tree in a
  browser. An icon with no label or hint MUST be skipped.
- **Confirm dialogs** a dialog that asks to confirm a stop word action MUST
  be closed through Cancel, No or the back key.
- **Gestures** swipe a list row, long press, drag to a bin and select all
  MUST NOT run. They hide delete actions behind no label.
- **Unsure** a control that might lose data MUST count as a stop word. The
  agent MUST skip it and note it in the report.

The person's data MUST stay as it was:

- **Existing rows** the agent MAY read, open and scroll them. It MUST edit
  only rows the walk created itself.
- **New rows** each name or title MUST start with `E2E`, such as `E2E shopping
  list`. They stay after the walk, and the report MUST list them.
- **Shell** `adb uninstall`, `pm clear`, `rm` on the device, `run-as` and any
  write to the app database or storage MUST NOT run.
- **Accounts** the agent MUST NOT sign in to an account or enter a password.
  A flow behind a sign in MUST be skipped.
- **Other people** the agent MUST NOT send a message, invite, share, post,
  payment or purchase. A share sheet MUST be closed once it opens.

Data lost all the same? The agent MUST stop the walk at once. It SHOULD press
Undo when the app shows it, then MUST report what went and what came back.

## 2. Pick the target

The agent MUST read `README.md`, `docs/features.md`, `docs/user-flows.md` and
the release workflow to learn where the app runs, then pick the target here:

| The app                  | The target                                                 |
| ------------------------ | ---------------------------------------------------------- |
| Android, Expo, Capacitor | the APK of the newest release, on an emulator or the phone |
| Web, PWA, static site    | the live web build under `workbench-soft.github.io`        |
| Tauri, Windows           | the installer of the newest release, on this PC            |

- **Emulator first** a running emulator SHOULD win over the person's phone,
  since it holds no real data. The agent SHOULD use the phone only when no
  emulator runs, or when the person asks for it.
- **Both** an app with a web build and an APK SHOULD be walked on Android.
  The agent SHOULD add the web when the person asks or a flow is web only.
- **Named device** the arguments name a package and an adb serial, as the
  E2E walk button of the Archon Apps tab sends? The agent MUST walk the build
  installed there, and MUST skip the install step.

## 3. Install the newest release

The agent MUST read [references/drive.md](references/drive.md) for the
commands.

- **Where releases sit** the private app repos publish to
  `workbench-soft/workbench-soft.github.io` with the tag `<repo>-v<version>`.
  A public repo MAY keep its releases in its own repo.
- **Android** the agent MUST download the APK to the scratch folder and
  install it with `adb install -r -d`. The `-r` keeps the app data.
- **Web** the agent MUST open the live URL in a fresh browser profile, so the
  walk sees no stored data of the person.
- **Windows** the agent MUST run the installer from the release. An install
  that asks to remove the old version or its data MUST stop there.
- **Version** the agent MUST note the version that runs, from the app's
  About screen or `dumpsys package`.

## 4. List the main flows

`e2e/flows.json` already there? The agent MUST walk the same list, and
SHOULD add or drop a flow only for a feature that changed. Otherwise it MUST
write the list from `docs/user-flows.md`, `docs/features.md` and the README,
in this shape:

```json
[
  {
    "name": "add-task",
    "platform": "android",
    "steps": "open the app, tap +, type E2E milk, save",
    "expect": "E2E milk shows at the top of Today"
  }
]
```

- **Pick** the list SHOULD hold 4 to 10 flows: the first screen, each main
  action once, the result of each, settings and the language picker.
- **Read only flows** a flow that only views data SHOULD come first, since it
  risks the least.
- **Stop word flows** a flow whose point is to delete, reset or sign out MUST
  go in the list with `"skip": "deletes data"`, so the report shows the gap.

## 5. Walk each flow

The agent MUST walk the flows in the order of the list. For each step:

1. The agent MUST read the UI tree and find the control by its label.
2. It MUST check the label, the hint and the icon against the stop words.
3. It MAY then tap or type, and MUST wait for loading to end.
4. It MUST take a screenshot to the scratch folder.
5. It MUST compare the screen with `expect`.

- **Errors** the agent MUST read `adb logcat -b crash` on Android and the
  console in the browser after each flow. A crash or an uncaught error MUST
  fail the flow.
- **Fail** a screen that differs from `expect` MUST fail the flow. The agent
  MUST keep its screenshot and go on with the next flow.
- **Language** the agent SHOULD switch to one other language of the app on
  one screen, then back. A raw key such as `home.title` or English text left
  over MUST count as a bug.
- **Stuck** a flow that can't go on after 2 tries MUST be marked failed, and
  the walk moves on.

## 6. Report back

The agent MUST commit `e2e/flows.json` and ship it by the repo's rules.
Screenshots SHOULD stay in the scratch folder. The report MUST use this
table:

| Flow        | Result  | Note                                  |
| ----------- | ------- | ------------------------------------- |
| add-task    | pass    |                                       |
| share-list  | skipped | the share sheet sends to other people |
| delete-task | skipped | deletes data                          |

- **Bugs** each failure MUST go in `TODO.md` under `## E2E walk <date>`: the
  flow, the version, what it showed and what it ought to show.
- **Screenshots** the agent MUST send the screenshot of each failure to the
  person.
- **Rows made** the report MUST list each `E2E` row the walk created, so the
  person removes them by hand.
- **Skipped** the report MUST name each control skipped as a stop word, with
  the screen it sits on.
- **Fixes** this skill MUST only report. A fix of a bug MUST be a separate
  task.
