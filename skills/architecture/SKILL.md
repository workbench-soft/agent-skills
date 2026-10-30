---
name: architecture
description: 'Use when the architecture of an app, a monorepo or a web platform needs designing, restructuring or reviewing, in any repository and in any language: "design the architecture", "where does this package go", "split it into micro frontends", "add a shell", "which layer does this go in", "спроектируй архитектуру", "как разложить пакеты". Setting up the monorepo itself, its tools and its configs, goes to the monorepo skill. Chooses the smallest shape the teams need: one app, a monorepo with packages, or micro frontends behind a shell and the edge. Stacks packages in layers that import downward, gives every shared page resource one owning package, keeps data in query option factories, and makes each rule a generator, a lint rule or a CI check. Writes docs/architecture.md with the diagrams and the decisions, then scaffolds the skeleton.'
---

# Architecture

Laying out an app, a monorepo or a web platform so every team can ship alone,
and the rules hold with no reviewer having to recall them.

The repo's own ADRs, lint rules and architecture docs MUST override this file.
Rules for React, JS and the design system belong to their own skills. The
workspace setup, for web, mobile and backend, belongs to the `monorepo` skill.

## 1. Read what is there

- **Repo** the stack, folders, package manager, build tool,
  `docs/architecture.md`, ADRs, `AGENTS.md`, `CONTRIBUTING.md`.
- **Teams** how many teams ship into the repo, and which folder each one owns.
- **Consumers** other repos installing its packages or deploying into its
  pages.
- **Hosting** a static host, edge workers or a server, and the place auth runs.
- **Legacy** an older app the new one takes over from, and the path traffic
  takes to it.

Gather what the code can't tell you in a single form, asked once. Guesses
SHOULD land in the doc flagged as guesses, so the person fixes them in review.

## 2. Pick the shape

| Shape | Pick it when | It costs |
| --- | --- | --- |
| One app | One team, one deploy | Folders by feature, a lint rule per boundary |
| Monorepo with packages | Several apps, or code another repo installs | A workspace tool, package rules, a release flow |
| Micro frontends | Several teams own parts of one page and deploy apart, or a legacy app moves route by route | A shell, a registry, a host contract, an edge, a deploy per app |

- The smallest shape that fits SHOULD be the pick. Every micro frontend (MFE)
  brings a runtime, a contract and a deploy that somebody has to maintain.
- An MFE SHOULD own a top level route. Features present on every page, such as
  toasts or banners, go in the shell.
- A single app SHOULD still group its code by domain and put shared page state
  behind one module, so a later move to packages is just a folder move.
- Auth, theme, language and feature flags alter the first paint. If the page
  needs them at request time, the document SHOULD be composed at the edge. A
  prebuilt page has to be reworked the day one of those inputs shows up.

## 3. Layers

A layer imports from the layers under it and from none above.

```text
apps            shell, global apps, domain apps
domain          API hooks, the components backed by them (pickers)
design system   primitives, composed patterns, the Tailwind preset
infrastructure  bootstrap, transport, events, registry, storage, i18n
build config    Vite, Vitest, ESLint, tsconfig, browserslist
repo tooling    generators, structure lint, CI scripts, edge workers
```

- Lint MUST fail on an import that reaches up a layer. Nx tags with
  `@nx/enforce-module-boundaries` handle it, and the template is in the JS
  workspace reference of the `monorepo` skill.
- One app MUST NOT import from another app. Apps share code through a package,
  or exchange messages on the event bus.
- Each shared package names who may import it. Pulling in another team's
  package then becomes a choice on record.

## 4. Where shared code goes

Before you create a package or move code into one, read
[the packages reference](references/packages.md).

- **Rule of three** code moves into a package once a third caller needs it.
  Two callers are chance.
- **Internal by default** a package is published only once another repo
  installs it. Publishing ties you to semver for consumers you can't see.
- **Library first** a well maintained library wins over a copy of your own.
  The package holds just the gaps the library leaves.
- **Slots over empty packages** the first code needing a package is what
  creates it. An empty package holds no code and has no owner.
- **One owner** the package belongs to the team owning the data source, even
  when another team uses it most.

## 5. Shared page state has one door

All MFEs write into one document, and so do all the features of a single app.
Every shared resource MUST have a single package that owns access to it. Lint
MUST fail on access that goes around that package.

| Resource | The owning package gives | The guard |
| --- | --- | --- |
| CSS classes | A class prefix per app at build time, tokens as CSS variables | The build config |
| `<html>` attributes | One read hook per value: language, colour scheme, chrome state | Lint bans other reads and writes of the root |
| Web storage | Keys prefixed with the app name, each value decoded with a fallback | Lint bans direct `localStorage` |
| Session | One transport, one sign out for the page on a 401 | Apps get the transport from the host |
| URL and history | One helper to move between apps | App names typed against the registry |
| Messages | A typed event bus passed in by the host | No globals on `window` |

- A package touching a shared resource SHOULD have a name prefix such as
  `mfe-`. The prefix tells the reader the package expects neighbours.
