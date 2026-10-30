# Part 3: the findings table

Each finding gets one row. The table MUST come before the findings, so the
verdict fits on one screen, a single finding included.

- **#** is the number of the finding below.
- **Severity** is the same word the heading uses.
- **Where** is the file and line in backticks, the file name alone, no path.
- **What** is the symptom in roughly 10 words or fewer, lowercase, no full stop.

Below the table, one line lists the changed files without a finding. Counts of
rows and files MUST stay out: the table already shows them.

Zero findings? Drop the table and write one line in its place: what the change
does well, and that it is ready to go.

```markdown
## Findings

| #   | Severity   | Where             | What                                                  |
| --- | ---------- | ----------------- | ----------------------------------------------------- |
| 1   | Blocker    | `SaveName.tsx:42` | the typed name is lost when the save is slow          |
| 2   | Should fix | `profile.ts:88`   | the save error is swallowed, so the page stays silent |
| 3   | Nit        | `SaveName.tsx:20` | no code reads the `isLoading` flag                    |

Clean: `result.ts`, `collect-results.ts`, the test config.
```
