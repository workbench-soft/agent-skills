---
name: app-audit
description: 'Use when the request covers a whole app, site or repo to audit, review or improve, as opposed to a single pull request, in any language: "what can be improved", "audit the app", "review the codebase from different angles", "find what to improve and fix it", "run agents on different criteria", "проверь приложение", "что можно улучшить", "прогони агентов по разным критериям". It maps the repo and starts one subagent per lens in its own worktree, all in parallel (bugs, security, architecture, simplicity, dependencies, performance, UX, reliability, platform). Each lens agent proves its findings, fixes the safe ones with a commit each and reports. The main agent checks each commit as its report lands and cherry-picks it onto the audit branch, while slower lenses still run. Proof comes from the checks, a build and the running app, and a fresh reviewer reads the diff the run made. Then it opens a PR through create-pr, merges it when CI is green, and writes TODO.md with what it left and the reason.'
---

# Audit an app and fix what is worth fixing

Several agents read the whole repo in parallel, each through its own lens, and
fix the safe findings in a worktree of their own. The main agent checks each
commit as its report lands, picks it onto one branch and merges a single PR. It
asks the user no question between the request and the merge.

Unless the `writing-style` skill is already in context, load it before writing
the first line a person reads.

## 1. Read the project

The repo rules MUST beat this skill everywhere but the branch rule of step 3.
Read:

- The README, `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md` and
  `.github/copilot-instructions.md`.
- The `## app-audit` section of `TODO.md`, which holds what the previous run
  left and the reason. Those items MUST NOT return as findings.
- `git log --oneline -20`, to learn how commits look. Some repos want them
  written as release notes.
- The manifests, the CI workflows and the commands that run the checks.

```bash
git ls-files | sed 's|/.*||' | sort | uniq -c | sort -rn | head -20
git ls-files -z | grep -zvE '\.(lock|json|svg|png)$|lock\.yaml$' | xargs -0 wc -l | sort -n | tail -15
ls .github/workflows AGENTS.md CLAUDE.md TODO.md 2>/dev/null
```

Post the project card in the chat. Each reviewer receives it, so it SHOULD stay
within 15 lines:

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

| Lens | Runs when |
| --- | --- |
| Bugs and edge cases | always |
| Security, privacy and licences | always |
| Architecture and data formats | always |
| Simplicity, duplication and tests | always |
| Dependencies, tooling and CI | always |
| Performance and cost | the repo has code that runs |
| UX, accessibility and copy | a person uses a screen of it |
| Reliability, offline and monitoring | network calls, background work, jobs or a data pipeline |
| Platform and store | a mobile or desktop app, native code, a store listing |

- **User picked a focus** the lenses or focus the user named run, with Bugs
  added.
- **Small repo** below 2,000 lines of code, lenses MAY run in pairs, two to a
  reviewer.
- **Skipped lens** it gets a single line in the chat with the reason.
- **Out of scope** search, ads and marketing belong to the `seo-setup`,
  `ads-setup` and `marketing` skills. The report MAY name one of them.

## 3. Make the worktrees

The work MUST happen on a new branch and finish as a PR, also in a repo that
commits straight to its default branch. A batch of fixes gets one review before
users see it.

With the `git-worktrees` skill, create these off the latest default branch:

- **Audit** branch `audit-<date>`, such as `audit-2025-10-26`. The PR comes
  from it.
- **One per lens** branch `audit-<date>-<lens>`, such as
  `audit-2025-10-26-bugs`. It stays local, and its agent commits there.
- **One at a time** create them in a loop yourself, since git locks its config
  for each one. Copy the ignored local files into each one.
- **Name taken** add a suffix: `audit-2025-10-26-2`.
- **User's checkout** it MUST stay untouched. A permission or a tool blocks the
  worktree? Stop and tell the user.

A heavy build cache MAY be shared across the worktrees through its env var,
such as `CARGO_TARGET_DIR`. Each `gh` call MUST start with `GH_PAGER=cat`,
since a pager would hang it.

## 4. Start the lens agents

Before the first brief is written, [references/briefs.md](references/briefs.md)
MUST be read.

- **One subagent per lens** start them all together, in the background, each in
  its own worktree. It reviews its lens, sorts the findings and commits each
  fix.
- **Model** when the user named a model, every lens agent MUST run on it.
  Without a name, the agent's default model runs.
- **Security lens** it SHOULD run on a security review agent if the agent
  offers one that can edit files.
- **No subagent tool** run the lenses yourself in turn, in the audit worktree,
  each one a fresh pass with its own brief. The commits land on the audit
  branch, and step 5 skips the cherry-pick.

Meanwhile, read the code yourself: the entry points, the five largest files and
the path data takes from its source to the screen. Step 5 relies on that.

## 5. Take each report as it lands

Before the first report, [references/triage.md](references/triage.md) MUST be
read. A report is handled the moment it arrives, while the other agents keep
working.