- A global store spanning apps MUST NOT exist. The apps share a single query
  cache and a single event bus, and the host creates both.
- Each new value the shell exposes SHOULD come through a new hook, so every new
  contract with the shell gets reviewed.

## 6. Data

- **Option factories** a data package exports pure selectors and query option
  factories. The caller chooses `useQuery` or `useSuspenseQuery`.
- **One cache** route loaders pass `ensureQueryData` the same options the
  components read.
- **Transport passed in** every factory receives the API transport as an
  argument, so tests and other hosts can replace it.
- **UI apart from transport** the drop target passes on `File` objects and the
  upload flow sends them. They don't import each other.
- **Behaviour shared, data local** the picker pattern owns search, paging and
  selection. Every domain package supplies its own fetcher and wording.

```ts
import { buildCurrentUserQueryOptions } from "@scope/identity/current-user";

const { data } = useSuspenseQuery(buildCurrentUserQueryOptions(transport));
```

API types SHOULD be generated from the API schema, and a CI check confirms the
generated files are current.

## 7. Micro frontends and the edge

This section applies to the MFE shape alone.

- **Runtime** for the shell, the lifecycle, the registry, the host contract and
  shared dependencies, read [the MFE runtime reference](references/mfe-runtime.md).
- **Edge** for document composition, previews, local overrides, deploy and
  promote, read [the edge reference](references/edge.md).
- **Legacy** for taking over an older app one route at a time, read
  [the migration reference](references/migration.md).

These rules set the shape of everything else:

- All MFEs MUST export one lifecycle: `bootstrap`, `mount`, `unmount`.
- Which app owns which route MUST be held as data in a single registry, read
  by the shell, the edge and the legacy fallback.
- The host MUST pass in the query client, the event bus and the other shared
  page instances as props. Sharing a module shares the code, and two copies of
  a client split the cache.
- One build SHOULD serve all environments. Promoting it makes it live, and a
  rollback promotes an earlier build.

## 8. Rules live in code

Rules that depend on a reviewer's memory get broken. A rule SHOULD go into the
first of these able to hold it:

1. A generator that writes the right files, so the rule holds from the start.
2. A lint rule with a message that names the fix.
3. A CI check that fails the PR.
4. A line in `AGENTS.md` or `CONTRIBUTING.md`, for what no tool can check.

The checks and the test layout are in
[the guardrails reference](references/guardrails.md).

## 9. Context for coding agents

- **Short root** `AGENTS.md` SHOULD stay around 100 to 150 lines, as do and
  don't pairs each with its reason. Agents turn timid under a long root.
- **One file** `CLAUDE.md` SHOULD just point to `AGENTS.md`, so the two stay
  in step.
- **Rules near the code** a folder with risks of its own gets an `AGENTS.md`
  of its own.
- **Skills on demand** task guides sit in skills that load when the task calls
  for them: `create-app`, `tests`, `i18n`.
- **Checks last** lint, types and tests have the final word, because an agent
  saying "done" is only a guess.

A list of file paths in the root SHOULD be removed. It goes out of date, and
the agent can list the folder on its own.

## 10. Write it down

Put the design in `docs/architecture.md`, or wherever the repo keeps it. A call
that costs a lot to undo SHOULD get an ADR too.

```markdown
# Architecture

## Shape
<one app | monorepo | micro frontends>, and the reason in two lines.

## Layers
<mermaid flowchart, top layer first>

## Packages
| Package | Layer | Owner | Gives |

## How a page loads
<mermaid sequence: browser, edge, shell, app>

## Shared page state
| Resource | Owning package | Guard |

## Decisions
| Decision | Options weighed | Picked | Why | Cost to undo |
```

- Every decision MUST name the options weighed. A pick without a rival looks
  like habit.
- The decisions SHOULD be sorted by cost to undo. Make a cheap one now, and
  hold an expensive one until the cheapest test that could change it.
- Diagrams SHOULD use mermaid, so they diff and render on GitHub.

## 11. Build the skeleton

When asked to build, work in a worktree via `git-worktrees`, and open the PR
via `create-pr`.

1. Set up the workspace through the `monorepo` skill: tools, tsconfig layers,
   Nx plugins, knip, lint. One app skips it.
2. Add a generator in the repo for each project kind: app, package, worker.
3. Add the structure lint and the CI gates from
   [the guardrails reference](references/guardrails.md).
4. Use the new generators to make one app and one package. Straight out of the
   generator, both MUST pass lint, typecheck, tests, build and knip.
5. Write `docs/architecture.md` and the root `AGENTS.md`.

Every step SHOULD get a commit of its own.

On a live repo, the reshape moves a single domain per PR. That PR SHOULD
remove the old copy in the same change. A new package beside the old copy
leaves the code twice.

## 12. In a review

- Every finding gives the rule, the file and what breaks: "`orders` imports
  `apps/billing`, so a billing deploy can break orders".
- Blockers are an upward import, a second writer of shared page state, and a
  published package with a private runtime dependency.
- A missing generator or check SHOULD be raised as a suggestion, together with
  the rule it would hold.
