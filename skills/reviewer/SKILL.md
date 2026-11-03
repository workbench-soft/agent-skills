---
name: reviewer
description: 'The reviewer core that the review and app-audit skills load at their lens step. Use when one of them sends you here, or on "run the reviewer lenses", "review by aspects", "запусти ревьюера по аспектам". It picks the lenses for a diff or a whole repo, loads an installed or downloaded skill for a domain lens such as legal or SEO, starts one subagent per lens on the strongest model, and hands back proven findings with the file, the line, the proof and the fix. Its lenses include PR size and free maintained libraries over hand-written code.'
---

# Reviewer core

`review` and `app-audit` MUST run their lenses through this file. The caller
keeps its own report and its own fixes. The lenses, the briefs, the model and
the proof rules MUST come from here.

The caller MUST set the mode:

| Mode | Caller      | Scope                          | Lens agents                                 |
| ---- | ----------- | ------------------------------ | ------------------------------------------- |
| read | `review`    | the diff and the code it calls | read only, they return findings             |
| fix  | `app-audit` | the whole repo                 | fix the safe findings in their own worktree |

## 1. Take the inputs

The caller MUST hand over these before step 2:

- **Scope** it MUST name the base and head of the diff, or the repo path.
- **Project card** what the app does, the stack, the check commands and the
  repo rules already read. It SHOULD stay within 15 lines.
- **Skip list** it MUST hold what a thread, a review or a failing check already raised, or
  the Leave items of the last audit.
- **Focus** it MUST name the lenses the user picked, if any.

## 2. Pick the lenses

Each lens MUST run when its row says so. The checklists sit in
[references/lenses.md](references/lenses.md):

| Lens                                | Read mode runs when                          | Fix mode runs when                 |
| ----------------------------------- | -------------------------------------------- | ---------------------------------- |
| Bugs and edge cases                 | always                                       | always                             |
| Security, privacy and licences      | always                                       | always                             |
| Architecture and fit                | always                                       | always                             |
| Simplicity, duplication and tests   | the diff has code                            | always                             |
| Libraries over hand-written code    | the diff adds code                           | always                             |
| PR size                             | always                                       | on the audit branch, before the PR |
| Dependencies, tooling and CI        | a manifest, a lockfile or a workflow changes | always                             |
| Performance and cost                | the diff has code that runs                  | the repo has code that runs        |
| State and failure                   | it writes a file, a table or a lock          | same, anywhere in the repo         |
| UX, accessibility and copy          | it touches what a person sees                | a person uses a screen of it       |
| Reliability, offline and monitoring | network calls, jobs or a data pipeline       | same                               |
| Platform and store                  | native code, a manifest or a store listing   | a mobile or desktop app            |
| Agent instructions                  | a file an agent takes as orders              | the repo holds such files          |
| Domain lens: legal, SEO and others  | the change touches that domain               | the repo touches that domain       |

- **Focus** when the user named lenses, only those MUST run, with Bugs added.
- **Small scope** under 300 changed lines, or a repo under 2,000 lines of
  code, lenses MAY run two to a subagent.
- **Skipped** each lens left out MUST get one line with the reason.
- **PR size** the main agent MUST run it itself with
  [references/pr-size.md](references/pr-size.md), since it only counts.
- **Libraries** the lens MUST follow
  [references/libraries.md](references/libraries.md).

## 3. Load a skill for each domain lens

A domain lens covers ground the checklists lack: law and privacy policy,
search, ads, payments, a game engine. The agent MUST read
[references/outside-skills.md](references/outside-skills.md) and find one
skill per domain lens. An installed skill MUST win over a downloaded one.

## 4. Pick the model

- **User named one** every lens agent MUST run on it.
- **Default** every lens agent MUST run on the most capable model the subagent
  tool lists, since a weak model misses the bugs that matter. In Claude Code
  that is `model: "opus"` on the Agent tool, or a stronger option the tool
  lists.
- **Security lens** it SHOULD run on a security review agent type when the
  tool offers one that can do the mode's work.
- **Same model for all** the agent SHOULD NOT drop a lens to a cheaper model
  to save tokens. A smaller scope SHOULD pair lenses instead.

## 5. Start the lens agents

Before the first brief, the agent MUST read
[references/brief.md](references/brief.md).

- **All at once** the agent MUST start one subagent per lens in a single
  message, in the background.
- **Read mode** the lens agents MAY share the review checkout, since they
  only read.
- **Fix mode** each lens agent MUST work in its own worktree, made by the
  caller.
- **No subagent tool** the agent MUST run the lenses itself in turn, each a
  fresh pass with its own brief, and the answer MUST say so.
- **Meanwhile** the main agent MUST read the code itself: the diff and its
  callers, or the entry points and the five largest files. Step 6 needs it.

## 6. Check each finding as it lands

A report MUST be checked the moment it arrives, while other lenses still run.

- **Open the spot** the agent MUST go to the file and line. A claim the code
  fails to back MUST be dropped.
- **Knock it down** the agent MUST take one look for why it might be wrong: a
  guard in the caller, a type, a test, a config. Knocked down, it goes.
  Unsettled, it stays marked as unproven.
- **Twice** when two lenses flag the same spot, the one with the stronger
  proof MUST stay.
- **Skip list** a finding already raised MUST be dropped.
- **Shape** each finding MUST carry its lens, the file and line, what goes
  wrong for a person, the proof, the cost and the fix.

## 7. Hand back to the caller

The agent MUST return to the caller:

- **Findings** they MUST come sorted by what the user stands to lose: wrong or lost data,
  security, old installs and other readers of a format, what a person sees,
  speed and cost, tidy code.
- **Fine** it MUST give one line per area a lens checked and found fine.
- **Skipped** it MUST name the lenses left out and why.
- **Outside skills** it MUST name each skill loaded, with its source link and commit or
  version.
