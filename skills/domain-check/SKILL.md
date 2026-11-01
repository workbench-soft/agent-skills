---
name: domain-check
description: 'Use when someone wants a name for a business, a brand, an app or a site, or wants to know whether a name or a domain is free, in any language: "find a free domain", "suggest a name for", "is this name taken", "check the domain", "check the trade mark", "придумай название", "проверь свободен ли домен", "проверь имя в реестре". Suggests names for the topic, then checks them in batches with a script: .com, .com.au and .au domains, the Australian Business Register for company, business and trading names, and the IP Australia trade mark register. Answers with a table of free, risky and taken names, and the names it would pick with the reason.'
---

# Find a free name and check it

The answer MUST be a table of checked names and a short list of picks. Each
pick MUST have its domains free and no live trade mark with the same words.

The agent MUST load the `writing-style` skill before the first line a person
reads, unless it is in context.

## 1. Get the brief

The agent MUST read the topic from the request. It SHOULD ask through the
question tool only for what changes the names, and only when the request
leaves it out:

- **What it is** the agent MUST know the product or the business, and who
  buys it.
- **Tone** it SHOULD know the tone: plain and clear, playful, premium,
  technical.
- **Fixed parts** it MUST honour a word, a length cap, a sound or a language
  the person asks for.
- **Names of their own** candidates the person already likes MUST go in the
  first batch as they are.

## 2. Suggest the first batch

The agent SHOULD write 25 to 40 candidates. It MUST read
`references/naming.md` for the patterns and the filters before writing them.

- **Spread** each pattern in the reference SHOULD get a few names, so the
  batch doesn't cluster on one idea.
- **Spellable** a name heard once SHOULD be typed right. The agent SHOULD
  drop names with hyphens, digits or doubled letters at a word join.
- **Length** the domain label SHOULD stay under 15 letters.

## 3. Run the batch

The agent MUST check each batch with the script:

```bash
mise x -- python <skill-dir>/scripts/check_names.py --json --file names.txt > checked.json
```

`<skill-dir>` is the folder of this file. The agent MUST write `names.txt` in
the scratchpad, one name per line, spaces kept: `Kiwi Nest`. Without
`--json` the script prints a Markdown table.

- **What it checks** the script MUST check `.com` through Verisign RDAP,
  `.com.au` and `.au` through DNS, then the auDA whois for the best rows. It
  searches ABN Lookup and IP Australia by the words.
- **Rate limits** auDA bans an address for a day after about 15 RDAP lookups.
  The agent MUST NOT call the auDA RDAP or whois by hand.
- **`free?`** the `.au` name is missing from DNS and whois wasn't asked or
  didn't answer. A registered name on hold can look like this. The agent
  SHOULD rerun the finalists with `--confirm 10` later, or check them at a
  registrar.
- **Errors** a row with `error` lost one check. The agent SHOULD rerun only
  those names.

## 4. Second round

The agent SHOULD take the 3 to 5 best free or risky names and write 10 to 20
variants around them: the same root with another ending, a second word, a
shorter form. It MUST run them through step 3 with the first batch's winners
again.

A third round MAY follow when fewer than 3 names come back free.

## 5. Read each verdict

The agent MUST act on each verdict as this table says:

| Verdict   | Meaning                                                                          | What to do              |
| --------- | -------------------------------------------------------------------------------- | ----------------------- |
| `free`    | all domains free, no business or live mark with the words                        | a pick                  |
| `risky`   | `.com` or `.au` taken, a business uses the name, or live marks contain the words | open each hit and judge |
| `taken`   | a live mark with the same words, or `.com.au` registered                         | drop it                 |
| `unknown` | a check failed                                                                   | rerun it                |

The agent MUST read `references/naming.md` when judging a `risky` row. The
trade mark class and the owner's field decide most of them.

## 6. Answer

1. The answer MUST open with one line on the top pick and its reason.
2. It MUST give a table of every checked name, `free` first: the name, each
   domain, the ABN hits, the trade mark hits and the verdict.
3. It MUST give the picks, 3 to 5, each with one line on why it beats the
   rest.
4. It MUST name the limits from the list below that affect these picks.

- **Links** each trade mark hit in the answer SHOULD link to its IP Australia
  page, from the `url` field.
- **Not legal advice** the answer MUST say a clear search is a signal. A name
  for a real business SHOULD go to a trade mark attorney before money goes on
  it.
- **`.com.au`** needs an ABN or ACN and a close tie to the name. The answer
  MUST say so when the person has no ABN yet.
- **Buying** the agent MUST NOT register a domain or file a business name. It
  MUST link the registrar, ABN Lookup or IP Australia, and the person does it.
