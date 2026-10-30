---
name: marketing
description: 'Use when the user asks to market or promote a site or an app, get the first users, write a marketing plan, post on Reddit, Hacker News, Product Hunt or forums, register on forums, pitch journalists or creators, plan a promotion budget, or make money from a side project, in any language: "do the marketing", "promote the app", "get users", "сделай маркетинг", "продвинь сайт", "запости на реддит". Starts with the budget, total or per year, shows what that sum buys and what a larger one would add, then writes the message and a launch calendar, gets the product ready for visitors, signs up on the chosen sites in the browser with the user logging in, posts and replies to comments, contacts journalists and creators, leaves a plan file for the next run, and writes TODO.md with the tasks left for the user.'
---

# Market a site or an app

Win the first users for a small product within the user's budget, then keep
them arriving through a routine the user can sustain.

The user MAY have zero marketing knowledge. Take the decisions yourself and
give each a one-line plain reason. Ask questions only at the steps that call
for one.

## Logins and accounts

- **Browser** drive whatever browser tool the agent has: the VS Code browser
  tools, or the `agent-browser` skill. Without one, hand the user the link and
  the clicks as numbered steps, one per line, and wait.
- **Sign-up** complete the form: name, handle, email. The password, the
  captcha and the email link are the user's part. A password, a 2FA code or
  card details MUST NOT be typed by the agent.
- **One handle** keep a single handle and avatar across the sites, so people
  know the maker. Ask for it once, in step 2.
- **Profile** write the bio: a line about the product plus the link, on sites
  that allow a link.
- **Record** log each account in the plan file: site, handle, email, date.
  Passwords MUST be left out.

## 1. Read the project

The repo rules MUST beat this skill. Start with `AGENTS.md`, `CLAUDE.md` and
the README, open the live site or the store page, then look for:

1. **What it does** who it serves, and how it differs from the well-known
   option.
2. **Where it lives** the domain, the store links, if the repo is public.
3. **The work already there** a `docs/marketing*.md` file or a README section
   on marketing, search and ads. Found a plan file from a past run? Read its
   calendar and jump to step 8.
4. **What it earns** ads, donations, a paid tier, or no income.
5. **What counts visits** the site's analytics, when there are any.

```bash
ls docs/marketing*.md docs/*plan*.md 2>/dev/null
git grep -liE 'og:image|opengraph|sponsors|buymeacoffee|ko-fi|ca-pub-|gtag|cloudflareinsights' -- ':!*.lock'
```

## 2. Ask the budget first

Put the questions in a single form, money at the top, prefilled with the
step 1 guesses:

- **Money** the sum the user will spend, as a total or per year. Options: $0,
  up to $100 a year, up to $500, up to $2000, more.
- **Time** the hours per week the user has. Options: 1, 2, 5, 10.
- **Goal** users, money, donations, or feedback and GitHub stars.
- **Audience** country, language and type of person. Prefill the guess.
- **Handle** the name posts go out under: the person or a brand.

## 3. Show what the budget buys

Read [references/budget.md](references/budget.md), then post in the chat:

1. **The spend table** item, price, timing, yes or no, and the total.
2. **What to expect** from this budget and these hours, in plain numbers,
   marked as a guess.
3. **The next tier up** its price, the specific things it buys and the gain,
   marked as a guess. Each run MUST show the user this line.
4. **When more money won't help yet** state it, and name the point at which
   it starts to pay off.

Carry on with the user's budget. If it goes up later, this step runs again.

## 4. Write the message

A reader judges from a single line whether a post concerns them. Write:

- **One sentence** what it does, who it is for, and the price: "Free map of
  every speed camera in Australia, no sign-up." Use the same words on each
  site.
- **Selling points** 3 to 5 of them, each a fact the reader can verify.
- **Audiences** 3 at most, each with its pain, its message and its channels.
  A post speaks to one audience with one message.
- **Framing** the benefit that moderators and press take well: "know the
  limit" beats "dodge fines". Setting the product beside a giant draws a list
  of what it lacks.
- **Name check** search for the product name. A clash with a big name goes to
  the user before launch, since a later rename loses the links already
  shared.

Posts are written in the audience's language.

## 5. Ready the product for visitors

A visitor who leaves at once stays gone, so fix these ahead of the first post.
Look at the live site, then close the gaps in code:

- **Link preview** a 1200×630 Open Graph image and a description. Lacking
  them, a link in Reddit or a chat appears as a bare line.
- **First screen** the main feature working, a tap away from the landing.
- **Feedback** a "Report a problem" or "Suggest a feature" link to GitHub
  issues or email. Early bug reports turn into the next post.
- **Share** a share button, or a URL that reopens the same view.
- **Trust** About, Contact, a privacy policy, the repo description and
  homepage: `gh repo edit --description "..." --homepage "https://..."`.

`seo-setup`, `ads-setup` and `play-release` own search, ads and the store.
Something missing there? Offer to run that skill instead of redoing its work
here.

