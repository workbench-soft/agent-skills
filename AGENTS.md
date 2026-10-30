# Writing the Markdown in this repo

These rules cover every file under `skills/`. An agent loads those files on
each run, so each line costs tokens each time. The size caps apply to skills
only. The other rules apply to `README.md` and the instructions file as well.
`install.sh` is out of scope.

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

The cap counts prose lines. Fenced blocks and blank lines don't count, since
those examples are the templates the agent copies.

| File             | Prose lines |
| ---------------- | ----------- |
| `SKILL.md`       | 300         |
| a reference file | 60          |

```sh
mise x -- python scripts/check-prose-budget.py skills/*/SKILL.md skills/*/references/*.md
```

A file over its cap SHOULD move a section to a reference file or drop it.
Tighter wording is the second resort.

## RFC 2119 words

Each rule MUST have its own modal. A file MUST NOT spend a line on what the
RFC 2119 words mean, since the reader knows.

- `MUST`, `MUST NOT`: breaking it ruins the output or the repo.
- `SHOULD`, `SHOULD NOT`: the default, broken only with a reason given in the
  answer.
- `MAY`: a real choice where either branch is fine.
- Steps, descriptions and examples get no modal: "Write three bullets",
  "Sort by severity".
- One modal per sentence, and none in an example block. An example shows, it
  doesn't set a rule.

## Prose

- A rule SHOULD take one line. Add the reason only where the agent goes wrong
  without it.
- Three rules or more MUST be a list.
- A section SHOULD end at five bullets. Beyond that, split it under a heading.
- A rule MAY have one example, and a Bad and Good pair works better than an
  explanation.
- Articles and filler SHOULD go wherever the line still reads: "Read the repo
  rules first" beats "You should make sure to read the repo rules first".

## Verbatim regions

The agent copies fenced blocks, inline backticks and links as templates.
Squeezing or reformatting them changes what comes out. They MUST stay as they
are unless the edit is about them.

## Frontmatter

- `name` MUST equal the folder name.
- `description` MUST be one paragraph: when the skill applies, the words that
  trigger it, and what it produces. An agent sees only this before it loads
  the file, so the trigger words count more than the prose.

## Language

- The skills MUST be in English.
- `LANGUAGE.md` beside a SKILL.md names the language the skill answers in.
  The installer writes that file. A SKILL.md MUST NOT name a language of its
  own.

## Skills

Repo skills sit in `.agents/skills/`, a folder each, and Codex reads them there. `.claude/skills` links to that folder for Claude Code and Copilot.
On Windows, run `git config --global core.symlinks true` before the clone. Otherwise the link checks out as a text file.

- **`add-skill`** add or change a shared skill in `skills/` and run its checks.

## Before you commit

1. `scripts/check-prose-budget.py` and `scripts/check-skills.py` exit 0.
2. Each rule has a modal, and no line explains the modals.
3. Each `MUST` holds up as "breaking this ruins the output". Others drop to
   `SHOULD` or lose the modal.
4. No rule repeated from `writing-style`.
5. Fenced blocks unchanged unless the edit is about them.
6. The `writing-style` final checklist passes over the prose.

## Commit and push

- Each change MUST ship as a PR with a line under `## Unreleased` in
  `CHANGELOG.md`, as `CONTRIBUTING.md` describes.
- The subject SHOULD start with the skill it changes: `review: ...`.
