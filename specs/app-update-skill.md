# app-update skill

## What it does for the person

Adds in-app updates for apps installed outside a store and keeps them out of the Play build.

## User flows

- **Return to the app** it checks again.
- **Play build** has no update code.
- **Ticket** implement-ticket keeps `docs/features.md` current.

## How it works: modules, files, data

Each entry below names the files it changed.

## Limits

None written down yet.

## Changes

### 2025-10-28 app-update checks on return and stays out of the Play build, features.md for tickets

Done on 2025-10-28, before the history was reset to one commit. The old commits sit under `refs/backup/main` in the local backup mirror of `agent-skills`.

#### Why

An update check only on start missed most returns, and Google Play rejects self updating apps.

#### User flows it touches

- **Return to the app** it checks again.
- **Play build** has no update code.
- **Ticket** implement-ticket keeps `docs/features.md` current.

#### Changes

- **`skills/app-update/SKILL.md`** changed.
- **`skills/app-update/references/stacks.md`** changed.
- **`skills/app-update/references/play-build.md`** new.
- **`skills/implement-ticket/SKILL.md`** changed.
- **`writing-style.instructions.md`** changed.

#### Steps, in commit order

1. app-update: check again each time the app comes back to the front (c840d82, 2025-10-28)
2. app-update: keep the update code out of the Google Play build (e7185e9, 2025-10-28)
3. implement-ticket: keep every feature in docs/features.md (7e82125, 2025-10-28)

#### Docs to update

- `CHANGELOG.md`
- `README.md`
