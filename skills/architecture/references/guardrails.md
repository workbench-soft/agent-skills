# Guardrails

These checks keep the architecture in place after people and agents have
stopped reading the doc.

## Structure lint

A small CLI reads each `package.json` under the workspace folders straight from
disk. It ignores the workspace tool's project list, because a broken package
can fall out of that list.

| Check                            | Fails when                                                                            |
| -------------------------------- | ------------------------------------------------------------------------------------- |
| `require-package-files`          | README, `tsconfig.lib.json`, lint or test config is missing                           |
| `require-package-name`           | The name doesn't match the folder and scope                                           |
| `require-published-manifest`     | A published package lacks version, `type`, `files`, `repository`, `publishConfig`     |
| `require-internal-manifest`      | An internal package isn't private at `0.0.0`                                          |
| `require-changeset-ignore`       | An internal package sits in the release, or a published one is left out               |
| `require-code-owners`            | A package lacks its root or `src/` CODEOWNERS entry, or an entry points at no package |
| `no-internal-runtime-dependency` | A published package needs a private one at runtime                                    |
| `no-package-alias`               | A dependency key differs from the package it resolves to                              |
| `consistent-dependency-versions` | One dependency carries two ranges in the repo                                         |
| `no-catalog-ahead-of-host`       | The lockfile runs ahead of the host contract                                          |

A failure SHOULD give the package and the rule. The CLI MAY also lint the CI
workflows using `actionlint` and `zizmor`.

## Lint bans

- **Root access** any read or write of `<html>` outside the shell context
  package fails, including through aliases and destructuring.
- **Web storage** using `localStorage` or `sessionStorage` outside the storage
  package fails.
- **File routes** a route that breaks the router's file convention fails.
- **Strings** text a user sees that skips the i18n macros fails.

## CI on every PR

```text
lint, format, typecheck, nx sync:check, knip, publint, changesets status,
unit and browser tests (sharded by recorded timings), structure lint,
codegen drift, each generator run and its output checked, bundle sizes
```

- A bundle growing 10% or more over `main` SHOULD fail the PR. A PR label MAY
  allow growth that a reviewer approved.
- A merge queue SHOULD run the checks again on the merged code.
- `verify-lockfile` SHOULD fail if the lockfile and the manifests disagree.
- An upgrade of a library the host shares SHOULD go in a PR of its own,
  tested on a preview.

## Tests by file name

| File                 | Runs in                          | For                             |
| -------------------- | -------------------------------- | ------------------------------- |
| `*.unit.test.ts`     | Node                             | Pure logic                      |
| `*.browser.test.tsx` | Real Chromium through Playwright | Components, hooks, browser APIs |
| `*.worker.test.ts`   | The workers runtime              | Request, Response, KV           |
| `e2e/*`              | The PR preview                   | Cross-app journeys, auth        |

- The cheapest test that still gives confidence SHOULD be the pick, going down
  the table.
- A shared Vitest config package SHOULD export `unitProject` and
  `browserProject`, so all packages test alike.
- MSW SHOULD replace the API, configured once in the generated test setup.
- Interactive components SHOULD have tests for keyboard paths and screen
  reader announcements.

## Generators

- Every project kind SHOULD have its own generator: app, package, worker.
- The app generator produces the lifecycle, the provider stack, the route
  tree, i18n catalogs, a browser test, plus the registry, CODEOWNERS and knip
  entries.
- CI SHOULD run every generator and confirm its output passes lint, typecheck,
  tests, build and knip.
