import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createHash,randomUUID} from 'node:crypto';

const here=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(here,'../../..');
const profile=JSON.parse(await fs.readFile(path.join(here,'../references/profile.json'),'utf8'));
const argv=process.argv.slice(2),flags=new Set(['--send']),allowed=new Set(['--model','--prompt-file','--out','--reference','--size','--env-file']);
const opts={reference:[],model:'nano',size:'1536x1024'};
for(let i=0;i<argv.length;i++) {
 const arg=argv[i];
 if(flags.has(arg)){opts.send=true;continue;}
 if(!allowed.has(arg)||!argv[i+1]||argv[i+1].startsWith('--'))throw Error('Unknown or incomplete option: '+arg);
 const value=argv[++i];
 if(arg==='--reference')opts.reference.push(value);else opts[arg.slice(2)]=value;
}
if(!opts['prompt-file']||!opts.out)throw Error('Required: --prompt-file PATH --out PATH. Add --send only for an authorized generation.');
const model=({nano:'nano-banana-2.1',gpt:'gpt-image-2.5'})[opts.model]||opts.model;
if(!['nano-banana-2.1','gpt-image-2.5'].includes(model))throw Error('Choose nano-banana-2.1 or gpt-image-2.5.');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const promptBytes=await fs.readFile(path.resolve(opts['prompt-file']));
const prompt=promptBytes.toString('utf8').replace(/^\uFEFF/,'');
if(!prompt.trim())throw Error('Empty image prompt.');
let key=process.env.A6API_KEY;
const envPaths=opts['env-file']?[path.resolve(opts['env-file'])]:[path.join(repo,'.env'),path.join(os.homedir(),'.codex/secrets/a6api.env')];
for(const envPath of envPaths) {
 if(key)break;
 try {
  const text=await fs.readFile(envPath,'utf8');
  for(const line of text.split(/\r?\n/)) {
   const match=line.match(/^\s*A6API_KEY\s*=\s*(.+?)\s*$/);
   if(match)key=match[1].replace(/^(['"])(.*)\1$/,'$2');
  }
 } catch(error) {if(error.code!=='ENOENT')throw Error('Unable to read the configured private env file.');}
}
const out=path.resolve(opts.out),stem=out.replace(/\.[^./\\]+$/,'');
for(const ext of ['png','jpg','webp']) {
 try {await fs.access(stem+'.'+ext);throw Error('Output already exists; choose another filename.');}
 catch(error){if(error.code!=='ENOENT')throw error;}
}
const references=[];
for(const file of opts.reference) {
 const absolute=path.resolve(file),ext=path.extname(absolute).toLowerCase();
 const mime=({'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp'})[ext];
 if(!mime)throw Error('References must be PNG, JPEG or WebP.');
 const bytes=await fs.readFile(absolute);
 if(bytes.length<1000)throw Error('Reference is too small or an unfetched Git LFS pointer.');
 references.push({name:path.basename(absolute),mime,bytes,sha256:sha(bytes)});
}
const chat=model==='nano-banana-2.1';
const endpoint=profile.base_url+(chat?'/chat/completions':references.length?'/images/edits':'/images/generations');
const audit={startedAt:new Date().toISOString(),model,endpoint,dryRun:!opts.send,paidRequestsSent:0,automaticClientRetries:0,
 expectedChannel:profile.models[model]?.channel_id??null,priceObservationDate:profile.verified_date,
 listedPriceUsd:profile.models[model]?.listed_usd_per_request??null,promptSha256:sha(promptBytes),
 references:references.map(({name,sha256})=>({name,sha256})),sizeRequested:opts.size,keyAvailable:!!key,
 billedCostUsd:null,actualChannel:null,ledgerReconciliationRequired:false};
if(!opts.send){console.log(JSON.stringify(audit,null,2));process.exit(0);}
if(!key)throw Error('A6API key unavailable; configure private runtime env. No request sent.');
await fs.mkdir(path.dirname(out),{recursive:true});
const auditPath=out+'.audit.json',start=performance.now();
const saveAudit=()=>fs.writeFile(auditPath,JSON.stringify(audit,null,2)+'\n');
const clean=value=>String(value??'').split(key).join('[redacted]').replace(/sk-[A-Za-z0-9_-]+/g,'[redacted]').slice(0,400);
const details=row=>{try{return typeof row.other==='string'?JSON.parse(row.other):row.other||{};}catch{return {};}};
const identity=row=>details(row).marketplace_per_request_billing?.request_id||`${row.created_at}|${row.model_name}|${row.quota}`;
const ledger=async()=>{
 const response=await fetch('https://a6.a6api.com/api/log/token',{headers:{Authorization:'Bearer '+key},signal:AbortSignal.timeout(25000)});
 const body=await response.json();
 if(!response.ok||!body.success)throw Error('Read-only billing ledger unavailable.');
 return Array.isArray(body.data)?body.data:body.data?.items||[];
};
function candidate(body) {
 if(body.data?.[0]?.b64_json)return 'data:image/png;base64,'+body.data[0].b64_json;
 if(body.data?.[0]?.url)return body.data[0].url;
 const message=body.choices?.[0]?.message||{};
 for(const item of message.images||[])if(item.image_url?.url||item.url)return item.image_url?.url||item.url;
 for(const item of Array.isArray(message.content)?message.content:[]) {
  if(item.image_url?.url)return item.image_url.url;
  if(item.inline_data?.data)return `data:${item.inline_data.mime_type};base64,${item.inline_data.data}`;
 }
 const text=typeof message.content==='string'?message.content:(message.content||[]).map(item=>item.text||'').join('\n');
 return text.match(/data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=\r\n]+/i)?.[0]||
  text.match(/!\[[^\]]*\]\((https:\/\/[^\s)]+)\)/)?.[1]||text.match(/https:\/\/[^\s<>"\)]+/)?.[0];
}
let before=new Set(),failed=false;
try {
 before=new Set((await ledger()).map(identity));
 let body,headers={Authorization:'Bearer '+key,Accept:'application/json'};
 if(chat) {
  const content=[{type:'text',text:prompt+`\nRequested image canvas: ${opts.size}.`},...references.map(ref=>({type:'image_url',image_url:{url:`data:${ref.mime};base64,${ref.bytes.toString('base64')}`}}))];
  body=JSON.stringify({model,stream:false,messages:[{role:'user',content}]});headers['Content-Type']='application/json';
 } else if(references.length) {
  body=new FormData();body.set('model',model);body.set('prompt',prompt);body.set('n','1');body.set('size',opts.size);
  for(const ref of references)body.append(references.length===1?'image':'image[]',new Blob([ref.bytes],{type:ref.mime}),ref.name);
 } else {body=JSON.stringify({model,prompt,n:1,size:opts.size});headers['Content-Type']='application/json';}
 audit.paidRequestsSent=1;audit.phase='request-sent';await saveAudit();
 const response=await fetch(endpoint,{method:'POST',headers,body,signal:AbortSignal.timeout(360000)});
 const raw=await response.text();audit.responseSeconds=Math.round((performance.now()-start)/10)/100;audit.httpStatus=response.status;
 let result;
 try{result=JSON.parse(raw);}catch{throw Error('API returned a non-JSON response; inspect billing before another request.');}
 if(response.ok) {
  const dir=path.join(os.homedir(),'.codex/cache/a6-image-responses');await fs.mkdir(dir,{recursive:true});
  audit.privateResponseCache=path.join(dir,randomUUID()+'.json');await fs.writeFile(audit.privateResponseCache,raw,{mode:0o600});
 }
 if(!response.ok||result.error) {
  audit.failureCode=result.error?.code??`http_${response.status}`;audit.safeFailureMessage=clean(result.error?.message||result.message);
  throw Error('A6API generation failed; inspect audit and billing.');
 }
 const item=candidate(result);if(!item)throw Error('No supported image in API response; recover from private cache before another request.');
 let bytes;
 if(item.startsWith('data:')) {
  const match=item.match(/^data:image\/[a-z0-9.+-]+;base64,([\s\S]+)$/i);if(!match)throw Error('Invalid image data URI.');
  bytes=Buffer.from(match[1],'base64');
 } else {
  if(new URL(item).protocol!=='https:')throw Error('Image download requires HTTPS.');
  const image=await fetch(item,{signal:AbortSignal.timeout(120000)});if(!image.ok)throw Error('Image download failed; recover cached response.');
  bytes=Buffer.from(await image.arrayBuffer());
 }
 if(bytes.length<1000)throw Error('Unexpectedly small image payload.');
 const magic=bytes.subarray(0,8).toString('hex');
 const ext=magic==='89504e470d0a1a0a'?'png':magic.startsWith('ffd8ff')?'jpg':bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP'?'webp':null;
 if(!ext)throw Error('Unsupported image signature.');
 audit.output=stem+'.'+ext;await fs.writeFile(audit.output,bytes,{flag:'wx'});
 audit.status='saved-unreviewed';audit.imageBytes=bytes.length;audit.imageSha256=sha(bytes);
} catch(error) {failed=true;audit.status='failed';audit.errorType=error.name;audit.safeFailureMessage||=clean(error.message);}
if(audit.paidRequestsSent) {
 try {
  const rows=(await ledger()).filter(row=>row.type===2&&row.model_name===model&&!before.has(identity(row)));
  audit.newBilledRows=rows.length;
  if(rows.length===1) {
   const other=details(rows[0]),billing=other.marketplace_per_request_billing||{};
   audit.actualChannel=other.actual_channel_id??null;audit.billingRequestId=billing.request_id??null;
   if(billing.applied&&billing.quota_per_unit>0)audit.billedCostUsd=rows[0].quota/billing.quota_per_unit;
   else audit.ledgerReconciliationRequired=true;
  } else audit.ledgerReconciliationRequired=true;
 } catch {audit.ledgerReconciliationRequired=true;}
}
audit.totalSeconds=Math.round((performance.now()-start)/10)/100;audit.finishedAt=new Date().toISOString();await saveAudit();
console.log(JSON.stringify({status:audit.status,model,output:audit.output??null,totalSeconds:audit.totalSeconds,
 billedCostUsd:audit.billedCostUsd,actualChannel:audit.actualChannel,ledgerReconciliationRequired:audit.ledgerReconciliationRequired,
 failureCode:audit.failureCode??null,safeFailureMessage:audit.safeFailureMessage??null,audit:auditPath}));
if(failed)process.exitCode=1;
