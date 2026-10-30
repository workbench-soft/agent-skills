#!/usr/bin/env python3
"""Print the icon picker as HTML for the chat widget tool.

Usage: picker_widget.py [DIR] > picker.html

DIR holds the drafts, as for preview.py, and defaults to the newest folder in
design/icons. Pass the output to mcp__visualize__show_widget as widget_code.
The buttons call the widget's sendPrompt with one of:

    Use icon 3 (blueprint)
    Redo icon 3 (blueprint): <comment>
    Draw 10 new styles: <comment>

Each SVG goes in once as a <symbol>, and the previews reuse it with <use>.
Its ids get the prefix i<N>-, since every symbol shares one page and the
drafts reuse names such as glow. Standard library only.
"""

import argparse
import html
import re
import sys
from pathlib import Path

from preview import TITLE, drafts_in, newest

ROOT = re.compile(r"<svg\b([^>]*)>(.*)</svg>", re.DOTALL)
VIEWBOX = re.compile(r'viewBox="([^"]+)"')
ID = re.compile(r'\bid="([^"]+)"')
PROLOG = re.compile(r"<\?xml.*?\?>|<!DOCTYPE.*?>|<!--.*?-->|<title>.*?</title>", re.DOTALL)
# Light and dark chips stay fixed colours: they stand for the places the icon shows.
CHIPS = (("#ffffff", "#e4e4e7"), ("#1f1f23", "#1f1f23"))

STYLE = """<style>
.ip-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; padding: 1rem 0 0; }
.ip-card { background: var(--surface-2); border: 0.5px solid var(--border); border-radius: 12px; padding: 12px; cursor: pointer; text-align: left; font: inherit; color: inherit; }
.ip-card:hover { border-color: var(--border-strong); }
.ip-card[aria-pressed="true"] { border: 2px solid var(--border-accent); padding: 10.5px; }
.ip-chips { display: flex; gap: 6px; margin: 8px 0; }
.ip-chip { display: flex; align-items: center; gap: 6px; padding: 4px 6px; border-radius: var(--radius); }
.ip-name { font-size: 14px; font-weight: 500; margin: 0; }
.ip-idea { font-size: 13px; color: var(--text-secondary); margin: 2px 0 0; line-height: 1.4; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
</style>"""

SCRIPT = """<script>
const cards = [...document.querySelectorAll(".ip-card")];
const note = document.getElementById("ip-note");
const error = document.getElementById("ip-error");
let picked = null;
for (const card of cards) {
  card.addEventListener("click", () => {
    picked = card;
    cards.forEach((c) => c.setAttribute("aria-pressed", String(c === card)));
    error.textContent = "";
  });
}
note.addEventListener("input", () => { error.textContent = ""; });
function send(kind) {
  const comment = note.value.trim();
  const label = picked ? `icon ${picked.dataset.num} (${picked.dataset.style})` : "";
  error.textContent = "";
  if (kind !== "new" && !picked) { error.textContent = "Pick an icon first"; return; }
  if (kind === "redo" && !comment) { error.textContent = "Write what to change first"; return; }
  if (kind === "use") sendPrompt(`Use ${label}`);
  if (kind === "redo") sendPrompt(`Redo ${label}: ${comment}`);
  if (kind === "new") sendPrompt(comment ? `Draw 10 new styles: ${comment}` : "Draw 10 new styles");
}
document.getElementById("ip-use").addEventListener("click", () => send("use"));
document.getElementById("ip-redo").addEventListener("click", () => send("redo"));
document.getElementById("ip-new").addEventListener("click", () => send("new"));
</script>"""


def symbol(svg: Path, symbol_id: str) -> str:
    """Turn one SVG file into a <symbol> whose ids can't clash with the others."""
    text = PROLOG.sub("", svg.read_text(encoding="utf-8"))
    found = ROOT.search(text)
    if not found:
        sys.exit(f"{svg}: no <svg> root")
    attrs, body = found.groups()
    box = VIEWBOX.search(attrs)
    view = box.group(1) if box else "0 0 256 256"
    for old in set(ID.findall(body)):
        new = f"{symbol_id}-{old}"
        escaped = re.escape(old)
        body = re.sub(rf'\bid="{escaped}"', f'id="{new}"', body)
        body = re.sub(rf"url\(\s*#{escaped}\s*\)", f"url(#{new})", body)
        body = re.sub(rf'href="#{escaped}"', f'href="#{new}"', body)
    return f'<symbol id="{symbol_id}" viewBox="{view}">{body.strip()}</symbol>'


def use(symbol_id: str, size: int) -> str:
    return f'<svg width="{size}" height="{size}" aria-hidden="true"><use href="#{symbol_id}"/></svg>'


def card(number: str, style: str, idea: str, big: str, small: str) -> str:
    chips = "".join(
        f'<span class="ip-chip" style="background: {bg}; border: 0.5px solid {edge};">'
        f"{use(small, 32)}{use(small, 16)}</span>"
        for bg, edge in CHIPS
    )
    return (
        f'<button type="button" class="ip-card" aria-pressed="false" '
        f'data-num="{html.escape(number)}" data-style="{html.escape(style)}">'
        f'<span style="display: block; text-align: center;">{use(big, 96)}</span>'
        f'<span class="ip-chips">{chips}</span>'
        f'<p class="ip-name">{html.escape(number)}. {html.escape(style)}</p>'
        f'<p class="ip-idea">{html.escape(idea)}</p></button>'
    )


def widget(folder: Path) -> str:
    drafts = drafts_in(folder)
    if not drafts:
        sys.exit(f"no SVG drafts in {folder}")
    symbols, cards = [], []
    for svg in drafts:
        number, _, style = svg.stem.partition("-")
        style = style.replace("-", " ")
        found = TITLE.search(svg.read_text(encoding="utf-8"))
        idea = found.group(1).strip() if found else ""
        # The title reads "Style: idea". The card already names the style.
        idea = idea.split(":", 1)[1].strip() if ":" in idea else idea
        big = f"i{number}"
        symbols.append(symbol(svg, big))
        small_file = svg.with_name(f"{svg.stem}-small.svg")
        small = big
        if small_file.exists():
            small = f"i{number}s"
            symbols.append(symbol(small_file, small))
        cards.append(card(number, style, idea, big, small))
    # A display:none sprite drops its gradients in Chrome, so it hides by size.
    sprite = '<svg width="0" height="0" style="position: absolute;" aria-hidden="true">' + "".join(symbols) + "</svg>"
    return "\n".join(
        [
            STYLE,
            f'<h2 class="sr-only">{len(drafts)} icon drafts to pick from, each in its own style.</h2>',
            sprite,
            '<div class="ip-grid">',
            *cards,
            "</div>",
            '<div style="padding: 1rem 0;">',
            '<textarea id="ip-note" rows="2" style="width: 100%; box-sizing: border-box;" placeholder="Bolder outline, warmer colours"></textarea>',
            '<p id="ip-error" role="alert" style="font-size: 13px; color: var(--text-danger); margin: 4px 0 0; min-height: 18px;"></p>',
            '<div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px;">',
            '<button type="button" id="ip-use">Use this icon ↗</button>',
            '<button type="button" id="ip-redo">Redo this one ↗</button>',
            '<button type="button" id="ip-new">Draw 10 new styles ↗</button>',
            "</div></div>",
            SCRIPT,
        ]
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("dir", nargs="?", type=Path)
    args = parser.parse_args()
    folder = args.dir or newest(Path("design/icons"))
    sys.stdout.reconfigure(encoding="utf-8")
    print(widget(folder))


if __name__ == "__main__":
    main()
