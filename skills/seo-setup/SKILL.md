---
name: seo-setup
description: 'Use when the user asks to set up SEO, get a site found in search, register it in Google Search Console or Bing Webmaster Tools, add Cloudflare Web Analytics, write a sitemap or robots.txt, add meta tags or structured data, write content that ranks, or make a site ready for AdSense review, in any language: "set up SEO", "get the site indexed", "настрой SEO", "зарегай сайт в гугле". Works out where the domain and DNS sit, Cloudflare first, checks the live site and the repo against a search and ad-review list, fixes what is missing in code, then goes through the dashboards in the browser with the user logging in, records what is registered where, and writes TODO.md with the tasks left for the user.'
---

# Set up search for a site

The agent MUST get the site found and ready for ad review, then register it
with Cloudflare, Google and Bing.

## Logins and keys

- **Browser** the agent MUST drive whatever browser tool it has: the VS Code
  browser tools, or the `agent-browser` skill. Without one, it MUST hand the
  user the link and the clicks as numbered steps, one per line, and wait.
- **Login screen** the user MUST log in inside that window, and the agent MUST
  wait for "done". A password, a 2FA code or card details MUST NOT be typed by the agent.
- **Account choice** the agent MUST ask a single time which Google and
  Cloudflare accounts to use, then stick to them in each dashboard.
- **Secrets** an API token MUST stay out of commits and out of the chat. The
  user stores it with `gh secret set NAME`, or the agent reads it from a file
  outside the repo.
- **Public IDs** a verification token, a site key or an analytics ID MAY sit in
  the code. The page shows them to the world already.

## 1. Read the project

The repo rules MUST beat this skill. The agent MUST start with `AGENTS.md`,
`CLAUDE.md` and the README, then look for:

1. **The domain** the agent MUST find it in the README, a `CNAME` file, `wrangler.jsonc` or
   `wrangler.toml`, `vercel.json`, `netlify.toml`, or the canonical link in
   the HTML.
2. **The host and the deploy** the agent MUST find them in those same files and
   `.github/workflows/`.
3. **How the pages are made** the agent MUST name it: static HTML, a prerender
   step, server rendering, or an app that renders only in the client.
4. **The work already there** the agent MUST reuse it: a README section on search and analytics, a
   sitemap, `robots.txt`, JSON-LD.

When the site lives only on `*.pages.dev`, `*.github.io` or `*.vercel.app`,
with no domain of its own, the agent MUST stop and say so. AdSense wants an own
domain, and Cloudflare Registrar sells one at cost. The agent MUST continue
only once the user chooses: buy a domain, or go on with no ads.

## 2. Find where the domain lives

The agent MUST run these checks:

```bash
d=example.com
dig +short NS "$d"                                  # *.ns.cloudflare.com: DNS on Cloudflare
whois "$d" | grep -iE 'registrar:|name server' | sort -u
curl -sI "https://$d" | grep -iE '^(server|cf-ray):'  # server: cloudflare: proxied
```

The agent MUST take the path that matches what the checks show:

| What the checks show         | Path                                                                                                 |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| Cloudflare DNS, proxied      | the Cloudflare path below, every step                                                                |
| Cloudflare DNS, grey cloud   | ask before turning the proxy on, it moves traffic through Cloudflare                                 |
| DNS at another host          | offer moving DNS to Cloudflare, free plan. The user decides, the nameservers change at the registrar |
| The user keeps DNS elsewhere | the same steps, with the TXT records added at that host and the analytics snippet in the page        |

The Cloudflare settings are in
[references/cloudflare.md](references/cloudflare.md), and the agent MUST read
it.

## 3. Audit the site

The agent MUST go over the live site and the repo. It MUST read
[references/site-checklist.md](references/site-checklist.md) and work through
each row in it.

- The agent MUST put the result in a table: check, state, fix needed.
- Each check MUST be taken from the live site or the build output. The source
  on its own misses what the host adds or strips.
- About, Contact and a privacy policy are the trust pages, and they MUST exist.
  Both ad review and Google Play look for them.

## 4. Fix the gaps in the repo

The agent MUST show the audit table and the list of fixes, then begin with no
question. A fix MUST get a question first only when it changes a lot of what
people see, such as a new page layout or a rename.

- A fix SHOULD get a commit of its own, in the repo's commit style.
- The sitemap SHOULD be built from the page list the build renders. A sitemap
  written by hand is out of date at the first new page.
- Text for people MUST follow the `writing-style` skill. The agent MUST load
  the skill before the first page of text.
- Before each commit, the agent MUST run the repo checks: tests, lint, build.
- The agent MUST deploy the repo's usual way, then audit the live site a
  second time.

## 5. Plan and write content

People reach a site from search through pages that answer their query. The
agent MUST read [references/content.md](references/content.md) if the site has
under 5 pages of real text, or if the user asks for content.

- The agent MUST show the list of topics and wait for the user's pick. An unwanted page costs
  a day of writing.
- Each number and rule in the text MUST trace to a source that the page links.

## 6. Register the site

The agent MUST read
[references/search-consoles.md](references/search-consoles.md), then go
through each dashboard in the browser:

1. **Cloudflare Web Analytics** the agent MUST add the site.
2. **Cloudflare Crawler Hints** the agent MUST switch it on, so IndexNow tells
   Bing about changes.
3. **Google Search Console** the agent MUST add the domain property, verify
   it, send in the sitemap, request indexing of the key pages.
4. **Bing Webmaster Tools** the agent MUST import from Search Console and
   check the sitemap.
5. **Rich Results Test and PageSpeed** the agent MUST run both on the home
   page and on one page of each type.

When the dashboard shows a step already done, the step SHOULD be checked, then
skipped.

## 7. Leave a record

In the target repo README, the agent MUST add or update a section, written per
`writing-style`: what is registered where, the account that owns each, how the
site got verified, the sitemap's location. Secrets and passwords MUST be left
out.

The skill's next run SHOULD start from that section. That spares a walk
through each dashboard again.

## 8. Write TODO.md

`TODO.md` at the target repo root MUST hold each task this run leaves for the
user. The agent MUST touch only the `## seo-setup` section, adding or updating
it.

- **One task per line** each line MUST hold a checkbox, the task, the place,
  and a date for a wait.
- **Done tasks** MUST come off once the user says so or the dashboard shows it.
- **No tasks left** the section MUST be removed.
- **Secrets** passwords and tokens MUST be left out.

The section SHOULD read like this:

```markdown
## seo-setup

- [ ] Read Pages in Search Console on <date>: https://search.google.com/search-console
- [ ] Add the TXT record `google-site-verification=...` at the DNS host
```

The agent MUST commit it together with the README record.

## 9. Report back

1. The answer MUST give the audit table and the changes made.
2. It MUST list the commits, a line for each.
3. It MUST name each service: registered or not, with its dashboard link.
4. It MUST say what is waiting on Google or Bing, and when to look: Search
   Console data appears in 2 to 3 days.
5. It MUST list the `TODO.md` tasks, a line for each.

## Guardrails

- A DNS record the agent didn't add MUST stay as it is, unchanged and in place.
- A Cloudflare setting that changes the traffic path, the proxy, the SSL mode
  or a WAF rule, MUST get the user's agreement before it changes.
- A redirect rule MUST be tested on the live site as soon as it goes in.
- `noindex`, a `Disallow: /` or a robots block MUST stay off the live site.
