# Capture commands per platform

Run these in Git Bash. PowerShell 5.1 `>` rewrites binary output and breaks
a PNG. Each tool comes through mise: `mise use ffmpeg@9 oxipng@10`.

## Android over adb

Pick the device. An emulator shows as `emulator-5554`:

```sh
adb devices -l
emulator -list-avds && emulator -avd <name> -no-snapshot-save &
```

Clean status bar through the demo mode:

```sh
adb shell settings put global sysui_demo_allowed 1
d() { adb shell am broadcast -a com.android.systemui.demo -e command "$@"; }
d enter; d clock -e hhmm 1200; d battery -e level 100 -e plugged false
d network -e wifi show -e level 4; d notifications -e visible false
```

Shoot, then record a flow. `screenrecord` stops at 180 seconds:

```sh
adb exec-out screencap -p > docs/screenshots/01-home.png
adb shell screenrecord --time-limit 30 --bit-rate 8000000 /sdcard/demo.mp4
adb pull /sdcard/demo.mp4 raw.mp4 && adb shell rm /sdcard/demo.mp4
```

- **Taps** `adb shell input tap <x> <y>` and `adb shell input text`. Read
  the coordinates from `adb shell uiautomator dump` and
  `adb pull /sdcard/window_dump.xml`.
- **Touches** `adb shell settings put system show_touches 1` shows taps in
  the video. Set it back to 0 after.
- **End** `d exit` turns the demo mode off.

## Web through Playwright

Add `playwright` as a dev dependency and write `demo/capture.ts`. It opens
each shot of `demo/shots.json` and saves it:

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

- **Video** Playwright saves the video when `context.close()` runs. Rename
  it to the shot name.
- **Phone size** a second context at `devices["iPhone 15"]` for the
  390 × 844 shots.

## Windows desktop app

Size the window to 1280 × 800, then record it by its title:

```sh
ffmpeg -f gdigrab -framerate 30 -i title="<Window title>" -t 30 raw.mp4
ffmpeg -f gdigrab -i title="<Window title>" -frames:v 1 docs/screenshots/01-home.png
```

The agent drives the window through its computer use tools while ffmpeg
records. A CLI gets the same: a terminal window with a large font.

## Trim, GIF, squeeze, check

```sh
ffmpeg -ss 2 -to 24 -i raw.mp4 -an -c:v libx264 -crf 23 -movflags +faststart out.mp4
ffmpeg -t 15 -i out.mp4 -vf "fps=12,scale=420:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse" -loop 0 out.gif
oxipng -o 4 --strip safe docs/screenshots/*.png
ffmpeg -i out.mp4 -vf fps=1 "$scratch/frame-%03d.png"
```

- **Audio** `-an` drops it. Keep audio only for a narrated video the person
  recorded.
- **Frames** go to the scratch folder, outside the repo.
