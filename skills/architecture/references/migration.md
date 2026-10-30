# Moving off a legacy app

The new shell claims routes one by one. Any route not yet claimed stays with
the old app, so the move needs no big cutover.

## The legacy subshell

- The new shell mounts the old app a single time in its content slot. From
  there the old app serves each route still unclaimed.
- The old app runs on its own runtime and libraries, and new work goes
  elsewhere.
- In embedded mode the old app MUST drop its registration of the MFEs the new
  shell mounts, or each of them mounts twice.
- Two query caches on different major versions MAY stay in sync through a
  small bridge that replays invalidation keys.
- The DOM ids the old app mounts into MUST remain unchanged.
- Once the last route has moved, one change removes the subshell.

## How a domain moves

```text
generate the MFE -> port the screens onto the target stack -> use shared packages,
ask for the missing ones -> claim the routes in the registry -> roll out behind a flag
-> delete the old code
```

- A domain SHOULD move over one to one, unchanged. Splitting it waits for a
  reason.
- One screen SHOULD NOT mix the old and the new design system.

## Done means

1. The registry holds the claims for its routes.
2. The rollout flag for it has been removed.
3. Its old routes, packages, tests and pipeline steps have been deleted.
4. Its `src/` holds no copy of code from a shared package.
5. Per MFE, dashboards show the shell served, the first mount, mount failures,
   client errors and auth failures.

## Risks to watch

- **Double mounts** the old shell keeps registering an MFE that the new one
  mounts.
- **Edge auth** a gap lets people in, or a bug logs them out. The stakes are
  highest here, so test this first.
- **Blank pages** come from a composition bug. The standalone template, fail
  open and the kill switch contain it.
- **Local drift** local work drifts away from how the edge behaves.
