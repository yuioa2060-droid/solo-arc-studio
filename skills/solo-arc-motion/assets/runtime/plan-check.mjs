import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
export async function checkPlan(root,plan){
 const errors=[],fail=s=>errors.push(s),n=x=>typeof x==='number'&&Number.isFinite(x),types=new Set(['sprite','text','guide','localCue','badge','gauge','cycle','calendar','plan']);
 if(plan.version!==1||!n(plan.duration)||plan.duration<=0||plan.fps!==60)fail('version 1, positive duration and fps 60 required');
 const meta=JSON.parse((await fs.readFile(root+'/public/assets/meta.json','utf8')).replace(/^\uFEFF/,''));
 const seen=new Set(),used=new Set();let lastEnd=0;
 for(const scene of plan.scenes??[]){
  if(!scene.id||!scene.purpose||!n(scene.a)||!n(scene.b)||scene.a<0||scene.b<=scene.a||scene.b>plan.duration||scene.a<lastEnd)fail('invalid or overlapping scene '+scene.id);lastEnd=scene.b;
 }
 for(const scene of [...(plan.scenes??[]),{id:'persistent',a:0,b:plan.duration,layers:plan.persistent??[]}]){
  const layers=[...(plan.persistent??[]),...(scene.layers??[])];
  for(const s of scene.layers??[]){
   if(!s.id||seen.has(s.id))fail('duplicate/missing layer id '+s.id);seen.add(s.id);
   if(!types.has(s.type))fail('unsupported layer '+s.type);
   if(!n(s.a)||!n(s.b)||s.a<scene.a||s.b>scene.b||s.b<=s.a)fail('layer outside scene '+s.id);
   if(s.type==='sprite'){
    used.add(s.asset);if(!n(s.w)||s.w<=0||!n(s.x)||!n(s.y))fail('invalid sprite geometry '+s.id);
    const sizes=[s.asset,...(s.states??[]).map(v=>v[1])].map(id=>meta[id]);
    if(sizes.some(m=>!m)||sizes.some(m=>m?.width!==sizes[0]?.width||m?.height!==sizes[0]?.height))fail('pose canvas differs or asset missing '+s.id);
    let prev=s.a;for(const [at,id]of s.states??[]){used.add(id);if(!n(at)||at<prev||at>=s.b)fail('invalid pose time '+s.id);prev=at;}
    if(s.highlightPath){
     const a=s.anatomy;
     if(!a?.target||!a?.reason||!a?.view||!a?.landmarks||!a?.excluded?.length||!a?.sources?.length||!a?.assetSha256)fail('muscle highlight requires anatomical meaning, sources, landmarks and base hash '+s.id);
     else{try{const hash=createHash('sha256').update(await fs.readFile(root+'/public/assets/'+s.asset+'.png')).digest('hex');if(a.assetSha256!==hash)fail('highlight source changed; re-trace anatomy '+s.id);}catch{fail('missing anatomy base '+s.id);}}
     if(s.states?.length)fail('one anatomical path cannot follow changing poses; supply separate pose-specific sprites/maps '+s.id);
    }
   }
   if(s.type==='guide'||s.type==='localCue'){
    if(s.type==='localCue'&&!['arrow','line','label','cross','angle'].includes(s.cueKind))fail('unsupported local cue '+s.id);
    const target=layers.find(l=>l.id===s.target&&l.type==='sprite');if(!target)fail('missing guide target '+s.id);
    for(const p of s.type==='guide'?[s.anchor]:(s.points??(s.point?[s.point]:[])))if(!Array.isArray(p)||p.length!==2||p.some(v=>!n(v)||v<0||v>1))fail('invalid normalized anchor '+s.id);
    if(s.type==='guide'&&(!Array.isArray(s.labelPoint)||s.labelPoint.length!==2))fail('missing label point '+s.id);
   }
   if(s.type==='calendar'&&(!Number.isInteger(s.days)||s.days<1||s.days>31))fail('invalid calendar days '+s.id);
   if(s.type==='gauge'&&(!n(s.fill)||s.fill<0||s.fill>1))fail('invalid gauge fill '+s.id);
   if(s.type==='plan'){let prev=s.a;for(const row of s.rows??[]){used.add(row.asset);if(!row.title||!row.detail||!n(row.at)||row.at<prev||row.at>=s.b)fail('invalid plan row '+s.id);prev=row.at;}if(!s.rows?.length||!n(s.rowHeight)||!n(s.pitch)||!n(s.w))fail('invalid plan geometry '+s.id);}
   if(s.type==='text'&&s.role==='spoken'){
    const normalized=x=>String(x??'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();const words=s.words??[];
    if(!plan.audio||!words.length||normalized(words.map(w=>w.text).join(' '))!==normalized(s.text))fail('spoken card needs exact own words/audio '+s.id);
    const actual=(scene.words??[]).filter(w=>w.start>=s.a-.001&&w.end<=s.b+.001);if(normalized(actual.map(w=>w.text).join(' '))!==normalized(s.text))fail('spoken card differs from aligned narration '+s.id);
   }
  }
 }
 for(const id of used){if(!meta[id]){fail('missing metadata '+id);continue;}try{const m=await sharp(root+'/public/assets/'+id+'.png').metadata();if(m.width!==meta[id].width||m.height!==meta[id].height)fail('PNG metadata mismatch '+id);}catch{fail('missing/corrupt own asset '+id);}}
 if(plan.audio&&!(await fs.stat(path.join(root,'public',plan.audio)).catch(()=>null)))fail('missing audio');
 const report={at:new Date().toISOString(),scenes:plan.scenes?.length,assets:used.size,errors,passed:!errors.length};await fs.writeFile(root+'/plan-verification.json',JSON.stringify(report,null,2));if(errors.length)throw Error(errors.join('\n'));return report;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const root=path.dirname(fileURLToPath(import.meta.url));const plan=JSON.parse((await fs.readFile(root+'/motion-plan.json','utf8')).replace(/^\uFEFF/,''));console.log(JSON.stringify(await checkPlan(root,plan)));}
