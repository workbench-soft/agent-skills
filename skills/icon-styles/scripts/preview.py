#!/usr/bin/env python3
"""Build preview.html: every icon draft side by side at 16, 32, 64 and 256 px.

Usage: preview.py [DIR] [--title NAME]

DIR holds the drafts, 01-neon.svg to 10-blueprint.svg, and defaults to
icon-drafts. A 01-neon-small.svg beside a draft replaces it at 32 px and
below. The <title> of each SVG gives the caption. Standard library only.
"""

import argparse
import html
import re
from pathlib import Path

TITLE = re.compile(r"<title>(.*?)</title>", re.DOTALL)
SMALL = 32
# The card shows 256 px once above the rows.
SIZES = (16, 32, 64)
# The 16 and 32 px renders also show magnified, pixel for pixel.
ZOOM = 4

PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} icons</title>
<style>
  body {{ margin: 0; padding: 24px; font: 14px/1.4 system-ui, sans-serif; background: #f4f4f5; color: #18181b; }}
  h1 {{ font-size: 20px; margin: 0 0 16px; }}
  .grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }}
  .card {{ background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px #0002; }}
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
<h1>{title}: pick a number</h1>
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
</script>
</body>
</html>
"""


def row(theme: str, main: str, small: str) -> str:
    cells = [f'<img src="{small if s <= SMALL else main}" width="{s}" height="{s}" alt="">' for s in SIZES]
    cells += [f'<canvas data-src="{small}" data-size="{s}"></canvas>' for s in SIZES if s <= SMALL]
    return f'<div class="row {theme}">{"".join(cells)}</div>'


def card(svg: Path) -> str:
    small = svg.with_name(f"{svg.stem}-small.svg")
    main_src = html.escape(svg.name)
    small_src = html.escape(small.name if small.exists() else svg.name)
    found = TITLE.search(svg.read_text(encoding="utf-8"))
    caption = html.escape(found.group(1).strip()) if found else ""
    number, _, style = svg.stem.partition("-")
    return (
        f'<div class="card"><h2>{html.escape(number)}. {html.escape(style.replace("-", " "))}</h2>'
        f"<p>{caption}</p>"
        f'<img class="big" src="{main_src}" alt="">'
        f"{row('light', main_src, small_src)}{row('dark', main_src, small_src)}</div>"
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("dir", nargs="?", type=Path, default=Path("icon-drafts"))
    parser.add_argument("--title", default="App")
    args = parser.parse_args()

    drafts = sorted(p for p in args.dir.glob("*.svg") if not p.stem.endswith("-small"))
    if not drafts:
        raise SystemExit(f"no SVG drafts in {args.dir}")
    page = PAGE.format(title=html.escape(args.title), cards="\n".join(map(card, drafts)), zoom=ZOOM)
    out = args.dir / "preview.html"
    out.write_text(page, encoding="utf-8")
    print(out.resolve())


if __name__ == "__main__":
    main()
