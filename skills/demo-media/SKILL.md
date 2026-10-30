---
name: demo-media
description: 'Use when someone wants screenshots, a screen recording, a demo video or a GIF of the repo''s app, or wants them in the README, in any language: "take screenshots for the README", "record a demo video", "make a demo of the app", "run it on the phone and record it", "сними скриншоты", "запиши видео для демо", "добавь скрины в ридми". Reads the repo for its main flows, writes made-up demo data that looks like real use, runs the app on the web, the desktop, an emulator or a phone over adb, and captures each screen and a short video. Checks every frame for real people, faces, emails, tokens and private files, and retakes the bad ones. Saves the media in docs/screenshots/ with a GIF for each video, adds a Screenshots section to the README, and leaves demo/shots.json so the next run takes the same shots.'
---

# Demo screenshots and videos

The result is a set of screenshots and short videos of the app, made from
demo data, saved in `docs/screenshots/` and shown in the README. A rerun
takes the same shots from `demo/shots.json`.

Load the `writing-style` skill before the first line a person reads, unless
it is in context. Load `mise` before the first command.

## 1. Learn what to show

Read `README.md`, `docs/features.md`, the store or site text and the main
screens. Pick 4 to 8 shots that tell one story, the way a new user meets the
app:

1. The first screen with data in it, the one that says what the app does.
2. The main action, done once.
3. The result of that action.
4. One or two features that set the app apart, such as sharing or offline.
5. Settings or the language picker, only when the app sells on them.

- **Video** 1 or 2 clips of 10 to 30 seconds, each one flow from start to
  end. A clip with no action in it MUST go.
- **Old shots** `demo/shots.json` already there? Take the same list, and add
  or drop shots only for features that changed.

Write the list to `demo/shots.json`:

```json
[{ "name": "01-home", "platform": "android", "caption": "Today's tasks at a glance",
   "steps": "open the app, demo data loaded" },
 { "name": "flow-add-task", "platform": "web", "video": true, "steps": "tap +, type, save" }]
```

## 2. Write the demo data

Read [references/demo-data.md](references/demo-data.md) before the first
row. The data MUST tell a story a stranger believes, with no real person in
it.

- **Where** in `demo/` at the repo root: a seed file, a fixture or a script
  that fills the app. The app MUST load it through its normal import, seed or
  sync path, so the shots match what a user sees.
- **Apart from real data** a demo account, a demo database or a debug build
  with its own package name. The person's own account and data stay
  untouched.
- **Committed** the demo data goes in git, so the next run uses the same
  rows. It holds no secret, so it is safe to commit.

## 3. Run the app

Read [references/capture.md](references/capture.md) for the commands of each
platform. Find how the repo runs through `mise tasks ls`, `package.json` and
the README.

| The repo | Where the shots come from |
| --- | --- |
| Expo, React Native | an Android emulator, or a phone over adb, plus the web build |
| Capacitor, Next.js | the web build in Playwright, plus the Android build over adb |
| Native Android | an emulator, or a phone over adb |
| Tauri, desktop | the app window on Windows |
| Astro, a static site | the built site in Playwright |
| CLI | a terminal recording with a short demo script |

- **Emulator first** an emulator SHOULD win over the person's phone. Use the
  phone when the app needs its camera or sensors, or when no emulator image
  is set up.
- **The person's phone** install a debug build with its own package name.
  `pm clear` and an uninstall of the release app MUST NOT run there.
- **Clean screen** turn on the Android demo mode for a full battery, full
  signal, 12:00 and no notification icons. Turn it off after the shots.
- **Size** phone shots at the device size, 1080 × 2400 or close. Web shots
  at 1280 × 800, plus 390 × 844 when the site is made for phones.
- **Theme** take the light theme. Add dark versions only when the app sells
  on its dark theme.
- **Language** English. Other languages only when the person asks.

## 4. Capture

Take each shot of `demo/shots.json` in order, with the commands from
`references/capture.md`.

- **Names** `docs/screenshots/<name>.png`, `<name>.mp4` and `<name>.gif`,
  the names from `demo/shots.json`.
- **Wait** for loading to end: no spinner, no half drawn list, no keyboard
  over the content unless the shot is about typing.
- **Video** record the flow at a calm pace, with a short pause on the
  result. Cut the dead time at the start and the end with ffmpeg.
- **GIF** for each video, a GIF of up to 15 seconds at 10 to 15 fps and 360
  to 480 px wide. It SHOULD stay under 5 MB.
- **Sizes** PNG through a lossless squeeze, MP4 at H.264 under 10 MB each.

## 5. Check every frame

Open each PNG and look at it. For each video, pull one frame per second with
ffmpeg and look at each frame. A shot MUST be retaken when it shows any of
these:

- **People** a real name, a face, an avatar photo, a voice in the audio.
- **Contact data** a real email, phone number, street address or a precise
  location of the person.
- **Secrets** a token, an API key, a password, a session id in a URL bar.
- **The machine** the person's file paths, user name, other apps, the
  notification shade, other browser tabs.
- **Rough edges** an error toast, a debug banner, lorem ipsum, "test" rows,
  an empty state where data was planned.

Then judge it as a stranger: does the shot say what the app does, and would
it make someone install it? Retake a dull shot with better data or a better
moment.

## 6. Put it in the README

Add or update a `## Screenshots` section after the first paragraph of the
README:

```markdown
<p><img src="docs/screenshots/01-home.png" width="240" alt="Today's tasks at a glance">
<img src="docs/screenshots/02-add.png" width="240" alt="Add a task in one tap"></p>

[![Add a task, then share the list](docs/screenshots/flow-add-task.gif)](docs/screenshots/flow-add-task.mp4)
```

- **Inline** GitHub doesn't play an MP4 from the repo in a README. The GIF
  plays, and its link opens the MP4.
- **Alt text** the caption from `demo/shots.json`, in the README language.
- **Rows** 3 phone shots or 2 web shots per row read well on GitHub.
- **Old files** delete the shots that `demo/shots.json` no longer lists.

## 7. Ship it

- **Mise** `ffmpeg` and the tools the capture needed go in `mise.toml`
  through `mise use`.
- **Task** add a `demo` task to `mise.toml` when the capture runs from a
  script, so the next run is one command.
- **Docs** the README section, plus a line in `docs/features.md` when the
  repo keeps one.
- **PR** commit `demo/`, `docs/screenshots/` and the README, then ship it by
  the repo's rules.

## 8. Report back

- **Shots** a line per shot: its name and what it shows.
- **Checked** say each frame was checked, and name the shots retaken.
- **Next** the `store-media` skill uploads the same shots to Google Play.
