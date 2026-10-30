---
name: app-audit
description: 'Use when the request covers a whole app, site or repo to audit, review or improve, as opposed to a single pull request, in any language: "what can be improved", "audit the app", "review the codebase from different angles", "find what to improve and fix it", "run agents on different criteria", "проверь приложение", "что можно улучшить", "прогони агентов по разным критериям". It maps the repo and starts one reviewer subagent per lens, all in parallel (bugs, security, architecture, simplicity, dependencies, performance, UX, reliability, platform). Every finding is checked against the code, and the safe ones get fixed without asking, one commit each, in a new worktree. Proof comes from the checks, a build and the running app, and a fresh reviewer reads the diff the run made. Then it opens a PR through create-pr, merges it when CI is green, and writes TODO.md with what it left and the reason.'
---

# Audit an app and fix what is worth fixing

Several reviewers read the whole repo in parallel, each through its own lens.
The agent checks their findings, fixes the safe ones and merges a single PR. It
asks the user no question between the request and the merge.

Unless the `writing-style` skill is already in context, load it before writing
the first line a person reads.

## 1. Read the project

The repo rules MUST beat this skill everywhere but the branch rule of step 5.
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

## 3. Run the reviewers

Before the first brief is written, [references/briefs.md](references/briefs.md)
MUST be read.

- **One subagent per lens** start them all together, in the background.
- **Model** when the user named a model, every reviewer MUST run on it. Without
  a name, the agent's default model runs.
- **Read-only** a reviewer MUST NOT edit the repo, commit or install packages.
  Its scratch files go in the system temp folder.
- **Security lens** it SHOULD run on a security review agent if the agent
  offers one.
- **No subagent tool** run the lenses yourself in turn, each one a fresh pass
  with its own brief.

Meanwhile, read the code yourself: the entry points, the five largest files and
the path data takes from its source to the screen. Step 4 relies on that.

## 4. Triage

Before the first finding is sorted, [references/triage.md](references/triage.md)
MUST be read.

- **Check first** a finding MUST be confirmed in the code before it counts.
  Reviewers misread code, so a claim the code fails to back is dropped.
- **Merge** two lenses reporting the same spot make one finding.
- **Sort** the reference rules put each finding in Fix or Leave.

Post the plan in the chat, then begin with no question:

| # | Lens | Finding | Where | Decision |
| --- | --- | --- | --- | --- |
| 1 | Bugs | road names lose their last letter | `build-data.ts:38` | Fix |
| 2 | Architecture | `cameras.json` has no format number | `camera.ts:28` | Fix |
| 3 | Dependencies | move from Leaflet to MapLibre | | Leave: migration, 6x the JS |

## 5. Branch

The work MUST happen on a new branch and finish as a PR, also in a repo that
commits straight to its default branch. A batch of fixes gets one review before
users see it.

Create a worktree with the `git-worktrees` skill. The branch is named
`audit-<date>`, for example `audit-2025-10-26`.

- **Name taken** add a suffix: `audit-2025-10-26-2`.
- **User's checkout** it MUST stay untouched. A permission or a tool blocks the
  worktree? Stop and tell the user.
- **`gh`** each call MUST start with `GH_PAGER=cat`, since a pager would hang it.

## 6. Fix, one finding at a time

Every Fix finding runs through one loop, so each commit carries one change:

1. Edit only the files of this finding.
2. Run the checks over those files: the module's tests, lint, the type check.
3. Commit with `git add <files>`, then `git commit`.

- **Order** lost or wrong data, then old clients and formats, then what a
  person sees, then speed, then tooling.
- **Test** a bug fix SHOULD come with a test that fails without the fix, in the
  style of its neighbours. No tests in the area? The report says so.
- **Scope creep** a fix that outgrows its plan, by adding a package or changing
  a public format, MUST stop and go to Leave.
- **Banned** `git add -A`, `git add .` and `--amend` MUST NOT be used.

### Commit messages

- **Repo rules** the message MUST match them. Where release notes come from
  commits, the subject speaks to a user: "Show cameras at once in the app",
  rather than "Refactor loader".
- **Body** the reason first, then one line per visible change.
- **Internal work** the subject names it: `CI: pin each action to a commit`.

### A separate part, such as the native app

A part with its own language and toolchain MAY get its fixes handed to one
subagent while you handle the rest. The brief for it sits in
[references/briefs.md](references/briefs.md).

- **Shared format** the brief MUST name what both sides agree on: field names,
  units, the function the other side calls.
- **Limits** the subagent edits its own folder only and makes no commit.
- **Review** read all of its diff before you commit it. Its work counts as one
  more finding.

## 7. Verify

Once the last fix is in, [references/verify.md](references/verify.md) MUST be
read.

Verifying takes the checks, a production build, and a click through every
changed flow in the running app. A part that can't run here goes in TODO.md as
a line.

## 8. Have a fresh reviewer read the branch

Before the PR opens, a new reviewer with no context from this session MUST read
`git diff <base>...HEAD`. The brief for it sits in
[references/briefs.md](references/briefs.md). Point it at the likeliest breaks:
new async code, caches, format changes, CI conditions.

- **Real findings** each one is fixed and checked like the rest, in a new
  commit.
- **Wording** the commit names the fix in user words: "Build the Android app on
  pull requests again".

## 9. Open the PR and merge it

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

## 10. Write TODO.md

At the root of the branch, add an `## app-audit` section to `TODO.md`, or
replace the existing one. Commit it before the PR opens, and again each time step
9 adds lines. The section holds:

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

## 11. Report back

Open the answer with the PR link and its merge state, then:

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
