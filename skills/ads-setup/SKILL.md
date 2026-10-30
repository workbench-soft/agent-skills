---
name: ads-setup
description: 'Use when the user asks to add ads, set up Google AdSense or AdMob, monetize a site or an Android app, add ads.txt or app-ads.txt, set up the ad consent message, add ad unit IDs or the AdMob app ID, or fill in the ads and data safety answers in Play Console, in any language: "set up ads", "подключи рекламу", "настрой AdSense", "добавь AdMob". First checks that the site and the app follow the ad network rules, chooses AdSense for the site and AdMob for a native Android app, goes through the dashboards in the browser with the user logging in, adds the publisher and unit IDs to the code with test ads in debug builds, publishes the consent message, records what is waiting on Google review, and writes TODO.md with the tasks left for the user.'
---

# Set up ads for a site and an Android app

Get AdSense to approve the site and connect the app to AdMob, with each ad
policy kept on the way.

## Logins and keys

- **Browser** drive whatever browser tool the agent has: the VS Code browser
  tools, or the `agent-browser` skill. Without one, hand the user the link and
  the clicks as numbered steps, one per line, and wait.
- **Login screen** have the user log in inside that window, and wait for
  "done". A password, a 2FA code, a bank account or a tax ID MUST NOT be typed
  by the agent.
- **Payments and tax forms** are the user's to fill. The agent names the page
  and waits.
- **Public IDs** `ca-pub-...`, `ca-app-pub-...~...` and the ad unit IDs MAY sit
  in the code. Each visitor can read them in the page or the app.
- **Secrets** an API token or a service account key MUST stay out of commits
  and out of the chat.

## 1. Read the project

The repo rules MUST beat this skill. Start with `AGENTS.md`, `CLAUDE.md` and
the README, then look for:

```bash
git grep -nE 'adsbygoogle|ca-pub-|google-adsense-account|ca-app-pub-|play-services-ads|google_mobile_ads|user-messaging-platform' -- ':!*.lock'
ls android app 2>/dev/null; ls pubspec.yaml capacitor.config.* android/twa-manifest.json 2>/dev/null
```

1. **The site** the domain, how the pages are made, where head tags belong.
2. **The app** native Kotlin or Java, Flutter, React Native, Capacitor, a
   WebView, or a Trusted Web Activity (TWA) that shows the site in Chrome.
3. **The work already there** IDs in the code, `ads.txt`, a README section on
   ads.

## 2. Pick the ad product per surface

| Surface                                           | Ads from                                                            | Read                                           |
| ------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| A website in a browser                            | AdSense                                                             | [references/adsense.md](references/adsense.md) |
| A native app: Kotlin, Java, Flutter, React Native | AdMob                                                               | [references/admob.md](references/admob.md)     |
| A Capacitor or WebView app                        | AdMob, plus the WebView API for Ads when the web page shows AdSense | [references/admob.md](references/admob.md)     |
| A TWA showing the site                            | AdSense off inside the app                                          | [references/twa-ads.md](references/twa-ads.md) |

AdSense code MAY run on web pages and approved WebView setups, and only there.
A TWA counts as neither, so the site MUST hide AdSense when the app opens it.

## 3. Check the site can pass review

Most first AdSense attempts fail for the same handful of reasons. Before
applying, each of these MUST be true:

- **Own domain** served over https, with no "coming soon" page.
- **Content** original text, enough to judge the site by: the `seo-setup`
  skill sets the bar.
- **Trust pages** About, Contact with a working email, a privacy policy.
- **Crawlers let in** `robots.txt` and the Cloudflare bot settings pass
  `Mediapartners-Google` and `Googlebot`.
- **Navigation** a menu that leads to each page.

Something missing? Load the `seo-setup` skill, fix the gap, deploy, then
return here.

## 4. Set up the site

Work through [references/adsense.md](references/adsense.md): account,
verification code in the head, `ads.txt`, review request, consent message, ad
units.

An AdSense review lasts anywhere from a few days to 4 weeks. Stop once the
request is in, note the date, and tell the user to run this skill again when
the approval email arrives.

## 5. Set up the app

Work through [references/admob.md](references/admob.md): account, the app and
its ad units, the SDK with test ads in debug builds, the consent form,
`app-ads.txt`.

- A debug build MUST NOT load real ad unit IDs. One click on a real ad from a
  developer's phone gets the account flagged.
- The app SHOULD go to Play internal testing with test ads before anything
  else. The `play-release` skill handles the upload.

## 6. Consent and privacy

1. In Privacy & messaging, publish a GDPR message: in AdSense for the site, in
   AdMob for the app. It reaches the EEA, the UK and Switzerland. Visitors
   there see limited ads when it is missing.
2. A US states message SHOULD be added as well, from the same tool.
3. The privacy policy MUST mention Google ads cookies and link to
   `https://policies.google.com/technologies/partner-sites`. Change it in the
   repo and deploy.

## 7. Play Console declarations

An app that shows ads, or a TWA that shows a site with ads, MUST declare it.
Read [references/play-declarations.md](references/play-declarations.md) and
fill in each page in the browser.

## 8. Commit, deploy, record

- A change SHOULD get a commit of its own, in the repo's commit style: the IDs,
  `ads.txt`, the consent code, the privacy policy.
- Before each commit, run the repo checks. Deploy, then fetch the live
  `ads.txt` and `app-ads.txt` with `curl`.
- Add or update the README section on ads, written per `writing-style`: the
  account, where each ID lives, what is under review and from what date.

## 9. Write TODO.md

`TODO.md` at the target repo root MUST hold each task this run leaves for the
user. Touch only the `## ads-setup` section, adding or updating it.

- **One task per line** a checkbox, the task, the place, and a date for a wait.
- **Done tasks** come off once the user says so or the dashboard shows it.
- **No tasks left** the section is removed.
- **Secrets** passwords, bank details and tax IDs MUST be left out.

```markdown
## ads-setup

- [ ] Fill in the tax form in AdSense, Payments: https://adsense.google.com
- [ ] Run `ads-setup` again when the approval email comes, review sent <date>
```

Commit it together with the README record.

## 10. Report back

1. Each surface: the ad product, its state (code in, under review, approved,
   serving), its dashboard link.
2. The commits, a line for each.
3. What is waiting on Google, and the date to look again.
4. The `TODO.md` tasks: payments, tax form, ID check.

## Guardrails

- A live ad MUST NOT be clicked by the agent, on any device.
- Ads MUST stay clear of buttons and look unlike the site content or the
  menu. Placements that lead to misclicks get the account banned.
- The page MUST carry no text that asks people to click ads or to support the
  site through them.
- An ad slot MUST hold its height until the ad loads, so the page stays still.
- After a rejection, the review SHOULD be read in full and fixed before it goes
  in again.
