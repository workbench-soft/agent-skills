# AdMob for an Android app

## Account, app and ad units

1. The agent MUST open `https://admob.google.com` and have the user log in.
   If a Google account already holds AdSense, it SHOULD use that one: AdMob
   takes over its payments and publisher ID.
2. The agent MUST go to Apps, Add app, Android. To "Is the app listed on a
   supported app store?" it MUST answer No while the app is not yet public on
   Play. It MUST copy the App ID: `ca-app-pub-...~...`.
3. The agent MUST add a unit for each placement under Ad units, Add ad
   unit. It MUST settle the formats with the user from this table:

| Format                   | Fits                                                                 |
| ------------------------ | -------------------------------------------------------------------- |
| Anchored adaptive banner | a strip along the bottom of a screen, the least intrusive            |
| Interstitial             | a full screen between two tasks, no more than once every few minutes |
| Rewarded                 | an extra the person chooses to unlock by watching an ad              |
| App open                 | the cold start screen of an app people open many times a day         |

## The SDK

The app MUST take the latest versions from the release notes,
`https://developers.google.com/admob/android/rel-notes`, in these lines:

```kotlin
implementation("com.google.android.gms:play-services-ads:<latest>")
implementation("com.google.android.ump:user-messaging-platform:<latest>")
```

The manifest MUST carry the App ID:

```xml
<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="ca-app-pub-XXXXXXXXXXXXXXXX~NNNNNNNNNN"/>
```

Each build MAY carry the real App ID. The unit IDs MUST change with the build
type:

```kotlin
buildTypes {
    debug { resValue("string", "ad_banner", "ca-app-pub-3940256099942544/9214589741") }
    release { resValue("string", "ad_banner", "ca-app-pub-XXXXXXXXXXXXXXXX/NNNNNNNNNN") }
}
```

Other stacks MUST switch the same way: Flutter uses `google_mobile_ads` with
`kReleaseMode`, React Native uses `react-native-google-mobile-ads` with
`__DEV__`, Capacitor uses `@capacitor-community/admob` with `isTesting`.

Debug builds MUST use Google's demo units:

| Format          | Demo unit                                |
| --------------- | ---------------------------------------- |
| Adaptive banner | `ca-app-pub-3940256099942544/9214589741` |
| Interstitial    | `ca-app-pub-3940256099942544/1033173712` |
| Rewarded        | `ca-app-pub-3940256099942544/5224354917` |
| App open        | `ca-app-pub-3940256099942544/9257395921` |
| Native          | `ca-app-pub-3940256099942544/2247696110` |

## Consent before the first ad

1. At each start, the app MUST call `requestConsentInfoUpdate` and then
   `loadAndShowConsentFormIfRequired`.
2. It MUST hold back `MobileAds.initialize` and ad loading until
   `canRequestAds()` returns true.
3. When `privacyOptionsRequirementStatus` is `REQUIRED`, it MUST put a
   "Privacy options" entry in settings.
4. The agent MUST publish a GDPR message for the app under AdMob, Privacy &
   messaging.
5. It SHOULD try the form on a test device, with `ConsentDebugSettings` set
   to the EEA.

## app-ads.txt

The file MUST sit at the root of the website domain that the Play store
listing names, since AdMob fetches it from there. It MUST hold this line:

```text
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

- **Publisher ID** the agent MUST take it from AdMob, Settings, Account
  information.
- **Same domain** it MUST match the Website in Play Console, Store
  settings, Store listing contact details.
- **The site already has `ads.txt`** with the same publisher ID? The two files
  MAY carry the same line.

## Link the app to Play

When the app goes public on Play, the agent MUST open App settings in AdMob,
add the store listing, and wait for the app review. Before that, real ads
serve at a low rate. Internal testing keeps the app private, so there only
test ads matter, and the link MAY wait.