Once the repo checks pass, commit each fix in the repo's commit style.

## 6. Pick the channels

Read [references/channels.md](references/channels.md). Choose the places
where the audience already asks for what the product offers.

- **Fit the hours** 1 hour a week covers one community and its replies. Short
  videos take 2 more hours.
- **Video** ask if the user will record the screen or talk on camera, and ask
  only once a video channel is on the list.
- **Order** quiet places come first, where friendly people find the bugs, then
  the big launch sites, then local and hobby communities.
- **Season** a peak date for the topic, such as a holiday or a new financial
  year, gets a press push 2 to 4 weeks ahead.

## 7. Write the plan file

Create `docs/marketing.md` in the target repo, or update the existing one.
Follow `writing-style`. The sections, in order:

1. **Budget** the spend table and the next tier line.
2. **Message** the sentence, the selling points, the audiences.
3. **Channels** a table: where, what to post, the self-promotion rule.
4. **Calendar** a table: date, place, title, state, link, visits.
5. **Accounts** site, handle, email, date.
6. **Routine** weekly, monthly, seasonal, with the minutes for each.
7. **Skip** what to leave unbought or undone, each with a line of reason.

Each calendar row gets its ready text in the file. The templates are in
[references/texts.md](references/texts.md). Read it.

Show the calendar and the texts in the chat and ask for a single go. The first
text under the user's name MUST wait for that go. After it, post on schedule
with no question each time.

Commit the plan file.

## 8. Register and post

Read [references/posting.md](references/posting.md). For each calendar row
due today:

1. **Rules** read what the community says on self-promotion. If it bans it,
   mark the row skipped, or ask the moderators politely.
2. **Account** missing? Sign up now. On a site that restricts new accounts,
   the post moves to a later date, with a warm-up before it.
3. **Post** fit the text to the place: its words, a screenshot of its city or
   topic. Attach the shots and the GIF from `docs/screenshots/`, picked by
   their captions in `demo/shots.json`. A Reddit image or video post with
   the link in the first comment SHOULD win where the sub allows it. No
   shots yet? Run the `demo-media` skill first.
4. **Check** view the post logged out. If a filter removed it, send the
   moderators one polite note.
5. **Replies** reply to each comment during the session.
6. **Record** put the link and the state in the calendar.

Rows due later are left for the next run. Put that date in the plan file.

## 9. Write to journalists and creators

The email templates are in [references/texts.md](references/texts.md). Read
them.

1. Pick 10 people: journalists who wrote on the topic in the past year, and
   small creators or teachers in the niche.
2. Take each contact from the person's own page. A guessed address SHOULD NOT
   be used.
3. Open each email with a personal line about something that person made.
4. After the step 7 go, send from the user's mail in the browser, or leave
   drafts if the user prefers.
5. Follow up a single time after a week, then stop.

## 10. Measure and adjust

At each run, check the visit counter and every post link:

- **A post under 50 visits** means the place is a poor fit. Go to the next.
- **A place that brings people** gets its next post earlier.
- **Paid tests** begin only once a free post proved demand, and each one runs
  under the stop rule from the budget file.
- **Results** are written into the calendar rows.

## 11. Money

If the goal is money or donations, or the product already earns, read
[references/money.md](references/money.md).

## 12. Write TODO.md

`TODO.md` at the target repo root MUST hold each task this run leaves for the
user. Touch only the `## marketing` section, adding or updating it.

- **One task per line** a checkbox, the task, the place, and the date.
- **Next run** the date of the next `marketing` run comes last.
- **Done tasks** come off once the user says so or the site shows it.
- **Secrets** passwords and private emails MUST be left out.

```markdown
## marketing

- [ ] Click the confirm link in the email from reddit.com
- [ ] Answer new comments on the r/australia post: <link>
- [ ] Run `marketing` again on <date> for the next calendar rows
```

Commit it together with the plan file.

## 13. Report back

1. The spend table and the next tier line.
2. Each post, its link and its first numbers.
3. Each account that was created.
4. The commits, a line for each.
5. The date of the next `marketing` run, what it will do, and the `TODO.md`
   tasks.

## Guardrails

Honest:

- **One account** for each person on each site. Sock puppets, bought votes,
  bought reviews and bought followers MUST NOT be used. Reddit and Google ban
  the entire domain over them.
- **Disclose** each post and reply about the product MUST state that the user
  made it.
- **Pace** a single community per day, with the text reworded each time. One
  text in many places on the same day looks like spam.
- **Claims** a post MUST NOT promise what the product can't deliver, or help
  anyone break a law.
- **Messages** cold DMs to strangers on Reddit or forums SHOULD NOT go out.

Money and data:

- **Spend** each payment MUST get the user's agreement first. The user enters
  the card, and the agent sets the daily and total caps.
- **Copyright** a video or post MUST NOT carry music, tabs or images the user
  holds no rights to.
- **Secrets** a password, a token or a private email MUST stay out of the repo
  and the chat.
