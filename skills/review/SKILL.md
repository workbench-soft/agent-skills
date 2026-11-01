---
name: review
description: 'Use only on an explicit request to review a pull request: "review this PR", "code review", "review" plus a PR link or PR number, or the same in another language.'
---

# Review code

A person outside this repository MUST be able to act on every finding. Jargon,
internals and "consider refactoring" MUST NOT appear.

Each step points at the file with its detail. The agent MUST read that file on
reaching the step, before the first line the step writes.

## 1. Set the language and the writing rules

- The report language is the one `LANGUAGE.md` next to this file names, and it
  MUST win over the language of the user's ask. With no such file, the agent
  MUST write English.
- The agent MUST take which part of the answer goes in which language from
  [references/report-language.md](references/report-language.md).
- The agent MUST take how to write each line from
  [references/writing-rules.md](references/writing-rules.md).

The first line of the review MUST wait until all three are read.

## 2. Find what to review

The agent MUST take the file, PR or branch the user named. Failing that, it
SHOULD take the uncommitted changes, and failing those, the branch against its
base. With an obvious target the agent MUST NOT ask. The order, the commands
and the case where it MAY ask sit in
[references/find-the-target.md](references/find-the-target.md).

A PR MUST be checked for a stack around it, so that no finding flags code a PR
above already fixes: [references/stacked-prs.md](references/stacked-prs.md).

## 3. Read the repo rules first

The repo's rules MUST win over the agent's habits, and anything the repo
requires MUST NOT be flagged. Which files to open:
[references/repo-rules.md](references/repo-rules.md).

## 4. Trace the flow, map it as you go

For a suspicious line, the agent MUST find what a person does to make it run,
and what each changed file does along the way. How far to follow it:
[references/trace-the-flow.md](references/trace-the-flow.md).

## 5. Look for what matters

The agent MUST check six things, breakage first and style last, plus the
duplicate check every review runs. After that it MUST run two quick checks:
drop what a thread or a check has already raised, and try to knock down each
finding: [references/what-to-look-for.md](references/what-to-look-for.md).

## 6. Write the report

The report MUST have four parts, in this order, and each has its own file:

1. The agent MUST say what the change is about:
   [references/part-1-summary.md](references/part-1-summary.md).
2. The agent MUST draw the user flow diagram and the code flow diagram, then
   give the order to read the files:
   [references/part-2-map.md](references/part-2-map.md).
3. The agent MUST give the table of findings:
   [references/part-3-table.md](references/part-3-table.md).
4. The agent MUST list every comment with its place first, then the
   explanation of each one:
   [references/part-4-findings.md](references/part-4-findings.md), with
   [references/finding-shape.md](references/finding-shape.md) for the blocks a
   finding is made of.

The rules that cover all four parts, and what MUST NOT be added to them, live in
[references/report-shape.md](references/report-shape.md). The agent MUST read
it before part 1.

## 7. Run the second round: architectural gaps

The four parts MUST go on screen first. Then a further pass over the same
change MUST ask whether the design fits the task at all and what it misses,
before any posting:
[references/architecture-pass.md](references/architecture-pass.md).

## 8. Run the focused rounds

The agent MUST next run one round on security and one on speed. The rounds on
state and failure, accessibility and agent instructions MUST run when the
change touches what they cover. Which rounds run and what each one checks:
[references/focused-passes.md](references/focused-passes.md).

## 9. Offer to post the comments and the verdict

One offer MUST close the last round: to put the comments on the PR, with the
findings of all rounds in one go. A comment MUST reach the PR only after the
user asks. The offer, the question asked before the first call and the `gh`
call for each comment are in
[references/posting-comments.md](references/posting-comments.md).

A verdict the agent chooses MUST go up with the comments: approve when the PR
can merge, request changes for a sure blocker, comments alone otherwise:
[references/verdict.md](references/verdict.md).

## 10. Before you send

The agent MUST read
[references/final-checklist.md](references/final-checklist.md) and run it over
the full answer. Only then MAY the answer go out.
