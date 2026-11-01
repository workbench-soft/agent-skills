# MFE runtime

The edge MUST compose the document and the shell MUST compose the page. Both
MUST learn from the registry which MFE owns which route.

## The lifecycle

All MFEs MUST export one set of three functions from their entry. A bootstrap
package SHOULD generate them, so MFEs don't hand write their own:

```ts
export const { bootstrap, mount, unmount, rootClassList } = createMfeLifecycles({
  rootComponent: Root,
  errorFallback: RootFallback,
  initI18n, // bootstrap loads translations before the first mount
});
```

To mount an MFE, the shell MUST go through these steps:

1. The shell MUST look up its module and stylesheet URLs in the import map.
2. It MUST attach the stylesheet and set `rootClassList` on the container.
3. It MUST await `bootstrap()`.
4. It MUST call `mount(props)` with a stable name and the container node.
5. It MUST call `unmount(props)` and remove the stylesheet before the next
   MFE's mount.

- The container SHOULD be looked up again on every mount, since some MFEs mount
  into nodes that show up later.
- The shell MAY run this protocol on its own, without an orchestrator library.
  The lifecycle MUST remain the contract.

## The host contract

The host MUST pass these props to every MFE:

```ts
interface HostProvidedProps {
  eventBus: EventBus; // typed cross-MFE messages
  queryClient: QueryClient; // one cache for the page
  mountParcel: MountParcel; // mount a peer MFE inside a node the caller owns
}
```

- A `HOST_CONTRACT` constant SHOULD record the version of each shared library,
  such as the query core. An MFE MAY bundle that minor version or an earlier
  one.
- A library keeping one client per version MUST match the host's version
  exactly. Sentry is such a library.
- A lint check SHOULD fail once the lockfile gets ahead of `HOST_CONTRACT`.

The bootstrap package MUST give every MFE's tree the same set of providers:

```text
StrictMode > transport provider (host query client, sign out on 401) > event bus
  > i18n > UI providers > router (context: queryClient, transport) > routes
error boundary sits under i18n, so the fallback is translated
```

## The registry

Each MFE MUST have one entry, frozen, typed and written as data. The shell,
the edge and the legacy fallback MUST all read that one file:

```ts
{ name: "supply", repository: "org/web", owner: "team-supply", port: 3004,
  tailwindPrefix: "su", assets: { main: "src/main.ts", styles: "src/styles.css" },
  preload: undefined,                       // "always" for MFEs on every page
  content: { routes: [{ path: "/supply", subtree: true }], auth: "session",
             audience: [{ flag: "supply-mfe" }], pendingReservation: [{ flag: "supply-mfe" }] } }
```

The status of a route MUST decide who renders it:

| Status      | The MFE                           | The legacy app                  |
| ----------- | --------------------------------- | ------------------------------- |
| `active`    | Mounts                            | Stays out                       |
| `reserved`  | Waits, its flag is loading or off | Stays out, so it can't flash in |
| `unclaimed` | None                              | Takes the route                 |

- Claims MUST be plain data. A worker reads JSON, and a predicate function
  can't make it across that boundary.
- The parser MUST refuse two claims on the same path.
- `repository` MUST stop a repo from promoting another repo's MFE.

## The shell owns page-wide UI

- **Fixed slots** header, navigation and content MUST mount into fixed DOM
  ids, the same ids older apps mount into.
- **One writer** chrome state MUST sit on `<html data-chrome>`. MFEs MUST
  request changes through bus events, and only the shell writes.
- **Toasts** an MFE SHOULD put `show`, `update`, `close` on the bus. A toast
  MUST outlive its MFE, and its action button MUST go on unmount.
- **Banners** MUST appear one at a time, by priority, with dismissals stored
  per id.

## Shared dependencies

MFEs SHOULD share heavy libraries such as React through Module Federation.

- Compatible ranges SHOULD share a single copy, and a pin that isn't MAY fall
  back to a copy of its own.
- Remote URLs MUST be supplied at runtime from the source the import map uses
  (`registerRemotes`). URLs fixed at build time break previews and local
  overrides.
- Federation shares only code. Instances MUST keep arriving through props.
- With one or two shared libraries, import maps alone MAY be enough. Each such
  library then MUST get a hosted build, a map entry and a build set to exclude
  it.
