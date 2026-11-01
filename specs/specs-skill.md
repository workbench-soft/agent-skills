# A skill that asks for specs, one per feature

## What it does for the person

- **Ask** the owner wants specs written per feature. Work on a feature that
  already has a spec adds to that spec, and a bug fix needs none unless it is
  a big one.
- **Now** the instructions file asks for a new dated file for every change,
  bug fixes too. One feature ends up spread over many files, and small fixes
  pay for a plan nobody reads.
- **Gap** the rule lives only in the instructions file, with no steps for
  finding the feature's spec or for a bug fix.

## User flows

None written down yet.

## How it works: modules, files, data

Each entry below names the files it changed.

## Limits

None written down yet.

## Changes

### 2025-10-29 A skill that asks for specs, one per feature

#### Why

- **Ask** the owner wants specs written per feature. Work on a feature that
  already has a spec adds to that spec, and a bug fix needs none unless it is
  a big one.
- **Now** the instructions file asks for a new dated file for every change,
  bug fixes too. One feature ends up spread over many files, and small fixes
  pay for a plan nobody reads.
- **Gap** the rule lives only in the instructions file, with no steps for
  finding the feature's spec or for a bug fix.

#### User flows it touches

1. The user asks for a new feature. The agent loads `specs`, writes
   `specs/<feature>.md` and commits it before the code.
2. The user asks to change a feature that has a spec. The agent finds that
   file and adds a dated entry to it, then updates the parts the change makes
   stale.
3. Later in the same session the user asks for another tweak to that feature.
   The agent extends the same entry, with no new file.
4. The user asks to fix a bug. The agent skips the spec. A fix that changes
   the design, the data or several modules gets an entry in the feature's
   spec.

#### Changes

- **`skills/specs/SKILL.md`** the steps: decide if a spec is needed, find the
  feature's spec, write or extend it, commit it first, keep it true.
- **`writing-style.instructions.md`** "Plan first" points at the skill and
  states the per feature rule and the bug fix rule.
- **`skills/implement-ticket/SKILL.md`** the plan step follows `specs`.
- **`skills/rewrite-repo/SKILL.md`** the plan file loses its date.
- **`skills/create-pr/SKILL.md`** the spec link covers a spec the branch
  updates.
- **`README.md`** and **`CHANGELOG.md`** the new skill and the new rule.

#### Steps, in commit order

1. This plan.
2. The skill.
3. The instructions file and the skills that name a spec path.
4. README and changelog.

#### Docs to update

- `README.md`: the skill under What you get, and the Plan first bullet.
- This repo holds skills, no app, so it has no architecture or user flow docs.
