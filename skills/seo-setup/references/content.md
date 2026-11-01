# Content that brings search traffic

A page climbs in search when it answers a single query better than the pages
at the top today, so each page MUST aim at one query.

## Find what people search

The agent SHOULD start from autocomplete:

```bash
q='novated lease'
curl -s "https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=au&q=$(printf %s "$q" | jq -sRr @uri)" | jq -r '.[1][]'
```

- **Autocomplete** the agent SHOULD run the query above on the main topic,
  then add `how`, `vs`, `calculator`, `is it worth` and each letter after it.
  `hl` and `gl` MUST match the language and country of the audience.
- **People also ask** the agent SHOULD search the topic in the browser and
  note the questions Google lists.
- **Search Console** the agent SHOULD read Performance, Queries, once data
  comes in: a query with lots of impressions and few clicks needs a better
  page.
- **Bing Webmaster** Keyword Research MAY give rough volumes.
- **The top 3 results** the agent MUST open each one. A new page MUST offer what they miss:
  a worked example, a table, a calculator, a newer rule.

## Pick topics

The agent MUST sort the queries by intent, one page for each question a person
has. When two queries want the same answer, they MUST share a page.

The agent MUST put a table in front of the user and wait for their choice:

| Page | Queries it answers | What it gives that the top results lack |
| ---- | ------------------ | --------------------------------------- |

## Write a page

- **Answer first** the opening paragraph MUST answer the query in two
  sentences.
- **Numbers** a worked example with real figures SHOULD replace a paragraph of
  advice.
- **Sources** each rate, rule and law MUST link to its source page.
- **Date** an "Updated" date MUST show, equal to `dateModified`.
- **Maker** a byline or an About link MUST show who wrote it.
- **Link out of the page** it SHOULD link to the tool, and to 2 or 3 related
  pages of the site.
- **Link into the page** the menu, the home page or a related page MUST link
  to it.

A new page MUST go into the sitemap, the menu and the build's page list.

## What gets a site marked down

- **Pages made in bulk** dozens of near copies that differ by a word MUST NOT
  appear. Google names it scaled content abuse and drops the entire site.
- **Text copied** from another site, reworded or not, MUST NOT appear.
- **Keyword stuffing** one phrase repeated in each sentence MUST NOT appear.
- **Thin pages** a heading plus two lines MUST NOT ship. AdSense review turns
  down a site that has them as "low value content".

AdSense review needs enough text to judge the site, and Google gives no page
count. Before applying, the minimum SHOULD be a tool plus 5 useful guides.
