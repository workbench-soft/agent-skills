#!/usr/bin/env python3
"""Play every edge-tts voice: its number and name, then numbered lines in the languages it reads.

Usage: voice_test.py [--all] [--lang en,ru] [--voice Ava] [--group female,male,child] [--start 5]
                     [--count 10] [--no-play] [--refresh] [--out DIR] [--tts PATH]
                     [--en TEXT] [--ru TEXT] [--mix TEXT]

A multilingual voice says 4 lines: English, Russian, the mixed phrase in one piece,
and the mixed phrase joined from chunks the way turn-voice builds it. A voice for one
language says only the line in its language. The multilingual voices play first, then
the English, Russian and other ones, and inside each women, men and children. By default it plays the English, Russian and multilingual voices. The voice
list and the clips are kept in --out, so a later run plays without the network.
Standard library only.
"""

import argparse
import hashlib
import os
import re
import shutil
import subprocess
import sys
import threading
import time
from concurrent.futures import Future, ThreadPoolExecutor
from pathlib import Path

EN = "The build finished, and every check passed on the first try."
RU = "Сборка закончилась, и все проверки прошли с первого раза."
MIX = "Агент agent skills сделал задачу: fix the release pipeline, и открыл pull request."
BOTH_LABELS = ("name", "1 English", "2 Russian", "3 mixed", "4 chunks")
READS = ("both", "en", "ru")
READ_TITLES = {"both": "Russian and English", "en": "English only", "ru": "Russian only"}
GROUPS = ("female", "male", "child")
GROUP_TITLES = {"female": "Women", "male": "Men", "child": "Children"}
# A voice with no audio for a chunk hands it to Svetlana or Ava.
RU_PARTNER = "ru-RU-SvetlanaNeural"
EN_PARTNER = "en-US-AvaNeural"
# Speech frames of the Microsoft voices carry a gain of 150 to 185, their silence about 130.
SPEECH_GAIN = 145
CLIP_GAP = 0.6
VOICE_GAP = 1.2
AHEAD = 3
TIMEOUT = 30


def default_out() -> Path:
    base = os.environ.get("LOCALAPPDATA") if sys.platform == "win32" else None
    return Path(base) / "voice-test" if base else Path.home() / ".cache" / "voice-test"


def find_tts(given: str | None) -> str:
    tts = given or shutil.which("edge-tts")
    if not tts:
        sys.exit("edge-tts is missing. Install it: mise use -g pipx:edge-tts@7.3.1")
    return tts


def list_voices(tts: str, out: Path, refresh: bool) -> list[tuple[str, str]]:
    """Each voice id with its group. The list is kept in voices.txt until --refresh."""
    cached = out / "voices.txt"
    if refresh or not cached.exists():
        text = subprocess.run([tts, "--list-voices"], capture_output=True, text=True, encoding="utf-8", check=True).stdout
        cached.write_text(text, encoding="utf-8")
    voices = []
    for line in cached.read_text(encoding="utf-8").splitlines():
        row = line.split()
        if len(row) > 1 and re.match(r"^[a-z]{2,3}-[A-Za-z0-9]+-\S+Neural$", row[0]):
            # The list gives no age. Its Cartoon voices are the child ones, such as en-US-AnaNeural.
            voices.append((row[0], "child" if "Cartoon" in line else row[1].lower()))
    return voices


def pick(voices: list[tuple[str, str]], args: argparse.Namespace) -> list[tuple[str, str]]:
    groups = [g.strip() for g in args.group.split(",")]
    voices = [(v, g) for v, g in voices if g in groups]
    if args.voice:
        words = [w.lower() for w in args.voice.split(",")]
        voices = [(v, g) for v, g in voices if any(w in v.lower() for w in words)]
    elif not args.all:
        langs = tuple(l.strip() + "-" for l in args.lang.split(","))
        voices = [(v, g) for v, g in voices if v.startswith(langs) or "Multilingual" in v]
    order = lambda vg: (READS.index(reads(vg[0])) if reads(vg[0]) in READS else len(READS), reads(vg[0]), GROUPS.index(vg[1]))
    return sorted(voices, key=order)


def reads(voice: str) -> str:
    """both for a multilingual voice, else the language code of its locale."""
    return "both" if "Multilingual" in voice else voice.split("-")[0]


def heading(voice: str, group: str) -> str:
    language = READ_TITLES.get(reads(voice), f"{reads(voice)} only")
    return f"{language}, {GROUP_TITLES[group].lower()}"


def spoken_name(voice: str) -> str:
    # en-US-AvaMultilingualNeural becomes "Ava Multilingual".
    short = voice.split("-", 2)[2].removesuffix("Neural")
    return re.sub(r"(?<=[a-z])(?=[A-Z])", " ", short)


