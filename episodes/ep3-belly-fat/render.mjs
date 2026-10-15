// Portable adapter for the received, owner-approved 60.3s project.
// This does not add the remaining scenes or mark a full EP3 as finished.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {fixTs} from './approved-direction/film/fixts.mjs';

const root=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(root,'../..');
const film=path.join(root,'approved-direction/film');
const require=createRequire(import.meta.url);
let mountBundle;
if(process.platform==='win32'&&process.env.SOLO_ARC_WINDOWS_ADAPTERS!=='0') {
 require('../ep1-v11/film/win-runtime/remotion-pipe.cjs');
 ({mountBundle}=require('../ep1-v11/film/win-runtime/remotion-assets.cjs'));
}
const {bundle}=require('@remotion/bundler');
const {selectComposition,renderStill,renderMedia,openBrowser}=require('@remotion/renderer');
const args=process.argv.slice(2);
const get=(name,fallback)=>{
 const at=args.indexOf(name);
 if(at<0)return fallback;
 if(!args[at+1]||args[at+1].startsWith('--'))throw Error('Missing value for '+name);
 return args[at+1];
};
const review=path.resolve(repo,get('--review-dir',path.join(repo,'outputs/ep3-review')));
const output=path.resolve(repo,get('--out',path.join(repo,'outputs/ep3-rebuilt-sample.mp4')));
const fixture=path.join(film,'out/redo/Rendo-EP3-New-Direction-60s.mp4');
if(output.toLowerCase()===fixture.toLowerCase())throw Error('Preserve the owner-approved received MP4; export to outputs/.');
const font=fs.readFileSync(path.join(film,'public/fonts/Jost.ttf'));
if(font.length<10000||!['00010000','4f54544f','74746366'].includes(font.subarray(0,4).toString('hex')))throw Error('Real Jost font missing: fetch Git LFS first.');
const meta=JSON.parse(fs.readFileSync(path.join(film,'public/art/meta.json'),'utf8'));
for(const name of Object.keys(meta)) {
 const png=path.join(film,'public/art',name+'.png');
 if(!fs.existsSync(png)||fs.statSync(png).size<1000)throw Error('Missing PNG/LFS media: '+name);
}
const browserExecutable=process.env.REMOTION_BROWSER_EXECUTABLE||process.env.CHROMIUM_PATH||
 ['/usr/local/bin/chromium','/usr/bin/chromium','/usr/bin/chromium-browser'].find(p=>fs.existsSync(p));
const failures=[];
const serveUrl=await bundle({entryPoint:path.join(film,'src/index.ts'),publicDir:path.join(film,'public'),webpackOverride:fixTs});
mountBundle?.(serveUrl);
const puppeteerInstance=await openBrowser('chrome',{browserExecutable});
const browser={browserExecutable,puppeteerInstance,onBrowserLog:log=>{
 if(log.text?.startsWith('REDOQA '))failures.push(JSON.parse(log.text.slice(7)));
}};
try {
 const composition=await selectComposition({serveUrl,id:get('--composition','EP3-REDO-TEST'),...browser});
 fs.mkdirSync(review,{recursive:true});
 if(args.includes('--check')||args.includes('--stills')) {
  const seconds=args.includes('--check')?[1.65,23.8,47.5]:get('--stills','1.65,7.7,10.1,23.8,38.3,47.5,59.3').split(',').map(Number);
  for(const second of seconds) {
   if(!Number.isFinite(second)||second<0||second*composition.fps>=composition.durationInFrames)throw Error('Still outside composition.');
   await renderStill({serveUrl,composition,frame:Math.round(second*composition.fps),output:path.join(review,`frame-${second}.png`),imageFormat:'png',...browser});
  }
  fs.writeFileSync(path.join(review,'runtime-check.json'),JSON.stringify({composition:composition.id,duration_frames:composition.durationInFrames,seconds,text_failures:failures,paid_api_requests:0},null,2)+'\n');
  if(failures.length)throw Error('Text range audit reported failures; inspect '+review);
  console.log(JSON.stringify({composition:composition.id,seconds,review,text_failures:0,paid_api_requests:0}));
 } else {
  const from=Number(get('--from','0')),to=Number(get('--to',String(composition.durationInFrames/composition.fps)));
  const scale=Number(get('--scale','1')),concurrency=Number(get('--concurrency','2'));
  if(!Number.isFinite(from)||!Number.isFinite(to)||from<0||to<=from||to>composition.durationInFrames/composition.fps||!Number.isFinite(scale)||scale<=0||!Number.isInteger(concurrency)||concurrency<1)throw Error('Invalid render range/options.');
  const frameRange=[Math.floor(from*composition.fps),Math.min(composition.durationInFrames-1,Math.ceil(to*composition.fps)-1)];
  const silent=output+`.silent-${process.pid}.mp4`;
  fs.mkdirSync(path.dirname(output),{recursive:true});
  let last=0;
  await renderMedia({serveUrl,composition,outputLocation:silent,frameRange,scale,concurrency,codec:'h264',crf:18,pixelFormat:'yuv420p',...browser,
   onProgress:({renderedFrames})=>{if(Date.now()-last>20000){last=Date.now();console.log('Rendered frames',renderedFrames);}}});
  const start=frameRange[0]/composition.fps,duration=(frameRange[1]-frameRange[0]+1)/composition.fps;
  const master=path.resolve(repo,get('--audio',path.join(film,'public/audio/preview-master.wav')));
  const result=spawnSync(get('--ffmpeg',process.env.SOLO_ARC_FFMPEG||'ffmpeg'),['-hide_banner','-loglevel','error','-y','-i',silent,'-ss',String(start),'-i',master,'-t',String(duration),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','256k','-movflags','+faststart',output],{stdio:'inherit',windowsHide:true});
  if(result.error||result.status!==0)throw Error('FFmpeg mux failed; set SOLO_ARC_FFMPEG to a full FFmpeg executable.');
  fs.unlinkSync(silent);
  fs.writeFileSync(path.join(review,'render-check.json'),JSON.stringify({composition:composition.id,output,frameRange,text_failures:failures,paid_api_requests:0},null,2)+'\n');
  if(failures.length)throw Error('Rendered with text range failures; inspect review report.');
  console.log(JSON.stringify({composition:composition.id,output,frameRange,paid_api_requests:0}));
 }
} finally {
 await puppeteerInstance.close({silent:true});
}
