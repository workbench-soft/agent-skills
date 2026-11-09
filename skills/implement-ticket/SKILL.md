---
name: implement-ticket
description: 'Use when there is a ticket to do or pick up, in any language: "do PROJ-123", "implement this ticket", "сделай тикет", a Jira link plus "do it". Reads the ticket, writes the plan to specs/, follows the repo checkout rules, makes the smallest clean change, updates the docs, commits each step with the ticket key, and moves the ticket to the matching status.'
---

# Implement a ticket

The agent MUST read the ticket, make the smallest change that meets it, ship
that as a PR, then move the ticket to In Review.

## 1. Read the ticket

The agent MUST take the key, such as `PROJ-123`, from the user's message or
link. Without a key, it MUST ask for one.

It MUST fetch the ticket with its Jira tool, the Atlassian MCP server or
`acli`, such as:

```bash
acli jira workitem view PROJ-123 --fields summary,description,status,comment
```

The agent MUST go through the summary, the description, the acceptance
criteria and each comment. Comments often change what is asked.

It MUST follow each link in the ticket: a Figma frame, a doc, a thread. It
MUST save the URLs, since the PR MUST link them.

- **Clear ask** it MUST be clear before the first edit. If it isn't, the
  agent MUST ask the user one question and wait.
- **Too big** a ticket that needs a redesign or covers several features
  SHOULD stop at this point. The agent SHOULD suggest a split and wait.

## 2. Read the repo rules

The repo rules MUST beat this skill. The agent MUST read whichever exist:

- **Agent files** it MUST read `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`,
  `.github/copilot-instructions.md`.
- **Commits** it MUST run `git log --oneline -15`, for how commit messages
  look and the ticket prefix.
- **Branches** it MUST run `git branch -r --sort=-committerdate | head -15`,
  for how branches are named.
- **Checks** it MUST find the commands that run the checks, in
  `package.json`, a `Makefile` or the CI config.

## 3. Choose the checkout

The agent MUST follow the repo's checkout and shipping rules. When those rules
allow default branch work and the checkout is clean, with no other session on
the same files, the agent MAY work there. When another session holds those
files, the agent MUST wait and check again. A dirty checkout MUST use a new worktree. A protected default
branch MUST use a worktree through `git-worktrees`.

- **Branch name** a worktree branch MUST hold the ticket key and follow the
  repo's pattern. With no pattern, it SHOULD be `proj-123-short-slug`.
- **Where to run** each command MUST run in the chosen checkout.
- **`gh`** each `gh` call MUST start with `GH_PAGER=cat`.

## 4. Plan

Before planning, the agent MUST read the code the ticket reaches. It MUST
find the module that owns the behaviour, the code that calls it and its
tests.

The agent MUST write the plan with the `specs` skill: a new spec for a new
feature, or an entry with the ticket key in the feature's spec. A small bug
fix MAY skip it. The agent MUST commit it first, and then begin with no
question.

## 5. Write the change

### Low blast radius

- **Scope** the change MUST do the ticket's ask and stop there. It MUST NOT
  rename, reformat or fix code next door.
- **Shared parts** a public API, a shared config, a schema or a dependency
  MUST NOT change unless the ticket requires it. If it does, the plan MUST
  say so.
- **Packages** a new one SHOULD NOT be added. The repo or the language mostly
  covers the need already.
- **Less code** deleting SHOULD win over adding. The agent SHOULD look for
  code the change makes removable, and for a helper the repo already has.
- **Broken elsewhere** anything broken outside the ticket MUST stay untouched
  and go in the final report.

### Clean code, split into modules

- **One job per module** code with its own job SHOULD get its own file
  instead of swelling a file built for something else.
- **Match the neighbours** new code MUST copy the folder layout, naming,
  error handling and test placement around it.
- **Functions** each SHOULD do one thing, named for what it does.
- **No leftovers** dead code, commented-out code and a `TODO` MUST NOT be
  added.
- **Comments** a code comment MUST obey the `writing-style` rules for
  comments.