def fetch(tts: str, voice: str, text: str, out: Path) -> Path | None:
    file = out / (hashlib.sha1(f"{voice}|{text}".encode()).hexdigest()[:16] + ".mp3")
    # A .none file marks a line the voice returned no audio for, so a later run skips it.
    none = file.with_suffix(".none")
    if file.exists():
        return file
    if none.exists():
        return None
    part = file.with_name(file.stem + f".{threading.get_ident()}.part")
    log = part.with_suffix(".log")
    try:
        for _ in range(2):
            # stderr goes to a file: a pipe stays open in the child edge-tts starts, and the wait hangs on it.
            with open(log, "w+b") as err:
                proc = subprocess.Popen([tts, "--voice", voice, "--text", text, "--write-media", str(part)],
                                        stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=err)
                try:
                    code = proc.wait(timeout=TIMEOUT)
                except subprocess.TimeoutExpired:
                    kill_tree(proc)
                    part.unlink(missing_ok=True)
                    continue
                err.seek(0)
                stderr = err.read().decode("utf-8", "replace")
            if code == 0 and part.exists() and part.stat().st_size > 0:
                part.replace(file)
                return file
            part.unlink(missing_ok=True)
            # A voice for one language returns no audio for text in another, so a retry won't help.
            if "NoAudioReceived" in stderr:
                none.touch()
                return None
            time.sleep(1)
        return None
    finally:
        log.unlink(missing_ok=True)


def kill_tree(proc: subprocess.Popen) -> None:
    # On Windows edge-tts.exe is a launcher, and its Python child keeps running after a plain kill.
    if sys.platform == "win32":
        subprocess.run(["taskkill", "/T", "/F", "/PID", str(proc.pid)], capture_output=True, check=False)
    else:
        proc.kill()
    proc.wait()


def chunks(text: str) -> list[str]:
    """Cyrillic and Latin runs. Digits and signs stay with the run before them, as in turn-voice."""
    runs, head = [], ""
    for m in re.finditer(r"[А-Яа-яЁё][^A-Za-z]*|[A-Za-z][^А-Яа-яЁё]*|[^A-Za-zА-Яа-яЁё]+", text):
        if not re.search(r"[A-Za-zА-Яа-яЁё]", m.group()):
            head += m.group()
            continue
        run = (head + m.group()).strip()
        head = ""
        if run:
            runs.append(run)
    return runs


