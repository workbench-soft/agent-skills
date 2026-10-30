# Listen to every voice

## What it does for the person

- **Hear before picking** the person hears each neural voice say the same
  lines, then picks the ones for `turn-voice` or an app.
- **Same test for each voice** first the voice's number and name, then 3
  lines numbered 1, 2 and 3: English, Russian and a mix of both. Line 4
  joins the mix from chunks, as `turn-voice` does.
- **Groups** women, then men, then children, or one group alone.
- **Resume** a stopped run picks up at the number the person names.

## User flows

1. The person asks to hear the voices. The agent runs the script.
2. The script lists the voices: English, Russian and multilingual ones by
   default, every voice with `--all`.
3. For each voice it prints the number and the name, then plays the 4 clips
   with a short pause between them.
4. The person notes the numbers they liked and stops the run at any point.
5. A later run starts at the noted number with `--start`.

## How it works: modules, files, data

- **`skills/voice-test/SKILL.md`** when to run the script and its flags.
- **`skills/voice-test/scripts/voice_test.py`** asks `edge-tts` for the voice
  list and for each clip, caches the mp3 files, and plays them. Windows
  plays through `winmm`, macOS through `afplay`, Linux through `ffplay` or
  `mpg123`.
- **Cache** the voice list and the clips sit in `%LOCALAPPDATA%oice-test`
  or `~/.cache/voice-test`. A second run plays from it.

## Limits

- **Online** `edge-tts` needs the Microsoft service.
- **Long** every voice takes about 15 seconds, so `--all` runs over an hour.
- **Other languages** a voice for one language returns no audio for a line
  in another. Only the multilingual voices read all 3 lines.
- **Broken voices** `ru-RU-DmitryNeural` returns no audio past one word, on
  the Microsoft side. The script marks such clips and goes on.

## Changes

### 2026-10-30 a script that plays every voice

- **Why** the person wants to hear each voice before choosing one.
- **Changes** the new skill and its script, a line in `README.md` and
  `CHANGELOG.md`.
- **Steps** this spec, then the script, then the skill and the docs.
- **Docs** `README.md`, `CHANGELOG.md`.

### 2026-10-30 numbered lines, men or women, a lasting cache

- **Why** the full run hung on voice 1. The person also wants each line
  numbered, men and women apart, and no second download.
- **Changes** in `skills/voice-test/scripts/voice_test.py`:
  - **Hang** `edge-tts` writes stderr to a file, and a timeout kills its
    whole process tree. A pipe left open by its child blocked the wait.
  - **Lines** 3 lines that start with 1, 2 and 3. The name line starts with
    the voice's own number.
  - **Gender** `--gender male` or `--gender female`, read from the voice list.
  - **Cache** the voice list and the clips sit in `%LOCALAPPDATA%\voice-test`
    or `~/.cache/voice-test`. A line with no audio gets a `.none` mark, and
    `--refresh` clears the marks and the list.
- **Docs** `skills/voice-test/SKILL.md`, `CHANGELOG.md`.

### 2026-10-30 voices by group, and a 4th line joined from chunks

- **Why** women, men and the child voice came out mixed together. The person
  also wants to hear the phrase the way `turn-voice` builds it.
- **Changes** in `skills/voice-test/scripts/voice_test.py`:
  - **Groups** women first, then men, then children. A child voice is one in
    the `Cartoon` category, such as `en-US-AnaNeural`. The voice list holds
    no other age. `--group` replaces `--gender` and plays one or more groups.
  - **Line 4** the mixed phrase splits into Cyrillic and Latin chunks. The
    voice reads each chunk apart, and a chunk it returns no audio for goes to
    Svetlana or Ava. The quiet frames at each join are cut, as in
    `turn-voice`.
- **Docs** `skills/voice-test/SKILL.md`, `CHANGELOG.md`.

### 2026-10-30 voices that read both languages apart from the rest

- **Why** a voice for one language can't read the other, so 3 of its 4 lines
  were noise or silence.
- **Changes** in `skills/voice-test/scripts/voice_test.py`:
  - **Both languages** the multilingual voices play first and say all 4
    lines.
  - **One language** the English only voices come next, then the Russian
    only ones, then other locales. Each says one line, "1." and the line in
    its language. Other locales read the English line.
  - **Inside each** women, then men, then children, each under a heading.
- **Docs** `skills/voice-test/SKILL.md`, `CHANGELOG.md`.

### 2026-10-31 one line per voice

- **Why** the person wants to compare voices on one kind of line, such as
  only the phrase joined from chunks, without the other 3.
- **Changes** in `skills/voice-test/scripts/voice_test.py`, `--line` takes
  `en`, `ru`, `mix` or `chunks`, and each voice says its name and that line
  only. `mix` and `chunks` play the multilingual voices only, `ru` adds the
  Russian only ones, `en` the rest.
- **Window** `scripts/voice_test_ui.py` is a tkinter window over the script:
  the line, women, men or children, names, locales and the start number,
  then Play and Stop. `scripts/voice-test.cmd` opens it on a double click.
  Gender and age already had `--group`, and the voice list gives no age
  past the child voices.
- **Docs** `skills/voice-test/SKILL.md`, `CHANGELOG.md`.
- **Later** `README.md`, `docs/features.md` and `docs/user-flows.md`
  describe the window, the flags and the desktop shortcut.
- **Later** the tkinter window opened a console for each `edge-tts` call,
  had an unclear From field, and looked dated. It became a page:
  - **Server** `ui/server.ts`, Node 24 with no packages, restarts itself
    hidden, opens the page in an Edge app window, and quits once the page
    closes. Node joins `mise.toml` for it.
  - **Page** `ui/index.html` and `ui/app.ts`: the line, the groups and the
    languages, then a dropdown with a checkbox per voice, search, All and
    None. The choices stay in `localStorage`.
  - **Script** `voice_test.py` starts `edge-tts` and `taskkill` with no
    window, and `--list` prints the voices as JSON for the page.

### 2026-10-31 the voice dropdown is a checkbox tree

- **Why** the person wants to tick or untick a whole group, such as all
  Russian women, in one click.
- **Changes** the dropdown in `ui/app.ts` becomes a `wa-tree` from Web
  Awesome 3.14.0, loaded from jsDelivr. Each group is a branch with its own
  checkbox, half ticked when part of it is on. The search hides voices, and
  All and None act on the ones in view.
- **Off the list** Web Awesome is a ready component with no build step. The
  page already needs the network, since `edge-tts` does.
- **Docs** `README.md`, `docs/features.md`, `CHANGELOG.md`.


### 2026-10-31 pitch for a voice, and a pitched voice for the agents

- **Why** the person wants a voice higher or lower than its default, and the
  agents to speak with that pitched voice.
- **Changes**
  - **Script** `voice_test.py --pitch -10` passes `--pitch=-10Hz` to
    `edge-tts`. A clip with a pitch other than 0 gets its own cache key.
  - **Page** the voice picker gets a Pitch slider from -50 to +50 Hz, kept in
    `localStorage` and passed to the script on Play.
  - **Hook** `turn-voice.exe` takes 2 more args after `edge-tts`: the Russian
    and the English pitch, such as `-10Hz`. Without them the voice speaks at
    its own pitch, so old hooks keep working.
  - **Install** `install.ps1 -RuPitch -10 -EnPitch 5` writes them, and a
    reinstall without them keeps the pitches already set.
- **Steps** this entry, then the script and the page, then the hook and the
  install, then the docs.
- **Docs** `docs/features.md`, `skills/voice-test/SKILL.md`, `CHANGELOG.md`.
