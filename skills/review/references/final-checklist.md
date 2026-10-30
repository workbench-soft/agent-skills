# Before you send

You MUST read this once the review is written, before it goes out.

First run the `writing-style` final checklist over the full answer. Then read it
once more and check. Each line below MUST hold before the answer goes out:

- Each sentence read in a single pass. Whatever you reread got split, and no
  sentence holds two commas or two ideas.
- The `writing-style` final checklist passes over each part and each comment.
- Each comment, tagged `C1` and closing on `Explanation: E1`, sits in
  `## Comments` above `## Explanations`. Both keep the table's order.
- Each explanation starts with a bold line on what breaks and what to do. The
  four `####` headings follow in order. A nit gets one line and no headings.
- Part 1 and each finding carry their labels as headings, text underneath, and
  no label stuck to the start of a sentence.
- The full report is in the report language from `LANGUAGE.md`, whatever the
  language of the user's one-line ask, unless they named one in this
  conversation. Each comment block is English, with no report language left
  in it.
- Reading decided it: a couple of runs at most, no full build, install or suite.
- The summary says what was wrong and what happens now, free of code words.
  The table comes before the findings, each row matching one below.
- Part 2 holds a user flow and a code flow in `mermaid` blocks, each with an
  `Open the diagram` link. Each code node says what its file does.
- Each finding: a line link, the flow, the real output with its evidence
  marker in brackets, the fix. No finding stands on "could" alone.
- The four parts reached the screen before the later rounds, and each round
  came before the posting offer. Their findings continue the numbering.
- The answer closes on an offer to post the comments, beside a choice that
  skips it. Search the answer for `- [`: a markdown checkbox shows the picker
  tool got skipped.
- Posted only once asked and picked. Request changes only for a sure blocker.
- No finding is one a PR above fixes, a thread or check already raised, or its
  one look knocked down.
- Each link in the report shows its line number in the visible text, as
  `[file.ts:42](path/to/file.ts#L42)`. Search the answer for `](` and check every
  hit: visible text missing `:42` is the mistake to fix before sending.
- On a PR review, each link under a heading and each "comment on the PR" line
  holds the `· [in the PR](…)` half, `pull/<number>/files#diff-<anchor>R42`.
  Search for `/blob/`: it appears only for a file the PR doesn't touch.
- Each finding names one real case and keeps it through to the end, quotes the
  value it gives, and explains every code name in plain words on first use.
- Each comment for a finding: one doubt and one ask, under 40 words, without
  headings, lists, fenced code, run tallies or damage. It opens with `nit: `
  where it is one, and with `blocker: ` only on a sure blocker. Outside
  `Assertive:` it opens unsure or as a question, a checked fact included. No
  hedge phrase appears in two findings.
- Each finding has a shorter comment under `Shorter:` and the short one minus
  the hedge under `Assertive:`, all making the same ask.
- Each comment for a finding opens with the problem in plain words, with no
  chain of function or call names. A name or snippet appears only where the
  plain sentence couldn't locate the spot alone.
- You checked whether the repo or a dependency already does this, and the
  second round held the shape up to the task. No match? Say it in one line.
- The reviewed branch is still checked out, the user's own checkout is as you
  left it, and the answer says where the code is.
- No item on the list comes from what the repo rules told you to do, and a
  person outside the team could act on each finding.
