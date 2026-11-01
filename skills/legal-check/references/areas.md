# Risk areas and where each rule sits

The agent MUST walk each area for the scope. An area that doesn't apply MUST
get one line in the report saying why.

## Name and brand

- **Trade marks** a live mark with the same or a close word in class 9 or 42
  MUST rate high. The agent MUST search [WIPO Global Brand Database](https://branddb.wipo.int/) for
  the US, the EU, the UK and Japan, and `domain-check` for Australia.
- **Look-alikes** an icon, a name or a store listing close to a known brand
  breaks the [Google Play impersonation policy](https://support.google.com/googleplay/android-developer/answer/9888374), so the agent MUST flag it.
- **Other brands in the app** a logo or a name of another company MUST follow
  its brand rules, such as "Android is a trademark of Google LLC".

## Licenses and assets

- **Copyleft** GPL or AGPL code in a closed or ad funded app MUST rate high:
  the app then has to ship its own source under the same license.
- **Weak copyleft** LGPL and MPL MAY pass when the library stays unchanged and
  the notice ships. Changed files go public.
- **Use limits** Hippocratic, BUSL, PolyForm, Commons Clause and NC licenses
  limit who uses the code or for what. The agent MUST read the terms against
  the app.
- **Notices** MIT, BSD and Apache ask for their notice in the shipped app, so
  the app MUST show a Licenses screen or ship a `NOTICE` file.
- **Assets** fonts, icons, images, sounds and map tiles MUST each have a
  license that allows the app's use. OpenStreetMap data MUST show "© OpenStreetMap
  contributors" on the map.

## Privacy and data

- **Policy** an app that sends data off the device, ads included, MUST have a
  privacy policy at a public link. The policy MUST name each SDK from the scan.
- **Consent** ads or analytics in the EU and the UK MUST show a consent
  message before the first request: Google's UMP for AdMob.
- **Store forms** the Play [Data safety form](https://support.google.com/googleplay/android-developer/answer/10787469)
  and Apple's privacy labels MUST match what the code collects.
- **Accounts** an app with sign in MUST offer account deletion in the app and on
  the web, per the [Play rule](https://support.google.com/googleplay/android-developer/answer/13327111).
- **Children** an app that targets kids MUST follow COPPA and the Play Families
  policy. Ads then MUST come only from certified networks.

## Permissions and store policy

- **Sensitive permissions** each one from the scan MUST serve a core feature.
  Background location, `MANAGE_EXTERNAL_STORAGE`,
  `QUERY_ALL_PACKAGES` and `REQUEST_INSTALL_PACKAGES` MUST get a Play declaration.
- **Self update** an APK that installs updates breaks Play policy in the Play
  build. The agent MUST check that the Play build leaves it out.
- **Ads** ads placed near buttons, ads that ask for clicks and full screen
  ads at launch break the [AdMob policies](https://support.google.com/admob/answer/6128543), so the agent MUST flag them.

## The feature itself

- **Lawful in each market** a feature such as speed camera alerts, call
  recording or scraping can be banned in a country. The report MUST name the
  markets checked.
- **Other services** for scraping, an unofficial API or a feed of another
  site, the agent MUST read its terms and `robots.txt`. A ban on automated
  access MUST rate high.
- **User content** shared notes, posts or uploads MUST have a way to report
  abuse and a takedown contact for copyright claims.
- **Claims** health, money, safety or legal advice in the app MUST carry a
  plain disclaimer, and some markets need a licence for it.
- **Paid features** subscriptions MUST show the price, the renewal and the
  cancel steps before the purchase, and a refund path the store accepts.
