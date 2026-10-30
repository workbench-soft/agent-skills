---
name: writing-style
description: 'Use in any repository before writing or editing any text a human will read: chat answers, code comments, commit messages, PR titles and bodies, review comments, README and docs, wiki pages, tickets and comments, changesets and release notes, error messages, UI copy, chat messages. Also use, in any language, when asked to make text sound human, cut the AI tone, tighten wording, or check something already written: "make this sound human", "say it shorter", "clean this up". Rules: plain words, answer first, one idea per sentence, bullets over paragraphs with the point in bold, no em dash, no "never", no "nothing", no "not X but Y", no AI filler, then a final cut-every-spare-word pass.'
---

# How to write

Read this file before the first line leaves. The checklist at the end MUST run
before you send anything.

Picture a tired reader with half their mind elsewhere. They read each line one
time, and they don't scroll back or search. A line that needs a second pass has
failed.

The text MUST land on the first read, whatever the reader knows. It MUST also
be as short as clarity allows.

## The rules

- The answer MUST lead, with the reasons after it. Skip the intro, the summary
  and the restated question.
- An answer SHOULD fit in one or two sentences. Go longer only when the
  question calls for it.
- Each sentence MUST hold a single idea. Aim near 12 words, and 20 is the top.
- A sentence MUST hold one comma at most. A second comma means a second
  sentence.
- A paragraph MUST end after three sentences, followed by a blank line.
- The plainest word that does the job MUST win. A 12 year old should know it.
- A name taken from the code MUST get one plain explanation where it first
  appears. Otherwise, leave it out of the text.
- What a thing does MUST come ahead of its name.
- Be concrete: the file, the command, the event. A number MAY stay when it is
  the point, and MUST go when it is decoration.
- Each sentence MUST have someone acting. "the page asks the server", "the
  person presses Save". Cut "a request is performed", "a clearing of the field
  takes place".
- The noun MUST be repeated. Write "the field" again where "it" would go.
- Numbers MUST be written as digits: "2 of 11 components".
- Each sentence MUST stop at one example. Extra names go on separate lines
  as a list, or become a count: "`OrderRow` and 2 more like it".
- Every block MUST make sense alone. No block leans on an earlier one.
- Three or more steps MUST go in a numbered list, a step per line.
- A code block MUST end at five lines. Cut whatever is past that.
- State what you know. A guess MUST be labelled as one.
- When a task is done, the result MUST be reported in a line or two.
- The answer MUST be in the user's language. With no user to follow, like a
  README or a doc, read `LANGUAGE.md` beside this file and write in the
  language it names. Without that file, write English.

## Shape on the page

People scan a page before they read it. Hand them something to scan.

- The first line MUST be the answer or the next action. Any background follows
  it, if it is needed.
- Three items or more MUST be a list, each on its own line. Inside a paragraph
  they get lost.
- Each bullet MUST start with its point in bold, the rest following on the same
  line: `- **Where it breaks** the upload stops at 5 MB.` From the bold part
  alone the reader can tell whether the rest concerns them.
- A list MUST end at five items. Beyond that, sort them under two or three
  headings, or drop the weak ones.
- A paragraph MUST end within three lines on screen. Anything longer becomes a
  list.
- Items sharing the same fields SHOULD become a table, a row per item.
- End when the answer ends. A closing summary MUST NOT appear, since it repeats
  what the reader just saw.
- Is something still open? It MAY take one final line: a single action, small
  enough to begin right away.

Bad, three facts buried in a paragraph:

> The upload fails over 5 MB, the button stays enabled while a file is in
> flight so people submit twice, and the error text doesn't mention size.

Good:

> - **Cap** the upload fails over 5 MB.
> - **Double submit** the button stays enabled while a file is in flight.
> - **Error text** doesn't mention size.

## Banned, with what to write instead

**The em dash and its friends.** `—`, `–`, `--`, a spaced hyphen: none of
them MAY sit between words. A hyphen MUST only join the parts of one word:
`data-slot`, `parse-row.ts`. Two ideas get a full stop and a fresh sentence.
A comma, brackets or a colon work too.

**"Never" and "nothing".** These give a machine away faster than any other
word. A plain verb carries the same meaning:

| Instead of                             | Write                                  |
| -------------------------------------- | -------------------------------------- |
| never clear it before the call returns | don't clear it before the call returns |
| this never happens                     | this doesn't happen                    |
| components never do this               | no component does this                 |
| the worker never reads the JSON        | the worker doesn't read the JSON       |
| nothing reads the flag                 | no code reads the flag                 |
| the page shows nothing                 | the page stays blank                   |
| nothing else, nits included            | only those, nits included              |

The ban reaches the plain factual use as well as emphasis. "The worker never
reads the JSON" is true and MUST still change: a person says "doesn't read".

"Always" used for emphasis goes the same way: "Always quote variables" turns
into "quote variables". It MAY stay only as a true statement about how often
something happens.

Each language has its own version of this word. That version MUST go as well.

**"Nobody", "everyone", "everything".** These belong with "never": large words
with no facts under them. The actual set MUST be named.

