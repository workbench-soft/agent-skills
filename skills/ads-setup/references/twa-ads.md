# Ads when the app is a TWA

A Trusted Web Activity shows the site full screen in Chrome. AdSense code is
allowed on web pages and approved WebView setups alone, and Google's answers
in the AdSense community place a TWA in neither group. AdSense MUST therefore
stay off inside the app.

Let the user choose the route:

| Option                                                                | Work                       | The app earns from ads  |
| --------------------------------------------------------------------- | -------------------------- | ----------------------- |
| Hide AdSense inside the app                                           | a small script on the site | no, the site still does |
| Swap the TWA for a WebView app with AdMob and the WebView API for Ads | a new native app           | yes                     |

## Hide AdSense inside the app

On the first page the app opens, `document.referrer` reads
`android-app://<package>/`. Set a mark on the tab at that point, and each page
after it in the tab reads the mark.

- **sessionStorage** keeps the mark. It is scoped to the tab, so the site in a
  normal Chrome tab carries no mark.
- **localStorage** MUST NOT keep it. For a given site, Chrome shares it
  between the app and the browser.
- **The meta tag** handles the AdSense site check, so the script MAY load from
  code.
- **A query** on the start URL, such as `/?app=android` in
  `twa-manifest.json`, makes the check harder to fool. It takes a new app
  release.

```html
<meta name="google-adsense-account" content="ca-pub-XXXXXXXXXXXXXXXX" />
<script>
  if (document.referrer.startsWith("android-app://") || /[?&]app=android/.test(location.search))
    sessionStorage.setItem("inApp", "1");
  if (sessionStorage.getItem("inApp")) document.documentElement.classList.add("in-app");
  else
    document.head.append(
      Object.assign(document.createElement("script"), {
        async: true,
        crossOrigin: "anonymous",
        src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX",
      }),
    );
</script>
```

```css
.in-app .adsbygoogle {
  display: none;
}
```

Any code that pushes ad slots MUST leave out the push while the `in-app` class
is on.

## Check it

1. Put the internal test build on a phone connected by USB with USB debugging
   on.
2. On the computer, open `chrome://inspect` and inspect the app's tab.
3. Filter network requests on `googlesyndication`. The list MUST stay empty
   across a few pages.
4. On the same phone, open the site in Chrome. Ads MUST still load there.

The app then counts as ad free in Play Console: answer No on the Ads page.
