param(
 [Parameter(Mandatory=$true)][string]$PromptFile,
 [Parameter(Mandatory=$true)][string]$ReferenceFile,
 [Parameter(Mandatory=$true)][string]$OutputFile,
 [string]$Size='1536x1024',
 [string]$ProjectDate=[TimeZoneInfo]::ConvertTimeBySystemTimeZoneId([DateTime]::UtcNow,'Russian Standard Time').ToString('yyyy-MM-dd'),
 [switch]$Send
)
$ErrorActionPreference='Stop'
$taskA6Key=$env:A6API_KEY
if (Test-Path -LiteralPath $OutputFile) { throw 'Destination exists; no accepted image overwritten' }
$taskPrompt=Get-Content -LiteralPath $PromptFile -Raw -Encoding UTF8
if ([string]::IsNullOrWhiteSpace($taskPrompt)) { throw 'Empty prompt' }
$taskReference=Get-Item -LiteralPath $ReferenceFile
$taskOutputPath=[System.IO.Path]::GetFullPath($OutputFile)
$taskHeaders=@{Authorization='Bearer '+$taskA6Key;Accept='application/json'}
$taskEndpoint='https://a6.a6api.com/v1/images/edits'
$taskAudit=[ordered]@{
 projectDate=$ProjectDate;startedAt=[DateTime]::UtcNow.ToString('o');endpoint=$taskEndpoint;model='gpt-image-2.5'
 requestCount=1;autoRetries=0;routingMode='Existing account routing; no routing settings modified'
 declaredRouteId=$null;routeVerifiedByResponse=$false;billedCostUsd=$null
 expectedPriceBasis='Latest successful image ledger rows, not a guaranteed quote'
 promptSha256=(Get-FileHash -LiteralPath $PromptFile -Algorithm SHA256).Hash.ToLowerInvariant()
 references=@(@{name=$taskReference.Name;sha256=(Get-FileHash -LiteralPath $ReferenceFile -Algorithm SHA256).Hash.ToLowerInvariant()})
 output=$taskOutputPath;sizeRequested=$Size;dryRun=(-not $Send)
}
if (-not $Send) { $taskAudit | ConvertTo-Json -Depth 6; exit 0 }
if ([string]::IsNullOrWhiteSpace($taskA6Key)) { throw 'A6API credential unavailable; no request made' }
[System.IO.Directory]::CreateDirectory([System.IO.Path]::GetDirectoryName($taskOutputPath)) | Out-Null
try {
 $taskPrice=Invoke-RestMethod -Uri 'https://a6.a6api.com/api/pricing' -Headers $taskHeaders -Method Get -TimeoutSec 25
 $taskModelPrice=@($taskPrice.data | Where-Object { $_.model_name -eq 'gpt-image-2.5' })[0]
 if ($null -eq $taskModelPrice) { throw 'Model missing from current pricing' }
 $taskAudit.currentPublicPrice=@{quotaType=$taskModelPrice.quota_type;modelPrice=$taskModelPrice.model_price;endpointTypes=$taskModelPrice.supported_endpoint_types}
 $taskBefore=Invoke-RestMethod -Uri 'https://a6.a6api.com/api/log/token' -Headers $taskHeaders -Method Get -TimeoutSec 25
 $taskBeforeRows=if ($taskBefore.data -is [System.Array]) { $taskBefore.data } else { $taskBefore.data.items }
 $taskPreviousLatest=($taskBeforeRows | Select-Object -First 1).created_at
 $taskAudit.ledgerBeforeLatestCreatedAt=$taskPreviousLatest
 $taskAudit.phase='image-request-sent'
 $taskAudit | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath ($taskOutputPath+'.audit.json') -Encoding utf8NoBOM
 $taskForm=@{model='gpt-image-2.5';prompt=$taskPrompt;n='1';size=$Size;image=$taskReference}
 $taskResponse=Invoke-RestMethod -Uri $taskEndpoint -Headers $taskHeaders -Method Post -Form $taskForm -TimeoutSec 300 -ResponseHeadersVariable taskImageHeaders
 $taskResult=$taskResponse.data[0]
 if ($taskResult.b64_json) { $taskImageBytes=[Convert]::FromBase64String($taskResult.b64_json) }
 elseif ($taskResult.url) {
  $taskImageUrl=[Uri]$taskResult.url
  if ($taskImageUrl.Scheme -eq 'data') {
   if ($taskResult.url -notmatch '^data:image/[a-z0-9.+-]+;base64,(.+)$') { throw 'Invalid image data URL' }
   $taskImageBytes=[Convert]::FromBase64String($Matches[1])
  } elseif ($taskImageUrl.Scheme -eq 'https') {
   $taskImageResponse=Invoke-WebRequest -Uri $taskImageUrl -Method Get -TimeoutSec 60
   $taskImageBytes=$taskImageResponse.Content
   if ($taskImageBytes -is [string]) { throw 'Image fetch returned text instead of bytes' }
  } else { throw 'Image result requires HTTPS' }
 } else { throw 'A6API response did not contain an image' }
 if ($taskImageBytes.Length -lt 1000) { throw 'Image result unexpectedly small' }
 $taskSignature=[BitConverter]::ToString($taskImageBytes,0,8)
 $taskFormat=if ($taskSignature -eq '89-50-4E-47-0D-0A-1A-0A') {'png'} elseif ($taskSignature.StartsWith('FF-D8-FF')) {'jpg'} elseif ($taskSignature.StartsWith('52-49-46-46')) {'webp'} else { throw 'Unrecognized image bytes' }
 $taskActualPath=[System.IO.Path]::ChangeExtension($taskOutputPath,$taskFormat)
 if (Test-Path -LiteralPath $taskActualPath) { throw 'Actual destination exists' }
 [System.IO.File]::WriteAllBytes($taskActualPath,$taskImageBytes)
 $taskAudit.httpStatus=200;$taskAudit.status='saved-unreviewed';$taskAudit.actualFile=$taskActualPath
 $taskAudit.imageBytes=$taskImageBytes.Length;$taskAudit.imageSha256=(Get-FileHash -LiteralPath $taskActualPath -Algorithm SHA256).Hash.ToLowerInvariant()
 try {
  $taskAfter=Invoke-RestMethod -Uri 'https://a6.a6api.com/api/log/token' -Headers $taskHeaders -Method Get -TimeoutSec 25
  $taskAfterRows=if ($taskAfter.data -is [System.Array]) { $taskAfter.data } else { $taskAfter.data.items }
  $taskNewRows=@($taskAfterRows | Where-Object { $_.created_at -gt $taskPreviousLatest -and $_.model_name -eq 'gpt-image-2.5' -and $_.type -eq 2 })
  $taskAudit.newBilledRows=$taskNewRows.Count
  if ($taskNewRows.Count -eq 1) {
   $taskReceipt=$taskNewRows[0];$taskOther=$taskReceipt.other | ConvertFrom-Json
   $taskAudit.billedQuota=$taskReceipt.quota;$taskAudit.actualChannel=$taskOther.actual_channel_id
   $taskAudit.routeType=$taskOther.route_type;$taskAudit.routeVerifiedByLedger=$true
   $taskBilling=$taskOther.marketplace_per_request_billing
   if ($taskBilling.applied -and $taskBilling.quota_per_unit -gt 0) { $taskAudit.billedCostUsd=[double]$taskReceipt.quota/[double]$taskBilling.quota_per_unit }
  }
 } catch { $taskAudit.ledgerReconciliationRequired=$true }
} catch {
 $taskAudit.status='failed'
 $taskAudit.errorType=$_.Exception.GetType().Name
 if ($_.Exception.Response) { $taskAudit.httpStatus=[int]$_.Exception.Response.StatusCode }
 # Never print raw exceptions or API response bodies; they can contain secrets.
 $taskAudit.error='Image request or save failed; inspect HTTP status and reconcile ledger before retrying'
}
$taskAudit.finishedAt=[DateTime]::UtcNow.ToString('o')
$taskAudit | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath ($taskOutputPath+'.audit.json') -Encoding utf8NoBOM
[ordered]@{status=$taskAudit.status;http=$taskAudit.httpStatus;output=$taskAudit.actualFile;billedCostUsd=$taskAudit.billedCostUsd;actualChannel=$taskAudit.actualChannel;auditPath=$taskOutputPath+'.audit.json';errorType=$taskAudit.errorType} | ConvertTo-Json -Compress
if ($taskAudit.status -eq 'failed') { exit 1 }
