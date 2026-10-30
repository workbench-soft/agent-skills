# Changelog

## Unreleased

- **e2e-walk** walks the build on the phone that the Archon Apps tab names, and knows the release tags that differ from the repo name.
- **e2e-walk** a new skill installs the newest release on an emulator, the phone over adb, the web or Windows, walks each main flow and reports pass or fail. It skips each control that deletes, resets, signs out or sends, in all 9 app languages, and writes the bugs to `TODO.md`.
- **voice-test** a pitch for each voice: `--pitch -10` and a Pitch slider on the page. `turn-voice` speaks with that pitch after `install.ps1 -RuPitch -10 -EnPitch 5`, and a reinstall keeps it.
- **demo-media** a new skill runs the app with made-up demo data, takes screenshots and short videos on the web, the desktop or a phone over adb, checks each frame for real people and private data, and shows them in the README from `docs/screenshots/`.
- **store-media** a new skill uploads those shots, the promo video and the icon to Google Play, checks AdMob and AdSense, and swaps the icon on the site, the GitHub preview and each installer.
- **marketing** Reddit posts attach the shots and the GIF from `docs/screenshots/`.
- **app-audit** each lens agent fixes its own findings in its own worktree, one commit each. The main agent checks and cherry-picks each commit as soon as its report lands, so fixes start before the slowest lens ends.
- **voice-test** the voice dropdown is a checkbox tree from Web Awesome. A group's box ticks or unticks all its voices.
- **voice-test** the window is now a page in an Edge app window: pick the line, the groups and the languages, then tick voices in a dropdown. No console windows pop up. The README and the docs describe it and the flags.
- **Windows paths** the skills name Windows paths such as `%USERPROFILE%\.android-keys`, `Ctrl+F` before `Cmd+F`, and `winget` before `brew`. The README lists the Windows install first, and `voice-test` shows its cache folder again.
- **icon-styles** a new skill draws 10 icons for the repo's app in 10 styles it picks for the theme. You click one in a picker in the chat, or ask for a redo with a comment, and a script exports it to PNG, `.ico`, Android, iOS, Expo and PWA sets. All 10 drafts get committed to `design/icons/<date>/`.
- **voice-test** `--line en`, `ru`, `mix` or `chunks` plays one of the 4 lines per voice. `voice-test.cmd` opens a window to pick the line, women, men or children, and the voices, then play them.
- **reddit-comments** a new skill picks Reddit threads the repo can answer, drafts a reply in a human voice, and a Playwright script types it into the comment box in Chrome. The person presses Comment.
- **Releases** each push to `main` that passes `check` gets a GitHub release such as `v2026.10.30.1`. Its notes list the commits since the release before.
- **turn-voice** Claude speaks the end of a turn in English by default, in
  the British voice `en-GB-MaisieNeural`, whatever the review language.
  `install.ps1 -VoiceLang Russian` switches the phrases to Russian.
- **Rules file** `writing-style.instructions.md` holds only the writing rules now. The spec, ship, TODO and session end rules were one setup's process, so the install no longer adds them to every agent.
- **Audit fixes** `domain-check` keeps accented letters, a voice picked for turn-voice survives a reinstall, turn-voice drops clips unplayed for 30 days, and CI runs the install on Linux.

- **Docs** `docs/features.md` and `docs/architecture.md` give a high level view with a diagram.

- **Public** the first public release: writing, review, PR, ticket, audit, architecture and launch skills, with one installer for about 50 agents.
