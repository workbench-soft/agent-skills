# Play build split, per stack

Whatever the stack, the Play bundle MUST end up without update code, a
GitHub URL or `REQUEST_INSTALL_PACKAGES`. The commands in section 4 MUST
verify it.

## Expo

- **Flag** `app.config.ts` MUST read `PLAY=1` and set `extra.store` for the
  app.
- **Permission**
  `android.blockedPermissions: ['android.permission.REQUEST_INSTALL_PACKAGES']`
  when `PLAY=1`. Any library MAY bring it back in its own manifest, so the block
  MUST stay even when the app doesn't use it directly.
- **Code** every update module MUST get a `.play.ts` twin with the same
  exports and empty bodies. With `PLAY=1`, `metro.config.js` MUST move
  `play.ts` and `play.tsx` to the front of `resolver.sourceExts`, so Metro
  bundles the stubs:

```js
if (process.env.PLAY === "1")
  config.resolver.sourceExts = ["play.ts", "play.tsx", ...config.resolver.sourceExts];
```

- **Stubs** `latest-release.play.ts` and `UpdateButton.play.tsx` MUST return
  null, and `install-update.play.ts` MUST hold the store at null.
  A file outside the swapped ones MUST NOT import `expo-intent-launcher`.
- **Bundle check** the JS lands in `base/assets/index.android.bundle`, so the
  `strings` grep in section 4 MUST already cover it.

## Capacitor

- **Flavors** `github` and `play` MUST sit in `android/app/build.gradle`,
  under a single `flavorDimensions 'store'`.
- **Code** `android/app/src/github/` MUST hold the update plugin, its
  FileProvider and the permission. The `play` source set MUST hold none of
  the three.
- **JS** both flavors share one web bundle. It MUST reach the plugin through
  `Capacitor.isPluginAvailable('Update')`, and MUST NOT contain the GitHub URL.
  The URL MUST belong to the native plugin, which keeps it out of the Play
  bundle.
- **Build** `./gradlew bundlePlayRelease` MUST make the Play bundle and
  `assembleGithubRelease` MUST make the APK.

## Native Kotlin

- **Flavors** they MUST match Capacitor: `src/github/` holds the update
  package, the receiver and the permission.
- **Seam** `src/main` MUST talk to an `Updates` interface. The real one MUST
  sit in `src/github` and an empty one in `src/play`, chosen by a class of
  the same name in each source set.

## Tauri

- **Desktop** `tauri-plugin-updater` MUST stay out of the App Store and
  Microsoft Store builds: it SHOULD sit behind a Cargo feature `updater`,
  switched off for the store build.
- **Android** the agent MUST follow the Native Kotlin notes.

## WebView or TWA wrapper

- **Play only** when a wrapper ships through Play alone, it MUST get neither
  a split nor update code.
