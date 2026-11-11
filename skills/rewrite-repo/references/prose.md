# Rewriting prose with the same facts

Step 10 of `rewrite-repo` MUST read this file.

## Per file

1. The agent MUST write down every fact the file holds: each rule, number,
   command, path, link, limit and example. The list MUST go in the
   scratchpad, in the form below.
2. The agent MUST reword the file, and MAY reorder it where a new order reads
   better.
3. The agent MUST check every fact against the new text, and put back any
   that went missing.
4. The agent SHOULD read the old file and the new one side by side, once, at
   the reader's pace.

```text
fact: install needs git and a POSIX shell
fact: --lang sets the review language
fact: SKILL.md cap is 300 prose lines
```

## What stays exact

- **Commands** every command in a fenced block MUST still work. Only renamed
  paths and names MAY change inside it.
- **Links** the target MUST stay. The link text MAY change.
- **Numbers** limits, versions, ports and sizes MUST stay exact.
- **Legal text** the licence and copyright lines MUST keep every word.
- **Quoted output** text a tool prints MUST stay exact, because readers search
  for it.

## Rules keep their strength

A rewrite MUST keep a `MUST` as a `MUST`, and a `SHOULD` as a `SHOULD`.
"Do X" MUST remain an order. A softer rule, or a default turned into a hard
rule, changes what the reader does.

A rewrite MUST NOT soften "The PR MUST carry a changelog entry" into "A
changelog entry helps". It MAY turn it into "Each PR MUST add a line to the
changelog".

## Skills and agent files

A skill is the agent's instructions, so a rewrite MUST NOT lose a word the
agent acts on.

- **Description** each trigger phrase in the frontmatter `description` MUST
  stay, in all the languages it lists. The new wording MAY go around them.
- **Order** the steps MUST stay in order, because an agent runs them from the
  top.
- **Templates** a fenced block the agent copies MUST keep its fields in their
  order. Only the words between fields MAY change.
- **References** a line saying when to read a reference file MUST stay, link
  and all.

## Code comments

A comment SHOULD give the reason behind the code, in fresh words. A comment
that echoes the next line SHOULD go. A comment naming an old symbol MUST take
the new name.
