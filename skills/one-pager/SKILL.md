---
name: one-pager
description: 'Use in any repository and in any language before writing a text that describes something: a spec, a design doc, an architecture doc, a plan, a proposal, a research or audit write-up, an RFC. Also on "write a one-pager", "make a summary of the doc", "describe it in detail", "distill this", "сделай ван пейджер", "сделай выжимку", "опиши подробно", "распиши детально". The agent writes the full text first, with every fact, decision, number and open question, then distills a one-pager from it and puts it at the top of the same file under ## One-pager. The one-pager fits one screen, adds no fact of its own and changes with the full text in the same commit, so the doc reads in a minute and keeps its meaning.'
---

# Full text first, then a one-pager

A text that describes something MUST be written in 2 passes. The full text
keeps the meaning, and the one-pager on top lets a tired reader get it in a
minute.

- **Scope** specs, design and architecture docs, plans, proposals, research
  and audit write-ups SHOULD follow this skill.
- **Out of scope** chat answers, commit messages and PR bodies MUST keep the
  short rules of `writing-style` and `create-pr`.
- **Words** each pass MUST follow `writing-style`.

## 1. Write the full text

The agent MUST write the full text before the one-pager, and MUST NOT cut it to
save space. It SHOULD cover each row that applies:

| Part      | What goes in                                                    |
| --------- | --------------------------------------------------------------- |
| Why       | the ask, the problem behind it, who has it, what happens today  |
| What      | the result for the person, the user flows step by step, the I/O |
| How       | the modules, files, data, formats and the order of the steps    |
| Decisions | each choice, the options turned down and the reason             |
| Limits    | the edge cases, risks, costs, numbers and the open questions    |

The agent SHOULD read the code, the docs and the earlier specs first, so the
full text states facts. A guess MUST be labelled as one.

## 2. Distill the one-pager

The agent MUST then write the one-pager from the full text, as the first
section under the title, in this shape:

```markdown
# <Title>

## One-pager

- **Problem** <who has it and what it costs them>
- **Fix** <the decision in one line>
- **How** <the main idea of how it works>
- **Risks** <what can go wrong, the main limit>
- **Next** <the next step or the open question>
```

- **One screen** the one-pager MUST fit about 40 lines, and SHOULD stay near
  the 5 bullets above. A bullet MAY become a short numbered flow or a small
  table when the full text holds one.
- **No new facts** each line MUST come from the full text. A fact the agent
  finds while distilling MUST go into the full text first.
- **Each decision** a choice that changes what the reader does MUST appear in
  the one-pager.
- **Plain** the one-pager SHOULD use the reader's words, with no name from the
  code unless the reader acts on it.
- **Links** a bullet MAY end with a link to its section in the full text.

## 3. Check it

The agent MUST read the one-pager alone, as a reader who skips the rest, and
fix it until each answer is yes:

| Question                                                          |
| ----------------------------------------------------------------- |
| Does the reader know the problem, the decision and the next step? |
| Would the reader decide the same as a reader of the full text?    |
| Does each line trace to a section of the full text?               |

## 4. Keep both true

- **Same commit** an edit to the full text MUST update each one-pager line it
  makes stale, in the same commit.
- **Older docs** a doc without a one-pager SHOULD get one the next time the
  agent edits it.
