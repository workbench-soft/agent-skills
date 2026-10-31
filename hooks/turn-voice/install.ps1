# Builds turn-voice.exe and adds its Claude Code hooks to ~/.claude/settings.json.
# install.ps1 at the repo root runs it. -Uninstall takes the hooks and the exe out.
param(
  [string]$Lang = "",
  # One multilingual voice reads the whole phrase. Two different voices split it into
  # Russian and English runs, each fetched apart with its own voice.
  [string]$RuVoice = "en-US-AvaMultilingualNeural",
  [string]$EnVoice = "en-US-AvaMultilingualNeural",
  # Hz above or below each voice's own pitch, such as -10.
  [ValidateRange(-100, 100)][int]$RuPitch = 0,
  [ValidateRange(-100, 100)][int]$EnPitch = 0,
  [switch]$Uninstall
)
$ErrorActionPreference = "Stop"

# install.sh reads $env:HOME, and CI points it at a temporary folder. $HOME stays the real profile.
$userHome = if ($env:HOME) { $env:HOME } else { $HOME }
$claude = Join-Path $userHome ".claude"
$settingsPath = Join-Path $claude "settings.json"
$exe = Join-Path $claude "hooks\turn-voice.exe"

function Read-Settings {
  if (-not (Test-Path $settingsPath)) { return [pscustomobject]@{} }
  $text = [IO.File]::ReadAllText($settingsPath)
  if (-not $text.Trim()) { return [pscustomobject]@{} }
  return $text | ConvertFrom-Json
}

function Write-Settings($settings) {
  $json = $settings | ConvertTo-Json -Depth 32
  # Windows PowerShell writes a BOM with -Encoding UTF8, and some JSON readers choke on it.
  [IO.File]::WriteAllText($settingsPath, $json, (New-Object Text.UTF8Encoding $false))
}

# Takes out every hook group that runs turn-voice.exe, and leaves the rest.
function Remove-OwnHooks($settings) {
  if (-not $settings.PSObject.Properties["hooks"]) { return }
  foreach ($event in @($settings.hooks.PSObject.Properties)) {
    $kept = @($event.Value | Where-Object { -not ($_.hooks | Where-Object { $_.command -like "*turn-voice.exe" }) })
    if ($kept.Count -eq 0) { $settings.hooks.PSObject.Properties.Remove($event.Name) }
    else { $settings.hooks.($event.Name) = $kept }
  }
  if (-not @($settings.hooks.PSObject.Properties).Count) { $settings.PSObject.Properties.Remove("hooks") }
}

function New-Group($matcher, $mode, [bool]$async) {
  $hook = [ordered]@{ type = "command"; command = $exe; args = @($mode) + $voiceArgs }
  # Archiving ends the session, so that hook runs to the end before the tool does.
  if ($async) { $hook.async = $true } else { $hook.timeout = 20 }
  $group = [ordered]@{}
  if ($matcher) { $group.matcher = $matcher }
  $group.hooks = @([pscustomobject]$hook)
  return [pscustomobject]$group
}

# The args of the hooks already there: <mode> <lang> <ru voice> <en voice> <edge-tts> [<ru pitch> <en pitch>].
function Get-OwnArgs($settings) {
  if (-not $settings.PSObject.Properties["hooks"]) { return $null }
  foreach ($event in @($settings.hooks.PSObject.Properties)) {
    foreach ($group in @($event.Value)) {
      foreach ($hook in @($group.hooks)) {
        if ($hook.command -like "*turn-voice.exe" -and @($hook.args).Count -ge 4) { return @($hook.args) }
      }
    }
  }
  return $null
}

