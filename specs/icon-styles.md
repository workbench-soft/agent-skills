# Icons for a repo in 10 styles

## What it does for the person

- **10 choices** the agent draws 10 icons for the app in the repo, each in
  its own visual style.
- **Styles fit the app** the agent reads the repo and picks the styles that
  suit its theme, such as neon for a hacker tool or watercolour for a diary.
- **One sheet** an HTML page shows all 10 side by side at 16, 32, 64 and
  256 px, on light and dark, so the person picks one.
- **Every format** the picked SVG becomes the PNG sizes, the Windows `.ico`
  and the Android, iOS and PWA sets the repo needs.

## User flows

1. The person asks for an icon, such as "нарисуй иконки в разных стилях".
2. The agent reads the README, the docs and the code, and writes a brief.
3. The agent picks 10 styles and draws one SVG for each.
4. The agent opens the preview sheet, and the person picks a number.
5. A script turns the pick into the formats the repo uses and wires them in.

## How it works: modules, files, data

- **`skills/icon-styles/SKILL.md`** the brief, the style choice, the SVG
  rules, the preview and the export.
- **`skills/icon-styles/references/styles.md`** a catalogue of styles with
  the shapes and colours each one uses.
- **`skills/icon-styles/scripts/preview.py`** builds `preview.html` from the
  SVGs in a folder. Standard library only.
- **`skills/icon-styles/scripts/export_icons.py`** renders PNGs through the
  `resvg` CLI and packs the `.ico` files itself. Standard library only.
- **Output** the drafts sit in `icon-drafts/` at the repo root. The export
  writes to the folder the repo already keeps icons in.

## Limits

- **resvg** renders the SVGs. Text needs a font on the machine, so the rules
  ask for shapes in place of text.
- **No macOS `.icns`** the export writes a 1024 px PNG for it, and
  `iconutil` on a Mac builds the `.icns`.
- **Hand drawn** the agent writes SVG by hand. A photo or a painted style
  comes out as flat shapes that hint at it.

## Changes

### 2026-10-31 a new skill that draws 10 icons in 10 styles

- **Why** the person wants a striking icon for each app, and to pick from
  styles that fit the app instead of a fixed list.
- **Changes** the new skill, its reference, the 2 scripts, and a line in
  `README.md`, `docs/features.md` and `CHANGELOG.md`.
- **Steps** this spec, then the scripts, then the skill and the docs.
- **Docs** `README.md`, `docs/features.md`, `CHANGELOG.md`.