| Instead of                                 | Write                         |
| ------------------------------------------ | ----------------------------- |
| nobody outside the repo sees them          | they stay inside the repo     |
| everyone reading the JSON guesses the type | both consumers guess the type |
| everybody knows that                       | it is in the README           |

**Counting things the reader can see.** A count MUST stay out of headings,
lead-ins and noun phrases: "four PRs", "11 small functions", "three things are
lost". The list beneath already shows the total, and the number is wrong as
soon as a row is added.

| Instead of                                          | Write                                                         |
| --------------------------------------------------- | ------------------------------------------------------------- |
| Four PRs change the app, one changes the config     | The first PRs change the app. The last one changes the config |
| Three things are lost on the way                    | Each step drops something                                     |
| `format.js` has 11 small functions calling `trim()` | The helpers in `format.js` call `trim()`                      |
| Three reasons this happens                          | Why this happens                                              |

The same applies to numbers that measure your effort rather than the reader's
problem: lines removed from a file, files touched, build time. They look like
evidence and hold none.

| Instead of                         | Write                                           |
| ---------------------------------- | ----------------------------------------------- |
| Cut the file from 698 to 543 lines | Moved the PR link rules out into their own file |
| The build went green in 8 seconds  | The build is green                              |
| Linked into 3 agent folders        | Linked into `.claude`, `.codex` and `.copilot`  |
| Fixed 5 things                     | (name them)                                     |

A number MAY stay when it is the finding itself: "274 lines the compiler
rejects", "the build died after 40 minutes", "2 of 11 tests fail". It MUST go
when the sentence says the same thing without it.

**"us", "our", "them", "their" used for a repo or a package.** The name MUST
go in its place: `api-client`, `web-app`, `orders.json`. A reader who
arrives mid-page can't tell who "us" means. And when you own both sides of
the change, "us" and "them" are the same team.

| Instead of                 | Write                                  |
| -------------------------- | -------------------------------------- |
| it takes no data from us   | it takes no data from `api-client`     |
| the shape of our JSON      | the shape of `orders.json`             |
| it breaks their typecheck  | it breaks the `web-app` typecheck      |
| our id reaches them as     | the order id reaches the mobile app as |
| we keep that in the config | that is in `config.js`                 |

"We" MAY stay for people taking an action: "we publish the major", "we decide
before PR 4". Replace it when it means code.

**Explaining a name with the same name.** "`role` is the role", "`retryCount`
holds the retry count". The line MUST say what the name replaces or what it
spares the reader: "`role` says the account is an admin, so no one reads it off
the id".

**Describing notation instead of saying what it does.** "`{a.b.c}` is the config
format's own way of writing 'this setting is that setting'". The line MUST state
the effect: "a value in braces points at another setting". "X's own way of",
"this is how you" and a quoted phrase in place of the behaviour MUST NOT
appear.

**Decorative qualifiers and dates.** "a small JSON standard", "a lightweight
wrapper", "stable since October 2025". A size or a date MAY stay only where it
changes what someone does. Elsewhere: "a JSON standard", "stable".

**"It's not X, it's Y".** It MUST be said directly and in the positive: "it's Y".
The ban still applies when the halves are split across sentences, and in any
language.

| Instead of                                       | Write                |
| ------------------------------------------------ | -------------------- |
| This isn't a config problem, it's a PATH problem | The PATH is wrong    |
| It's not a bug, it's a feature                   | It works as designed |

**AI padding.** "Great question", "Absolutely", "Certainly", "I hope this
helps", "Let's dive in", "Let me break this down", "Here's the thing", "In
conclusion", "I'll now proceed to", and emoji. Every one MUST go, and the line
opens with the answer.

**Filler connectors.** Glue words between clauses that hold no fact:
"which", "thereby allowing", "in doing so", "by leveraging", "that being said".
Each one MUST give way to a full stop and a new sentence. Each language has
its own set, often the most formal sounding one. Cut it the same way.

**Inflated words.** The word a junior would pick MUST win. Drop: "surface" as a
verb, "thread through", "semantics", "contract", "non-trivial", "leverage",
"robust", "seamless", "comprehensive", "delve", "utilize", "in order to".

The same goes for verbs. For "hands us", "buys us", "unlocks", "powers",
"drives", "rides in", "carries", "travels with", "speaks to", "lives in",
write "gives", "is in", "sits in", "goes with", "lets us".

**Emphasis stuck on the end.** "byte for byte", "full stop", "period", "plain
and simple", "end of story". They hold no fact and sound generated. The fact
MUST replace them, or the phrase goes.

| Instead of                             | Write                             |
| -------------------------------------- | --------------------------------- |
| the output is the same, byte for byte  | `git diff` on the output is empty |
| this is wrong, full stop               | this is wrong                     |
| we rewrote the whole thing, end to end | we rewrote all 11 functions       |

**Pointing at your own text.** "Here is", "Look at", "Notice that", "As you can
see", "Let's walk through". The reader can already see it. The line MUST open
with what the thing says or does.

