# Step by step

`Step by step` MUST let a reader redo the work by hand from the PR body
alone. It MUST appear when an agent wrote the change, and it MUST sit outside
the 30 line cap.

## What goes in

The list MUST be numbered, one step per line, in the order the agent did the
work. The number MUST carry the time: "after step 3" is the clock here.

- **Repo** each step MUST name where it ran, whenever the repo changes from
  the step before: "In `workbench-soft/ci`:".
- **Page or repo read** a step MUST give the full URL. A file in another repo
  SHOULD link to it at the commit read, so the link still shows that code.
- **Pattern** a file copied as a template MUST be named with its path or link,
  and what the step took from it.
- **Command** a step MUST hold the exact line in backticks, with real
  arguments, and the folder it ran in when that differs from the repo root.
- **Saved** a file written or changed MUST be named with its path and what
  changed in it, in a few words.

The agent MUST also log:

- **Failures** a command that failed MUST stay in the list, with the error in
  a few words and the step that fixed it.
- **Waits** a wait SHOULD be named with its length: "waited for CI, 8 min".
- **Git and gh** each commit MUST give its short SHA. The push, the PR and the
  merge MUST each get a step.
- **Secrets** a value MUST NOT appear. A command that takes a token MUST show
  the `bws run` form or the name of the variable.

## How much detail

- **Group** reads that settled one question SHOULD form one step: "read
  `src/upload/*.ts` to find where the 5 MB cap is set".
- **Skip** checks such as `git status` and `ls` SHOULD stay out unless their
  output changed what the agent did next.
- **Size** the list SHOULD end at 25 steps. A longer run SHOULD group its
  steps by phase under bold labels.
- **True** each step MUST come from the agent's own session. A step it can't
  reconstruct MUST NOT be invented.

## Draft PR opened early

`ship` opens the draft PR right after the spec commit. The agent MUST then
update the list with `gh pr edit --body-file` before `gh pr ready`, so the
merged body holds each step up to the merge.

The section SHOULD read like this:

```markdown
## Step by step

1. Read [`acme/api` upload.ts](https://github.com/acme/api/blob/4f2a1c9/src/upload.ts) to find the 25 MB limit.
2. In `acme/web`: copied the error layout of `src/ui/QuotaError.tsx` into `src/ui/SizeError.tsx`.
3. Ran `pnpm test upload`: 2 tests failed on the old 5 MB text. Fixed the text in `src/i18n/en.json`.
4. Ran `pnpm test upload` again: green. Committed `a1b2c3d`, pushed, opened the PR.
```
