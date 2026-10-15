[CmdletBinding()]
param(
 [ValidateSet('gpt','nano','gpt-image-2.5','nano-banana-2.1')][string]$Model='nano',
 [Parameter(Mandatory=$true)][string]$PromptFile,
 [Parameter(Mandatory=$true)][string]$OutputFile,
 [string[]]$ReferenceFiles=@(),
 [string]$Size='1536x1024',
 [string]$EnvFile,
 [switch]$Send
)
$ErrorActionPreference='Stop'
$taskModel=if($Model -eq 'nano'){'nano-banana-2.1'}elseif($Model -eq 'gpt'){'gpt-image-2.5'}else{$Model}
$taskProfile=Get-Content -LiteralPath (Join-Path $PSScriptRoot '../references/profile.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$taskSetting=$taskProfile.models.$taskModel
$taskKey=$env:A6API_KEY
if(!$EnvFile){$EnvFile=Join-Path ([Environment]::GetFolderPath('UserProfile')) '.codex/secrets/a6api.env'}
if(!$taskKey -and (Test-Path -LiteralPath $EnvFile)){
 foreach($taskLine in [IO.File]::ReadAllLines($EnvFile)){
  if($taskLine -match '^\s*A6API_KEY\s*=\s*(.+?)\s*$'){$taskKey=$Matches[1].Trim().Trim('"').Trim("'")}
 }
}
$taskPrompt=[IO.File]::ReadAllText((Resolve-Path -LiteralPath $PromptFile).Path,[Text.Encoding]::UTF8)
if([string]::IsNullOrWhiteSpace($taskPrompt)){throw 'Empty image prompt'}
$taskOutput=[IO.Path]::GetFullPath($OutputFile)
foreach($taskExt in @('.png','.jpg','.webp')){if(Test-Path -LiteralPath ([IO.Path]::ChangeExtension($taskOutput,$taskExt))){throw 'Output already exists; choose a new filename'}}
$taskRefs=@($ReferenceFiles | ForEach-Object {Get-Item -LiteralPath $_})
if(@($taskRefs | Where-Object {$_.Extension.ToLowerInvariant() -notin @('.png','.jpg','.jpeg','.webp')}).Count){throw 'References must be PNG, JPEG or WebP files'}
$taskUseChat=$taskModel -eq 'nano-banana-2.1' -or $taskSetting.api_format -eq 'chat'
$taskEndpoint=if($taskUseChat){'/chat/completions'}elseif($taskRefs.Count){'/images/edits'}else{'/images/generations'}
$taskAudit=[ordered]@{
 startedAt=[DateTime]::UtcNow.ToString('o');model=$taskModel;endpoint=$taskProfile.base_url+$taskEndpoint
 dryRun=(-not $Send);paidRequestsSent=0;automaticRetries=0;expectedChannel=$taskSetting.channel_id
 listedPriceUsd=$taskSetting.listed_usd_per_request;priceObservationDate=$taskProfile.verified_date
 promptSha256=(Get-FileHash -LiteralPath $PromptFile -Algorithm SHA256).Hash.ToLowerInvariant()
 references=@($taskRefs | ForEach-Object {@{name=$_.Name;sha256=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()}})
 sizeRequested=$Size;keyAvailable=(-not [string]::IsNullOrWhiteSpace($taskKey));billedCostUsd=$null;actualChannel=$null;ledgerReconciliationRequired=$false
}
if(!$Send){$taskAudit | ConvertTo-Json -Depth 6;exit 0}
if([string]::IsNullOrWhiteSpace($taskKey)){throw 'A6API key unavailable; configure the private env file. No request sent.'}
[IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($taskOutput)) | Out-Null
$taskAuditFile=$taskOutput+'.audit.json'
$taskHeaders=@{Authorization='Bearer '+$taskKey;Accept='application/json'}
function Read-TaskLedger {
 $taskLedgerResponse=Invoke-RestMethod -Uri 'https://a6.a6api.com/api/log/token' -Headers $taskHeaders -TimeoutSec 25
 if(!$taskLedgerResponse.success){throw 'Read-only ledger authentication failed'}
 if($taskLedgerResponse.data -is [Array]){return @($taskLedgerResponse.data)}
 return @($taskLedgerResponse.data.items)
}
function Write-TaskAudit {$taskAudit | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $taskAuditFile -Encoding utf8NoBOM}
function Get-TaskLedgerIdentity($taskRow) {
 $taskDetails=$taskRow.other | ConvertFrom-Json
 if($taskDetails.marketplace_per_request_billing.request_id){return [string]$taskDetails.marketplace_per_request_billing.request_id}
 return ([string]$taskRow.created_at+'|'+[string]$taskRow.model_name+'|'+[string]$taskRow.quota)
}
function Get-TaskImageCandidate($taskResponse) {
 if($taskResponse.data -and $taskResponse.data[0].b64_json){return 'data:image/png;base64,'+$taskResponse.data[0].b64_json}
 if($taskResponse.data -and $taskResponse.data[0].url){return [string]$taskResponse.data[0].url}
 $taskMessage=$taskResponse.choices[0].message
 foreach($taskImage in @($taskMessage.images)){
  if($taskImage.image_url.url){return [string]$taskImage.image_url.url}
  if($taskImage.url){return [string]$taskImage.url}
 }
 foreach($taskPart in @($taskMessage.content)){
  if($taskPart.image_url.url){return [string]$taskPart.image_url.url}
  if($taskPart.inline_data.data){return 'data:'+([string]$taskPart.inline_data.mime_type)+';base64,'+([string]$taskPart.inline_data.data)}
 }
 $taskMessageText=if($taskMessage.content -is [string]){$taskMessage.content}else{(@($taskMessage.content | ForEach-Object {$_.text}) -join "`n")}
 if($taskMessageText -match 'data:image/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=\r\n]+'){return $Matches[0]}
 if($taskMessageText -match '!\[[^\]]*\]\((https://[^\s)]+)\)'){return $Matches[1]}
 if($taskMessageText -match 'https://[^\s<>"\)]+'){return $Matches[0]}
 throw 'API response contained no supported image payload; inspect audit and billing before another request.'
}
$taskTimer=[Diagnostics.Stopwatch]::StartNew();$taskBefore=@();$taskFailed=$false
try {
 $taskBefore=@(Read-TaskLedger);$taskBeforeIds=@($taskBefore | ForEach-Object {Get-TaskLedgerIdentity $_})
 if($taskUseChat){
  $taskContent=@(@{type='text';text=$taskPrompt+"`nRequested image canvas: $Size."})
  foreach($taskRef in $taskRefs){
   $taskMime=if($taskRef.Extension.ToLowerInvariant() -in @('.jpg','.jpeg')){'image/jpeg'}elseif($taskRef.Extension -eq '.webp'){'image/webp'}else{'image/png'}
   $taskContent+=@{type='image_url';image_url=@{url='data:'+$taskMime+';base64,'+[Convert]::ToBase64String([IO.File]::ReadAllBytes($taskRef.FullName))}}
  }
  $taskBody=@{model=$taskModel;stream=$false;messages=@(@{role='user';content=$taskContent})} | ConvertTo-Json -Depth 8 -Compress
 }elseif(!$taskRefs.Count){$taskBody=@{model=$taskModel;prompt=$taskPrompt;n=1;size=$Size} | ConvertTo-Json -Compress}
 $taskAudit.paidRequestsSent=1;$taskAudit.phase='request-sent';Write-TaskAudit
 if($taskRefs.Count -and !$taskUseChat){
  $taskForm=@{model=$taskModel;prompt=$taskPrompt;n='1';size=$Size}
  if($taskRefs.Count -eq 1){$taskForm.image=$taskRefs[0]}else{$taskForm['image[]']=$taskRefs}
  $taskResponse=Invoke-RestMethod -Uri $taskAudit.endpoint -Headers $taskHeaders -Method Post -Form $taskForm -TimeoutSec 360
 }else{
  $taskResponse=Invoke-RestMethod -Uri $taskAudit.endpoint -Headers $taskHeaders -Method Post -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($taskBody)) -TimeoutSec 360
 }
 $taskAudit.responseSeconds=[Math]::Round($taskTimer.Elapsed.TotalSeconds,2)
 $taskRecoveryDir=Join-Path ([Environment]::GetFolderPath('UserProfile')) '.codex/cache/a6-image-responses'
 [IO.Directory]::CreateDirectory($taskRecoveryDir) | Out-Null
 $taskRecoveryFile=Join-Path $taskRecoveryDir (([Guid]::NewGuid().ToString('N'))+'.json')
 $taskResponse | ConvertTo-Json -Depth 30 -Compress | Set-Content -LiteralPath $taskRecoveryFile -Encoding utf8NoBOM
 $taskAudit.privateResponseCache=$taskRecoveryFile
 if($taskResponse.error){
  $taskAudit.failureCode=[string]$taskResponse.error.code
  $taskResponseError=([string]$taskResponse.error.message).Replace($taskKey,'[redacted]') -replace 'sk-[A-Za-z0-9_-]+','[redacted]'
  if($taskResponseError.Length -gt 400){$taskResponseError=$taskResponseError.Substring(0,400)}
  $taskAudit.safeFailureMessage=$taskResponseError
  throw 'Provider returned an error inside an HTTP success response; inspect billing before another request.'
 }
 $taskCandidate=Get-TaskImageCandidate $taskResponse
 if($taskCandidate -match '^data:image/[a-z0-9.+-]+;base64,([\s\S]+)$'){$taskBytes=[Convert]::FromBase64String($Matches[1])}
 else{
  if(([Uri]$taskCandidate).Scheme -ne 'https'){throw 'Image download requires HTTPS'}
  $taskDownload=Invoke-WebRequest -Uri $taskCandidate -TimeoutSec 120
  if($taskDownload.Content -is [string]){throw 'Image URL returned text'}
  $taskBytes=$taskDownload.Content
 }
 if($taskBytes.Length -lt 1000){throw 'Image payload unexpectedly small'}
 $taskMagic=[BitConverter]::ToString($taskBytes,0,8)
 $taskExtension=if($taskMagic -eq '89-50-4E-47-0D-0A-1A-0A'){'.png'}elseif($taskMagic.StartsWith('FF-D8-FF')){'.jpg'}elseif($taskMagic.StartsWith('52-49-46-46') -and [Text.Encoding]::ASCII.GetString($taskBytes,8,4) -eq 'WEBP'){'.webp'}else{throw 'Unsupported image signature'}
 $taskActual=[IO.Path]::ChangeExtension($taskOutput,$taskExtension)
 if(Test-Path -LiteralPath $taskActual){throw 'Actual output already exists'}
 [IO.File]::WriteAllBytes($taskActual,$taskBytes)
 $taskAudit.status='saved-unreviewed';$taskAudit.output=$taskActual;$taskAudit.imageBytes=$taskBytes.Length
 $taskAudit.imageSha256=(Get-FileHash -LiteralPath $taskActual -Algorithm SHA256).Hash.ToLowerInvariant()
}catch{
 $taskFailed=$true;$taskFailure=$_;$taskAudit.status='failed';$taskAudit.errorType=$taskFailure.Exception.GetType().Name
 if($taskFailure.Exception.Response){$taskAudit.httpStatus=[int]$taskFailure.Exception.Response.StatusCode}
 try{
  $taskFailureBody=$taskFailure.ErrorDetails.Message | ConvertFrom-Json
  $taskAudit.failureCode=$taskFailureBody.error.code
  $taskSafeMessage=if($taskFailureBody.error.message){[string]$taskFailureBody.error.message}else{[string]$taskFailureBody.message}
  $taskSafeMessage=$taskSafeMessage.Replace($taskKey,'[redacted]') -replace 'sk-[A-Za-z0-9_-]+','[redacted]'
  if($taskSafeMessage.Length -gt 400){$taskSafeMessage=$taskSafeMessage.Substring(0,400)}
  $taskAudit.safeFailureMessage=$taskSafeMessage
 }catch{}
}
if($taskAudit.paidRequestsSent -gt 0){
 try{
  $taskAfter=@(Read-TaskLedger)
  $taskNewRows=@($taskAfter | Where-Object {$_.type -eq 2 -and $_.model_name -eq $taskModel -and (Get-TaskLedgerIdentity $_) -notin $taskBeforeIds})
  $taskAudit.newBilledRows=$taskNewRows.Count
  if($taskNewRows.Count -eq 1){
   $taskRow=$taskNewRows[0];$taskOther=$taskRow.other | ConvertFrom-Json
   $taskAudit.actualChannel=$taskOther.actual_channel_id;$taskAudit.ledgerId=$taskRow.id
   $taskBilling=$taskOther.marketplace_per_request_billing
   if($taskBilling.applied -and $taskBilling.quota_per_unit -gt 0){$taskAudit.billedCostUsd=[double]$taskRow.quota/[double]$taskBilling.quota_per_unit}
   else{$taskAudit.ledgerReconciliationRequired=$true}
  }else{$taskAudit.ledgerReconciliationRequired=$true}
 }catch{$taskAudit.ledgerReconciliationRequired=$true}
}
$taskAudit.totalSeconds=[Math]::Round($taskTimer.Elapsed.TotalSeconds,2);$taskAudit.finishedAt=[DateTime]::UtcNow.ToString('o');Write-TaskAudit
[ordered]@{status=$taskAudit.status;model=$taskModel;output=$taskAudit.output;responseSeconds=$taskAudit.responseSeconds;totalSeconds=$taskAudit.totalSeconds;billedCostUsd=$taskAudit.billedCostUsd;actualChannel=$taskAudit.actualChannel;expectedChannel=$taskAudit.expectedChannel;ledgerReconciliationRequired=$taskAudit.ledgerReconciliationRequired;failureCode=$taskAudit.failureCode;safeFailureMessage=$taskAudit.safeFailureMessage;audit=$taskAuditFile} | ConvertTo-Json -Compress
if($taskFailed){exit 1}
