# Cloudflare settings for search and ads

The agent MUST open the zone at `https://dash.cloudflare.com` and go down the
rows. Any row that changes the traffic path MUST get the user's agreement before the change.

| Where                                        | Setting                                                | Why                                                                                          |
| -------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| SSL/TLS, Overview                            | Full (strict)                                          | on some hosts Flexible mode sends redirects round in a loop                                  |
| SSL/TLS, Edge Certificates                   | Always Use HTTPS on                                    | each page gets a single https address                                                        |
| Rules, Redirect Rules                        | `www` to the bare domain, 301, keep the path and query | a page lives on one host, and its links stay together                                        |
| DNS, Records                                 | a proxied record for `www`, `AAAA 100::` works         | a redirect rule fires on proxied names only                                                  |
| Caching, Configuration                       | Crawler Hints on                                       | IndexNow passes changed URLs to Bing and Yandex                                              |
| Analytics & Logs, Web Analytics              | the site added, automatic setup                        | visits get counted and no cookie banner is needed                                            |
| Security, Bots                               | Bot Fight Mode off, or verified bots allowed           | Googlebot, Bingbot and the AdSense crawler MUST get through                                  |
| AI Crawl Control or Bots, managed robots.txt | read what it adds to `robots.txt`                      | an AI bot rule is fine, a `Googlebot` or `Mediapartners-Google` rule breaks indexing and ads |

The redirect MAY run the other way instead, bare domain to `www`. The agent
SHOULD pick the host the canonical links point at already.

## Check the redirect

The agent MUST test the redirect on the live site:

```bash
curl -sIL "http://www.$d/a?b=1" | grep -iE '^(HTTP|location)'
```

The result MUST be a single 301 hop to `https://$d/a?b=1`, then a 200.

## Web Analytics

- **Proxied site** the agent SHOULD choose automatic setup. The beacon goes in
  at Cloudflare's edge, so the repo carries no analytics code.
- **Not proxied** the agent MUST paste the snippet Cloudflare shows into the
  page head.
- **Check** the agent MUST load the live page in the browser and find
  `static.cloudflareinsights.com/beacon.min.js` among the network requests.
  The dashboard shows visits within minutes.
- **Privacy policy** MUST state that the site counts visits and sets no
  cookies.

## Email for the Contact page

AdSense, AdMob and Play each need a working email. The agent SHOULD use
Cloudflare Email Routing, which is free:

1. The agent MUST switch on Email, Email Routing. Cloudflare adds the MX and
   TXT records.
2. The agent MUST create an address such as `hello@$d` that forwards to the
   user's inbox.
3. The user MUST confirm the forward from that inbox.

## Settings that break crawlers

- **Under Attack mode** puts a challenge in front of each bot. It MUST be
  switched off when the attack is over.
- **A WAF rule by country** MUST NOT block the US, since Googlebot crawls from
  there.
- **A rate limit on HTML pages** SHOULD NOT be set, since it gives a busy
  crawler a 429 and crawling slows.

Security, Events shows what Cloudflare blocked. The agent SHOULD filter on a
known bot name to find out if a crawler ran into a rule.
