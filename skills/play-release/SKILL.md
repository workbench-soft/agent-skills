---
name: play-release
description: 'Use when the user asks to publish an Android app on Google Play, upload an app bundle, set up internal testing, add testers, make an upload key, sign an AAB, wrap a PWA as a Trusted Web Activity with Bubblewrap, fix assetlinks.json, or upload to Play from CI, in any language: "put the app on Google Play", "send it to internal testing", "выложи в гугл плей", "залей на интернал тест". Locates the Android project or proposes a TWA for a PWA, finds or creates the upload key and keeps it outside the repo, builds a signed AAB with a higher version code, goes through Play Console in the browser with the user logging in, creates the app, uploads the bundle, rolls it out to internal testing, returns the tester link, and writes TODO.md with the tasks left for the user.'
---

# Release an Android app to Google Play internal testing

Put a signed bundle in Play Console and get it onto testers' phones through
the internal testing track.

## Logins and keys

- **Browser** drive whatever browser tool the agent has: the VS Code browser
  tools, or the `agent-browser` skill. Without one, hand the user the link and
  the clicks as numbered steps, one per line, and wait.
- **Login screen** have the user log in inside that window, and wait for
  "done". A password, a 2FA code or card details MUST NOT be typed by the agent.
- **Account forms** the developer sign-up, the $25 fee and the ID check are
  the user's to fill. The agent names the page and waits.
- **Keystore and passwords** MUST be kept out of the repo and the chat. They
  live in a folder outside the repo and in CI secrets.
- **Service account JSON** MUST stay out of commits. It goes into a CI secret,
  after which the local copy MAY be deleted.

## 1. Read the project

The repo rules MUST beat this skill. Start with `AGENTS.md`, `CLAUDE.md` and
the README, then locate the app:

```bash
ls android app pubspec.yaml capacitor.config.* android/twa-manifest.json 2>/dev/null
grep -rnE 'applicationId|versionCode|versionName|targetSdk|minSdk' --include='build.gradle*' . | grep -v /build/
```

1. **Kind** native Kotlin or Java, Flutter, React Native, Capacitor, or a
   Trusted Web Activity (TWA) made with Bubblewrap.
2. **Package name** the `applicationId`.
3. **Version** `versionCode` and `versionName`, and the way CI raises them.
4. **Target SDK** MUST reach the level Play requires today:
   `https://developer.android.com/google/play/requirements/target-sdk`.
5. **The work already there** a README section on Android, a signing config, a
   CI job.

No Android project, but the site is a PWA? Propose a TWA and wait for the
reply. If the user agrees, read [references/twa.md](references/twa.md).

## 2. Settle the package name

On Play, a package name can't change later. Show it to the user before the
first upload and wait for a yes.

- It SHOULD be the developer's domain backwards, followed by the app:
  `com.acme.notes`.
- `com.example`, or a name left from a template, MUST stay off Play.

## 3. Upload key

Read [references/signing.md](references/signing.md). Find the key the project
uses today, or create one, and keep it outside the repo.

## 4. Build the bundle

```bash
cd android && ./gradlew bundleRelease
keytool -printcert -jarfile app/build/outputs/bundle/release/app-release.aab | grep -E 'Owner|SHA256'
```

- The upload key MUST be what signs the bundle: the printed SHA-256 equals the
  one in the key's notes.
- `versionCode` MUST be above each bundle uploaded so far. Play turns down a
  repeat.
- Flutter builds with `flutter build appbundle`. React Native and Capacitor
  build in `android/` exactly as above.
- When a CI job builds the bundle already, that job SHOULD be the source:
  download its artifact instead of building another copy by hand.

## 5. Play Console

Read [references/play-console.md](references/play-console.md), then work
through it in the browser:

1. The developer account, or a wait while the user creates one.
2. Create the app.
3. Internal testing: the tester list, the bundle, the release notes, rollout.
4. Copy the tester link.

## 6. Finish a TWA

Until the site lists the key Play signs with, a TWA shows an address bar. Read
the assetlinks part of [references/twa.md](references/twa.md), add the Play
app signing key, deploy, and check the result.

## 7. Check on a phone

1. On an Android phone signed in with a tester email, the user opens the
   tester link and accepts.
2. Play installs the app. A first release may need an hour to appear.
3. The app starts and works. A TWA has no address bar.

## 8. Upload from CI, if asked

Later releases MAY go from CI directly to internal testing. Read
[references/upload-from-ci.md](references/upload-from-ci.md). The first bundle
MUST be uploaded by hand, since the Play API can't create an app.

## 9. Commit and record

- A change SHOULD get a commit of its own, in the repo's commit style: the
  package name, the signing config, the CI job, `assetlinks.json`.
- Before each commit, run the repo checks.
- Add or update the README section on Android, written per `writing-style`:
  the package name, the key's location, the CI secrets by name, the release
  steps.

## 10. Write TODO.md

`TODO.md` at the target repo root MUST hold each task this run leaves for the
user. Touch only the `## play-release` section, adding or updating it.

- **One task per line** a checkbox, the task, the place, and a date for a wait.
- **Production** the steps still needed before it are listed as well. Read
  the production note in [references/play-console.md](references/play-console.md).
- **Done tasks** come off once the user says so or Play Console shows it.
- **Secrets** keystore passwords and the service account JSON MUST be left
  out.

```markdown
## play-release

- [ ] Back up the upload key from `%USERPROFILE%\.android-keys\<repo-name>` to a password manager
- [ ] Open the tester link on an Android phone and accept: <link>
```

Commit it together with the README record.

## 11. Report back

1. The app in Play Console: name, package, link.
2. The internal testing version and the tester link.
3. The commits, a line for each.
4. The key's location, plus the reminder to back it up.
5. The `TODO.md` tasks, a line for each.

## Guardrails

- A release MUST stay off production, closed and open testing until the user
  names that track.
- An existing keystore MUST be kept as is, with no overwrite and no new one in
  its place.
- After the first upload, the package name MUST stay the same.
