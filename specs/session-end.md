# A clear end to every session

## What it does for the person

- **Done marker** the last line of a finished session is
  `✅ !!!COMPLETED!!!`. The person spots it at the bottom of the log without
  reading the rest.
- **Not done marker** a turn that stops with work left, an open question
  included, ends with `⚠️ !!!NOT COMPLETED!!!` and what is left.
- **Archive** a finished session may archive itself once every question got
  its answer.
- **Sound** the agent plays a sound and sends a notification once the work is
  done, so the person hears it from another window.
- **Running marker** a turn that ends while background work still runs says
  so in its last line, `⏳ !!!RUNNING!!!`, with what runs. A quiet session that
  looks finished but still works goes away.
- **Questions** every question to the person goes through the agent's
  question tool, so the app shows it as a question.

## User flows

1. The person asks for a task. The agent works, then checks that no
   background task, subagent or CI watch still runs.
2. All work is done. The agent writes what is left to `TODO.md`, plays the
   sound, sends the notification and ends with `✅ !!!COMPLETED!!!`. It may
   archive the session.
3. Some work still runs. The agent waits for it inside the turn. When the
   turn has to end first, its last line is `⏳ !!!RUNNING!!!` with what runs,
   and the agent picks the work up on its own when it finishes.
4. The agent needs a decision, or a step failed. It asks through the
   question tool and ends with `⚠️ !!!NOT COMPLETED!!!` and what is left.

## How it works

- **`writing-style.instructions.md`** a section "End of a session" holds the
  rules. Every agent reads that file on each turn.
- **Sound** a one line shell command per OS. Claude also has a push
  notification tool.

## Limits

- **Agent made** the agent runs the sound itself. An agent that stops
  without following the rule plays no sound.
- **Question tool** an agent without one, such as Codex in a terminal, asks
  in a single line at the end of the answer.

## Changes

### 2025-10-29 done, running and not done markers, a sound, an archive

- **Why** the person can't tell a finished session from one waiting on
  background work. Some sessions end with "I'll wait, then write Continue".
- **Changes** a new section in `writing-style.instructions.md`, a line in
  `README.md`, a new `CHANGELOG.md`.
- **Steps** this spec, then the rules and the docs.
- **Docs** `README.md`.

### 2025-10-30 Claude on Windows speaks the end of each turn

- **Why** the agent skipped the sound, so the person heard none. One tada for
  every outcome also told the person too little.
- **Changes** `hooks/turn-voice/` holds a small C# player and its installer.
  `install.ps1` builds it with the `csc.exe` that ships with Windows and adds
  Claude hooks to `~/.claude/settings.json`. Each hook plays a cue, then a
  voice names the folder, the outcome and the session title:
  - **Done** tada, "agent <folder> finished the task: <title>".
  - **Not done, API error** a falling trombone, then the outcome.
  - **Question, permission prompt** two rising notes, "waits for your answer".
  - **Running, plain reply** a short tick, then the outcome.
  - **Archive** tada, "finished the task and archived the session".
- **Voice** the free Microsoft neural voices through `edge-tts`, which the
  installer adds through mise. Each phrase is fetched once and cached in
  `%LOCALAPPDATA%\turn-voice`, and a clip unplayed for 30 days goes.
  Offline, the Windows voice reads it.
- **Language** Russian or English, from `LANGUAGE.md`.
- **Rules** on Windows with Claude the agent no longer plays the sound itself.
  macOS and Linux keep the one line command.
- **Limits** a rerun of `install.ps1` picks up a change to the player. The git
  hooks rerun only `install.sh`.
- **Docs** `README.md`, `CHANGELOG.md`, `writing-style.instructions.md`.

### 2025-10-30 a native voice for each language in a phrase

- **Why** the Russian neural voice mangled the English folder names and
  session titles. The multilingual voices sounded worse in both languages.
- **Changes** the lead, folder name included, keeps the install language:
  Svetlana for Russian. The task title gets Svetlana when it has Cyrillic and
  Ava when it is English. Both parts join into one mp3, so no pause opens
  between them. `install.ps1` takes `-RuVoice` and `-EnVoice`.
- **Docs** `CHANGELOG.md`.

### 2026-10-30 only the neural voices speak, once per event

- **Why** a phrase sometimes played twice. Once the robotic Windows voice read
  it, after `edge-tts` timed out.
- **Changes** in `hooks/turn-voice/turn-voice.cs`:
  - **No Windows voice** a failed `edge-tts` fetch leaves only the cue.
    `System.Speech` goes from the build.
  - **One per session** a repeat is keyed on the session and the mode, so a
    twin with a different stdin stays quiet too.
  - **Archive** the Stop that follows an archive stays quiet for 2 minutes.
  - **Queue** a named mutex plays one phrase at a time across sessions.
  - **Timeout** `edge-tts` gets 30 seconds in place of 15.
- **Steps** this entry, then the player, then the changelog.
- **Docs** `CHANGELOG.md`.

### 2026-10-30 each word in its own voice, with no gap between voices

