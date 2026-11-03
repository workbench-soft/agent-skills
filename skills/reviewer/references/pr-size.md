# PR size

A reviewer catches less as a diff grows, and a big PR waits longer and
conflicts more. The main agent MUST check that each PR is small and stands on
its own. A limit in the repo rules MUST win over the numbers below.

## Count

The agent MUST count the changed lines without the files a person skips:

```bash
git diff --shortstat -M "$base"...HEAD -- . ':!*lock*' ':!**/*.snap' ':!**/generated/**' ':!**/vendor/**'
git diff --name-only -M "$base"...HEAD | wc -l
```

The limits MUST read like this:

| Changed lines, files    | Verdict                                   |
| ----------------------- | ----------------------------------------- |
| up to 400, 15 files     | fine                                      |
| 401 to 1,000            | a finding: name the split that would help |
| over 1,000, or 30 files | a finding to split, with the plan below   |

- **Moves and renames** a pure move MUST count as zero, which `-M` does.
- **Generated code** a file a command wrote MUST count as zero when the PR
  names the command.

## Self-contained

Whatever the size, each item below MUST hold. A break of one MUST be a
finding:

- **One purpose** the title MUST say what the PR does in one sentence with no
  "and". A refactor, a format change or a rename mixed with new behaviour
  MUST go in its own PR.
- **Green alone** the PR MUST build and pass its tests on its own, without a
  PR above it.
- **Complete** a half feature a person can reach MUST sit behind a flag, or
  wait for the rest.
- **Tests with code** the tests for a change MUST ship in the same PR.
- **Order** a migration MUST land before or with the code that needs it.

## The split plan

A finding to split MUST list the PRs in merge order, a line each: the title,
its files and what it needs from the PR before it. The first PR SHOULD hold the
part that is safe to merge today, such as the refactor or the migration.

In fix mode the audit branch MUST pass these limits too. Past the top row,
`app-audit` MUST open one PR per group of lenses, each within the limits.
