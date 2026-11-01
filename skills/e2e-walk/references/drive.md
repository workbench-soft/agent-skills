# Install and drive the app

The agent MUST run these in Git Bash, so a PNG from `adb exec-out` stays
whole. Downloads MUST go to the scratch folder of the session, outside the
repo.

## Find the newest release

The tag SHOULD start with the repo name, apart from a few apps: `memories`
publishes as `memories-mobile`, `spotthecam` as `speed-camera-map`. The agent
MUST take the tag from the `tag` field of `launcher/apps.json` in the
workspace repo, which lists each app, and run:

```sh
rel=workbench-soft/workbench-soft.github.io
GH_PAGER=cat gh release list -R $rel -L 50 --json tagName -q '.[].tagName' | grep -m1 '^<repo>-v'
GH_PAGER=cat gh release download <tag> -R $rel -p '*.apk' -D "$scratch/release"
```

The agent MAY use the Install button on the Archon Apps tab instead, which
does the same download and install for the phone plugged in.

## Android over adb

The agent MUST install and start the app with these:

```sh
adb devices -l
adb -s <serial> install -r -d "$scratch/release/<file>.apk"
adb -s <serial> shell dumpsys package <package> | grep versionName
adb -s <serial> shell monkey -p <package> 1
```

- **Device** an `emulator-5554` serial SHOULD win. Two devices or more? The
  agent MUST pass `-s` on each command.
- **Install fails** `INSTALL_FAILED_UPDATE_INCOMPATIBLE` means another key
  signed the installed app. The agent MUST stop and report it, since the fix
  is an uninstall that loses data.

The agent MUST read the screen, then tap by the bounds of a node:

```sh
adb exec-out uiautomator dump /dev/tty
adb shell input tap <x> <y>
adb shell input text 'E2E%smilk'
adb shell input keyevent KEYCODE_BACK
adb exec-out screencap -p > "$scratch/<flow>-<step>.png"
```

- **Labels** each node has `text`, `content-desc` and `bounds`. The agent
  MUST check both labels against the stop words, then tap the middle of
  `bounds`.
- **Text** the agent MUST type a space as `%s`.
- **Crashes** the agent MUST run `adb logcat -b crash -d -t 200` after each
  flow. A line with the package name MUST fail the flow.

## Web

- **Browser** the agent MAY use its own browser tools, or Playwright with a
  new context. Each MUST hold no data of the person.
- **Labels** the agent MUST read the accessibility tree before each click:
  the role and the name of the control. A button named only by an icon MUST
  count as unlabelled.
- **Errors** the agent MUST read the console after each flow. An uncaught
  error or a failed request to the app's own API MUST fail the flow.

## Windows app

The agent MUST download the installer with:

```sh
GH_PAGER=cat gh release download <tag> -R $rel -p '*.msi' -p '*setup*.exe' -D "$scratch/release"
```

- **Install** the agent SHOULD run the installer and accept the defaults. It
  MUST stop at any page that offers to remove data or an older version.
- **Drive** the agent SHOULD click and type in the window with the computer
  use tools.
- **Labels** the agent MUST read each control in a zoomed screenshot. It
  SHOULD hover an icon to read its tooltip, and MUST skip an icon with none.
