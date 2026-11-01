---
name: address-comments
description: 'Use in any repository and in any language when the user asks to address, fix, resolve, handle or go through the review comments on a pull request: "address the comments", "fix the PR feedback", "handle the review", "go through the threads", a PR link plus "comments". Each review thread gets one small commit with the least new code that does the job, then a reply in that thread with the commit SHA and one sentence on the fix, and the PR description gets updated when a fix changes what the PR does.'
---

# Address review comments on a pull request

Each thread MUST get its own commit and its own reply. A thread means the
reviewer's comment together with all the answers below it.

## 1. Get the PR and the branch

Every `gh` call MUST start with `GH_PAGER=cat`, or a pager opens and the run
hangs.

The agent MUST take the PR from the link the user sent, or else from the
current branch:

```bash
GH_PAGER=cat gh pr view <number-or-url> --json number,url,headRefName,baseRefName,author
GH_PAGER=cat gh api user -q .login   # who the user is in the threads
```

The agent MUST read `OWNER` and `REPO` for the commands below off the PR URL.

Before any edit, these MUST hold:

- The working tree MUST be clean. Uncommitted changes? The agent MUST name
  those files and stop.
- On a branch other than the PR's? The agent MUST switch with
  `gh pr checkout <number>`.
- The agent MUST run `git pull --ff-only`. If it fails, the agent MUST stop
  and report it, since a rebase is for the user to decide.

## 2. Fetch the threads

The agent MUST fetch the threads with:

```bash
GH_PAGER=cat gh api graphql -F owner=OWNER -F repo=REPO -F number=N -f query='
query($owner: String!, $repo: String!, $number: Int!) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      reviewThreads(first: 100) {
        nodes {
          id isResolved isOutdated path line originalLine
          comments(first: 50) { nodes { author { login } body diffHunk url } }
        }
      }
    }
  }
}'
```

The agent MUST work only on threads where `isResolved: false`.

A request made outside a thread, in a review body or the PR conversation,
MUST count too. The agent MUST get those with
`gh pr view N --json comments,reviews` and treat each request like a thread.

## 3. Read each thread to the end

Decisions MUST wait until the thread is read in full. The fix MUST be the
last point both sides agreed on: if the reviewer asked for X, the author
proposed Y and the reviewer accepted, the fix is Y.

The agent MUST sort each thread into one bucket:

- **Fix** the thread wants a change, either unchallenged or agreed in the
  discussion. It MUST get a commit and a reply.
- **Answer** a question with no code change. The agent MUST draft a reply and
  skip the commit.
- **Open** the author objected without the reviewer agreeing, the request is
  vague, or it calls for a redesign. The agent MUST skip the commit and the
  reply.
- **Done** the code already does what the thread wants, often the case with
  `isOutdated`. The agent MUST skip the commit and the reply.

When the user had the last word in a thread, that word SHOULD count as their
decision. A thread where they said "won't fix" MUST leave the work.

Before the first edit, the agent MUST post the plan in the chat with one line
per thread: `path:line`, the request in a few words, its bucket. Then it
SHOULD go ahead without asking.

## 4. The smallest change that answers the thread

The agent SHOULD take the Fix threads in file order. The diff MUST be the
smallest one that does what the thread agreed on, even if a larger rewrite
would read better.

- The change MUST do the thread's request and stop there: no renames, no
  reformatting, no fixes to the code around it. A problem the agent notices
  nearby MUST stay as it is and go in the report.
- Removing code SHOULD come before adding it. Before a new line, the agent
  SHOULD check for code the fix makes dead, a helper the repo has, or a
  language feature that covers it.
- A function, file, type, package or abstraction MUST NOT be added unless the
  thread asks for it.
- A comment in the code that explains the fix MUST NOT be added. The why MUST
  go in the reply.
- The fix reaches past the lines the thread names, into a second module, a
  public API, a shared config or a schema? The agent MUST undo it, put the
  thread under Open and give the reason.

The agent MUST look at `git diff` before committing. If it adds more lines
than it removes, the agent SHOULD search once more for a shorter version, and
MAY keep this one if there is none.

