import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
const root=path.dirname(fileURLToPath(import.meta.url));
export async function checkAnatomy(plan,base=root){
 if(!plan.anatomy?.maps?.length)throw Error('Anatomy maps require target, purpose, sources and pose landmarks.');
 const report=[];
 const mask=async(d,w,h)=>{const {data,info}=await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><path d="${d}" fill="white"/></svg>`)).ensureAlpha().raw().toBuffer({resolveWithObject:true});return (x,y)=>data[(Math.round(y)*info.width+Math.round(x))*info.channels+3]>127;};
 for(const m of plan.anatomy.maps){
  for(const k of ['target','reason','view','excluded','projectionLimit','landmarks'])if(!m[k]||Array.isArray(m[k])&&!m[k].length)throw Error('Missing anatomical meaning '+m.id+' '+k);
  if(m.sourceIds.some(id=>!plan.anatomy.sources.some(s=>s.id===id&&s.url.startsWith('https://'))))throw Error('Unknown anatomical reference');
  const file=base+'/public/assets/'+m.asset+'.png',im=await sharp(file).metadata(),sha=createHash('sha256').update(await fs.readFile(file)).digest('hex');
  if(im.width!==m.sourceSize[0]||im.height!==m.sourceSize[1])throw Error('Pose canvas changed: re-trace '+m.id);
  if(m.assetSha256&&m.assetSha256!==sha)throw Error('Base illustration changed: re-trace '+m.id);
  const inside=m.id==='lats'?await mask(plan.latPath,im.width,im.height):await mask(plan.regions.map(r=>r.path).join(' '),im.width,im.height);
  const includes=m.id==='lats'?m.includeChecks:Object.values(m.includeChecks);
  for(const p of includes)if(!inside(...p))throw Error('Expected visible muscle point missing '+m.id+' '+p);
  for(const p of m.excludeChecks)if(inside(...p))throw Error('Adjacent/occluded region incorrectly colored '+m.id+' '+p);
  if(m.id==='deltoid')for(const r of plan.regions){const own=await mask(r.path,im.width,im.height);if(!own(...r.anchor))throw Error('Leader points to another muscle '+r.id);if(!own(...m.includeChecks[r.id]))throw Error('Named portion omitted '+r.id);}
  report.push({id:m.id,assetSha256:sha,checks:includes.length+m.excludeChecks.length,landmarks:m.landmarks,passed:true,limit:'Named-point and registration checks only; whole-contour anatomy still requires source-based visual review.'});
 }
 return report;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const p=JSON.parse(await fs.readFile(root+'/element-plan.json','utf8'));
 const report=await checkAnatomy(p);
 await fs.writeFile(root+'/anatomy-verification.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify(report));
}
