---
name: launch
description: 'Use when the user asks to launch a site or an app end to end, get it found and earning, or do search, ads and Google Play in one go, in any language: "launch the site", "take it live", "set up SEO, ads and Play", "запусти сайт и приложение", "сделай SEO, рекламу и гугл плей". Reads the project, locates the site, the domain and any Android app, asks a single time for the facts each step needs, then runs the seo-setup, ads-setup and play-release skills in the right order, carries forward what is waiting on Google review, writes TODO.md with the tasks left for the user, and finishes with a single table of each service, its state and the next step.'
---

# Launch a site and its Android app

The agent MUST run the skills for search, ads and Google Play in sequence, so
each one starts with what it needs already there.

## 1. Read the project

The repo rules MUST beat this skill. The agent MUST start with `AGENTS.md`,
`CLAUDE.md` and the README, then look for:

1. **The site** the agent MUST find its domain, its host, its deploy.
2. **The Android app** what kind it is, or that there is none. A PWA without an
   app MAY turn into a Trusted Web Activity (TWA).
3. **The work already there** the agent MUST read the README sections on
   search, ads, Android. Each skill leaves one behind, so a second run resumes
   where the first left off.

The agent SHOULD start with these commands:

```bash
ls android pubspec.yaml capacitor.config.* android/twa-manifest.json public/manifest.webmanifest 2>/dev/null
git grep -lE 'ca-pub-|ca-app-pub-|google-site-verification|sitemap' -- ':!*.lock'
```

## 2. Ask once

The agent MUST put the questions in a single form, prefilled with what the repo
shows:

- **Parts** the user MUST tick the ones that apply: search, ads on the site,
  ads in the app, Google Play.
- **Maker** the form MUST ask the name of the person or company for the About
  page, the store and the ad accounts.
- **Contact email** the form MUST ask the one the site, Play and the ad
  accounts use.
- **Audience** the form MUST ask the country and language, which steer content
  and search engines.
- **Accounts** the form MUST ask the Google and Cloudflare accounts for
  logging in.

The agent MUST hand the answers to each skill. A skill MUST NOT repeat a question this step
already answered.

## 3. Show the plan

The agent MUST post the plan in the chat, then begin with no question:

| #   | Skill          | Part                                                                      | Needs before it         |
| --- | -------------- | ------------------------------------------------------------------------- | ----------------------- |
| 1   | `seo-setup`    | audit, fixes, Cloudflare, Search Console, Bing, content                   | the site live           |
| 2   | `ads-setup`    | AdSense on the site, up to the review request                             | step 1 checks passing   |
| 3   | `play-release` | key, bundle, internal testing                                             | the privacy policy live |
| 4   | `ads-setup`    | AdMob in a native app, or AdSense hidden in a TWA, then Play declarations | step 3 done             |
| 5   | `play-release` | a new internal build with the ad code                                     | step 4 code merged      |

- An unticked part MUST be left out.
- A TWA app MUST leave out step 5, unless step 4 changed the start URL.
- A native app that has ad code already MUST leave out step 5.

## 4. Run the skills

The agent MUST load the skills one after another and follow each, using the
step 2 answers.

- When the README record and the dashboard both show a step done, the step
  SHOULD be checked, then skipped.
- Every skill MUST commit its own changes, in the repo's commit style.
- A skill halted by a wait, such as AdSense review or a Play account ID check,
  SHOULD NOT hold up the others. The agent MUST note the wait and move to the
  next step that can run without it.
- After two failures, a step SHOULD stop. The agent MUST report the attempts
  and the message from the dashboard or the command.

## 5. Waits on Google

A few steps complete days later. The agent MUST record each one in the target
repo's README record, along with its start date:

| Wait                       | Usual length            | What to do after              |
| -------------------------- | ----------------------- | ----------------------------- |
| Search Console data        | 2 to 3 days             | read Pages and Performance    |
| AdSense review             | a few days to 4 weeks   | add ad units, turn on serving |
| Play developer ID check    | a few days              | create the app, upload        |
| Closed test for production | 14 days with 12 testers | apply for production access   |
| AdMob app review           | after the app is public | real ads start serving        |

## 6. Write TODO.md

In `TODO.md` at the target repo root, each skill keeps its own section. The
remaining tasks MUST go under `## launch`:

- **Waits** each wait from step 5 MUST be there, with the date to look.
- **Next run** the date for the next `launch` run MUST be there.
- **One place** a task listed in a skill's section MUST be left out of this
  one.

The section SHOULD read like this:

```markdown
## launch

- [ ] Run `launch` again on <date>: AdSense review, Search Console data
```

## 7. Report back

The answer MUST open with a single table, with a row for each service:

| Service                  | State                     | Link           | Next step                   |
| ------------------------ | ------------------------- | -------------- | --------------------------- |
| Cloudflare Web Analytics | counting visits           | dashboard link |                             |
| Google Search Console    | verified, sitemap read    | dashboard link | read Pages on <date>        |
| AdSense                  | under review since <date> | dashboard link | run `ads-setup` on approval |

After it, the answer MUST list:

1. The commits from every skill MUST get a line each.
2. The `TODO.md` tasks MUST get a line each.
3. The date for the next `launch` run MUST be named, with what that run will
   take up.

## Guardrails

- The guardrails of each skill MUST apply here as well.
- A release MUST stay on internal testing until the user names a further
  track.
- A change to DNS, the Cloudflare proxy or a payment setting MUST get the
  user's agreement before it happens.
