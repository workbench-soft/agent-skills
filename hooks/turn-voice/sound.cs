using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;

// The cue and the voice play as one PCM stream. Played as two, the sound device stopped
// between them and its next start lost about a second, so "Агент" came out as "т".
static partial class TurnVoice {
    [DllImport("msacm32.dll")] static extern int acmStreamOpen(out IntPtr s, IntPtr drv, byte[] src, byte[] dst, IntPtr filter, IntPtr cb, IntPtr inst, uint flags);
    [DllImport("msacm32.dll")] static extern int acmStreamSize(IntPtr s, uint input, out uint output, uint flags);
    [DllImport("msacm32.dll")] static extern int acmStreamPrepareHeader(IntPtr s, ref AcmHeader h, uint flags);
    [DllImport("msacm32.dll")] static extern int acmStreamConvert(IntPtr s, ref AcmHeader h, uint flags);
    [DllImport("msacm32.dll")] static extern int acmStreamUnprepareHeader(IntPtr s, ref AcmHeader h, uint flags);
    [DllImport("msacm32.dll")] static extern int acmStreamClose(IntPtr s, uint flags);

    // ACMSTREAMHEADER as the 64-bit msacm32 lays it out, with 15 reserved words.
    [StructLayout(LayoutKind.Sequential)]
    struct AcmHeader {
        public uint cbStruct, fdwStatus; public IntPtr dwUser;
        public IntPtr pbSrc; public uint cbSrcLength, cbSrcLengthUsed; public IntPtr dwSrcUser;
        public IntPtr pbDst; public uint cbDstLength, cbDstLengthUsed; public IntPtr dwDstUser;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 15)] public uint[] reserved;
    }

    // A short pause between the cue and the voice, too short for the device to stop.
    const double CueGap = 0.15;

    // Plays the cue, then the clip in the same stream. A clip Windows can't decode plays after the cue as before.
    static void PlayTurn(Outcome o, string clip) {
        int rate = 0;
        short[] voice = clip == null ? null : Decode(File.ReadAllBytes(clip), out rate);
        if (voice == null) rate = 24000;
        var all = new List<short>(Cue(o, rate));
        if (voice != null) { all.AddRange(new short[(int)(CueGap * rate)]); all.AddRange(voice); }
        PlayMemory(Wav(all, rate), IntPtr.Zero, SND_SYNC_MEMORY);
        if (voice == null && clip != null) { Log("acm decode failed, mci plays " + clip); PlayMp3(clip); }
    }

    // Each outcome has a cue the ear tells apart before the voice starts.
    static short[] Cue(Outcome o, int rate) {
        switch (o) {
            case Outcome.Done: case Outcome.Archived: return Resample(File.ReadAllBytes(Tada), rate);
            // A sad trombone: four falling notes.
            case Outcome.NotDone: case Outcome.Error:
                return Tones(new[] { 392.0, 370.0, 349.2, 329.6 }, new[] { 0.3, 0.3, 0.3, 0.6 }, true, rate);
            // Two notes going up, like a question.
            case Outcome.Ask: return Tones(new[] { 659.3, 987.8 }, new[] { 0.16, 0.38 }, false, rate);
            // A doorbell: two notes going down, the person's turn.
            case Outcome.UserSteps: return Tones(new[] { 659.3, 523.3 }, new[] { 0.3, 0.5 }, false, rate);
            default: return Tones(new[] { 880.0 }, new[] { 0.12 }, false, rate);
        }
    }

    // Brass adds overtones and holds each note.
    static short[] Tones(double[] freqs, double[] secs, bool brass, int rate) {
        var samples = new List<short>();
        for (int n = 0; n < freqs.Length; n++) {
            int count = (int)(secs[n] * rate);
            for (int i = 0; i < count; i++) {
                double t = (double)i / rate;
                double phase = 2 * Math.PI * freqs[n] * t;
                double v = brass
                    ? 0.6 * Math.Sin(phase) + 0.25 * Math.Sin(2 * phase) + 0.12 * Math.Sin(3 * phase)
                    : Math.Sin(phase) * Math.Exp(-3.5 * t / secs[n]);
                double attack = Math.Min(1, t / 0.015), release = Math.Min(1, (secs[n] - t) / 0.04);
                samples.Add((short)(v * attack * release * 0.5 * short.MaxValue));
            }
        }
        return samples.ToArray();
    }

    // A 16-bit PCM WAV such as tada.wav, mixed to mono and moved to the voice's rate.
    static short[] Resample(byte[] wav, int rate) {
        int pos = 12, channels = 1, from = rate;
        while (pos + 8 <= wav.Length) {
            string id = Encoding.ASCII.GetString(wav, pos, 4);
            int size = BitConverter.ToInt32(wav, pos + 4);
            if (id == "fmt ") { channels = BitConverter.ToInt16(wav, pos + 10); from = BitConverter.ToInt32(wav, pos + 12); }
            if (id == "data") {
                int frames = Math.Min(size, wav.Length - pos - 8) / (2 * channels);
                var outp = new short[(long)frames * rate / from];
                for (int i = 0; i < outp.Length; i++) {
                    int src = (int)((long)i * from / rate), sum = 0;
                    for (int c = 0; c < channels; c++) sum += BitConverter.ToInt16(wav, pos + 8 + (src * channels + c) * 2);
                    outp[i] = (short)(sum / channels);
                }
                return outp;
            }
            pos += 8 + size + (size & 1);
        }
        return new short[0];
    }

    // Decodes the edge-tts mp3 to mono 16-bit PCM with the MP3 codec Windows ships for ACM.
    static short[] Decode(byte[] mp3, out int rate) {
        rate = 0;
        int gain, size = mp3.Length >= 8 ? FrameSize(mp3, 0, out gain) : 0;
        if (size <= 0 || IntPtr.Size != 8) return null;
        int version = (mp3[1] >> 3) & 3, channels = (mp3[3] >> 6) == 3 ? 1 : 2;
        rate = new[] { 44100, 48000, 32000 }[(mp3[2] >> 2) & 3] >> (version == 3 ? 0 : version == 2 ? 1 : 2);
        int kbps = (version == 3 ? new[] { 0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320 }
            : new[] { 0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160 })[mp3[2] >> 4];
        // MPEGLAYER3WAVEFORMAT, then the PCM WAVEFORMATEX it decodes to.
        var src = new MemoryStream(); var w = new BinaryWriter(src);
        w.Write((short)0x55); w.Write((short)channels); w.Write(rate); w.Write(kbps * 125); w.Write((short)1); w.Write((short)0);
        w.Write((short)12); w.Write((short)1); w.Write(2); w.Write((short)size); w.Write((short)1); w.Write((short)1393);
        var dst = new MemoryStream(); w = new BinaryWriter(dst);
        w.Write((short)1); w.Write((short)channels); w.Write(rate); w.Write(rate * channels * 2); w.Write((short)(channels * 2)); w.Write((short)16); w.Write((short)0);
        IntPtr s;
        if (acmStreamOpen(out s, IntPtr.Zero, src.ToArray(), dst.ToArray(), IntPtr.Zero, IntPtr.Zero, IntPtr.Zero, 0) != 0) return null;
        try {
            uint outLen;
            if (acmStreamSize(s, (uint)mp3.Length, out outLen, 0) != 0) return null;
            var pcm = new byte[outLen];
            GCHandle hs = GCHandle.Alloc(mp3, GCHandleType.Pinned), hd = GCHandle.Alloc(pcm, GCHandleType.Pinned);
            try {
                var h = new AcmHeader { reserved = new uint[15], pbSrc = hs.AddrOfPinnedObject(), cbSrcLength = (uint)mp3.Length,
                    pbDst = hd.AddrOfPinnedObject(), cbDstLength = outLen };
                h.cbStruct = (uint)Marshal.SizeOf(h);
                if (acmStreamPrepareHeader(s, ref h, 0) != 0) return null;
                // ACM_STREAMCONVERTF_START | ACM_STREAMCONVERTF_END: the whole clip in one call.
                int err = acmStreamConvert(s, ref h, 0x10 | 0x20);
                acmStreamUnprepareHeader(s, ref h, 0);
                if (err != 0 || h.cbDstLengthUsed == 0) return null;
                var mono = new short[h.cbDstLengthUsed / (2 * channels)];
                for (int i = 0; i < mono.Length; i++) {
                    int sum = 0;
                    for (int c = 0; c < channels; c++) sum += BitConverter.ToInt16(pcm, (i * channels + c) * 2);
                    mono[i] = (short)(sum / channels);
                }
                return mono;
            } finally { hs.Free(); hd.Free(); }
        } finally { acmStreamClose(s, 0); }
    }

    static byte[] Wav(List<short> samples, int rate) {
        var wav = new MemoryStream();
        var w = new BinaryWriter(wav);
        w.Write(Encoding.ASCII.GetBytes("RIFF")); w.Write(36 + samples.Count * 2);
        w.Write(Encoding.ASCII.GetBytes("WAVEfmt ")); w.Write(16); w.Write((short)1); w.Write((short)1);
        w.Write(rate); w.Write(rate * 2); w.Write((short)2); w.Write((short)16);
        w.Write(Encoding.ASCII.GetBytes("data")); w.Write(samples.Count * 2);
        foreach (var s in samples) w.Write(s);
        return wav.ToArray();
    }
}
