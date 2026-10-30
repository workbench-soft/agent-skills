# Reddit comments that sound like a person, prefilled in the browser

## What it does for the person

- **Threads to answer** the agent reads the hot threads of the subs the
  person names and keeps the ones where a question matches something the
  repo already does: a skill, a rule, a script.
- **A draft per thread** 2 to 4 sentences in the person's voice, with one
  concrete detail from the repo and no sales line.
- **One click to post** a script opens each thread in Chrome, signed in
  once, and types the draft into the comment box. The person reads it and
  presses Comment.
- **A record** each posted thread gets a line in `TODO.md`, so the next run
  skips it.

## User flows

1. The person asks for threads to answer, with or without a list of subs.
2. The agent reads the repo and lists its practices in one line each.
3. The agent pulls the hot threads through the Reddit MCP server and picks
   the ones a practice answers.
4. For each pick the agent reads the post and the top comments, then writes
   a draft that adds something the thread lacks.
5. The agent shows the picks with the drafts and writes them to a queue file.
6. The script opens the first thread in Chrome. On the first run the person
   logs in to Reddit in that window.
7. The script types the draft into the comment box and waits. The person
   edits if needed, presses Comment, then presses Enter in the terminal.
8. The script moves to the next thread. At the end it marks each item as
   posted or skipped in the queue file.
9. The agent moves the posted ones to `TODO.md` as done.

## How it works: modules, files, data

- **`skills/reddit-comments/SKILL.md`** the steps above, the rules for
  picking a thread, and the rules that keep a draft out of the AI register.
- **`skills/reddit-comments/references/voice.md`** what an AI comment
  sounds like and what to write instead, with a bad and a good pair.
- **`skills/reddit-comments/scripts/prefill.py`** reads the queue file,
  opens Chrome through Playwright with a profile of its own, finds the
  comment box on new or old Reddit, types the text and waits for Enter.
- **Queue file** JSON, one object per thread: `url`, `text`, and after the
  run `status` (`posted`, `skipped`, `error`).
- **Profile** `~/.reddit-comments/profile`, outside every repo. The Reddit
  login lives there and nowhere else.
- **Reddit MCP** `fetch_reddit_hot_threads` and `fetch_reddit_post_content`
  from `mcp-reddit`. Without the server the agent asks the person to add it.

## Limits

- **Reads only** the script posts nothing. The Comment button stays with the
  person, so a wrong draft costs one read, not a post.
- **Hot only** the MCP server returns the hot list, with no search and no
  new sorting. A thread older than a week rarely shows up.
- **Chrome** the script needs Google Chrome on the machine. It runs through
  `uv run --with playwright`, so no browser download.
- **Reddit markup** new Reddit changes its comment box now and then. The
  script looks for the editor, the "Join the conversation" box and the old
  Reddit textarea, and names what it missed.
- **Untested while logged in** the first run was checked only logged out:
  the login wait fires, the "Join the conversation" box is found. The typing
  into the open editor waits for the first logged-in run.
- **Pace** 3 items per run by default, since a young account that comments
  fast gets filtered. The skill asks for 2 a day in the first week.

## Changes

### 2026-10-31 the skill, the voice rules and the prefill script

- **Why** picking threads and drafting replies by hand took an hour a day,
  and the drafts read like a bot. Posting through an agent browser failed:
  both agent browsers refuse reddit.com.
- **Changes** the new skill folder, a `README.md` entry, a line in
  `docs/features.md` and `CHANGELOG.md`.
- **Steps** this spec, then the script, then the skill and the docs.
- **Docs** `README.md`, `docs/features.md`, `CHANGELOG.md`.
