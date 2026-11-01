---
name: play-release
description: 'Use when the user asks to publish an Android app on Google Play, upload an app bundle, set up internal testing, add testers, make an upload key, sign an AAB, wrap a PWA as a Trusted Web Activity with Bubblewrap, fix assetlinks.json, or upload to Play from CI, in any language: "put the app on Google Play", "send it to internal testing", "выложи в гугл плей", "залей на интернал тест". Locates the Android project or proposes a TWA for a PWA, finds or creates the upload key and keeps it outside the repo, builds a signed AAB with a higher version code, goes through Play Console in the browser with the user logging in, creates the app, uploads the bundle, rolls it out to internal testing, returns the tester link, and writes TODO.md with the tasks left for the user.'
---

# Release an Android app to Google Play internal testing

The agent MUST put a signed bundle in Play Console and get it onto testers'
phones through the internal testing track.

## Logins and keys

- **Browser** the agent MUST drive whatever browser tool it has: the VS Code
  browser tools, or the `agent-browser` skill. Without one, it MUST hand the
  user the link and the clicks as numbered steps, one per line, and wait.
- **Login screen** the user MUST log in inside that window, and the agent MUST
  wait for "done". A password, a 2FA code or card details MUST NOT be typed by
  the agent.
- **Account forms** the developer sign-up, the $25 fee and the ID check MUST
  be left to the user. The agent MUST name the page and wait.
- **Keystore and passwords** MUST be kept out of the repo and the chat. They
  MUST live in a folder outside the repo and in CI secrets.
- **Service account JSON** MUST stay out of commits. It MUST go into a CI
  secret, after which the local copy MAY be deleted.

## 1. Read the project

The repo rules MUST beat this skill. The agent MUST start with `AGENTS.md`,
`CLAUDE.md` and the README, then locate the app:

```bash
ls android app pubspec.yaml capacitor.config.* android/twa-manifest.json 2>/dev/null
grep -rnE 'applicationId|versionCode|versionName|targetSdk|minSdk' --include='build.gradle*' . | grep -v /build/
```

1. **Kind** the agent MUST name it: native Kotlin or Java, Flutter, React
   Native, Capacitor, or a Trusted Web Activity (TWA) made with Bubblewrap.
2. **Package name** the agent MUST read the `applicationId`.
3. **Version** the agent MUST read `versionCode` and `versionName`, and the way
   CI raises them.
4. **Target SDK** MUST reach the level Play requires today:
   `https://developer.android.com/google/play/requirements/target-sdk`.
5. **The work already there** the agent MUST reuse a README section on
   Android, a signing config, a CI job.

With no Android project but a PWA site, the agent SHOULD propose a TWA and
MUST wait for the reply. If the user agrees, the agent MUST read
[references/twa.md](references/twa.md).

## 2. Settle the package name

On Play, a package name can't change later. The agent MUST show it to the user
before the first upload and wait for a yes.

- It SHOULD be the developer's domain backwards, followed by the app:
  `com.acme.notes`.
- `com.example`, or a name left from a template, MUST stay off Play.

## 3. Upload key

The agent MUST read [references/signing.md](references/signing.md). It MUST
find the key the project uses today, or create one, and keep it outside the
repo.

## 4. Build the bundle

The agent MUST build and inspect the bundle like this:

```bash
cd android && ./gradlew bundleRelease
keytool -printcert -jarfile app/build/outputs/bundle/release/app-release.aab | grep -E 'Owner|SHA256'
```

- The upload key MUST be what signs the bundle: the printed SHA-256 equals the
  one in the key's notes.
- `versionCode` MUST be above each bundle uploaded so far. Play turns down a
  repeat.
- Flutter MUST build with `flutter build appbundle`. React Native and
  Capacitor MUST build in `android/` exactly as above.
- When a CI job builds the bundle already, that job SHOULD be the source:
  download its artifact instead of building another copy by hand.

## 5. Play Console

The agent MUST read [references/play-console.md](references/play-console.md),
then work through it in the browser:

1. The agent MUST find the developer account, or wait while the user creates
   one.
2. The agent MUST create the app.
3. The agent MUST set up internal testing: the tester list, the bundle, the
   release notes, rollout.
4. The agent MUST copy the tester link.

## 6. Finish a TWA

Until the site lists the key Play signs with, a TWA shows an address bar. The
agent MUST read the assetlinks part of [references/twa.md](references/twa.md),
add the Play app signing key, deploy, and check the result.

## 7. Check on a phone

1. On an Android phone signed in with a tester email, the user MUST open the
   tester link and accept.
2. Play MUST install the app. A first release MAY need an hour to appear.
3. The app MUST start and work. A TWA MUST show no address bar.

## 8. Upload from CI, if asked

Later releases MAY go from CI directly to internal testing. The agent MUST read
[references/upload-from-ci.md](references/upload-from-ci.md). The first bundle
MUST be uploaded by hand, since the Play API can't create an app.

## 9. Commit and record

- A change SHOULD get a commit of its own, in the repo's commit style: the
  package name, the signing config, the CI job, `assetlinks.json`.
- Before each commit, the agent MUST run the repo checks.
- The agent MUST add or update the README section on Android, written per
  `writing-style`: the package name, the key's location, the CI secrets by
  name, the release steps.

## 10. Write TODO.md

`TODO.md` at the target repo root MUST hold each task this run leaves for the
user. The agent MUST touch only the `## play-release` section, adding or
updating it.

- **One task per line** each line MUST hold a checkbox, the task, the place,
  and a date for a wait.
- **Production** the steps still needed before it MUST be listed as well. The
  agent MUST read the production note in
  [references/play-console.md](references/play-console.md).
- **Done tasks** MUST come off once the user says so or Play Console shows it.
- **Secrets** keystore passwords and the service account JSON MUST be left
  out.

The section SHOULD read like this:

```markdown
## play-release

- [ ] Back up the upload key from `%USERPROFILE%\.android-keys\<repo-name>` to a password manager
- [ ] Open the tester link on an Android phone and accept: <link>
```

The agent MUST commit it together with the README record.

## 11. Report back

1. The answer MUST name the app in Play Console: name, package, link.
2. It MUST give the internal testing version and the tester link.
3. It MUST list the commits, a line for each.
4. It MUST give the key's location, plus the reminder to back it up.
5. It MUST list the `TODO.md` tasks, a line for each.

## Guardrails

- A release MUST stay off production, closed and open testing until the user
  names that track.
- An existing keystore MUST be kept as is, with no overwrite and no new one in
  its place.
- After the first upload, the package name MUST stay the same.
