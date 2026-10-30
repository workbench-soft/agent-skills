#!/usr/bin/env python3
"""Check each skill the way an agent will read it.

    mise x -- python scripts/check-skills.py
"""
import re
import sys
from pathlib import Path

# The Agent Skills spec caps a description here. A stricter agent cuts it.
DESCRIPTION_LIMIT = 1024
LINK = re.compile(r"\]\(([^)\s]+)\)")
REFERENCE = re.compile(r"`(references/[^`\s]+\.md)`")
# A fence may sit indented inside a list item.
FENCED = re.compile(r"^([ \t]*)(`{3,}).*?^\1\2[ \t]*$", re.MULTILINE | re.DOTALL)
CODE_SPAN = re.compile(r"`[^`\n]+`")
# writing-style names the words it bans, so it is exempt.
BANNED = re.compile(r"\b(never|nothing)\b", re.IGNORECASE)
QUOTED = re.compile(r"[\"`](never|nothing)[\"`]", re.IGNORECASE)


def main() -> int:
    errors: list[str] = []
    for skill in sorted(Path("skills").glob("*/SKILL.md")):
        errors += check_frontmatter(skill)
    for page in sorted(Path("skills").glob("*/**/*.md")):
        errors += check_links(page)
        if page.parts[1] != "writing-style":
            errors += check_words(page)
    # AGENTS.md puts these under the same rules, and every agent turn loads the rules file.
    for page in (Path("README.md"), Path("writing-style.instructions.md")):
        errors += check_words(page)
    for error in errors:
        print(error)
    return 1 if errors else 0


def check_frontmatter(skill: Path) -> list[str]:
    lines = skill.read_text(encoding="utf-8").splitlines()
    if not lines or lines[0] != "---" or "---" not in lines[1:]:
        return [f"{skill}: no frontmatter between --- lines"]
    fields = dict(
        line.split(": ", 1) for line in lines[1 : lines.index("---", 1)] if ": " in line
    )
    errors = []
    if fields.get("name") != skill.parent.name:
        errors.append(f"{skill}: name is not the folder name {skill.parent.name}")
    description = fields.get("description", "")
    if not description:
        errors.append(f"{skill}: no description")
    elif description[0] not in "'\"" and ": " in description:
        # An unquoted ": " breaks the YAML, and the skill drops out unseen.
        errors.append(f'{skill}: description has ": ", quote it')
    elif len(description.strip("'\"")) > DESCRIPTION_LIMIT:
        errors.append(f"{skill}: description over {DESCRIPTION_LIMIT} characters")
    return errors


def check_links(page: Path) -> list[str]:
    text = page.read_text(encoding="utf-8")
    # Links in examples point at files of the repo under review.
    prose = CODE_SPAN.sub("", FENCED.sub("", text))
    targets = [link.split("#")[0] for link in LINK.findall(prose)]
    if page.name == "SKILL.md":
        targets += REFERENCE.findall(text)
    # Other targets, such as path/to/file.ts, are examples for the review.
    own = [t for t in targets if t.endswith(".md") or t.startswith("scripts/")]
    return [
        f"{page}: missing {target}"
        for target in own
        if "://" not in target and not (page.parent / target).exists()
    ]


def check_words(page: Path) -> list[str]:
    errors = []
    # Examples keep their own words. A blanked fence keeps the line numbers.
    text = FENCED.sub(lambda m: "\n" * m.group(0).count("\n"), page.read_text(encoding="utf-8"))
    for number, line in enumerate(text.splitlines(), 1):
        # A table row is a list of search terms, and so is a quoted word.
        if line.startswith("|"):
            continue
        if word := BANNED.search(QUOTED.sub("", line)):
            errors.append(f'{page}:{number}: "{word.group(0)}", write "do not" or name the set')
    return errors


if __name__ == "__main__":
    sys.exit(main())
