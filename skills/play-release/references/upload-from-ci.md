# Upload to internal testing from CI

CI MUST hand the bundle to the Play Developer API. The upload runs as a service
account, which is a robot Google account.

## Service account

1. The agent MUST go to `https://console.cloud.google.com`, have the user log
   in, then choose or create a project.
2. The agent MUST turn on the Google Play Android Developer API.
3. In IAM & Admin, Service Accounts, Create, the agent MUST call it
   `play-upload`, with no Cloud roles.
4. In Keys, Add key, JSON, the agent MUST create a key. The browser downloads
   the file.

With `gcloud` logged in, the agent MAY run three commands instead:

```bash
gcloud services enable androidpublisher.googleapis.com --project "$p"
gcloud iam service-accounts create play-upload --project "$p"
gcloud iam service-accounts keys create key.json --iam-account "play-upload@$p.iam.gserviceaccount.com"
```

Key creation MAY be blocked by an organization policy. The agent MUST then
tell the user and stop this section: the way out is Workload Identity
Federation, and an admin decides on it.

## Grant it the app

The agent MUST open Play Console, Users and permissions, Invite new users:

1. **Email** MUST be the `client_email` of the service account, from the JSON.
2. **App permissions** the agent MUST add the app and tick Release to testing
   tracks.
3. **Invite** the agent MUST send it. A grant MAY need up to a day to take effect, so after a 403 on
   the first run a retry SHOULD come later.

## The secret and the job

The agent MUST store the key as a secret, then add the job:

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

- **Where** the step MUST follow the signed build step, and run only on pushes
  to the default branch.
- **Version code** it SHOULD come from the run number, so each push uploads a
  bigger one.
- **Other tools** Gradle Play Publisher and fastlane `supply` MAY do this job
  too. The tool the repo has already SHOULD be the one used.
