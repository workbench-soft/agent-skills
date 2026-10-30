@echo off
rem Double click opens the voice-test window. mise gives the pinned Python and edge-tts.
cd /d "%~dp0"
start "" mise x -- pythonw voice_test_ui.py
