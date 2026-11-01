---
name: app-audit
description: 'Use when the request covers a whole app, site or repo to audit, review or improve, as opposed to a single pull request, in any language: "what can be improved", "audit the app", "review the codebase from different angles", "find what to improve and fix it", "run agents on different criteria", "проверь приложение", "что можно улучшить", "прогони агентов по разным критериям". It maps the repo and starts one subagent per lens in its own worktree, all in parallel (bugs, security, architecture, simplicity, dependencies, performance, UX, reliability, platform). Each lens agent proves its findings, fixes the safe ones with a commit each and reports. The main agent checks each commit as its report lands and cherry-picks it onto the audit branch, while slower lenses still run. Proof comes from the checks, a build and the running app, and a fresh reviewer reads the diff the run made. Then it opens a PR through create-pr, merges it when CI is green, and writes TODO.md with what it left and the reason.'
---

# Audit an app and fix what is worth fixing

Several agents MUST read the whole repo in parallel, each through its own
lens, and fix the safe findings in a worktree of their own. The main agent MUST
check each commit as its report lands, pick it onto one branch and merge a
single PR. It MUST NOT ask the user a question between the request and the
merge.

Unless the `writing-style` skill is already in context, the agent MUST load it
before writing the first line a person reads.

## 1. Read the project

The repo rules MUST beat this skill everywhere but the branch rule of step 3.
The agent MUST read these first:

- The README, `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md` and
  `.github/copilot-instructions.md` MUST be read.
- The `## app-audit` section of `TODO.md` holds what the previous run left and
  the reason. Those items MUST NOT return as findings.
- `git log --oneline -20` MUST be read to learn how commits look. Some repos
  want them written as release notes.
- The manifests, the CI workflows and the commands that run the checks MUST be
  read.

The agent SHOULD map the repo with these commands:

```bash
git ls-files | sed 's|/.*||' | sort | uniq -c | sort -rn | head -20
git ls-files -z | grep -zvE '\.(lock|json|svg|png)$|lock\.yaml$' | xargs -0 wc -l | sort -n | tail -15
ls .github/workflows AGENTS.md CLAUDE.md TODO.md 2>/dev/null
```

The agent MUST post the project card in the chat. Each reviewer receives it, so
it SHOULD stay within 15 lines:

```markdown
**What it does** <one sentence, for whom>
**Parts** web UI, server, native Android app, data pipeline, infra (the ones present)
**Stack** <frameworks and versions>, <what is unusual, such as "Next.js 16, read node_modules/next/dist/docs first">
**Checks** `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`
**Ships** <how a change reaches users: deploy on push to main, release per push, store upload>
**Biggest files** <the five largest source files>
**Skip** <the items TODO.md says the last audit left>
```

## 2. Pick the lenses

Each lens MUST run when its row says so:

| Lens                                | Runs when                                               |
| ----------------------------------- | ------------------------------------------------------- |
| Bugs and edge cases                 | always                                                  |
| Security, privacy and licences      | always                                                  |
| Architecture and data formats       | always                                                  |
| Simplicity, duplication and tests   | always                                                  |
| Dependencies, tooling and CI        | always                                                  |
| Performance and cost                | the repo has code that runs                             |
| UX, accessibility and copy          | a person uses a screen of it                            |
| Reliability, offline and monitoring | network calls, background work, jobs or a data pipeline |
| Platform and store                  | a mobile or desktop app, native code, a store listing   |

- **User picked a focus** only the lenses or focus the user named MUST run,
  with Bugs added.
- **Small repo** below 2,000 lines of code, lenses MAY run in pairs, two to a
  reviewer.
- **Skipped lens** it MUST get a single line in the chat with the reason.
- **Out of scope** search, ads and marketing MUST be left to the `seo-setup`,
  `ads-setup` and `marketing` skills. The report MAY name one of them.

## 3. Make the worktrees

The work MUST happen on a new branch and finish as a PR, also in a repo that
commits straight to its default branch. A batch of fixes gets one review before
users see it.

