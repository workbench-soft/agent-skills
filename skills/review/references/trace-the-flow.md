# Tracing the flow, mapping it as you go

For every suspicious line, answer this: what does a person do in the product
that makes the line run? Usually the diff and the files already open answer it,
and a single step up to the caller covers the rest. Still unclear after that
step? Say so in the finding and go on. A path MUST NOT be made up, and callers
MUST NOT be followed past the first relevant one. Library code and other repos
SHOULD stay shut, except for the last resort in
[what-to-look-for.md](what-to-look-for.md).

Build the map while reading: what the person does, which changed file runs
next, what it does to the data, and what that changes on screen. That map is
part 2 of the answer.
