# The upload key

Phones get the app signed by Google, with Google's own app signing key. The
upload key does one job: it shows Play that a bundle came from the developer.

## Find the key the project uses

```bash
grep -rnE 'signingConfigs|storeFile|keyAlias' --include='build.gradle*' . | grep -v /build/
grep -n signingKey -A3 android/twa-manifest.json 2>/dev/null; ls android/key.properties 2>/dev/null
ls ~/.android-keys/ 2>/dev/null; GH_PAGER=cat gh secret list
```

A key turned up? Use it, read its notes, and skip the section below.

## Make a key

```bash
dir=~/.android-keys/<repo-name>; mkdir -p "$dir" && chmod 700 "$dir"
pass=$(openssl rand -base64 24 | tr -d '/+=')
keytool -genkeypair -keystore "$dir/upload-key.jks" -alias upload -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass "$pass" -keypass "$pass" -dname "CN=<maker>, O=<maker>, C=<country code>"
```

Next, write `$dir/README.txt` and `chmod 600` it:

```text
app: <package name>
alias: upload
password: <the password>
sha256: <keytool -list -v -keystore upload-key.jks -storepass ... | grep SHA256>
```

- **Backup** ask the user to copy the folder to a password manager or another
  safe store. Losing the upload key means asking Play support for a reset.
- **Password** MUST stay out of the chat and out of the repo.
- **`.gitignore`** of the repo MUST list `*.jks`, `*.keystore` and
  `key.properties`.

## Sign in CI

Gradle reads the key from flags, so `build.gradle` carries no signing block
and no path:

```bash
./gradlew bundleRelease \
  -Pandroid.injected.signing.store.file="$RUNNER_TEMP/upload-key.jks" -Pandroid.injected.signing.key.alias=upload \
  -Pandroid.injected.signing.store.password="$ANDROID_KEYSTORE_PASSWORD" -Pandroid.injected.signing.key.password="$ANDROID_KEYSTORE_PASSWORD"
```

Load the key from that folder into the repo secrets:

```bash
base64 -i "$dir/upload-key.jks" | gh secret set ANDROID_KEYSTORE
sed -n 's/^password: //p' "$dir/README.txt" | gh secret set ANDROID_KEYSTORE_PASSWORD
```

In CI, a step decodes it with `echo "$ANDROID_KEYSTORE" | base64 -d > "$RUNNER_TEMP/upload-key.jks"`.

## Version codes

Every upload takes a higher `versionCode`. Before the CI build, set it from
the run number, and it rises by itself:

```bash
sed -i -E "s/^( *versionCode) [0-9]+$/\1 $GITHUB_RUN_NUMBER/" app/build.gradle
```

## Lost key

Play Console, Test and release, App integrity, Upload key: ask for a reset and
attach the certificate of a new key. The signing key stays the same, so users
see no difference.
