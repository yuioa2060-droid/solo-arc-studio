#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {fixTs} from './fixts.mjs';

const root=path.dirname(fileURLToPath(import.meta.url));
const require=createRequire(import.meta.url);
const useWindowsAdapters=process.platform==='win32' && process.env.SOLO_ARC_WINDOWS_ADAPTERS!=='0';
let mountBundle;
if(useWindowsAdapters){
  // Process-local adapters inherited from this channel's toolkit, pinned to Remotion 4.0.454.
  // They do not edit node_modules or control any existing user browser.
  require('./win-runtime/remotion-pipe.cjs');
  ({mountBundle}=require('./win-runtime/remotion-assets.cjs'));
}
// Use the same CommonJS renderer instance as the optional process-local adapters.
const {bundle}=require('@remotion/bundler');
const {renderMedia,renderStill,selectComposition}=require('@remotion/renderer');
const run=async(command,args)=>new Promise((resolve,reject)=>{
  const proc=spawn(command,args,{windowsHide:true,stdio:['ignore','ignore','pipe']});
  let stderr='';proc.stderr.on('data',data=>{stderr=(stderr+data).slice(-5000);});
  proc.on('error',reject);proc.on('close',code=>code===0?resolve():reject(new Error(`${command} exited ${code}: ${stderr}`)));
});
const args=process.argv.slice(2), opts={silent:false,concurrency:2,scale:1};
for(let i=0;i<args.length;i++){
  const key=args[i];
  if(key==='--silent') opts.silent=true;
  else if(['--out','--stills','--from','--to','--concurrency','--scale','--ffmpeg'].includes(key)){
    if(args[i+1]===undefined||args[i+1].startsWith('--')) throw new Error(`Missing value for ${key}`);
    opts[key.slice(2)]=args[++i];
  }else throw new Error(`Unknown argument ${key}`);
}
if(!opts.out) throw new Error('Required: --out <MP4 path or stills directory>');
const out=path.resolve(root,opts.out);
const concurrency=Number(opts.concurrency),scale=Number(opts.scale);
if(!Number.isInteger(concurrency)||concurrency<1||!Number.isFinite(scale)||scale<=0) throw new Error('Invalid concurrency/scale');
const browser=process.env.REMOTION_BROWSER_EXECUTABLE?{browserExecutable:process.env.REMOTION_BROWSER_EXECUTABLE}:{};
const withAudioPreview=opts.stills!==undefined && !opts.silent;
const ffmpeg=opts.ffmpeg||process.env.SOLO_ARC_FFMPEG||'ffmpeg';
if(opts.stills===undefined && !opts.silent) await run(ffmpeg,['-version']);
// Keep video rendering local and silent. Final audio is trimmed/muxed from the local WAV,
// avoiding a second HTTP download of a 62 MB asset on hosts with restricted loopback.
const serveUrl=await bundle({entryPoint:path.join(root,'src',withAudioPreview?'index-audio.ts':'index.ts'),publicDir:path.join(root,'public'),webpackOverride:fixTs});
mountBundle?.(serveUrl);
const composition=await selectComposition({serveUrl,id:withAudioPreview?'Ep2Audio':'Ep2',...browser});
if(opts.stills!==undefined){
  if(opts.from!==undefined||opts.to!==undefined) throw new Error('--stills cannot be combined with --from/--to');
  const seconds=opts.stills.split(',').map(Number);
  if(seconds.some(s=>!Number.isFinite(s)||s<0||s*composition.fps>=composition.durationInFrames)) throw new Error('Still seconds outside composition');
  await fs.mkdir(out,{recursive:true});
  for(const secondsValue of seconds){
    const frame=Math.min(composition.durationInFrames-1,Math.round(secondsValue*composition.fps));
    const outputLocation=path.join(out,`frame-${String(frame).padStart(6,'0')}-${secondsValue}s.png`);
    await renderStill({serveUrl,composition,frame,output:outputLocation,imageFormat:'png',scale,...browser});
    console.log(`Still ${frame} (${secondsValue}s): ${outputLocation}`);
  }
}else{
  const from=opts.from===undefined?0:Number(opts.from);
  const to=opts.to===undefined?composition.durationInFrames/composition.fps:Number(opts.to);
  if(!Number.isFinite(from)||!Number.isFinite(to)||from<0||to<=from||from*composition.fps>=composition.durationInFrames) throw new Error('Invalid clip seconds');
  const frameRange=[Math.floor(from*composition.fps),Math.min(composition.durationInFrames-1,Math.ceil(to*composition.fps)-1)];
  await fs.mkdir(path.dirname(out),{recursive:true});
  const raw=opts.silent?out:out+`.silent-${process.pid}.mp4`;
  let last=0;
  await renderMedia({serveUrl,composition,outputLocation:raw,frameRange,concurrency,scale,...browser,
    codec:'h264',crf:18,x264Preset:'faster',pixelFormat:'yuv420p',imageFormat:'jpeg',jpegQuality:94,audioCodec:'aac',audioBitrate:'256k',
    onProgress:({renderedFrames})=>{const now=Date.now();if(now-last>15000){last=now;console.log(`Rendered ${renderedFrames} frames`);}}});
  if(!opts.silent){
    const start=frameRange[0]/composition.fps, duration=(frameRange[1]-frameRange[0]+1)/composition.fps;
    await run(ffmpeg,['-hide_banner','-loglevel','error','-y','-i',raw,'-ss',String(start),
      '-i',path.join(root,'public/audio/master-ep2.wav'),'-t',String(duration),
      '-map','0:v:0','-map','1:a:0','-c:v','copy',
      '-c:a','aac','-b:a','256k','-movflags','+faststart',out]);
    await fs.unlink(raw);
  }
  console.log(`Rendered ${opts.silent?'silent':'EP2 master audio'}: ${out}`);
}
