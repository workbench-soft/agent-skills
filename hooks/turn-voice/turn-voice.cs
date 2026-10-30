using System;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;

// Claude Code hook: plays a sound and says how the turn ended.
//   turn-voice.exe <mode> <lang> [<Russian voice> <English voice> <edge-tts.exe>]
//   stop     Stop: done, not done or running, by the end-of-turn marker
//   fail     StopFailure: the turn died on an API error
//   ask      a question or a permission prompt waits for the person
//   archive  the agent is about to archive its session
// <lang> is ru or en. The hook JSON comes on stdin. With edge-tts each Russian
// and each English run of the phrase gets a native neural voice, cached per run.
// Without edge-tts, or offline, only the cue plays.
static class TurnVoice {
    const string Tada = @"C:\Windows\Media\tada.wav";

    enum Outcome { Done, NotDone, Running, Error, Ask, Replied, Archived }

    [DllImport("winmm.dll", CharSet = CharSet.Unicode)]
    static extern bool PlaySound(string sound, IntPtr mod, uint flags);
    [DllImport("winmm.dll", EntryPoint = "PlaySoundW")]
    static extern bool PlayMemory(byte[] sound, IntPtr mod, uint flags);
    [DllImport("winmm.dll", CharSet = CharSet.Unicode)]
    static extern int mciSendString(string command, StringBuilder ret, int length, IntPtr callback);

    const uint SND_SYNC_FILE = 0x00020000 | 0x0002; // SND_FILENAME | SND_NODEFAULT
    const uint SND_SYNC_MEMORY = 0x0004 | 0x0002;   // SND_MEMORY | SND_NODEFAULT

    // The MCI mp3 player opens only on an STA thread.
    [STAThread]
    static void Main(string[] args) {
        string mode = args.Length > 0 ? args[0] : "stop";
        bool ru = args.Length > 1 && args[1] == "ru";
        string ruVoice = args.Length > 2 ? args[2] : null;
        string enVoice = args.Length > 3 ? args[3] : null;
        string tts = args.Length > 4 ? args[4] : null;
        string input = ReadStdin();
        // Twins of one event can differ in stdin, so the session and the mode name the event.
        string session = Field(input, "session_id") ?? input;
        if (SeenRecently(mode + "|" + session)) { Log("skip repeat " + mode); return; }
        // An archive already said the task is done, so the Stop after it stays quiet.
        if (mode == "stop" && Recent(MarkerPath("archive|" + session), 120)) { Log("skip stop after archive"); return; }
        Log("run " + mode + " " + Hash(input));
        Outcome outcome =
            mode == "fail" ? Outcome.Error :
            mode == "ask" ? Outcome.Ask :
            mode == "archive" ? Outcome.Archived :
            FromMarker(input);
        string lead = Lead(outcome, ru, AgentName(input));
        string task = TaskTitle(input);
        // Sessions that end together speak one after another, not over each other.
        using (var turn = new Mutex(false, @"Local\turn-voice")) {
            bool owned = false;
            try { owned = turn.WaitOne(90000); } catch (AbandonedMutexException) { owned = true; }
            try {
                PlayCue(outcome);
                SayNeural(string.IsNullOrEmpty(task) ? lead : lead + ": " + task, ruVoice, enVoice, tts);
            } finally { if (owned) turn.ReleaseMutex(); }
        }
    }

