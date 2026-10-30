# Reviewing a PR inside a stack

You MUST read this on each PR review, before the first finding. A stack is a
chain of PRs where each one is based on the branch of the PR below it.

## Find the stack

```sh
GH_PAGER=cat gh pr view <number> --json baseRefName,headRefName,body
GH_PAGER=cat gh pr list --state open --base <headRefName> \
  --json number,title,headRefName
```

- **Below**: a base that isn't the default branch is the head of the PR below.
- **Above**: each open PR in the list result. Repeat the list from each of their
  heads until it returns empty.
- **Stack tools** like Graphite list the stack in the PR body as well.

Neither a PR below nor one above? The PR stands alone, so skip the rest of this
file.

## Review this PR alone

The diff MUST be against the PR's own base, as `gh pr diff` returns it. Code
added by a PR below belongs to the review of that PR.

## Drop what a PR above fixes

Before it goes in, each finding MUST be checked against the diffs of the PRs
above: `GH_PAGER=cat gh pr diff <above>`.

- **Fixed above**: the finding MUST NOT go in, either as a comment or in the
  table. The summary MAY mention it in one line, linking the PR that fixes it.
- **Fixed in part**: keep the finding, and name the PR that handles the rest.
