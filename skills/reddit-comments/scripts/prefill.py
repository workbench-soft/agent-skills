#!/usr/bin/env python3
"""Open each Reddit thread in Chrome and type the draft into the comment box.

Usage: prefill.py queue.json [--profile DIR] [--start N] [--max N]

queue.json holds a list of {"url": ..., "text": ...}. The script opens the
installed Google Chrome with a profile of its own, so the Reddit login is made
once and kept. For each item it types the text into the comment box and waits
for Enter in the terminal. The person presses Comment in the browser. The
script doesn't press it. Each item gets a "status" in the file: posted,
skipped or error.

Run it with the playwright package on the path:

    uv run --with playwright python prefill.py queue.json
"""

import argparse
import json
import sys
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sys.exit("playwright is missing. Run: uv run --with playwright python prefill.py queue.json")

DEFAULT_PROFILE = Path.home() / ".reddit-comments" / "profile"
LOGIN_WAIT_MS = 600_000
# A young account that comments fast gets filtered, so one run stays small.
DEFAULT_MAX = 3

# Runs in the page and walks open shadow roots, where Reddit keeps its header and comment box.
PAGE_STATE_JS = r"""
() => {
  const all = [];
  const walk = (root) => { for (const e of root.querySelectorAll('*')) { all.push(e); if (e.shadowRoot) walk(e.shadowRoot); } };
  walk(document);
  const visible = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const login = all.some(e => e.tagName === 'A' && /\/login/.test(e.getAttribute('href') || '') && visible(e));
  const editable = all.find(e => e.getAttribute && e.getAttribute('contenteditable') === 'true' && visible(e));
  const trigger = all.find(e => e.tagName === 'TEXTAREA' && /join the conversation|add a comment/i.test(e.placeholder || ''));
  const oldBox = all.find(e => e.tagName === 'TEXTAREA' && e.name === 'text');
  const mark = (e, name) => { if (e) e.setAttribute('data-prefill', name); return !!e; };
  return { login, editable: mark(editable, 'editable'), trigger: mark(trigger, 'trigger'), oldBox: mark(oldBox, 'old') };
}
"""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("queue", type=Path, help="JSON file with a list of {url, text}")
    parser.add_argument("--profile", type=Path, default=DEFAULT_PROFILE, help="Chrome profile folder")
    parser.add_argument("--start", type=int, default=1, help="1-based item to start from")
    parser.add_argument("--max", type=int, default=DEFAULT_MAX, help=f"items per run, default {DEFAULT_MAX}")
    return parser.parse_args()


def load_queue(path: Path) -> list[dict]:
    items = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(items, list) or not all("url" in i and "text" in i for i in items):
        sys.exit(f"{path}: expected a list of objects with url and text")
    texts = [i["text"].strip() for i in items]
    if len(set(texts)) < len(texts):
        sys.exit("two items share the same text. Reddit removes repeated comments, so reword one.")
    return items


def save_queue(path: Path, items: list[dict]) -> None:
    path.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def page_state(page) -> dict:
    return page.evaluate(PAGE_STATE_JS)


def wait_for_login(page) -> None:
    print("Not logged in. Log in to Reddit in the Chrome window. Waiting up to 10 minutes.")
    waited = 0
    while waited < LOGIN_WAIT_MS:
        page.wait_for_timeout(2000)
        waited += 2000
        if not page_state(page)["login"]:
            print("Logged in.")
            return
    sys.exit("No login after 10 minutes. Run the script again once you are logged in.")


def fill_comment(page, text: str) -> str:
    state = page_state(page)
    if state["oldBox"]:
        page.locator("[data-prefill='old']").fill(text)
        return "old Reddit textarea"
    if not state["editable"] and state["trigger"]:
        trigger = page.locator("[data-prefill='trigger']")
        trigger.scroll_into_view_if_needed()
        trigger.click()
        page.wait_for_timeout(1500)
        state = page_state(page)
    if not state["editable"]:
        raise RuntimeError("no comment box found: no editor, no 'Join the conversation' box, no old Reddit textarea")
    box = page.locator("[data-prefill='editable']")
    box.scroll_into_view_if_needed()
    box.click()
    # The rich editor drops text that arrives in one piece, so each line is typed.
    for number, line in enumerate(text.split("\n")):
        if number:
            page.keyboard.press("Enter")
        page.keyboard.type(line, delay=15)
    return "new Reddit editor"


def main() -> int:
    args = parse_args()
    items = load_queue(args.queue)
    args.profile.mkdir(parents=True, exist_ok=True)
    handled = 0
    with sync_playwright() as playwright:
        context = playwright.chromium.launch_persistent_context(
            str(args.profile), channel="chrome", headless=False, viewport=None, args=["--start-maximized"]
        )
        page = context.pages[0] if context.pages else context.new_page()
        for number, item in enumerate(items, 1):
            if number < args.start or item.get("status") == "posted":
                continue
            if handled >= args.max:
                print(f"\nStopping after {args.max} items. Rerun later with --start {number}.")
                break
            print(f"\n[{number}/{len(items)}] {item['url']}")
            failed = False
            try:
                page.goto(item["url"], wait_until="domcontentloaded")
                page.wait_for_timeout(2500)
                if page_state(page)["login"]:
                    wait_for_login(page)
                    page.goto(item["url"], wait_until="domcontentloaded")
                    page.wait_for_timeout(2500)
                where = fill_comment(page, item["text"])
                print(f"Typed into the {where}. Read it, press Comment in Chrome.")
            except Exception as error:  # noqa: BLE001 - a failure on one thread moves on to the next
                failed = True
                item["status"] = "error"
                item["error"] = str(error).splitlines()[0]
                save_queue(args.queue, items)
                print(f"Error: {item['error']}")
            handled += 1
            if failed:
                # Nothing got typed, so Enter keeps the error rather than mark the thread posted.
                answer = input("Enter = keep the error, p = posted by hand, s = skipped, q = quit: ").strip().lower()
                if answer not in ("p", "s", "q"):
                    continue
            else:
                answer = input("Enter = posted, s = skipped, q = quit: ").strip().lower()
            if answer == "q":
                break
            item["status"] = "skipped" if answer == "s" else "posted"
            item.pop("error", None)
            save_queue(args.queue, items)
        context.close()
    posted = sum(1 for i in items if i.get("status") == "posted")
    print(f"\nDone. {posted} posted, {len(items) - posted} left. Statuses are in {args.queue}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
