// Editable composition sketches for the existing EP1, using its approved artwork.
// Focus and contours are presentation layers. Source PNGs and the film stay intact.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';

const require=createRequire(import.meta.url),here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const argument=process.argv.indexOf('--sharp-module');
const sharp=require(argument<0?'sharp':process.argv[argument+1]);
const img=path.join(root,'episodes/ep1-v11/film/public/img');
const font=path.join(root,'skills/solo-arc-motion/engines/html-motion/assets/template/assets/fonts/Montserrat-BlackItalic.ttf');
const labelsFont=path.join(root,'episodes/ep1-v11/film/public/fonts/Jost.ttf');
const C={black:'#060606',white:'#FFFFFF',green:'#0B8371',board:'#171919'};
const W=1280,H=720;
const svg=(w,h,body)=>Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`);
const rect=(w,h,color)=>`<rect width="${w}" height="${h}" fill="${color}"/>`;
const layer=(input,left,top)=>({input,left,top});

// One uniform crop/scale per illustration; no separate body-part manipulation.
const torsoCrop={left:300,top:178,width:265,height:370};
const pairPositions=[55,695];
const cutout=async(name,crop,height,left,top,{focus=false}={})=>{
 let buffer=await sharp(path.join(img,name)).extract(crop).resize({height}).png().toBuffer();
 if(focus){
  const {width}=await sharp(buffer).metadata();
  const scale=height/crop.height;
  const sourceCenter=name==='b-w1.png'?[455,350]:[440,350];
  const cx=(sourceCenter[0]-crop.left)*scale,cy=(sourceCenter[1]-crop.top)*scale;
  const overlay=svg(width,height,`<defs><radialGradient id="f" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${220*scale}" gradientTransform="translate(0 ${cy*0.23}) scale(1 0.77)"><stop offset="0" stop-color="black" stop-opacity="0"/><stop offset="0.28" stop-color="black" stop-opacity="0"/><stop offset="0.62" stop-color="black" stop-opacity="0.48"/><stop offset="1" stop-color="black" stop-opacity="0.72"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#f)"/>`);
  buffer=await sharp(buffer).composite([{input:overlay,blend:'atop'}]).png().toBuffer();
 }
 return layer(buffer,left,top);
};
const word=async(value,size,color,left,top,maxWidth=620)=>{
 const rendered=await sharp({text:{text:`<span foreground="${color}">${value}</span>`,font:`Montserrat Heavy Italic ${size}`,fontfile:font,dpi:72,rgba:true}}).png().toBuffer();
 return layer(await sharp(rendered).resize({width:maxWidth,withoutEnlargement:true}).png().toBuffer(),left,top);
};
const label=async(value,size,color=C.white)=>sharp({text:{text:`<span foreground="${color}">${value}</span>`,font:`Jost Medium ${size}`,fontfile:labelsFont,dpi:72,rgba:true}}).png().toBuffer();
const divider=(background)=>layer(svg(W,H,`<path d="M640 42 V678" stroke="${background==='white'?'#C9CCCB':'#797C7B'}" stroke-width="3"/>`),0,0);
const waistContour=(name,left)=>{
 // Coordinates belong to these two specific source PNGs, in source pixels.
 const d=name==='b-w1.png'
  ?'M507 282 C520 317 530 352 529 389 C531 411 527 425 522 436'
  :'M470 282 C475 324 475 367 482 425';
 const scale=H/torsoCrop.height;
 return layer(svg(W,H,`<g transform="translate(${left-torsoCrop.left*scale} ${-torsoCrop.top*scale}) scale(${scale})"><path d="${d}" fill="none" stroke="${C.green}" stroke-width="5.5" stroke-linecap="round"/></g>`),0,0);
};

const designs=[
 {id:'01',title:'Световой акцент на талии',background:'black',copy:null,art:['b-w1.png','b-w3.png'],reference:'Ryoga: same-pose comparison, target lighter than surrounding anatomy'},
 {id:'02',title:'Изумрудный контур',background:'black',copy:null,art:['b-w1.png','b-w3.png'],reference:'Kaizo: a contour makes the anatomical change explicit'},
 {id:'03',title:'Живот + короткий вопрос',background:'black',copy:'STUCK?',art:['b-w1.png'],reference:'Captain Workout: one short readable phrase linked to the pictured problem'},
 {id:'04',title:'Белый фон + проблема',background:'white',copy:'STILL STUCK?',art:['m-s0.png'],reference:'Blue Gains / Primeon: light background, large body crop and short text'},
 {id:'05',title:'Герой + весы',background:'black',copy:'STUCK?',art:['h-think.png','o-scale2.png'],reference:'The Rep Theory: character plus a meaningful prop expresses the problem'},
];
const results=[];
for(const design of designs){
 const layers=[];
 if(['01','02'].includes(design.id)){
  for(let j=0;j<2;j++)layers.push(await cutout(design.art[j],torsoCrop,H,pairPositions[j],0,{focus:design.id==='01'}));
  layers.push(divider(design.background));
  if(design.id==='02')for(let j=0;j<2;j++)layers.push(waistContour(design.art[j],pairPositions[j]));
 }else if(design.id==='03'){
  layers.push(await cutout('b-w1.png',torsoCrop,H,45,0,{focus:true}));
  layers.push(await word('STUCK?',196,C.green,585,277,635));
 }else if(design.id==='04'){
  layers.push(await cutout('m-s0.png',{left:0,top:250,width:647,height:660},H,0,0));
  layers.push(await word('STILL',159,C.black,710,227,500));
  layers.push(await word('STUCK?',159,C.green,705,365,525));
 }else{
  const heroMeta=await sharp(path.join(img,'h-think.png')).metadata();
  layers.push(await cutout('h-think.png',{left:0,top:0,width:heroMeta.width,height:880},700,770,20));
  layers.push(layer(await sharp(path.join(img,'o-scale2.png')).resize({width:640}).png().toBuffer(),50,260));
  layers.push(await word('STUCK?',159,C.white,64,75,645));
 }
 const file=`concept-${design.id}.jpg`;
 const background=design.background==='white'?C.white:C.black;
 await sharp(svg(W,H,rect(W,H,background))).composite(layers).jpeg({quality:96,chromaSubsampling:'4:4:4'}).toFile(path.join(here,file));
 await sharp(path.join(here,file)).resize(320,180).jpeg({quality:94,chromaSubsampling:'4:4:4'}).toFile(path.join(here,`concept-${design.id}-small.jpg`));
 const meta=await sharp(path.join(here,file)).metadata();
 await sharp(path.join(here,file)).stats();
 results.push({...design,file,size:[meta.width,meta.height],bytes:(await fs.stat(path.join(here,file))).size,approved:false,purpose:'Composition sketch for EP1; not final high-resolution illustration'});
}

const makeBoard=async(panelW,name)=>{
 const small=panelW<=320,pad=small?20:32,gap=small?24:32,header=small?38:52;
 const panelH=Math.round(panelW*9/16),rows=Math.ceil(designs.length/2);
 const width=2*panelW+gap+2*pad,height=2*pad+rows*(header+panelH)+(rows-1)*gap;
 const layers=[];
 for(let j=0;j<designs.length;j++){
  const d=designs[j],row=Math.floor(j/2);
  const lastOdd=j===designs.length-1&&designs.length%2===1;
  const x=lastOdd?Math.round((width-panelW)/2):pad+(j%2)*(panelW+gap);
  const y=pad+row*(header+panelH+gap);
  const rendered=await sharp(await label(`${d.id}  ${d.title}`,small?21:28)).resize({width:panelW,withoutEnlargement:true}).png().toBuffer();
  layers.push(layer(rendered,x,y));
  layers.push(layer(await sharp(path.join(here,`concept-${d.id}.jpg`)).resize(panelW,panelH).png().toBuffer(),x,y+header));
 }
 await sharp(svg(width,height,rect(width,height,C.board))).composite(layers).jpeg({quality:95,chromaSubsampling:'4:4:4'}).toFile(path.join(here,name));
};
await makeBoard(768,'comparison.jpg');
await makeBoard(320,'small-comparison.jpg');
const sourceArtwork={};
for(const name of new Set(designs.flatMap(d=>d.art))){
 const buffer=await fs.readFile(path.join(img,name)),m=await sharp(buffer).metadata();
 sourceArtwork[name]={sha256:createHash('sha256').update(buffer).digest('hex'),nativeSize:[m.width,m.height]};
}
await fs.writeFile(path.join(here,'concepts.json'),JSON.stringify({date:'2026-10-11',status:'Proposal for discussion; no thumbnail style selected',episode:'Current EP1 v11 only',source_artwork_unchanged:true,source_artwork:sourceArtwork,model_requests:0,designs:results},null,2)+'\n');
const checks=[];
for(const name of [...designs.flatMap(d=>[`concept-${d.id}.jpg`,`concept-${d.id}-small.jpg`]),'comparison.jpg','small-comparison.jpg']){
 const file=path.join(here,name),metadata=await sharp(file).metadata();
 await sharp(file).stats();
 const expected=name.endsWith('-small.jpg')?[320,180]:/^concept-\d+\.jpg$/.test(name)?[W,H]:null;
 if(expected&&(metadata.width!==expected[0]||metadata.height!==expected[1]))throw new Error(`Unexpected dimensions: ${name}`);
 checks.push({file:name,decoded:true,size:[metadata.width,metadata.height],bytes:(await fs.stat(file)).size});
}
const manifest=JSON.parse(await fs.readFile(path.join(root,'provenance/CURRENT_MANIFEST.json'),'utf8'));
for(const [name,source] of Object.entries(sourceArtwork)){
 const original=manifest.files.find(f=>f.path===`episodes/ep1-v11/film/public/img/${name}`);
 if(!original||original.sha256!==source.sha256)throw new Error(`Source differs from the production manifest: ${name}`);
}
await fs.writeFile(path.join(here,'quality-check.json'),JSON.stringify({date:'2026-10-11',status:'Composition sketches; no owner approval',checks,source_hashes_match_production_manifest:true,source_artwork:sourceArtwork,model_requests:0,limitations:['Decode and size checks do not establish artistic approval.','The sketches enlarge existing illustrations; no new high-resolution drawing was generated.','Human visual review is recorded in README_RU.md; this script performs technical checks only.']},null,2)+'\n');
console.log(JSON.stringify({concepts:results.length,size:[W,H],model_requests:0,final_style_selected:false}));
