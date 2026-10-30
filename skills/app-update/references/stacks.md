# Stack notes

Open the section for the repo's stack. APIs shift between releases, so check
the docs for the version the repo pins before you call one.

## Expo

- **Version** `nativeApplicationVersion` from `expo-application`.
- **Back in front** `AppState.addEventListener('change')` from `react-native`,
  on `'active'`. The first launch doesn't trigger it, so the start check stays.
- **Download** `File.downloadFileAsync(url, file, { signal, onProgress })` from
  `expo-file-system`. Cancelling goes through the `AbortController` signal.
- **Installer** `getContentUriAsync` from `expo-file-system/legacy`, followed
  by `startActivityAsync('android.intent.action.VIEW', ...)` from
  `expo-intent-launcher`, passing the APK MIME type and the read grant flag.
- **Notifications** `expo-notifications`: a channel, `scheduleNotificationAsync`
  without a time trigger, and `addNotificationResponseReceivedListener` to
  catch the tap. The tap handler reads a `data.kind` that the update code sets.
- **Manifest** list the permissions in `app.config.ts` under
  `android.permissions`.

## Capacitor

- **Native plugin** a small plugin in Java or Kotlin handles the download and
  the installer: `info`, `downloaded`, `install`, `cancel`, `clean`, plus a
  `progress` event. Put it in a GitHub build flavor. The Play flavor then lacks
  the plugin, and `Capacitor.isPluginAvailable('Update')` hides the button.
- **Download** `HttpURLConnection` on a background thread writes to the cache
  folder and emits `progress` every 100 KB. `cancel` shuts the stream.
- **Installer** `FileProvider.getUriForFile`, followed by an `ACTION_VIEW`
  intent carrying `FLAG_GRANT_READ_URI_PERMISSION`.
- **Notifications** `@capacitor/local-notifications`, and
  `localNotificationActionPerformed` to catch the tap.
- **Back in front** `App.addListener('resume')` from `@capacitor/app`. A web
  build that lacks the plugin MAY listen to `visibilitychange` instead.

## Native Kotlin

- **Download** `HttpURLConnection` inside a coroutine on `Dispatchers.IO`. The
  progress goes in a `StateFlow` that Compose or the views collect.
- **Notifications** `NotificationCompat`, with a `PendingIntent` pointing at
  the installer intent. From Android 13 on, request `POST_NOTIFICATIONS` at run
  time.
- **Back in front** `onStart` of the main activity. `onResume` fires as well
  when a dialog or the permission prompt closes, so it checks more than needed.

## Tauri desktop

- **Plugin** `tauri-plugin-updater` reads a `latest.json` on the release and
  passes `Started`, `Progress` and `Finished` events to the download callback.
  The release workflow MUST sign the bundles and upload `latest.json`.
- **Notifications** `tauri-plugin-notification`.
- **Back in front** the window focus event: `onFocusChanged` from
  `@tauri-apps/api/window`, on `focused: true`.
- **Android build** the updater plugin works on desktop only. The Android app
  follows the Native Kotlin or Capacitor notes.

## Trusted Web Activity or WebView wrapper

- **Web content** comes from the site, so deploying the site updates the
  screens. A new APK is needed only when the wrapper changes.
- **Wrapper update** use the Native Kotlin notes when the APK ships outside
  Play. A wrapper that ships on Play alone needs no update code.
