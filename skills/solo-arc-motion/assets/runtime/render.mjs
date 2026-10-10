import './remotion-pipe.cjs';
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import {checkPlan} from './plan-check.mjs';
const root=path.dirname(fileURLToPath(import.meta.url)),require=createRequire(import.meta.url);
const {mountBundle}=require('./remotion-assets.cjs'),{bundle}=require('@remotion/bundler'),{openBrowser,selectComposition,renderStill,renderMedia}=require('@remotion/renderer');
const plan=JSON.parse((await fs.readFile(root+'/motion-plan.json','utf8')).replace(/^\uFEFF/,''));
await checkPlan(root,plan);const serveUrl=await bundle({entryPoint:root+'/MotionFilm.tsx',publicDir:root+'/public'});mountBundle(serveUrl);const browser=await openBrowser('chrome',{chromeMode:'headless-shell',logLevel:'error'});
try{
 await fs.mkdir(root+'/public/previews',{recursive:true});await fs.mkdir(serveUrl+'/public/previews',{recursive:true});
 for(const s of plan.scenes.flatMap(s=>s.layers).filter(s=>s.type==='plan'&&s.hidden))for(const [i,row] of s.rows.entries()){
  const inputProps={row,width:s.w,height:s.rowHeight},card=await selectComposition({serveUrl,id:'MotionCard',inputProps,puppeteerInstance:browser});
  card.width=s.w;card.height=s.rowHeight;const file=root+'/public/previews/'+s.id+'-'+i+'.png';await renderStill({serveUrl,composition:card,inputProps,puppeteerInstance:browser,frame:0,output:file});
  const raster=await sharp(file).resize(82,20,{fit:'fill'}).png().toBuffer();await fs.writeFile(file,raster);await fs.copyFile(file,serveUrl+'/public/previews/'+s.id+'-'+i+'.png');
 }
 const comp=await selectComposition({serveUrl,id:'SoloArc',inputProps:{audit:true},puppeteerInstance:browser});
 await fs.mkdir(root+'/review',{recursive:true});
 if(process.argv.includes('--stills')){
  const times=[...new Set(plan.reviewTimes??plan.scenes.map(s=>(s.a+s.b)/2))];let images=[];
  for(const [i,t] of times.entries()){const f=root+'/review/'+String(i).padStart(3,'0')+'.png';await renderStill({serveUrl,composition:comp,puppeteerInstance:browser,frame:Math.min(comp.durationInFrames-1,Math.round(t*plan.fps)),output:f,inputProps:{audit:true}});images.push({input:await sharp(f).resize(480,270).toBuffer(),left:i%4*480,top:Math.floor(i/4)*300});images.push({input:Buffer.from(`<svg width="480" height="30"><text x="10" y="23" fill="white" font-size="20">${t.toFixed(2)} s</text></svg>`),left:i%4*480,top:Math.floor(i/4)*300+270});}
  for(let start=0;start<times.length;start+=12){const layer=images.slice(start*2,(start+12)*2).map(x=>({...x,top:x.top-Math.floor(start/4)*300}));await sharp({create:{width:1920,height:Math.ceil(Math.min(12,times.length-start)/4)*300,channels:3,background:'#151515'}}).composite(layer).jpeg({quality:93}).toFile(root+'/review/sheet-'+Math.floor(start/12)+'.jpg');}
  console.log(JSON.stringify({stills:times.length,root}));
 }else{
  const checked=new Set(),failures=[];let last=-1;await renderMedia({serveUrl,composition:comp,puppeteerInstance:browser,inputProps:{audit:true},codec:'h264',muted:!plan.audio,outputLocation:root+'/motion-demo.mp4',crf:18,x264Preset:'fast',concurrency:4,offthreadVideoThreads:1,logLevel:'error',onBrowserLog:log=>{if(log.text.startsWith('MOTION_QA ')){const r=JSON.parse(log.text.slice(10));checked.add(r.frame);if(r.errors.length)failures.push(r);}},onProgress:p=>{const n=Math.floor(p.progress*20);if(n!==last){last=n;console.log('Render '+Math.round(p.progress*100)+'%');}}});
  const missingFrames=Array.from({length:comp.durationInFrames},(_,i)=>i).filter(i=>!checked.has(i));const report={at:new Date().toISOString(),expectedFrames:comp.durationInFrames,checkedFrames:checked.size,missingFrames,failures,passed:!missingFrames.length&&!failures.length,audioPresent:!!plan.audio,sourcePixelsUsed:false};await fs.writeFile(root+'/render-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,failures:failures.length}));if(!report.passed)throw Error('Final frame layout check failed.');
 }
}finally{await browser.close({silent:true});}

