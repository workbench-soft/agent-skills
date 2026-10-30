---
name: specs
description: 'Use before the first edit of any change to a repo, in any repository and in any language: a new feature, a change to a feature, a follow-up tweak in the same session, a refactor, a bug fix. Also on "write a spec", "plan this feature", "update the spec", "напиши спеку", "допиши спеку", "спланируй фичу". It decides whether the change needs a spec: a feature or a change to one does, a bug fix does not unless it reworks the design, the data or several modules. It keeps one file per feature, specs/<feature>.md, finds the one that covers the work and adds a dated entry to it, or creates it for a new feature. The spec lands in the first commit, before the code, and stays true as the work goes on.'
---

# Specs, one per feature

A spec is a Markdown file under `specs/` at the repo root that describes one
feature: what it does, how it works and each change made to it. The work
follows the spec, and the spec stays in the repo after the merge.

## 1. Decide if the change needs a spec

| The change                                              | Spec                            |
| ------------------------------------------------------- | ------------------------------- |
| a new feature                                           | a new file                      |
| a change or an addition to a feature                    | an entry in that feature's file |
| another tweak to the same feature, later in the session | the same entry, extended        |
| a refactor, a migration, a rewrite                      | a file named for the work       |
| a bug fix                                               | none                            |
| a big bug fix                                           | an entry in the feature's file  |

- **Big bug fix** one that changes the design, a data format or a schema,
  touches several modules, or needs a migration. Other fixes SHOULD NOT get a
  spec.
- **Fix against the spec** a fix that makes a line in the spec untrue MUST
  correct that line in the same commit.
- **Docs, config, version bumps** need no spec.

## 2. Find the feature's spec

Read the list before writing, since an older spec can cover the feature under
another name:

```bash
ls specs/ 2>/dev/null
grep -il "<feature words>" specs/*.md
```

- **Found** the work goes into that file, whatever its name, dated ones too.
- **Several match** pick the one whose feature the person would name. The
  others stay as they are.
- **None** a new feature gets `specs/<feature>.md`.
- **Name** the feature in the person's words, in kebab case: `photo-upload`,
  `offline-sync`. A date, a ticket key or a branch MUST NOT go in the name,
  since later work on the feature reuses the file.
- **Repo rules** a repo that sets its own spec place or name wins over this
  skill.

## 3. Write a new spec

The top describes the feature as it stands. The entries below record each
change, newest last.

```markdown
# <Feature, in the person's words>

## What it does for the person

## User flows

## How it works: modules, files, data

## Limits

## Changes

### 2025-10-29 <what changes, in the person's words> (PROJ-123)

- **Why** the ask and the problem behind it.
- **Changes** each file or module, what changes in it.
- **Steps** in commit order.
- **Docs** the docs this change updates.
```

- **Ticket** its key goes in the entry heading when one exists.
- **A new app** its first spec plans the launch as the instructions file
  says: search, ads, Google Play, marketing.

## 4. Extend an existing spec

1. Add an entry under `## Changes`, with today's date and the ask.
2. Update the top sections the change makes stale, so the top always reads as
   the feature works after the merge.
3. Leave older entries as they are. They record why the code looks as it does.

- **Same session** a further request on the same feature, before the PR
  merges, extends the entry this session added. A new entry starts only on a
  new branch.
- **Course change** a commit that departs from the entry SHOULD update the
  entry in that same commit.

## 5. Commit

- **First** a new spec or a new entry lands in the first commit, before any
  code. Go on without asking for approval.
- **Message** in the repo's style. Without one, write `<feature>: plan <the
  change>`.
- **Kept** a spec MUST stay in the repo after the merge.
- **PR** the description links the spec as `create-pr` says.
