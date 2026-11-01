# Getting the code onto disk

The agent MUST read this when a branch or a PR is the review target, before
writing any of the review.

## Checking out the branch

The agent SHOULD begin with the diff: `GH_PAGER=cat gh pr diff <number>` or
`git diff`. It answers most findings alone, and fetching it is free.

Checking out the branch MUST wait for a real gap the diff can't fill: a caller,
a type or a config file outside the diff, or a finding that needs a run to
settle. When the open workspace holds the same repository, files on disk SHOULD
win over grepping a diff.

It MUST go in its own worktree, so whatever sits in the user's checkout stays
there:

1. The agent MUST create it through the `git-worktrees` skill. A worktree skill
   of the repo's own MUST take precedence over that one.
2. For a PR, the agent MUST fetch it first:
   `git fetch origin pull/<number>/head:<branch>`.
3. The agent SHOULD install only right before running something in it, as the
   repo's README describes.
4. The agent MUST read, and run when it has to, inside that worktree. The
   user's original checkout MUST stay on its branch, untouched.

With no worktree possible, and only then, the agent MAY switch in place.
`git status --short` MUST print empty. On any output at all, the agent MUST
stop and ask the user what to do with it. Stashing, resetting or checking out on
top of someone's unsaved work MUST NOT happen. Then the agent MAY run
`GH_PAGER=cat gh pr checkout <number>` or `git switch <branch>`.

A worktree created for the review MUST be removed through `git-worktrees` once
the review is posted or handed back. The remote branch MUST be kept. A branch
switched in place MUST stay checked out, and the answer MUST name it.

When the code is in a repository that isn't open here, the agent MUST review
from `GH_PAGER=cat gh pr diff <number>`, say once that only the diff was read,
and mark each finding it couldn't prove.

## Running code

Reading SHOULD decide it: it is quicker and cheaper, and the reader can verify
it without a run. The test suite or a typechecker MUST NOT run to confirm a
finding reading already decided. Code MAY run only when the whole verdict on
one finding depends on a runtime answer that reading can't supply, such as a
compiler's exact error text or how a library treats an odd input. The review
MUST stay within a couple of runs, and no finding SHOULD get a run to itself.
The agent SHOULD run the smallest piece that answers: one function on one
input, one test file, one file through the type checker. A full build, a full
install, a full typecheck or the whole test suite MUST NOT run.

The review MUST stay read only: no commit, no push, no `git add`, no edits to
the code under review unless the user asked for them.
