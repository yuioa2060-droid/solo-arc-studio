import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const args=process.argv.slice(2);
const get=(name,defaultValue)=>{const i=args.indexOf(name);return i>=0?args[i+1]:defaultValue;};
const getAll=name=>args.flatMap((v,i)=>v===name?[args[i+1]]:[]);
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
if(args.includes('--help')||!args.length){console.log('A6API reference image edit. Default is an offline dry run.\nnode --env-file=PRIVATE_A6API.env a6api-reference.mjs --ref reference.png [--ref style.png] --prompt-file prompt.txt --out new.png --route-id ACCOUNT_PIN --expected-price USD [--size 1536x1024] [--send]\n--send makes exactly one external paid request; there are no automatic retries. Strict provider pin/price must be verified in the account first.');process.exit(0);}
const refPaths=getAll('--ref');
const promptFile=get('--prompt-file'),output=get('--out');
if(!refPaths.length||!promptFile||!output)throw Error('Provide references, prompt file and a new output path.');
const prompt=await fs.readFile(promptFile,'utf8');if(!prompt.trim())throw Error('Prompt is empty.');
if(await fs.stat(output).catch(()=>null))throw Error('Output exists; accepted images are not overwritten.');
const refs=[];for(const file of refPaths){const bytes=await fs.readFile(file);const ext=path.extname(file).toLowerCase();const mime={'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp'}[ext];if(!mime)throw Error('Reference must be PNG/JPEG/WebP');refs.push({file,bytes,mime,sha256:digest(bytes)});}
const model=process.env.A6API_MODEL||'gpt-image-2.5';
const base=process.env.A6API_BASE_URL||'https://api.a6api.com/v1';
const baseUrl=new URL(base);if(baseUrl.protocol!=='https:'||!['api.a6api.com','a6.a6api.com'].includes(baseUrl.hostname)||baseUrl.username||baseUrl.password)throw Error('Credential is scoped to the two verified HTTPS A6API hosts in this helper.');
const audit={startedAt:new Date().toISOString(),endpoint:base.replace(/\/$/,'')+'/images/edits',model,declaredRouteId:get('--route-id',null),expectedPriceUsd:get('--expected-price',null),routeVerifiedByResponse:false,billedCostUsd:null,promptSha256:digest(Buffer.from(prompt)),references:refs.map(r=>({name:path.basename(r.file),sha256:r.sha256})),output:path.resolve(output),dryRun:!args.includes('--send')};
if(audit.dryRun){console.log(JSON.stringify(audit,null,2));process.exit(0);}
const key=process.env.A6API_KEY;if(!key)throw Error('A6API_KEY missing.');
if(!audit.declaredRouteId||!Number.isFinite(Number(audit.expectedPriceUsd))||Number(audit.expectedPriceUsd)<=0)throw Error('For --send provide the account pin and currently verified expected price.');
await fs.mkdir(path.dirname(path.resolve(output)),{recursive:true});
const auditPath=output+'.audit.json';const form=new FormData();form.set('model',model);form.set('prompt',prompt);form.set('n','1');form.set('size',get('--size','1536x1024'));
for(const ref of refs)form.append(refs.length===1?'image':'image[]',new Blob([ref.bytes],{type:ref.mime}),path.basename(ref.file));
const redact=value=>String(value).replaceAll(key,'[REDACTED]').replace(/(?:sk-|cth_)[A-Za-z0-9_-]+/g,'[REDACTED]');
try{
 const response=await fetch(audit.endpoint,{method:'POST',headers:{Authorization:'Bearer '+key},body:form,signal:AbortSignal.timeout(Number(get('--timeout-ms',300000)))});audit.httpStatus=response.status;
 const raw=await response.text();let data;try{data=JSON.parse(raw);}catch{throw Error('Non-JSON API response; response body omitted.');}
 if(!response.ok)throw Error('API rejected request: '+redact(data?.error?.message||data?.message||response.status).slice(0,300));
 const result=data?.data?.[0];let bytes;
 if(result?.b64_json){bytes=Buffer.from(result.b64_json,'base64');}
 else if(result?.url){const url=new URL(result.url);if(url.protocol==='data:'){const m=result.url.match(/^data:image\/[a-z0-9.+-]+;base64,([A-Za-z0-9+/=\r\n]+)$/i);if(!m)throw Error('Invalid image data URL');bytes=Buffer.from(m[1],'base64');}else{if(url.protocol!=='https:')throw Error('Image URL must be HTTPS');const imageResponse=await fetch(url,{signal:AbortSignal.timeout(60000)});if(!imageResponse.ok)throw Error('Image fetch failed '+imageResponse.status);bytes=Buffer.from(await imageResponse.arrayBuffer());}}
 else throw Error('Response did not contain an image.');
 const signature=bytes.subarray(0,12);let ext;
 if(signature.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))ext='.png';
 else if(signature[0]===255&&signature[1]===216&&signature[2]===255)ext='.jpg';
 else if(signature.subarray(0,4).toString()==='RIFF'&&signature.subarray(8,12).toString()==='WEBP')ext='.webp';
 else throw Error('Returned bytes are not recognizable PNG/JPEG/WebP; no image saved.');
 const declared=path.extname(output).toLowerCase();const final=declared===ext||(ext==='.jpg'&&declared==='.jpeg')?output:output.replace(/\.[^.\\/]+$/,'')+ext;
 if(await fs.stat(final).catch(()=>null))throw Error('Actual-format destination exists; no overwrite.');
 await fs.writeFile(final,bytes,{flag:'wx'});audit.status='saved-unreviewed';audit.actualFile=path.resolve(final);audit.imageBytes=bytes.length;audit.imageSha256=digest(bytes);
}catch(error){audit.status='failed';audit.error=redact(error.message).slice(0,350);process.exitCode=1;}
finally{audit.finishedAt=new Date().toISOString();await fs.writeFile(auditPath,JSON.stringify(audit,null,2));console.log(JSON.stringify({status:audit.status,output:audit.actualFile??null,auditPath,error:audit.error??null,billedCostUsd:null,ledgerReconciliationRequired:true}));}
