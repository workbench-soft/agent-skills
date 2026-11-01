# Install the skills

## What it does for the person

One command links the skills and the writing rules into every agent, on macOS, Linux and Windows.

## User flows

- **Install** one command, piped from curl, links the skills into every agent folder.
- **Write** the writing rules apply to every text an agent writes.
- **PR** create-pr puts the Jira ticket at the top of the body.

## How it works: modules, files, data

Each entry below names the files it changed.

## Limits

None written down yet.

## Changes

### 2025-09-16 Writing style, review and create-pr skills with one installer

Done from 2025-09-16 to 2025-09-17, before the history was reset to one commit. The old commits sit under `refs/backup/main` in the local backup mirror of `agent-skills`.

#### Why

Each agent wrote PRs and reviews its own way. Shared skills give every agent the same rules, and one script links them into each agent.

#### User flows it touches

- **Install** one command, piped from curl, links the skills into every agent folder.
- **Write** the writing rules apply to every text an agent writes.
- **PR** create-pr puts the Jira ticket at the top of the body.

#### Changes

- **`install.sh`** new.
- **`skills/review/SKILL.md`** new.
- **`skills/writing-style/SKILL.md`** new.
- **`skills/create-pr/SKILL.md`** new.
- **`.github/workflows/check.yml`** new.
- **`writing-style.instructions.md`** new.
- **`.gitignore`** new.
- **`skills/review/references/comment-style.md`** new.
- **`skills/review/references/getting-the-code.md`** new.
- **`skills/review/references/pr-links.md`** new.
- **Other files** 4 more.

#### Steps, in commit order

1. Add writing-style, review and create-pr skills (2486416, 2025-09-16)
2. Add installer, make the review language configurable, neutralise examples (54a5631, 2025-09-16)
3. Drop the hardcoded language from the skill descriptions (e6c4f31, 2025-09-16)
4. Shorten the README (ae03899, 2025-09-16)
5. Let install.sh run piped from curl (ea6e3e6, 2025-09-16)
6. Lead the README with the one-line install (f8e6076, 2025-09-16)
7. Stop pointing at one agent's skills folder, add a licence and a CI check (a0cfa5f, 2025-09-16)
8. Fix the CI check so it does not depend on terminal rendering (dae6ff7, 2025-09-16)
9. Make the skills language-neutral, keep Russian as one worked example (793c4cc, 2025-09-16)
10. Split the review skill, add uninstall, accept any language name (26666af, 2025-09-16)
11. One install path: symlinks from every agent to one folder (f2838e9, 2025-09-16)
12. One install path: symlinks from every agent to one folder (6351a3a, 2025-09-16)
13. Name what changed instead of counting it (6f6c38e, 2025-09-16)
14. Wire the writing rules into every agent in the same install (ad0e7fb, 2025-09-16)
15. Keep one blank line before the block on every install (66f3918, 2025-09-16)
16. Cover the wiring in CI and say up front that gh is needed (2efad31, 2025-09-16)
17. Put Jira ticket name atop PR body (a9b3f1d, 2025-09-16)
18. Make the skills output scannable and cap their prose (80b1a16, 2025-09-17)

#### Docs to update

- `AGENTS.md`
- `README.md`

### 2025-10-28 Install the skills on Windows as easily as on a Mac

#### Why

- **Copies, not links** Git Bash turns `ln -s` into a copy. Each agent gets its
  own copy, so an edit or a new language reaches none of them.
- **Symlinks need Developer Mode** Windows refuses a real symlink without it,
  and most people have it off.
- **No VS Code rules** the installer looks for VS Code only where macOS and
  Linux keep it, so Windows gets no writing rules there.
- **No PowerShell command** a Windows user opens PowerShell, and the only
  command in the README is for `sh`.

#### User flows it touches

1. A Windows user pastes one PowerShell line. It finds Git Bash, or installs Git
   through `winget`, then runs `install.sh`.
2. A Git Bash user runs the same `curl | sh` line as on a Mac.
3. With Developer Mode on, every agent gets a real symlink. With it off, each
   skill folder gets a junction and the rules file gets a copy.
4. VS Code on Windows gets the writing rules in `%APPDATA%\Code\User\prompts`.
5. Uninstall removes junctions and the copied rules file too.

#### Changes

- **`install.sh`** detects Git Bash, asks for native symlinks, falls back to
  junctions, adds the Windows VS Code folder, and removes the copied rules file
  on uninstall.
- **`install.ps1`** new. Finds `bash.exe`, installs Git when it is missing, and
  runs `install.sh` with `-Lang`, `-Uninstall` and `-Yes`.
- **`scripts/test-install.sh`** new. The install test moves out of the
  workflow, so Linux and Windows run the same one.
- **`.github/workflows/check.yml`** a Windows job runs the test in Git Bash and
  through `install.ps1`.

#### Steps, in commit order

1. This plan.
2. `install.sh` on Git Bash, and the test script with the Windows job.
3. `install.ps1` and its CI step.
4. README and changelog.

#### Docs to update

- `README.md` gets install steps for macOS and Linux, and for Windows.
- `CHANGELOG.md` gets a line under `## Unreleased`.
