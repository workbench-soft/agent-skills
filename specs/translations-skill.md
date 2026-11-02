# A skill that keeps every string translated

## What it does for the person

The agent loads `translations` before it adds or changes text a person sees.
Each string reaches every language the app ships in the same change, errors
from native code and servers included.

## User flows

1. The agent is about to add a label, an alert, an error or a notification.
2. It loads `translations` and finds the repo's catalogs.
3. It adds the key to every catalog in one change, in the tone each catalog
   already uses.
4. An English text from native code or a server gets a mapper to a key.
5. The catalog test and a search for hard-coded text pass before the commit.

## How it works

- **`skills/translations/SKILL.md`** the languages, the tool per stack, the
  steps to add a string, the mapper for foreign errors and the checks.

## Entries

### 2026-11-03

- **Why** Shuttrix showed the native English error "Too little to see" in a
  Russian app. The rules on languages sat in the org conventions only, and an
  agent working on native code missed them.
- **What** one skill holds every rule on translations. The conventions point
  at it.
