# A monorepo skill split out of architecture, for web, mobile and backend

## Why

- **One skill does two jobs** `architecture` picks the shape and also sets up
  the workspace. The setup half only knows JS on the web.
- **Mobile and backend missing** an Expo app, a native Android or iOS app and
  a backend service in another language get no layout, tools or CI.
- **Stale defaults** pnpm 11, Expo isolated installs, Node without Corepack
  and Nx plugins for Gradle, Maven and .NET change the setup.

## User flows it touches

1. The user asks to set up, restructure or review a monorepo: "сделай
   монорепо", "put the app and the API in one repo".
2. The agent loads `monorepo`, reads the repos and the platforms, and asks once
   what the code can't answer.
3. It picks the task runner and the workspace for each language, lays out the
   folders and the shared contract.
4. It scaffolds in a worktree: tool versions, JS workspace, mobile, backend,
   CI with affected runs and a remote cache.
5. Asked to merge existing repos, it moves them in with their history.
6. A question about the shape, layers or micro frontends still goes to
   `architecture`, which hands the setup to `monorepo`.

## Changes

- **`skills/monorepo/SKILL.md`** new: read, pick the tools, layout, the shared
  contract, the JS workspace, mobile, backend, CI and release, merging repos,
  build and check, review.
- **`skills/monorepo/references/js-workspace.md`** moved from
  `architecture/references/monorepo.md`, updated for pnpm 11.
- **`skills/monorepo/references/mobile.md`** Expo in a workspace, native
  Android with Gradle, native iOS with Swift packages, shared logic.
- **`skills/monorepo/references/backend.md`** a Node service, services in
  other languages, Docker images from the workspace, local dev.
- **`skills/monorepo/references/ci.md`** affected runs, remote cache, deploys
  per app, mobile builds, releases.
- **`skills/architecture/SKILL.md`** drops the setup triggers and points at
  `monorepo` for the workspace and its configs.
- **`README.md`, `CHANGELOG.md`** the new skill, a prompt for it, an entry.

## Steps, in commit order

1. This plan.
2. The `monorepo` skill and its reference files, the move out of
   `architecture`.
3. README and changelog.

## Docs to update

- `README.md`: the new skill, the `architecture` paragraph, a prompt.
- This repo holds skills, no app, so it has no architecture or user flow docs.
