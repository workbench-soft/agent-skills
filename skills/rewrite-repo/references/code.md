# Renames and syntax per language

Steps 6 and 7 of `rewrite-repo` MUST read this file.

## Rename tools

The agent SHOULD rename with a tool that understands the language, since it
updates each use, imports and re-exports too. A text replace skips dynamic
uses and catches strings by mistake. The table names the tool, and the
`ts-morph` script below SHOULD serve for TypeScript:

| Language               | Tool                                                                   |
| ---------------------- | ---------------------------------------------------------------------- |
| TypeScript, JavaScript | `ts-morph` script, or the editor's Rename Symbol through the TS server |
| Python                 | `rope`, or the editor's rename through Pyright or Jedi                 |
| Go                     | `gopls rename`, `gofmt -r` for patterns                                |
| Rust                   | `rust-analyzer` rename                                                 |
| Java, Kotlin           | the IDE rename, OpenRewrite recipes                                    |
| C#                     | `dotnet format`, the IDE rename through Roslyn                         |
| Shell, Markdown        | `git grep -nw` then edit each hit                                      |

```ts
import { Project } from "ts-morph";
const project = new Project({ tsConfigFilePath: "tsconfig.json" });
project.getSourceFileOrThrow("src/a.ts").getFunctionOrThrow("loadUsers").rename("fetchAccounts");
await project.save();
```

## Names text search misses

Once a rename is done, the agent MUST also grep these spots for the old name:

- **Strings** the agent MUST check reflection, `getattr`, dependency injection
  keys, route names.
- **Config** the agent MUST check `package.json` scripts, CI paths, Docker
  files, globs.
- **Tests** the agent MUST check snapshot files, fixture names, mocks that
  patch by path.
- **Docs** the agent MUST check the README, comments, links into the code.

## Syntax moves

The agent MUST use only forms that the target runtime and the lint rules
accept. It MUST look up the version in the manifest first: `engines`,
`requires-python`, `go.mod`. Each old form SHOULD become its new form:

| Language | Old form                         | New form                    |
| -------- | -------------------------------- | --------------------------- |
| JS, TS   | `var`, `function` callbacks      | `const`, arrow functions    |
| JS, TS   | `.then()` chains                 | `async` and `await`         |
| JS, TS   | `for (let i...)` over an array   | `for...of`, `map`, `filter` |
| JS, TS   | `a && a.b`, `a !== null ? a : b` | `a?.b`, `a ?? b`            |
| JS, TS   | string `+` joins                 | template literals           |
| JS, TS   | `require`, `module.exports`      | `import`, `export`          |
| Python   | `%` and `.format()`              | f-strings                   |
| Python   | `os.path`                        | `pathlib`                   |
| Python   | `if` chains on one value         | `match`                     |
| Python   | untyped functions                | type hints, `dataclass`     |
| Go       | `interface{}`                    | `any`, generics             |
| Java     | anonymous classes                | lambdas, `record`, `var`    |
| C#       | full classes for data            | `record`, pattern matching  |

## Moves that change behaviour

These pass for syntax but alter what runs. Each MUST go through the fix step
with a test of its own:

- **`||` to `??`** MUST count as a fix, since `0` and `""` get through now.
- **Loop to `forEach`** MUST count as a fix, since an `await` inside stops
  waiting.
- **`==` to `===`** MUST count as a fix, since `null == undefined` used to be
  true.
- **`function` to arrow** MUST count as a fix, since `this` and `arguments`
  now come from the outer scope.
- **Sync to async** MUST count as a fix, since callers receive a promise now.
