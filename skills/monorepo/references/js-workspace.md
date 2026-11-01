# JS workspace

pnpm 11 SHOULD handle installs, Nx SHOULD run the tasks, and TypeScript
project references SHOULD check the types. The templates below are a start,
and the agent SHOULD cut whatever the repo has no use for.

## Folders and scopes

Each folder SHOULD hold its kind of project under its scope:

| Folder       | Holds                                    | Scope         | Published |
| ------------ | ---------------------------------------- | ------------- | --------- |
| `apps/`      | Web and mobile apps, MFEs                | `@app/*`      | No        |
| `services/`  | Backend services in TS                   | `@service/*`  | No        |
| `packages/`  | Libraries other repos install            | `@scope/*`    | Yes       |
| `internal/`  | Tooling and libraries for this repo only | `@repo/*`     | No        |
| `contracts/` | Generated API clients                    | `@contract/*` | No        |
| `workers/`   | Edge workers                             | `@worker/*`   | No        |
| `e2e/`       | Playwright and Maestro suites            | `@e2e/*`      | No        |

- Every private scope MUST point at `https://0.0.0.0`. Then a typo or a
  missing link breaks the install, and a public package of the same name
  can't sneak in.
- The package name MUST equal the folder name, and a structure check MUST
  fail any mismatch.

## pnpm

The workspace, `.npmrc` and `devEngines` SHOULD start from these:

```yaml
packages: [apps/*, services/*, packages/*, internal/*, contracts/*, workers/*, e2e/*]
catalog: # one version per shared dependency
  "@tanstack/react-query": "5.x.y"
  zod: "^4.0.0"
hoist: false # a package sees only what it declares
strictPeerDependencies: true
strictDepBuilds: true # install scripts run only when listed
allowBuilds: { esbuild: true, nx: true }
minimumReleaseAge: 4320 # a new upstream release waits 3 days
minimumReleaseAgeExclude: ["@scope/*"]
blockExoticSubdeps: true # a dependency can't pull a git or tarball URL
engineStrict: true
packageExtensions: # fix a dependency's missing peer here, not in a patch
  some-lib: { peerDependencies: { react: "*" } }
```

```ini
# .npmrc: pnpm 11 reads only auth and registries from it
@scope:registry=https://npm.pkg.github.com
@repo:registry=https://0.0.0.0
@app:registry=https://0.0.0.0
```

```json
"devEngines": {
  "runtime": { "name": "node", "version": "^24.11.0", "onFail": "error" },
  "packageManager": { "name": "pnpm", "version": "^11.0.0", "onFail": "download" }
}
```

- A dependency used by two projects SHOULD appear as `"catalog:"` in the
  manifests.
- React, React Native and their types SHOULD sit in the catalog, so web and
  mobile can't drift apart.
- `devEngines` in the root `package.json` SHOULD pin Node and pnpm, with the
  same versions as `mise.toml`.

## TypeScript

One package, `internal/typescript`, SHOULD hold the tsconfig layers. A
project SHOULD extend the layers it needs:

```jsonc
// base: every project
{ "compilerOptions": {
  "composite": true, "incremental": true, "strict": true,
  "module": "esnext", "target": "esnext", "lib": ["ES2024"],
  "isolatedModules": true, "verbatimModuleSyntax": true, "erasableSyntaxOnly": true,
  "exactOptionalPropertyTypes": true, "noUncheckedIndexedAccess": true,
  "noUncheckedSideEffectImports": true, "moduleDetection": "force",
  "emitDeclarationOnly": true, "skipLibCheck": true
} }
// bundler: apps and browser libraries
{ "compilerOptions": { "moduleResolution": "bundler", "jsx": "react-jsx",
  "lib": ["ES2024", "DOM", "DOM.Iterable"] } }
// node: scripts and configs. build: published packages
{ "compilerOptions": { "declaration": true, "declarationMap": true, "sourceMap": true,
  "emitDeclarationOnly": false, "outDir": "${configDir}/dist", "rootDir": "${configDir}/src" },
  "exclude": ["${configDir}/src/**/*.test.*", "${configDir}/src/**/*.stories.*"] }
```

