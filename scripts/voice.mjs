import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
try{process.loadEnvFile(path.join(root,'.env'));}catch(error){if(error.code!=='ENOENT')throw error;}
const args=process.argv.slice(2);
const get=(key,fallback)=>{const i=args.indexOf(key);return i<0?fallback:args[i+1];};
for(let i=0;i<args.length;i++){
 if(args[i]==='--send')continue;
 if(['--script','--out'].includes(args[i])&&args[i+1]){i++;continue;}
 throw new Error('Usage: --script <English .txt> --out <new output prefix> [--send]');
}
const script=path.resolve(root,get('--script','episodes/ep1-v11/v6voice/full.txt'));
const inside=path.relative(root,script);
if(inside.startsWith('..')||path.isAbsolute(inside)||path.extname(script)!=='.txt')throw new Error('Choose an English .txt script inside this checkout');
const text=(await fs.readFile(script,'utf8')).trim();
if(!text)throw new Error('Script is empty');
const output=path.resolve(root,get('--out','outputs/voice/take'));
const voice=process.env.ELEVENLABS_VOICE_ID||'oyxaSt75JW8l04MCJaSo';
if(!/^[A-Za-z0-9]+$/.test(voice))throw new Error('Invalid voice ID');
const model=process.env.ELEVENLABS_MODEL||'eleven_v3';
const report={dryRun:!args.includes('--send'),script:path.relative(root,script),characters:text.length,voice,model,stability:0.5,output,paidRequestSent:false};
if(report.dryRun){console.log(JSON.stringify(report,null,2));process.exit(0);}
const key=process.env.ELEVENLABS_API_KEY;
if(!key)throw new Error('ELEVENLABS_API_KEY is missing');
for(const ext of ['.mp3','.alignment.json','.words.json','.request.json']){
 if(await fs.stat(output+ext).catch(()=>null))throw new Error('Output exists; previous takes are preserved');
}
await fs.mkdir(path.dirname(output),{recursive:true});
const response=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_128`,{
 method:'POST',headers:{'xi-api-key':key,'Content-Type':'application/json'},
 body:JSON.stringify({text,model_id:model,voice_settings:{stability:0.5}}),signal:AbortSignal.timeout(300000),
});
report.paidRequestSent=true;report.httpStatus=response.status;
if(!response.ok){await fs.writeFile(output+'.request.json',JSON.stringify(report,null,2));throw new Error(`ElevenLabs HTTP ${response.status}; response body omitted`);}
const data=await response.json();
if(!data.audio_base64||!data.alignment)throw new Error('Audio/alignment missing; do not retry before checking the request status');
const alignment=data.alignment;
const joined=alignment.characters.join('');
const words=[];
for(const m of joined.matchAll(/\[[^\]]*\]|\S+/g)){
 if(m[0].startsWith('['))continue;
 words.push({text:m[0],start:alignment.character_start_times_seconds[m.index],end:alignment.character_end_times_seconds[m.index+m[0].length-1]});
}
await fs.writeFile(output+'.mp3',Buffer.from(data.audio_base64,'base64'),{flag:'wx'});
await fs.writeFile(output+'.alignment.json',JSON.stringify(alignment,null,2),{flag:'wx'});
await fs.writeFile(output+'.words.json',JSON.stringify(words,null,2),{flag:'wx'});
report.words=words.length;report.characterCost=response.headers.get('character-cost');
report.status='saved-unreviewed-native-tempo';
await fs.writeFile(output+'.request.json',JSON.stringify(report,null,2),{flag:'wx'});
console.log(JSON.stringify(report,null,2));
