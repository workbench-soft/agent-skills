---
name: app-update
description: 'Use when someone wants in-app updates added, fixed or checked for an app that gets installed outside a store, such as an APK from GitHub releases, a sideloaded Android build or a desktop installer. Triggers: "add auto update", "check for updates button", "update from GitHub releases", "show the download progress", "добавь автообновление", "кнопка проверить обновления". Adds a check at launch and whenever the app returns to the front, a Check for updates button in Settings that reports checking, found or up to date, and a download in the header with percent, megabytes, a progress bar and a cancel button. Sends a system notification once the update is ready or when no newer version exists. Leaves all of it out of the Google Play build so Play review passes, verifies the built bundle for it, then tests on the device.'
---

# Add in-app updates

When GitHub has a newer release, the app downloads it with progress on screen
and then opens the installer. The store updates the Google Play build, so that
build carries none of this code. Section 4 covers how.

## 1. Read the project

The repo rules MUST override this skill. Start with `AGENTS.md`, `CLAUDE.md`
and the README, then look for what is already there:

```bash
grep -rnIlE -i 'releases/latest|check for updates|newerRelease|REQUEST_INSTALL_PACKAGES' --exclude-dir={node_modules,build,dist,out,.git} .
ls .github/workflows; grep -rn 'apk\|release' .github/workflows | head -20
```

1. **Stack** one of Expo, Capacitor, Tauri, native Kotlin or a Trusted Web
   Activity. The APIs for the stack you find are in `references/stacks.md`.
2. **Release** each GitHub release MUST get a signed APK from a workflow, with
   a higher version code and the same signing key. Missing that workflow? Add
   it before anything else, or the check has no file to install.
3. **Store build** work out how the Google Play or App Store build gets made: a
   Gradle flavor, an env var such as `PLAY=1`, its own workflow job. The two
   builds still share one path? Section 4 splits them.
4. **Existing code** mark every item of section 2 as done, partial or missing.
   Touch only what is missing.

## 2. What the person sees

### On start and on return

- **Quiet check** once the first screen has drawn, the app asks GitHub away
  from the UI thread. A GitHub error or a missing connection MUST show no sign.
- **Back in front** every return of the app to the front MUST run the same
  check, so a release published while it was in the background appears.
- **Once at a time** a return check SHOULD be skipped while a check, the dialog
  or a download is running, and for 5 minutes after GitHub last answered.
- **Newer version** a dialog asks yes or no. It shows the version, the size in
  MB, a warning when on mobile data, and Update and Later.
- **Answered** once the person picks Later or Update for a version, returns
  SHOULD stay quiet about it until the next cold start. Settings still lists it.
- **No newer version** the app shows no sign and deletes the old downloaded
  APKs.

### Settings button

- **Idle** an actual button reading "Check for updates".
- **Checking** a spinner and the label "Checking for updates…". The button
  ignores taps until the check is over.
- **Found** the line "Version 1.4.0 is out." appears under the button, then the
  dialog from the start check.
- **Up to date** a green line reads "You have the latest version, 1.3.2.", and
  a system notification repeats it.
- **Failed** a red line gives the reason: "Could not check for updates: …".
- **Fresh answer** the result line SHOULD empty as the next check begins, so
  the person doesn't take the old answer for the new one.

### Download

- **Header** during the APK download, every main screen header shows
  `↓ 42% · 12.3/29.0 MB` with a thin progress bar below and a cross that
  cancels. The app has no header? A banner on the home screen does it instead.
- **Settings** the button becomes "Cancel the download" and shows the same bar
  with a longer line: "Downloading the update: 12.3 of 29.0 MB (42%)".
- **Unknown size** the bar sweeps back and forth instead of filling, and the
  line gives only the MB downloaded so far.
- **Redraw** the progress store SHOULD notify its readers once per whole
  percent or 0.1 MB, rather than once per chunk.
- **Cancel** the download stops right away, the partial file is deleted and the
  installer stays shut. The header returns to its normal look.

### Ready

- **Notification** reads "Version 1.4.0 is ready. Tap to install." A tap opens
  the installer on the downloaded file.
- **Installer** also opens at once if the app is in front.
- **Cache** the version MUST be part of the APK name. A second tap installs the
  file on disk, and a download that broke off fails the size check and runs
  again.
