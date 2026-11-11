---
name: rewrite-repo
description: 'Use when the user wants the whole repo rewritten or deeply refactored with the same behaviour: "rewrite the repo", "rename the files and functions", "change the folder structure", "перепиши репозиторий", "измени структуру папок". Records behaviour, plans a new layout and rename map, modernises syntax, rewrites docs and skills in new words. Works straight on the default branch with no PR or spec, overrides other skills, and ends by wiping history into one commit.'
---

# Rewrite a repo so it reads new and works the same

Every file MUST get new code and new docs. The repo's behaviour MUST hold:
the same tests pass, and the same commands print the same output.

Unless the `writing-style` skill is already in context, the agent MUST load it
before writing the first line a person reads.

## How this skill runs

This skill MUST override the conventions of every other skill, the person's
shipping rules and the repo's. The goal is speed with the same quality.

- **No ceremony** the agent MUST skip the worktree, branches, PR, CI wait,
  spec and changelog. The `git-worktrees`, `specs` and `create-pr` skills
  MUST stay unloaded.
- **Default branch** the agent MUST commit in the user's checkout, straight on
  the default branch, and push only once, at step 12.
- **Fast checks** the agent MUST run lint, typecheck and unit tests. A long
  build, an e2e suite or an emulator SHOULD run once, in step 11, and only
  when the repo has no faster way to prove the behaviour.
- **Light on the machine** the agent MUST run at most two subagents at a
  time, and start the next pair once the last one returns. It MUST run one
  heavy command at a time, not two builds or test suites side by side.
- **Repo rules** MUST still set the code style, the writing rules and the
  checks.

## 1. Read the project

The agent MUST read the project first:

- **Docs** the agent MUST read the README, `AGENTS.md`, `CLAUDE.md` and
  `CONTRIBUTING.md`.
- **Build** the agent MUST read the manifests, the CI workflows, and the
  commands for lint and tests.
- **History** the agent SHOULD read `git log --oneline -20`, to learn how
  commits look.

The agent SHOULD size up the repo with:

```bash
git ls-files | sed 's|/.*||' | sort | uniq -c | sort -rn | head -20
git ls-files -z | xargs -0 wc -l | sort -n | tail -15
```

The checkout MUST be clean and on the default branch, so the final reset
holds only this work. Otherwise the agent MUST stop and ask. It MUST save the
start point:

```bash
start=$(git rev-parse HEAD)
```

## 2. Record the behaviour

The rewrite is finished once the repo behaves the way it does today. The agent
MUST capture that first, in the scratchpad and outside the repo:

1. The agent MUST run each check CI runs: lint, typecheck, tests, build, and
   write down which pass. A check already failing before the rewrite SHOULD
   be left out of the bar, and the final answer MUST mention it.
2. The agent MUST keep the output of each command the repo provides: CLI
   help, a script run on its sample input, a listing of a build artifact.
3. The agent MUST write down the public surface: package exports, CLI flags,
   HTTP routes, env vars, config keys, database names, the file formats it
   reads or writes.
4. With too few tests to rely on, the agent SHOULD first add characterisation
   tests against the code as it stands, in a commit of their own. They lock
   in today's behaviour.

The saved output SHOULD sit in the scratchpad like this:

```bash
mkdir -p "$SCRATCH/before" && <cli> --help > "$SCRATCH/before/help.txt"
```

## 3. Decide what keeps its name

Any name read by code outside the repo MUST keep working, or the rewrite breaks
whoever uses the repo. Those names are:

- **Published names** the package name, the CLI command, and a skill `name`
  with its folder when an installer links to them MUST keep working.
- **Wire names** HTTP routes, JSON fields, env vars, config keys, database
  tables and columns, and file names other tools search for MUST keep
  working.
- **User text** UI strings and error messages MUST stay, because people and
  tests match on them. The user MAY ask for these as well, and then they join
  the rename map.

When the user also asks to rename an outside name, the agent MUST rename it
and SHOULD keep the old name working where the stack allows it: an alias
export, a redirect, a fallback env var. Each one MUST go in `TODO.md` with
what its users need to change.

All other names are internal and SHOULD change: file and folder names, private
functions, variables, types, test names, comments, docs.

## 4. Plan the layout and the rename map

The plan MUST go in the scratchpad, outside the repo. It MUST contain:

- **New tree** the folders and files after the move, which SHOULD be grouped
  by what the code does for the person: `billing/`, `export/`, rather than
  `utils/`, `helpers/`.
- **Rename map** a table of old name, new name and kind (file, function,
  variable, type). Every new name MUST tell what the thing does, in the
  naming style of the repo.
- **Syntax moves** the modern forms the target runtime supports, which the
  agent MUST take from [references/code.md](references/code.md).
- **Kept names** the step 3 list, where each name MUST carry its reason.
- **Fixes and palette** the flaws step 8 will fix and the color shift of step
  9, which the plan MUST list if the app has a UI.

A new name MUST mean what the old one meant. `loadUsers` turns into
`fetchAccounts` only if the code fetches accounts. Two things MUST NOT share a
name in the end.

A new name MUST NOT be a fresh word that still says little, as in
`processData` → `handleInfo`. It SHOULD name the job the function does, as in
`processData` → `mergeDailyTotals`.

## 5. Move the files

