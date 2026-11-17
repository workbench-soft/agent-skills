---
name: visible-work
description: 'Use before writing or changing app code that does work after a tap, a voice command, a timer or a push: a search, a load, a stream, a sync, a save, playback. Also on "show what is happening", "the app looks frozen", "the screen does not change", "покажи что происходит", "приложение молчит". Each step shows on screen while it runs, a wait says what it waits for, the end shows the result or an error, and an action the person asked for finishes without a second tap.'
---

# Work shows on screen

Each step an app takes MUST show on screen while it runs. The person MUST be
able to tell at any moment whether the app works, waits or failed. A screen
that looks idle while work runs MUST be treated as a bug.

## 1. List the steps

Before the code, the agent MUST write down each step of the flow, from the
person's action to the result.

- **Steps** each call, wait, retry and hand off MUST be its own line: heard
  the command, searched, found, loading the stream, playing.
- **Long ones** a step that MAY take over 300 ms MUST get a sign. A step under
  that MAY share the sign of the next one.
- **Hidden starts** work that starts on a timer, a push or a wake word MUST
  show as soon as it starts, like work from a tap.

## 2. Give each step a sign

Each step on the list MUST get a sign the person sees, in the place they look.

| The step                               | Sign                                                 |
| -------------------------------------- | ---------------------------------------------------- |
| listening, recording                   | a live glow or a pulse, with "Listening…"            |
| a search, a lookup, a call to a server | the step in words: "Looking for Enrique Iglesias…"   |
| loading a file, a stream or a page     | "Loading", a progress bar when the size is known     |
| a save, a send, an upload              | the button busy, then "Saved" or "Sent"              |
| a retry                                | "Trying again" with the reason                       |
| a step with the screen off             | the lock screen, a notification or the spoken answer |

- **Words** the sign SHOULD name the step and its object. A spinner alone
  MAY serve under 2 s.
- **Handover** a sign MUST stay on until the next step's sign takes over.
  The glow of a voice command MUST NOT go out before the answer or the result.
- **Translated** each sign's text MUST go through `translations`.
- **Accessible** a step change SHOULD reach TalkBack and VoiceOver, such as
  through a live region or an announcement.

## 3. End with a result

The flow MUST end in a state the person sees.

- **Done** an action the person asked for MUST finish by itself: a "play"
  plays, a "send" sends. A second tap to finish it MUST be treated as a bug.
- **Check it happened** the code SHOULD check the result, such as the player
  reporting it plays, and retry once when it didn't.
- **Failure** a failure MUST say so in words, with the next step for the
  person. A silent stop MUST NOT happen.
- **Timeout** each wait MUST have a limit. Past it, the app MUST show the
  failure and drop the sign.

## 4. Check it

- **On the device** the agent MUST run the flow once on the device or the web
  build and watch each sign change, through a screenshot or a screen
  recording.
- **Slow network** the agent SHOULD run it once on a slow or cut network, so
  the waits and the failure show.
- **Test** a pure function that picks the step or the next action SHOULD get
  a unit test, such as a wait that decides between retry and fail.
