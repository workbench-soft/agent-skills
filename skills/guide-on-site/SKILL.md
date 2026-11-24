---
name: guide-on-site
description: 'Use for any task on a site, console or form, such as Google Play Console, AdMob, Cloudflare or a sign-up form, and when the person must log in or pay there: "do it in Play Console", "I am logged in, go on", "сделай на сайте", "я залогинился, дальше". Opens each page in the person''s Chrome unasked, presses each consent, permission and Save button, fills known fields, stops only for a login, CAPTCHA, secret or payment, checks the result, closes its tabs.'
---

# Do the task on a site

A task on a site MUST be done by the agent, to the end, without asking first.
The person MUST step in only for the part their own rules leave them. A
console with an MCP server or a CLI MUST go through that first.

## Steps

1. **Open** the agent MUST open each page in the person's Chrome through
   Claude in Chrome (`mcp__claude-in-chrome__*`) and click through to the
   exact screen. The built-in browser MUST NOT be used.
2. **Fill** the agent MUST fill each field it knows from the repo or the
   task: a name, a URL, a DNS record, a redirect URI, a description.
3. **Press** the agent MUST press each button the task needs itself: Save,
   Submit, Publish, Send for review, Continue, Next.
4. **Consent** the agent MUST press each consent, accept, agree, allow and
   permission prompt on the way, since the person said yes to them in
   advance: terms, cookie banners, OAuth screens, API and account access.
5. **Hand over** only a login, a CAPTCHA, a secret, a payment or an admin
   prompt MUST stop the agent. It MUST name that one step in one line, wait
   for the person, then go on by itself.
6. **Name the tab** each message that sends the person to a tab MUST give its
   title and full address, read from `tabs_context_mcp` once the page loads.
7. **Final state** the agent MUST reload the page and check the result: the
   saved value, the status, the new row. "Check that it saved" MUST NOT go to
   the person.
8. **Close the tab** once the last screen checks out, the agent MUST close
   each tab it opened for the task with `tabs_close_mcp`. The person's own
   tabs MUST stay open.

## Rules

- **No question first** "Shall I open the console?" and "Press Save when
  ready" MUST NOT be asked. The agent MUST do the step and report it.
- **Person's data** a password, a card number or a personal detail MUST stay
  for the person to type. Business data the person's own rules list MAY go
  in through the agent.
- **Hangs** Claude in Chrome hangs on the Google consoles when the PC is
  busy, so the AdMob, AdSense and Google Play MCP servers SHOULD come first.
  A hung page MUST get a reload and a second try before the task goes to
  `TODO.md`.
- **No browser** when the agent can't reach the page, or a step waits past
  the session, the steps MUST go in one script per task,
  `scripts/person-steps/<task>.ps1`. Numbered clicks and several commands
  MUST NOT go to the person.
- **Script** the script MUST run each step a CLI or an API can do, and skip
  each step already done, so a rerun is safe. It MUST open a page with
  `Start-Process <url>` only where no API exists, name the exact button, and
  wait with `Read-Host` only for a login, a CAPTCHA, a secret or a payment.
- **One line** the answer and `TODO.md` MUST give one Windows PowerShell 5.1
  line that runs the script, with no value to fill in. The agent MUST parse
  the file first and check the final state once the person has run it.
