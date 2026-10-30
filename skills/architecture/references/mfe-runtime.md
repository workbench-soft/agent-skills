# MFE runtime

The document is composed at the edge and the page is composed by the shell.
Both learn from the registry which MFE owns which route.

## The lifecycle

All MFEs export one set of three functions from their entry. A bootstrap
package generates them, so MFEs don't hand write their own.

```ts
export const { bootstrap, mount, unmount, rootClassList } = createMfeLifecycles({
  rootComponent: Root,
  errorFallback: RootFallback,
  initI18n,                       // bootstrap loads translations before the first mount
});
```

To mount an MFE, the shell goes through these steps:

1. Look up its module and stylesheet URLs in the import map.
2. Attach the stylesheet, and set `rootClassList` on the container.
3. Await `bootstrap()`.
4. Call `mount(props)`, passing a stable name and the container node.
5. Call `unmount(props)` ahead of the next MFE's mount, and remove its
   stylesheet.

- The container SHOULD be looked up again on every mount, since some MFEs mount
  into nodes that show up later.
- The shell MAY run this protocol on its own, without an orchestrator library.
  The lifecycle remains the contract.

## The host contract

```ts
interface HostProvidedProps {
  eventBus: EventBus;          // typed cross-MFE messages
  queryClient: QueryClient;    // one cache for the page
  mountParcel: MountParcel;    // mount a peer MFE inside a node the caller owns
}
```

- A `HOST_CONTRACT` constant SHOULD record the version of each shared library,
  such as the query core. An MFE MAY bundle that minor version or an earlier
  one.
- A library keeping one client per version MUST match the host's version
  exactly. Sentry is such a library.
- A lint check SHOULD fail once the lockfile gets ahead of `HOST_CONTRACT`.

The bootstrap package gives every MFE's tree the same set of providers:

```text
StrictMode > transport provider (host query client, sign out on 401) > event bus
  > i18n > UI providers > router (context: queryClient, transport) > routes
error boundary sits under i18n, so the fallback is translated
```

## The registry

Each MFE has one entry, frozen, typed and written as data. The shell, the edge
and the legacy fallback all read that one file.

```ts
{ name: "supply", repository: "org/web", owner: "team-supply", port: 3004,
  tailwindPrefix: "su", assets: { main: "src/main.ts", styles: "src/styles.css" },
  preload: undefined,                       // "always" for MFEs on every page
  content: { routes: [{ path: "/supply", subtree: true }], auth: "session",
             audience: [{ flag: "supply-mfe" }], pendingReservation: [{ flag: "supply-mfe" }] } }
```

| Status | The MFE | The legacy app |
| --- | --- | --- |
| `active` | Mounts | Stays out |
| `reserved` | Waits, its flag is loading or off | Stays out, so it can't flash in |
| `unclaimed` | None | Takes the route |

- Claims MUST be plain data. A worker reads JSON, and a predicate function
  can't make it across that boundary.
- The parser MUST refuse two claims on the same path.
- `repository` prevents a repo from promoting an MFE that belongs to another
  repo.

## The shell owns page-wide UI

- **Fixed slots** header, navigation and content mount into fixed DOM ids,
  the same ids older apps mount into.
- **One writer** chrome state sits on `<html data-chrome>`. MFEs request
  changes through bus events, the shell decides and writes, and any MFE can
  read.
- **Toasts** an MFE puts `show`, `update`, `close` on the bus. A toast lives on
  after the MFE that raised it, and its action button is removed on unmount.
- **Banners** appear one at a time, by priority. Dismissals are stored per id.

## Shared dependencies

Module Federation lets MFEs share heavy libraries such as React.

- Ranges that are compatible share a single copy, and a pin that isn't falls
  back to a copy of its own.
- Remote URLs MUST be supplied at runtime from the source the import map uses
  (`registerRemotes`). URLs fixed at build time break previews and local
  overrides.
- Federation shares only code. Instances keep arriving through props.
- With one or two shared libraries, import maps alone MAY be enough. Each such
  library then needs a hosted build, a map entry and a build set to exclude
  it.
