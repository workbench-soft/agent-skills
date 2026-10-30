# Content that brings search traffic

A page climbs in search when it answers a single query better than the pages
at the top today.

## Find what people search

```bash
q='novated lease'
curl -s "https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=au&q=$(printf %s "$q" | jq -sRr @uri)" | jq -r '.[1][]'
```

- **Autocomplete** run the query above on the main topic, then add `how`,
  `vs`, `calculator`, `is it worth` and each letter after it. Set `hl` and
  `gl` to the language and country of the audience.
- **People also ask** search the topic in the browser and note the questions
  Google lists.
- **Search Console** Performance, Queries, once data comes in: a query with
  lots of impressions and few clicks needs a better page.
- **Bing Webmaster** Keyword Research shows rough volumes.
- **The top 3 results** open each one. A new page MUST offer what they miss:
  a worked example, a table, a calculator, a newer rule.

## Pick topics

Sort the queries by intent, one page for each question a person has. When two
queries want the same answer, they share a page.

Put a table in front of the user and wait for their choice:

| Page | Queries it answers | What it gives that the top results lack |
| ---- | ------------------ | --------------------------------------- |

## Write a page

- **Answer first** the opening paragraph answers the query in two sentences.
- **Numbers** a worked example with real figures does more than a paragraph of
  advice.
- **Sources** each rate, rule and law links to its source page.
- **Date** an "Updated" date on show, equal to `dateModified`.
- **Maker** a byline or an About link, so the reader sees who wrote it.
- **Link out of the page** to the tool, and to 2 or 3 related pages of the site.
- **Link into the page** from the menu, the home page or a related page.

A new page gets added to the sitemap, the menu and the build's page list.

## What gets a site marked down

- **Pages made in bulk** dozens of near copies that differ by a word. Google
  names it scaled content abuse and drops the entire site.
- **Text copied** from another site, reworded or not.
- **Keyword stuffing** one phrase repeated in each sentence.
- **Thin pages** a heading plus two lines. AdSense review turns down a site
  that has them as "low value content".

AdSense review needs enough text to judge the site, and Google gives no page
count. Before applying, the minimum SHOULD be a tool plus 5 useful guides.
