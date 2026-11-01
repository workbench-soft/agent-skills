# State and failure

The agent MUST read the change two more times: once as two copies of it running
side by side, once as a run that crashes halfway through.

- **Old copy written back**: a step MUST NOT read the state, wait on something
  slow, then save its stale copy over a newer one.
- **Half a file**: a reader MUST NOT catch a file mid-write. `writeFile` empties
  it first, while a temp file plus `rename` doesn't.
- **Someone else's lock**: the code MUST NOT free a lock it didn't take, or grab
  a stale one that another process has just taken.
- **Dies halfway**: a step MUST NOT delete or move before the step that can
  fail. A rerun MUST NOT trust the half, or a "done" flag meaning "tried".
- **Retry twice**: after an unclear answer, a retry MUST NOT post the comment,
  the row or the charge a second time.

This round SHOULD also flag a message that points the person at the wrong fix:
one text for two causes, stderr thrown away, a stack trace for a mistyped flag.

The finding MUST list the order of steps that breaks it, a step per line.
