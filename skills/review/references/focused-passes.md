# The focused rounds

Every round MUST reread the same change with a single question. They MUST come
after the second round, [architecture-pass.md](architecture-pass.md), in the
order listed below, and one line naming each round MUST open it.

## Which rounds run

- **Security** MUST run on each review.
- **State and failure** MUST run when the change writes a file, a table or a
  lock, or launches a background process: [state-pass.md](state-pass.md).
- **Speed** MUST run when the change contains code that executes. A change of
  only docs, copy and comments MAY skip it.
- **Accessibility** MUST run when the change touches what a person sees or
  works with on screen: markup, components, styles, UI text.
- **Agent instructions** MUST run when the change touches a file an agent takes
  as orders: [instructions-pass.md](instructions-pass.md).

Each skipped round MUST get one line giving the reason.

## Security

The agent MUST track each input from its way in to the place it ends up.

- An input MUST NOT land in HTML, a query, a shell, a file path or a redirect
  without escaping.
- Every new endpoint, action or job MUST check who is calling and what they
  can touch.
- A secret, a token or personal data MUST NOT reach code, logs, a URL, an
  error or the browser bundle.
- Changed settings for sessions, cookies, CORS or CSRF MUST still hold.
- A new dependency, or code or data fetched at run time, MUST be pinned, kept
  up, free of known holes, and limited to the access it needs.

## Speed

- **Repeated work** MUST be flagged: one request or query per item in a loop,
  the same total computed on each render.
- **No upper bound** MUST be flagged: a full table loaded in one go, no paging,
  a cache that keeps growing.
- **Browser** waste MUST be flagged: a re-render on each keystroke, a heavy
  import in the first bundle, an image without a size that shifts the layout.
- **Server** waste MUST be flagged: a new query without an index, a lock held
  across a network call, a slow call on the hot path.
- **Every session pays** MUST be flagged: a hook or startup step that runs for
  all users when only the feature needs it. The cheap filter SHOULD run first.

A speed finding MUST give the size where it starts to hurt: "slow past 1,000
rows". A guess MUST be labelled as a guess.

## Accessibility

The agent MUST check against WCAG 2.2 AA.

- **Keyboard**: Tab MUST reach each new control, and Enter or Space MUST work
  it. Focus SHOULD go somewhere sensible as a dialog opens and closes.
- **Screen reader**: each control MUST have a name, each icon button a label,
  each image alt text. A change of state SHOULD get announced.
- **Markup**: a clickable `div` in place of a `button`, a heading level
  skipped, a field without a label MUST each be flagged.
- **Sight**: text contrast below 4.5:1, meaning shown by colour alone, a layout
  that breaks at 200% zoom MUST each be flagged.
- **Motion**: animation that ignores `prefers-reduced-motion` MUST be flagged.

## What comes out

- Every round MUST follow the shape in "What comes out" of
  [architecture-pass.md](architecture-pass.md), with the numbers continued.
- A finding an earlier pass already holds MUST NOT appear again.
- A round with zero findings MUST say so in one line, naming what it checked.
