# What the money buys

The prices are rough and in USD. Look up the vendor page before giving the
user a price, and flag which figures are guesses.

## Costs worth it at any budget

| Item                                               | Price                        | Take it when                                                                                 |
| -------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------- |
| Domain at Cloudflare Registrar                     | ~$10 a year, renewal at cost | in each case. Trust, search and AdSense need an own domain                                   |
| Hosting on the Cloudflare Workers free plan        | $0                           | a paid product is allowed on the free plan. The Vercel and GitHub Pages free plans forbid it |
| Analytics: Cloudflare Web Analytics or GoatCounter | $0                           | in each case, and no cookie banner is needed                                                 |
| Google Play developer account                      | $25 once                     | an Android app, or a PWA worth wrapping                                                      |
| Apple Developer                                    | $99 a year                   | an iOS app, with a budget above $300 a year                                                  |
| GitHub Sponsors 0%, Ko-fi 0%, Buy Me a Coffee 5%   | $0                           | the goal is donations                                                                        |

## Tiers

The expected results are guesses for a niche product whose core is free. Mark
them as guesses in the chat.

| Budget a year | Adds on top of the tier above                                                                                                            | Expect, a guess                                                          |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| $0            | free launch posts, forum answers, search pages, `*.pages.dev` or `*.github.io`                                                           | a few hundred visits at launch, then the search traffic                  |
| up to $100    | domain, Play account, a single $30 to $50 ad test ahead of the peak season                                                               | the same visits, a store listing, and an answer on whether ads work here |
| up to $500    | a $20 to $50 designer for store screenshots and the feature graphic. A $100 to $200 ad test on the best channel. Apple, when iOS matters | a store page that converts better, the first paid users at a known cost  |
| up to $2000   | 3 to 5 paid spots on small YouTube channels or newsletters, $50 to $300 each. A freelancer to edit short videos                          | a few thousand visits a month during the spots                           |
| more          | a writer for search pages, $50 to $150 a page. Ongoing ads on the channel that paid back                                                 | search traffic that grows with no new posts                              |

## The next tier line

Name the specific purchases and their result. "More ads" is too vague.

```text
With $500 a year instead of $100: 3 small guitar channels review the app
($300), and the ad test runs long enough to tell ($150). A guess: 3 to 5 times
the visitors of the free launch.
```

- **Doesn't pay yet** state when it will. Ads pay off once a visitor is worth
  more than a click costs: $0.5 to $2 a click, against $1 to $5 per 1000 ad
  views.
- **Time for money** for a niche product, 2 hours a week of forum answers
  does better than $100 of ads. Point this out when the user offers money and
  no time.
- **Total, not yearly** spread a total across the first year: launch costs
  come first, and the remainder waits for a test on the channel that worked.

## Skip at every budget

- **SEO agencies, link packages, paid directories** Google ignores them or
  penalises them.
- **Bought upvotes, reviews, followers** Reddit and the stores ban the domain.
- **Paid analytics** Plausible or Fathom, from $9 a month, tell what the free
  counter tells.
- **Ads before a free post worked** the money is spent and the lesson is
  missing.
- **Google Ads under $500 for a free niche app** that buys a few dozen clicks.

## Running a paid test

1. Choose the channel where a free post performed best: Reddit Ads for a
   subreddit audience, Meta for local groups, Google Ads for a phrase people
   search.
2. The user types in the card. Set a daily cap and a total cap before the ad
   starts.
3. Run a single ad to a single audience for 7 days, with the link tagged
   `?ref=ad-<channel>`.
4. Cost per user equals the spend divided by the new visitors from that link.
5. Stop rule: the test ends when cost per user goes above what a user is
   worth, or above the user's stated limit.
