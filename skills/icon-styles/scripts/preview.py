#!/usr/bin/env python3
"""Build preview.html: every icon draft side by side, and let a click pick one.

Usage: preview.py [DIR] [--title NAME] [--serve] [--no-open]

DIR holds the drafts, 01-neon.svg to 10-blueprint.svg, and defaults to the
newest folder in design/icons. A 01-neon-small.svg beside a draft replaces
it at 32 px and below. The <title> of each SVG gives the caption.

--serve serves the sheet on 127.0.0.1 and opens it in the browser. The
person clicks a card, may write a comment, and presses a button. The script
prints one line and exits:

    use: <path>                 also writes the file name to DIR/picked.txt
    redo: <path>: <comment>
    new: <comment>

Standard library only.
"""

import argparse
import html
import json
import re
import threading
import webbrowser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

TITLE = re.compile(r"<title>(.*?)</title>", re.DOTALL)
SMALL = 32
# The card shows 256 px once above the rows.
SIZES = (16, 32, 64)
# The 16 and 32 px renders also show magnified, pixel for pixel.
ZOOM = 4
PICKED = "picked.txt"

PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} icons</title>
<style>
  body {{ margin: 0; padding: 24px; font: 14px/1.4 system-ui, sans-serif; background: #f4f4f5; color: #18181b; }}
  h1 {{ font-size: 20px; margin: 0 0 16px; }}
  #bar {{ position: sticky; top: 0; z-index: 1; margin: -24px -24px 16px; padding: 12px 24px; background: #18181b; color: #fff; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }}
  #bar textarea {{ flex: 1 1 240px; font: inherit; padding: 6px 8px; border-radius: 6px; border: 0; resize: vertical; }}
  #bar button {{ font: inherit; padding: 6px 12px; border-radius: 6px; border: 1px solid #52525b; background: #27272a; color: #fff; cursor: pointer; }}
  #bar button:hover {{ background: #3f3f46; }}
  #status {{ flex-basis: 100%; }}
  .grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }}
  .card {{ background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px #0002; cursor: pointer; outline: 3px solid transparent; }}
  .card:hover {{ outline-color: #a1a1aa; }}
  .card.picked {{ outline-color: #16a34a; }}
  .card h2 {{ font-size: 16px; margin: 0 0 4px; }}
  .card p {{ margin: 0 0 12px; color: #52525b; }}
  .big {{ display: block; width: 256px; height: 256px; margin: 0 auto 12px; }}
  .row {{ display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 8px 12px; border-radius: 8px; }}
  .light {{ background: #ffffff; border: 1px solid #e4e4e7; }}
  .dark {{ background: #1f1f23; margin-top: 8px; }}
  canvas {{ image-rendering: pixelated; }}
</style>
</head>
<body>
<div id="bar">
  <textarea id="note" rows="1" placeholder="What to change, for Redo or new styles"></textarea>
  <button type="button" data-action="use">Use this icon</button>
  <button type="button" data-action="redo">Redo this one</button>
  <button type="button" data-action="new">Draw 10 new styles</button>
  <div id="status">Click the icon you want, then press a button.</div>
</div>
<h1>{title}</h1>
<div class="grid">
{cards}
</div>
<script>
  // Draw each small size at its real pixel count, then show it magnified.
  for (const canvas of document.querySelectorAll("canvas[data-src]")) {{
    const size = Number(canvas.dataset.size);
    canvas.width = canvas.height = size;
    canvas.style.width = canvas.style.height = size * {zoom} + "px";
    const img = new Image();
    img.onload = () => canvas.getContext("2d").drawImage(img, 0, 0, size, size);
    img.src = canvas.dataset.src;
  }}

  const status = document.getElementById("status");
  const note = document.getElementById("note");
  const cards = [...document.querySelectorAll(".card")];
  let picked = document.querySelector(".card.picked");
  for (const card of cards) {{
    card.addEventListener("click", () => {{
      picked = card;
      cards.forEach((c) => c.classList.toggle("picked", c === card));
      status.textContent = `Selected ${{card.querySelector("h2").textContent}}`;
    }});
  }}
  for (const button of document.querySelectorAll("#bar button")) {{
    button.addEventListener("click", async () => {{
      const action = button.dataset.action;
      const comment = note.value.trim();
      const label = picked ? picked.querySelector("h2").textContent : "";
      if (action !== "new" && !picked) {{ status.textContent = "Pick an icon first."; return; }}
      if (action === "redo" && !comment) {{ status.textContent = "Write what to change first."; return; }}
      const words = {{ use: `Use ${{label}}`, redo: `Redo ${{label}}: ${{comment}}`, new: `Draw 10 new styles: ${{comment}}` }}[action];
      // Opened as a file, the page has no server to tell.
      if (!location.protocol.startsWith("http")) {{ status.textContent = `Tell the agent: ${{words}}`; return; }}
      try {{
        const body = JSON.stringify({{ action, comment, file: picked ? picked.dataset.file : "" }});
        const answer = await fetch("/answer", {{ method: "POST", body }});
        if (!answer.ok) throw new Error(await answer.text());
        status.textContent = `Sent: ${{words}}. The agent takes it from here, and this tab can close.`;
      }} catch (error) {{
        status.textContent = `The agent stopped listening. Tell it in chat: ${{words}}`;
      }}
    }});
  }}
</script>
</body>
</html>
"""


def row(theme: str, main: str, small: str) -> str:
    cells = [f'<img src="{small if s <= SMALL else main}" width="{s}" height="{s}" alt="">' for s in SIZES]
    cells += [f'<canvas data-src="{small}" data-size="{s}"></canvas>' for s in SIZES if s <= SMALL]
    return f'<div class="row {theme}">{"".join(cells)}</div>'


def card(svg: Path, picked: str) -> str:
    small = svg.with_name(f"{svg.stem}-small.svg")
    main_src = html.escape(svg.name)
    small_src = html.escape(small.name if small.exists() else svg.name)
    found = TITLE.search(svg.read_text(encoding="utf-8"))
    caption = html.escape(found.group(1).strip()) if found else ""
    number, _, style = svg.stem.partition("-")
    mark = " picked" if svg.name == picked else ""
    return (
        f'<div class="card{mark}" data-file="{main_src}">'
        f'<h2>{html.escape(number)}. {html.escape(style.replace("-", " "))}</h2>'
        f"<p>{caption}</p>"
        f'<img class="big" src="{main_src}" alt="">'
        f"{row('light', main_src, small_src)}{row('dark', main_src, small_src)}</div>"
    )


def drafts_in(folder: Path) -> list[Path]:
    return sorted(p for p in folder.glob("*.svg") if not p.stem.endswith("-small"))


def build(folder: Path, title: str) -> Path:
    drafts = drafts_in(folder)
    if not drafts:
        raise SystemExit(f"no SVG drafts in {folder}")
    marker = folder / PICKED
    picked = marker.read_text(encoding="utf-8").strip() if marker.exists() else ""
    cards = "\n".join(card(svg, picked) for svg in drafts)
    out = folder / "preview.html"
    out.write_text(PAGE.format(title=html.escape(title), cards=cards, zoom=ZOOM), encoding="utf-8")
    return out


class PickHandler(SimpleHTTPRequestHandler):
    """Serves the drafts folder, and takes the answer as POST /answer."""

    def do_POST(self) -> None:
        folder = Path(self.directory)
        try:
            length = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(length))
            action, name = data["action"], data.get("file", "")
            comment = " ".join(str(data.get("comment", "")).split())
        except (ValueError, KeyError, TypeError, AttributeError):
            return self.send_error(400, 'expected {"action": "use", "file": "NN-style.svg"}')
        if self.path != "/answer" or action not in ("use", "redo", "new"):
            return self.send_error(404, "no such action")
        if action != "new" and name not in {p.name for p in drafts_in(folder)}:
            return self.send_error(404, "no such draft")
        if action == "redo" and not comment:
            return self.send_error(400, "redo needs a comment")
        if action == "use":
            (folder / PICKED).write_text(name + "\n", encoding="utf-8")
            self.server.answer = f"use: {folder / name}"
        elif action == "redo":
            self.server.answer = f"redo: {folder / name}: {comment}"
        else:
            self.server.answer = f"new: {comment}"
        self.send_response(204)
        self.end_headers()
        # shutdown() waits for serve_forever, so it can't run on this thread.
        threading.Thread(target=self.server.shutdown).start()

    def log_message(self, *args) -> None:
        pass


def serve(folder: Path, title: str, open_browser: bool) -> None:
    handler = partial(PickHandler, directory=str(folder))
    with ThreadingHTTPServer(("127.0.0.1", 0), handler) as server:
        server.answer = ""
        url = f"http://127.0.0.1:{server.server_address[1]}/preview.html"
        print(f"waiting for an answer on {url}", flush=True)
        if open_browser:
            webbrowser.open(url)
        server.serve_forever()
    build(folder, title)  # The saved sheet now marks the pick.
    print(server.answer)


def newest(root: Path) -> Path:
    folders = sorted(p for p in root.iterdir() if p.is_dir()) if root.is_dir() else []
    if not folders:
        raise SystemExit(f"no draft folders in {root}")
    return folders[-1]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("dir", nargs="?", type=Path)
    parser.add_argument("--title", default="App")
    parser.add_argument("--serve", action="store_true", help="wait for Use, Redo or new styles")
    parser.add_argument("--no-open", action="store_true", help="print the URL, open no browser")
    args = parser.parse_args()

    folder = args.dir or newest(Path("design/icons"))
    print(build(folder, args.title).resolve(), flush=True)
    if args.serve:
        serve(folder, args.title, not args.no_open)


if __name__ == "__main__":
    main()
