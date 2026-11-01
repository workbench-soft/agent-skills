# AdSense for a website

## Account and verification

1. The agent MUST open `https://adsense.google.com`, have the user log in,
   and sign up with the site URL and the payee's country.
2. It MUST take the publisher ID from Account, Settings, Account
   information: `ca-pub-` followed by 16 digits.
3. The verification code MUST go in the head of each page, and `ads.txt` at
   the site root. Both SHOULD come from a single constant at build time, so
   no page can lack them:

```html
<meta name="google-adsense-account" content="ca-pub-XXXXXXXXXXXXXXXX" />
<script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
  crossorigin="anonymous"
></script>
```

```text
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

The final field in `ads.txt` MUST stay as shown: it is Google's ID on the
IAB list, the same for each publisher.

1. The agent MUST commit and deploy, then check the live site:

```bash
curl -s "https://$d/ads.txt"
curl -s "https://$d/" | grep -o 'ca-pub-[0-9]*' | sort -u
```

1. In AdSense, Sites, the agent MUST choose the site, tick that the code is
   in place, press Verify, then Request review.

## While the review runs

- **Payments** the user MUST complete Payments, Payments info: name,
  address, tax form. Once earnings reach the threshold, Google posts a PIN to
  that address.
- **Consent** the agent MUST make a message for the site under Privacy &
  messaging, European regulations, and publish it. It SHOULD repeat that for
  US state regulations.
- **Empty slots** empty ad boxes MUST NOT show on the page before approval.
  A slot MUST stay hidden until it has a unit ID.

## After approval

The user MAY choose hand-placed ad units, Auto ads, or both, and the agent
MUST ask.

- **By ad unit** the agent MUST make a responsive unit under Ads, By ad
  unit, Display ads, and put its `data-ad-slot` number in the code.
- **Auto ads** the agent MUST switch them on under Ads, By site, and SHOULD
  start with a low ad load. The verification script in the head serves them
  already.

A hand-placed slot MUST look like this:

```html
<ins
  class="adsbygoogle"
  style="display:block;min-height:280px"
  data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
  data-ad-slot="1234567890"
  data-ad-format="auto"
  data-full-width-responsive="true"
></ins>
<script>
  (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

- **One push per slot** in React or Vue, the code MUST push once as the slot
  mounts. A second push on the same `<ins>` throws.
- **Placement** a slot SHOULD sit below the main result, between sections,
  at an article's end. It MUST stay out of forms and away from buttons.
- **Sites** the agent SHOULD expect `ads.txt` marked Authorized a few days
  after the first crawl.

## Common rejections

A rejection MUST get the fix in its row:

| Reason in the email          | Fix                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------- |
| Low value content            | add pages of real text, see the `seo-setup` content guide                     |
| Site down or unavailable     | something blocked the crawler: Cloudflare bot rules, a WAF rule, `robots.txt` |
| Policy violation             | read the policy it names, fix it, wait a week before asking again             |
| Not enough content to verify | the text must be in view-source, so a client-only app needs prerendering      |
