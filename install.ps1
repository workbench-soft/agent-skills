# The PowerShell way in on Windows. It runs install.sh with the bash from Git
# for Windows, and installs Git through winget first when it is missing.
# Run it from a clone:
#   git clone https://github.com/workbench-soft/agent-skills; .\agent-skills\install.ps1 -Lang English
param(
  [string]$Lang = "",
  # The spoken end of a turn has its own language, apart from the review text.
  [string]$VoiceLang = "English",
  [switch]$Uninstall,
  [switch]$Yes
)
$ErrorActionPreference = "Stop"

function Get-GitBash {
  # The git-aliases profile wraps git in a function, which has no path.
  $git = Get-Command git -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($git) {
    # bash.exe is in the Git folder's bin\, git.exe in its cmd\ or bin\.
    $bash = Join-Path (Split-Path (Split-Path $git.Source)) "bin\bash.exe"
    if (Test-Path $bash) { return $bash }
  }
  foreach ($dir in @($env:ProgramFiles, ${env:ProgramFiles(x86)}, "$env:LOCALAPPDATA\Programs")) {
    if (-not $dir) { continue }
    $bash = Join-Path $dir "Git\bin\bash.exe"
    if (Test-Path $bash) { return $bash }
  }
  return $null
}

$bash = Get-GitBash
if (-not $bash) {
  if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    throw "Git for Windows is missing. Install it from https://git-scm.com/download/win and run this again."
  }
  Write-Host "Git for Windows is missing, installing it with winget."
  winget install --id Git.Git --exact --source winget --accept-source-agreements --accept-package-agreements
  $bash = Get-GitBash
  if (-not $bash) { throw "Git is installed but bash.exe is not where it should be. Open a new PowerShell and run this again." }
}

$installArgs = @()
if ($Lang) { $installArgs += "--lang", $Lang }
if ($Uninstall) { $installArgs += "--uninstall" }
if ($Yes) { $installArgs += "--yes" }

# Run from a clone, every agent links to that clone. Run alone, it clones the
# repo into ~/.agent-skills.
if ($PSScriptRoot -and (Test-Path (Join-Path $PSScriptRoot "skills"))) {
  $script = Join-Path $PSScriptRoot "install.sh"
} else {
  # A Git fresh from winget isn't on PATH yet, so take the one beside bash.
  $git = Join-Path (Split-Path $bash) "git.exe"
  $root = if ($env:AGENT_SKILLS_DIR) { $env:AGENT_SKILLS_DIR } else { Join-Path $HOME ".agent-skills" }
  if (Test-Path (Join-Path $root ".git")) {
    & $git -C $root pull --ff-only --quiet
    if ($LASTEXITCODE -ne 0) { Write-Warning "could not refresh $root, installing the copy on disk" }
  } else {
    & $git clone --quiet --depth 1 https://github.com/workbench-soft/agent-skills.git $root
    if ($LASTEXITCODE -ne 0) { throw "could not clone the skills into $root" }
  }
  $script = Join-Path $root "install.sh"
}

& $bash $script @installArgs
# throw keeps the window open. exit would close the PowerShell it ran in.
if ($LASTEXITCODE -ne 0) { throw "install.sh failed with exit code $LASTEXITCODE" }

# Claude speaks the end of each turn in -VoiceLang, English unless asked otherwise.
$repoDir = Split-Path $script
& (Join-Path $repoDir "hooks\turn-voice\install.ps1") -Lang $VoiceLang -Uninstall:$Uninstall
