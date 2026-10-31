# Writing the Markdown in this repo

These rules MUST hold for every file under `skills/`. An agent loads those
files on each run, so each line costs tokens each time. The size caps MUST
hold for skills only. The other rules MUST also hold for `README.md` and the
instructions file. `install.sh` MAY ignore them.

## Structure

- `skills/<name>/SKILL.md` MUST contain the skill: frontmatter first, then the
  steps in the order the agent runs them.
- Detail that only one branch of the work needs SHOULD go to
  `skills/<name>/references/<topic>.md`, and SKILL.md MUST say when to read
  that file.
- `writing-style` holds every rule on words and layout. `review` and
  `create-pr` MUST load it and add only their own rules. Other files MUST NOT
  repeat a rule from it.

## Size

The cap MUST count prose lines. Fenced blocks and blank lines MUST NOT count,
since those examples are the templates the agent copies. Each file MUST stay
within the cap in its row.

| File             | Prose lines |
| ---------------- | ----------- |
| `SKILL.md`       | 300         |
| a reference file | 60          |

The prose budget script MUST exit 0:

```sh
mise x -- python scripts/check-prose-budget.py skills/*/SKILL.md skills/*/references/*.md
```

A file over its cap SHOULD move a section to a reference file or drop it.
Tighter wording SHOULD be the second resort.

## Key words

Each paragraph and list item MUST hold MUST, MUST NOT, SHOULD, SHOULD NOT or
MAY, steps and descriptions included. A file MUST NOT spend a line on what the
words mean, since the reader knows.

- **MUST, MUST NOT** breaking it ruins the output or the repo.
- **SHOULD, SHOULD NOT** the default, which the agent MAY break only with a
  reason given in the answer.
- **MAY** a real choice where either branch is fine.
- **Steps** a step MUST name who acts and carry the key word: "The agent MUST
  sort by severity", not "Sort by severity".
- **Lowercase** "must", "should" and "may" MUST NOT appear outside code and
  quotes. A softer rule MUST use SHOULD or MAY.
- **Examples** a fenced block, a quote and table rows MAY hold no key word.
  The line above them MUST hold the key word that covers them.

`scripts/keyword-check.ts` MUST pass on each file in scope. `mise run lint`
runs it.

## Prose

- A rule SHOULD take one line. The reason SHOULD appear only where the agent
  goes wrong without it.
- Three rules or more MUST be a list.
- A section SHOULD end at five bullets. Beyond that, it SHOULD split under a
  heading.
- A rule MAY have one example, and a Bad and Good pair SHOULD replace an
  explanation.
- Articles and filler SHOULD go wherever the line still reads: "The agent
  MUST read the repo rules first" beats "You should make sure to read the
  repo rules first".

## Verbatim regions

The agent copies fenced blocks, inline backticks and links as templates.
Squeezing or reformatting them changes what comes out. They MUST stay as they
are unless the edit is about them.

## Frontmatter

- `name` MUST equal the folder name.
- `description` MUST be one paragraph: when the skill applies, the words that
  trigger it, and what it produces. An agent sees only this before it loads
  the file, so the trigger words SHOULD count more than the prose.

## Language

- The skills MUST be in English.
- `LANGUAGE.md` beside a SKILL.md MUST name the language the skill answers
  in, and the installer MUST write that file. A SKILL.md MUST NOT name a
  language of its own.

## Skills

Repo skills MUST sit in `.agents/skills/`, a folder each, where Codex reads
them. `.claude/skills` MUST link to that folder for Claude Code and Copilot.
On Windows, `git config --global core.symlinks true` MUST run before the
clone, or the link checks out as a text file.

- **`add-skill`** the agent MUST load it to add or change a shared skill in
  `skills/` and run its checks.

## Before you commit

1. `scripts/check-prose-budget.py`, `scripts/check-skills.py` and
   `scripts/keyword-check.ts` MUST exit 0.
2. Each paragraph and list item MUST hold a key word, and no line MAY explain
   the key words.
3. Each MUST SHOULD hold up as "breaking this ruins the output". Others
   SHOULD drop to SHOULD or MAY.
4. A rule from `writing-style` MUST NOT be repeated.
5. Fenced blocks MUST stay unchanged unless the edit is about them.
6. The `writing-style` final checklist MUST pass over the prose.

## Commit and push

- Each change MUST ship as a PR with a line under `## Unreleased` in
  `CHANGELOG.md`, as `CONTRIBUTING.md` describes.
- The subject SHOULD start with the skill it changes: `review: ...`.