With the `git-worktrees` skill, the agent MUST create these off the latest
default branch:

- **Audit** branch `audit-<date>`, such as `audit-2025-10-26`. The PR MUST come
  from it.
- **One per lens** branch `audit-<date>-<lens>`, such as
  `audit-2025-10-26-bugs`. It MUST stay local, and its agent commits there.
- **One at a time** the main agent MUST create them in a loop itself, since git
  locks its config for each one. It MUST copy the ignored local files into each
  one.
- **Name taken** the agent MUST add a suffix: `audit-2025-10-26-2`.
- **User's checkout** it MUST stay untouched. When a permission or a tool
  blocks the worktree, the agent MUST stop and tell the user.

A heavy build cache MAY be shared across the worktrees through its env var,
such as `CARGO_TARGET_DIR`. Each `gh` call MUST start with `GH_PAGER=cat`,
since a pager would hang it.

## 4. Start the lens agents

Before the first brief is written, [references/briefs.md](references/briefs.md)
MUST be read.

- **One subagent per lens** the agent MUST start them all together, in the
  background, each in its own worktree. Each one reviews its lens, sorts the
  findings and commits each fix.
- **Model** when the user named a model, every lens agent MUST run on it.
  Without a name, the agent's default model MUST run.
- **Security lens** it SHOULD run on a security review agent if the agent
  offers one that can edit files.
- **No subagent tool** the agent MUST run the lenses itself in turn, in the
  audit worktree, each one a fresh pass with its own brief. The commits land on
  the audit branch, and step 5 skips the cherry-pick.

Meanwhile, the main agent MUST read the code itself: the entry points, the five
largest files and the path data takes from its source to the screen. Step 5
relies on that.

## 5. Take each report as it lands

Before the first report, [references/triage.md](references/triage.md) MUST be
read. A report MUST be handled the moment it arrives, while the other agents
keep working.

Each commit on the report's Fixed list MUST go through these steps:

1. The agent MUST read it with `git -C <lens worktree> show <sha>`.
2. The agent MUST check it against the code and the Fix rules. Lens agents
   misread code, so a commit the code fails to back MUST be dropped, and its
   finding goes to Leave.
3. The agent MUST run `git cherry-pick <sha>` in the audit worktree.
4. The agent MUST run the checks over the files it touched.

- **Conflict** a few lines SHOULD be resolved by hand, then `git cherry-pick
  --continue`. A bigger one MUST get `git cherry-pick --abort` and go to the
  redo list.
- **Same fix twice** a pick that comes out empty MUST get
  `git cherry-pick --skip`.
- **Leave lines** the agent MUST read each reason. One it judges a Fix goes to
  the redo list.
- **Table** the agent MUST post the report's rows in the chat, then go on with
  no question:

| #   | Lens         | Finding                             | Where              | Decision                    |
| --- | ------------ | ----------------------------------- | ------------------ | --------------------------- |
| 1   | Bugs         | road names lose their last letter   | `build-data.ts:38` | Fix                         |
| 2   | Architecture | `cameras.json` has no format number | `camera.ts:28`     | Fix                         |
| 3   | Dependencies | move from Leaflet to MapLibre       |                    | Leave: migration, 6x the JS |

Once each commit of a lens is picked or dropped, the agent MUST remove its
worktree with `git worktree remove` and its local branch with `git branch -D`.
Its `git status --short` MUST print empty first.

### The redo list

After the last report, the agent MUST fix each redo item itself on the audit
branch, with the fix loop of the lens brief: one finding, its files, its
checks, one commit. A bug fix SHOULD come with a test that fails without it.
When the area has no tests, the report MUST say so.

### Commit messages

Every commit MUST follow these, the lens agents' included. The brief gives them
in one line.

- **Repo rules** the message MUST match them. Where release notes come from
  commits, the subject speaks to a user: "Show cameras at once in the app",
  rather than "Refactor loader".
