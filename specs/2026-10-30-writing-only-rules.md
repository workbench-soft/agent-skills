# The rules file holds only the writing rules

## 2026-10-30

- **Why** the install wires `writing-style.instructions.md` into every agent
  on each turn. Its spec, ship, TODO and session end rules made a new user's
  agent merge PRs and add ads unasked.
- **Change** the file keeps "How to write". The other sections leave the
  repo.
- **Install** the Codex line names only the writing rules. An older block
  gets swapped on the next run, since its words differ.
- **turn-voice** reads the outcome marker when the person's own rules ask for
  one, and says the folder and the title without it.
