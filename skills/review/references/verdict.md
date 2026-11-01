# The verdict on the PR

The agent MUST read this before the posting offer, and hold it in context until
the verdict is up.

## Pick it from the findings

The agent MUST decide the verdict. It MUST go up with the comments once the
user agrees to posting, without a second question.

- **Request changes** MUST be for a sure blocker only, the finding whose comment
  starts with `blocker:`. A blocker the agent has doubts about MUST stay a
  comment.
- **Approve** MUST be the pick when the agent would merge the PR as it is: no
  blocker, and every other finding can wait for a later PR. Zero findings MUST
  mean approve.
- **Comment** MUST be the pick in all other cases. The line comments go up and
  the PR gets no verdict.

The posting offer MUST state the verdict and its reason in one line, so the
user sees it before agreeing. With zero findings, the offer MUST be to approve.

## Post it after the line comments

The verdict MUST go up last, so its review appears below the threads it refers
to. The body MUST be one line in English. Request changes MUST list the
blockers by tag and heading. Approve MAY have no body.

```sh
GH_PAGER=cat gh pr review <number> --request-changes -b "$(cat verdict.md)"
GH_PAGER=cat gh pr review <number> --approve
```

GitHub rejects both on a PR opened by the logged in account. In that case only
the line comments MUST go up, and the answer MUST say that is why the verdict
stayed off.

The agent MUST print the verdict on a line of its own after the comment lines.
