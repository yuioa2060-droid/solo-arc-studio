#!/usr/bin/env node
// Persistent frame export: completed frames survive a browser/pipe interruption.
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {fixTs} from './fixts.mjs';
import {visualCacheKey} from './visual-cache-key.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const require=createRequire(import.meta.url);
let mountBundle;
if(process.platform==='win32'&&process.env.SOLO_ARC_WINDOWS_ADAPTERS!=='0'){
  require('./win-runtime/remotion-pipe.cjs');
  ({mountBundle}=require('./win-runtime/remotion-assets.cjs'));
}
const {bundle}=require('@remotion/bundler');
const {renderFrames,selectComposition}=require('@remotion/renderer');
const args=process.argv.slice(2),options={concurrency:8};
for(let i=0;i<args.length;i++){
  if(!['--ffmpeg','--from-frame','--to-frame','--concurrency'].includes(args[i])||!args[i+1])throw new Error('Invalid arguments');
  options[args[i].slice(2)]=args[++i];
}
const ffmpeg=options.ffmpeg||process.env.SOLO_ARC_FFMPEG||'ffmpeg';
const fingerprint=await visualCacheKey(root);
const legacy=path.join(root,'out/ep3/frames');
let legacyTag;
try{legacyTag=JSON.parse(await fsp.readFile(path.join(legacy,'source-key.json'),'utf8'));}catch{}
const folder=legacyTag?.fingerprint===fingerprint?legacy:path.join(root,'out/ep3',`frames-${fingerprint.slice(0,16)}`);
await fsp.mkdir(folder,{recursive:true});
await fsp.writeFile(path.join(folder,'source-key.json'),JSON.stringify({fingerprint,source:'src + public except audio + package files'},null,2));
const frameFile=frame=>path.join(folder,`frame-${String(frame).padStart(6,'0')}.jpg`);
const exists=frame=>{try{const h=fs.openSync(frameFile(frame),'r');const b=Buffer.alloc(2),size=fs.fstatSync(h).size;fs.readSync(h,b,0,2,size-2);fs.closeSync(h);return size>100&&b.toString('hex')==='ffd9';}catch{return false;}};
const browser=process.env.REMOTION_BROWSER_EXECUTABLE?{browserExecutable:process.env.REMOTION_BROWSER_EXECUTABLE}:{};
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.ts'),publicDir:path.join(root,'public'),webpackOverride:fixTs});
mountBundle?.(serveUrl);
const composition=await selectComposition({serveUrl,id:'Ep3',...browser});
const first=options['from-frame']===undefined?0:Number(options['from-frame']);
const last=options['to-frame']===undefined?composition.durationInFrames-1:Number(options['to-frame']);
if(!Number.isInteger(first)||!Number.isInteger(last)||first<0||last<first||last>=composition.durationInFrames)throw new Error('Invalid frame range');
let saved=0,lastLog=0;
for(let cursor=first;cursor<=last;){
  if(exists(cursor)){cursor++;continue;}
  const start=cursor,end=Math.min(last,start+899);
  console.log(`Persistent frames ${start}-${end}`);
  await renderFrames({serveUrl,composition,frameRange:[start,end],inputProps:{},outputDir:null,
    concurrency:Number(options.concurrency),imageFormat:'jpeg',jpegQuality:94,muted:true,...browser,
    onStart:()=>{},onFrameUpdate:()=>{},onFrameBuffer:(buffer,frame)=>{
      const dest=frameFile(frame),temp=dest+'.'+process.pid+'.tmp';fs.writeFileSync(temp,buffer);fs.renameSync(temp,dest);saved++;
      if(Date.now()-lastLog>15000){lastLog=Date.now();console.log(`Saved frame ${frame} / ${composition.durationInFrames-1}; ${saved} this run`);}
    }});
  cursor=end+1;
}
if(options['from-frame']!==undefined||options['to-frame']!==undefined){console.log('Selected persistent range complete');process.exit(0);}
for(let frame=0;frame<composition.durationInFrames;frame++)if(!exists(frame))throw new Error(`Missing frame ${frame}`);
const out=path.resolve(root,'../ep3-one-slice.mp4');
// Encode from the current normalized master, including the final frame's silence.
await new Promise((resolve,reject)=>{
  const audio=spawn(ffmpeg,['-hide_banner','-loglevel','error','-y','-i',path.join(root,'public/audio/master-ep3.wav'),
    '-af',`apad=whole_dur=${composition.durationInFrames/composition.fps}`,'-t',String(composition.durationInFrames/composition.fps),
    '-c:a','aac','-b:a','256k',path.join(root,'out/ep3/final-audio-ep3.m4a')],{windowsHide:true,stdio:['ignore','ignore','pipe']});
  let error='';audio.stderr.on('data',x=>{error+=x;});audio.on('error',reject);audio.on('close',code=>code===0?resolve():reject(new Error(error)));
});
const proc=spawn(ffmpeg,['-hide_banner','-nostats','-y','-framerate',String(composition.fps),'-start_number','0',
  '-i',path.join(folder,'frame-%06d.jpg'),'-i',path.join(root,'out/ep3/final-audio-ep3.m4a'),
  '-frames:v',String(composition.durationInFrames),'-map','0:v:0','-map','1:a:0','-c:v','libx264','-crf','18',
  '-pix_fmt','yuv420p','-c:a','copy','-movflags','+faststart',out],{windowsHide:true,stdio:['ignore','ignore','pipe']});
let stderr='';proc.stderr.on('data',x=>{stderr=(stderr+x).slice(-4000);});
await new Promise((resolve,reject)=>{proc.on('error',reject);proc.on('close',code=>code===0?resolve():reject(new Error(stderr)));});
console.log(`Complete EP3 MP4: ${out}`);
