# Upload to internal testing from CI

CI hands the bundle to the Play Developer API. The upload runs as a service
account, which is a robot Google account.

## Service account

1. Go to `https://console.cloud.google.com`, have the user log in, then choose
   or create a project.
2. Turn on the Google Play Android Developer API.
3. IAM & Admin, Service Accounts, Create. Call it `play-upload`, with no Cloud
   roles.
4. Keys, Add key, JSON. The browser downloads the file.

With `gcloud` logged in, three commands do the same:

```bash
gcloud services enable androidpublisher.googleapis.com --project "$p"
gcloud iam service-accounts create play-upload --project "$p"
gcloud iam service-accounts keys create key.json --iam-account "play-upload@$p.iam.gserviceaccount.com"
```

Key creation MAY be blocked by an organization policy. Tell the user and stop
this section: the way out is Workload Identity Federation, and an admin
decides on it.

## Grant it the app

Play Console, Users and permissions, Invite new users:

1. **Email** the `client_email` of the service account, from the JSON.
2. **App permissions** add the app and tick Release to testing tracks.
3. **Invite**. A grant may need up to a day to take effect, so after a 403 on
   the first run a retry SHOULD come later.

## The secret and the job

```bash
gh secret set PLAY_SERVICE_ACCOUNT_JSON < key.json && rm key.json
```

```yaml
# A commit, since a moved tag would get the publisher key.
- uses: r0adkll/upload-google-play@e738b9dd8f2476ea806d921b64aacd24f34515a5 # v1.1.5
  with:
    serviceAccountJsonPlainText: ${{ secrets.PLAY_SERVICE_ACCOUNT_JSON }}
    packageName: com.acme.notes
    releaseFiles: android/app/build/outputs/bundle/release/app-release.aab
    track: internal
    status: completed
```

- **Where** following the signed build step, and only on pushes to the default
  branch.
- **Version code** taken from the run number, so each push uploads a bigger
  one.
- **Other tools** Gradle Play Publisher and fastlane `supply` do this job too.
  The tool the repo has already SHOULD be the one used.
