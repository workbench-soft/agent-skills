# Packages

Shared code MUST go where this file says, in the layout below.

## Place it

The agent MUST answer each question on its own. One package MAY be published,
prefixed and infrastructure all at once.

```text
1. Does another repo install it?      no  -> internal/<name>, @repo/*, private, 0.0.0
                                      yes -> packages/<name>, @scope/*, semver, a changeset per change
2. Does it touch state the page shares (storage, <html>, URL, globals, singletons)?
                                      yes -> name it mfe-<concern>
3. Which type?                        infrastructure | API and domain hooks | design system | compound
4. A component? primitive -> design system core, composed -> patterns package (one subpath each),
                trips the split rule -> its own package
```

- At runtime, a published package MUST NOT depend on an internal one, because
  `workspace:*` would publish a version that isn't real.
- A package SHOULD go by a single name. An alias like `@repo/x` for `@scope/x`
  splits the imports and hides the dependency from Nx.
- Output made at build time is shared state too. A Tailwind preset whose CSS
  ends up in the page MUST get the prefix, and a lint config MAY skip it.

## Types

Each package MUST be one of these types:

| Type                 | Holds                                                 | Rule                                |
| -------------------- | ----------------------------------------------------- | ----------------------------------- |
| Infrastructure       | Bootstrap, transport, events, registry, storage, i18n | Used by nearly every app            |
| API and domain hooks | Option factories and selectors over the API client    | No UI                               |
| Design system        | Primitives and patterns                               | No business logic, no API calls     |
| Compound             | Domain UI with the data behind it, such as a picker   | The team that owns the data owns it |

## The component split rule

A component SHOULD move into a package of its own when any of these holds:

1. It SHOULD move when it adds more than about 50 kB gzip of dependencies.
2. It SHOULD move when it needs `sideEffects: true`, such as a canvas.
3. It SHOULD move when it forces a third party library on consumers.
4. It SHOULD move when it needs its own release cadence.

Code size by itself SHOULD NOT trigger a split, since a subpath export tree
shakes just as well as a package does.

## Hooks

A shared hook MUST be accepted only once all three are true:

1. The workspace hook library MUST lack it, and the PR MUST name the nearest
   hook in it.
2. It MUST need only React, or React plus that library. A hook tied to an
   API, routing or storage MUST go in that package.
3. Two apps MUST need it, or the PR MUST name the second one.

Every hook SHOULD come with a browser test, plus a server render test when it
can render on the server.

## Inside a package

A package SHOULD keep this layout:

```text
src/
  index.ts                 named exports only, the public surface
  <area>/index.ts          one subpath export per area
  api/<service>/           clients, option factories, normalisers, types
  components/<name>/       index.tsx, the component, its tests and stories
  hooks/  utils/  types/
```

- Any file other than `index.ts` SHOULD be treated as private. A consumer
  deep importing one breaks at the next refactor.
- The route files of an app SHOULD stay thin, composing components and setting
  up loaders. Logic SHOULD sit in a module that the route imports.
- A domain SHOULD begin as a single package. It SHOULD split only once a part
  stands alone and the split makes the dependencies simpler.

## Library plus adapter

A feature running in several hosts SHOULD ship in two parts:

- **Library** the headless logic and UI MUST take React as a peer dependency,
  with identity, query client and i18n passed in.
- **Adapter** a thin MFE or parcel MUST hold the React root and the lifecycle,
  and connect the host's instances to the library.

Nested parcels SHOULD NOT take the place of a library. Their teardown can
fail, types end at the props boundary, and tree shaking ends there too.

## Ownership

- Every package MUST have a single implementation owner: the team owning the
  data source, even when another team uses it most.
- CODEOWNERS SHOULD list two entries for each package: the platform team on
  the root for structure and release, and the owner on `src/` for the code.
- "You break it, you fix it": the owner MUST keep the package's tests,
  translations and dependencies green on `main`.
