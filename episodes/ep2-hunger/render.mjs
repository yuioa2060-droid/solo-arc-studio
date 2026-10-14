import path from 'node:path';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {fixTs} from '../ep1-v11/film/fixts.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(root,'../..');
const require=createRequire(import.meta.url);
let mountBundle;
if(process.platform==='win32' && process.env.SOLO_ARC_WINDOWS_ADAPTERS!=='0') {
 require('../ep1-v11/film/win-runtime/remotion-pipe.cjs');
 ({mountBundle}=require('../ep1-v11/film/win-runtime/remotion-assets.cjs'));
}
const {bundle}=require('@remotion/bundler');
const {selectComposition,renderStill,renderMedia}=require('@remotion/renderer');
const cli=process.argv.slice(2);
const option=(flag,fallback)=>{const i=cli.indexOf(flag);if(i<0)return fallback;if(!cli[i+1]||cli[i+1].startsWith('--'))throw Error('Missing '+flag);return path.resolve(cli[i+1]);};
const review=option('--review-dir',path.join(repo,'outputs/ep2-review'));
const output=option('--out',path.join(repo,'outputs/ep2-ending.mp4'));
fs.mkdirSync(review,{recursive:true});fs.mkdirSync(path.dirname(output),{recursive:true});
const serveUrl=await bundle({entryPoint:path.join(root,'film/src/index.tsx'),publicDir:path.join(root,'film/public'),webpackOverride:fixTs});
mountBundle?.(serveUrl);
const browserExecutable=process.env.REMOTION_BROWSER_EXECUTABLE || undefined;
const composition=await selectComposition({serveUrl,id:'End4',browserExecutable});
const frames=cli.includes('--check')?[[6,'build-check-hero'],[15.57,'build-check-black']]:[[0,'progress'],[.5,'progress-exit'],[1.8,'text-enter'],[3.5,'text-full'],[4.7,'hero-enter'],[6,'hero-arrived'],[11,'hold'],[14.8,'fade'],[15.57,'black']];
for(const [sec,name] of frames) {
 await renderStill({serveUrl,composition,output:path.join(review,name+'.png'),frame:Math.min(467,Math.round(sec*30)),browserExecutable,imageFormat:'png'});
}
if(!cli.includes('--stills')&&!cli.includes('--check')) {
 // Render RGB PNG frames directly to full-range H.264, matching the rebuild's PC requirement.
 // This does not reinterpret an already compressed TV/PC fixture.
 const fullRange=({type,args})=>{
  if(type!=='stitcher')return args;
  const next=[...args],pixel=next.indexOf('-pix_fmt');
  if(pixel>=0)next[pixel+1]='yuvj420p';
  const vf=next.indexOf('-vf');
  if(vf>=0)next[vf+1]+=',scale=in_range=full:out_range=full';
  else next.splice(next.length-1,0,'-vf','scale=in_range=full:out_range=full');
  next.splice(next.length-1,0,'-color_range','pc');
  return next;
 };
 await renderMedia({serveUrl,composition,codec:'h264',crf:18,outputLocation:output,browserExecutable,concurrency:2,imageFormat:'png',disallowParallelEncoding:true,ffmpegOverride:fullRange});
}
console.log(JSON.stringify({composition:'End4',frames:468,review,output:cli.includes('--check')||cli.includes('--stills')?null:output,paid_api_requests:0}));
