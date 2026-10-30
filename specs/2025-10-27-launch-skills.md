# Launch skills: search, ads, Google Play, marketing

Done on 2025-10-27, before the history was reset to one commit. The old commits sit under `refs/backup/main` in the local backup mirror of `agent-skills`.

## Why

Taking each app live repeated the same steps in Search Console, AdSense, AdMob and Play Console.

## User flows it touches

- **Launch** one skill runs seo-setup, ads-setup and play-release in order.
- **Marketing** a plan for the first users on a set budget.
- **Left for the person** each skill writes `TODO.md`.

## Changes

- **`skills/seo-setup/SKILL.md`** new.
- **`skills/ads-setup/SKILL.md`** new.
- **`skills/play-release/SKILL.md`** new.
- **`skills/launch/SKILL.md`** new.
- **`skills/marketing/SKILL.md`** new.
- **`skills/seo-setup/references/cloudflare.md`** new.
- **`skills/seo-setup/references/content.md`** new.
- **`skills/seo-setup/references/search-consoles.md`** new.
- **`skills/seo-setup/references/site-checklist.md`** new.
- **`skills/ads-setup/references/admob.md`** new.
- **Other files** 13 more.

## Steps, in commit order

1. seo-setup: add a skill that gets a site found in search (93b28ba, 2025-10-27)
2. ads-setup: add a skill that sets up AdSense and AdMob (325a685, 2025-10-27)
3. play-release: add a skill that takes an Android app to internal testing (0d6afe3, 2025-10-27)
4. launch: add a skill that runs search, ads and Play in order (7973890, 2025-10-27)
5. readme: list the launch skills (3d38cf4, 2025-10-27)
6. ci: let a skill name `never` in backticks as the word to search for (6fcf59f, 2025-10-27)
7. marketing: add a skill that gets the first users on a set budget (0a906b4, 2025-10-27)
8. readme: list the marketing skill (7570c9d, 2025-10-27)
9. seo-setup: write TODO.md with the tasks left for the user (37b02ae, 2025-10-27)
10. ads-setup: write TODO.md with the tasks left for the user (5281783, 2025-10-27)
11. play-release: write TODO.md with the tasks left for the user (6b5a3bf, 2025-10-27)
12. marketing: write TODO.md with the tasks left for the user (c3f0e0e, 2025-10-27)
13. launch: write TODO.md with the tasks left for the user (d9f9e53, 2025-10-27)
14. README: say the launch skills leave TODO.md (3eeacb5, 2025-10-27)

## Docs to update

- `README.md`
