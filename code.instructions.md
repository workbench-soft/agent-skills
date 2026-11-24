# Code rules

These rules MUST hold in each repo the agent works in. A repo's `AGENTS.md`
MAY override a line here, and it MUST state the reason. A private rules file
of the person MAY add to these rules, and its line MUST win where both speak.

- **Key words** MUST, MUST NOT, SHOULD, SHOULD NOT and MAY in agent docs MUST
  be read as in BCP 14 ([RFC 2119](https://www.rfc-editor.org/rfc/rfc2119),
  [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174)).
- **Order** these rules MUST win over a skill's defaults on which tool to
  use, and the skill MUST get fixed.
- **How work ships** an agent MUST follow `workflow.instructions.md` beside
  this file for specs, worktrees, PRs, `TODO.md` and the end of a session.
- **How text reads** an agent MUST follow `writing-style.instructions.md`
  beside this file.

## Agent docs

An agent doc is `AGENTS.md`, an `*.instructions.md` file, or a skill's
`SKILL.md` with its references. Each one MUST follow the lines below.

- **Key word in each rule** each paragraph and list item MUST hold MUST,
  MUST NOT, SHOULD, SHOULD NOT or MAY, in capitals.
- **Tables and code** a table or a code block MUST follow a line with a key
  word that covers each row in it.
- **Lowercase** "must", "should" and "may" MUST NOT appear in an agent doc.
  A softer rule MUST use SHOULD or MAY.
- **Check** a repo that holds agent docs SHOULD run `scripts/keyword-check.mts`
  of `agent-skills` in its lint task.

## Newest, and the same in every repo

- **Newest stable** a new tool, library or SDK MUST start at its latest
  stable release. The agent MUST check with `mise latest <tool>` or the
  registry, since memory is out of date.
- **One tool per job** a repo MUST NOT add a second tool for a job one of
  its tools already does.
- **Pinned** each version MUST sit in `mise.toml` where the repo has one.
  pnpm MUST also sit in `packageManager`, and lockfiles MUST be in git.
- **Free** each tool, library and service MUST be free, or stay in its free
  tier. A paid one MUST have the owner's yes in the spec.

## Less code

- **Short** code MUST take the fewest lines that stay clear. A file SHOULD
  stay under 100 lines, and a longer one SHOULD split by job.
- **Libraries first** a maintained library that does the job MUST win over
  code written by hand.
- **Reuse** the agent MUST search the repo and its packages before writing.
  Code that repeats existing code MUST call that code instead.
- **Memory** before an answer about past work, the agent SHOULD search the
  memory MCP server where one is set up, such as MemPalace.

## Languages

New code MUST use the language in its row, unless the repo already uses
another one for that job.

| Code                                        | Language                                                                                           |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| UI, web, Workers today                      | TypeScript, `strict` on                                                                            |
| Backend, CLI, shared logic, heavy work      | Rust                                                                                               |
| Android native code and Expo native modules | Kotlin                                                                                             |
| iOS native code                             | Swift                                                                                              |
| Scripts                                     | TypeScript run by Node. Python through uv only for a library Node lacks. POSIX `sh` for installers |

New code MUST NOT be Java, plain JavaScript or C#.

## What the person sees in an app

- **Each language** each string a person sees MUST ship in each language the
  app ships, in the same change. Errors from native code or a server MUST
  reach the person translated too. The agent MUST load `translations` before
  it adds or changes such a string.
- **Each step** each step an app takes MUST show on screen while it runs, and
  an action the person asked for MUST finish without a second tap. The
  `visible-work` skill holds the signs and the check.

## Skills for every change

Each skill's description loads in each session, so the agent SHOULD pick a
skill by its description. The skills below MUST load in each change, before
the job in their row:

| Job                                                       | Skill           |
| --------------------------------------------------------- | --------------- |
| Any text a person reads                                   | `writing-style` |
| A string a person sees in an app                          | `translations`  |
| App code that runs work after a tap, a command or a timer | `visible-work`  |
| Before the first edit                                     | `specs`         |
| Before the worktree, and after the merge                  | `feature-queue` |
| Before the first command                                  | `mise`          |
| A checkout for the work, and cleanup after the merge      | `git-worktrees` |
| Commit, PR, merge and cleanup                             | `ship-change`   |
| Open or update a PR                                       | `create-pr`     |

A new skill SHOULD go to `agent-skills`. Its description MUST name the job
and the words that trigger it.
