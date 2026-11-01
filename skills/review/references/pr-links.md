# Pointing at the right line

The agent MUST read this when a GitHub PR is the review target, or when a
finding falls on a line outside the diff.

## The link to the line in the PR

The user reads a finding, then opens the PR to leave the comment, and that
SHOULD take one click. Each link under a heading and each "comment on the PR"
line MUST hold two halves: the workspace link, opening the file in the editor,
and a PR link, landing on that diff line with its comment box.

```markdown
[path/to/file.ts:42](path/to/file.ts#L42) · [in the PR](https://github.com/OWNER/REPO/pull/123/files#diff-<anchor>R42)
```

A `blob/<sha>/path#L42` permalink MUST NOT be used. It takes the reader out of
the review to a read-only file where commenting is impossible.

The anchor MUST be `diff-` followed by the sha256 of the file path, then the
side and the line: `R42` on the new side, `L42` on the removed side, the first
line for a range or a block.

```sh
printf '%s' 'path/to/file.ts' | shasum -a 256 | cut -d' ' -f1
```

The agent SHOULD read `OWNER/REPO` and the number off the PR once:

```sh
GH_PAGER=cat gh pr view <number> --json url -q .url
```

On a large file GitHub collapses the diff, so the anchor MAY land on the file
and miss the line. The reader expands it, which still beats leaving the PR.

When the finding is in a file the PR leaves alone, the diff has no anchor for
it. The agent MUST link `blob/HEAD_SHA/path#L42` and state in the finding that
the file sits outside the PR.

When the review is of a branch, a pasted diff or uncommitted work, with no PR
to link, the agent MUST leave out the second half. The workspace link stands by
itself.

## Where the comment goes

GitHub accepts an inline comment only on a line the diff touches. That MUST be
settled before the target is written:

- **In the diff**: the agent MUST give the line, and say added (green) or
  removed (red). A new file has every line added.
- **Untouched**: the agent MUST say so, give the closest changed line to attach
  it to, and start the comment with the real location, "a line up, at
  `report.ts:55`, ...".
- **Two files**: the comment MUST sit on the file the author has to edit, and
  name the other one.
- **No line fits**: the finding MUST stay in the report without a comment, and
  its "Comment on" line MUST say so.
