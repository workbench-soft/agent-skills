# Install the skills on Windows as easily as on a Mac

## Why

- **Copies, not links** Git Bash turns `ln -s` into a copy. Each agent gets its
  own copy, so an edit or a new language reaches none of them.
- **Symlinks need Developer Mode** Windows refuses a real symlink without it,
  and most people have it off.
- **No VS Code rules** the installer looks for VS Code only where macOS and
  Linux keep it, so Windows gets no writing rules there.
- **No PowerShell command** a Windows user opens PowerShell, and the only
  command in the README is for `sh`.

## User flows it touches

1. A Windows user pastes one PowerShell line. It finds Git Bash, or installs Git
   through `winget`, then runs `install.sh`.
2. A Git Bash user runs the same `curl | sh` line as on a Mac.
3. With Developer Mode on, every agent gets a real symlink. With it off, each
   skill folder gets a junction and the rules file gets a copy.
4. VS Code on Windows gets the writing rules in `%APPDATA%\Code\User\prompts`.
5. Uninstall removes junctions and the copied rules file too.

## Changes

- **`install.sh`** detects Git Bash, asks for native symlinks, falls back to
  junctions, adds the Windows VS Code folder, and removes the copied rules file
  on uninstall.
- **`install.ps1`** new. Finds `bash.exe`, installs Git when it is missing, and
  runs `install.sh` with `-Lang`, `-Uninstall` and `-Yes`.
- **`scripts/test-install.sh`** new. The install test moves out of the
  workflow, so Linux and Windows run the same one.
- **`.github/workflows/check.yml`** a Windows job runs the test in Git Bash and
  through `install.ps1`.

## Steps, in commit order

1. This plan.
2. `install.sh` on Git Bash, and the test script with the Windows job.
3. `install.ps1` and its CI step.
4. README and changelog.

## Docs to update

- `README.md` gets install steps for macOS and Linux, and for Windows.
- `CHANGELOG.md` gets a line under `## Unreleased`.
