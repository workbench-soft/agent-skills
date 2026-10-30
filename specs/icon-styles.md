# Icons for a repo in 10 styles

## What it does for the person

- **10 choices** the agent draws 10 icons for the app in the repo, each in
  its own visual style.
- **Styles fit the app** the agent reads the repo and picks the styles that
  suit its theme, such as neon for a hacker tool or watercolour for a diary.
- **One sheet** an HTML page shows all 10 side by side at 16, 32, 64 and
  256 px, on light and dark.
- **Picker in the chat** where the agent can show a widget, the chat shows a
  grid of the 10 icons. The person clicks one, writes what to change, and
  presses Use, Redo or Draw 10 new styles.
- **Click to pick** an agent without widgets serves the same choice as a
  small local page, and gets the answer without a chat reply.
- **Kept drafts** all 10 stay in `design/icons/<date>/`, the same path in
  every repo, and land in a commit with the pick marked.
- **Every format** the picked SVG becomes the PNG sizes, the Windows `.ico`
  and the Android, iOS and PWA sets the repo needs.

## User flows

1. The person asks for an icon, such as "нарисуй иконки в разных стилях".
2. The agent reads the README, the docs and the code, and writes a brief.
3. The agent picks 10 styles and draws one SVG for each.
4. The agent shows the picker widget in the chat, or serves the page when it
   has no widget tool.
5. The person clicks an icon and presses Use. Redo with a comment sends the
   agent back to step 3 for that icon, with the same numbers.
6. A script turns the pick into the formats the repo uses and wires them in.
7. The agent commits the exports and the whole `design/icons/<date>/`
   folder.

## How it works: modules, files, data

- **`skills/icon-styles/SKILL.md`** the brief, the style choice, the SVG
  rules, the preview and the export.
- **`skills/icon-styles/references/styles.md`** a catalogue of styles with
  the shapes and colours each one uses.
- **`skills/icon-styles/scripts/preview.py`** builds `preview.html` from the
  SVGs in a folder. `--serve` serves it on `127.0.0.1`, opens the browser,
  waits for Use or Redo, and prints the answer. Standard library only.
- **`skills/icon-styles/scripts/picker_widget.py`** prints the widget HTML.
  Each SVG goes in once as a `<symbol>` with its ids prefixed per icon, and
  each preview size reuses it with `<use>`.
- **`skills/icon-styles/scripts/export_icons.py`** renders PNGs through the
  `resvg` CLI and packs the `.ico` files itself. Standard library only.
- **Output** the drafts sit in `design/icons/<YYYY-MM-DD>/` with
  `preview.html` and `picked.txt`. The export writes to the folder the repo
  already keeps icons in.

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

### 2026-10-31 pick with a click, keep every draft in the repo

- **Why** the person wants to click the icon they like in a small page, and
  to keep the other 9 in the repo for later.
- **Changes**
  - **`preview.py`** `--serve` runs a local server. A click on a card posts
    the file name, the server writes `picked.txt`, and the script exits with
    the pick. The sheet marks the picked card on the next build.
  - **`SKILL.md`** drafts go to `design/icons/<date>/` in place of
    `icon-drafts/`. The agent waits for the click, then commits the folder
    with the exports.
- **Steps** this entry, then the script, then the skill and the docs.
- **Docs** `README.md`, `docs/features.md`, `CHANGELOG.md`.

### 2026-10-31 a picker in the chat, with redo

- **Why** the person couldn't click an icon from the chat. They want a picker
  right in the chat, where they can also ask for a redo.
- **Changes**
  - **`picker_widget.py`** a new script prints the widget HTML: 10 cards with
    the icon large and at 32 and 16 px on light and dark, a comment box and 3
    buttons that send the answer to the chat.
  - **`preview.py`** the served page gets the same comment box, Redo and new
    styles buttons. The script prints `use`, `redo` or `new` with the comment.
  - **`SKILL.md`** step 4 shows the widget when the agent has
    `mcp__visualize__show_widget`, and serves the page otherwise.
- **Ids** the drafts reuse ids such as `glow`, and every widget SVG shares
  one page. Each icon becomes one `<symbol>` with its ids prefixed, and the
  previews point at it with `<use>`. One copy per icon keeps the widget small.
- **Steps** this entry, then the scripts, then the skill and the docs.
- **Docs** `README.md`, `docs/features.md`, `CHANGELOG.md`.
