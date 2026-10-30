# The site checklist

Run the commands below on the live site, then read each page the build
outputs.

```bash
d=example.com
curl -s "https://$d/" -o /tmp/home.html
grep -ioE '<title>[^<]*|<meta name="description"[^>]*|<link rel="canonical"[^>]*|<h1[^>]*>|<html[^>]*>' /tmp/home.html
curl -s "https://$d/robots.txt"; curl -s "https://$d/sitemap.xml" | head -20
curl -s -o /dev/null -w '%{http_code}\n' "https://$d/no-such-page-$RANDOM"
```

## Every page

| Check | Right |
| --- | --- |
| `<title>` | 30 to 60 characters, unique, opens with the words people search |
| `<meta name="description">` | 70 to 160 characters, unique, tells what the page offers |
| `<link rel="canonical">` | the page's own full https URL, on the main host |
| `<html lang>`, charset, viewport | each one present |
| `<h1>` | a single one, naming what people search for |
| Text without scripts | view-source shows the main text. A client-only app SHOULD prerender at build |
| Open Graph | `og:title`, `og:description`, `og:url`, `og:type`, `og:image` at 1200x630 with a full URL |
| `twitter:card` | `summary_large_image` |
| Links | a plain `<a href>` from the menu or the footer reaches each page |
| Images | `alt` text, `width` and `height` set |

## Structured data

JSON-LD goes in a `<script type="application/ld+json">` block. It MUST agree
with what the page shows: Search Console flags a date, question or price that
the page leaves off.

| Page | Types |
| --- | --- |
| Home | `WebSite`, `Organization` with `logo` and `url` |
| A tool or calculator | `WebApplication` with `applicationCategory` and `offers` at 0 |
| A guide or article | `Article` with `headline`, `datePublished`, `dateModified`, `author`, `image` |
| Below the home page | `BreadcrumbList` |
| Questions on the page | `FAQPage`, for questions the page shows and no others |

## Site files

| File | Right |
| --- | --- |
| `robots.txt` | `Sitemap: https://$d/sitemap.xml`, CSS and scripts allowed, no search or ad crawler blocked |
| `sitemap.xml` | full canonical URLs alone, `<lastmod>` set to the last content change |
| 404 | a missing page returns status 404 and links back home |
| Icons | `favicon`, `apple-touch-icon`, a web manifest with 192 and 512 icons |

## Trust pages

Both AdSense review and Google Play read these pages.

- **About** who runs the site, a person or a company name, and the reason.
- **Contact** a working email, or a form.
- **Privacy policy** what the site stores, the analytics, and once ads run,
  Google cookies with a link to
  `https://policies.google.com/technologies/partner-sites`.
- **Footer** links to the three pages, on each page.

## Speed

```bash
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://$d/&strategy=mobile&category=performance&category=seo" \
  | jq '.lighthouseResult.categories | map_values(.score)'
```

On mobile, Performance SHOULD reach 0.9 or higher, and SEO 1. Layout shift MUST
stay below 0.1, so an ad slot holds its height until the ad loads.
