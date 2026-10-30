@echo off
rem Double click opens the voice-test window. mise gives the pinned Node, Python and edge-tts.
rem server.ts starts itself again hidden, so this console closes at once.
cd /d "%~dp0..\ui"
mise x -- node server.ts
