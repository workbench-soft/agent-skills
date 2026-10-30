---
name: voice-test
description: 'Use when someone wants to hear the text to speech voices, compare them or pick one, in any language: "play all the voices", "let me hear the voices", "test the edge-tts voices", "which voice sounds best", "послушать все голоса", "прогони тесты по голосам", "выбрать голос". Runs a script that plays each Microsoft neural voice from edge-tts on the speakers: its number and name, then numbered lines. A multilingual voice says 4: English, Russian, a mixed phrase, and the same phrase joined from Russian and English chunks the way turn-voice builds it. A voice for one language says only its own line. Plays the voices that read both languages apart from the English only and Russian only ones, and women, men and children apart inside each, caches the clips for the next run, and prints the number and the voice id of each, so the person notes the ones they like, and resumes from any number.'
---

# Play every voice

The person hears each voice say the same lines and notes the numbers they
like. Load the `writing-style` skill before the first line a person reads,
unless it is in context.

## 1. Pick the set

Read from the request which voices to play. Ask through the question tool only
when the request leaves the set open and the person might want more than the
default.

| Set | Flag | Voices |
| --- | --- | --- |
| English, Russian, multilingual | none | about 56 |
| other languages | `--lang de,fr` | those locales and the multilingual ones |
| every voice | `--all` | about 320, over an hour |
| a few by name | `--voice Ava,Svetlana` | names holding a word |

## 2. Run it

```bash
mise x -- python <skill-dir>/scripts/voice_test.py
```

`<skill-dir>` is the folder of this file. edge-tts MUST be on `PATH`; without
it, run `mise use -g pipx:edge-tts@7.3.1` first.

- **Background** the run plays for minutes, so start it in the background and
  wait for it inside the turn.
- **Both languages** the multilingual voices play first. Each says its
  number and name, then 4 lines that start with 1 to 4: English, Russian,
  the mixed phrase, and the mixed phrase joined from chunks.
- **One language** the English only, then the Russian only voices say their
  number and name and one line, "1." in their language.
- **Chunks** line 4 reads each Russian and English chunk apart and cuts the
  silence at each join. A chunk the voice can't read goes to Svetlana or Ava.
- **Groups** inside each language set, women play first, then men, then
  children. `--group child` or
  `--group female,male` plays only those. A child voice is a `Cartoon` one,
  and the list gives no other age.
- **Own lines** `--en`, `--ru` and `--mix` replace the default lines.
- **One line** `--line chunks` has each voice say its name and line 4 only.
  `mix` and `chunks` play the multilingual voices, `ru` adds the Russian only
  ones, `en` the English only ones.
- **Resume** `--start 12` begins at number 12, and `--count 5` stops after 5
  voices. The numbers hold while the set stays the same.
- **Cache** the voice list and the clips stay in `--out`,
  `%LOCALAPPDATA%oice-test` or `~/.cache/voice-test`. The next run plays
  them without the network. `--refresh` fetches the list again and retries
  lines that had no audio.
- **Fetch only** `--no-play` fills the cache and lists the voices.

## 3. Report

Show the printed list as a table: number, voice id, the clips it lacked. A
voice for one language returns no Russian clip, and the script marks it
`(no Russian)`. A voice that lacks the line in its own language fails on the
Microsoft side, as `ru-RU-DmitryNeural` did in October 2026. Name it as
broken, and a later run MAY try it again.

Ask the person which numbers they liked. When they pick a voice for
`turn-voice`, give the installer line with it:

```powershell
.\hooks\turn-voice\install.ps1 -Lang ru -RuVoice ru-RU-DmitryNeural -EnVoice en-US-AndrewNeural
```
