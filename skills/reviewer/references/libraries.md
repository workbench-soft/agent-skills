# Libraries over hand-written code

Hand-written code that a library already does MUST be a finding, even when it
is correct line by line. A helper, a parser, a formatter, date maths, a deep
clone, a debounce, a retry, validation or a CLI argument parser MUST get these
checks.

## Where the replacement comes from

The agent MUST look in this order and stop at the first match:

1. **The repo** the agent MUST grep for what the code does and the names it
   would carry, shared packages and internal utils included.
2. **The platform** `Intl`, `structuredClone`, `URL`, `AbortController`,
   `Object.groupBy`, the standard library of the language. The repo's
   baseline MUST still hold.
3. **A dependency already in the manifest** the agent MUST read the manifest
   and the lockfile, since the repo MAY already pay for one.
4. **A new library** it MAY come in only when it passes every check below.

A tool list in the repo rules, such as a `stack` skill, MUST win on which
library does a job.

## A new library MUST pass

- **Free** a licence such as MIT, Apache-2.0, BSD, ISC or MPL-2.0, with no
  paid tier needed for this use. GPL or AGPL MUST fit the repo's own licence.
- **Alive** it MUST have a release within the last 12 months. Its repo MUST
  be live, the package not deprecated, and its issues MUST get answers.
- **Used** it SHOULD have downloads or dependents in the thousands, so others
  find the bugs first.
- **Safe** it MUST have no open high or critical advisory.
- **Earns its size** the bytes it adds to what ships MUST beat the lines it
  removes.

The agent SHOULD check with these, for npm and its twins elsewhere:

```bash
npm view <pkg> version license deprecated time.modified
GH_PAGER=cat gh repo view <owner/repo> --json isArchived,pushedAt,stargazerCount
curl -s https://api.osv.dev/v1/query -d '{"package":{"name":"<pkg>","ecosystem":"npm"}}'
```

## Dead dependencies

A dependency in use that fails "Free", "Alive" or "Safe" MUST be a finding
too. The finding MUST name a live replacement that passes, or the platform API
that makes it unneeded.

## The finding

- **Exact** it MUST name the file and export, or the package and the function:
  `date-fns` `differenceInCalendarDays`. "Something in lodash" falls short.
- **Numbers** it MUST give the lines that go away, the size added, the licence
  and the date of the last release.
- **Risk of the copy** it SHOULD say what drifts: a bug fixed in the library
  lives on in the copy.
- **Keep it** when the hand-written version is simpler or the library pulls in
  something heavy, the agent SHOULD say so and leave the code.
- **Read mode** a new dependency MUST stay a suggestion for the author.
- **Fix mode** the lens MAY add a library that passes every check, when the
  swap is effort S or M and the tests cover the code it replaces.
