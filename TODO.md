# TODO

## app-audit

- [ ] Pull main in the clone the agents link to, then rerun `install.ps1` so `turn-voice.exe` gets the 30 day clip cache and the 2026-11-01 fixes
- [ ] Open the voice-test page and the icon-styles picker once, and check Play and Use still work after the origin check (2026-11-01 audit PR)
- [ ] Decide: `hooks/turn-voice/install.ps1` runs `mise use -g uv@0.9`, which rewrites the person's global uv pin (latest 0.13.6)
- [ ] Decide: answering "no" at the `install.ps1 -Uninstall` prompt still removes the turn-voice hooks, since install.sh exits 0 on "left alone"
- [ ] Hands-off files for the next edit: `skills/domain-check/SKILL.md` risky row can name the "unread" reason, `.agents/skills/add-skill/SKILL.md` and its `.claude` copy can name `mise run lint` and `mise run test`
- Left: the git hooks don't rebuild `turn-voice.exe` after a pull. Rebuilding there puts csc and mise on every checkout, a design call
- Left: the mp3 split and trim code sits in `turn-voice.cs` and `voice_test.py` with no shared test. A test needs a C# harness the repo lacks
- Left: `writing-style.instructions.md` is 8.4 KB and loads on every agent turn. Trimming it is a product call
- Left: no pre-push hook, no `tsc --noEmit` and no typeAware oxlint. Each needs new packages and a package.json
- Left: Dependabot auto merge workflow. It needs write permissions, a loosening
- Left: check.yml runs on push and pull_request, twice per PR. Dropping one loosens fork PR checks
- Left: Web Awesome from jsdelivr has no SRI, and offline the voice tree loses its ticks. The loader pulls more files, low gain
- Left: turn-voice and the relink hooks fail silently unless `TURN_VOICE_LOG` is set. Logging is a design call
- Left: a release run cancelled between the tag push and `gh release create` leaves a tag with no release. Rare, harmless
- Left: check_names.py counts SERVFAIL as taken and has no tests for `verdict` and the page parsers. Tests need saved live pages
