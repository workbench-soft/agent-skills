# The developer's device

An app with ads MUST hide them on the developer's own device, in every build:
debug, the GitHub release and the store build. The developer MUST be able to
show and hide them right in the app.

## Mark the device

- **Key** a random key of 32 bytes MUST stay on the developer's PC, in a user
  env var. The code MUST hold only its SHA-256, so a person who reads the
  source can't unlock a phone.
- **Link** the app MUST read a deep link such as
  `<org>-dev://unlock?key=<key>&ads=1`, at launch and while it runs. A key
  whose hash matches MUST mark the device in the app's own storage. Any other
  key MUST leave the storage as it was.
- **Send it** a script on the PC SHOULD open the link in each app over
  `adb shell am start`, with the link passed through stdin, so the phone log
  stays clean. A repo that already has such a script MUST reuse it.
- **Lost** clearing the app data forgets the mark. The script SHOULD then run
  again.

## On the marked device

- **Hidden** ads MUST stay off by default. The SDK and the consent form MAY
  skip their start there.
- **Test units** when ads show there, they MUST be Google's demo units, since
  a tap on a real ad from the publisher's device gets the account flagged.
- **Switch** Settings MUST hold a "Show test ads" switch that only the marked
  device sees. On, the test ads come back at once. Off, they go at once. The
  choice MUST persist across launches.
- **Script** `&ads=1` and `&ads=0` in the link MUST set the same switch, so
  one command can flip it in every app.
- **Other devices** MUST see neither the switch nor any change: ads until the
  person pays to remove them.

## Web builds

A site or a web build MAY show the same switch on the dev server only, such
as under `import.meta.env.DEV`, off by default. The published site MUST NOT render it.

## Tests

A unit test MUST cover the link: a wrong key leaves the device unmarked, the right key
marks the device and sets the switch, and another link stays with the
router.
