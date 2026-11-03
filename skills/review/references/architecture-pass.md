# The second round: architectural gaps

The four parts hunt bugs line by line. This round MUST show what the
Architecture lens of the `reviewer` core found: whether the change is shaped
right in the first place. It MUST appear on every review.

## When it shows

The full first pass report MUST be on screen before this round, so the user
holds the findings while reading on. One line MUST say the second round
starts, then the round, then the rounds in
[focused-passes.md](focused-passes.md). Comments MUST stay off the PR until
they end.

The round MUST open with the one sentence the lens gave on what the change has
to achieve.

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
