# Play Console answers for ads

The agent MUST open the app at `https://play.google.com/console`, then Policy
and programs, App content. The answer on each page below MUST fit how the
shipped build behaves.

## Ads

- **Yes** the answer MUST be Yes if the app shows any ad from any network,
  including a web page in a WebView.
- **No** a TWA whose AdSense is hidden in the app MUST answer No.

## Advertising ID

The `AD_ID` permission comes in with the AdMob SDK. The agent MUST answer Yes
and tick Advertising or marketing. An app with no ad or analytics SDK answers No
and SHOULD strip the permission:

```xml
<uses-permission android:name="com.google.android.gms.permission.AD_ID" tools:node="remove"/>
```

## Data safety

Before filling it in, the agent MUST read Google's list for the SDK version
the app ships:
`https://developers.google.com/admob/android/privacy/play-data-disclosure`.

The answers for the AdMob SDK SHOULD start from this table, then match
Google's list:

| Data type                         | Collected | Shared | Why                                      |
| --------------------------------- | --------- | ------ | ---------------------------------------- |
| Approximate location, from the IP | yes       | yes    | advertising, fraud prevention            |
| Device or other IDs               | yes       | yes    | advertising, analytics, fraud prevention |
| App interactions                  | yes       | yes    | advertising, analytics                   |
| Crash logs, diagnostics           | yes       | yes    | analytics                                |

Encrypted in transit MUST read yes. The agent MUST then add the data the app
collects on its own.

## Other pages ads touch

- **Privacy policy** it MUST be the URL of the site page naming Google ads
  cookies.
- **Target audience** it SHOULD be 13 and up, which stays clear of the
  Families rules. Under 13 MUST bring the Families policy, certified ad SDKs
  and the child-directed flag in code.
- **Store listing contact details** the website MUST be the domain serving
  `app-ads.txt`.
