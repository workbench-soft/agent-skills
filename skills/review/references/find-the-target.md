# Finding what to review

With an obvious target you MUST NOT ask. Take the first that applies:

1. The user named a file, a PR number or a branch. Review that.
2. Uncommitted changes: `git status --short`, then `git diff` and
   `git diff --staged`.
3. Failing both, the branch: `git diff "$base"...HEAD`.

`$base` is the branch this one started from. Nearly every repo names its remote
`origin`. A fork or a mirror uses another name, so read it:

```sh
remote=$(git remote | grep -qx origin && echo origin || git remote | head -1)
base=$remote/$(GH_PAGER=cat gh repo view --json defaultBranchRef \
  -q .defaultBranchRef.name)
```

A PR takes `GH_PAGER=cat gh pr diff <number>`. Asking the user MAY happen only
when all of that comes up empty.

Is the target a branch or a PR? You MUST read
[getting-the-code.md](getting-the-code.md) at this point, for the worktree
steps, the user's own checkout and when code may run. Uncommitted changes in the
open repo skip all of it.
