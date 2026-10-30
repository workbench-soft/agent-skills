# Agent instructions

`SKILL.md`, `AGENTS.md`, `CLAUDE.md`, an `.instructions.md` or a prompt is code
that an agent carries out word for word. Read every changed rule as that agent.

- **Taken literally**: following this rule on each case it covers, what does
  the agent write? Name the case where the output goes wrong.
- **Two orders**: does the rule conflict with another one in the diff, or in a
  file it links to? Say which one prevails.
- **Same rule twice**: does it now live in two files, with different reasons?
  Keep one copy, and the other file links to it.
- **Commands it gives**: in the folder it runs in, does the command print what
  the text claims?
- **Text left behind**: does some other line of the same skill still describe
  the old behaviour?

The finding MUST quote the rule and show the agent's output from it.
