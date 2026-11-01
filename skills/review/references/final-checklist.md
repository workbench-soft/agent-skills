# Before you send

The agent MUST read this once the review is written, before it goes out.

The agent MUST first run the `writing-style` final checklist over the full
answer, then read it once more. Each line below MUST hold before the answer
goes out:

- Each sentence MUST read in a single pass. Whatever needed a reread gets
  split, and no sentence holds two commas or two ideas.
- The `writing-style` final checklist MUST pass over each part and each comment.
- Each comment, tagged `C1` and closing on `Explanation: E1`, MUST sit in
  `## Comments` above `## Explanations`. Both MUST keep the table's order.
- Each explanation MUST start with a bold line on what breaks and what to do.
  The four `####` headings follow in order. A nit gets one line and no headings.
- Part 1 and each finding MUST carry their labels as headings, text underneath,
  and no label stuck to the start of a sentence.
- The full report MUST be in the report language from `LANGUAGE.md`, whatever
  the language of the user's one-line ask, unless they named one in this
  conversation. Each comment block MUST be English, with no report language
  left in it.
- Reading MUST have decided it: a couple of runs at most, no full build,
  install or suite.
- The summary MUST say what was wrong and what happens now, free of code words.
  The table comes before the findings, each row matching one below.
- Part 2 MUST hold a user flow and a code flow in `mermaid` blocks, each with an
  `Open the diagram` link. Each code node says what its file does.
- Each finding MUST hold a line link, the flow, the real output with its
  evidence marker in brackets, the fix. No finding stands on "could" alone.
- The four parts MUST reach the screen before the later rounds, and each round
  before the posting offer. Their findings continue the numbering.
- The answer MUST close on an offer to post the comments, beside a choice that
  skips it. A `- [` in the answer shows the picker tool got skipped.
- Comments MUST go up only once asked and picked. Request changes MUST be only
  for a sure blocker.
- No finding MAY be one a PR above fixes, a thread or check already raised, or
  its one look knocked down.
- Each link in the report MUST show its line number in the visible text, as
  `[file.ts:42](path/to/file.ts#L42)`. The agent MUST search the answer for `](`
  and fix each hit whose visible text lacks `:42`.
- On a PR review, each link under a heading and each "comment on the PR" line
  MUST hold the `· [in the PR](…)` half, `pull/<number>/files#diff-<anchor>R42`.
  `/blob/` MAY appear only for a file the PR doesn't touch.
- Each finding MUST name one real case and keep it through to the end, quote the
  value it gives, and explain every code name in plain words on first use.
- Each comment MUST be one doubt and one ask, under 40 words, without headings,
  lists, fenced code, run tallies or damage. It opens with `nit:` where it is
  one, and with `blocker:` only on a sure blocker. Outside `Assertive:` it
  opens unsure or as a question. No hedge phrase MAY appear in two findings.
- Each finding MUST have a shorter comment under `Shorter:` and the short one
  minus the hedge under `Assertive:`, all making the same ask.
- Each comment MUST open with the problem in plain words, with no chain of
  function or call names. A name or snippet appears only where the plain
  sentence couldn't locate the spot alone.
- The agent MUST have checked whether the repo or a dependency already does
  this, and the second round MUST have held the shape up to the task. With no
  match, one line MUST say so.
- The reviewed branch MUST still be checked out, the user's own checkout as the
  agent left it, and the answer MUST say where the code is.
- No item MAY come from what the repo rules told the agent to do, and a person
  outside the team MUST be able to act on each finding.
