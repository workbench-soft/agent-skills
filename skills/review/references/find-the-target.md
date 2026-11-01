# Finding what to review

With an obvious target the agent MUST NOT ask. It MUST take the first that
applies:

1. The user named a file, a PR number or a branch: the agent MUST review that.
2. Failing that, it MUST review the uncommitted changes: `git status --short`,
   then `git diff` and `git diff --staged`.
3. Failing both, it MUST review the branch: `git diff "$base"...HEAD`.

`$base` is the branch this one started from. Nearly every repo names its remote
`origin`. A fork or a mirror uses another name, so the agent MUST read it:

```sh
remote=$(git remote | grep -qx origin && echo origin || git remote | head -1)
base=$remote/$(GH_PAGER=cat gh repo view --json defaultBranchRef \
  -q .defaultBranchRef.name)
```

A PR MUST take `GH_PAGER=cat gh pr diff <number>`. The agent MAY ask the user
only when all of that comes up empty.

When the target is a branch or a PR, the agent MUST read
[getting-the-code.md](getting-the-code.md) at this point, for the worktree
steps, the user's own checkout and when code can run. Uncommitted changes in the
open repo MAY skip all of it.
