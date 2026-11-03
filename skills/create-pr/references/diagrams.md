# Before and after diagrams

Each diagram of a change MUST come as a pair: how it worked before, then how
it works now. `create-pr`, `review`, `architecture` and `feature-docs` MUST
draw their diagrams this way.

## The pair

- **Two blocks** the agent MUST draw a `Before` block, then an `After` block,
  each under its bold label, with the same node IDs and direction, so the eye
  finds what moved.
- **Nothing before** a brand new flow MUST still get a `Before` block: what
  the person did without it, or one gray node such as "No way to share a
  photo".
- **Same scope** both blocks MUST cover the same paths. A path the change
  leaves alone MUST stay out of both.
- **Removed** a node or arrow the change drops MUST appear in `Before` with
  the `removed` class and stay out of `After`.
- **Docs** a doc that shows the current state, such as
  `docs/architecture.md`, MAY keep only the `After` diagram. Its PR body MUST
  carry the pair.

## Colours

Each node MUST carry the class for its status, and the four `classDef` lines
MUST sit at the end of each block, as is. Dark text on a light fill reads in
both GitHub themes.

```mermaid
classDef new fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#111827
classDef changed fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#111827
classDef removed fill:#fee2e2,stroke:#dc2626,stroke-width:2px,stroke-dasharray:5 3,color:#111827
classDef same fill:#f3f4f6,stroke:#9ca3af,color:#111827
```

- **Kind by shape** a screen or an action MUST be `(rounded)`, code
  `[box]`, a data store `[(cylinder)]`, an outside service `{{hexagon}}`.
- **Arrows** an arrow the change adds SHOULD be thick `==>`, and one it
  drops MUST be dotted `-.->` in `Before`.
- **Legend** one line MUST follow each pair: "Green new, amber changed, red
  removed, gray unchanged."
- **erDiagram** it takes no classes, so each column the change touches MUST
  get a `"new"`, `"changed"` or `"removed"` comment instead.

## Example

The pair SHOULD read like this:

````markdown
**Before**

```mermaid
flowchart LR
  A(Picks a photo):::same --> B[upload.ts checks size]:::changed
  B -->|over 5 MB| E(Sees "Upload failed"):::removed
  classDef ...
```

**After**

```mermaid
flowchart LR
  A(Picks a photo):::same --> B[upload.ts checks size]:::changed
  B ==>|over 25 MB| E(Sees the limit and the file size):::new
  classDef ...
```

Green new, amber changed, red removed, gray unchanged.
````

The `classDef ...` lines above stand for the four lines in full, and the
agent MUST write them out.
