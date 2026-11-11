---
name: hung-process
description: 'Use when a command hangs or something blocks the next run on the Windows PC: no output for 5 minutes, a busy port, EADDRINUSE, EBUSY, a file lock, a Gradle daemon, taskkill Access is denied, a stuck CI runner. Also on "kill it", "the port is taken", "процесс завис", "порт занят". Finds the dev tool holding the port or lock, ends only safe process trees, reruns the step, gives an elevated command when needed, logs a repeat to TODO.md.'
---

# Stop a hung process

An agent MUST find and stop the processes that hang its work. The person
SHOULD only say yes to an admin prompt.

## Steps

1. **Spot** a command MUST count as hung after 5 minutes without new output,
   or when a busy port, a file lock or `EBUSY` blocks the next run.
2. **Find** the agent SHOULD list the dev tools of this worktree and the ones
   without a live parent, and the owner of the port:

   ```powershell
   $dev = 'node.exe', 'java.exe', 'cargo.exe', 'rustc.exe', 'python.exe', 'adb.exe', 'gh.exe'
   Get-CimInstance Win32_Process | Where-Object { $_.Name -in $dev -and ($_.CommandLine -like "*$PWD*" -or -not (Get-Process -Id $_.ParentProcessId -EA 0)) } | Select-Object ProcessId, Name, CommandLine
   Get-NetTCPConnection -LocalPort 5173 -State Listen | Select-Object OwningProcess
   ```

3. **Pick** the agent MAY stop a dev tool, such as `node` or `java`, whose
   command line holds its own worktree path. A dev tool without a live parent
   MAY go only when it holds the port or the lock the step needs, since Git
   Bash and other sessions leave live processes without a parent too. The
   agent MUST NOT stop the person's editor, browser, terminal, a system
   process, the adb server or the Gradle daemon unless it blocks the step.
4. **Stop** the agent MUST end the whole tree with `taskkill /PID <pid> /T /F`,
   then run the step once more. A second hang MUST go in `TODO.md` with the
   command and its last output.
5. **Admin** when `taskkill` answers "Access is denied", or the local CI
   runner service hangs, the agent MUST give the person the elevated command.
   It MUST then check that the process is gone:

   ```powershell
   Start-Process powershell -Verb RunAs -ArgumentList '-NoExit','-Command','taskkill /PID 1234 /T /F'
   Start-Process powershell -Verb RunAs -ArgumentList '-NoExit','-Command','Restart-Service actions.runner.*'
   ```

## Folders held open

- **Gradle** a folder an Android build used SHOULD get `gradlew --stop` before
  its removal, and the shell MUST leave the folder first. Either one holds it
  open on Windows.
- **Long jobs** a job of several hours MUST start outside the agent's process
  tree, with `Invoke-CimMethod Win32_Process -MethodName Create`. A process
  the session started dies when the session restarts.
