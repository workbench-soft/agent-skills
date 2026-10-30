---
name: implement-ticket
description: 'Use when there is a ticket to do, implement, fix, pick up or work on, in any repository and in any language: "do PROJ-123", "implement this ticket", "pick up EX-42", "сделай тикет", a Jira link plus "do it". It reads the ticket and writes the plan to specs/ in a fresh worktree off the latest main or master. Then it makes the smallest change that does what the ticket asks, in clean code split into modules, and updates the README, architecture, user flow and features docs. Each step is its own commit with the ticket key, per the repo rules. It opens a PR through the create-pr skill and moves the ticket to In Review.'
---

# Implement a ticket

Read the ticket, make the smallest change that meets it, ship that as a PR,
then move the ticket to In Review.

## 1. Read the ticket

Take the key, such as `PROJ-123`, from the user's message or link. Without a
key, ask for one.

Fetch it with the agent's Jira tool, the Atlassian MCP server or `acli`:

```bash
acli jira workitem view PROJ-123 --fields summary,description,status,comment
```

Go through the summary, the description, the acceptance criteria and each
comment. Comments often change what is asked.

Follow each link in the ticket: a Figma frame, a doc, a thread. Save the URLs,
since the PR MUST link them.

- **Clear ask** it MUST be clear before the first edit. If it isn't, ask the
  user one question and wait.
- **Too big** a ticket that needs a redesign or covers several features SHOULD
  stop at this point. Suggest a split and wait.

## 2. Read the repo rules

The repo rules MUST beat this skill. Read whichever exist:

- `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`, `.github/copilot-instructions.md`.
- `git log --oneline -15`, for how commit messages look and the ticket prefix.
- `git branch -r --sort=-committerdate | head -15`, for how branches are named.
- The commands that run the checks, in `package.json`, a `Makefile` or the CI
  config.

## 3. Worktree

The work MUST take place in a new worktree off the latest default branch,
created with the `git-worktrees` skill. The user's checkout stays untouched,
uncommitted files too.

- **Branch name** it MUST hold the ticket key, shaped like the repo's other
  branches. No pattern to follow? Use `proj-123-short-slug`.
- **Where to run** from now on each command MUST run inside the worktree.
- **`gh`** each call MUST start with `GH_PAGER=cat`, since a pager would hang it.

## 4. Plan

Before planning, read the code the ticket reaches. Find the module that owns
the behaviour, the code that calls it and its tests.

Write the plan with the `specs` skill: a new spec for a new feature, or an
entry with the ticket key in the feature's spec. A small bug fix needs none.
Commit it first, and then begin with no question.

## 5. Write the change

### Low blast radius

- **Scope** the change MUST do the ticket's ask and stop there. No renames, no
  reformatting, no fixes to code next door.
- **Shared parts** a public API, a shared config, a schema or a dependency
  MUST NOT change unless the ticket requires it. If it does, the plan says so.
- **Packages** a new one SHOULD NOT be added. The repo or the language mostly
  covers the need already.
- **Less code** deleting SHOULD win over adding. Look for code the change makes
  removable, and for a helper the repo already has.
- **Broken elsewhere** anything broken outside the ticket stays untouched and
  goes in the final report.

### Clean code, split into modules

- **One job per module** code with its own job SHOULD get its own file instead
  of swelling a file built for something else.
- **Match the neighbours** new code MUST copy the folder layout, naming, error
  handling and test placement around it.
- **Functions** each SHOULD do one thing, named for what it does.
- **No leftovers** dead code, commented-out code and a `TODO` MUST NOT be added.
- **Comments** a code comment obeys the `writing-style` rules for comments.

### Tests

The behaviour the ticket changes SHOULD get a test, in the style of the repo's
tests beside it. No tests for that area in the repo? The report says so, and no
test setup gets built.

### Docs

Every doc the change makes stale MUST be updated in the same PR: `README.md`,
`docs/architecture.md` and its diagrams, `docs/user-flows.md`,
`docs/features.md`. Any of them missing gets created. The docs are the only
thing outside the ticket that the change touches.

`docs/features.md` holds every feature of the app under its own heading: what
it does for the person, where they find it, its limits. A ticket that adds,
changes or removes a feature MUST update that entry.

## 6. Commit

Commits SHOULD stay separate, one for each step a reviewer can read alone:

- the spec or its new entry in `specs/`,
- a new module and its tests,
- hooking it into the caller,
- deleting the code it replaces,
- the docs.

After each commit the repo SHOULD still build and pass its checks. Two steps
that build only as a pair share one commit.

- **Message** it MUST follow the repo convention and carry the ticket key as
  the log does. Without a convention, write `PROJ-123: <imperative line>`.
- **Staging** add only this step's files with `git add <files>`. `git add -A`
  and `git add .` MUST NOT be used.
- **Hooks** they MUST run. `--no-verify` and `--amend` MUST NOT be used.

```text
PROJ-123: add the plan for the 25 MB photo limit
PROJ-123: add the upload size check
PROJ-123: reject photos over 25 MB in the upload form
PROJ-123: drop the old 5 MB check
PROJ-123: document the photo limit in the upload flow
```

Unless the `writing-style` skill is already in context, load it before the
first message.

## 7. Check

Before the PR, run the repo's checks over the change: typecheck, lint, the
tests of the modules touched. Each failing check MUST be fixed before the PR.
While the branch is unpushed, the fix joins the commit of its step. After a
push, it goes in a new commit.

A check that is already red on the default branch SHOULD be named in the report
and left as it is.

## 8. Open the PR

Load the `create-pr` skill and run it in create mode. As that skill says, the
ticket key opens the body.

## 9. Move the ticket to In Review

Through the Atlassian MCP server, list the transitions the ticket allows right
now. With `acli`, give the target status by name:

```bash
acli jira workitem transition --key PROJ-123 --status "In Review"
```

The target is the project's review status: "In Review", "Code Review",
"Code complete" or something near it. Choose it by name from the list.

- **Not offered** from the current status? Move it to "In Progress", then try
  again.
- **Still not offered** stop, and report the current status with the
  transitions the ticket allows.
- **Other fields** none of them SHOULD change.

## 10. Report back

1. The PR link and title.
2. The ticket key and the status it now has.
3. The worktree path.
4. The commits, a line each.
5. Whatever you noticed and left alone, a line each.

## Guardrails

- **History** a force push, a rebase or an amend MUST NOT happen.
- **Default branch** a push to it MUST NOT happen. Stop and tell the user.
- **Other files** files outside the change MUST stay untouched, staged or not.
- **Ticket timing** the ticket MUST NOT move until the PR is open.
- **Worktree** it stays while the PR waits on review. After the merge, the
  `git-worktrees` skill removes it: the folder, and the branch local and remote.
