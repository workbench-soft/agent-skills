# The second round: architectural gaps

The four parts hunt bugs line by line. This round asks a different question:
is the change shaped right in the first place. It MUST run on every review.

## When it runs

The full first pass report MUST be on screen before this round begins, so the
user holds the findings while it runs. Then one line says the second round is
starting, then the round runs, then the rounds in
[focused-passes.md](focused-passes.md). Comments stay off the PR until it ends,
since it can add findings that need one.

## What to ask

Begin with the task. Read the PR description, the linked issue and the tests,
then state in one sentence what the change must achieve. Then ask:

- Does the design deliver all of it? Name the part left out.
- What is missing around it: a new endpoint with no permission check, state
  with no owner, an error path no code handles, a migration that can't be
  undone.
- Does anything solve a problem the repo lacks: a flag with one value, an
  abstraction with one implementation, a field no code reads? Give the cost of
  keeping it.
- Does the work sit in the right place? A server check living in the browser,
  logic in a component that every other screen will need, a package reaching
  into the internals of another.
- Would a plainer version do the same job? Sketch it in two or three
  sentences, naming the file it would sit in. No plainer version comes to
  mind? Say the shape is fine.
- Does it match how this repo solves the same thing elsewhere? Link one
  example that exists.

A bug fixed by hand SHOULD raise one more question: what stops the next one?
Name the lint rule or the check that would catch it.

## What comes out

A finding from this round MUST carry a cost: what breaks, what slows down, what
the next person must read. "This could be cleaner" falls short of a finding.

Each one MUST follow the shape in [finding-shape.md](finding-shape.md), and the
numbers MUST continue from the first pass. The round starts with its own table,
made the way [part-3-table.md](part-3-table.md) says, or with one line saying
the shape holds and what holds it up. Its comments come next, then its
explanations, in the order [part-4-findings.md](part-4-findings.md) sets.

A finding with no file and line to attach to appears in the explanations only,
and stays out of the posting.
