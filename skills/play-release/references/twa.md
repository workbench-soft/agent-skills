# A site as an Android app: Trusted Web Activity

A TWA shows the site full screen in Chrome. Changes to the site reach the app
with no new release. Bubblewrap generates the Android project from the site's
web manifest.

## What the site needs first

- **Web manifest** `name`, `short_name`, `start_url`, `display: standalone`,
  `theme_color`, `background_color`, icons at 192 and 512 px, with one marked
  `maskable`.
- **Service worker** that has an offline fallback page.
- **https** on the final domain. Changing the domain later takes a new app.

## Make the project

```bash
mkdir android && cd android
npx @bubblewrap/cli init --manifest "https://$d/manifest.webmanifest"
npx @bubblewrap/cli build
```

- **Questions** answer with the package name the user approved, the upload
  key path and the alias `upload` from `signing.md`. When Bubblewrap offers to
  fetch a JDK and the Android SDK, accept.
- **`.gitignore`** in `android/`: `build/`, `.gradle/`, `*.aab`, `*.apk`,
  `*.idsig`, `local.properties`.
- **Commit** `twa-manifest.json` plus the Gradle project Bubblewrap generates.
- **A later change** of name, icon or colours: edit `twa-manifest.json`, then
  run `npx @bubblewrap/cli update --skipVersionUpgrade`.

## assetlinks.json

The site MUST list the two keys, or an address bar appears in the app:

1. **Upload key** SHA-256 taken from the key's notes.
2. **Play app signing key** SHA-256 from Play Console, Test and release, App
   integrity, Play app signing. It appears after the first upload.

```json
[{ "relation": ["delegate_permission/common.handle_all_urls"],
   "target": { "namespace": "android_app", "package_name": "com.acme.notes",
     "sha256_cert_fingerprints": ["<upload key SHA-256>", "<Play app signing SHA-256>"] } }]
```

Serve the file at `https://$d/.well-known/assetlinks.json`: status 200, JSON,
no redirect, no bot challenge. Then verify it:

```bash
curl -s "https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://$d&relation=delegate_permission/common.handle_all_urls" | jq '.statements[].target.androidApp'
```

The two fingerprints MUST appear. The phone keeps the old answer in cache, so
clear Chrome's data or reinstall the app before the next test.

## Ads in a TWA

Inside the app, AdSense MUST stay off. The `ads-setup` skill explains the way.
