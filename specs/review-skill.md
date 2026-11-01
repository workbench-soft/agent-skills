# review skill

## What it does for the person

Reviews a PR in rounds, lists findings, then posts the picked comments with a verdict.

## User flows

- **Review a PR** a fast pass lists findings with checkboxes.
- **Post** the skill asks before posting and links each finding into the PR diff.
- **Architecture** a second round checks the shape of the change.
- **Review a PR** the skill runs a round per kind of problem and checks the PR stack.
- **Post** pick the best fit or a version per comment.
- **Blocker** a sure blocker opens with `blocker:`.
- **CI** fails when the Play bundle holds the GitHub release URL.
- **Review** approves, requests changes or comments, from the findings.

## How it works: modules, files, data

Each entry below names the files it changed.

## Limits

None written down yet.

## Changes

### 2025-09-18 Review skill: a fast first pass, findings as a list, posting at the end

Done from 2025-09-18 to 2025-09-24, before the history was reset to one commit. The old commits sit under `refs/backup/main` in the local backup mirror of `agent-skills`.

#### Why

Reviews ran too long and posted comments before the person had read them.

#### User flows it touches

- **Review a PR** a fast pass lists findings with checkboxes.
- **Post** the skill asks before posting and links each finding into the PR diff.
- **Architecture** a second round checks the shape of the change.

#### Changes

- **`skills/review/SKILL.md`** changed.
- **`skills/review/references/final-checklist.md`** changed.
- **`skills/review/references/posting-comments.md`** new.
- **`skills/review/references/pr-links.md`** changed.
- **`skills/review/references/getting-the-code.md`** changed.
- **`skills/review/references/comment-style.md`** changed.
- **`skills/review/references/pick-lists.md`** new.
- **`skills/review/references/deep-dive.md`** new.
- **`skills/review/references/finding-shape.md`** new.
- **`skills/review/references/report-shape.md`** new.
- **Other files** 16 more.

#### Steps, in commit order

1. Narrow review skill trigger to explicit PR review requests (70a1c05, 2025-09-18)
2. Fix review language override, cut unneeded checkouts and runs, exempt nits from the full template (f641397, 2025-09-18)
3. Cut redundant and overlong prose from the review skill (04c496f, 2025-09-18)
4. Favor plain problem descriptions over chained code names in PR comments (10f2426, 2025-09-18)
5. Make skipping tests and typechecks the default in the review skill (1fb19b1, 2025-09-18)
6. Split the review into a fast first pass and an opt-in deep dive (7e36a88, 2025-09-18)
7. Offer the deep dive as a checkbox list of findings (1f1e776, 2025-09-18)
8. Make the fixed review labels real headings (d4a0009, 2025-09-18)
9. Double output (b7d3e5d, 2025-09-18)
10. MUST/SHOULD (73009e5, 2025-09-18)
11. checkboxes, posting comments ,remove summary (0053b98, 2025-09-18)
12. review: wire the posting step into the deep dive offer (2bedab6, 2025-09-18)
13. comment sections (252b1c5, 2025-09-18)
14. review: ask about posting only at the end (af383f9, 2025-09-18)
15. review: offer posting before the deep dive (525275e, 2025-09-22)
16. review: split the architecture check into a second round (70ddc8a, 2025-09-22)
17. review: link findings to blob permalinks instead of diff anchors (44c8e4e, 2025-09-23)
18. review: link findings into the PR diff, not a blob permalink (cd7ab89, 2025-09-24)

#### Docs to update

- `AGENTS.md`
- `README.md`

### 2025-10-15 Review in rounds: security, speed, accessibility, state and failures

Done from 2025-10-15 to 2025-10-21, before the history was reset to one commit. The old commits sit under `refs/backup/main` in the local backup mirror of `agent-skills`.

#### Why

One pass missed whole kinds of bugs and flagged what a later PR in the stack already fixed.

#### User flows it touches

- **Review a PR** the skill runs a round per kind of problem and checks the PR stack.
- **Post** pick the best fit or a version per comment.
- **Blocker** a sure blocker opens with `blocker:`.

#### Changes

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

#### Steps, in commit order

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

#### Docs to update

- `AGENTS.md`
- `README.md`

### 2025-10-28 app-update checks the Play bundle in CI, review picks a verdict

Done on 2025-10-28, before the history was reset to one commit. The old commits sit under `refs/backup/main` in the local backup mirror of `agent-skills`.

#### Why

An update URL could slip into the Play bundle, and reviews posted without a verdict.

#### User flows it touches

- **CI** fails when the Play bundle holds the GitHub release URL.
- **Review** approves, requests changes or comments, from the findings.

#### Changes

- **`skills/app-update/SKILL.md`** changed.
- **`skills/review/SKILL.md`** changed.
- **`skills/review/references/final-checklist.md`** changed.
- **`skills/review/references/posting-comments.md`** changed.
- **`skills/review/references/verdict.md`** new.

#### Steps, in commit order

1. app-update: check the Play bundle in CI and build one repo at a time (b22eccf, 2025-10-28)
2. review: approve, request changes or just comment, picked from the findings (3656ba4, 2025-10-28)

#### Docs to update

- `CHANGELOG.md`
- `README.md`
