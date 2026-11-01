# Posting the comments to the PR

The agent MUST read this at the step with the posting offer, and hold it in
context until the final call returns.

When the review is of a branch, a pasted diff or uncommitted work, with no PR
behind it, the agent MUST say that in one line and stop.

## Offer it after the last round

The rounds in [architecture-pass.md](architecture-pass.md) and
[focused-passes.md](focused-passes.md) MUST be finished first. The offer to put
the comments on the PR MUST close the last of them, beside a choice that skips
it, in the report language and through the picker that
[pick-lists.md](pick-lists.md) describes. It MUST name the verdict from
[verdict.md](verdict.md). A comment MUST reach the PR only after the user asks.
The findings of all rounds MUST go up in one go.

## Ask which version first

The comment block and the `Shorter:` and `Assertive:` blocks carry the same
message, so the user chooses how they go up, and the choice MUST NOT be
guessed. The agent MUST ask one question before any call, with the choices and
layout from [pick-lists.md](pick-lists.md): one version for all comments, the
best fit per comment, the user's choice per comment, or skip.

## Best fit per comment

- Each comment SHOULD get the version that fits it: `Assertive:` for a blocker
  with a clear fix, the full one where the reader needs context, `Shorter:` for
  a nit or an obvious ask.
- With two comments or more, the picks MUST NOT all fall on one version. That
  template look is what this choice is there to avoid.

## Let me pick per comment

- The agent MUST ask a question per comment, in finding order, through the
  picker [pick-lists.md](pick-lists.md) describes.
- The questions SHOULD fit in as few calls as the tool permits, so they appear
  one after another.
- The first `gh` call MUST wait for an answer on every comment.

## One comment per finding, on its own line

Each comment MUST go up alone, as its own thread on the file and line named in
the finding's "Comment on" line. Putting several in one review body loses the
line each belongs to.

The head SHA and the body MUST be passed as files, since a body holds newlines
and backticks that a shell argument breaks:

```sh
sha=$(GH_PAGER=cat gh pr view <number> --json headRefOid -q .headRefOid)
GH_PAGER=cat gh api repos/OWNER/REPO/pulls/<number>/comments \
  -f commit_id="$sha" \
  -f path='src/features/profile/SaveName.tsx' \
  -F line=42 -f side=RIGHT \
  -f body="$(cat comment-1.md)"
```

`side` MUST be `RIGHT` on an added line and `LEFT` on a removed one. A comment
across a range MUST add `start_line` on the same side.

After the last line comment the verdict MUST go up, as
[verdict.md](verdict.md) describes.

When the call fails with `line must be part of the diff`, the line is
untouched. The agent MUST move only that comment to the closest changed line
and start it with the real location, as [pr-links.md](pr-links.md) describes.
The rest MUST go up as they are.

## Before the call

- Each body MUST be in English, with no report language left in it.
- Each finding MUST get one body, holding only the chosen version, with `nit: `
  or `blocker: ` in front where it fits.
- Fenced code, evidence markers, counts and the impact paragraph MUST stay out.
  They belong in the finding.
- `path` and `line` MUST be taken from the finding's "Comment on" line, the path
  spelled as the repository spells it, copied from the diff.

## After the call

For each comment the agent MUST print one line: `file:line`, the version it
went up in, its opening words and the URL the call returned. A failed comment
MUST be named along with the reason.
