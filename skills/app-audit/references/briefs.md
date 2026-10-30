# Briefs for the subagents

Reviewers begin with zero context. Each brief MUST contain the frame below, the
step 1 project card and its lens checklist. Paste them unchanged and fill in the
angle brackets.

## The frame every lens reviewer gets

```text
You review the repo at <path> for <LENS> only.
Read-only: don't edit, create or delete files in the repo, don't commit, don't install packages.
Scratch files go in the system temp folder. You may run the repo's lint, type check, test and build commands.

The project:
<project card>

Already decided, skip these:
<Leave items from the ## app-audit section of TODO.md, or "none">

<lens checklist>

Rules:
- Prove each finding: the file and line, plus the input, command output or measurement that shows it. Mark a guess as a guess.
- Measure where you can: bytes, milliseconds, counts, before and after.
- Name what is fine and needs no work, one line each, so the next pass doesn't check it again.
- At most 15 findings, the most valuable first. No style nits.

For each finding:
- Where: file:line
- Problem: what a person, or the next developer, runs into
- Evidence: the input, output or numbers
- Fix: the change, with a short code sketch
- Value HIGH / MEDIUM / LOW, effort S / M / L, risk LOW / MEDIUM / HIGH
```

## The lens checklists

```text
BUGS AND EDGE CASES
Look for wrong results, crashes, lost input or data, and loading states that hang.
Check races in effects, threads and async code; time zones and dates; empty lists; no network; slow replies; two taps in a row.
Check every parser of outside data (CSV, HTML, JSON from other sites) and the string and index maths in it.
Prove each bug against the real data in the repo where there is some, and count the rows it hits.
```

```text
SECURITY, PRIVACY AND LICENCES
Look for secrets in code, git history and logs.
Follow each input to where it lands: HTML, a shell, a query, a file path, a redirect.
Check each endpoint and job for a permission check; CORS, CSP and cookies; the package manager's audit.
Check CI: actions not pinned to a commit in jobs that can read secrets.
Check personal data the app collects, stores or sends, and whether the privacy policy and the store data safety answers match the code.
Check every permission the app asks for and why; the licences of data sources and libraries, and the credit each one requires on screen.
```

```text
ARCHITECTURE AND DATA FORMATS
Map the modules and the path data takes from its source to the screen.
Look for one format or rule written twice, in two languages or on client and server, with no test that keeps them in step.
Look for formats that old installs or old clients read, with no version number in them.
Look at where state lives, logic in the wrong layer, and what hurts first as the project grows.
Say when the design fits the project's size. Don't propose layers for their own sake.
Give each item an effort S, M or L and the steps to get there.
```

```text
SIMPLICITY, DUPLICATION AND TESTS
Look for duplicated logic, dead code, unused exports and dependencies, functions with several jobs, files too long to follow, unnamed numbers.
Look for weak types at the edges: parsed JSON cast without a check, `any`.
Look for comments and docs the code contradicts, and scripts no test can import.
Tests: logic that matters with no test, tests that can't fail, test runs that pick up the wrong files.
```

```text
DEPENDENCIES, TOOLING AND CI
Measure what each dependency adds to what ships, and whether it earns it.
Look for outdated or vulnerable packages, and build tools listed as runtime dependencies.
Look for missing checks: strict compiler flags, a formatter, a hook that runs the checks before a push.
Look at CI speed and caching, jobs that run where no one needs them, build output committed or not ignored, README setup steps that no longer work.
Weigh any framework or library swap with numbers, and recommend one only with a clear gain.
```

```text
PERFORMANCE AND COST
Measure, from the production build, what the first screen downloads and parses.
Look for work repeated on every render, request or loop; lists, caches and payloads with no upper bound.
Check caching headers and the service worker; the start on a weak network.
On phones: wake-ups, location, network use and anything else that drains the battery.
Check build and data jobs that do the same work twice.
Name the size where each problem starts to hurt. List what you measured and found fine.
```

```text
UX, ACCESSIBILITY AND COPY
Look from the user's side: first run, empty, loading, error and offline states.
Check tap targets and one-hand use, the back button and browser history.
Check WCAG 2.2 AA: keyboard and focus, screen reader names, contrast, reduced motion.
Check permission prompts and what the app says before them, and settings that quietly change something else.
Check dark mode and system settings; units, dates and language; UI text that is unclear, wrong or out of step with what the app does.
A running dev server may be used. Don't start long-lived servers.
```

```text
RELIABILITY, OFFLINE AND MONITORING
Look for network calls with no timeout, and what the app shows and keeps when a call fails.
Check offline use, and caches that go stale or grow without end.
Check background jobs and scheduled pipelines that fail quietly, or write bad data over good.
Check partial writes, missing atomic renames, and guards against a source that returns half its data.
Say how anyone finds out it broke: logs, alerts, crash reports, a red CI run.
```

```text
PLATFORM AND STORE
Check the platform's lifecycle and background limits; when each permission is asked, and the store policy for it.
Check battery and data use; the system back button, notifications and deep links.
Check how an old install meets new data or a new server, and how it updates.
Check the store listing, data safety and privacy answers against what the code does.
Check signing and release steps that only one machine can run.
```

## A subagent that fixes a separate part

```text
Make these changes in <folder> of <path>, on the branch that is checked out. Touch only <folder>.
Don't commit, and don't run git commands that change state. Another agent edits other folders at the same time.

What both sides share: <field names, units, defaults for old files, the function the other side calls>

Changes:
1. <change, with the file>
2. <change, with the file>

Add or extend unit tests for <the logic changed>.
Verify with <command>. No toolchain here? Compile and test what you can, and say how.
Report: each changed file with one line on what changed, then the test result.
```

## The fresh reviewer of the branch

```text
Review `git diff <base>...<branch>` in <path>. Read-only: don't edit or commit.
<one line on the project>
Report real bugs and regressions only, each with proof. Check these spots first:
<the new async code, caches, format changes, CI conditions and native code in this diff>
For each: file:line, what goes wrong, a concrete case, a suggested fix. Skip style.
```
