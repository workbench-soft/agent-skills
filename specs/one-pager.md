# A skill that writes the full text first, then a one-pager

## One-pager

- **Problem** a spec or a design doc is either short and loses the reasons, or
  long and the reader skips it.
- **Fix** the agent writes the full version first, with every fact and
  decision. Then it writes a one-pager from it at the top of the same file.
- **One-pager** fits one screen: the goal, the decision, how it works, the
  risks, the next step. Each line comes from the full text below it.
- **Where** a new `one-pager` skill holds the steps. `specs` calls it for each
  spec, so every spec gets a `## One-pager` section on top.
- **Kept true** a change to the full text updates the one-pager in the same
  commit.

## What it does for the person

- **Ask** the owner wants each description written in 2 passes: the full text
  first, as detailed as possible, then a one-pager distilled from it. The full
  text keeps the meaning, and the one-pager reads in a minute.
- **Now** `specs` gives a template with sections, and no step says how much
  detail goes in or how a reader gets the gist fast. Specs come out either thin
  or long without a summary.
- **Scope** specs, design and architecture docs, plans, research and audit
  write-ups. Chat answers and PR bodies keep their own short rules from
  `writing-style` and `create-pr`.

## User flows

1. The person asks for a spec. `specs` picks the file and calls `one-pager`.
   The agent writes the full sections, then the `## One-pager` on top, and
   commits both before the code.
2. The person asks for a design doc or a write-up. The agent loads `one-pager`
   and does the same in that doc.
3. A later change edits the full text. The agent updates the one-pager lines
   that went stale in the same commit.

## How it works: modules, files, data

- **`skills/one-pager/SKILL.md`** the steps: full pass, distill pass, the check
  that the one-pager holds each decision and adds no new fact, and the sync
  rule.
- **`skills/specs/SKILL.md`** the template gets `## One-pager` under the title,
  and step 3 calls `one-pager`.
- **Same file** the one-pager sits at the top of the file it sums up. A second
  file would break the one spec per feature rule and drift from the details.

## Limits

- **Screen** the one-pager stops at about 40 lines, the height of one screen.
- **No new facts** a fact absent from the full text MUST NOT appear in the
  one-pager.
- **Older specs** get a one-pager the next time someone edits them, not in a
  sweep.

## Changes

### 2026-11-03 Full text first, then a one-pager

- **Why** the owner asked for every description to be written in full first and
  then distilled to a one-pager that is easy to read.
- **Changes** new `skills/one-pager/SKILL.md`, `skills/specs/SKILL.md` calls it
  and adds the section to the template, `README.md` lists the skill,
  `CHANGELOG.md` gets the line.
- **Steps** this spec, then the skill, then `specs`, then the docs.
- **Docs** `README.md` skill list.
