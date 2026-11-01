# Asking the user to pick from a list

The agent MUST read this before giving the user a choice of comment versions.

A markdown checkbox, `- [ ]`, MUST NOT appear in any part of the answer. VS Code
renders it as a box that can't be clicked, and pushes the text after the box
onto a line of its own.

## The host has a picker tool

When a tool asks the user to choose from a list, like `AskUserQuestion` or the
VS Code question tool, the agent MUST call it, and the written list below MUST
stay out of the answer.

- The question SHOULD fit on one line: what the choice gets them.
- The question MUST take a single answer.
- Each choice MUST be plain text of roughly 60 characters or fewer, starting
  with its number where the list carries numbers elsewhere.
- Choices MUST hold no markdown. Backticks, bold and a leading number with a
  dot all arrive broken.

## No such tool

The agent MUST list the choices with numbers, and say how to reply:

```markdown
Which comment version should I post?

1. Full version
2. Shorter version
3. Assertive version
4. Best fit per comment, mixed
5. Let me pick per comment
6. Skip posting
```

## One question per comment

On "Let me pick per comment", every question MUST name its comment, and the
versions MUST be the choices.

- The question SHOULD be the tag and heading of the comment: `C1. Blocker: the typed
  name is lost`.
- The choices MUST be `Full`, `Shorter` and `Assertive`, each with the comment
  text in its description field.
- With no description field, the three texts MUST go in the message field of
  the question, and the choices MUST stay bare.

With no picker tool, the agent MUST write out each comment with its numbered
versions, then one line on how to reply:

```markdown
C1. Blocker: the typed name is lost when the server is slow

1. Full: blocker: this clears the input before saveName comes back ...
2. Shorter: blocker: clears the input before saveName comes back ...
3. Assertive: blocker: this clears the input before saveName comes back ...

Answer with one number per comment, like: C1 2, C2 1
```
