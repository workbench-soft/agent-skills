---
name: icon-styles
description: 'Use when someone wants an icon, a logo mark or an app icon for the repo, or wants to see icon options in different styles, in any language: "draw an icon", "make an app icon", "design a logo for the app", "show me icons in different styles", "придумай иконку", "нарисуй иконки в разных стилях", "сделай иконку для приложения". Reads the repo to learn what the app does, picks 10 visual styles that fit its theme, such as neon, steampunk, pixel art or blueprint, and draws one SVG per style by hand that still reads at 16 px. Builds an HTML sheet with all 10 at 16, 32, 64 and 256 px on light and dark, so the person picks a number. Then a script turns the pick into the PNG sizes, a multi size .ico for Windows and the Android, iOS, Expo and PWA sets, and wires them into the repo.'
---

# Draw 10 icons, pick one

The person gets 10 icons for the app, each in its own style, and picks one
from a preview sheet. The pick then lands in the repo in every format it uses.

Load the `writing-style` skill before the first line a person reads, unless
it is in context.

## 1. Learn what the app is

Read, in this order, until the theme is clear:

1. `README.md`, `docs/`, the store or site text.
2. The app name and its manifests: `package.json`, `Cargo.toml`,
   `app.json`, `AndroidManifest.xml`.
3. The main screens or modules, for what the person does with it.
4. Icons and colours already there: `assets/`, `public/`, `icons/`, a theme
   file, `tailwind.config`.

Write a brief of 4 lines for yourself and show it in the answer:

- **Does** what the app does, in one line.
- **Metaphor** 2 or 3 objects that stand for it, such as a keyboard key
  that flips for a layout switcher.
- **Mood** the feeling the person wants, read from the request.
- **Where it shows** tray, taskbar, home screen, browser tab. A tray icon
  lives at 16 px, so the shape MUST survive that size.

A request that names the styles or the colours wins over the brief.

## 2. Pick 10 styles

Read `references/styles.md` for the catalogue and the table that matches
styles to kinds of app. Pick 10 styles that fit the brief, each one far from
the others. A style the person named goes in first.

- **Fixed list** the styles MUST come from the app's theme. A fixed set for
  every repo gives every app the same 10 icons.
- **One idea** each icon carries one metaphor from the brief. The style
  changes, and the idea MAY stay or change between icons.

## 3. Draw each SVG

Write each icon by hand to `icon-drafts/NN-style.svg` at the repo root:
`01-neon.svg` to `10-blueprint.svg`.

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <title>Neon: a key that flips from EN to RU, glowing cyan</title>
  ...
</svg>
```

- **Canvas** `viewBox="0 0 256 256"` with no `width` or `height`, so it
  scales.
- **Title** the first child is a `<title>` with the style name, a colon and
  one line on the idea. The sheet shows it.
- **Shapes** paths, circles, rects, gradients, filters. Text and letters
  MUST be paths, since the machine that renders it may lack the font.
- **Self contained** no `<image>`, no external link, no CSS import, no
  script.
- **Small sizes** the main shape fills about 80% of the canvas, with strong
  contrast against light and dark. Lines stay 12 units or thicker, so they
  stay 1 px wide at 16 px.

A style whose detail turns to mush at 32 px gets a second file,
`NN-style-small.svg`: the same idea with the detail dropped. The sheet and
the export use it at 32 px and below.

## 4. Show the sheet

```bash
mise x python@3.13 -- python <skill-dir>/scripts/preview.py icon-drafts --title "<App name>"
```

`<skill-dir>` is the folder of this file. The script writes
`icon-drafts/preview.html` and prints its path.

- **Open it** in the browser the agent has, then take a screenshot and look
  at the 16 and 32 px rows. Redraw an icon that blurs into a blob there
  before the person sees it.
- **Hand it over** give the path and a table: number, style, the idea in a
  few words. Ask through the question tool which number to keep, and offer
  "mix 3 and 7" or "redo in another style" as answers.
- **Rounds** a redo replaces the files it names and rebuilds the sheet. The
  numbers of the others stay.

## 5. Export the pick

Read where the repo keeps its icons and which platforms it ships to. Then
run the export with only those targets:

```bash
mise x python@3.13 github:linebender/resvg@0.49.0 -- python <skill-dir>/scripts/export_icons.py icon-drafts/07-blueprint.svg --out <folder> --targets windows,png
```

| Target | Files |
| --- | --- |
| `png` | `icon-16.png` to `icon-1024.png` |
| `windows` | `icon.ico` with 16 to 256 px inside |
| `web` | `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` |
| `android` | `mipmap-*/ic_launcher.png`, `mipmap-*/ic_launcher_foreground.png`, `play-store-512.png` |
| `ios` | `AppIcon-1024.png`, opaque |
| `expo` | `icon.png`, `adaptive-icon.png`, `favicon.png` |

- **Small file** `--small icon-drafts/07-blueprint-small.svg` when the pick
  has one.
- **Background** `--background "#0b1d3a"` with the icon's own backdrop
  colour. iOS, Expo, the Apple touch icon and the maskable icon get it.
- **Where** write into the folder the repo already uses, such as `assets/`,
  `public/` or `res/`, and replace the old files there by the same name.
- **Wire it in** point each manifest at the new files: the `.rc` file or
  `build.rs` for the Windows `.exe`, `tauri.conf.json`, `app.json`,
  `manifest.webmanifest`, `<link rel="icon">`. An Android adaptive icon needs
  its background colour in `ic_launcher_background`.
- **Keep the source** copy the picked SVG next to the exports as `icon.svg`,
  so the next change starts from it.

## 6. Check and finish

- **Build** run the repo's build or its check task, and open the app or the
  page when it can run here. The new icon MUST show in the tray, the window
  or the tab.
- **Drafts** delete `icon-drafts/` once the pick is wired in, unless the
  person wants the other 9 kept.
- **Report** the picked number and style, the files written, and each
  manifest changed.
