# TODO

## app-audit

- [ ] Pull main in the clone the agents link to, then rerun `install.ps1` so `turn-voice.exe` gets the 30 day clip cache (2026-10-30 audit PR)
- [ ] Check the new `install-posix` CI job passed on its first run on main (the PR merged without waiting for CI)
- Left: the git hooks don't rebuild `turn-voice.exe` after a pull. Rebuilding there puts csc and mise on every checkout, a design call
- Left: the mp3 split and trim code sits in `turn-voice.cs` and `voice_test.py` with no shared test. A test needs a C# harness the repo lacks
- Left: `writing-style.instructions.md` is 8.4 KB and loads on every agent turn. Trimming it is a product call