    static string MarkerPath(string key) {
        return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "turn-voice", "runs", Hash(key));
    }

    static bool Recent(string marker, int seconds) {
        return File.Exists(marker) && File.GetLastWriteTimeUtc(marker) > DateTime.UtcNow.AddSeconds(-seconds);
    }

    // The desktop app can run one hook twice for one event. The first run
    // claims a marker file, and a twin within 30 seconds stays quiet.
    static bool SeenRecently(string key) {
        try {
            string marker = MarkerPath(key);
            string dir = Path.GetDirectoryName(marker);
            Directory.CreateDirectory(dir);
            foreach (var old in Directory.GetFiles(dir))
                if (File.GetLastWriteTimeUtc(old) < DateTime.UtcNow.AddMinutes(-5)) try { File.Delete(old); } catch { }
            if (Recent(marker, 30)) return true;
            try { using (new FileStream(marker, FileMode.CreateNew)) { } }
            catch (IOException) { if (File.GetLastWriteTimeUtc(marker) > DateTime.UtcNow.AddSeconds(-30)) return true; File.SetLastWriteTimeUtc(marker, DateTime.UtcNow); }
            return false;
        } catch { return false; }
    }

    // Each outcome has a cue the ear tells apart before the voice starts.
    static void PlayCue(Outcome o) {
        switch (o) {
            case Outcome.Done: case Outcome.Archived: PlaySound(Tada, IntPtr.Zero, SND_SYNC_FILE); break;
            // A sad trombone: four falling notes.
            case Outcome.NotDone: case Outcome.Error:
                PlayTones(new[] { 392.0, 370.0, 349.2, 329.6 }, new[] { 0.3, 0.3, 0.3, 0.6 }, true); break;
            // Two notes going up, like a question.
            case Outcome.Ask: PlayTones(new[] { 659.3, 987.8 }, new[] { 0.16, 0.38 }, false); break;
            default: PlayTones(new[] { 880.0 }, new[] { 0.12 }, false); break;
        }
    }

    // Builds a 16-bit mono WAV in memory. Brass adds overtones and holds each note.
    static void PlayTones(double[] freqs, double[] secs, bool brass) {
        const int rate = 22050;
        var samples = new System.Collections.Generic.List<short>();
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
        var wav = new MemoryStream();
        var w = new BinaryWriter(wav);
        w.Write(Encoding.ASCII.GetBytes("RIFF")); w.Write(36 + samples.Count * 2);
        w.Write(Encoding.ASCII.GetBytes("WAVEfmt ")); w.Write(16); w.Write((short)1); w.Write((short)1);
        w.Write(rate); w.Write(rate * 2); w.Write((short)2); w.Write((short)16);
        w.Write(Encoding.ASCII.GetBytes("data")); w.Write(samples.Count * 2);
        foreach (var s in samples) w.Write(s);
        PlayMemory(wav.ToArray(), IntPtr.Zero, SND_SYNC_MEMORY);
    }

    // The part before the task title, in the language picked at install.
    static string Lead(Outcome o, bool ru, string agent) {
        string a = (ru ? "Агент " : "Agent ") + agent + " ";
        switch (o) {
            case Outcome.Done: return a + (ru ? "сделал задачу" : "finished the task");
            case Outcome.NotDone: return a + (ru ? "не закончил задачу" : "did not finish the task");
            case Outcome.Running: return a + (ru ? "работает в фоне над задачей" : "is working in the background on");
            case Outcome.Error: return a + (ru ? "упал с ошибкой на задаче" : "stopped on an error in");
            // A turn without a marker, such as a short answer.
            case Outcome.Replied: return a + (ru ? "ответил по задаче" : "replied on");
            case Outcome.Archived: return a + (ru ? "сделал задачу и заархивировал сессию" : "finished and archived the task");
            default: return a + (ru ? "ждёт ответа по задаче" : "is waiting for your answer on");
        }
    }

    // Claude Code writes the session title into the transcript as customTitle, again on each rename.
    static string TaskTitle(string input) {
        string path = Field(input, "transcript_path");
        if (string.IsNullOrEmpty(path)) return null;
        try {
            string text;
            using (var f = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
            using (var r = new StreamReader(f, Encoding.UTF8)) text = r.ReadToEnd();
            var all = Regex.Matches(text, "\"customTitle\"\\s*:\\s*\"((?:[^\"\\\\]|\\\\.)*)\"");
            if (all.Count == 0) return null;
            return Regex.Unescape(all[all.Count - 1].Groups[1].Value).Replace("\"", "").Trim();
        } catch { return null; }
    }

    // ruVoice reads the Cyrillic runs and enVoice the Latin ones, each run fetched apart.
    // The runs go into one mp3 with their silence cut, so no pause opens between voices.
    static bool SayNeural(string text, string ruVoice, string enVoice, string tts) {
        if (string.IsNullOrEmpty(ruVoice) || string.IsNullOrEmpty(enVoice) || string.IsNullOrEmpty(tts) || !File.Exists(tts)) {
            Log("no edge-tts at " + tts); return false;
        }
        try {
            var runs = Runs(text);
            if (runs.Count == 0) return false;
            var files = new System.Collections.Generic.List<string>();
            foreach (var run in runs) {
                string file = Fetch(run, Regex.IsMatch(run, @"\p{IsCyrillic}") ? ruVoice : enVoice, tts);
                if (file == null) return false;
                files.Add(file);
            }
            string joined = Path.Combine(Path.GetDirectoryName(files[0]), Hash("lead-in|" + string.Join("|", files)) + "-joined.mp3");
            if (File.Exists(joined)) Touch(joined);
            else {
                var all = new MemoryStream();
                byte[] lead = LeadIn(File.ReadAllBytes(files[0]));
                all.Write(lead, 0, lead.Length);
                for (int i = 0; i < files.Count; i++) {
                    byte[] clip = Trim(File.ReadAllBytes(files[i]), i > 0, i < files.Count - 1);
                    all.Write(clip, 0, clip.Length);
                }
                File.WriteAllBytes(joined, all.ToArray());
            }
            return PlayMp3(joined);
        } catch (Exception e) { Log(e.ToString()); return false; }
    }

    // A sound device that slept while the clip downloaded wakes up on the first frames and drops them,
    // so "Агент" came out as "...ент". The first frame of a clip is silent and stands alone, so 16 of
    // them give 0.4 seconds of silence for the device to wake on.
    static byte[] LeadIn(byte[] mp3) {
        int gain;
        int size = mp3.Length >= 8 ? FrameSize(mp3, 0, out gain) : 0;
        if (size <= 0 || size > mp3.Length || mp3[4 + ((mp3[1] & 1) == 0 ? 2 : 0)] != 0) return new byte[0];
        var lead = new byte[size * 16];
        for (int i = 0; i < 16; i++) Buffer.BlockCopy(mp3, 0, lead, i * size, size);
        return lead;
    }

    // A run starts at a Cyrillic or a Latin letter. Digits and signs stay with the run before them.
    static System.Collections.Generic.List<string> Runs(string text) {
        var runs = new System.Collections.Generic.List<string>();
        string head = "";
        foreach (Match m in Regex.Matches(text, @"\p{IsCyrillic}[^A-Za-z]*|[A-Za-z][^\p{IsCyrillic}]*|[^A-Za-z\p{IsCyrillic}]+")) {
            if (!Regex.IsMatch(m.Value, @"[A-Za-z\p{IsCyrillic}]")) { head += m.Value; continue; }
            string run = (head + m.Value).Trim();
            head = "";
            if (run.Length > 0) runs.Add(run);
        }
        return runs;
    }

    // Speech frames of the Microsoft voices carry a gain of 150 to 185, their silence about 130.
    const int SpeechGain = 145;

    // Cuts the quiet frames at the ends of a clip, keeping 2 frames before the speech and 3 after.
    // mp3 frames stand alone, so the kept frames of each clip play back to back as one file.
    static byte[] Trim(byte[] mp3, bool cutStart, bool cutEnd) {
        var starts = new System.Collections.Generic.List<int>();
        var sizes = new System.Collections.Generic.List<int>();
        int first = -1, last = -1;
        for (int pos = 0; pos + 8 <= mp3.Length; ) {
            int gain;
            int size = FrameSize(mp3, pos, out gain);
            if (size <= 0 || pos + size > mp3.Length) return mp3;
            if (gain >= SpeechGain && gain < 210) { if (first < 0) first = starts.Count; last = starts.Count; }
            starts.Add(pos); sizes.Add(size);
            pos += size;
        }
        if (first < 0) return mp3;
        int from = cutStart ? Math.Max(0, first - 2) : 0;
        int to = cutEnd ? Math.Min(starts.Count - 1, last + 3) : starts.Count - 1;
        int end = starts[to] + sizes[to];
        var kept = new byte[end - starts[from]];
        Buffer.BlockCopy(mp3, starts[from], kept, 0, kept.Length);
        return kept;
    }

    // A Layer III frame: its size from the header, and the global gain of its first granule.
    static int FrameSize(byte[] b, int i, out int gain) {
        gain = 0;
        if (b[i] != 0xFF || (b[i + 1] & 0xE0) != 0xE0 || ((b[i + 1] >> 1) & 3) != 1) return 0;
        int version = (b[i + 1] >> 3) & 3, bitrateIndex = b[i + 2] >> 4, rateIndex = (b[i + 2] >> 2) & 3;
        if (version == 1 || bitrateIndex == 0 || bitrateIndex == 15 || rateIndex == 3) return 0;
        bool mpeg1 = version == 3, mono = (b[i + 3] >> 6) == 3;
        int[] rates1 = { 0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320 };
        int[] rates2 = { 0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160 };
        int rate = new[] { 44100, 48000, 32000 }[rateIndex] >> (mpeg1 ? 0 : version == 2 ? 1 : 2);
        int samples = mpeg1 ? 1152 : 576;
        int bitrate = (mpeg1 ? rates1 : rates2)[bitrateIndex] * 1000;
        // Side info: main_data_begin, private bits, scfsi, then part2_3_length 12 and big_values 9.
        int bit = (i + 4 + ((b[i + 1] & 1) == 0 ? 2 : 0)) * 8 + (mpeg1 ? (mono ? 18 : 20) : (mono ? 9 : 10)) + 21;
        if (bit / 8 + 1 < b.Length) gain = ((b[bit / 8] << 8 | b[bit / 8 + 1]) >> (8 - bit % 8)) & 0xFF;
        return samples / 8 * bitrate / rate + ((b[i + 2] >> 1) & 1);
    }

    // Each run is fetched once, then played from %LOCALAPPDATA%\turn-voice.
    static string Fetch(string text, string voice, string tts) {
        string dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "turn-voice");
        Directory.CreateDirectory(dir);
        Prune(dir);
        string file = Path.Combine(dir, Hash(voice + "|" + text) + ".mp3");
        if (File.Exists(file)) { Touch(file); return file; }
        string part = file + ".part";
        var p = Process.Start(new ProcessStartInfo(tts,
            "--voice " + voice + " --text \"" + text.Replace("\"", "") + "\" --write-media \"" + part + "\"") {
            UseShellExecute = false, CreateNoWindow = true });
        if (!p.WaitForExit(30000)) { try { p.Kill(); } catch { } Log("edge-tts timed out"); return null; }
        if (p.ExitCode != 0 || !File.Exists(part) || new FileInfo(part).Length == 0) { Log("edge-tts exit " + p.ExitCode); return null; }
        File.Move(part, file);
        return file;
    }

    // Each session title adds clips, so a clip unplayed for 30 days goes, with any .part a killed fetch left.
    static void Prune(string dir) {
        foreach (var old in Directory.GetFiles(dir))
            if (File.GetLastWriteTimeUtc(old) < DateTime.UtcNow.AddDays(-30)) try { File.Delete(old); } catch { }
    }

    // A clip in use stays younger than the prune age.
    static void Touch(string file) {
        try { File.SetLastWriteTimeUtc(file, DateTime.UtcNow); } catch { }
    }

    static bool PlayMp3(string file) {
        string alias = "tv" + Process.GetCurrentProcess().Id;
        int err = mciSendString("open \"" + file + "\" type mpegvideo alias " + alias, null, 0, IntPtr.Zero);
        if (err != 0) { Log("mci open " + err + " " + file); return false; }
        mciSendString("play " + alias + " wait", null, 0, IntPtr.Zero);
        mciSendString("close " + alias, null, 0, IntPtr.Zero);
        return true;
    }

    // Set TURN_VOICE_LOG to a file path to see why the neural voice stayed quiet.
    static void Log(string line) {
        string path = Environment.GetEnvironmentVariable("TURN_VOICE_LOG");
        if (string.IsNullOrEmpty(path)) return;
        try { File.AppendAllText(path, DateTime.Now.ToString("s") + " " + line + Environment.NewLine); } catch { }
    }

    static string Hash(string s) {
        using (var sha = SHA1.Create())
            return BitConverter.ToString(sha.ComputeHash(Encoding.UTF8.GetBytes(s))).Replace("-", "").Substring(0, 16);
    }

    static string ReadStdin() {
        try {
            using (var r = new StreamReader(Console.OpenStandardInput(), Encoding.UTF8)) return r.ReadToEnd();
        } catch { return ""; }
    }

    static string Field(string input, string name) {
        var m = Regex.Match(input, "\"" + name + "\"\\s*:\\s*\"((?:[^\"\\\\]|\\\\.)*)\"");
        if (!m.Success) return null;
        try { return Regex.Unescape(m.Groups[1].Value); } catch { return m.Groups[1].Value; }
    }

    // The project folder names the agent. Dashes would be read out, so they become spaces.
    static string AgentName(string input) {
        string cwd = Field(input, "cwd") ?? "";
        string name = Path.GetFileName(cwd.TrimEnd('\\', '/'));
        return name.Length > 0 ? Regex.Replace(name, "[-_.]+", " ") : "Claude";
    }

    // The last marker in the final message wins, so a marker quoted earlier doesn't count.
    static Outcome FromMarker(string input) {
        string text = Field(input, "last_assistant_message") ?? TranscriptTail(Field(input, "transcript_path"));
        int notDone = text.LastIndexOf("NOT COMPLETED!!!");
        int done = text.LastIndexOf("!!!COMPLETED!!!");
        int running = text.LastIndexOf("!!!RUNNING!!!");
        int question = text.LastIndexOf("!!!QUESTION!!!");
        int last = Math.Max(Math.Max(notDone, question), Math.Max(done, running));
        if (last < 0) return Outcome.Replied;
        if (last == running) return Outcome.Running;
        if (last == question) return Outcome.Ask;
        return last == notDone ? Outcome.NotDone : Outcome.Done;
    }

    // Older hosts send only the transcript path, so read its last assistant entry.
    static string TranscriptTail(string path) {
        if (string.IsNullOrEmpty(path)) return "";
        try {
            using (var f = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite)) {
                long start = Math.Max(0, f.Length - 65536);
                f.Seek(start, SeekOrigin.Begin);
                var buf = new byte[f.Length - start];
                f.Read(buf, 0, buf.Length);
                string tail = Encoding.UTF8.GetString(buf);
                int i = tail.LastIndexOf("\"type\":\"assistant\"");
                return i >= 0 ? tail.Substring(i) : tail;
            }
        } catch { return ""; }
    }
}
