#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const root=path.dirname(fileURLToPath(import.meta.url));
const require=createRequire(import.meta.url);
const errors=[];
const pkg=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8'));
const mappings=JSON.parse(await fs.readFile(path.join(root,'src/imgs.json'),'utf8'));
const tl=await fs.readFile(path.join(root,'src/tl.ts'),'utf8');
const total=Number(tl.match(/\bTOTAL\s*=\s*([\d.]+)/)?.[1]);
if(!Number.isFinite(total)||total<=0) errors.push('Invalid TOTAL in src/tl.ts');
let checked=0;
const dims=async(file)=>{const h=await fs.open(file,'r');try{const b=Buffer.alloc(65536);const {bytesRead}=await h.read(b,0,65536,0);
  if(b.subarray(0,8).toString('hex')==='89504e470d0a1a0a') return [b.readUInt32BE(16),b.readUInt32BE(20)];
  if(b[0]===0xff&&b[1]===0xd8){for(let p=2;p+9<bytesRead;){if(b[p]!==0xff){p++;continue;}const m=b[p+1];if(m>=0xc0&&m<=0xcf&&![0xc4,0xc8,0xcc].includes(m))return [b.readUInt16BE(p+7),b.readUInt16BE(p+5)];p+=2+b.readUInt16BE(p+2);}}
  throw new Error('Unknown image format');}finally{await h.close();}};
for(const [key,expected] of Object.entries(mappings)){
  const file=path.join(root,'public','img',key);
  try{const actual=await dims(file);
    if(actual[0]!==expected[0]||actual[1]!==expected[1]) errors.push(`Dimensions differ: ${key}: ${actual.join('x')} vs ${expected.join('x')}`);
    checked++;
  }catch(error){errors.push(`Image ${key}: ${error.message}`);}
}

const master=path.join(root,'public','audio','master-ep3.wav');
let audio;
try{
  const b=await fs.readFile(master);
  if(b.subarray(0,4).toString()!=='RIFF'||b.subarray(8,12).toString()!=='WAVE') throw new Error('Expected RIFF WAV');
  let fmt,bytes;
  for(let p=12;p+8<=b.length;){
    const name=b.subarray(p,p+4).toString();
    const size=b.readUInt32LE(p+4);
    if(name==='fmt '){fmt={channels:b.readUInt16LE(p+10),sampleRate:b.readUInt32LE(p+12),byteRate:b.readUInt32LE(p+16)};}
    if(name==='data') bytes=size;
    p+=8+size+(size%2);
  }
  if(!fmt||bytes===undefined) throw new Error('Missing WAV chunks');
  audio={...fmt,durationSeconds:bytes/fmt.byteRate};
  if(Math.abs(audio.durationSeconds-total)>1/30+0.001) errors.push('Master duration differs from montage by more than one frame');
}catch(error){errors.push(`Master audio: ${error.message}`);}

const versions={};
for(const key of ['remotion','@remotion/cli','@remotion/bundler','@remotion/renderer']){
  try{
    const installed=JSON.parse(await fs.readFile(require.resolve(key+'/package.json'),'utf8'));
    versions[key]=installed.version;
    if(installed.version!==pkg.dependencies[key]) errors.push(`${key}: installed ${installed.version}, expected ${pkg.dependencies[key]}`);
  }catch{errors.push(`${key} unavailable; run npm ci in this film directory`);}
}
console.log(JSON.stringify({root,composition:'Ep3 / Ep3Audio',fps:30,size:[1920,1080],totalSeconds:total,
  frames:Math.ceil(total*30),imagesChecked:checked,audio,versions,errors,
  limits:'Checks headers, mappings, durations and package versions; does not assess creative approval, full pixel decode, science or listening.'},null,2));
if(errors.length) process.exitCode=1;
