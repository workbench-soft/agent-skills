# Register and post

## Before the first account

1. The agent MUST check that the handle is free on each site in the plan, and
   SHOULD choose one that is free on all of them.
2. The accounts SHOULD share a single email, one the user reads.
3. The agent SHOULD sign up on each site during the first run. Approval and
   warm-up last days, and the posts follow later.

## Limits on new accounts

A new account MUST respect these limits:

| Site                                       | Sign-up                                | What a new account hits                                                                                                                |
| ------------------------------------------ | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Reddit                                     | email, captcha                         | many subs filter accounts that are days old or have low karma. Leave 5 to 10 useful comments in the target subs over a week, then post |
| Hacker News                                | username and password, no email        | a link from a fresh account draws flags. Comment on a few threads first                                                                |
| Product Hunt                               | Google or X login                      | the launch needs a maker profile with a photo and a bio                                                                                |
| Discourse forums, the OSM forum among them | email                                  | new users get a cap on links and images until they read and reply a little                                                             |
| Classic forums: Whirlpool, XDA             | email, sometimes a moderator approves  | approval can take days. Some cap links in the first posts                                                                              |
| Facebook groups                            | the user's own profile, join questions | the admin approves the join, then the post                                                                                             |

For a site missing from the table, the agent MUST read its FAQ or rules page
on new-account limits before the first post.

## Posting

1. The agent MUST adapt the calendar text to this place: its words, its
   rules, a screenshot of its city or topic.
2. The title MUST say what the product does for this audience. It MUST NOT
   use caps lock, emoji or "best".
3. The link MUST go where the rules ask: in the post or in the first comment.
4. The link MUST carry a tag for the channel, `?ref=reddit-sydney`, so the
   counter can tell posts apart.
5. The post MUST say "I built this".
6. The agent MUST open the post in a logged-out window. Reddit filters remove
   posts silently, and the logged-out view alone reveals it.
7. When it was removed, the agent SHOULD send the moderators one polite note:
   what the post is, that the user built it, and where it belongs. It MUST
   NOT repost.

## Replies

- **First 2 hours** settle whether a Reddit or HN post rises. The agent SHOULD
  reply to each comment in that window, briefly and kindly.
- **Criticism** the agent SHOULD agree with the part that is true and say what
  will change. It MUST NOT argue.
- **Bug reports** the agent SHOULD thank the person, open an issue, and reply
  with its link. The fix becomes the reason for the next post.
- **Session end** the agent MUST tell the user when to check back that day.
  The next run SHOULD reply to the rest.

## Pace

- **One community a day** the agent SHOULD post in one a day, with the text
  reworded for each.
- **Same sub again** MAY come after 6 months, and only with news.
- **A ban or a removal** MUST halt posting on that site. The agent MUST ask
  the moderators the reason before posting there again.
