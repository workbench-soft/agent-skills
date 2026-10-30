# Name and domain check

## What it does for the person

The person gives a topic. The agent suggests brand names for it, checks each
one in batches and says which names are free to take, which are risky and
which are taken. It ends with the names it would pick and why.

## User flows

1. The person asks for a free name or a domain check, with a topic or a list
   of names.
2. The agent loads `domain-check` and suggests candidates for the topic.
3. It runs `scripts/check_names.py` on the candidates in one batch.
4. For each name the script checks `.com`, `.com.au` and `.au`, the
   Australian Business Register and the IP Australia trade mark register.
5. The agent drops the taken names, runs a second round around the best free
   ones, and answers with a table and its top picks.

## How it works: modules, files, data

- **`skills/domain-check/SKILL.md`** the steps: topic, candidates, the batch
  run, the second round, the verdict.
- **`skills/domain-check/scripts/check_names.py`** Python with the standard
  library only. It takes names as arguments or from a file and prints a
  Markdown table or JSON.
- **`.com`** RDAP, the JSON successor of whois, at `rdap.verisign.com`. A 404
  means free.
- **`.com.au` and `.au`** a DNS lookup first, since auDA bans an address for a
  day after about 15 RDAP lookups. The auDA whois then confirms the best free
  rows, one lookup every 2 seconds, 10 by default.
- **Businesses** the ABN Lookup search page, `abr.business.gov.au`. It covers
  company names, business names and trading names.
- **Trade marks** the IP Australia quick search,
  `search.ipaustralia.gov.au/trademarks`. A live mark with the same words
  blocks the name.
- **`skills/domain-check/references/naming.md`** how to build candidates and
  how to read each verdict.

## Limits

- **Free domain** a 404 from RDAP means no one holds it. A registrar can still
  refuse a reserved or premium name.
- **`free?`** an `.au` name missing from DNS that whois didn't confirm. A name
  on hold looks the same.
- **`.com.au`** needs an ABN or ACN and a close tie to the name.
- **Registers** both are Australian only. The script reads public search
  pages, so a change to their markup breaks that check and the row says
  `error`.
- **Legal advice** a clear trade mark search is a signal, not clearance.

## Changes

### 2025-10-29 first version

- **Why** the person wants names for a topic checked against domains, company
  names and trade marks in one go, with a verdict and a pick.
- **Changes** the skill, its script and a reference file. README and the
  changelog get an entry.
- **Steps** this plan, then the script, then the skill and the reference,
  then README and changelog.
- **Docs** `README.md` and `CHANGELOG.md`. This repo holds skills, so it has
  no architecture or user flow docs.
