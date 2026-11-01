# What to look for

The agent MUST check these, from most to least important:

1. **Breaks for the user** MUST come first: a wrong result, a crash, data loss,
   lost input, a stuck spinner, a case left out (an empty list, no network, a
   slow reply, two clicks in a row). After that, the machine it runs on: a
   missing tool, a GUI app's short `PATH`, Linux, a detached HEAD.
2. **Security** MUST cover anything in the OWASP Top 10. User input left
   unescaped, secrets in code or logs, a missing permission check, an open
   redirect, a query put together by string concatenation.
3. **Money and speed** MUST cover work repeated in a loop, one request per item,
   a file read on each render, a list with no limit kept in memory.
4. **Will bite later** MUST cover a silent `catch`, a `TODO` covering a known
   bug, two sources of truth for one value. A comment, a doc line or the PR
   description that the code now contradicts. A test that can't fail, named by
   the one-character edit it would let pass: `|| exit 0` turned into `&& exit 0`.
5. **Already written somewhere** MUST ask whether the repo or a dependency does
   this already.
6. **Style** MUST NOT be flagged unless the repo asks for it in writing.

For 5, the agent MUST read [already-written.md](already-written.md) at this
step. It MUST run on each review.

Whether the design suits the task MUST NOT be judged here. The second round,
[architecture-pass.md](architecture-pass.md), does that once this report is on
screen.

A file with no problem MUST be named as fine. Leaving it unmentioned reads as
"not reviewed". It MUST go in the single "Clean:" line under the findings table.

## Skip what is already said

On a PR, the agent MUST read the open threads and the checks once, before the
first finding:

```sh
GH_PAGER=cat gh api repos/OWNER/REPO/pulls/<number>/comments \
  --jq '.[] | "\(.path):\(.line) \(.body[0:80])"'
GH_PAGER=cat gh pr view <number> --json reviews,comments,statusCheckRollup
```

- **Raised by someone else**: a finding already in a thread or a review MUST
  NOT go in.
- **Caught by a check**: a finding a failing lint, typecheck or test already
  reports MUST NOT go in. The summary MAY mention the failing check in one line.
- The names and states of the checks are enough. Logs SHOULD stay shut.

## Try to knock each finding down

Before a finding goes in, the agent MUST take one look for the reason it might
be wrong: a guard in the caller, a type that excludes the case, a test that
covers it, a config that switches it off.

- Each finding SHOULD get one look: a file that is already open, or one search.
- A run, a dependency's source or another repo MAY come in only as a last
  resort, when the finding depends on it. One command on stubs, no network, no
  writes to the repo. Its marker MUST be `(ran it)`.
- **Knocked down**: the finding MUST be dropped.
- **Can't tell**: the agent MUST keep it, marked as unproven.

Each finding SHOULD be reasoned from the diff and the files near it, and no
further. A finding the agent can't settle MUST stay in, marked as what it is.
The digging SHOULD happen in the deep dive, on the findings the user picks.
