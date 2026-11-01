# Writing the comment that goes on the line

The agent MUST read this before the first comment of a finding, and hold it in
context until the last comment is done.

A colleague reads the text, so the `writing-style` skill MUST already be in
context. The agent MUST run its final checklist on each block before adding it.

The tone SHOULD be a colleague typing fast, with the report voice left out. The
long version sits above, so this one MUST only raise the doubt and ask.

**The comment MUST be one sentence of doubt and one of ask, under 40 words.**
The agent MUST write it, then cut it in half, since a first draft explains twice
what the author needs.

Each finding MUST get three blocks for the user to pick from: the draft, the
halved draft, and the halved one made assertive. All three MUST make one ask.

The agent SHOULD copy the shape of the house style:

```markdown
will this actually get reported to the caller, or does it stay silent here?
```

```markdown
I think there are no tests for this function. could we cover it?
```

```markdown
this seems to be unused. Can we add tests that would leverage it?
```

```markdown
not sure which readme is meant here
```

```markdown
as far as I understand it won't capture parse( if it exists in a nested file or
maybe if it uses parse<Row>( - can we either add them to search or reflect in
the comment?
```

```markdown
what if the code is export const rows = parse("file.csv")(); - it's already in
the const, but it's the result of the call there, not the parse. Can we rewrite
the message to reflect that? eg "Every `parse()` call must be held by its own
`const`, which is how the importer finds it."
```

```markdown
nit: JSdoc would be better for the property description
```

Each comment MUST follow the parts of that style:

- **The problem in plain words MUST lead, the code follows.**
  Anyone on the team SHOULD get it, whatever their language. A name, a call or
  a snippet enters only where the plain sentence can't locate the spot, and two
  chained to show one calling the other MUST NOT appear.
- **The comment MUST sound unsure, a checked fact included.** The author knows
  the code better. Only the `Assertive:` block drops the hedge for a plain ask.
- **Each hedge phrase MUST belong to one finding.** Openers and closers both
  count, and the versions of one finding MAY reuse it. Out of hedges, ask bare.
- **The comment SHOULD close on a question.** "will this ...?", "could we ...?".
  A blocker names what breaks, still behind a hedge.
- **The claim MUST have edges instead of fog.** "from what I see", "I only
  looked at the resolver". A decision that is the author's goes back as a
  question, and no line teaches them the area they work in each day.
- **A file and line, a link or a screenshot SHOULD stand in for the argument.**
- **`nit: ` MUST lead anything that only tidies the code**: formatting, a name,
  a shorter way to say the same thing. The replacement goes bare.
- **`blocker: ` MUST lead a sure blocker and only that**, the rest get no prefix.
- **The impact paragraph and the evidence MUST stay out.** "so the user loses
  data", counts, tool output and "I ran X over Y" go in the finding.
- **The case MUST be named, the theory left out.** One input or snippet, inline,
  as in `parse<Row>(`, `parse("file.csv")()`. Fenced code stays out.
- **Wording for a message or a string MAY be suggested**, after "eg", in quotes.
- **Loose punctuation MAY stay**: a lowercase start, a hyphen in place of a
  comma, a dropped backtick. Polish makes it read like a machine wrote it.
- The comment MUST drop headings, bold labels, lists, a greeting, a sign off,
  thanks, and the file and line it already sits on.

The agent MAY pick from these hedges, each one once per review:

```markdown
I think / I might be wrong, but / seems like / looks like
from what I see / as far as I understand / if I read this right
unless I'm missing something / correct me if I'm wrong, but
not sure, but / I wonder if / maybe / probably
wdyt? / does that make sense? / or am I missing something?
```

Halving MUST remove, in this order:

- **The mechanism.** The comment MUST point at the spot and let the author read
  how the library or the language gets there.
- **Why it looks fine today.** "it only works because the parent has a height"
  is the agent's own reasoning, and the ask MUST go without it.
- **The second option.** The comment MUST give one fix, since two read as
  thinking aloud.
- **Whatever the finding above already says.** The comment MUST NOT repeat it.

A comment too long, then the same one halved, SHOULD look like this:

```markdown
as far as I understand aspect-auto here doesn't cancel the variant's
group-data-[orientation=vertical]:aspect-square - tailwind-merge only dedupes
classes with the same modifier, and the variant selector wins on specificity.
it looks right only because flex-1 gives the tile a definite height. can we
write group-data-[orientation=vertical]/attachment:aspect-auto, or expose it as
a variant?
```

```markdown
I think aspect-auto doesn't cancel the variant's
group-data-[orientation=vertical]:aspect-square - different modifier, so both
survive. can we match the modifier here?
```

A comment too certain SHOULD soften like this:

```markdown
nit: the message names variant. the caller doesn't set it.
```

```markdown
nit: seems like the caller doesn't set variant - maybe drop it from the message?
```

Under `Assertive:` the same comment MAY read:

```markdown
nit: the caller doesn't set variant. please drop it from the message
```

A comment MUST NOT read like this one:

```markdown
This clears the input before `saveName` answers, so a slow or failed save wipes
the name the person typed and shows them no error. They think it saved. Could
you clear it after the call comes back ok, and leave the text alone on error?
```

It spends three sentences on damage in the author's own code. The agent MUST
cut it down to the doubt and the ask:

```markdown
this clears the input before saveName comes back - if the save fails the typed
name is gone. can we clear it after the call resolves ok?
```
