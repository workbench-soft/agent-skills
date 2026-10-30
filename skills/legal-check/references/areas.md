# Risk areas and where each rule sits

Walk each area for the scope. An area that doesn't apply gets one line in the
report saying why.

## Name and brand

- **Trade marks** a live mark with the same or a close word in class 9 or 42
  is high. Search [WIPO Global Brand Database](https://branddb.wipo.int/) for
  the US, the EU, the UK and Japan, and `domain-check` for Australia.
- **Look-alikes** an icon, a name or a store listing close to a known brand
  breaks the [Google Play impersonation policy](https://support.google.com/googleplay/android-developer/answer/9888374).
- **Other brands in the app** a logo or a name of another company needs its
  brand rules, such as "Android is a trademark of Google LLC".

## Licenses and assets

- **Copyleft** GPL or AGPL code in a closed or ad funded app is high: the app
  must ship its own source under the same license.
- **Weak copyleft** LGPL and MPL are fine when the library stays unchanged and
  the notice ships. Changed files go public.
- **Use limits** Hippocratic, BUSL, PolyForm, Commons Clause and NC licenses
  limit who uses the code or for what. Read the terms against the app.
- **Notices** MIT, BSD and Apache ask for their notice in the shipped app, as
  a Licenses screen or a `NOTICE` file.
- **Assets** fonts, icons, images, sounds and map tiles each need a license
  that allows the app's use. OpenStreetMap data needs "© OpenStreetMap
  contributors" on the map.

## Privacy and data

- **Policy** an app that sends data off the device, ads included, needs a
  privacy policy at a public link. The policy names each SDK from the scan.
- **Consent** ads or analytics in the EU and the UK need a consent message
  before the first request: Google's UMP for AdMob.
- **Store forms** the Play [Data safety form](https://support.google.com/googleplay/android-developer/answer/10787469)
  and Apple's privacy labels match what the code collects.
- **Accounts** an app with sign in offers account deletion in the app and on
  the web, per the [Play rule](https://support.google.com/googleplay/android-developer/answer/13327111).
- **Children** an app that targets kids follows COPPA and the Play Families
  policy. Ads then come only from certified networks.

## Permissions and store policy

- **Sensitive permissions** each one from the scan needs a core feature that
  uses it. Background location, `MANAGE_EXTERNAL_STORAGE`,
  `QUERY_ALL_PACKAGES` and `REQUEST_INSTALL_PACKAGES` need a Play declaration.
- **Self update** an APK that installs updates breaks Play policy in the Play
  build. Check that the Play build leaves it out.
- **Ads** ads placed near buttons, ads that ask for clicks and full screen
  ads at launch break the [AdMob policies](https://support.google.com/admob/answer/6128543).

## The feature itself

- **Lawful in each market** a feature such as speed camera alerts, call
  recording or scraping can be banned in a country. Name the markets checked.
- **Other services** scraping, an unofficial API or a feed of another site
  needs its terms and `robots.txt` read. A ban on automated access is high.
- **User content** shared notes, posts or uploads need a way to report abuse
  and a takedown contact for copyright claims.
- **Claims** health, money, safety or legal advice in the app needs a plain
  disclaimer, and some markets need a licence for it.
- **Paid features** subscriptions need the price, the renewal and the cancel
  steps before the purchase, and a refund path the store accepts.
