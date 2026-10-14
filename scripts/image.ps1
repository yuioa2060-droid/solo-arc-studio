param(
 [Parameter(Mandatory=$true)][string]$PromptFile,
 [Parameter(Mandatory=$true)][string]$ReferenceFile,
 [Parameter(Mandatory=$true)][string]$OutputFile,
 [string[]]$AdditionalReferences=@(),
 [string]$Size='1536x864',
 [switch]$Send
)
$ErrorActionPreference='Stop'
$taskRepoRoot=Split-Path $PSScriptRoot -Parent
$taskEnvPath=Join-Path $taskRepoRoot '.env'
if(!$env:A6API_KEY -and (Test-Path -LiteralPath $taskEnvPath)) {
 foreach($taskEnvLine in [IO.File]::ReadAllLines($taskEnvPath)) {
  if($taskEnvLine -match '^\s*A6API_KEY\s*=\s*(.+?)\s*$') {
   $env:A6API_KEY=$Matches[1].Trim().Trim('"').Trim("'")
  }
 }
}
& (Join-Path $taskRepoRoot 'skills/solo-arc-motion/scripts/a6api-windows.ps1') -PromptFile $PromptFile -ReferenceFile $ReferenceFile -OutputFile $OutputFile -AdditionalReferences $AdditionalReferences -Size $Size -Send:$Send
