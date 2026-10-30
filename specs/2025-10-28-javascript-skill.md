# A javascript skill for faster, safer JS and TS

## Why

- **Waterfalls** agents write `await` after `await` for calls that don't
  depend on each other, so a page waits for each round trip in turn.
- **Heavy bundles** agents import a whole icon or component library through
  its index file, and load analytics and editors before the first screen.
- **Shared state** server code keeps request data in a module variable, so one
  user's data can reach another user's response.
- **Source** `web-platform` keeps 15 rules copied from Vercel's
  `react-best-practices` (MIT). The good ones belong in every JS repo, written
  the way this repo writes.

## User flows it touches

1. The user asks to write, speed up or review JS or TS code.
2. The agent loads `javascript`, finds where the code runs: server, browser or
   both.
3. It applies the async and data rules, then the bundle and browser rules for
   browser code.
4. In a review, each finding names the rule and what it costs.

## Changes

- **`skills/javascript/SKILL.md`** the steps, the async rules, the data rules,
  what to leave alone.
- **`skills/javascript/references/bundle.md`** imports, lazy loading, third
  party scripts. Read for code that ships to a browser.
- **`skills/javascript/references/browser.md`** event listeners, layout reads
  and writes, `localStorage`, idle work.
- **`README.md`** the skill under What you get, a line under Use it, credit to
  Vercel.
- **`CHANGELOG.md`** an entry under Unreleased.

Left out on purpose: the React and Next.js rules, and the micro rules a modern
engine handles on its own, such as caching a property read in a loop.

## Steps, in commit order

1. This plan.
2. The skill and its reference files.
3. README and changelog.

## Docs to update

- `README.md`: the new skill, a prompt for it, the credit.
- This repo holds skills, no app, so it has no architecture or user flow docs.
