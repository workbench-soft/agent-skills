# The edge

Workers in front of the app MUST compose a document that is correct before the
first line of JavaScript runs.

## Who does what

The jobs SHOULD split this way:

| Piece           | Job                                                                        |
| --------------- | -------------------------------------------------------------------------- |
| Document worker | Resolves the route owner, checks auth, composes the HTML from its template |
| Assets worker   | Serves `/_mfe/*`: files from object storage, manifests, route claims       |
| Object storage  | Every built file, under a deploy key                                       |
| Key-value store | Build manifests, preview ids, route claims, the live manifest              |

A request SHOULD take this path:

```text
GET /supply/orders
  -> resolve the owner from the registry claims
  -> auth required and missing? redirect to login
  -> read the manifests, lay any preview over them
  -> write the import map, preloads, and <html lang, color-scheme, data-chrome> from one cookie
  -> stream the HTML; the shell mounts the owner
```

## Rules for the document

- **Fail open on composition** on an error the worker MUST serve the plain
  template, which renders a usable page by itself.
- **Fail closed on auth** a protected route without a session MUST redirect to
  login, with no fallback.
- **Pre-paint values** one small cookie supplies theme, language and chrome
  state. Each value MUST be checked against a fixed set before the worker
  writes it into the HTML.
- **Environment values** MUST be filled in at composition time, not by a build
  per environment.
- **Audience** a user outside an MFE's audience MUST get no import map entry,
  preload or fetch for it.

When a worker takes over an older document path, it MUST keep that path's
security headers, CSP, cookie filtering and region rules. A port that moves
routing alone loses them.

## Assets and caching

The template SHOULD hold placeholders like these:

```html
<link data-mfe-app="supply" data-mfe-asset="styles" rel="stylesheet" />
<script type="module" data-mfe-app="shell" data-mfe-asset="main"></script>
```

- The worker MUST swap every placeholder for the hashed URL from the live
  build. The shell's files SHOULD arrive the same way, so previews cover it.
- An MFE present on every page SHOULD get `modulepreload` links.
- Hashed files SHOULD be cached forever. The document SHOULD revalidate,
  using an ETag made from the template and each input the worker resolved.

## Previews and local work

- **Preview** `?preview-id=<id>` lays the build manifest of a PR over
  production and sets a cookie, and `?preview-id=` clears it. Several PRs MAY
  stack through a list of ids.
- **Marked** `<html data-mfe-preview>` SHOULD tell client code a preview is on.
- **Local override** a cookie MAY name the MFEs to load from
  `https://localhost:<registry port>`. The rest MUST stay on the deployed build.
- **Same path locally** `wrangler dev` SHOULD put the real worker in front of
  the dev server, so local work behaves like production.
- **Worker previews** a PR changing a worker MUST get a preview deploy of it.

## Deploy and promote

A deploy SHOULD run these stages:

```text
PR      build affected MFEs -> upload files under the commit -> build manifest + preview id to KV
        -> e2e against the preview -> PR comment with preview links
merge   promote: asset paths, live manifests, route claims to KV; deploy workers
```

- A single build MUST serve all environments, and promotion MUST make it live.
- A rollback SHOULD promote an older build, which brings its files, manifests
  and claims back as one.
- Other repos MAY ship MFEs into the page. They MUST build with the published
  config packages and leave the stores to the platform's deploy and promote
  workflows.

## Rolling out a new document

- The worker choosing the document SHOULD make the call once per session. It
  SHOULD check a query parameter, then the saved cookie, then a sticky
  percentage. A kill switch MUST win over all three.
- A switch for each MFE SHOULD NOT exist. It reloads the document during
  internal navigation and throws away the query cache.
- Before the percentage goes up, the new path's Core Web Vitals SHOULD match
  the old path's.
