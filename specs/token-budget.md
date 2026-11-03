# Token budget

## 2026-11-04 Short skill descriptions

- **Problem** a replay of 300 Claude Code sessions showed the skill list at about 9k tokens per session, the second cost after the deferred tool names. Browser screenshots made the largest share of MCP output.
- **Change** each skill description fits 480 characters, down from 1024. It keeps when the skill fires, the trigger phrases in English and Russian and what it produces. Long lists of steps and examples go. `scripts/check-skills.py` enforces the cap.
- **Result** all descriptions of `agent-skills` and `agent-skills-private` take 17.7k characters, down from 32.2k, about 3.6k tokens less per session.
- **Rule** `workflow.instructions.md` reads pages as text and takes a screenshot only for a visual check, at half scale.
- **Related** the MCP gateway in `agent-skills-private` `specs/mcp-gateway.md` hides the tool names of five local servers.
