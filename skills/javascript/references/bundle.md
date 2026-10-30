# Bundle rules

These apply to code shipped to a browser. Every rule trims what the first screen
must download and parse.

## Import from the file, not the index

The index file of a big library re-exports all of its modules. A single icon
imported that way can drag in thousands of modules, which slows both the dev
server and the build.

- **Name the file** imports from a big icon or component library SHOULD point
  at the file.
- **Framework fix** where the framework has one, such as Next.js
  `optimizePackageImports`, it SHOULD win, and the imports stay unchanged.
- **Types** a deep path SHOULD be checked for types first. Some packages ship
  none for it, and under `strict` the import becomes `any`.

```ts
// Bad: loads every component in the package
import { Button } from "@mui/material";
```

```ts
// Good
import Button from "@mui/material/Button";
```

Packages with this problem: `lucide-react`, `@mui/material`,
`@mui/icons-material`, `react-icons`, `lodash`, `date-fns`, `rxjs`.

## Keep import paths literal

When the bundler can't read a path at build time, it pulls in each file the
path might match.

```ts
// Bad: the bundler can't tell which file loads
const page = await import(PAGE_PATHS[name]);
```

```ts
// Good: each path is literal
const PAGES = { home: () => import("./pages/home"), settings: () => import("./pages/settings") };
const page = await PAGES[name]();
```

Server code that Next.js bundles SHOULD spell out `fs` paths the same way.
`path.join(root, "content/" + kind)` grows the set of files the build traces.

## Load heavy features on use

- **On open** a heavy feature, such as a code editor, SHOULD load with
  `import()` once the user opens it.
- **Head start** loading SHOULD begin on hover or focus of the button that
  opens it, so the click waits less.
- **Failure** a failed `import()` SHOULD show an error and a retry, since a
  chunk from the last deploy may be gone from the server.

```ts
const loadEditor = () => import("./editor");
button.addEventListener("pointerenter", loadEditor, { once: true });
button.addEventListener("click", async () => (await loadEditor()).open());
```

## Third party scripts

- **Late** analytics and chat widgets SHOULD load once the page is interactive:
  a `defer` script, or `import()` after the `load` event.
- **Early** error tracking MAY load first, since it must catch errors at start.
