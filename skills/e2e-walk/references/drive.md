# Install and drive the app

Run these in Git Bash, so a PNG from `adb exec-out` stays whole. Downloads go
to the scratch folder of the session, outside the repo.

## Find the newest release

The tag starts with the repo name, apart from a few apps: `memories` publishes
as `memories-mobile`, `spotthecam` as `speed-camera-map`. The `tag` field of
`launcher/apps.json` in the workspace repo lists each app.

```sh
rel=workbench-soft/workbench-soft.github.io
GH_PAGER=cat gh release list -R $rel -L 50 --json tagName -q '.[].tagName' | grep -m1 '^<repo>-v'
GH_PAGER=cat gh release download <tag> -R $rel -p '*.apk' -D "$scratch/release"
```

The Install button on the Archon Apps tab does the same download and install
for the phone plugged in.

## Android over adb

```sh
adb devices -l
adb -s <serial> install -r -d "$scratch/release/<file>.apk"
adb -s <serial> shell dumpsys package <package> | grep versionName
adb -s <serial> shell monkey -p <package> 1
```

- **Device** an `emulator-5554` serial SHOULD win. Two devices or more?
  Pass `-s` on each command.
- **Install fails** `INSTALL_FAILED_UPDATE_INCOMPATIBLE` means another key
  signed the installed app. Stop and report it, since the fix is an
  uninstall that loses data.

Read the screen, then tap by the bounds of a node:

```sh
adb exec-out uiautomator dump /dev/tty
adb shell input tap <x> <y>
adb shell input text 'E2E%smilk'
adb shell input keyevent KEYCODE_BACK
adb exec-out screencap -p > "$scratch/<flow>-<step>.png"
```

- **Labels** each node has `text`, `content-desc` and `bounds`. Check both
  labels against the stop words, then tap the middle of `bounds`.
- **Text** `%s` types a space.
- **Crashes** `adb logcat -b crash -d -t 200` after each flow. A line with the
  package name fails the flow.

## Web

- **Browser** the agent's own browser tools, or Playwright with a new
  context. Each holds no data of the person.
- **Labels** read the accessibility tree before each click: the role and the
  name of the control. A button named only by an icon counts as unlabelled.
- **Errors** read the console after each flow. An uncaught error or a failed
  request to the app's own API fails the flow.

## Windows app

```sh
GH_PAGER=cat gh release download <tag> -R $rel -p '*.msi' -p '*setup*.exe' -D "$scratch/release"
```

- **Install** run the installer and accept the defaults. Stop at any page
  that offers to remove data or an older version.
- **Drive** the computer use tools click and type in the window.
- **Labels** read each control in a zoomed screenshot. Hover an icon to read
  its tooltip, and skip an icon with none.