def frame(b: bytes, i: int) -> tuple[int, int]:
    """Size and global gain of the Layer III frame at i, or (0, 0) when no frame starts there."""
    if b[i] != 0xFF or b[i + 1] & 0xE0 != 0xE0 or (b[i + 1] >> 1) & 3 != 1:
        return 0, 0
    version, bitrate_index, rate_index = (b[i + 1] >> 3) & 3, b[i + 2] >> 4, (b[i + 2] >> 2) & 3
    if version == 1 or bitrate_index in (0, 15) or rate_index == 3:
        return 0, 0
    mpeg1, mono = version == 3, b[i + 3] >> 6 == 3
    rates1 = (0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320)
    rates2 = (0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160)
    rate = (44100, 48000, 32000)[rate_index] >> (0 if mpeg1 else 1 if version == 2 else 2)
    samples = 1152 if mpeg1 else 576
    size = samples // 8 * (rates1 if mpeg1 else rates2)[bitrate_index] * 1000 // rate + ((b[i + 2] >> 1) & 1)
    # Side info: main_data_begin, private bits, scfsi, then part2_3_length 12 and big_values 9.
    skip = (18 if mono else 20) if mpeg1 else (9 if mono else 10)
    bit = (i + 4 + (2 if b[i + 1] & 1 == 0 else 0)) * 8 + skip + 21
    gain = ((b[bit // 8] << 8 | b[bit // 8 + 1]) >> (8 - bit % 8)) & 0xFF if bit // 8 + 1 < len(b) else 0
    return size, gain


def trim(mp3: bytes, cut_start: bool, cut_end: bool) -> bytes:
    """Cuts the quiet frames at the ends of a clip, keeping 2 frames before the speech and 3 after."""
    frames, pos = [], 0
    while pos + 8 <= len(mp3):
        size, gain = frame(mp3, pos)
        if size <= 0 or pos + size > len(mp3):
            return mp3
        frames.append((pos, size, SPEECH_GAIN <= gain < 210))
        pos += size
    loud = [k for k, (_, _, speech) in enumerate(frames) if speech]
    if not loud:
        return mp3
    first = max(0, loud[0] - 2) if cut_start else 0
    last = min(len(frames) - 1, loud[-1] + 3) if cut_end else len(frames) - 1
    return mp3[frames[first][0]:frames[last][0] + frames[last][1]]


def fetch_chunked(tts: str, voice: str, text: str, out: Path) -> Path | None:
    """The voice reads each chunk apart. A chunk it has no audio for goes to Svetlana or Ava."""
    file = out / (hashlib.sha1(f"chunked|{voice}|{text}".encode()).hexdigest()[:16] + ".mp3")
    if file.exists():
        return file
    parts = []
    for run in chunks(text):
        clip = fetch(tts, voice, run, out) or fetch(tts, RU_PARTNER if re.search("[А-Яа-яЁё]", run) else EN_PARTNER, run, out)
        if not clip:
            return None
        parts.append(clip.read_bytes())
    joined = b"".join(trim(p, k > 0, k < len(parts) - 1) for k, p in enumerate(parts))
    file.write_bytes(joined)
    return file


def fetch_voice(pool: ThreadPoolExecutor, tts: str, voice: str, number: int, args: argparse.Namespace) -> tuple[tuple, list[Future]]:
    name = pool.submit(fetch, tts, voice, f"{number}. {spoken_name(voice)}.", args.out)
    language = reads(voice)
    if language != "both":
        # A voice for one language says only its own line. Other locales try the English one.
        line, label = (args.ru, "1 Russian") if language == "ru" else (args.en, "1 English")
        return ("name", label), [name, pool.submit(fetch, tts, voice, f"1. {line}", args.out)]
    whole = [pool.submit(fetch, tts, voice, text, args.out) for text in (f"1. {args.en}", f"2. {args.ru}", f"3. {args.mix}")]
    return BOTH_LABELS, [name] + whole + [pool.submit(fetch_chunked, tts, voice, f"4. {args.mix}", args.out)]


def play(file: Path) -> None:
    if sys.platform == "win32":
        import ctypes
        mci = ctypes.windll.winmm.mciSendStringW
        mci(f'open "{file}" type mpegvideo alias vt', None, 0, None)
        mci("play vt wait", None, 0, None)
        mci("close vt", None, 0, None)
        return
    player = (["afplay"] if sys.platform == "darwin" else
              ["ffplay", "-nodisp", "-autoexit", "-loglevel", "quiet"] if shutil.which("ffplay") else
              ["mpg123", "-q"])
    subprocess.run(player + [str(file)], check=False)


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("--all", action="store_true", help="every voice, about 320")
    p.add_argument("--lang", default="en,ru", help="locale prefixes, multilingual voices always join")
    p.add_argument("--voice", help="only voices whose name holds one of these words, comma separated")
    p.add_argument("--group", default=",".join(GROUPS), help="female, male, child, comma separated")
    p.add_argument("--start", type=int, default=1, help="number to start from")
    p.add_argument("--count", type=int, help="how many voices to play")
    p.add_argument("--no-play", action="store_true", help="only fetch the clips and list the voices")
    p.add_argument("--refresh", action="store_true", help="fetch the voice list again and retry lines without audio")
    p.add_argument("--out", type=Path, default=default_out(), help="where the voice list and the clips are kept")
    p.add_argument("--tts", help="path to edge-tts")
    p.add_argument("--en", default=EN)
    p.add_argument("--ru", default=RU)
    p.add_argument("--mix", default=MIX)
    args = p.parse_args()

    tts = find_tts(args.tts)
    args.out.mkdir(parents=True, exist_ok=True)
    if args.refresh:
        for none in args.out.glob("*.none"):
            none.unlink()
    voices = pick(list_voices(tts, args.out, args.refresh), args)
    if not voices:
        sys.exit("No voice matches.")
    numbered = list(enumerate(voices, 1))[args.start - 1:]
    if args.count:
        numbered = numbered[:args.count]
    print(f"{len(voices)} voices, playing {len(numbered)} from number {args.start}. Clips in {args.out}", flush=True)

    group = None
    with ThreadPoolExecutor(max_workers=4) as pool:
        # The next voices are fetched while the current one plays.
        pending = {n: fetch_voice(pool, tts, v, n, args) for n, (v, _) in numbered[:AHEAD]}
        for i, (number, (voice, voice_group)) in enumerate(numbered):
            try:
                if heading(voice, voice_group) != group:
                    group = heading(voice, voice_group)
                    print(f"\n{group}", flush=True)
                labels, futures = pending.pop(number)
                clips = [f.result() for f in futures]
                if i + AHEAD < len(numbered):
                    n, (v, _) = numbered[i + AHEAD]
                    pending[n] = fetch_voice(pool, tts, v, n, args)
                missing = [label for label, clip in zip(labels, clips) if not clip]
                print(f"{number:>4}  {voice}" + (f"  (no {', '.join(missing)})" if missing else ""), flush=True)
                if args.no_play:
                    continue
                for clip in clips:
                    if clip:
                        play(clip)
                        time.sleep(CLIP_GAP)
                time.sleep(VOICE_GAP)
            except KeyboardInterrupt:
                print(f"\nStopped at {number}. Go on with --start {number}")
                pool.shutdown(wait=False, cancel_futures=True)
                return 130
    return 0


if __name__ == "__main__":
    sys.exit(main())
