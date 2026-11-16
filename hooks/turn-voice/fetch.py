"""Fetch every clip of one turn-voice phrase in one process.

Importing edge_tts takes seconds, so the hook runs this once per phrase, with
the venv Python of edge-tts: python fetch.py <jobs.json>. The file holds a
list of {text, voice, pitch, rate, out}. Each clip lands at out, and a failed
one leaves no file, so the hook fetches it again through the CLI.
"""

import asyncio
import json
import os
import sys

import edge_tts


async def fetch(job: dict) -> None:
    part = job["out"] + ".part"
    try:
        talk = edge_tts.Communicate(job["text"], job["voice"], rate=job["rate"], pitch=job["pitch"])
        await talk.save(part)
        os.replace(part, job["out"])
    except Exception as error:  # noqa: BLE001 - one bad clip leaves the others
        print(f"{job['text']}: {error}", file=sys.stderr)


async def main(jobs: list[dict]) -> None:
    await asyncio.gather(*(fetch(job) for job in jobs))


if __name__ == "__main__":
    with open(sys.argv[1], encoding="utf-8") as f:
        asyncio.run(main(json.load(f)))
