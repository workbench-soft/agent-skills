# Already written somewhere

The agent MUST read this on every review, at the "look for what matters" step.
It MUST run even when the code is correct line by line.

A new helper, parser, formatter, date maths, deep clone, sort, debounce, retry
or validation MUST get these checks before it is accepted:

- The agent MUST grep the repo for what it does and for the names it would
  likely carry, the shared packages folder and any internal utils package
  included.
- The agent MUST open `package.json` and the lockfile. The repo MAY already
  depend on a library for this, paid for and in use elsewhere.
- The agent MUST look at the platform: `Intl`, `structuredClone`, `URL`,
  `URLSearchParams`, `AbortController`, `Object.groupBy`, `toSorted`. It MUST
  keep to the repo's baseline rule.

The finding MUST point at the exact replacement: a file and export with a link,
or a package and function. "Probably something in lodash" falls short of a
finding. It MUST give the lines that go away, the copies the repo drops, and
the risk of a copy: the two drift apart, and a bug fixed in one lives on in the
other.

A dependency the repo doesn't have yet MUST stay a question: the agent MUST
give its weight and leave the call to the author. When the duplicate is
simpler than the shared one, or the shared one pulls in something heavy, the
agent SHOULD say so and leave the code as it is.
