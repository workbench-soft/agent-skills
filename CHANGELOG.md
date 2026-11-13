# Changelog

## Unreleased

- **domain-check and add-skill** the `risky` row names unread trade mark results, and add-skill runs `mise run lint` and `mise run test`.

- **git-worktrees** agents remove a merged worktree, its branch and the remote branch themselves. `scripts/remove-merged.sh` checks that the PR merged and nothing is left unsaved, and the install allows it and the git cleanup commands in Claude Code and Codex, so auto mode no longer denies them.

- **turn-voice on a Mac** `install.sh` gives Claude Code, Codex and Kimi Code the spoken turn end on macOS too: the same cues, phrases and voices, played through `afplay`. `TURN_VOICE_LANG=en` picks English.

- **Agent hooks** the install adds the time hook, the Chrome only hook and the archive block to Claude Code, the time hook to Codex and Kimi Code, and copies the MCP servers of Claude Code to both. They move here from `agent-skills-private`, along with the `guide-on-site`, `hung-process` and `rewrite-repo` skills.

- **Older runs stop on GitHub** a newer push to `main` cancels the Checks and the release build of the older commit through `concurrency`, with the local-ci page off too.

- **git-worktrees** an agent in a worktree doesn't run `git stash`, since every worktree of a repo shares it. Work goes aside in a WIP commit or a `git diff` patch. The lens brief of `reviewer` and `app-audit` carries the same line.

- **Lint before the push** a pre-push hook runs `mise run lint`, so a lint or format error stays on the PC instead of failing Checks on `main`.

- **icon-styles** the picked icon now shows beside the app name in the header, the home page and the site nav. Right after the merge the agent updates Google Play, AdMob and AdSense through `store-media`, unasked.
- **Docs** `docs/features.md` gets a heading per skill with its spec. The README, the architecture, the user flows and the launch and session end specs match the code: Release after `check` through `workflow_run`, turn-voice in Codex and Kimi Code, the new skill behaviour of the week.
- **install.sh** a piped install restores only the files deleted by hand in `~/.agent-skills`, and keeps your edits to the rules there.
- **CI** `mise run lint` stops naming the deleted `wait-for-checks.sh`, so `check` passes on `main` and releases go out again.
- **CI** Release starts on `workflow_run` once Checks pass on `main`, one at a time. It no longer holds a PC runner while it waits, which starved Checks and timed releases out.

- **icon-styles** the pick server reads the request body before it answers 403, so Windows no longer resets the socket and the preview test stops failing.
- **git-worktrees** the background trash delete names `C:\code\.trash` again, with its backslashes.
- **translations** the examples name the pattern in place of paths in private repos.
- **implement-ticket** waits on another session that holds the same files, in words that need no private skill.
- **CI** one release runs at a time again, so two quick merges can no longer pick the same tag. A push to `main` keeps its check run, which Release waits for, `wait-for-checks.sh` gets linted, and each script gets its run bit. The docs lose a pasted "Release build timing" block.
- **Parallel release builds** releases build beside checks after a push. Only publication waits for matching checks; open PRs hold no build.

- **implement-ticket** follows repo checkout rules and can use a clean default branch when the repo allows it.

- **Checks** fix the architecture diagram link and the new-flow label so skill validation passes.
- **Tests** stop the icon preview server before closing its socket so Windows tests do not race.

- **turn-voice** the cue and the voice play as one sound, with no gap between them, so the first word "Агент" comes through whole.
- **turn-voice** the Codex Stop hook prints `{}` and returns in about a second, since the speaking copy no longer holds the hook's pipes.
- **turn-voice** Codex and Kimi Code speak the end of each turn too. The hook returns at once and speaks from a child process.
- **install.sh** wires the writing rules into `~/.kimi-code/AGENTS.md` for Kimi Code.
- **turn-voice** drops the emoji from the session title before it speaks, so the ✅ or 👤 marker prefix stays silent.
- **Skills** each description fits 480 characters, down from 1024, since every session loads them: the triggers in English and Russian and the result stay, the long lists go.
- **reviewer** a new core that **review** and **app-audit** both load. It starts one subagent per lens on the strongest model, fetches a skill from skills.sh for a domain lens such as legal or SEO, and adds two lenses: PR size, and free maintained libraries over hand-written code.
- **one-pager** a new skill: a spec, a design doc or a write-up gets the full text first, then a one-pager on top that fits one screen. **specs** writes each spec this way.
- **create-pr** and **review** draw each diagram as a Before and After pair, with nodes coloured green new, amber changed, red removed, gray unchanged, and **architecture** does the same for a restructure.
- **ads-setup** the dev device reference passes the word check again.
- **ads-setup** an app site gets a home page with 300 words of visible, server-rendered text and 5 content pages before it goes into AdSense, and the account applies with one site at a time. 4 app sites with a map, a fretboard or a button on the home page got the whole account refused. The word count runs through `perl`, since `sed` strips a one-line page from the first `<script>` to the last.
- **translations** a new skill: each string a person sees reaches every language in the same change, and English errors from native code map to translated keys.
- **ads-setup** and **play-release** read and write AdMob, AdSense and Play through their MCP server or API first, and keep the browser for the pages the API lacks. play-release adds the service account to each new app.
- **git-worktrees** gives a worktree for an Android build a short name, since Windows fails past 260 characters, and names the Gradle daemon as the usual holder of a locked folder.
- **demo-media** retakes a frame that shows the host name of the machine.
- **git-worktrees** a finished worktree moves to a `.trash` folder beside the repos in under a second, and the delete runs in the background. `git worktree remove` held the agent for minutes on the `node_modules` of a Windows worktree.
- **ads-setup** an app with ads hides them on the developer's own device, with a Show test ads switch in Settings that only that device sees.
- **Docs** each heading of `docs/features.md` links its spec, and each feature that had no spec got one.
- **specs** a repo with `docs/features.md` ends each feature section with a link to its spec, and `docs/features.md` here does the same.
- **turn-voice** the phrase always splits into Russian and English runs, even with one voice, and the default voice is `de-DE-SeraphinaMultilingualNeural`.

