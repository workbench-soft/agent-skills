---
name: store-media
description: 'Use when someone wants the screenshots, the video, the feature graphic or the icon of an app updated in Google Play, AdMob, AdSense, the app''s site or any other place the app shows, in any language: "upload the screenshots to Google Play", "update the store listing graphics", "change the icon everywhere", "put the demo video on the store page", "залей скрины в гугл плей", "обнови иконку везде", "обнови графику в сторе". Takes the media from docs/screenshots/ and the icon from design/icons/, makes the sizes each place takes, then goes through Play Console, AdMob and AdSense in the browser with the person logged in. Uploads the store graphics, links the promo video, checks that AdMob and AdSense read the new icon and site, swaps the icon in the repo, the site, the GitHub preview and each installer, asks before any send for review, and ends with a table of each place and its state.'
---

# Store media and the icon in every place

The result is the same screenshots, video and icon in each place the app
shows: Google Play, the app's site, the repo and each installer. AdMob and
AdSense get checked, since they read the icon and the site from those places.

Load the `writing-style` skill before the first line a person reads, unless
it is in context. Load `mise` before the first command.

## Logins

- **Browser** drive the browser tool the agent has, such as Claude in
  Chrome, where the person is logged in. Without one, give the person the
  link and the clicks as numbered steps, and wait.
- **Login screen** the person logs in and says "done". The agent MUST NOT
  type a password, a 2FA code or card details.
- **Send for review** Play sends listing changes to review. Ask in the chat
  before pressing Send changes for review, with the list of changes.
- **Publish** ask before a YouTube upload goes live, even as unlisted.

## 1. Gather the media

- **Shots** `docs/screenshots/` and `demo/shots.json`. Missing or older than
  the last UI change? Run the `demo-media` skill first.
- **Icon** the picked SVG in `design/icons/<date>/`, marked in the commit the
  `icon-styles` skill made. A new icon request runs `icon-styles` first.
- **Places** find each place the app lives:

```bash
git grep -nE 'applicationId|"package"|ca-app-pub-|ca-pub-|workbench-soft.github.io' -- ':!*.lock'
ls design/icons public src-tauri/icons assets android/app/src/main/res 2>/dev/null
```

## 2. Make the sizes

Read [references/sizes.md](references/sizes.md) for the size, format and
limits of each place. Write the outputs to `design/store/`, so the next run
sees what went up.

- **Screenshots** pad or crop each phone shot to 1080 × 1920 on the app's
  background colour. A modern phone shot is too tall for Play as it is.
- **Feature graphic** draw it as an SVG or a small HTML page: the icon, the
  app name and one line on what it does, on the app colours. Render it with
  `resvg` or Playwright.
- **Icon** export the 512 px PNG from the picked SVG through the
  `icon-styles` export script.
- **Check** open each file and look at it. The rules of `demo-media` step 5
  apply to each one.

## 3. Google Play

Open Play Console, the app, then Grow users, Store presence, Main store
listing.

1. Upload the 512 px icon, the feature graphic and 4 to 8 phone shots.
2. Add the tablet shots when the app runs on tablets.
3. Paste the YouTube link of the promo video, when there is one.
4. Press Save, then check the listing preview.
5. Open Publishing overview, list the changes in the chat and ask. Press
   Send changes for review only on a yes.

- **Promo video** Play takes a YouTube link only. Upload the MP4 in YouTube
  Studio of the person's channel as unlisted, with ads off and made for kids
  set to No.
- **Launcher icon** the icon on the phone comes from the app bundle. It
  changes with the next release through the `play-release` skill.
- **No app yet** the app is missing in Play Console? Stop this step and
  point to `play-release`.

## 4. AdMob

AdMob takes no screenshots and no icon upload. It reads both from the
linked store listing.

- **Linked** open Apps, the app, App settings. A linked app shows the Play
  icon and name. The new icon shows there after Play approves the listing.
- **Not linked** the app is public on Play? Link it under App store details.
  Still in testing? Add a `TODO.md` line to link it after the launch.

## 5. AdSense and the site

AdSense takes no media. It reads the site, so the site gets the new shots
and icon.

- **App page** the app's page on `workbench-soft.github.io` or its own
  domain: the screenshots, the GIF, the favicon and the PWA icons.
- **Link preview** a 1200 × 630 `og:image` with the icon and a shot.
- **AdSense check** open Sites and confirm the site stays Ready. A change of
  the domain or of the ads code needs the `ads-setup` skill.
- **PR** the site change ships as a PR in the site repo.

## 6. The icon in every other place

The `icon-styles` export wires the repo files. Then check each place below
that applies:

| Place             | What to change                                                   |
| ----------------- | ---------------------------------------------------------------- |
| GitHub repo       | Settings, Social preview: a 1280 × 640 PNG                       |
| Windows app       | `src-tauri/icons` or the `.ico` of the installer, then a release |
| VS Code extension | the `icon` PNG in `package.json`, then a publish                 |
| PWA               | `manifest.webmanifest` icons and the maskable icon               |
| Expo              | `app.json` icon, adaptive icon and splash                        |

- **Old icon left** search the repo and the site repo for the old icon file
  names and hashes once all changes are in.

## 7. Write TODO.md

`TODO.md` at the repo root gets a section named `store-media <date>` with
each step left: a review to wait for, an AdMob link after launch, a release
that carries the new launcher icon.

## 8. Report back

End with a table, a row per place:

| Place        | State            | Next step                             |
| ------------ | ---------------- | ------------------------------------- |
| Play listing | in review        | wait for the email                    |
| AdMob        | linked, old icon | shows the new one after Play approves |

Point to the new `TODO.md` lines below the table.
