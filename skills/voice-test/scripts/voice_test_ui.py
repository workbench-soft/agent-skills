#!/usr/bin/env python3
"""A small window over voice_test.py: pick the line, the groups and the voices, then play.

Usage: voice_test_ui.py, or a double click on voice-test.cmd on Windows.
Standard library only.
"""

import os
import subprocess
import sys
import threading
import tkinter as tk
from pathlib import Path
from tkinter import ttk
from tkinter.scrolledtext import ScrolledText

SCRIPT = Path(__file__).with_name("voice_test.py")
LINES = (("All 4", ""), ("English", "en"), ("Russian", "ru"), ("Mixed", "mix"), ("Chunks", "chunks"))
GROUPS = (("Women", "female"), ("Men", "male"), ("Children", "child"))


class App:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.proc: subprocess.Popen | None = None
        root.title("Voice test")
        frame = ttk.Frame(root, padding=10)
        frame.pack(fill="both", expand=True)

        self.line = tk.StringVar(value="chunks")
        row = ttk.LabelFrame(frame, text="Line", padding=6)
        row.pack(fill="x")
        for text, value in LINES:
            ttk.Radiobutton(row, text=text, value=value, variable=self.line).pack(side="left", padx=4)

        self.groups = {value: tk.BooleanVar(value=True) for _, value in GROUPS}
        row = ttk.LabelFrame(frame, text="Who", padding=6)
        row.pack(fill="x", pady=6)
        for text, value in GROUPS:
            ttk.Checkbutton(row, text=text, variable=self.groups[value]).pack(side="left", padx=4)

        form = ttk.Frame(frame)
        form.pack(fill="x")
        self.voice = tk.StringVar()
        self.lang = tk.StringVar(value="en,ru")
        self.start = tk.StringVar(value="1")
        for col, (label, var, width) in enumerate((("Names", self.voice, 24), ("Locales", self.lang, 10), ("From", self.start, 5))):
            ttk.Label(form, text=label).grid(row=0, column=col * 2, padx=(0 if col == 0 else 10, 4))
            ttk.Entry(form, textvariable=var, width=width).grid(row=0, column=col * 2 + 1)
        ttk.Label(frame, text="Names: words such as Ava,Emma. Locales: en,ru,de. Empty names play the locales.",
                  foreground="gray").pack(anchor="w", pady=(2, 6))

        buttons = ttk.Frame(frame)
        buttons.pack(fill="x")
        self.play_button = ttk.Button(buttons, text="Play", command=self.play)
        self.play_button.pack(side="left")
        self.stop_button = ttk.Button(buttons, text="Stop", command=self.stop, state="disabled")
        self.stop_button.pack(side="left", padx=6)

        self.log = ScrolledText(frame, width=70, height=18, font=("Consolas", 10))
        self.log.pack(fill="both", expand=True, pady=(8, 0))
        root.protocol("WM_DELETE_WINDOW", self.close)

    def args(self) -> list[str] | None:
        groups = [g for g, var in self.groups.items() if var.get()]
        if not groups:
            self.write("Pick at least one of women, men and children.\n")
            return None
        args = [sys.executable, str(SCRIPT), "--group", ",".join(groups), "--start", self.start.get().strip() or "1"]
        if self.line.get():
            args += ["--line", self.line.get()]
        if self.voice.get().strip():
            args += ["--voice", self.voice.get().strip()]
        elif self.lang.get().strip():
            args += ["--lang", self.lang.get().strip()]
        return args

    def play(self) -> None:
        args = self.args()
        if not args:
            return
        self.log.delete("1.0", "end")
        self.write(" ".join(args[2:]) + "\n")
        flags = subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0
        self.proc = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL,
                                     text=True, encoding="utf-8", errors="replace", creationflags=flags,
                                     env={**os.environ, "PYTHONUNBUFFERED": "1"})
        self.play_button["state"], self.stop_button["state"] = "disabled", "normal"
        threading.Thread(target=self.read, args=(self.proc,), daemon=True).start()

    def read(self, proc: subprocess.Popen) -> None:
        for line in proc.stdout:
            self.root.after(0, self.write, line)
        proc.wait()
        self.root.after(0, self.done)

    def write(self, text: str) -> None:
        self.log.insert("end", text)
        self.log.see("end")

    def done(self) -> None:
        self.proc = None
        self.play_button["state"], self.stop_button["state"] = "normal", "disabled"

    def stop(self) -> None:
        if not self.proc:
            return
        # The clip plays inside the script, so the whole tree goes, edge-tts children too.
        if sys.platform == "win32":
            subprocess.run(["taskkill", "/T", "/F", "/PID", str(self.proc.pid)], capture_output=True, check=False)
        else:
            self.proc.kill()
        self.write("Stopped.\n")

    def close(self) -> None:
        self.stop()
        self.root.destroy()


if __name__ == "__main__":
    root = tk.Tk()
    App(root)
    root.mainloop()
