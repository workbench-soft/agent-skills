# Changelog

## Unreleased

- **turn-voice** Claude speaks the end of a turn in Russian by default,
  whatever the review language. `install.ps1 -VoiceLang English` brings the
  English phrases back.
- **Rules file** `writing-style.instructions.md` holds only the writing rules now. The spec, ship, TODO and session end rules were one setup's process, so the install no longer adds them to every agent.
- **Audit fixes** `domain-check` keeps accented letters, a voice picked for turn-voice survives a reinstall, turn-voice drops clips unplayed for 30 days, and CI runs the install on Linux.

- **Docs** `docs/features.md` and `docs/architecture.md` give a high level view with a diagram.

- **Public** the first public release: writing, review, PR, ticket, audit, architecture and launch skills, with one installer for about 50 agents.
