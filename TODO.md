# TODO

## app-audit

- [ ] Check Play and Use still work after the 2026-11-01 origin check. The sound needs ears, so an agent can't check it.
  1. Ask an agent to "play the voices". On the voice-test page press Play on one voice and check you hear it.
  2. Ask an agent to "make icon options" in any repo. In the picker press Use on one icon and check the agent gets the pick.
- [ ] Decide: `hooks/turn-voice/install.ps1` runs `mise use -g uv@0.9`, which rewrites the person's global uv pin (latest 0.13.6)
- [ ] Decide: answering "no" at the `install.ps1 -Uninstall` prompt still removes the turn-voice hooks, since install.sh exits 0 on "left alone"
- Left: the git hooks don't rebuild `turn-voice.exe` after a pull. Rebuilding there puts csc and mise on every checkout, a design call
- Left: the mp3 split and trim code sits in `turn-voice.cs` and `voice_test.py` with no shared test. A test needs a C# harness the repo lacks
- Left: `writing-style.instructions.md` is 8.4 KB and loads on every agent turn. Trimming it is a product call
- Left: no `tsc --noEmit` and no typeAware oxlint. Each needs new packages and a package.json
- Left: Dependabot auto merge workflow. It needs write permissions, a loosening
- Left: check.yml runs on push and pull_request, twice per PR. Dropping one loosens fork PR checks
- Left: Web Awesome from jsdelivr has no SRI, and offline the voice tree loses its ticks. The loader pulls more files, low gain
- Left: turn-voice and the relink hooks fail silently unless `TURN_VOICE_LOG` is set. Logging is a design call
- Left: a release run cancelled between the tag push and `gh release create` leaves a tag with no release. Rare, harmless
- Left: check_names.py counts SERVFAIL as taken and has no tests for `verdict` and the page parsers. Tests need saved live pages
- Left: the piped install restore of deleted files (2026-11-10 audit) has no automated test. A test needs a clone with an origin inside the temp home test, which runs for minutes on Windows
