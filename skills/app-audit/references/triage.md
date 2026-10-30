# Sorting findings into Fix and Leave

A lens agent sorts its own findings with these rules. The main agent checks
each commit and each Leave reason against them.

## Check each finding first

- **Open the spot** go to the file and line the finding gives. A claim the code
  fails to back MUST be dropped.
- **Measure again** when the decision rests on a number, it SHOULD be measured
  a second time.
- **One spot, one finding** two lenses that fix the same spot keep the commit
  picked first. The other one is skipped.
- **Already fine** an item any lens marked "measured and fine" drops out and
  gets no fix.

## Fix

Fix takes a finding only when every one of these is true:

- **Proven** a code line, an output or a number stands behind it.
- **Felt** the repo or a person gains: wrong data, a crash, lost input, a slow
  start, battery, a security hole, CI that ships broken code.
- **Checkable here** the checks, a build and the running app can prove the fix,
  or CI can for a part without a toolchain here.
- **Small** effort S or M, and a revert can undo it.

## Leave

Leave takes a finding as soon as one of these is true:

- **Migration** a framework, a UI or map library, a database, a build tool or
  a language.
- **Breaking format** a change to a file, an API or a schema read by old
  installs or other services. Adding a version number first counts as a Fix.
- **Product call** a feature added or removed, a change to what the app warns
  about or charges for, a new look such as dark mode.
- **Out of reach** money, keys, DNS, store listings, accounts or production
  data.
- **Too big** effort L, or past roughly ten files.

Each Leave finding MUST state its reason in a few words, for the PR, the report
and TODO.md.

## When lenses disagree

Choose by what the user stands to lose, in this order:

1. Wrong or lost data, and safety: a wrong speed limit, a deleted trip.
2. Security and privacy.
3. Old installs and other readers of a format.
4. What a person sees and does.
5. Speed, battery and cost.
6. Tidy code.

## Fix in what order

- **First** bugs that lose or corrupt data.
- **Next** format versioning, ahead of any change that depends on it.
- **Then** everything else, by value, highest first.
- **Last** tooling and CI, so their hooks don't slow the work above.
