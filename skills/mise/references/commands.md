# What mise replaces

The agent MUST read this when a command would install a tool, set a version or
load env vars without mise. It MUST run the mise command in the right column:

| Instead of                                            | Run                                                              |
| ----------------------------------------------------- | ---------------------------------------------------------------- |
| `nvm use 22`, `fnm use`, `volta install node`         | `mise use node@22`                                               |
| `npm i -g pnpm`, `corepack enable`                    | `mise use pnpm@9`                                                |
| `pyenv install 3.12`                                  | `mise use python@3.12`                                           |
| `brew install jq`, `winget install jqlang.jq`         | `mise use jq@1.7`                                                |
| `npm i -g <cli>`, `npx <cli>` outside the repo's deps | `mise use npm:<cli>`, or once `mise x npm:<cli> -- <cli>`        |
| `pipx install ruff`, `uvx ruff`                       | `mise use pipx:ruff`, or once `mise x pipx:ruff -- ruff`         |
| `cargo install <crate>`                               | `mise use cargo:<crate>`                                         |
| `go install <module>@latest`                          | `mise use go:<module>`                                           |
| a binary from a GitHub release                        | `mise use github:<owner>/<repo>`                                 |
| `asdf install`                                        | `mise install`                                                   |
| `npm run test`, `make test` with a mise task `test`   | `mise run test`                                                  |
| `source .env`                                         | `[env]` with `_.file = ".env"` in `mise.toml`                    |
| `python -m venv .venv`                                | `[env]` with `_.python.venv = { path = ".venv", create = true }` |
| nodemon, entr                                         | `mise watch <task>`                                              |

- **Repo deps** a CLI the repo lists as a dependency MUST run through its
  package manager inside mise: `mise x -- pnpm exec oxlint`.
- **direnv** a repo that keeps `.envrc` SHOULD keep it. `mise.toml` SHOULD
  take new env vars only.

## CI

A workflow SHOULD install the tools from `mise.toml` with `jdx/mise-action`,
in place of `actions/setup-node`, `setup-python`, `setup-go` and
`setup-java`. The action MUST be pinned to a commit SHA:

```yaml
- uses: jdx/mise-action@<sha>
- run: mise run test
```
