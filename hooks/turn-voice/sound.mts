// The mp3 trim and the cue tones of sound.cs and turn-voice.cs, for the Mac hook.
import type { Outcome } from "./voice.mts";

// Speech frames of the Microsoft voices carry a gain of 150 to 185, their silence about 130.
const speechGain = 145;
const rates1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const rates2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];

// A Layer III frame: its size from the header, and the global gain of its first granule.
export function frame(b: Uint8Array, i: number): { size: number; gain: number } {
  const none = { size: 0, gain: 0 };
  if (b[i] !== 0xff || (b[i + 1] & 0xe0) !== 0xe0 || ((b[i + 1] >> 1) & 3) !== 1) return none;
  const version = (b[i + 1] >> 3) & 3;
  const bitrateIndex = b[i + 2] >> 4;
  const rateIndex = (b[i + 2] >> 2) & 3;
  if (version === 1 || bitrateIndex === 0 || bitrateIndex === 15 || rateIndex === 3) return none;
  const mpeg1 = version === 3;
  const mono = b[i + 3] >> 6 === 3;
  const rate = [44100, 48000, 32000][rateIndex] >> (mpeg1 ? 0 : version === 2 ? 1 : 2);
  const bitrate = (mpeg1 ? rates1 : rates2)[bitrateIndex] * 1000;
  // Side info: main_data_begin, private bits, scfsi, then part2_3_length 12 and big_values 9.
  const bit =
    (i + 4 + ((b[i + 1] & 1) === 0 ? 2 : 0)) * 8 + (mpeg1 ? (mono ? 18 : 20) : mono ? 9 : 10) + 21;
  const at = bit >> 3;
  const gain = at + 1 < b.length ? (((b[at] << 8) | b[at + 1]) >> (8 - (bit % 8))) & 0xff : 0;
  return {
    size: Math.floor((((mpeg1 ? 1152 : 576) / 8) * bitrate) / rate) + ((b[i + 2] >> 1) & 1),
    gain,
  };
}

// Cuts the quiet frames at the ends of a clip, keeping 2 frames before the speech and 3 after.
// mp3 frames stand alone, so the kept frames of each clip play back to back as one file.
export function trim(mp3: Uint8Array, cutStart: boolean, cutEnd: boolean): Uint8Array {
  const starts: number[] = [];
  const sizes: number[] = [];
  let first = -1;
  let last = -1;
  for (let pos = 0; pos + 8 <= mp3.length;) {
    const { size, gain } = frame(mp3, pos);
    if (size <= 0 || pos + size > mp3.length) return mp3;
    if (gain >= speechGain && gain < 210) {
      if (first < 0) first = starts.length;
      last = starts.length;
    }
    starts.push(pos);
    sizes.push(size);
    pos += size;
  }
  if (first < 0) return mp3;
  const from = cutStart ? Math.max(0, first - 2) : 0;
  const to = cutEnd ? Math.min(starts.length - 1, last + 3) : starts.length - 1;
  return mp3.subarray(starts[from], starts[to] + sizes[to]);
}

// Each outcome has a cue the ear tells apart before the voice starts. Done plays a system sound.
const cues: Partial<Record<Outcome, [number[], number[], boolean]>> = {
  // A sad trombone: four falling notes.
  notDone: [[392, 370, 349.2, 329.6], [0.3, 0.3, 0.3, 0.6], true],
  error: [[392, 370, 349.2, 329.6], [0.3, 0.3, 0.3, 0.6], true],
  // Two notes going up, like a question.
  ask: [[659.3, 987.8], [0.16, 0.38], false],
  // A doorbell: two notes going down, the person's turn.
  userSteps: [[659.3, 523.3], [0.3, 0.5], false],
};

// A mono 16-bit WAV of the outcome's tones. Brass adds overtones and holds each note.
export function cueWav(outcome: Outcome, rate = 24000): Buffer {
  const [freqs, secs, brass] = cues[outcome] ?? [[880], [0.12], false];
  const samples: number[] = [];
  freqs.forEach((freq, n) => {
    for (let i = 0; i < Math.floor(secs[n] * rate); i++) {
      const t = i / rate;
      const phase = 2 * Math.PI * freq * t;
      const v = brass
        ? 0.6 * Math.sin(phase) + 0.25 * Math.sin(2 * phase) + 0.12 * Math.sin(3 * phase)
        : Math.sin(phase) * Math.exp((-3.5 * t) / secs[n]);
      const envelope = Math.min(1, t / 0.015) * Math.min(1, (secs[n] - t) / 0.04);
      samples.push(Math.round(v * envelope * 0.5 * 32767));
    }
  });
  const wav = Buffer.alloc(44 + samples.length * 2);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(36 + samples.length * 2, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(rate, 24);
  wav.writeUInt32LE(rate * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((s, i) => wav.writeInt16LE(s, 44 + i * 2));
  return wav;
}
