# Agent instructions

`SKILL.md`, `AGENTS.md`, `CLAUDE.md`, an `.instructions.md` or a prompt is code
that an agent carries out word for word. The reviewer MUST read every changed
rule as that agent.

- **Taken literally**: following this rule on each case it covers, what does
  the agent write? The reviewer MUST name the case where the output goes wrong.
- **Two orders**: when the rule conflicts with another one in the diff, or in a
  file it links to, the reviewer MUST say which one prevails.
- **Same rule twice**: a rule now in two files, with different reasons, SHOULD
  keep one copy, and the other file SHOULD link to it.
- **Commands it gives**: in the folder it runs in, the command MUST print what
  the text claims.
- **Text left behind**: no other line of the same skill SHOULD still describe
  the old behaviour.

The finding MUST quote the rule and show the agent's output from it.
