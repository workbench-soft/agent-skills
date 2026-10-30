# Already written somewhere

You MUST read this on every review, at the "look for what matters" step. It
runs even when the code is correct line by line.

A new helper, parser, formatter, date maths, deep clone, sort, debounce, retry
or validation gets these checks before it is accepted:

- Grep the repo for what it does and for the names it would likely carry. Cover
  the shared packages folder and any internal utils package.
- Open `package.json` and the lockfile. The repo may already depend on a
  library for this, paid for and in use elsewhere.
- Look at the platform: `Intl`, `structuredClone`, `URL`, `URLSearchParams`,
  `AbortController`, `Object.groupBy`, `toSorted`. Keep to the repo's baseline
  rule.

The finding MUST point at the exact replacement: a file and export with a link,
or a package and function. "Probably something in lodash" falls short of a
finding. Give the lines that go away and the copies the repo drops, and the
risk of a copy: the two drift apart, and a bug fixed in one lives on in the
other.

A dependency the repo doesn't have yet MUST stay a question: give its weight
and leave the call to the author. Is the duplicate simpler than the shared one,
or does the shared one pull in something heavy? Say so and leave the code as
it is.