### Tests

The behaviour the ticket changes SHOULD get a test, in the style of the
repo's tests beside it. When the repo has no tests for that area, the report
MUST say so, and the agent MUST NOT build a test setup.

### Docs

Every doc the change makes stale MUST be updated in the same change:
`README.md`, `docs/architecture.md` and its diagrams, `docs/user-flows.md`,
`docs/features.md`. Any of them missing MUST be created. The docs MUST be the
only thing outside the ticket that the change touches.

`docs/features.md` MUST hold every feature of the app under its own heading:
what it does for the person, where they find it, its limits. A ticket that
adds, changes or removes a feature MUST update that entry.

## 6. Commit

Commits SHOULD stay separate, one for each step a reviewer can read alone:

- **Spec** the spec or its new entry in `specs/` SHOULD get its own commit.
- **Module** a new module and its tests SHOULD get one.
- **Hook** hooking it into the caller SHOULD get one.
- **Delete** deleting the code it replaces SHOULD get one.
- **Docs** the docs SHOULD get one.

After each commit the repo SHOULD still build and pass its checks. Two steps
that build only as a pair MUST share one commit.

- **Message** it MUST follow the repo convention and carry the ticket key as
  the log does. Without a convention, it SHOULD read
  `PROJ-123: <imperative line>`.
- **Staging** the agent MUST add only this step's files with
  `git add <files>`. `git add -A` and `git add .` MUST NOT be used.
- **Hooks** they MUST run. `--no-verify` and `--amend` MUST NOT be used.

A ticket's log SHOULD read like this:

```text
PROJ-123: add the plan for the 25 MB photo limit
PROJ-123: add the upload size check
PROJ-123: reject photos over 25 MB in the upload form
PROJ-123: drop the old 5 MB check
PROJ-123: document the photo limit in the upload flow
```

Unless the `writing-style` skill is already in context, the agent MUST load
it before the first message.

## 7. Check

Before shipping, the agent MUST run the repo's checks over the change:
typecheck, lint and tests for the modules touched. Each failing check MUST be
fixed before shipping. An unpublished fix MUST join its step's commit. After
a push, the fix MUST go in a new commit.

A check that is already red on the default branch SHOULD be named in the
report and left as it is.

## 8. Ship the change

The agent MUST follow the repo's shipping rules. When those rules choose the
PR path, the agent MUST load `create-pr` and put the ticket key first in the
body. On a permitted direct default branch push, the agent MUST commit and
push without opening a PR.

## 9. Move the ticket to its shipped status

Through the Atlassian MCP server, the agent MUST list the transitions the
ticket allows right now. The agent MUST choose a status that matches how the
change shipped: a review status after opening a PR, or a completion status
after a direct push. With `acli`, it MUST give the target status by name:

```bash
acli jira workitem transition --key PROJ-123 --status "In Review"
```

The target MUST be the project's review status: "In Review", "Code Review",
"Code complete" or something near it. The agent MUST choose it by name from
the list.

- **Not offered** when the current status doesn't offer it, the agent MUST
  move the ticket to "In Progress", then try again.
- **Still not offered** the agent MUST stop, and report the current status
  with the transitions the ticket allows.
- **Other fields** none of them SHOULD change.

## 10. Report back

1. The report MUST give the PR link and title, or the direct commit hash.
2. It MUST give the ticket key and the status it now has.
3. It MUST give the worktree path when it used one.
4. It MUST list the commits, a line each.
5. It MUST list whatever the agent noticed and left alone, a line each.

## Guardrails

- **History** a force push or amend MUST NOT happen. A rebase MUST follow
  repo rules and MUST only move unpublished commits.
- **Default branch** a push to it MUST follow the repo's shipping rules.
- **Other files** files outside the change MUST stay untouched, staged or
  not.
- **Ticket timing** the ticket MUST NOT move until the direct push or PR is
  complete.
- **Worktree** it MUST stay while the PR waits on review. After the merge,
  `git-worktrees` MUST remove its folder and local and remote branches.