The agent MUST use `git mv`, then repair each import, path and glob aimed at
the old spot: build config, test config, CI paths, `package.json` fields,
links in docs. A move SHOULD look like this:

```bash
git mv src/utils/date.ts src/calendar/format-day.ts
git grep -n 'utils/date'
```

The agent MUST run the checks and commit the move by itself, so git keeps
seeing each file as moved and step 11 can measure the drift.

## 6. Rename the symbols

The agent SHOULD use the language's rename tools, so all uses change together.
The tool for each language sits in [references/code.md](references/code.md).
Plain text search and replace SHOULD come last, with word boundaries and every
hit checked.

Once a module is done, the agent MUST run:

```bash
git grep -nwE '<oldName1>|<oldName2>'
```

The grep SHOULD print no hits other than the kept names of step 3. The agent
MUST run the checks, then commit the module.

## 7. Update the syntax and the shape

The agent MUST bring each function body to the modern form its runtime
supports, using the table in [references/code.md](references/code.md). Beyond
syntax:

- **Early returns** SHOULD replace nested `if` blocks.
- **Small functions** a long function SHOULD break into named steps.
- **Order** a file SHOULD read from the top down: exports first, then helpers,
  or whatever order the repo uses.
- **Dead code** code no path reaches SHOULD be removed after a grep confirms
  it.

A syntax move MUST keep the behaviour, edge cases too: the order of side
effects, the result of an empty input, the error thrown. Changing any of those
is an improvement and MUST go to step 8.

The agent MUST run the checks after each group of files, and SHOULD commit
once per module.

## 8. Improve on the way

A flaw met during the rewrite SHOULD be fixed in this run:

- **Bugs** a wrong edge case, a swallowed error, a race SHOULD get a fix.
- **Speed** a waterfall of awaits, a lookup inside a loop, a heavy import
  SHOULD get a fix.
- **Safety** missing input checks, a secret in the code, an unsafe query
  SHOULD get a fix.
- **Types and tests** a loose `any`, a branch without a test SHOULD get a fix.
- **Access** a missing label, a focus trap, low contrast SHOULD get a fix.

Every fix MUST sit in a commit of its own, apart from the renames, so a check
that breaks points at one change. The agent MUST add a test that fails without
the fix, and MUST keep a list of the fixes, since step 11 uses it to explain
the behaviour diff.

A fix that calls for a product decision, a migration or a new dependency MUST
go in `TODO.md` with its reason.

## 9. Shift the colors

The app MAY get a slightly changed palette, fresh yet familiar:

- **Where** the agent MUST edit the design tokens or theme variables, the
  single source of each color. Hard coded colors MUST move into tokens first.
- **How much** the shift SHOULD be a small turn in hue and lightness, about 5
  to 15 degrees of hue in OKLCH or HSL. Each color MUST keep its job: a red
  error stays red.
- **Contrast** text and controls MUST still meet WCAG AA: 4.5:1 for body text,
  3:1 for large text and icons. The agent MUST check every pair after the
  shift.
- **Both themes** light and dark MUST shift together.
- **Kept** brand colors the user named, and colors in logos and store assets,
  MUST stay as they are.

The agent MUST commit the palette by itself, and SHOULD keep a before and
after screenshot in the scratchpad for the final answer.

## 10. Rewrite the prose

Each line of prose in the README, the docs, the skills and the code comments
MUST be reworded with its facts intact. The agent MUST follow the method and
the check in [references/prose.md](references/prose.md).

- **Facts stay** each number, command, path, link, limit and rule MUST remain,
  at the same strength.
- **Names follow** an old name in the prose MUST turn into its new name from
  the map.
- **Rules of the repo** the new prose MUST meet the repo's writing rules and
  size caps.

The agent SHOULD commit the prose folder by folder.

## 11. Check the result

1. The agent MUST run each check from step 2. The same ones MUST pass.
2. The agent MUST rerun each saved command and compare. The diff SHOULD be
   empty apart from names the user asked to change and the step 8 fixes.
3. The agent SHOULD use the app or the CLI as a person would, through the
   `run` skill if there is one.
4. The agent MUST measure how far each file moved from where it started:

```bash
git diff --find-renames=50% --name-status "$start" HEAD | grep '^R'
```

Each line printed is a file that still matches its old self by more than half.
Every such file SHOULD go through steps 6, 7 and 10 again, or get a reason in
the final answer: a lockfile, a licence, generated code, a kept name.

## 12. Reset the history

1. The agent MUST write the tasks left for a person to `TODO.md` under
   `## rewrite-repo`: outside users to tell, old aliases to remove later, a
   check that was already failing. It MUST commit it, so it lands in the
   initial commit.
2. The agent MUST run the `reset-history` skill on the default branch. The
   rewrite request is its go ahead, so the agent MUST skip its question in
   step 5. Its bundle, lease and branch rule steps MUST still run.
3. The agent MUST report in a few lines: the new commit SHA, the rename map,
   the kept names, the fixes and the step 11 behaviour check.

## A large repo

Past a handful of modules, the main agent MUST keep the rename map, since a
name MUST mean the same thing everywhere in the repo. Steps 7, 8 and 10 MAY
then be handed out, one subagent per module and two at a time, each given the
map, the kept names and the checks to run. The main agent MUST read every diff
before committing it.
