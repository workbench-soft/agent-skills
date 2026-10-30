# An architecture skill for apps, monorepos and web platforms

## Why

- **Shape picked by habit** agents start micro frontends for one team, or one
  app for five teams, with no reason written down.
- **Shared code with no home** each app grows its own copy of a hook, a picker
  or a storage helper, and agents add a `shared/` bucket with no owner.
- **Rules held by reviewers** a layer import, a stray `localStorage` key or a
  missing CODEOWNERS entry gets through when no check fails on it.
- **Source** a production Nx monorepo of micro frontends behind a shell and
  edge workers, with its architecture notes and ADRs. The techniques that hold
  in any repo go in, without company names.

## User flows it touches

1. The user asks to design, set up, restructure or review an app's
   architecture.
2. The agent loads `architecture`, reads the repo and asks once what the code
   can't answer: teams, independent deploys, outside consumers, hosting.
3. It picks the smallest shape that fits, lays the packages in layers and
   names who owns each shared page resource.
4. It writes `docs/architecture.md` with diagrams and a decision table.
5. Asked to build, it scaffolds the skeleton in a worktree and turns each rule
   into a generator, a lint rule or a CI check.
6. In a review, each finding names the rule, the file and what breaks.

## Changes

- **`skills/architecture/SKILL.md`** the steps: read, pick the shape, layers,
  where shared code goes, shared page state, data, rules in code, write it
  down, build, review.
- **`references/monorepo.md`** Nx, pnpm, tsconfig layers, package exports,
  knip, with config templates.
- **`references/packages.md`** placing a package, package types, the component
  split rule, hooks, ownership, package anatomy.
- **`references/mfe-runtime.md`** the shell, the lifecycle, the registry, the
  host contract, shared dependencies, parcels.
- **`references/edge.md`** the document at the edge, previews, local
  overrides, deploy and promote.
- **`references/guardrails.md`** structure lint, lint bans, CI gates, tests by
  file name, ownership.
- **`references/migration.md`** replacing a legacy app route by route, and when
  a domain counts as moved.
- **`README.md`** the skill under What you get, a prompt under Use it.
- **`CHANGELOG.md`** an entry under Unreleased.

Left out on purpose: company, package and team names, internal links, and
version numbers that go stale.

## Steps, in commit order

1. This plan.
2. The skill and its reference files.
3. README and changelog.

## Docs to update

- `README.md`: the new skill and a prompt for it.
- This repo holds skills, no app, so it has no architecture or user flow docs.