The agent MUST run the quickest check the repo has on the changed files:
typecheck, lint, the tests beside them. It SHOULD take the commands from
`package.json`, `AGENTS.md`, `CONTRIBUTING.md` or the CI config. A check that
fails MUST be fixed in that same commit, or else the agent MUST undo the
change with `git checkout -- <files>` and put the thread under Open.

## 5. Commit

- The agent MUST stage just this fix's files with `git add <files>`.
  `git add -A` and `git add .` MUST NOT be used.
- The message SHOULD match the convention in `git log --oneline -10`. Without
  one, it SHOULD be a single imperative line on what the code now does.
- The message SHOULD carry a ticket prefix when the other commits on the
  branch have one.
- Hooks MUST run. `--no-verify` and `--amend` MUST NOT be used.
- The agent MUST record the short SHA: `git rev-parse --short HEAD`.

Messages SHOULD read like these:

```text
Clear the name field after the save succeeds
PROJ-123: drop the unused formatDate wrapper
```

Several threads that want the same change MAY go in one commit. Every thread
MUST still get a reply of its own.

## 6. Push, then reply

The agent MUST push when all the Fix threads have their commits. A push that
gets rejected MUST end the run, since a force push is for the user to decide.

```bash
git push
```

Next, the agent MUST reply once in each thread, reading the body from a file
so the backticks come through:

```bash
GH_PAGER=cat gh api graphql -f threadId="$thread_id" -f body="$(cat reply.md)" -f query='
mutation($threadId: ID!, $body: String!) {
  addPullRequestReviewThreadReply(input: {pullRequestReviewThreadId: $threadId, body: $body}) {
    comment { url }
  }
}'
```

A request from the PR conversation MUST be answered in the conversation,
quoting the line it replies to: `gh pr comment N --body-file reply.md`.

The reviewer MUST be the one to resolve a thread, unless the user asks the
agent to.

## 7. The reply

The `writing-style` skill MUST be loaded before the first reply, unless it is
already in context, and every reply MUST go through its checklist.

- The reply MUST be a single line: the SHA, then one sentence on how the code
  behaves now.
- The reply MUST be in English, whatever the chat language is, since the team
  reads it.
- The reply MUST leave out line counts, "refactored", thanks and greetings.
- An Answer reply SHOULD stay within two sentences.

Replies SHOULD read like these:

```markdown
Fixed in 3f2c1ab: the field clears only after saveName resolves ok.
```

```markdown
Fixed in 9d04e7c: dropped the wrapper, the callers use formatDate directly.
```

GitHub links the short SHA to its commit, so the reply SHOULD NOT carry a URL.

## 8. Update the PR description

When a fix changes what the PR does, the PR body MUST say so, or reviewers
read about code that is gone. That covers what a person sees, an API, a config
default, or a package added or removed. A rename, a cleanup or a test change
MUST NOT touch the body. The agent MUST edit it with:

```bash
GH_PAGER=cat gh pr view N --json body -q .body > body.md
GH_PAGER=cat gh pr edit N --body-file body.md
```

- The agent MUST correct just the lines the change made false, or add one
  bullet where it belongs. The rest of the body MUST stay untouched.
- New lines SHOULD follow the body rules in the `create-pr` skill.
- Someone else owns the PR? The agent MUST leave the edit unposted and put it
  in the report.

## 9. Report back

The report MUST list, in this order: one line per thread with its SHA and
reply URL; the PR body lines that changed, if any; the Answer drafts,
unposted, for the user to send; the Open and Done threads, one line each with
the reason or the decision the user has to make; and last the problems
noticed nearby and left as they were, one line each.

## Guardrails

- A force push, a rebase or an amend MUST NOT happen.
- Files that aren't part of the fix MUST stay as they are, staged or not.
- A push to the default branch MUST NOT happen. The agent MUST stop and
  report it.
- A reply MUST NOT claim a fix the pushed code doesn't hold. The agent MUST
  push first, then reply.
