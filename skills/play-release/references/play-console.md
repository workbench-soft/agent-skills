# Play Console, from account to internal testing

## Developer account

The agent MUST go to `https://play.google.com/console` and have the user log
in. Without an account, the user MUST sign up at
`https://play.google.com/console/signup`:

- **Personal** a person's name MUST show on the store, with an ID check.
- **Organization** a company name MUST show on the store, and it MUST have a
  D-U-N-S number.
- **Fee** a single $25 card payment MUST be made by the user.
- **Wait** an ID check MAY last days. The agent MUST stop, and tell the user
  to run this skill again when it passes.

## Create the app

The agent MUST open Home, Create app, and fill in:

1. **App name** MUST be 30 characters at most, the name people type in search.
2. **Default language** MUST be the store listing's language.
3. **App or game**, then **Free or paid**, MUST be picked. A free app stays
   free for good.
4. **Declarations** MUST be ticked by the user, since they are the user's legal
   promise.

## Internal testing

The agent MUST open Test and release, Testing, Internal testing:

1. **Testers** tab: the agent MUST create an email list, enter the testers'
   Google account emails, save, tick the list. The cap is 100 testers.
2. The agent MUST copy the **Join on the web** link.
3. **Create new release**. For the first release Play proposes Play App
   Signing with a key Google generates: the agent MUST accept.
4. **Upload** the `.aab`. The browser tool MAY fail to attach files: the agent
   MUST then hand the user the full path to drag in, and wait.
5. **Release notes** MUST be one or two lines in the default language, inside
   its tag: `<en-US>First test build</en-US>`.
6. **Next**, the agent MUST go over the warnings, then **Save and publish** or
   **Start rollout to Internal testing**.

Internal testing MAY begin with the store listing still unfinished. The
release review page shows what stops a rollout. The agent MUST fill in just
that, then return.

## Upload errors

The agent MUST fix each upload error this way:

| Play says                            | Fix                                                      |
| ------------------------------------ | -------------------------------------------------------- |
| Version code N has already been used | raise `versionCode`, build again                         |
| signed in debug mode                 | sign with the upload key                                 |
| signed with the wrong key            | use the key of the first upload, or reset the upload key |
| must target API level N or higher    | raise `targetSdk`, test, build again                     |
| needs a privacy policy               | App content, Privacy policy, the site's URL              |

## Before production

When the user asks for production, the agent MUST first tell them:

- **New personal accounts** created after 13 November 2023 MUST run a closed
  test with 12 or more testers opted in for 14 days running. Play offers
  production access only after that. Internal testing is excluded.
- **Organization accounts** MAY skip that test.
- **Store listing** MUST have a short text of 80 characters at most, a full
  text of 4000 at most, a 512 px icon, a 1024x500 feature graphic, 2 or more
  phone screenshots.
- **App content** each page MUST be complete: privacy policy, ads, app access,
  content rating, target audience, data safety, government apps, financial
  features.
- **Review** a first production review MAY last a week.
