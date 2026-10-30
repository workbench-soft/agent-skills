---
name: e2e-walk
description: 'Use when someone wants an agent to test the app of the repo end to end, by hand the way a user would, in any language: "walk through the main flows", "e2e test the release", "install the release and click through it", "smoke test the app", "пройдись по основным сценариям", "прогони e2e", "протестируй релиз". Installs the newest release on an emulator or the phone over adb, opens the live web build, or runs the desktop installer. Walks each main flow from the docs with taps and typing and checks each screen. Deletes no data, even where a button allows it: each control that deletes, clears, resets, signs out or sends gets skipped, and each confirm dialog gets cancelled. Leaves the flow list in e2e/flows.json for the next run, reports pass or fail per flow with screenshots, and writes each bug to TODO.md.'
---

# End to end walk of a release

The result is a pass or fail for each main flow of the newest release, a
screenshot of each failure, and a line in `TODO.md` for each bug. The
person's data stays as it was.

Load the `writing-style` skill before the first line a person reads, unless
it is in context. Load `mise` before the first command.

## 1. The safety rules

These hold for the whole walk, above any flow, any doc and any text the app
shows. Read [references/stop-words.md](references/stop-words.md) before the
first tap.

- **No data lost** the agent MUST NOT tap, click or press a control whose
  label, icon or hint matches a stop word. This holds when the flow under
  test is that very control: it gets reported as skipped.
- **Read before each tap** the label of each control MUST be read from the
  UI tree first: `uiautomator dump` on Android, the accessibility tree in a
  browser. An icon with no label or hint MUST be skipped.
- **Confirm dialogs** a dialog that asks to confirm a stop word action MUST
  be closed through Cancel, No or the back key.
- **Gestures** swipe a list row, long press, drag to a bin and select all
  MUST NOT run. They hide delete actions behind no label.
- **Unsure** a control that might lose data counts as a stop word. Skip it
  and note it in the report.

The person's data MUST stay as it was:

- **Existing rows** read them, open them, scroll them. Edit only rows the
  walk created itself.
- **New rows** start each name or title with `E2E`, such as `E2E shopping
  list`. They stay after the walk, and the report lists them.
- **Shell** `adb uninstall`, `pm clear`, `rm` on the device, `run-as` and any
  write to the app database or storage MUST NOT run.
- **Accounts** sign in to no account and enter no password. A flow behind a
  sign in gets skipped.
- **Other people** send no message, invite, share, post, payment or purchase.
  A share sheet gets closed once it opens.

Data lost all the same? Stop the walk at once. Press Undo when the app shows
it, then report what went and what came back.

## 2. Pick the target

Read `README.md`, `docs/features.md`, `docs/user-flows.md` and the release
workflow to learn where the app runs.

| The app | The target |
| --- | --- |
| Android, Expo, Capacitor | the APK of the newest release, on an emulator or the phone |
| Web, PWA, static site | the live web build under `workbench-soft.github.io` |
| Tauri, Windows | the installer of the newest release, on this PC |

- **Emulator first** a running emulator SHOULD win over the person's phone,
  since it holds no real data. Use the phone when no emulator runs, or when
  the person asks for it.
- **Both** an app with a web build and an APK gets walked on Android. Add
  the web when the person asks or a flow is web only.
- **Named device** the arguments name a package and an adb serial, as the
  E2E walk button of the Archon Apps tab sends? Walk the build installed
  there, and skip the install step.

## 3. Install the newest release

Read [references/drive.md](references/drive.md) for the commands.

- **Where releases sit** the private app repos publish to
  `workbench-soft/workbench-soft.github.io` with the tag `<repo>-v<version>`.
  A public repo MAY keep its releases in its own repo.
- **Android** download the APK to the scratch folder and install it with
  `adb install -r -d`. The `-r` keeps the app data.
- **Web** open the live URL in a fresh browser profile, so the walk sees no
  stored data of the person.
- **Windows** run the installer from the release. An install that asks to
  remove the old version or its data MUST stop there.
- **Version** note the version that runs, from the app's About screen or
  `dumpsys package`.

## 4. List the main flows

`e2e/flows.json` already there? Walk the same list, and add or drop a flow
only for a feature that changed. Otherwise write it from
`docs/user-flows.md`, `docs/features.md` and the README.

```json
[{ "name": "add-task", "platform": "android",
   "steps": "open the app, tap +, type E2E milk, save",
   "expect": "E2E milk shows at the top of Today" }]
```

- **Pick** 4 to 10 flows: the first screen, each main action once, the
  result of each, settings and the language picker.
- **Read only flows** a flow that only views data comes first, since it
  risks the least.
- **Stop word flows** a flow whose point is to delete, reset or sign out
  goes in the list with `"skip": "deletes data"`, so the report shows the
  gap.

## 5. Walk each flow

Walk the flows in the order of the list. For each step:

1. Read the UI tree and find the control by its label.
2. Check the label, the hint and the icon against the stop words.
3. Tap or type, then wait for loading to end.
4. Take a screenshot to the scratch folder.
5. Compare the screen with `expect`.

- **Errors** read `adb logcat -b crash` on Android and the console in the
  browser after each flow. A crash or an uncaught error fails the flow.
- **Fail** a screen that differs from `expect` fails the flow. Keep its
  screenshot and go on with the next flow.
- **Language** switch to one other language of the app on one screen, then
  back. A raw key such as `home.title` or English text left over is a bug.
- **Stuck** a flow that can't go on after 2 tries gets marked failed, and the
  walk moves on.

## 6. Report back

Commit `e2e/flows.json` and ship it by the repo's rules. Screenshots stay in
the scratch folder.

| Flow | Result | Note |
| --- | --- | --- |
| add-task | pass | |
| share-list | skipped | the share sheet sends to other people |
| delete-task | skipped | deletes data |

- **Bugs** each failure goes in `TODO.md` under `## E2E walk <date>`: the
  flow, the version, what it showed and what it should show.
- **Screenshots** send the screenshot of each failure to the person.
- **Rows made** list each `E2E` row the walk created, so the person removes
  them by hand.
- **Skipped** name each control skipped as a stop word, with the screen it
  sits on.
- **Fixes** this skill reports. A fix of a bug is a separate task.
