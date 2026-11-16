using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

// Gets the clips of one phrase from edge-tts. Python takes seconds to import edge_tts,
// so turn-voice-fetch.py fetches every missing run in one process, side by side.
static partial class TurnVoice {
    class Clip {
        public string Text, Voice, Pitch, Rate, File;
        public Clip(string text, string voice, string pitch, string rate) {
            Text = text; Voice = voice; Pitch = pitch; Rate = rate;
            string dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "turn-voice");
            Directory.CreateDirectory(dir);
            Prune(dir);
            // A clip at the voice's own pitch and rate keeps the name it had before them.
            File = Path.Combine(dir, Hash(voice + "|" + (pitch == null ? "" : pitch + "|") + (rate == null ? "" : rate + "|") + text) + ".mp3");
        }
    }

    // True once each clip sits in the cache. A run the batch missed goes through the CLI.
    static bool FetchAll(List<Clip> clips, string tts) {
        string python = Path.GetFullPath(Path.Combine(Path.GetDirectoryName(tts), "..", "edge-tts", "Scripts", "python.exe"));
        string script = Path.Combine(Path.GetDirectoryName(Process.GetCurrentProcess().MainModule.FileName), "turn-voice-fetch.py");
        if (File.Exists(python) && File.Exists(script)) {
            string jobs = Path.GetTempFileName();
            var json = new StringBuilder("[");
            foreach (var c in clips)
                json.Append(json.Length > 1 ? "," : "").Append("{\"text\":").Append(Json(c.Text)).Append(",\"voice\":").Append(Json(c.Voice))
                    .Append(",\"pitch\":").Append(Json(c.Pitch ?? "+0Hz")).Append(",\"rate\":").Append(Json(c.Rate ?? "+0%"))
                    .Append(",\"out\":").Append(Json(c.File)).Append("}");
            File.WriteAllText(jobs, json.Append("]").ToString(), new UTF8Encoding(false));
            var watch = Stopwatch.StartNew();
            try {
                var p = Process.Start(new ProcessStartInfo(python, "-I \"" + script + "\" \"" + jobs + "\"") { UseShellExecute = false, CreateNoWindow = true });
                if (!p.WaitForExit(45000)) { try { p.Kill(); } catch { } Log("fetch timed out"); }
            } finally { try { File.Delete(jobs); } catch { } }
            Log("fetched " + clips.Count + " clips in " + watch.ElapsedMilliseconds + " ms");
        } else Log("no batch fetch at " + python);
        foreach (var c in clips) if (!File.Exists(c.File) && !FetchCli(c, tts)) return false;
        return true;
    }

    static string Json(string s) {
        var b = new StringBuilder("\"");
        foreach (char ch in s) {
            if (ch == '"' || ch == '\\') b.Append('\\').Append(ch);
            else if (ch < ' ') b.Append("\\u").Append(((int)ch).ToString("x4"));
            else b.Append(ch);
        }
        return b.Append('"').ToString();
    }

    // One edge-tts run per clip, for an edge-tts with no venv beside it.
    static bool FetchCli(Clip c, string tts) {
        string part = c.File + ".part";
        // Backslashes before the closing quote get doubled, or a title such as C:\temp\
        // escapes the quote and swallows --write-media.
        string quoted = Regex.Replace(c.Text.Replace("\"", ""), @"(\\+)$", "$1$1");
        var p = Process.Start(new ProcessStartInfo(tts,
            "--voice " + c.Voice + (c.Pitch == null ? "" : " --pitch=" + c.Pitch) + (c.Rate == null ? "" : " --rate=" + c.Rate) + " --text \"" + quoted + "\" --write-media \"" + part + "\"") {
            UseShellExecute = false, CreateNoWindow = true });
        if (!p.WaitForExit(30000)) { try { p.Kill(); } catch { } Log("edge-tts timed out"); return false; }
        if (p.ExitCode != 0 || !File.Exists(part) || new FileInfo(part).Length == 0) { Log("edge-tts exit " + p.ExitCode); return false; }
        File.Move(part, c.File);
        return true;
    }
}