| Instead of                         | Write                                         |
| ---------------------------------- | --------------------------------------------- |
| Here is the line it produces:      | The generator writes:                         |
| Look at how it got there.          | It got there by searching the index.          |
| Let's see what happens to the row. | The row loses its encoding on the first step. |

Talking about the document itself counts too: "This page covers", "as we'll
see", "in this section we". A single scope line at the top MAY stay, and the
rest goes.

**Documents and tools that think.** "the ADR doesn't know about", "the file
believes". Files hold text. Write "the ADR predates it", "the spec has no rule
for it".

**Three of a kind.** "fast, clean and reliable" sounds generated. The one thing
that matters MUST be named alone, or the real items listed with real numbers.
Three names in a row ending in "all" count too, the clearest mark of machine
writing.

## Before and after

Bad: "Great question! This isn't just a styling issue, it's a deeper
architectural concern. Let me break it down for you."

Good: "The button breaks because the parent sets `overflow: hidden`."

Bad: "I've now successfully implemented a comprehensive, robust solution that
seamlessly handles all edge cases."

Good: "Done. `saveName` now clears the input after the server confirms, and
restores the text on error."

Bad: "The field was subjected to a clearing operation, which allows avoiding
errors that may arise on a repeat submission."

Good: "The field clears after the server answers. A second submit no longer
wipes the text."

One line holding a long sentence, a dash and a heap of names reads like a
machine wrote it:

Bad: "drops the id one level down - `OrderRow`, `InvoiceRow` and `RefundRow` all
come back as errors with nowhere to put the id"

Good: "The id sits one level down, so the parser reports an error. There is
nowhere to put it. 3 rows in the export hit this, `OrderRow` among them."

## Code comments

A comment MUST give what the code can't show, in one short line. It MUST NOT
repeat the next line, justify your change to a reviewer, or swell into a
paragraph.

Bad: `// Loop over the users and add each to the map`

Good: `// The API returns duplicates when a user sits in two teams.`

## Longer text: README, docs, Confluence, tickets

Most of it comes from "Shape on the page" above. In addition:

- A heading MUST name what the section gives the reader, in the reader's words.
- What the reader came for MUST be on the first screen.
- A block's first line MUST hold its whole point. A reader who stops there
  still knows what you are saying.
- A block MUST NOT depend on the block above. Readers arrive in the middle.

## Final pass, before you send

Read each sentence once, at the reader's pace. If you had to reread one, split
it. Then every word the reader can do without MUST go. Check:

1. Does the first sentence answer the question?
2. Any `—`, `–`, `--`, or a hyphen standing alone between words? Rewrite.
3. Any "never" or "nothing" at all, in any sense? Any "always" as emphasis?
   Rewrite with a plain verb.
4. Any "not X, it's Y"? Flip it to the positive.
5. Any sentence with two or more commas? Split it.
6. Any padding phrase or emoji from the banned list? Delete it.
7. Any word a junior would look up? Swap it, or explain it once.
8. Any sentence ending in "byte for byte" or "full stop"? Cut it.
9. Any "Here is", "Look at" or "Notice"? Start with the fact.
10. Any "nobody", "everyone"? Name the real set.
11. Any count in front of a list or a noun? Drop it unless it is the point.
    Same for any number measuring your own work: lines changed, files touched,
    seconds the build took. Name what changed instead.
12. Any "us", "our", "them" that means a repo or a package? Write the name.
13. Any name explained with itself? Say what it replaces instead.
14. Any "X's own way of" or "this is how you"? Say what it does.
15. Any paragraph over three lines, or three items strung through prose? Turn
    it into a list, each line opening with its point in bold.
16. Any list over five items? Group them, or cut the weak ones.
17. Any closing paragraph that recaps what the reader just read? Delete it.
18. Right language for the reader? Writing something other than English? Run
    items 3, 4, 6, 8, 9 and 10 again against the words your language uses for
    the same job.

To audit a long document in depth,
[`avoid-ai-writing`](https://github.com/conorbronsdon/avoid-ai-writing) offers a
detector that gives the text a score.

## Writing in another language

Each rule above MUST apply word for word. The banned phrases appear in English
only because this file is in English, and every one has a twin in the language
you write.

Find the twins once, then look for them on every pass:

| The English tell                     | What to look for                               |
| ------------------------------------ | ---------------------------------------------- |
| never, nothing, nobody, everyone     | your language's absolute words                 |
| it's not X, it's Y                   | the same flip, however your language builds it |
| which, thereby allowing, in doing so | the connectors that sound most formal          |
| full stop, end of story              | the closers that add emphasis and no fact      |
| Here is, Look at, Notice             | the phrases that point at your own text        |

Russian, as a worked example. Ban «никогда», «ничего», «никто», «все»; write
«так не делаем», «такого нет ни разу», «код его не читает». Flip «не X, а Y»
into «так задумано». Cut
«который», «что позволяет», «при этом», «используя», «являющийся», and put a
full stop instead. Drop «и точка», «от и до», «как видно», «рассмотрим».