- **Why** a Russian title with English words in it went to Svetlana whole,
  and she misread the English. Where two voices met, the silence at the end
  and start of each clip made a pause.
- **Changes** in `hooks/turn-voice/turn-voice.cs`:
  - **Runs** the whole phrase, lead and title, splits into Cyrillic and Latin
    runs. Svetlana reads the Cyrillic ones, Ava the Latin ones. Digits and
    signs stay with the run before them.
  - **Trim** `edge-tts` writes the speech timings beside each clip. The
    player drops the mp3 frames outside them, with a short margin.
  - **Cache** each run is fetched once, its timings beside it.
- **Steps** this entry, then the player, then the changelog.
- **Docs** `CHANGELOG.md`.

### 2026-10-30 a turn that ends on a question gets its own marker and cue

- **Why** a turn waiting on a question ended `⚠️ !!!NOT COMPLETED!!!`, so the
  voice played the falling trombone. A question is no failure.
- **Changes** a new marker `❓ !!!QUESTION!!!` in
  `writing-style.instructions.md`, for a turn whose only open item is a
  question to the person. `⚠️` keeps failures and stops. In
  `hooks/turn-voice/turn-voice.cs` the new marker plays the two rising notes
  and "waits for your answer".
- **Steps** this entry, then the rules, the player and the docs.
- **Docs** `README.md`, `CHANGELOG.md`.

### 2026-10-30 one voice for both languages

- **Why** the person wanted one voice for the whole phrase. Natasha
  (`en-AU-NatashaNeural`) has no Russian, and `edge-tts` has no child voice
  that reads both languages.
- **Changes** `install.ps1` defaults `-RuVoice` and `-EnVoice` to
  `en-US-EmmaMultilingualNeural`. The phrase still splits into Cyrillic and
  Latin runs, each fetched apart.
- **Docs** `CHANGELOG.md`.
- **Later** Emma sounded French to the person, so both defaults went to
  `en-US-AvaMultilingualNeural`. `edge-tts` has no British voice that reads
  Russian.

### 2026-10-30 the first word of the phrase comes through whole

- **Why** the person sometimes heard "...ент Local ci" in place of "Агент
  Local ci". The sound device slept while the clip downloaded, then dropped
  the first frames as it woke.
- **Changes**
  - **Lead in** `hooks/turn-voice/turn-voice.cs` puts 16 copies of the
    clip's silent first frame, 0.4 seconds, ahead of every phrase.
  - **Busy exe** `hooks/turn-voice/install.ps1` moves a running
    `turn-voice.exe` aside before the build, and removes the old copies on
    the next run.
- **Docs** `CHANGELOG.md`.

### 2026-10-30 English runs keep an English voice

- **Why** the person heard English words read with a French accent. Ava
  Multilingual guesses the language of each run, and a short Latin run can
  pass for French.
- **Changes** `install.ps1` defaults `-EnVoice` to `en-US-AvaNeural`, the
  same speaker with English only. `-RuVoice` stays
  `en-US-AvaMultilingualNeural`, since Cyrillic runs read as Russian.
- **Docs** `CHANGELOG.md`.

### 2026-10-30 Russian runs keep a Russian voice

- **Why** the person wanted each run pinned to its own language, with no
  guessing left.
- **Changes** `install.ps1` defaults `-RuVoice` to `ru-RU-SvetlanaNeural`,
  a Russian only voice. English runs keep `en-US-AvaNeural`.
- **Docs** `CHANGELOG.md`.

### 2026-10-30 the voice speaks Russian by default

- **Why** the person heard every phrase in English and wants Russian. The
  voice took its language from the review text, which is English.
- **Changes** `install.ps1` gets `-VoiceLang`, `Russian` by default, and
  passes it to `hooks/turn-voice/install.ps1`. `LANGUAGE.md` no longer sets
  the voice.
- **Docs** `CHANGELOG.md`.

### 2026-10-31 English by default, read by Maisie

- **Why** Ava and Svetlana sounded like two different women. The person wants
  English for most of the phrase, in Maisie's voice.
- **Changes** `install.ps1` defaults `-VoiceLang` to `English`, and
  `hooks/turn-voice/install.ps1` defaults `-EnVoice` to
  `en-GB-MaisieNeural`. Cyrillic runs, such as a Russian task title, keep
  `ru-RU-SvetlanaNeural`.
- **Docs** `README.md`, `CHANGELOG.md`.

### 2026-10-31 one multilingual woman reads it all, in Russian first

- **Why** the person hears too much English and wants one woman for both
  languages, with Russian first in every phrase.
- **Changes**
  - **Voice** `hooks/turn-voice/install.ps1` defaults `-RuVoice` and
    `-EnVoice` to `en-US-AvaMultilingualNeural`.
  - **One fetch** when both voices and pitches match, `turn-voice.cs` sends
    the whole phrase to `edge-tts` at once. Ava then reads a Latin name inside
    a Russian sentence, with no short run to take for French.
  - **Language** `install.ps1` defaults `-VoiceLang` to `Russian`.
- **Docs** `README.md`, `docs/architecture.md`, `CHANGELOG.md`.
