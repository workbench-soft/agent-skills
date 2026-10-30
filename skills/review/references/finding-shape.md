# The shape of a finding

Each finding is two entries under one heading: one tagged `C1` in
`## Comments`, one tagged `E1` in `## Explanations`. The user copies the
comment and opens the explanation only when the comment leaves them puzzled.
Ctrl+F (Cmd+F on a Mac) on the tag jumps from one to the other, in Copilot
Chat and Claude Code both.

## The comment entry

The heading, the place the comment goes, the comment in long, short and
assertive form, then the tag of its explanation. Only those, nits included.

````markdown
### C1. Blocker: the typed name is lost when the server is slow

**Comment on** [src/features/profile/SaveName.tsx:42](src/features/profile/SaveName.tsx#L42) · [in the PR](https://github.com/acme/shop/pull/123/files#diff-a9fc2b21a420affdc9db7ebf60a145e029fe45e9a5c0a35d794fd2bccfdc2c12R42),
line 42, added in this PR, the green side of the diff.

```markdown
blocker: this clears the input before saveName comes back - if the save fails
the typed name is gone. can we clear it after the call resolves ok?
```

Shorter:

```markdown
blocker: clears the input before saveName comes back, so a failed save loses
the name. clear it after it resolves ok?
```

Assertive:

```markdown
blocker: this clears the input before saveName comes back, so a failed save
loses the name. please clear it after the call resolves ok
```

Explanation: E1
````

## The explanation entry

A person in a hurry reads it after the comment. Between the opening line and
the fix, four `####` blocks MUST appear, around 25 lines all told, code
included. Whatever doesn't fit is cut.

A nit MUST leave this shape out: the heading, the link, and one line on what and
where, with the fix inline when it is short. No four blocks and no fix block of
its own.

````markdown
### E1. Blocker: the typed name is lost when the server is slow

[src/features/profile/SaveName.tsx:42](src/features/profile/SaveName.tsx#L42) · [in the PR](https://github.com/acme/shop/pull/123/files#diff-a9fc2b21a420affdc9db7ebf60a145e029fe45e9a5c0a35d794fd2bccfdc2c12R42)

**The name field clears before the server answers, so a failed save loses what
the person typed. Clear it after the answer.**

#### Who hits it

A person opens Settings, types a new name and presses Save. No other path reaches
this code.

#### Now

Line 42 empties the field, then waits for the server:
`setName(""); await saveName(name);`

#### Comes out

The server answers two seconds later, or fails. The field is already empty, so
the typed name is neither on screen nor on the server, and no message appears.
(read the diff)

#### Costs

The person thinks it saved, leaves the page and loses the data. On a slow
network this is every second try.

Fix, clear the field after the confirmation and leave the text alone on error:

```tsx
const saved = await saveName(name);
if (saved.ok) setName("");
```
````

## Part by part

- **Heading**: the tag, the severity, then the symptom a person would see, and
  neither the cause nor the file name. The words after the tag MUST match in
  both entries.
- **Tag**: `C` or `E` and the table number. The letters MUST stay Latin in any
  report language, so a single search finds them. The `Explanation:` label is
  written in the report language.
- **Link**: it MUST sit directly under the explanation heading, with both
  halves:

  ```markdown
  [path/to/file.ts:42](path/to/file.ts#L42) · [in the PR](https://github.com/OWNER/REPO/pull/123/files#diff-<anchor>R42)
  ```

  The visible text MUST finish with `:42`, so the line is readable without a
  hover. `[path/to/file.ts](path/to/file.ts#L42)` hides the number in the
  target, out of the reader's sight, and that is the mistake to avoid. The path
  is relative to the workspace, without backticks. The second half MUST follow
  [pr-links.md](pr-links.md), on each finding when a PR is the target.

- **The opening line**, in bold, below the link: what breaks, then what to do.
  A reader who stops at this line MUST know what is wrong.
- **Who hits it**: the product steps in order, starting from something a person
  sees. Only a test reaches it? Say that.
- **Now**: what the code does in one sentence, the line in backticks. Past three
  lines of code, it goes in a fenced block of its own.
- **Comes out**: the real value, quoted, with no summary in its place, then the
  evidence marker in brackets. A finding missing a concrete outcome and a marker
  MUST NOT go out.
- **Costs**: what the person or the business loses. A claim about frequency
  MUST NOT be made without evidence.
- **Fix**: one line in words, then the code, about ten lines at most. Not sure?
  Give the idea and name what still needs checking.
- **Comment on**: starts the comment entry, in the same two-link shape, and
  says whether the line is part of the diff.
- **Comment for the PR**: it MUST appear in the comment entry of each finding,
  nits included. Three blocks, the second and third under bare `Shorter:` and
  `Assertive:` lines. The user chooses one.

Those headings MUST follow that order, with none added. A fifth heading means
two findings.

## The two files that finish a finding

- On a GitHub PR review, or with a comment on a line the diff leaves alone, you
  MUST read [pr-links.md](pr-links.md) before the first link.
- You MUST read [comment-style.md](comment-style.md) before the first comment
  block and hold it in context until the last one is written. One sentence of
  doubt and one ask under 40 words, then the same halved, then halved and
  assertive. No headings and no fenced code.
