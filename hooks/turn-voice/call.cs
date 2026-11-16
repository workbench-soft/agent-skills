using System;
using Microsoft.Win32;

// A call holds the microphone, so the voice stays quiet while any app does.
static partial class TurnVoice {
    const string MicKey = @"Software\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\microphone";

    // TURN_VOICE_MEETING=1 or 0 forces the state, for the tests and for a call the check misses.
    static bool OnCall() {
        string force = Environment.GetEnvironmentVariable("TURN_VOICE_MEETING");
        if (force == "1" || force == "0") return force == "1";
        try {
            using (var root = Registry.CurrentUser.OpenSubKey(MicKey)) return root != null && MicBusy(root);
        } catch (Exception e) { Log("mic check " + e.Message); return false; }
    }

    // Windows writes LastUsedTimeStart when an app opens the microphone and LastUsedTimeStop
    // when it lets go, so a start with a stop of 0 is in use now. Desktop apps such as
    // Chrome and Zoom sit under NonPackaged, Store apps right under the key.
    static bool MicBusy(RegistryKey key) {
        foreach (string name in key.GetSubKeyNames())
            using (var app = key.OpenSubKey(name)) {
                if (app == null) continue;
                if (name == "NonPackaged") { if (MicBusy(app)) { return true; } continue; }
                object start = app.GetValue("LastUsedTimeStart"), stop = app.GetValue("LastUsedTimeStop");
                if (start is long && (long)start != 0 && stop is long && (long)stop == 0) { Log("mic held by " + name); return true; }
            }
        return false;
    }
}
