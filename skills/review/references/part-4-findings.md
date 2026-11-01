# Part 4: the findings

Two lists MUST come after the table, in this order:

1. `## Comments` MUST hold, for each finding, its heading tagged `C1`, the place
   the comment goes, the comment in long and short form, and `Explanation: E1`.
   The user copies from this list.
2. `## Explanations` MUST hold, for each finding, the same heading tagged `E1`,
   the link, the bold line, the four blocks and the fix. The user turns here
   when a comment leaves them puzzled.

All comments MUST sit in the first list, before the first explanation. The two
lists MUST hold the same findings, numbered and ordered as in the table. The
agent MUST sort by severity, on three levels: "blocker", "should fix", "nit", in
the report language.

Both entries of a finding and the full example are in
[finding-shape.md](finding-shape.md). The agent MUST read it before the first
finding.

## Picking the severity

A small fix doesn't make a small severity, and a nit tells the author they can
ignore it. So the agent MUST pick the level this way:

- **Blocker**: a merge ships a bug that a person or the data runs into. Lost
  input, a crash, a wrong result, a security hole MUST each be a blocker.
- **Nit**: the code works the same either way, and no part decays within a
  year. Formatting, a name, a shorter way to write the same expression MAY be
  nits.
- **Should fix** MUST cover whatever can drift quietly or mislead later, even
  with a one-line fix. Duplication, dead code, a path without a test, a comment
  claiming what the code doesn't do, a swallowed error, a value hardcoded in
  two places, a third party's token where the project has one of its own.
- Stuck between two levels, the higher one MUST win, and the repo's own scale
  MUST win over both where it exists. The `blocker: ` prefix on the comment
  MUST wait until the agent is certain.

## Carry one real case through the whole finding

The reader is new to this code and won't go hunting. The example, the numbers
and the fix all MUST be inside the finding.

A finding about the code in the abstract reads as fog. One real case from the
repo, in place of a made up `Foo`, MUST run from "Who hits it" through the fix:

- The finding MUST say what the thing does before giving its name: "`parseRow`
  reads one row of the uploaded file." After that, the name alone SHOULD do.
- The finding MUST show the value that goes in and the value that comes out,
  quoted.
- The finding MUST say in the reader's own words what the result tells them and
  what it hides: "the page says 40 rows imported, and says nowhere that two
  came out shifted."
- The finding MUST end with how the agent knows, in brackets: `(read the diff)`.

The case SHOULD read like this:

```markdown
#### Who hits it

`parseRow` reads one row of the uploaded file. This file has a row with a comma
inside quotes: `12,"Smith, John",ok`.

#### Comes out

`{ id: "12", name: "\"Smith", status: " John\"" }`. The name is cut in two and
the status swallowed the second half. The page says 40 rows imported, and says
nowhere that two of them are broken. (read the diff)
```
