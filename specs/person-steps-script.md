# Steps for the person as one script

## What it does for the person

The person runs one PowerShell line for the steps an agent can't do. A list
of clicks or several commands to copy no longer comes from the site skills.

## How it works

- **Skills** `guide-on-site`, `play-release`, `ads-setup` and `seo-setup`
  put each step they can't reach into one script per task,
  `scripts/person-steps/<task>.ps1`. The script runs each CLI step, opens a
  console page with `Start-Process` only where no API exists, and stops with
  `Read-Host` only for a login, a secret, a CAPTCHA or a payment.
- **Hook** the `PostToolUse` reminder on each `TODO.md` write says that a
  step for the person goes in that script, and the line holds the command
  that runs it.
- **Rules** the full rule sits in "Steps for the person" of the private
  `workflow.instructions.md`. A person with other rules gets the script
  shape from the skills alone.

## Changes

### 2026-11-24 first version

- **Why** the owner was tired of clicking through console steps and copying
  several commands, and asked for one script for what is left.
- **Changes** the skills and the hook above, `README.md`,
  `docs/features.md`, `CHANGELOG.md`.
