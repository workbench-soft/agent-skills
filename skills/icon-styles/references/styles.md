# Style catalogue

The agent SHOULD pick from this list, and MAY name a style it lacks. Each
style SHOULD carry the marks its line gives, which read at 32 px, where
detail is gone.

## Tech and future

- **Cyberpunk** SHOULD use magenta and cyan on near black, a glitch offset of 1
  or 2 units, a hard diagonal cut.
- **Neon** SHOULD use a bright stroke over a blurred copy, on a dark tile.
- **Synthwave** SHOULD use a sunset gradient, pink to orange, with a grid floor.
- **Hologram** SHOULD use cyan lines at low opacity, scan lines, a faint glow.
- **Circuit** SHOULD use 45 and 90 degree traces, round pads, PCB green or gold.
- **Terminal** SHOULD use a green or amber glyph on black, a block cursor.

## Craft and history

- **Steampunk** SHOULD use brass gradients, gears, rivets, a dark wood or
  leather tile.
- **Vintage badge** SHOULD use a round or shield badge, 2 muted inks, a thin
  inner ring.
- **Blueprint** SHOULD use white lines on blueprint blue, a dashed grid,
  dimension ticks.
- **Woodcut** SHOULD use thick black shapes, carved white lines, one accent ink.
- **Art deco** SHOULD use gold on black, fans, sunbursts, symmetry.

## Flat and modern

- **Flat** SHOULD use 2 to 4 solid colours, no gradient, no stroke.
- **Material** SHOULD use flat shapes, one soft cast shadow, a paper fold.
- **Glassmorphism** SHOULD use frosted glass on a colour blob, a 40% white edge.
- **Neumorphism** SHOULD use the tile colour, raised with a light and a dark
  shadow.
- **Gradient mesh** SHOULD use a bold gradient tile, a white glyph, as on iOS.
- **Line icon** SHOULD use one stroke weight, round caps, no fill.

## Playful and bold

- **Pixel art** SHOULD use a 16 or 32 grid, `shape-rendering="crispEdges"`,
  no curves.
- **Isometric** SHOULD use a cube or block at 30 degrees, 3 shades of one hue.
- **Brutalist** SHOULD use black outlines 3 units or thicker, a hard offset
  shadow, raw primaries.
- **Sticker** SHOULD use a white die cut border, a drop shadow, a slight tilt.
- **Clay** SHOULD use soft rounded forms, light top left, a gentle inner shadow.
- **Origami** SHOULD use folded planes, each face a different shade.
- **Low poly** SHOULD use a shape split into triangles, each with its own shade.

## Ink and paint

- **Hand drawn** SHOULD use a wobbly stroke, as if by marker, uneven fills.
- **Watercolour** SHOULD use soft blobs at 60% opacity that overlap, a paper
  tone.
- **Ukiyo-e** SHOULD use flat inks, a wave or a cloud motif, a red seal.
- **Stained glass** SHOULD use thick dark lead lines between bright panes.

## Match the style to the app

The agent SHOULD start from the styles that fit its kind of app:

| The app                                   | Styles that fit                                          |
| ----------------------------------------- | -------------------------------------------------------- |
| a developer tool, a CLI, a system utility | terminal, circuit, neon, cyberpunk, blueprint, brutalist |
| a game                                    | pixel art, isometric, sticker, clay, low poly            |
| notes, a diary, writing                   | hand drawn, watercolour, line icon, origami              |
| money, health, work                       | flat, material, gradient mesh, glassmorphism             |
| photos, music, art                        | gradient mesh, synthwave, stained glass, ukiyo-e         |

- **Spread** the agent SHOULD take the 10 from at least 3 groups, so the
  sheet holds real choices.
- **Twist** 1 or 2 styles SHOULD be outside the obvious set for the app. A
  surprise is often the pick.