```jsonc
// root tsconfig.json: references only, kept by `nx sync`
{ "extends": ["@repo/typescript"], "files": [],
  "references": [{ "path": "./apps/shell" }, { "path": "./packages/events" }] }
// packages/<name>/tsconfig.json
{ "extends": ["@repo/typescript"], "files": [],
  "references": [{ "path": "./tsconfig.lib.json" }, { "path": "./tsconfig.typecheck.json" }] }
```

- `nx sync:check` MUST run in CI, so the PR fails when a reference is missing.
- Each path in a shared config SHOULD be written with `${configDir}`, which
  resolves against the extending project.
- `"composite": true` SHOULD appear again in the local base, because the Nx
  sync can't follow an `extends` into the pnpm store.
- A published React package SHOULD leave JSX untouched (`"jsx": "preserve"` in
  its build config), since the consumer's React Compiler spots components by
  their JSX.

## Package exports

In the repo, a package SHOULD point to its source, so apps use it without a
build step. At publish time, `publishConfig` MUST swap the built files in:

```json
{
  "type": "module",
  "sideEffects": false,
  "files": ["dist", "src"],
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./src/index.ts" },
    "./props": { "types": "./dist/props.d.ts", "import": "./src/props.ts" }
  },
  "publishConfig": {
    "exports": {
      ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
      "./props": { "types": "./dist/props.d.ts", "import": "./dist/props.js" }
    },
    "registry": "https://npm.pkg.github.com"
  }
}
```

- Every area SHOULD have its own subpath export, so a consumer can load just
  that area.
- Each published package SHOULD go through `publint`.

## Nx

`nx.json` SHOULD start from this template:

```json
{
  "plugins": [
    "@nx/eslint/plugin",
    "@nx/js/typescript",
    "@nx/vitest",
    "@repo/nx-plugin/app",
    "@repo/nx-plugin/package",
    "@repo/nx-plugin/worker"
  ],
  "release": { "projects": ["!*"] },
  "targetDefaults": {
    "lint": { "dependsOn": ["^build"], "cache": true },
    "test": { "dependsOn": ["^build"], "cache": true, "outputs": ["{projectRoot}/coverage"] },
    "typecheck": {
      "dependsOn": ["^build"],
      "cache": true,
      "outputs": ["{projectRoot}/tsconfig.tsbuildinfo", "{projectRoot}/dist/**/*.d.ts"]
    }
  }
}
```

- Targets SHOULD be inferred by plugins reading a marker file, such as
  `tsconfig.lib.json` for a library. A `project.json` written by hand drifts.
- `nx run-many` can't see a project that lacks its marker. To catch that, the
  structure check MUST read the folders from disk.
- In CI, `nx affected` SHOULD run with a remote cache.
- Changesets MAY handle releases, with Nx release switched off as shown above.

Layers SHOULD be enforced through tags, as in this lint rule:

```js
// eslint: layers through tags. A project's tags sit in its package.json under "nx".
"@nx/enforce-module-boundaries": ["error", { depConstraints: [
  { sourceTag: "layer:app",    onlyDependOnLibsWithTags: ["layer:domain", "layer:ds", "layer:infra", "layer:config"] },
  { sourceTag: "layer:domain", onlyDependOnLibsWithTags: ["layer:ds", "layer:infra", "layer:config"] },
  { sourceTag: "layer:ds",     onlyDependOnLibsWithTags: ["layer:infra", "layer:config"] },
  { sourceTag: "layer:infra",  onlyDependOnLibsWithTags: ["layer:infra", "layer:config"] },
] }]
```

## knip

The knip config SHOULD start from this template:

```ts
export default {
  treatConfigHintsAsErrors: Boolean(process.env.CI),
  ignoreUnresolved: [/routeTree\.gen$/], // written by the router plugin at build time
  workspaces: {
    "apps/*": {
      entry: ["src/main.ts", "src/routes/**/*.{ts,tsx}", "!src/routes/{**/-*,-**/*}.{ts,tsx}"],
    },
  },
} satisfies KnipConfig;
```

- A shared package SHOULD hold the config, and the root SHOULD re-export it.
- Every ignore MUST have a comment giving the reason. Without one, the ignore
  stays long after its cause is gone.
