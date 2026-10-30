# Getting the code onto disk

You MUST read this when a branch or a PR is the review target, before writing
any of the review.

## Checking out the branch

Begin with the diff: `GH_PAGER=cat gh pr diff <number>` or `git diff`. It
answers most findings alone, and fetching it is free.

Checking out the branch MUST wait for a real gap the diff can't fill: a caller,
a type or a config file outside the diff, or a finding that needs a run to
settle. The open workspace holds the same repository as the code under review,
and for that, files on disk beat grepping a diff.

It MUST go in its own worktree, so whatever sits in the user's checkout stays
there:

1. Create it through the `git-worktrees` skill. A worktree skill of the repo's
   own takes precedence over that one.
2. For a PR, fetch it first: `git fetch origin pull/<number>/head:<branch>`.
3. Install only right before running something in it, as the repo's README
   describes.
4. Read, and run if you have to, inside that worktree. The user's original
   checkout MUST stay on its branch, untouched.

No worktree possible? Then and only then MAY you switch in place.
`git status --short` MUST print empty. On any output at all, stop and ask the
user what to do with it. Stashing, resetting or checking out on top of someone's
unsaved work MUST NOT happen. Then run
`GH_PAGER=cat gh pr checkout <number>` or `git switch <branch>`.

A worktree created for the review MUST be removed through `git-worktrees` once
the review is posted or handed back. The remote branch is kept. A branch
switched in place stays checked out, and the answer names it.

Is the code in a repository that isn't open here? Review from
`GH_PAGER=cat gh pr diff <number>`, say once that only the diff was read, and
mark each finding you couldn't prove.

## Running code

Reading SHOULD decide it: it is quicker and cheaper, and the reader can verify
it without a run. The test suite or a typechecker MUST NOT run to confirm a
finding reading already decided. Run code only when the whole verdict on one
finding depends on a runtime answer that reading can't supply. The usual cases
are a compiler's exact error text or how a library treats an odd input. The
limit is a couple of runs for the whole review, and no finding gets a run to
itself. Run the smallest piece that answers: one function on one input, one
test file, one file through the type checker. A full build, a full install, a
full typecheck or the whole test suite MUST NOT run.

The review MUST stay read only: no commit, no push, no `git add`, no edits to
the code under review unless the user asked for them.
