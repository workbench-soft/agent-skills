# Writing the comment that goes on the line

You MUST read this before writing the first comment of a finding, and hold it in
context until the last comment is done.

A colleague will read the text, so the `writing-style` skill MUST already be in
context. Run its final checklist on each block before adding it.

The tone is a colleague typing fast, with the report voice left out. The long
version sits above in the report language. This one raises the doubt and asks.

**The comment MUST be one sentence of doubt and one of ask, under 40 words.**
Write it, then cut it in half. A first draft always explains twice what the
author needs.

Each finding MUST get three blocks for the user to pick from: the draft, the
halved draft, and the halved one made assertive. All three make the same ask.

The house style, copy its shape:

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

The parts of that style:

- **The problem in plain words MUST lead, the code follows.** Describe what goes
  wrong so anyone on the team gets it, whatever their language. A name, a call or
  a snippet enters only where the plain sentence can't locate the spot, and two
  chained to show one calling the other MUST NOT appear.
- **The comment MUST sound unsure, a checked fact included.** The author knows
  the code better, and a flat claim lands as a verdict. Only the `Assertive:`
  block differs: no hedge, the ask as a plain request.
- **Each hedge phrase MUST belong to one finding.** Openers and closers both
  count, and the versions of one finding MAY reuse it. Out of hedges? Ask bare.
- **The comment SHOULD close on a question.** "will this ...?", "could we ...?".
  A blocker names what breaks, still behind a hedge.
- **The claim MUST have edges instead of fog.** "from what I see", "I only
  looked at the resolver". A decision that is the author's goes back as a
  question, and no line teaches them the area they work in each day.
- **A file and line, a link or a screenshot SHOULD stand in for the argument.**
  Each of them beats a paragraph of reasoning.
- **`nit: ` MUST lead anything that only tidies the code**: formatting, a name,
  a shorter way to say the same thing. Give the replacement bare.
- **`blocker: ` MUST lead a sure blocker and only that**, the rest get no prefix.
- **The impact paragraph and the evidence MUST stay out.** "so the user loses
  data", counts, tool output and "I ran X over Y" go in the finding.
- **The case MUST be named, the theory left out.** A real input or snippet
  enters only once a plain sentence can't locate the spot: one input, one
  snippet, inline, `parse<Row>(`, `parse("file.csv")()`. Fenced code stays out
  of the comment.
- **Wording for a message or a string MAY be suggested**, after "eg", in quotes.
- **Loose punctuation is fine**: a lowercase start, a hyphen in place of a
  comma, a dropped backtick. Polish makes it read like a machine wrote it.
- Drop headings, bold labels, lists, a greeting, a sign off and thanks. Drop the
  file name and line number too, the comment already sits on them.

Hedges to choose from, each one once per review:

```markdown
I think / I might be wrong, but / seems like / looks like
from what I see / as far as I understand / if I read this right
unless I'm missing something / correct me if I'm wrong, but
not sure, but / I wonder if / maybe / probably
wdyt? / does that make sense? / or am I missing something?
```

What halving removes, in this order:

- **The mechanism.** How the library or the language gets to this result. Point
  at the spot and let the author read it.
- **Why it looks fine today.** "it only works because the parent has a height"
  is your own reasoning, and the ask goes without it.
- **The second option.** Give one fix. Two read as thinking aloud.
- **Whatever the finding above already says.** The user has read it, and the
  author can answer without it.

Too long, then the same comment halved:

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

Too certain, then the same comment softened:

```markdown
nit: the message names variant. the caller doesn't set it.
```

```markdown
nit: seems like the caller doesn't set variant - maybe drop it from the message?
```

That comment again under `Assertive:`:

```markdown
nit: the caller doesn't set variant. please drop it from the message
```

Bad, and the reason:

```markdown
This clears the input before `saveName` answers, so a slow or failed save wipes
the name the person typed and shows them no error. They think it saved. Could
you clear it after the call comes back ok, and leave the text alone on error?
```

It spends three sentences telling the author about damage in their own code.
Cut it down to the doubt and the ask:

```markdown
this clears the input before saveName comes back - if the save fails the typed
name is gone. can we clear it after the call resolves ok?
```
