# The focused rounds

Each round MUST show the findings of one lens the `reviewer` core ran in
step 5. The rounds MUST come after the second round,
[architecture-pass.md](architecture-pass.md), in this order, and one line
naming each round MUST open it:

1. **Security** MUST appear on each review.
2. **Speed** MUST appear when the change holds code that runs.
3. **State and failure** MUST appear when the change writes a file, a table or
   a lock, or starts a background process.
4. **Accessibility** MUST appear when the change touches what a person sees
   or works with on screen.
5. **Agent instructions** MUST appear when the change touches a file an agent
   takes as orders.

Reliability, platform and each domain lens MUST follow as rounds of their own
when the core ran them. A domain round MUST name the skill it ran on and its
link. Each lens the core skipped MUST get one line giving the reason.

## What comes out

- **Shape** every round MUST follow "What comes out" of
  [architecture-pass.md](architecture-pass.md), with the numbers continued.
- **Once** a finding an earlier round already holds MUST NOT appear again.
- **Empty** a round with zero findings MUST say so in one line, naming what
  it checked.
- **Speed** a speed finding MUST give the size where it starts to hurt, and a
  guess MUST be labelled as a guess.
