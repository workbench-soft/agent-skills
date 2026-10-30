# The verdict on the PR

You MUST read this before the posting offer, and hold it in context until the
verdict is up.

## Pick it from the findings

The agent decides the verdict. It goes up with the comments once the user
agrees to posting, without a second question.

- **Request changes** for a sure blocker only, the finding whose comment starts
  with `blocker: `. A blocker you have doubts about stays a comment.
- **Approve** when you would merge the PR as it is: no blocker, and every other
  finding can wait for a later PR. Zero findings means approve.
- **Comment** in all other cases. The line comments go up and the PR gets no
  verdict.

The posting offer MUST state the verdict and its reason in one line, so the
user sees it before agreeing. Zero findings? The offer is to approve.

## Post it after the line comments

The verdict MUST go up last, so its review appears below the threads it refers
to. The body is one line in English. Request changes lists the blockers by tag
and heading. Approve MAY have no body.

```sh
GH_PAGER=cat gh pr review <number> --request-changes -b "$(cat verdict.md)"
GH_PAGER=cat gh pr review <number> --approve
```

GitHub rejects both on a PR opened by the logged in account. In that case only
the line comments go up, and the answer says that is why the verdict stayed
off.

Print the verdict on a line of its own after the comment lines.
