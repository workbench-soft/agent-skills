# The second round: architectural gaps

The four parts hunt bugs line by line. This round MUST ask a different
question: is the change shaped right in the first place. It MUST run on every
review.

## When it runs

The full first pass report MUST be on screen before this round begins, so the
user holds the findings while it runs. Then one line MUST say the second round
is starting, then the round runs, then the rounds in
[focused-passes.md](focused-passes.md). Comments MUST stay off the PR until it
ends, since it can add findings that need one.

## What to ask

The agent MUST begin with the task. It MUST read the PR description, the
linked issue and the tests, then state in one sentence what the change has to
achieve. Then it MUST ask:

- Does the design deliver all of it? The agent MUST name the part left out.
- What is missing around it: a new endpoint with no permission check, state
  with no owner, an error path no code handles, a migration that can't be
  undone. The agent MUST name each gap it finds.
- Does anything solve a problem the repo lacks: a flag with one value, an
  abstraction with one implementation, a field no code reads? The agent MUST
  give the cost of keeping it.
- Does the work sit in the right place? A server check living in the browser,
  logic in a component that every other screen will need, a package reaching
  into the internals of another MUST each count as misplaced.
- Would a plainer version do the same job? The agent SHOULD sketch it in two
  or three sentences, naming the file it would sit in. With no plainer version
  in mind, it MUST say the shape is fine.
- Does it match how this repo solves the same thing elsewhere? The agent
  SHOULD link one example that exists.

A bug fixed by hand SHOULD raise one more question: what stops the next one?
The agent SHOULD name the lint rule or the check that would catch it.

## What comes out

A finding from this round MUST carry a cost: what breaks, what slows down, what
the next person has to read. "This could be cleaner" falls short of a finding.

Each one MUST follow the shape in [finding-shape.md](finding-shape.md), and the
numbers MUST continue from the first pass. The round MUST start with its own
table, made the way [part-3-table.md](part-3-table.md) says, or with one line
saying the shape holds and what holds it up. Its comments MUST come next, then
its explanations, in the order [part-4-findings.md](part-4-findings.md) sets.

A finding with no file and line to attach to MUST appear in the explanations
only, and MUST stay out of the posting.
