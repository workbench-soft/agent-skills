# Review skill: a fast first pass, findings as a list, posting at the end

Done from 2025-09-18 to 2025-09-24, before the history was reset to one commit. The old commits sit under `refs/backup/main` in the local backup mirror of `agent-skills`.

## Why

Reviews ran too long and posted comments before the person had read them.

## User flows it touches

- **Review a PR** a fast pass lists findings with checkboxes.
- **Post** the skill asks before posting and links each finding into the PR diff.
- **Architecture** a second round checks the shape of the change.

## Changes

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

## Steps, in commit order

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

## Docs to update

- `AGENTS.md`
- `README.md`
