# Play build split, per stack

Whatever the stack, the Play bundle ends up without update code, a GitHub URL
or `REQUEST_INSTALL_PACKAGES`. The commands in section 4 verify it.

## Expo

- **Flag** `app.config.ts` reads `PLAY=1` and sets `extra.store` for the app.
- **Permission** `android.blockedPermissions: ['android.permission.REQUEST_INSTALL_PACKAGES']`
  when `PLAY=1`. Any library MAY bring it back in its own manifest, so the
  block MUST stay even when the app doesn't use it directly.
- **Code** every update module gets a `.play.ts` twin with the same exports
  and empty bodies. With `PLAY=1`, `metro.config.js` moves `play.ts` and
  `play.tsx` to the front of `resolver.sourceExts`, and Metro bundles the stubs:

```js
if (process.env.PLAY === "1")
  config.resolver.sourceExts = ["play.ts", "play.tsx", ...config.resolver.sourceExts];
```

- **Stubs** `latest-release.play.ts` and `UpdateButton.play.tsx` return null,
  and `install-update.play.ts` holds the store at null.
  A file outside the swapped ones MUST NOT import `expo-intent-launcher`.
- **Bundle check** the JS lands in `base/assets/index.android.bundle`, which
  the `strings` grep in section 4 already reads.

## Capacitor

- **Flavors** `github` and `play` sit in `android/app/build.gradle`, under a
  single `flavorDimensions 'store'`.
- **Code** `android/app/src/github/` holds the update plugin, its FileProvider
  and the permission. The `play` source set holds none of the three.
- **JS** both flavors share one web bundle. It MUST reach the plugin through
  `Capacitor.isPluginAvailable('Update')`, and MUST NOT contain the GitHub URL.
  The URL belongs to the native plugin, which keeps it out of the Play bundle.
- **Build** `./gradlew bundlePlayRelease` makes the Play bundle and
  `assembleGithubRelease` makes the APK.

## Native Kotlin

- **Flavors** same as Capacitor: `src/github/` holds the update package, the
  receiver and the permission.
- **Seam** `src/main` talks to an `Updates` interface. The real one sits in
  `src/github` and an empty one in `src/play`, chosen by a class of the same
  name in each source set.

## Tauri

- **Desktop** `tauri-plugin-updater` MUST stay out of the App Store and
  Microsoft Store builds: put it behind a Cargo feature `updater`, switched off
  for the store build.
- **Android** follow the Native Kotlin notes.

## WebView or TWA wrapper

- **Play only** when a wrapper ships through Play alone, it needs neither a
  split nor update code.
