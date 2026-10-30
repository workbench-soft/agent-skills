# The focused rounds

Every round rereads the same change with a single question. They come after the
second round, [architecture-pass.md](architecture-pass.md), in the order listed
below, and one line naming each round opens it.

## Which rounds run

- **Security** MUST run on each review.
- **State and failure** MUST run when the change writes a file, a table or a
  lock, or launches a background process: [state-pass.md](state-pass.md).
- **Speed** MUST run when the change contains code that executes. A change of
  only docs, copy and comments skips it.
- **Accessibility** MUST run when the change touches what a person sees or
  works with on screen: markup, components, styles, UI text.
- **Agent instructions** MUST run when the change touches a file an agent takes
  as orders: [instructions-pass.md](instructions-pass.md).

Each skipped round gets one line giving the reason.

## Security

Track each input from its way in to the place it ends up.

- Can it land in HTML, a query, a shell, a file path or a redirect without
  escaping?
- Does every new endpoint, action or job check who is calling and what they may
  touch?
- Does a secret, a token or personal data reach code, logs, a URL, an error or
  the browser bundle?
- Did the settings for sessions, cookies, CORS or CSRF change, and do they
  still hold?
- A new dependency, or code or data fetched at run time: is it pinned, kept up,
  free of known holes, and limited to the access it needs?

## Speed

- **Repeated work**: one request or query per item in a loop, the same total
  computed on each render.
- **No upper bound**: a full table loaded in one go, no paging, a cache that
  keeps growing.
- **Browser**: a re-render on each keystroke, a heavy import in the first
  bundle, an image without a size that shifts the layout.
- **Server**: a new query without an index, a lock held across a network call,
  a slow call on the hot path.
- **Every session pays**: a hook or startup step that runs for all users when
  only the feature needs it. The cheap filter runs first.

A speed finding MUST give the size where it starts to hurt: "slow past 1,000
rows". A guess is labelled as a guess.

## Accessibility

Check against WCAG 2.2 AA.

- **Keyboard**: Tab reaches each new control, and Enter or Space works it.
  Focus goes somewhere sensible as a dialog opens and closes.
- **Screen reader**: each control has a name, each icon button a label, each
  image alt text. A change of state gets announced.
- **Markup**: a clickable `div` in place of a `button`, a heading level
  skipped, a field without a label.
- **Sight**: text contrast below 4.5:1, meaning shown by colour alone, a layout
  that breaks at 200% zoom.
- **Motion**: animation that ignores `prefers-reduced-motion`.

## What comes out

- Every round follows the shape in "What comes out" of
  [architecture-pass.md](architecture-pass.md), with the numbers continued.
- A finding an earlier pass already holds MUST NOT appear again.
- A round with zero findings says so in one line, naming what it checked.