if (-not (Test-Path $claude)) { return }
$settings = Read-Settings
# The root install.ps1 passes no voice or pitch, so the ones picked by hand stay.
$kept = Get-OwnArgs $settings
if ($kept) {
  if (-not $PSBoundParameters.ContainsKey("RuVoice")) { $RuVoice = $kept[2] }
  if (-not $PSBoundParameters.ContainsKey("EnVoice")) { $EnVoice = $kept[3] }
  if (-not $PSBoundParameters.ContainsKey("RuPitch") -and $kept.Count -ge 7) { $RuPitch = [int]($kept[5] -replace "Hz$") }
  if (-not $PSBoundParameters.ContainsKey("EnPitch") -and $kept.Count -ge 7) { $EnPitch = [int]($kept[6] -replace "Hz$") }
}
Remove-OwnHooks $settings

if ($Uninstall) {
  Write-Settings $settings
  if (Test-Path $exe) { Remove-Item $exe -Force }
  return
}

# Every Windows 10 and 11 ships this compiler with .NET Framework 4.
$csc = Join-Path $env:WINDIR "Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if (-not (Test-Path $csc)) {
  Write-Warning "turn-voice: .NET Framework 4 is missing, so the agent stays silent."
  return
}
New-Item -ItemType Directory -Force (Split-Path $exe) | Out-Null
# A hook still playing holds the exe. Windows lets a running exe be renamed, so it moves aside.
Get-ChildItem (Split-Path $exe) -Filter "turn-voice.old*.exe" -ErrorAction SilentlyContinue | ForEach-Object {
  try { Remove-Item $_.FullName -Force -ErrorAction Stop } catch { }
}
if (Test-Path $exe) {
  try { Remove-Item $exe -Force -ErrorAction Stop }
  catch { Rename-Item $exe ("turn-voice.old" + (Get-Random) + ".exe") }
}
& $csc /nologo /target:winexe /codepage:65001 "/out:$exe" (Join-Path $PSScriptRoot "turn-voice.cs")
if ($LASTEXITCODE -ne 0) { throw "turn-voice: csc failed with exit code $LASTEXITCODE" }

# "рус" is spelled with char codes, since Windows PowerShell reads a script without a BOM as ANSI.
$rus = -join @([char]0x0440, [char]0x0443, [char]0x0441)
$voice = if ($Lang -match "^(ru|$rus)") { "ru" } else { "en" }
$voiceArgs = @($voice)

# edge-tts gives the free Microsoft neural voices. It goes through mise, and CI skips it,
# since mise keeps its global config outside the temporary HOME.
if (-not $env:CI -and (Get-Command mise -ErrorAction SilentlyContinue)) {
  & mise use -g --quiet uv@0.9 pipx:edge-tts@7.3.1 2>$null | Out-Null
  $tts = "$(& mise which edge-tts 2>$null)".Trim()
  if ($tts -and (Test-Path $tts)) {
    $voiceArgs += $RuVoice, $EnVoice, $tts
    # edge-tts takes a signed pitch such as +0Hz or -10Hz.
    if ($RuPitch -or $EnPitch) { $voiceArgs += ($RuPitch.ToString("+0;-0;+0") + "Hz"), ($EnPitch.ToString("+0;-0;+0") + "Hz") }
  } else {
    Write-Warning "turn-voice: edge-tts is missing, so only the cues play."
  }
}

if (-not $settings.PSObject.Properties["hooks"]) {
  $settings | Add-Member -NotePropertyName hooks -NotePropertyValue ([pscustomobject]@{})
}
$own = [ordered]@{
  Stop = New-Group $null "stop" $true
  StopFailure = New-Group $null "fail" $true
  Notification = New-Group "permission_prompt" "ask" $true
  PreToolUse = @(
    (New-Group "AskUserQuestion" "ask" $true),
    (New-Group "mcp__ccd_session_mgmt__archive_session" "archive" $false)
  )
}
foreach ($name in $own.Keys) {
  $existing = if ($settings.hooks.PSObject.Properties[$name]) { @($settings.hooks.$name) } else { @() }
  $all = @($existing) + @($own[$name])
  if ($settings.hooks.PSObject.Properties[$name]) { $settings.hooks.$name = $all }
  else { $settings.hooks | Add-Member -NotePropertyName $name -NotePropertyValue $all }
}
Write-Settings $settings
Write-Host "turn-voice: Claude speaks the end of each turn in $voice."
