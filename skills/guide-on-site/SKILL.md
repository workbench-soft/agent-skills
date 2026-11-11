---
name: guide-on-site
description: 'Use when a site, console or form needs the person for a login, secret, CAPTCHA or payment: "walk me through it", "help me set this up in the console", "I am logged in, go on", "проведи меня по сайту", "я залогинился, дальше". Opens each page in the person''s Chrome, clicks to the exact screen, fills the known fields, stops at the one step only the person can do and names it, checks the result, moves on, and closes its tabs at the end.'
---

# Guide the person on a site

When a site setting needs the person, the agent MUST lead them through it in
their Chrome, screen by screen. A console with an MCP server or a CLI MUST go
through that first.

## Steps

1. **Open** the agent MUST open each page in the person's Chrome through
   Claude in Chrome (`mcp__claude-in-chrome__*`) and click through to the
   exact screen. The built-in browser MUST NOT be used.
2. **Pre-fill** the agent MUST fill each field it knows from the repo or the
   task: a name, a URL, a DNS record, a redirect URI, a description.
3. **Hand over** the agent MUST stop at the part only the person can do, and
   name it in one line: the login, the secret or the field to type. The agent
   MUST press each button itself, such as Save, Submit and Continue.
4. **Name the tab** each message that sends the person to a tab MUST give its
   title and full address, read from `tabs_context_mcp` once the page loads.
5. **Next screen** once the person says it is done, the agent MUST check the
   page and open the next screen itself.
6. **Close the tab** once the last screen checks out, the agent MUST close
   each tab it opened for the step with `tabs_close_mcp`. The person's own
   tabs MUST stay open.

## Rules

- **Person's data** a password, a card number or a personal detail MUST stay
  for the person to type. Business data the person's own rules list MAY go
  in through the agent.
- **No browser** when the agent can't reach the page, the steps MUST be
  numbered, one action each, with the link and the exact button text, plain
  enough for a child of 3.
- **Hangs** Claude in Chrome hangs on the Google consoles when the PC is
  busy, so the AdMob, AdSense and Google Play MCP servers SHOULD come first.
