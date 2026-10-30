# Demo data that looks real and holds no one

Read before writing the first row of `demo/`.

## The story

- **One person, one week** pick a made-up user with a reason to use the
  app, such as a runner who plans races or a family that shares a shopping
  list. Every row fits that life.
- **Enough rows** a list shows 6 to 12 items, so it fills the screen and
  still reads. One row and 200 rows both look fake.
- **Variety** mix lengths, states and dates: a done task, an overdue one, a
  long title, a short one. Each feature the shots show needs data that uses
  it.
- **Fresh dates** build dates from the day of the capture, such as "today",
  "yesterday", "in 3 days". A shot from 2026 with 2023 dates looks dead.
- **Real numbers** prices, distances and counts the reader would expect:
  $4.80 for a coffee, 5.2 km for a run.

Bad: `Test task 1`, `asdf`, `Lorem ipsum`, `foo@bar.com`, `123`.

Good: `Book the vet for Milo`, `Return the library books`, `ava@example.com`.

## No real person

- **Names** made up, from mixed cultures, and no famous name. Check a name
  that sounds known with a quick search.
- **Emails** `@example.com`, `@example.org` or `@example.net`. These domains
  are reserved and reach no inbox.
- **Phones** US numbers 555-0100 to 555-0199, which are reserved for
  fiction.
- **Places** cities, parks and landmarks. A home address MUST NOT appear,
  and a map pin sits on a public place.
- **Faces** illustrated avatars or initials. A photo of a real person MUST
  NOT appear, the person's own photos included.
- **Face features** an app built on faces MAY use generated faces of people
  who don't exist. Note the generator in `demo/README.md`.

## Photos, music and files

- **Photos** landscapes, food, objects and pets, with no person in frame.
  Take them from a source that allows reuse, such as Unsplash, Pexels or
  Wikimedia Commons, and list each source in `demo/README.md`.
- **Brands** no third party logo in the content, unless the app works with
  that brand, such as a Reddit client.
- **Music** silence or a track with a free licence. A video with sound
  SHOULD drop the audio track.
- **Files** made-up documents in `demo/`. A file from the person's disk MUST
  NOT appear.

## Accounts

- **Demo account** a sign-in app gets a demo account on its test or
  emulator backend, such as the Firebase emulator. Its password goes in
  `.env.local`, outside git.
- **Production** demo rows MUST NOT go to a shared or production database.
- **Hidden ids** user ids, document ids and URLs in the shots come from the
  demo backend. A real id MUST NOT show in the URL bar.
