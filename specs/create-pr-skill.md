# create-pr skill

## What it does for the person

Writes a PR body with the flows, sources and commands, then opens the PR.

## User flows

- **Open a PR** the body shows user flows, new commands, database changes, related PRs, the commands that generated code and a step by step log of the work.
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

- **Open a PR** the body shows user flows, new commands, database changes, related PRs, the commands that generated code and a step by step log of the work.
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

### 2026-11-18 Before, now and how it was done

#### Why

A PR body showed the new state only. The reader couldn't tell what changed for them, or how the agent got there and which skills it leaned on.

#### User flows it touches

- **Open a PR** the body adds How it worked before and, when an agent wrote the change, How it was done: each skill, agent or tool with a plain line on what it is, and each read of code with its reason. A change with no screen gets the before and after flow of the agent or tool steps. The prose cap is 30 lines.

#### Changes

- **`skills/create-pr/SKILL.md`** the template, the section rules, the writing rules and the example body.
- **`README.md`** and **`docs/features.md`** describe the new sections.

#### Docs to update

- `README.md`
- `docs/features.md`

### 2026-11-24 Step by step log of the work

#### Why

A reader of the PR couldn't redo the work by hand. The body named the skills and the code read, but left out the order: which page opened, which repo and files served as a pattern, which commands ran, where each file got saved.

#### User flows it touches

- **Open a PR** the body adds a `Step by step` section when an agent wrote the change: a numbered list in the order the work happened. Each step names its repo, the link or file, the exact command, and what it settled or saved. The section sits outside the 30 line cap.
- **Draft PR opened early** the agent fills the list once more with `gh pr edit` before `gh pr ready`, so the merged body holds every step.

#### Changes

- **`skills/create-pr/references/step-log.md`** new, the rules for the list and an example.
- **`skills/create-pr/SKILL.md`** the template gets the section, the section rules point to the reference, the description names it.
- **`README.md`** and **`docs/features.md`** describe the new section.
- **`ship`** in `agent-skills-private` refreshes the body before `gh pr ready`, in its own PR.

#### Docs to update

- `README.md`
- `docs/features.md`

### 2026-11-25 A guide for the reviewer: where to start and what depends on what

#### Why

A reviewer opened the diff and didn't know which file to read first. The body told what changed for the person, but not how the code pieces connect, so the reviewer jumped between files to guess the order.

#### User flows it touches

- **Open a PR** the body adds a `How to review` section right after `How it works now`: the entry point, a numbered reading order, a mermaid map of which file calls which, and the parts a reviewer can skim. It uses plain words a newcomer follows.
- **Small PR** a change of one or two files gets one line: the file to open and what to check there, with no map.

#### Changes

- **`skills/create-pr/references/review-guide.md`** new, the rules for the section and an example.
- **`skills/create-pr/SKILL.md`** the template, the section rules, the example body and the description.
- **`README.md`** and **`docs/features.md`** describe the new section.

#### Docs to update

- `README.md`
- `docs/features.md`
