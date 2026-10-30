# Review in rounds: security, speed, accessibility, state and failures

Done from 2025-10-15 to 2025-10-21, before the history was reset to one commit. The old commits sit under `refs/backup/main` in the local backup mirror of `agent-skills`.

## Why

One pass missed whole kinds of bugs and flagged what a later PR in the stack already fixed.

## User flows it touches

- **Review a PR** the skill runs a round per kind of problem and checks the PR stack.
- **Post** pick the best fit or a version per comment.
- **Blocker** a sure blocker opens with `blocker:`.

## Changes

- **`skills/review/references/final-checklist.md`** changed.
- **`skills/review/SKILL.md`** changed.
- **`skills/review/references/posting-comments.md`** changed.
- **`skills/review/references/pick-lists.md`** changed.
- **`skills/review/references/trace-the-flow.md`** changed.
- **`skills/review/references/architecture-pass.md`** changed.
- **`skills/review/references/comment-style.md`** changed.
- **`skills/review/references/finding-shape.md`** changed.
- **`skills/review/references/part-4-findings.md`** changed.
- **`skills/review/references/deep-dive.md`** removed.
- **Other files** 18 more.

## Steps, in commit order

1. review: draw the user flow and the code flow as mermaid diagrams (60299be, 2025-10-15)
2. writing-style: ban "nothing" next to "never" and drop it from every skill (4af7733, 2025-10-15)
3. agents: commit and push every change without being asked (120117e, 2025-10-15)
4. review: remove deep dive offer (1689714, 2025-10-15)
5. review: offer best fit and per-comment version picks when posting (3f77ae0, 2025-10-20)
6. review: use each hedge phrase in one comment per review (f2ba38c, 2025-10-20)
7. review: open a sure blocker's comment with blocker: (e82305d, 2025-10-20)
8. review: check the PR stack so no finding flags what a later PR fixes (29a0efd, 2025-10-20)
9. review: add security, speed and accessibility rounds (41c48df, 2025-10-20)
10. review: skip what threads and checks already say, and test each finding once (b406ad1, 2025-10-20)
11. review: add environment, stale-doc and mutation checks, runs only as the last resort (fda4bbc, 2025-10-21)
12. review: add state-and-failure and agent-instruction rounds (bb42184, 2025-10-21)

## Docs to update

- `AGENTS.md`
- `README.md`
