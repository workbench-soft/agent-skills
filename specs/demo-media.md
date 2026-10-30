# Demo screenshots and videos for each app

## What it does for the person

- **Run and shoot** the agent starts the app of the repo on the web, the
  desktop or an Android phone over adb, and takes screenshots and short
  videos of its main flows.
- **Demo data** the shots show made-up data that looks like real use: a
  coherent story, real looking names and numbers. Test rows and lorem ipsum
  stay out.
- **Safe to share** no real person, face, email, phone number, token or
  private file appears. The agent checks each frame before it keeps it.
- **README** the media lands in `docs/screenshots/` and the README shows it.
  A short GIF stands in for each video, since a README plays no repo video.
- **Stores and ads** a second skill uploads the same media and the icon to
  Google Play, checks AdMob and AdSense, and swaps the icon in every place it
  shows.
- **Reddit** the `marketing` skill attaches the screenshots and the GIF to
  the posts it drafts.

## User flows

1. The person ticks repos in the launcher and picks Demo media.
2. The agent reads the repo, picks the flows to show and writes demo data.
3. The agent runs the app with that data and captures each shot.
4. The agent checks each frame for private data and redoes the bad ones.
5. The agent commits the media and the README section in a PR.
6. Later the person picks Store media, and the agent uploads it to Google
   Play and swaps the icon in each place, with the person logged in.

## How it works: modules, files, data

- **`skills/demo-media`** the run, the demo data, the capture and the check.
  `references/demo-data.md` has the data rules, `references/capture.md` the
  commands for each platform.
- **`skills/store-media`** the upload to Play Console, the AdMob and AdSense
  checks and the icon swap. `references/sizes.md` has the sizes each place
  takes.
- **`demo/` in the app repo** the demo data and `demo/shots.json`, the list of
  shots with the steps to reach each one. A rerun takes the same shots.
- **`docs/screenshots/` in the app repo** the PNG, MP4 and GIF files.
- **Tools** adb from the Android platform tools, Playwright for the web,
  ffmpeg through mise for the video and the GIF.

## Limits

- **AdMob and AdSense** neither takes screenshots. AdMob reads the icon from
  the Play listing, and AdSense reads the site.
- **Play promo video** Play takes a YouTube link only. The person uploads the
  video to YouTube, or the agent does it in their logged in browser.
- **Real phone** the agent shoots a debug build with its own package name, or
  an emulator. It doesn't clear the data of the app the person uses.
- **Review** Play sends a listing change to review. The agent asks before it
  presses Send for review.

## Changes

### 2026-10-31 Demo media and store media skills

- **Why** the READMEs and the store listings have few or no screenshots, and
  the person wants them made the same way in every repo, without real data.
- **Changes** new `skills/demo-media` and `skills/store-media`. The
  `marketing` skill reads `docs/screenshots/` for Reddit posts. The README,
  the features doc and the changelog list both skills.
- **Steps** this spec, then `demo-media`, then `store-media`, then the
  `marketing` link and the docs.
- **Docs** `README.md`, `docs/features.md`, `CHANGELOG.md`.
