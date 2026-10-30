#!/usr/bin/env python3
"""Render every icon draft onto one PNG, to show in the chat as an image.

Usage: contact_sheet.py [DIR] [--out sheet.png] [--resvg resvg]

DIR holds the drafts, as for preview.py, and defaults to the newest folder in
design/icons. Each cell shows the number and style, the icon at 128 px, and
its small version at 32 and 16 px on a light and a dark chip. Renders through
the resvg CLI:

    mise x python@3.13 github:linebender/resvg@0.49.0 -- python contact_sheet.py DIR

Standard library only.
"""

import argparse
import html
import shutil
import subprocess
import sys
from pathlib import Path

from picker_widget import symbol
from preview import drafts_in, newest

COLUMNS = 5
CELL_W, CELL_H = 220, 240


def use(symbol_id: str, x: int, y: int, size: int) -> str:
    return f'<use href="#{symbol_id}" x="{x}" y="{y}" width="{size}" height="{size}"/>'


def cell(index: int, svg: Path, big: str, small: str) -> str:
    x, y = (index % COLUMNS) * CELL_W, (index // COLUMNS) * CELL_H
    number, _, style = svg.stem.partition("-")
    label = html.escape(f"{number}. {style.replace('-', ' ')}")
    chips = ""
    for offset, fill in ((24, "#ffffff"), (116, "#1f1f23")):
        chips += f'<rect x="{x + offset}" y="{y + 186}" width="80" height="44" rx="8" fill="{fill}" stroke="#d4d4d8"/>'
        chips += use(small, x + offset + 8, y + 192, 32) + use(small, x + offset + 52, y + 200, 16)
    return (
        f'<text x="{x + 110}" y="{y + 24}" text-anchor="middle" font-size="16" '
        f'font-family="Segoe UI, Arial, sans-serif" fill="#18181b">{label}</text>'
        + use(big, x + 46, y + 40, 128)
        + chips
    )


def sheet(folder: Path) -> str:
    drafts = drafts_in(folder)
    if not drafts:
        sys.exit(f"no SVG drafts in {folder}")
    symbols, cells = [], []
    for index, svg in enumerate(drafts):
        big = f"i{index:02}"
        symbols.append(symbol(svg, big))
        small_file = svg.with_name(f"{svg.stem}-small.svg")
        small = big
        if small_file.exists():
            small = f"{big}s"
            symbols.append(symbol(small_file, small))
        cells.append(cell(index, svg, big, small))
    rows = -(-len(drafts) // COLUMNS)
    width, height = COLUMNS * CELL_W, rows * CELL_H
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
        f'viewBox="0 0 {width} {height}"><defs>{"".join(symbols)}</defs>'
        f'<rect width="{width}" height="{height}" fill="#f4f4f5"/>{"".join(cells)}</svg>'
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("dir", nargs="?", type=Path)
    parser.add_argument("--out", type=Path, help="defaults to DIR/sheet.png")
    parser.add_argument("--resvg", default="resvg")
    args = parser.parse_args()

    folder = args.dir or newest(Path("design/icons"))
    out = args.out or folder / "sheet.png"
    if shutil.which(args.resvg) is None:
        sys.exit("resvg is not on PATH. Run through: mise x github:linebender/resvg@0.49.0 -- ...")
    done = subprocess.run([args.resvg, "-", str(out)], check=False, input=sheet(folder).encode("utf-8"))
    if done.returncode != 0:
        sys.exit("resvg failed")
    print(out.resolve())


if __name__ == "__main__":
    main()
