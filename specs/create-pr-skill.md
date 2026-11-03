# create-pr skill

## What it does for the person

Writes a PR body with the flows, sources and commands, then opens the PR.

## User flows

- **Open a PR** the body shows user flows, new commands, database changes, related PRs and the commands that generated code.
- **Review** comments use hedges and the skill searches them for "never".

## How it works: modules, files, data

Each entry below names the files it changed.

## Limits

None written down yet.

## Changes

### 2025-10-08 create-pr draws the flows and links its sources, review comments sound less sure

Done from 2025-10-08 to 2025-10-14, before the history was reset to one commit. The old commits sit under `refs/backup/main` in the local backup mirror of `agent-skills`.

#### Why

PR bodies missed how to try the change and what it built on. Review comments read as orders.

#### User flows it touches

- **Open a PR** the body shows user flows, new commands, database changes, related PRs and the commands that generated code.
- **Review** comments use hedges and the skill searches them for "never".

#### Changes

- **`skills/create-pr/SKILL.md`** changed.
- **`skills/review/references/comment-style.md`** changed.
- **`skills/review/references/final-checklist.md`** changed.
- **`skills/implement-ticket/SKILL.md`** changed.
- **`skills/review/references/finding-shape.md`** changed.
- **`skills/review/references/posting-comments.md`** changed.

#### Steps, in commit order

1. create-pr: draw the user flows, show how to try a new command, list reused code (c23ead2, 2025-10-08)
2. create-pr: list the commands that generated or rewrote code (8aab3c4, 2025-10-09)
3. create-pr: link the designs and docs the change used (6a44f65, 2025-10-09)
4. review: make every comment sound unsure, search comments for never (4577433, 2025-10-12)
5. review: offer an assertive comment version, rotate openers, check each comment for never (4770eb8, 2025-10-12)
6. create-pr: show table changes, relations and data flow when the database changes (0797afd, 2025-10-13)
7. create-pr: link the related PRs the change builds on or ships with (7be7c88, 2025-10-14)

#### Docs to update

- `README.md`

### 2026-11-03 Before and after diagrams, coloured by status

#### Why

A single diagram of the new state hid what the change moved. The person wants each diagram in a PR body, a review and the docs to show how it was and how it is, with colour on each element.

#### User flows it touches

- **Open a PR** each flowchart comes as a Before and After pair. Nodes are green new, amber changed, red removed, gray unchanged, and the shape gives the kind: screen, code, data store, outside service.
- **Review** the user flow and the code flow in part 2 come as the same pairs.

#### Changes

- **`skills/create-pr/references/diagrams.md`** new, the pair, the four `classDef` lines, the shapes and the legend.
- **`skills/create-pr/SKILL.md`** the template and the example draw pairs.
- **`skills/review/references/part-2-map.md`** and **`final-checklist.md`** the same pairs in the review report.
- **`skills/architecture/SKILL.md`** a restructure draws pairs.
- **`feature-docs`** in `agent-skills-private` points to the same rules.
