# Search Console, Bing and the test tools

## Google Search Console

1. The agent MUST go to `https://search.google.com/search-console` and have
   the user log in.
2. In Add property, Domain, the agent MUST enter the bare domain. One domain
   property takes in http, https and `www` together.
3. The agent MUST verify it. When DNS is on Cloudflare, Search Console can add
   the TXT record on its own: the user logs in to Cloudflare in the popup and
   approves. Otherwise the agent MUST put the `google-site-verification=...`
   TXT record in at the DNS host and press Verify. After a failed check, a retry SHOULD come 5 minutes
   later.
4. In Sitemaps, the agent MUST submit `https://$d/sitemap.xml`. Its status
   MUST show Success.
5. In URL inspection, a key page at a time, the agent MUST run Test live URL,
   then Request indexing. Google takes about 10 requests a day, so the agent
   SHOULD begin with the home page and the strongest pages.

Coverage and query data arrive after 2 to 3 days. On the next run, the agent
SHOULD read Pages, Why pages aren't indexed before any other report.

## Bing Webmaster Tools

1. The agent MUST go to `https://www.bing.com/webmasters` and have the user
   log in.
2. The agent MUST import the sites from GSC and choose the site. The
   verification and the sitemaps come over from Google.
3. Sitemaps MUST include `https://$d/sitemap.xml`. When it is absent, the
   agent MUST submit it.
4. IndexNow MUST show Cloudflare as a source after Crawler Hints is switched
   on.
5. URL Submission MAY take the key pages right away instead of waiting for the
   crawl.

DuckDuckGo and Yahoo draw on the Bing index too, so they MAY be skipped as
separate steps.

## Other search engines

The agent MAY add one only if the audience searches on it: Yandex Webmaster
for Russian speakers, Naver for Korea, Seznam for Czechia. Each one verifies
the same way, with a TXT record or a meta tag.

## Test tools

The agent MUST test the home page and one page of each type with every tool:

| Tool               | URL                                                           | Pass                         |
| ------------------ | ------------------------------------------------------------- | ---------------------------- |
| Rich Results Test  | `https://search.google.com/test/rich-results?url=https://$d/` | each type found, 0 errors    |
| Schema validator   | `https://validator.schema.org/#url=https://$d/`               | 0 errors                     |
| PageSpeed Insights | `https://pagespeed.web.dev/analysis?url=https://$d/`          | green on mobile              |
| Open Graph preview | `https://www.opengraph.xyz/url/https%3A%2F%2F$d`              | title, text and picture show |

A warning on an optional field MAY be left. An error MUST be fixed, deployed and tested once
more.
