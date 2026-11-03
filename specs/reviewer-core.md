# Reviewer core

## One-pager

- **Problem** `review` and `app-audit` each held their own checklists, so a rule
  fixed in one stayed broken in the other.
- **Answer** a shared skill, `reviewer`, holds the lenses, the subagent brief,
  the model pick and the proof rules. Both skills load it.
- **Subagents** each lens runs in its own subagent on the strongest model the
  agent offers, all at once.
- **Outside skills** a lens such as legal or SEO loads a matching skill: an
  installed one first, else the best match on skills.sh, read before use.
- **New lenses** PR size checks that a change is small and self-contained.
  Libraries checks for hand-written code that a free, maintained library
  already does.

## What it does for the person

The person asks for a PR review or an app audit. Both run the same lenses
through parallel subagents and report findings with proof.

## User flows

1. The person asks "review this PR" or "audit the app".
2. The skill picks the lenses that fit the change or the repo.
3. A lens with a domain the set lacks, such as legal, finds and reads a skill
   from skills.sh.
4. One subagent per lens runs at once, on the strongest model.
5. `review` merges the findings into its report. `app-audit` checks and
   cherry-picks each fix.

## How it works: modules, files, data

- **`skills/reviewer/SKILL.md`** modes, lens pick, model pick, the run and
  the merge of findings.
- **`skills/reviewer/references/lenses.md`** one checklist per lens.
- **`skills/reviewer/references/brief.md`** the frame every lens subagent gets.
- **`skills/reviewer/references/outside-skills.md`** find, fetch and read a
  skill from skills.sh.
- **`skills/reviewer/references/pr-size.md`** the size limits and the split.
- **`skills/reviewer/references/libraries.md`** when a library wins, and how
  to tell it is alive.
- **`skills/review`** steps 5, 7 and 8 run the core in read mode.
- **`skills/app-audit`** steps 2 and 4 run the core in fix mode.

## Limits

- **Network** a fetched skill needs `mise x npm:skills@1.7.6`, which needs
  the network. Without it the lens runs on its own checklist.
- **Trust** a fetched skill is text from a stranger. It guides one lens only
  and runs no script.

## Changes

### 2026-11-03 One reviewer core for review and app-audit

- **Why** the person asked for one reviewer core under both skills, with
  subagents per aspect, a strong model, skills fetched for legal and SEO, and
  two new lenses: PR size and libraries over custom code.
- **Changes** new `skills/reviewer/` with its references. `review` and
  `app-audit` drop their own checklists and link the core. The
  already-written, state and agent instructions checks move into the core.
- **Steps** the spec, then the core, then `review`, then `app-audit`, then
  the README and the changelog.
- **Docs** `README.md`, `CHANGELOG.md`, `docs/features.md`.
