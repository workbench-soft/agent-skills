# Verify the branch

After the last fix, the agent MUST run every step below inside the worktree.

## Checks

- **CI's checks** the agent MUST run each one CI runs: lint, the type check,
  the full test suite.
- **Already red** a check that also fails on the default branch SHOULD be
  named in the report, and is left as it is.

## Build

- **Production** the agent MUST build the output with the repo's own command.
- **Size or speed claims** a fix that claims a gain MUST give the before and
  after numbers, in its commit or in the report.
- **Stable output** what two builds of the same code are meant to share, such
  as a cache version or a hash, SHOULD be built twice and compared.

## Run it

The agent MUST start the built app the way users receive it: the static output
behind a local server, the API on its dev database, the CLI with real
arguments. It MUST run from the worktree with its own free port, database and
emulator, and the user's copy keeps running.

- **Flows** the agent MUST open every changed flow in its browser tool, or
  through the `agent-browser` skill.
- **Console and size** the agent MUST look for console errors, and SHOULD use a
  phone-sized window for a mobile layout.
- **The fixed cases** the agent MUST try what the fixes targeted: the slow
  network, the second tap, the keyboard, reduced motion.
- **Screenshot** a fix that changes what a person sees SHOULD have one in the
  report.
- **Stop** each server and helper started here MUST stop before the report.

## A part with its own toolchain

- **Own tool** the agent MUST build and test it with Gradle, Xcode, cargo or
  whatever it uses.
- **No SDK here** the agent MUST compile and test the parts it can, such as
  `javac` against the stub jars in the Gradle cache, and say so in the report.
- **Needs a device** a part that takes a device, an account or a drive to test
  MUST get a TODO.md line.

## CI

Once the PR is open, the agent MUST wait on its checks:

```bash
GH_PAGER=cat gh pr checks <number> --watch --interval 20
```

A new commit MUST fix a red check, and the wait begins again. When it turns
green, step 8 merges the PR.
