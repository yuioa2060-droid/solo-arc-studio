// Export complete A6API thumbnail edits and review sheets. No arrow, body,
// caption or lighting is assembled here: each candidate is one generated image.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const require=createRequire(import.meta.url);
const ix=process.argv.indexOf('--sharp-module');
const sharp=require(ix<0?'sharp':process.argv[ix+1]);
const out=path.join(here,'attention');
await fs.mkdir(out,{recursive:true});
const defs=[
 {id:'B',key:'01-straight-arrow',name:'Прямая стрелка',source:'assets/attention-straight.png'},
 {id:'C',key:'02-curved-arrow',name:'Стрелка на талию',source:'assets/attention-curved.png'},
 {id:'D',key:'03-waist-closeup',name:'Крупнее талия, без стрелки',source:'assets/attention-closeup.png'}
];
const records=[];
for(const def of defs){
 const source=await fs.readFile(path.join(here,def.source));
 const meta=await sharp(source).metadata();
 const width=Math.floor(Math.min(1664,meta.width)/16)*16,height=width*9/16;
 if(meta.height<height)throw Error('Unexpected source shape; do not enlarge artwork.');
 const bytes=await sharp(source).resize(width,height,{fit:'cover',position:'centre',withoutEnlargement:true}).png().toBuffer();
 const file=path.join(out,def.key+'.png');
 await fs.writeFile(file,bytes);
 await sharp(bytes).resize(1280,720).jpeg({quality:96,chromaSubsampling:'4:4:4'}).toFile(path.join(out,def.key+'.jpg'));
 await sharp(bytes).resize(320,180).jpeg({quality:96,chromaSubsampling:'4:4:4'}).toFile(path.join(out,def.key+'-small.jpg'));
 await sharp(bytes).raw().toBuffer();
 records.push({...def,file:'attention/'+def.key+'.png',source_size:[meta.width,meta.height],export_size:[width,height],bytes:bytes.length,source_sha256:createHash('sha256').update(source).digest('hex'),export_sha256:createHash('sha256').update(bytes).digest('hex'),artwork_origin:'Complete A6API edit of the thumbnail; only uniform export/crop afterward',approved:false});
}
const controls=[{id:'A',name:'Текущее превью',file:'thumbnail.png'},...records];
const svg=(w,h,body)=>Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${body}</svg>`);
const font=path.join(root,'episodes/ep1-v11/film/public/fonts/Jost.ttf');
async function label(value,size,width){
 return sharp({text:{text:`<span foreground="#FFFFFF">${value}</span>`,font:`Jost Medium ${size}`,fontfile:font,dpi:72,rgba:true}}).resize({width,withoutEnlargement:true}).png().toBuffer();
}
async function sheet(w,gap,pad,captionH,fontSize){
 const thumbH=w*9/16,rowH=thumbH+captionH+gap;
 const boardW=pad*2+w*2+gap,boardH=pad*2+rowH*2-gap;
 const layers=[];
 for(const [i,item] of controls.entries()){
  const left=pad+(i%2)*(w+gap),top=pad+Math.floor(i/2)*rowH;
  layers.push({input:await label(item.id+' — '+item.name,fontSize,w),left,top});
  layers.push({input:await sharp(path.join(here,item.file)).resize(w,thumbH).png().toBuffer(),left,top:top+captionH});
 }
 return sharp(svg(boardW,boardH,`<rect width="${boardW}" height="${boardH}" fill="#151716"/>`)).composite(layers).jpeg({quality:96,chromaSubsampling:'4:4:4'}).toBuffer();
}
await fs.writeFile(path.join(out,'comparison.jpg'),await sheet(960,24,24,44,27));
await fs.writeFile(path.join(out,'small-comparison.jpg'),await sheet(320,22,22,32,17));
const generation=JSON.parse(await fs.readFile(path.join(here,'assets/attention-generation.json'),'utf8'));
const metadata={date:'2026-10-12',status:'New thumbnail proposals; owner selection pending',current_thumbnail_replaced:false,control:'thumbnail.png',new_service:'A6API',candidate_count:3,generation_request_count:generation.requests.length,generation_billed_usd:generation.total_billed_usd,letters_and_arrows_generated_together:true,bodies_generated_together:true,decoding_checked:true,no_artwork_enlargement:true,visual_review_completed:false,candidates:records};
await fs.writeFile(path.join(out,'quality-check.json'),JSON.stringify(metadata,null,2)+'\n');
console.log(JSON.stringify({candidates:records.length,size:records.map(r=>r.export_size),requests:generation.requests.length,main_thumbnail_replaced:false}));
