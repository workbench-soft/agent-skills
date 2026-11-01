---
name: reddit-comments
description: 'Use when someone wants Reddit threads to answer about their repo, product or workflow, a draft comment for each, and the comment typed into the browser so they only press Post, in any language: "find threads to comment on", "what should I answer on reddit", "draft reddit comments", "prefill the comment", "найди треды на реддите", "подготовь комменты", "открой тред и вставь текст". Reads the repo for its practices, pulls the hot threads of the chosen subreddits through the Reddit MCP server, keeps the threads a practice answers, writes a short comment in a human voice for each, then runs a Playwright script that opens each thread in Chrome and types the draft into the comment box. The person reads it and presses Comment.'
---

# Reddit comments the person only has to post

The result MUST be a queue of threads, each with a draft in the person's
voice, typed into the comment box one after another. The script MUST NOT
press Comment.

The agent MUST load the `writing-style` skill before the first line a person
reads, unless it is in context. It MUST read
[references/voice.md](references/voice.md) before the first draft.

## 1. List what the repo can say

The agent MUST read `README.md`, the skill descriptions and the rules files,
and write one line per practice: what it does and the file that holds it. A
draft MUST rest on one of these lines. A practice the repo lacks MUST NOT
appear in a draft.

## 2. Pull the threads

The Reddit MCP server gives `fetch_reddit_hot_threads(subreddit, limit)` and
`fetch_reddit_post_content(post_id, comment_limit, comment_depth)`. Without
it, the agent MUST stop and ask the person to add `mcp-reddit` to their
agent.

- **Subs** the agent MUST read the ones the person names. With none named, it
  SHOULD take the subs where people ask about the repo's topic, and MUST say
  which ones it read.
- **Limit** the agent SHOULD pull 50 to 100 per sub. The hot list is the only
  sort the server has.
- **Keep** the agent SHOULD keep a thread where the author asks a question a
  practice answers, or shares a setup a practice improves. A rant, a release
  note and a showcase with no question MUST go.
- **Prefer** a thread under 30 comments SHOULD win, since a new comment there
  gets read.
- **Done already** a thread already listed as posted in `TODO.md` MUST be
  skipped.

## 3. Read before writing

The agent MUST fetch each kept thread with 10 top comments. A draft MUST add
something the thread lacks: if a comment already says it, the agent MUST drop
the thread or answer that comment's gap instead.

## 4. Draft

The agent MUST write one draft per thread, 2 to 4 sentences, following
`references/voice.md`.

- **One detail** each draft MUST hold a number, a file or a command from step
  1, in the person's words.
- **No link, no repo name** a draft MUST NOT carry either until the person
  says the account is past its first week. A fresh account with a link gets
  filtered.
- **Their language** the draft MUST be in the thread's language.
- **Show first** the person MUST see every draft with its thread and sub
  before anything opens.

## 5. Write the queue

The agent MUST write `reddit-queue.json` outside the repo, such as in the
scratch folder, as a list of `{"url": ..., "text": ...}`. The script types a
text with a line break line by line.

## 6. Prefill in Chrome

The agent MUST run the script:

```sh
mise x -- uv run --with playwright python <skill-dir>/scripts/prefill.py reddit-queue.json
```

- **Login** the first run opens Chrome with an empty profile under
  `%USERPROFILE%\.reddit-comments\profile`. The person MUST log in once, and
  the script goes on by itself.
- **Per thread** the script types the draft and waits. The person reads it,
  presses Comment, then presses Enter in the terminal. The person MAY press
  `s` to skip or `q` to stop.
- **Resume** the agent MAY pass `--start N` to pick up at item N. Items
  marked `posted` MUST be skipped on a rerun.
- **Pace** a run SHOULD hold 3 items, and 2 a day in the account's first
  week, 10 minutes apart. Reddit removes the comments of a young account that
  posts fast, and the script MUST refuse two items with the same text for the
  same reason.
- **Chrome** the script MUST use the installed Google Chrome and download no
  browser. Without Chrome it MUST stop with that message.
- **Posting** the script MUST NOT press Comment. The person does.

## 7. Record

After the run, the agent MUST read the statuses in the queue file. Each
`posted` thread MUST get a done line in `TODO.md`, under a heading for this
work, with the date and the link. Threads with `error` MUST go there as open
tasks with the error.

## Report back

The answer MUST name the subs read, the threads picked with one line on why
each, and the count posted, skipped and failed.
