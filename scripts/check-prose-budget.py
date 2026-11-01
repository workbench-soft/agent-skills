#!/usr/bin/env python3
"""Check each markdown file against its prose line budget.

Lines inside fenced blocks and blank lines are free. With no file named, it
checks every SKILL.md and reference file, since cmd, where mise runs a task on
Windows, leaves a glob unexpanded.

    mise x -- python scripts/check-prose-budget.py [file.md ...]
"""

import re
import sys
from pathlib import Path

PROSE_LIMITS = {"SKILL.md": 300, "reference": 60}
# A fence may sit indented inside a list item.
FENCE = re.compile(r"^[ \t]*(`{3,})")


def main(names: list[str]) -> int:
    skills = Path("skills")
    names = names or sorted(map(str, [*skills.glob("*/SKILL.md"), *skills.glob("*/references/*.md")]))
    over_any = False
    for name in names:
        path = Path(name)
        prose = count_prose_lines(path.read_text(encoding="utf-8"))
        limit = limit_for(path)
        over = prose > limit
        over_any = over_any or over
        print(f"{prose:4d} / {limit}  {path}{' OVER CAP' if over else ''}")
    return 1 if over_any else 0


def count_prose_lines(text: str) -> int:
    open_fences: list[str] = []
    prose = 0
    for line in text.splitlines():
        if fence := FENCE.match(line):
            marker = fence.group(1)
            if open_fences and open_fences[-1] == marker:
                open_fences.pop()
            else:
                open_fences.append(marker)
        elif not open_fences and line.strip():
            prose += 1
    return prose


def limit_for(path: Path) -> int:
    return PROSE_LIMITS["SKILL.md" if path.name == "SKILL.md" else "reference"]


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
