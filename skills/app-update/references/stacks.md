# Stack notes

The agent MUST open the section for the repo's stack. APIs shift between
releases, so it MUST check the docs for the version the repo pins before it
calls one.

## Expo

- **Version** the app SHOULD read `nativeApplicationVersion` from
  `expo-application`.
- **Back in front** it SHOULD use `AppState.addEventListener('change')` from
  `react-native`, on `'active'`. The first launch doesn't trigger it, so the
  start check MUST stay.
- **Download** it SHOULD use
  `File.downloadFileAsync(url, file, { signal, onProgress })` from
  `expo-file-system`. Cancelling MUST go through the `AbortController` signal.
- **Installer** it SHOULD call `getContentUriAsync` from
  `expo-file-system/legacy`, then
  `startActivityAsync('android.intent.action.VIEW', ...)` from
  `expo-intent-launcher`, with the APK MIME type and the read grant flag.
- **Notifications** it SHOULD use `expo-notifications`: a channel,
  `scheduleNotificationAsync` without a time trigger, and
  `addNotificationResponseReceivedListener` for the tap, which MUST read a
  `data.kind` that the update code sets.
- **Manifest** the permissions MUST sit in `app.config.ts` under
  `android.permissions`.

## Capacitor

- **Native plugin** a small plugin in Java or Kotlin SHOULD handle the
  download and the installer: `info`, `downloaded`, `install`, `cancel`,
  `clean`, plus a `progress` event. It MUST sit in a GitHub build flavor, so
  `Capacitor.isPluginAvailable('Update')` hides the button in the Play one.
- **Download** `HttpURLConnection` on a background thread SHOULD write to the
  cache folder and emit `progress` every 100 KB. `cancel` MUST shut the stream.
- **Installer** it MUST call `FileProvider.getUriForFile`, then send an
  `ACTION_VIEW` intent carrying `FLAG_GRANT_READ_URI_PERMISSION`.
- **Notifications** it SHOULD use `@capacitor/local-notifications`, and
  `localNotificationActionPerformed` to catch the tap.
- **Back in front** it SHOULD use `App.addListener('resume')` from
  `@capacitor/app`. A web build that lacks the plugin MAY listen to
  `visibilitychange` instead.

## Native Kotlin

- **Download** it SHOULD use `HttpURLConnection` in a coroutine on
  `Dispatchers.IO`, with the progress in a `StateFlow` the UI collects.
- **Notifications** it SHOULD use `NotificationCompat`, with a
  `PendingIntent` to the installer intent. From Android 13 on, it MUST
  request `POST_NOTIFICATIONS` at run time.
- **Back in front** it SHOULD hook `onStart` of the main activity. `onResume`
  also fires when a dialog or the permission prompt closes, so it checks too
  often.

## Tauri desktop

- **Plugin** `tauri-plugin-updater` SHOULD read `latest.json` and pass
  `Started`, `Progress` and `Finished` to the download callback. The release
  workflow MUST sign the bundles and upload `latest.json`.
- **Notifications** it SHOULD use `tauri-plugin-notification`.
- **Back in front** it SHOULD use `onFocusChanged` from
  `@tauri-apps/api/window`, on `focused: true`.
- **Android build** the updater plugin works on desktop only, so the Android
  app MUST follow the Native Kotlin or Capacitor notes.

## Trusted Web Activity or WebView wrapper

- **Web content** deploying the site updates the screens, so a new APK MUST
  ship only when the wrapper changes.
- **Wrapper update** an APK that ships outside Play MUST follow the Native
  Kotlin notes. A wrapper that ships on Play alone MUST get no update code.
