# Moving off a legacy app

The new shell SHOULD claim routes one by one. Any route not yet claimed MUST
stay with the old app, so the move needs no big cutover.

## The legacy subshell

- The new shell MUST mount the old app a single time in its content slot. From
  there the old app serves each route still unclaimed.
- The old app MAY keep its own runtime and libraries. New work MUST go
  elsewhere.
- In embedded mode the old app MUST drop its registration of the MFEs the new
  shell mounts, or each of them mounts twice.
- Two query caches on different major versions MAY stay in sync through a
  small bridge that replays invalidation keys.
- The DOM ids the old app mounts into MUST remain unchanged.
- Once the last route has moved, one change SHOULD remove the subshell.

## How a domain moves

A domain SHOULD move in this order:

```text
generate the MFE -> port the screens onto the target stack -> use shared packages,
ask for the missing ones -> claim the routes in the registry -> roll out behind a flag
-> delete the old code
```

- A domain SHOULD move over one to one, unchanged. Splitting it SHOULD wait
  for a reason.
- One screen SHOULD NOT mix the old and the new design system.

## Done means

A domain's move MUST count as done only when all of these hold:

1. The registry MUST hold the claims for its routes.
2. The rollout flag for it MUST be gone.
3. Its old routes, packages, tests and pipeline steps MUST be deleted.
4. Its `src/` MUST hold no copy of code from a shared package.
5. Per MFE, dashboards MUST show the shell served, the first mount, mount
   failures, client errors and auth failures.

## Risks to watch

- **Double mounts** the agent MUST check that the old shell stops registering
  an MFE that the new one mounts.
- **Edge auth** a gap lets people in, or a bug logs them out. The stakes are
  highest here, so this MUST be tested first.
- **Blank pages** come from a composition bug. The standalone template, fail
  open and the kill switch MUST be in place to contain it.
- **Local drift** local work SHOULD run through the edge, or it drifts away
  from how the edge behaves.
