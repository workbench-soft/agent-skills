# Demo data that looks real and holds no one

The agent MUST read this before it writes the first row of `demo/`.

## The story

- **One person, one week** the agent SHOULD pick a made-up user with a
  reason to use the app, such as a runner who plans races or a family that
  shares a shopping list. Every row MUST fit that life.
- **Enough rows** a list SHOULD show 6 to 12 items, so it fills the screen
  and still reads. One row and 200 rows both look fake.
- **Variety** the rows SHOULD mix lengths, states and dates: a done task,
  an overdue one, a long title, a short one. Each feature the shots show MUST
  have data that uses it.
- **Fresh dates** the agent MUST build dates from the day of the capture,
  such as "today", "yesterday", "in 3 days". A shot from 2026 with 2023 dates
  looks dead.
- **Real numbers** prices, distances and counts SHOULD match what the
  reader expects: $4.80 for a coffee, 5.2 km for a run.

Rows MUST NOT read like `Test task 1`, `asdf`, `Lorem ipsum`, `foo@bar.com`,
`123`.

Rows SHOULD read like `Book the vet for Milo`, `Return the library books`,
`ava@example.com`.

## No real person

- **Names** they MUST be made up, from mixed cultures, and MUST NOT be
  famous. The agent SHOULD check a name that sounds known with a quick
  search.
- **Emails** they MUST use `@example.com`, `@example.org` or
  `@example.net`. These domains are reserved and reach no inbox.
- **Phones** they MUST be US numbers 555-0100 to 555-0199, which are
  reserved for fiction.
- **Places** they SHOULD be cities, parks and landmarks. A home address
  MUST NOT appear, and a map pin MUST sit on a public place.
- **Faces** avatars SHOULD be illustrations or initials. A photo of a real
  person MUST NOT appear, the person's own photos included.
- **Face features** an app built on faces MAY use generated faces of people
  who don't exist. The agent MUST note the generator in `demo/README.md`.

## Photos, music and files

- **Photos** they SHOULD show landscapes, food, objects and pets, and MUST
  hold no person in frame. They MUST come from a source that allows reuse,
  such as Unsplash, Pexels or Wikimedia Commons, listed in `demo/README.md`.
- **Brands** the content MUST NOT show a third party logo, unless the app
  works with that brand, such as a Reddit client.
- **Music** it MUST be silence or a track with a free licence. A video with
  sound SHOULD drop the audio track.
- **Files** they MUST be made-up documents in `demo/`. A file from the
  person's disk MUST NOT appear.

## Accounts

- **Demo account** a sign-in app MUST get a demo account on its test or
  emulator backend, such as the Firebase emulator. Its password MUST go in
  `.env.local`, outside git.
- **Production** demo rows MUST NOT go to a shared or production database.
- **Hidden ids** user ids, document ids and URLs in the shots MUST come from
  the demo backend. A real id MUST NOT show in the URL bar.
