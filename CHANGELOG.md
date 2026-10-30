# Changelog

## Unreleased

- **icon-styles** a new skill draws 10 icons for the repo's app in 10 styles it picks for the theme. You pick one from a preview sheet, and a script exports it to PNG, `.ico`, Android, iOS, Expo and PWA sets.
- **reddit-comments** a new skill picks Reddit threads the repo can answer, drafts a reply in a human voice, and a Playwright script types it into the comment box in Chrome. The person presses Comment.

- **Releases** each push to `main` that passes `check` gets a GitHub release such as `v2026.10.30.1`. Its notes list the commits since the release before.
- **turn-voice** Claude speaks the end of a turn in English by default, in
  the British voice `en-GB-MaisieNeural`, whatever the review language.
  `install.ps1 -VoiceLang Russian` switches the phrases to Russian.
- **Rules file** `writing-style.instructions.md` holds only the writing rules now. The spec, ship, TODO and session end rules were one setup's process, so the install no longer adds them to every agent.
- **Audit fixes** `domain-check` keeps accented letters, a voice picked for turn-voice survives a reinstall, turn-voice drops clips unplayed for 30 days, and CI runs the install on Linux.

- **Docs** `docs/features.md` and `docs/architecture.md` give a high level view with a diagram.

- **Public** the first public release: writing, review, PR, ticket, audit, architecture and launch skills, with one installer for about 50 agents.