- **Denied notifications** the line inside the app still appears. The update
  MUST NOT rely on the notification permission.

## 3. Build it

Each file does one job and stays small. A typical split:

| File | Job |
| --- | --- |
| `update/latest-release` | asks GitHub, returns the newer release or null |
| `update/is-newer` | compares two versions, with a unit test |
| `update/install-update` | downloads with progress and cancel, opens the installer |
| `update/apk-file` | the cached APK name, the size check, deleting old ones |
| `update/notify-update` | the ready and up-to-date notifications, the tap handler |
| `update/offer-update` | the check on start and on return to the front |
| `ui/UpdateButton` | the Settings button and its result line |
| `ui/UpdateProgress` | the header line, bar and cross |

- **One progress store** Settings and the header MUST read a single store, so
  their numbers match and a cancel from either one stops the one download.
- **One download** a tap during a running download MUST attach to it.
- **Text** each string passes through the repo's i18n, for every language the
  repo has.
- **Accessibility** the result line is a live region. The bar carries the
  progressbar role and a label, and the cross carries a label.
- **Notification channel** a channel called "Updates", kept apart from the
  others, so the person can mute just that one.

On Android the app needs `REQUEST_INSTALL_PACKAGES`, `POST_NOTIFICATIONS` from
Android 13 on, and a FileProvider for the APK path. Generated native folders
MUST be changed through the repo's config, and hand edits there are out.

## 4. Keep it out of the Google Play build

Play turns down an app that "may not modify, replace, or update itself using
any method other than Google Play's update mechanism" (Device and Network Abuse
policy). `REQUEST_INSTALL_PACKAGES` is a restricted permission, and Play
rejects an app that holds it with no installer use case.

- **Separate build** the Play build MUST be made from its own flavor or build
  config. A run-time `if` on its own fails review, since the reviewer scans the
  bundle.
- **No code** the update code MUST be absent from the Play build: no GitHub
  URL, no download or installer calls, no update plugin. Keep that code in a
  `github` source set, or replace the module with an empty stub at build time.
- **No permission** `REQUEST_INSTALL_PACKAGES` and the update FileProvider MUST
  NOT appear in the Play manifest. Strip them with `tools:node="remove"`, or
  declare them in the `github` manifest only.
- **No UI** the Play build MUST ship without the Settings button, the header
  progress and the update notification channel.
- **Same signing** the two builds MAY use one release key, so a Play install
  and a GitHub APK can still update each other.

Run the checks on the built bundle rather than the source. Each of the three
MUST print no output:

```bash
bundletool dump manifest --bundle app-play.aab | grep -i REQUEST_INSTALL_PACKAGES
unzip -p app-play.aab 'base/dex/*.dex' 'base/assets/*' | strings | grep -i 'releases/latest'
unzip -l app-play.aab | grep -iE 'update.*plugin|apk-file'
```

- **In CI** wrap the three checks in a script that runs after the Play bundle
  step and fails the job, so a leak blocks the release.
- **One build at a time** while another Gradle build runs on the machine, a
  local one MUST wait: `pgrep -f GradleDaemon`. Builds of several repos in
  parallel freeze the computer. If the user asks for no builds, CI does the
  check.

The split for each stack is in `references/play-build.md`.

## 5. Test on the device

1. Make an APK whose version is below the latest release.
2. Launch the app in airplane mode, and no dialog appears. Switch the network
   on, go to another app and come back, and the dialog offers the release.
3. Pick Later, then Check for updates. The button reads "Checking for
   updates…", then the found line and the dialog appear.
4. Pick Update, and the header shows percent, MB and the bar. Cancel, and the
   header goes back to normal.
5. Update once more and let it complete. The notification appears and the
   installer opens. Install it.
6. Run Check for updates again. The green line and the notification report the
   latest version.

When no one is around for a step that needs a person, such as tapping Install,
it goes in `TODO.md`.

## 6. Finish

- **Commit** follow the repo rules, with one logical change in each commit.
- **Docs** `docs/features.md` states that the app updates itself from GitHub
  and how a store build differs.
- **Report** a line for each section 2 item that changed.
