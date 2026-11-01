# A site as an Android app: Trusted Web Activity

A TWA shows the site full screen in Chrome. Changes to the site reach the app
with no new release. Bubblewrap MUST generate the Android project from the
site's web manifest.

## What the site needs first

- **Web manifest** it MUST hold `name`, `short_name`, `start_url`, `display: standalone`,
  `theme_color`, `background_color`, icons at 192 and 512 px, with one marked
  `maskable`.
- **Service worker** it MUST have an offline fallback page.
- **https** the site MUST serve it on the final domain. Changing the domain
  later takes a new app.

## Make the project

The agent MUST generate and build the project:

```bash
mkdir android && cd android
npx @bubblewrap/cli init --manifest "https://$d/manifest.webmanifest"
npx @bubblewrap/cli build
```

- **Questions** the agent MUST answer with the package name the user approved,
  the upload key path and the alias `upload` from `signing.md`. When
  Bubblewrap offers to fetch a JDK and the Android SDK, it SHOULD accept.
- **`.gitignore`** in `android/` MUST list `build/`, `.gradle/`, `*.aab`, `*.apk`,
  `*.idsig`, `local.properties`.
- **Commit** `twa-manifest.json` plus the Gradle project Bubblewrap generates
  MUST be committed.
- **A later change** of name, icon or colours MUST go in `twa-manifest.json`,
  then `npx @bubblewrap/cli update --skipVersionUpgrade`.

## assetlinks.json

The site MUST list the two keys, or an address bar appears in the app:

1. **Upload key** its SHA-256 MUST come from the key's notes.
2. **Play app signing key** its SHA-256 MUST come from Play Console, Test and
   release, App integrity, Play app signing. It appears after the first
   upload.

The file MUST follow this shape:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.acme.notes",
      "sha256_cert_fingerprints": ["<upload key SHA-256>", "<Play app signing SHA-256>"]
    }
  }
]
```

The site MUST serve the file at `https://$d/.well-known/assetlinks.json`:
status 200, JSON, no redirect, no bot challenge. The agent MUST then verify it:

```bash
curl -s "https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://$d&relation=delegate_permission/common.handle_all_urls" | jq '.statements[].target.androidApp'
```

The two fingerprints MUST appear. The phone keeps the old answer in cache, so
the tester MUST clear Chrome's data or reinstall the app before the next test.

## Ads in a TWA

Inside the app, AdSense MUST stay off. The `ads-setup` skill explains the way.
