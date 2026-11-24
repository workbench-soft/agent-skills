# TODO

## app-audit

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

## progress-reports

- [ ] Load the progress mod in each Claude Code session: in PowerShell run `cd $env:WBS_ROOT\agent-skills; mise x -- node claude/install-mods.mts "$env:USERPROFILE\.claude\settings.json"`, then quit and reopen Claude Desktop (denied)
