# Packages

The place each piece of shared code goes, and the layout all packages follow.

## Place it

The questions are independent of each other. One package can be published,
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
  ends up in the page gets the prefix, and a lint config doesn't.

## Types

| Type                 | Holds                                                 | Rule                                |
| -------------------- | ----------------------------------------------------- | ----------------------------------- |
| Infrastructure       | Bootstrap, transport, events, registry, storage, i18n | Used by nearly every app            |
| API and domain hooks | Option factories and selectors over the API client    | No UI                               |
| Design system        | Primitives and patterns                               | No business logic, no API calls     |
| Compound             | Domain UI with the data behind it, such as a picker   | The team that owns the data owns it |

## The component split rule

A component moves into a package of its own if any of these is true:

1. It adds more than about 50 kB gzip of dependencies.
2. It needs `sideEffects: true`, such as a canvas.
3. It forces a third party library on consumers.
4. It needs its own release cadence.

Code size by itself SHOULD NOT trigger a split. A subpath export tree shakes
just as well as a package does. Install size, side effects and release cadence
are what only a package keeps apart.

## Hooks

A shared hook is accepted once all three are true:

1. The workspace hook library doesn't have it, and the PR names the nearest
   hook in it.
2. It needs only React, or React plus that library. A hook tied to an API,
   routing or storage belongs in that package.
3. Two apps need it, or the PR names the second one.

Every hook SHOULD come with a browser test, plus a server render test when it
can render on the server.

## Inside a package

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
  up loaders. Logic sits in a module that the route imports.
- A domain SHOULD begin as a single package. It splits once a part stands on
  its own and splitting makes the dependencies simpler.

## Library plus adapter

A feature running in several hosts ships in two parts:

- **Library** the headless logic and UI, with React as a peer dependency and
  identity, query client and i18n passed in.
- **Adapter** a thin MFE or parcel holding the React root and the lifecycle,
  which connects the host's instances to the library.

Nested parcels SHOULD NOT take the place of a library. Their teardown can
fail, types end at the props boundary, and tree shaking ends there too.

## Ownership

- Every package MUST have a single implementation owner: the team owning the
  data source, even when another team uses it most.
- CODEOWNERS SHOULD list two entries for each package: the platform team on
  the root for structure and release, and the owner on `src/` for the code.
- "You break it, you fix it": the owner keeps the package's tests,
  translations and dependencies green on `main`.