- **Body** it SHOULD give the reason first, then one line per visible change.
- **Internal work** the subject SHOULD name it:
  `CI: pin each action to a commit`.
- **Banned** `git add -A`, `git add .` and `--amend` MUST NOT be used.

## 6. Verify

Once the last fix is in, [references/verify.md](references/verify.md) MUST be
read.

Verifying MUST take the checks, a production build, and a click through every
changed flow in the running app. A part that can't run here MUST go in TODO.md
as a line.

## 7. Have a fresh reviewer read the branch

Before the PR opens, a new reviewer with no context from this session MUST read
`git diff <base>...HEAD`. The brief for it sits in
[references/briefs.md](references/briefs.md). The agent SHOULD point it at the
likeliest breaks: new async code, caches, format changes, CI conditions.

- **Real findings** each one MUST be fixed and checked like the rest, in a new
  commit.
- **Wording** the commit SHOULD name the fix in user words: "Build the Android
  app on pull requests again".

## 8. Open the PR and merge it

The agent MUST load the `create-pr` skill and run it in create mode.

- **Changelog** the PR MUST carry an entry in the repo's own way. Commits read
  by the release notes already count.
- **CI** the agent MUST watch it with `GH_PAGER=cat gh pr checks --watch`. A
  new commit MUST fix each failing check.
- **Stuck check** one that fails on the default branch as well, or after three
  fixes, MUST go in `TODO.md` with its reason, and the PR stays open.
- **Merge** when CI is green, the agent MUST use the repo's merge method. A
  required review that blocks it MUST be waited for, and the PR link goes in
  `TODO.md`.
- **Main only CI** a workflow with no `pull_request` trigger runs on main only.
  The agent MUST then run the tests and linter locally, and merge right after
  the PR opens.
- **Clean up** after the merge, the `git-worktrees` skill MUST remove the
  worktree, its folder and its branch, local and remote.

## 9. Write TODO.md

At the root of the branch, the agent MUST add an `## app-audit` section to
`TODO.md`, or replace the existing one. It MUST commit it before the PR opens,
and again each time step 8 adds lines. The section MUST hold:

- **Left** every Leave finding and its reason MUST be there, so the next run
  skips it.
- **Yours** the tasks only a person can do MUST be there: test on a device,
  settle a product question, set a secret.
- **Check** whatever only CI verified MUST be there, such as a native build
  without an SDK here.

The section SHOULD read like this:

```markdown
## app-audit

- [ ] Test the back button and the voice warnings on a phone, on a drive (PR #2)
- [ ] Decide on dark mode: the panels need restyling, see PR #2
- Left: Next.js to Vite, saves 55 KB gzip, costs rewriting routes and metadata
```

## 10. Report back

The answer MUST open with the PR link and its merge state, then the table. Each
SHA MUST be the commit on the audit branch:

| #   | Lens         | Finding                             | Result                                |
| --- | ------------ | ----------------------------------- | ------------------------------------- |
| 1   | Bugs         | road names lose their last letter   | fixed, `2b28ffa`                      |
| 2   | Architecture | `cameras.json` has no format number | fixed, `9be68c6`                      |
| 3   | Dependencies | Leaflet to MapLibre                 | left: 6x the JS for a heading-up view |

After the table, the answer MUST list:

1. Each catch the fresh reviewer made in this run's own changes MUST get a line
   apiece.
2. What went unverified here and the reason MUST be named: no SDK, no device,
   no account.
3. The lines added to `TODO.md` MUST be listed.

## Guardrails

- **Banned git** a push to the default branch, a force push, `--no-verify` and
  `gh pr merge --admin` MUST NOT be used.
- **Releases** one MUST NOT be started by hand. The merge triggers whatever the
  repo triggers.
- **Hands off** secrets, signing keys, DNS, payment settings, store listings and
  production data MUST stay unchanged. A finding about them goes to Leave.
- **Other files** files outside the fixes MUST stay untouched, staged or not.
- **Helpers** background servers and helpers started for the checks MUST be
  stopped before the report.
