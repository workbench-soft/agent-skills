# CI and release

One workflow checks the PR, then a job per app or service deploys what
changed.

## Checks on each PR

```yaml
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<sha>
        with: { fetch-depth: 0 }
      - uses: jdx/mise-action@<sha>          # Node, pnpm, Java, Go from mise.toml
      - run: pnpm install --frozen-lockfile
      - uses: nrwl/nx-set-shas@<sha>
      - run: pnpm nx sync:check
      - run: pnpm nx affected -t lint typecheck test build
  ci-ok:                                     # the one required check
    needs: [check]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - run: test "${{ needs.check.result }}" = success
```

- Branch protection SHOULD require only `ci-ok`. A required check that skips
  on a path filter then can't block the PR.
- Actions MUST be pinned by commit SHA. `zizmor` and `actionlint` SHOULD lint
  the workflows.
- A remote cache SHOULD back `nx affected`: Nx Cloud or a self hosted cache.
  Turborepo repos run `turbo run --affected` with its remote cache.
- A Gradle build SHOULD use `gradle/actions/setup-gradle`, which caches the
  Gradle home between runs.
- The codegen drift check and `oasdiff` from the backend reference run here.

## Deploy per app

```yaml
  plan:
    outputs: { projects: "${{ steps.p.outputs.list }}" }
    steps:
      - id: p
        run: echo "list=$(pnpm -s nx show projects --affected --withTarget deploy --json)" >> "$GITHUB_OUTPUT"
  deploy:
    needs: plan
    strategy: { matrix: { project: "${{ fromJson(needs.plan.outputs.projects) }}" } }
    environment: production
    steps:
      - run: pnpm nx run ${{ matrix.project }}:deploy
```

- Each deploy SHOULD use its own environment and secrets, so one app's key
  can't ship another app.
- A build SHOULD serve each environment, and promotion makes it live.

## Mobile

- An Expo change with the same fingerprint SHOULD ship as `eas update`. A new
  fingerprint starts `eas build` for the store.
- `expo/expo-github-action` gives the fingerprint step. A build on every PR
  SHOULD wait for a label, since each one takes minutes on macOS.
- iOS builds MUST run on macOS: EAS or a hosted macOS runner.
- Store versions SHOULD come from `autoIncrement` in `eas.json`, or Gradle and
  Xcode build numbers set by CI.

## Releases

- **Packages** another repo installs version through Changesets. A PR that
  changes one carries a changeset, and `changeset status` checks it.
- **Apps and services** deploy on merge with no version. The commit SHA tags
  the image.
- **Dependency updates** Renovate SHOULD group them by catalog entry, so web
  and mobile move to a new React in one PR.

## Ownership

- CODEOWNERS SHOULD hold one entry per app, service and package.
- A merge queue SHOULD rerun the checks on the merged result.
