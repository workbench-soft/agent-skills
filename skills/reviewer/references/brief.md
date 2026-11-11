# Briefs for the lens agents

Lens agents begin with zero context. Each brief MUST hold the frame of its
mode, the project card and the lens checklist from [lenses.md](lenses.md). The
main agent MUST paste them unchanged and fill in the angle brackets.

## Read mode

A lens agent of `review` MUST get this frame:

```text
You review <base>...<head> in <checkout path> for <LENS> only. Read only: don't edit, commit, push or post.
Read the diff with `git diff <base>...<head>`, then the code it calls, one step up to the first relevant caller.
Other agents review other lenses at the same time. Stay inside yours.

The project:
<project card>

Already raised, skip these:
<the Skip list, or "none">

<lens checklist>

Rules:
- Prove each finding: the file and line, plus the input, the output or the number that shows it. Mark a guess as a guess.
- Before you report a finding, look once for why it might be wrong: a guard in the caller, a type, a test, a config. Drop it if that knocks it down.
- At most 10 findings, the most costly first. No style nits unless the repo rules ask for them in writing.
- Name what is fine, one line each.

Report, one line per item:
- Finding: file:line | what goes wrong for a person | proof | cost | the fix, with the code to change
- Unproven: file:line | the suspicion | what would settle it
- Fine: what you checked and found fine
```

## Fix mode

A lens agent of `app-audit` MUST get this frame:

```text
You audit the repo at <lens worktree path> for <LENS> only, and fix what you find.
Work in this worktree only, on its branch <lens branch>. Other agents fix other lenses in their own worktrees at the same time.
First install the existing dependencies with <install command>. Don't push, don't touch files outside the worktree. Don't run `git stash`, since every worktree shares it: set work aside with a WIP commit or `git diff > <file>`. Add a package only through the libraries rules in <absolute path of references/libraries.md>.
Scratch files go in the system temp folder. A server you start takes a free port and stops before you report.

The project:
<project card>

Already decided, skip these:
<the Skip list, or "none">

<lens checklist>

Find:
- Prove each finding: the file and line, plus the input, command output or measurement that shows it. Mark a guess as a guess.
- Measure where you can: bytes, milliseconds, counts, before and after.
- Name what is fine and needs no work, one line each, so the next pass doesn't check it again.
- At most 15 findings, the most valuable first. No style nits.

Sort each finding into Fix or Leave with the rules in <absolute path of app-audit references/triage.md>.

Fix, one finding per commit, in the order triage.md gives:
1. Edit only the files of this finding.
2. A bug fix gets a test that fails without the fix, in the style of its neighbours.
3. Run the checks over those files: <the module's test, lint and type check commands>.
4. Commit with `git add <files>`, then `git commit`. No `git add -A`, `git add .` or `--amend`.
- Commit messages: <the repo's commit style in one line>. The body gives the reason first.
- A fix that grows past its plan or changes a public format goes to Leave instead.
- A format both sides read, such as the app and its data job, changes on both sides in the same commit.
- No toolchain for a part? Compile and test what you can, and say how.
- Hands off: secrets, signing keys, DNS, payment settings, store listings, production data.

Report, one line per finding:
- Fixed: <sha> | file:line | problem | evidence | the check that ran
- Leave: file:line | problem | the reason in a few words
- Fine: what you checked and found fine
```

## The fresh reviewer of a finished branch

A reviewer with no context of the session MUST get this brief, on the
strongest model as SKILL.md step 4 says:

```text
Review `git diff <base>...<branch>` in <path>. Read-only: don't edit or commit.
<one line on the project>
Report real bugs and regressions only, each with proof. Check these spots first:
<the new async code, caches, format changes, CI conditions and native code in this diff>
For each: file:line, what goes wrong, a concrete case, a suggested fix. Skip style.
```
