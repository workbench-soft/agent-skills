# Branch rules and what GitHub keeps

Read this when the repo lives on GitHub and step 2 or step 6 needs the branch
rules, or step 10 needs the list of copies GitHub keeps.

## Read the rules

```bash
GH_PAGER=cat gh api "repos/$repo/branches/$default/protection" -q '.allow_force_pushes.enabled' 2>/dev/null
GH_PAGER=cat gh api "repos/$repo/rules/branches/$default" -q '.[].type'
```

- **Protection** a 404 means the branch has none. `false` means it blocks
  force push.
- **Rulesets** a `non_fast_forward` rule blocks force push. `required_signatures`
  means the commit needs `-S`. `required_linear_history` lets the push through.
- **Org rulesets** show up in the second call too. Only an org owner can change
  them, so a block there goes back to the user.

## Lift and put back

- **Protection** flip the one setting through GraphQL, so the rest of the rule
  stays as it is:

```bash
owner=${repo%/*}; name=${repo#*/}
rule=$(GH_PAGER=cat gh api graphql -f owner="$owner" -f name="$name" -f query='
  query($owner:String!,$name:String!){repository(owner:$owner,name:$name){
  branchProtectionRules(first:50){nodes{id pattern}}}}' \
  -q ".data.repository.branchProtectionRules.nodes[] | select(.pattern==\"$default\") | .id")
flip() { GH_PAGER=cat gh api graphql -f id="$rule" -F on="$1" -f query='
  mutation($id:ID!,$on:Boolean!){updateBranchProtectionRule(input:{
  branchProtectionRuleId:$id,allowsForcePushes:$on}){clientMutationId}}'; }
flip true    # before the push
flip false   # right after it
```

- **Ruleset** note the active ones, set each to `disabled` for the push, then
  back to `active`:

```bash
GH_PAGER=cat gh api "repos/$repo/rulesets" -q '.[] | select(.enforcement=="active") | .id'
GH_PAGER=cat gh api -X PUT "repos/$repo/rulesets/<id>" -f enforcement=disabled
GH_PAGER=cat gh api -X PUT "repos/$repo/rulesets/<id>" -f enforcement=active
```

- **Pattern** a rule on a wildcard such as `main*` has its own pattern. Pick
  that rule's id by hand from the query output.
- A change to the rules MUST wait for the user's yes from step 5, since it is
  a repo setting.
- A call failed with 403? The token lacks admin rights. Hand the user the
  Settings path: Settings, Rules or Branches, the rule for the default branch.

## What GitHub keeps after the push

- **PR refs** `refs/pull/<n>/head` of each past PR still points at old
  commits, and the PR pages still show them. These refs can't be deleted.
- **Cached views** an old commit SHA in a URL MAY still open for a while.
- **Forks** keep their own copy of the history.

The full purge is a new repo: delete this one, create it again with the same
name and push the new commit. Issues, PRs, stars, releases and settings go
with it. Offer it only when the user needs the old commits gone from GitHub,
for a leaked secret for example, and put the choice in `TODO.md`. To remove
cached views and PR refs and keep the repo, the owner opens a ticket with
GitHub Support.
