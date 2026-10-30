# Part 1: what this change is about

A reader new to this product and this code MUST be able to follow it. Use three
`###` headings with one or two sentences under each:

- **Before**, what was wrong or missing, the way a person would notice it.
- **Now**, what happens in its place.
- **Where**, the spot in the product where it shows.

File names, type names and function names MUST stay out. Can't tell which
problem the change solves? Say that first, then ask. A guess here spoils
the rest of the report.

```markdown
## What this change is about

### Before

The Save button on the profile page wiped the name field before the server had
agreed to store the new name. A failed save lost the typed name, with no message on
screen explaining why.

### Now

The text stays until the server confirms, and comes back if the save failed.

### Where

Settings, the Profile tab, the Save button.
```