For each commit on the report's Fixed list:

1. Read it with `git -C <lens worktree> show <sha>`.
2. Check it against the code and the Fix rules. Lens agents misread code, so a
   commit the code fails to back is dropped, and its finding goes to Leave.
3. Run `git cherry-pick <sha>` in the audit worktree.
4. Run the checks over the files it touched.

- **Conflict** a few lines get resolved by hand, then `git cherry-pick
  --continue`. A bigger one gets `git cherry-pick --abort` and goes to the redo
  list.
- **Same fix twice** a pick that comes out empty gets `git cherry-pick --skip`.
- **Leave lines** read each reason. One you judge a Fix goes to the redo list.
- **Table** post the report's rows in the chat, then go on with no question:

| # | Lens | Finding | Where | Decision |
| --- | --- | --- | --- | --- |
| 1 | Bugs | road names lose their last letter | `build-data.ts:38` | Fix |
| 2 | Architecture | `cameras.json` has no format number | `camera.ts:28` | Fix |
| 3 | Dependencies | move from Leaflet to MapLibre | | Leave: migration, 6x the JS |

Once each commit of a lens is picked or dropped, remove its worktree with
`git worktree remove` and its local branch with `git branch -D`. Its
`git status --short` MUST print empty first.

### The redo list

After the last report, fix each redo item yourself on the audit branch, with
the fix loop of the lens brief: one finding, its files, its checks, one commit.
A bug fix SHOULD come with a test that fails without it. No tests in the area?
The report says so.

### Commit messages

Every commit follows these, the lens agents' included. The brief gives them in
one line.

- **Repo rules** the message MUST match them. Where release notes come from
  commits, the subject speaks to a user: "Show cameras at once in the app",
  rather than "Refactor loader".
- **Body** the reason first, then one line per visible change.
- **Internal work** the subject names it: `CI: pin each action to a commit`.
- **Banned** `git add -A`, `git add .` and `--amend` MUST NOT be used.

## 6. Verify

Once the last fix is in, [references/verify.md](references/verify.md) MUST be
read.

Verifying takes the checks, a production build, and a click through every
changed flow in the running app. A part that can't run here goes in TODO.md as
a line.

## 7. Have a fresh reviewer read the branch

Before the PR opens, a new reviewer with no context from this session MUST read
`git diff <base>...HEAD`. The brief for it sits in
[references/briefs.md](references/briefs.md). Point it at the likeliest breaks:
new async code, caches, format changes, CI conditions.

- **Real findings** each one is fixed and checked like the rest, in a new
  commit.
- **Wording** the commit names the fix in user words: "Build the Android app on
  pull requests again".

## 8. Open the PR and merge it

Load the `create-pr` skill and run it in create mode.

- **Changelog** the PR MUST carry an entry in the repo's own way. Commits read
  by the release notes already count.
- **CI** watch it with `GH_PAGER=cat gh pr checks --watch`. A new commit fixes
  each failing check.
- **Stuck check** one that fails on the default branch as well, or after three
  fixes, goes in `TODO.md` with its reason, and the PR stays open.
- **Merge** when CI is green, use the repo's merge method. A required review
  that blocks it is waited for, and the PR link goes in `TODO.md`.
- **Main only CI** a workflow with no `pull_request` trigger runs on main
  only. Run the tests and linter locally, then merge right after the PR opens.
- **Clean up** after the merge, the `git-worktrees` skill removes the worktree,
  its folder and its branch, local and remote.

## 9. Write TODO.md

At the root of the branch, add an `## app-audit` section to `TODO.md`, or
replace the existing one. Commit it before the PR opens, and again each time step
8 adds lines. The section holds:

- **Left** every Leave finding and its reason, so the next run skips it.
- **Yours** the tasks only a person can do: test on a device, settle a product
  question, set a secret.
- **Check** whatever only CI verified, such as a native build without an SDK
  here.

```markdown
## app-audit

- [ ] Test the back button and the voice warnings on a phone, on a drive (PR #2)
- [ ] Decide on dark mode: the panels need restyling, see PR #2
- Left: Next.js to Vite, saves 55 KB gzip, costs rewriting routes and metadata
```

## 10. Report back

Open the answer with the PR link and its merge state, then the table. Each SHA
is the commit on the audit branch:

| # | Lens | Finding | Result |
| --- | --- | --- | --- |
| 1 | Bugs | road names lose their last letter | fixed, `2b28ffa` |
| 2 | Architecture | `cameras.json` has no format number | fixed, `9be68c6` |
| 3 | Dependencies | Leaflet to MapLibre | left: 6x the JS for a heading-up view |

After the table:

1. Each catch the fresh reviewer made in this run's own changes, a line apiece.
2. What went unverified here and the reason: no SDK, no device, no account.
3. The lines added to `TODO.md`.

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
