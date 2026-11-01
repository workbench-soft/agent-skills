# Capture commands per platform

The agent MUST run these in Git Bash. PowerShell 5.1 `>` rewrites binary
output and breaks a PNG. Each tool MUST come through mise:
`mise use ffmpeg@9 oxipng@10`.

## Android over adb

The agent MUST pick the device. An emulator shows as `emulator-5554`:

```sh
adb devices -l
emulator -list-avds && emulator -avd <name> -no-snapshot-save &
```

The agent SHOULD clean the status bar through the demo mode:

```sh
adb shell settings put global sysui_demo_allowed 1
d() { adb shell am broadcast -a com.android.systemui.demo -e command "$@"; }
d enter; d clock -e hhmm 1200; d battery -e level 100 -e plugged false
d network -e wifi show -e level 4; d notifications -e visible false
```

The agent MUST shoot, then record a flow. `screenrecord` stops at 180
seconds:

```sh
adb exec-out screencap -p > docs/screenshots/01-home.png
adb shell screenrecord --time-limit 30 --bit-rate 8000000 /sdcard/demo.mp4
adb pull /sdcard/demo.mp4 raw.mp4 && adb shell rm /sdcard/demo.mp4
```

- **Taps** the agent MAY use `adb shell input tap <x> <y>` and
  `adb shell input text`. It SHOULD read the coordinates from
  `adb shell uiautomator dump` and `adb pull /sdcard/window_dump.xml`.
- **Touches** `adb shell settings put system show_touches 1` MAY show taps
  in the video. The agent MUST set it back to 0 after.
- **End** the agent MUST turn the demo mode off with `d exit`.

## Web through Playwright

The agent MUST add `playwright` as a dev dependency and write
`demo/capture.ts`. It MUST open each shot of `demo/shots.json` and save it:

```ts
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  locale: "en-US",
  colorScheme: "light",
  recordVideo: { dir: "raw", size: { width: 1280, height: 800 } },
});
const page = await context.newPage();
await page.goto(url);
await page.screenshot({ path: "docs/screenshots/01-home.png" });
```

- **Video** Playwright saves the video when `context.close()` runs. The
  agent MUST rename it to the shot name.
- **Phone size** the 390 × 844 shots MUST use a second context at
  `devices["iPhone 15"]`.

## Windows desktop app

The agent SHOULD size the window to 1280 × 800, then MUST record it by its
title:

```sh
ffmpeg -f gdigrab -framerate 30 -i title="<Window title>" -t 30 raw.mp4
ffmpeg -f gdigrab -i title="<Window title>" -frames:v 1 docs/screenshots/01-home.png
```

The agent MUST drive the window through its computer use tools while
ffmpeg records. A CLI MUST get the same: a terminal window with a large font.

## Trim, GIF, squeeze, check

The agent MUST trim, convert, squeeze and split each capture with these:

```sh
ffmpeg -ss 2 -to 24 -i raw.mp4 -an -c:v libx264 -crf 23 -movflags +faststart out.mp4
ffmpeg -t 15 -i out.mp4 -vf "fps=12,scale=420:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse" -loop 0 out.gif
oxipng -o 4 --strip safe docs/screenshots/*.png
ffmpeg -i out.mp4 -vf fps=1 "$scratch/frame-%03d.png"
```

- **Audio** `-an` MUST drop it. The agent MAY keep audio only for a
  narrated video the person recorded.
- **Frames** they MUST go to the scratch folder, outside the repo.
