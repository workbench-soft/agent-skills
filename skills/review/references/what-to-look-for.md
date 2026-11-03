# Running the lenses

The lenses, their checklists, the model and the proof rules MUST come from the
`reviewer` skill. This file MUST only set what `review` hands it and how the
findings come back.

## Skip what is already said

On a PR, the agent MUST read the open threads and the checks once, before the
lenses start:

```sh
GH_PAGER=cat gh api repos/OWNER/REPO/pulls/<number>/comments \
  --jq '.[] | "\(.path):\(.line) \(.body[0:80])"'
GH_PAGER=cat gh pr view <number> --json reviews,comments,statusCheckRollup
```

- **Raised by someone else** a finding in a thread or a review MUST go on the
  Skip list.
- **Caught by a check** a failing lint, typecheck or test MUST go on the Skip
  list. The summary MAY name the failing check in one line.
- **Logs** the names and states of the checks SHOULD be enough.

## Hand over

The agent MUST give the core read mode, the base and head, the Skip list, a
project card from the repo rules of step 3, and the stack of step 2. A PR
lower in the stack MUST be the base, so no lens flags its code.

## Sort the findings into rounds

Once the core hands back, each finding MUST go to the round of its lens:

| Round                        | Lenses                                                                 |
| ---------------------------- | ---------------------------------------------------------------------- |
| The first pass, parts 1 to 4 | bugs, simplicity, libraries, PR size, dependencies                     |
| The second round             | architecture and fit                                                   |
| The focused rounds           | security, speed, state, accessibility, agent instructions, the domains |

- **Unproven** a finding the core kept as unproven MUST say so in its heading.
- **Deep dive** the digging past one look SHOULD wait for the findings the
  user picks.
- **Clean** a changed file with no finding MUST go in the single "Clean:" line
  under the findings table.
- **Style** MUST NOT be flagged unless the repo asks for it in writing.