- **Markdown** markdownlint-cli2 lints the docs in `mise run lint` and CI.

- **Key words** each paragraph and list item of every skill, reference, `AGENTS.md` and the instructions file states its rule with MUST, SHOULD or MAY. `scripts/keyword-check.mts` fails lint on a rule without one.
- Specs: one file per feature under `specs/`, with each dated spec moved in as an entry under `## Changes`.
- **Security** the voice-test and icon-styles local pages answer only their own page. Another site open in the browser could play voices, or post a fake icon pick that the agent read as the person's answer.
- **install** a failed temp write leaves `CLAUDE.md` as it was, where before it emptied and deleted the file.
- **turn-voice** `settings.json` gets written through a temp file, so Claude Code never reads half of it. Two hooks at once speak once, a title ending in `\` still speaks, and a long transcript gets read line by line.
- **domain-check** a name with trade mark results past the pages read shows as risky, and a reply cut off mid body gets a retry.
- **voice-test** a failed Play shows its error on the page, and only the latest filter click fills the voice list.
- **reddit-comments** a thread whose page failed to load stays "error" after Enter, so a later run doesn't skip it as posted.
- **legal-check** a "SEE LICENSE IN <url>" license gets flagged again.
- **CI** `mise run test` runs the skill checks, the new unit tests and the install test. actionlint lints the workflows, Dependabot updates the pinned actions, and the compiled `.pyc` left git.
- **turn-voice** a turn that ends `👤 !!!USER STEPS!!!` rings a doorbell and says "did its part, your steps wait on" the task, apart from a finished one.
- **demo-media** lessons from the first run on tickalot: the capture tools sit in the `demo` task, ffmpeg comes from the Gyan build on Windows, one browser context records the whole run, and the frame check also looks for wrong emoji and for web content with people.
- **CI** mise installs oxfmt with npm, so `oxfmt --check` finds its own dependencies on the Windows runner again.
- **git-worktrees** a leftover worktree folder gets removed by its full path, since the safety check blocks `rm -rf` on a variable.
- **mise** each new worktree of a repo gets `mise trust`, so its first command doesn't stop on an untrusted config.
- **Session end** the agent doesn't archive its session. The person archives it once they see the work is done.
- **turn-voice** one multilingual woman, `en-US-AvaMultilingualNeural`, reads the whole phrase in one fetch, and the phrases are in Russian by default. `install.ps1 -VoiceLang English` switches them back.
- **architecture** the Decisions section of `docs/architecture.md` gives each choice a heading: what was picked, why, the trade-off, each rejected rival with the reason it lost, and the cost to undo. The repo's own `docs/architecture.md` follows it.
- **CI** every text file checks out with LF, so `oxfmt --check` passes on the Windows runner.

- **Lint and format** ruff checks the Python, oxlint the TypeScript, oxfmt formats every file, shellcheck and shfmt the scripts. CI runs `mise run lint`. The `mise` and `architecture` skills name oxlint and oxfmt in place of ESLint and Prettier.

- **legal-check** a new skill lists the legal risks of an app: copyleft and unclear licenses, data SDKs with no privacy policy, sensitive permissions, trade marks and store policy. It writes `docs/legal-risks.md`, fixes the safe items in a PR and puts the rest in `TODO.md`.
- **e2e-walk** walks the build on the phone that the Archon Apps tab names, and knows the release tags that differ from the repo name.
- **icon-styles shows the icons** the skill sends a picture of all 10 drafts into the session before it asks for a pick, so a picker that fails to render still leaves them visible.
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
