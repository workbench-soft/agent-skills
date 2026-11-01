# Sorting findings into Fix and Leave

A lens agent MUST sort its own findings with these rules. The main agent MUST
check each commit and each Leave reason against them.

## Check each finding first

- **Open the spot** the agent MUST go to the file and line the finding gives. A
  claim the code fails to back MUST be dropped.
- **Measure again** when the decision rests on a number, it SHOULD be measured
  a second time.
- **One spot, one finding** when two lenses fix the same spot, the commit
  picked first MUST stay. The other one MUST be skipped.
- **Already fine** an item any lens marked "measured and fine" MUST drop out
  and get no fix.

## Fix

Fix MUST take a finding only when every one of these is true:

- **Proven** a code line, an output or a number MUST stand behind it.
- **Felt** the repo or a person MUST gain: wrong data, a crash, lost input, a
  slow start, battery, a security hole, CI that ships broken code.
- **Checkable here** the checks, a build and the running app MUST prove the
  fix, or CI MUST for a part without a toolchain here.
- **Small** it MUST be effort S or M, and a revert MUST undo it.

## Leave

Leave MUST take a finding as soon as one of these is true:

- **Migration** the finding MUST be left when it moves a framework, a UI or
  map library, a database, a build tool or a language.
- **Breaking format** a change to a file, an API or a schema read by old
  installs or other services MUST be left. Adding a version number first
  counts as a Fix.
- **Product call** a feature added or removed, a change to what the app warns
  about or charges for, or a new look such as dark mode MUST be left.
- **Out of reach** anything about money, keys, DNS, store listings, accounts or
  production data MUST be left.
- **Too big** effort L, or past roughly ten files, MUST be left.

Each Leave finding MUST state its reason in a few words, for the PR, the report
and TODO.md.

## When lenses disagree

The main agent MUST choose by what the user stands to lose, in this order:

1. Wrong or lost data, and safety, MUST come first: a wrong speed limit, a
   deleted trip.
2. Security and privacy MUST come second.
3. Old installs and other readers of a format MUST come third.
4. What a person sees and does MUST come fourth.
5. Speed, battery and cost MUST come fifth.
6. Tidy code MUST come last.

## Fix in what order

- **First** bugs that lose or corrupt data MUST be fixed first.
- **Next** format versioning MUST come next, ahead of any change that depends
  on it.
- **Then** everything else SHOULD follow by value, highest first.
- **Last** tooling and CI SHOULD come last, so their hooks don't slow the work
  above.
