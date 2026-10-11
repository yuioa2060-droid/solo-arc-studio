// Current EP1 thumbnail refinements: source-bound abdominal focus and editable copy.
// Each source illustration uses one uniform crop/scale. Source PNGs stay intact.
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
const fonts=path.join(root,'skills/solo-arc-motion/engines/html-motion/assets/template/assets/fonts');
const labelsFont=path.join(root,'episodes/ep1-v11/film/public/fonts/Jost.ttf');
const C={black:'#060606',white:'#FFFFFF',green:'#0B8371',divider:'#B9BDBC',board:'#171919'};
const W=1280,H=720,crop={left:300,top:178,width:265,height:370},positions=[55,695];
const focus={
 'b-w1.png':'M414 279 C440 297 481 296 507 279 C522 318 534 362 529 398 C529 414 527 427 521 436 C480 436 446 425 410 417 C400 382 397 351 404 323 C410 304 413 290 414 279 Z',
 'b-w3.png':'M413 280 C432 290 454 289 470 282 C475 319 475 371 482 425 L413 417 C404 382 401 348 411 310 Z',
};
const outsideDim=0.70,featherSource=0.8,dividerWidth=10;
const svg=(w,h,body)=>Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`);
const rect=(w,h,color)=>`<rect width="${w}" height="${h}" fill="${color}"/>`;
const layer=(input,left,top)=>({input,left,top});
const focusedBody=async(name,left)=>{
 const scale=H/crop.height;
 let buffer=await sharp(path.join(img,name)).extract(crop).resize({height:H}).png().toBuffer();
 const {width}=await sharp(buffer).metadata();
 const overlay=svg(width,H,`<defs><filter id="edge" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${featherSource}"/></filter><mask id="outside" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${H}" style="mask-type:luminance"><rect width="100%" height="100%" fill="white"/><g transform="scale(${scale}) translate(${-crop.left} ${-crop.top})"><path d="${focus[name]}" fill="black" filter="url(#edge)"/></g></mask></defs><rect width="100%" height="100%" fill="black" opacity="${outsideDim}" mask="url(#outside)"/>`);
 buffer=await sharp(buffer).composite([{input:overlay,blend:'atop'}]).png().toBuffer();
 return layer(buffer,left,0);
};
const escapeXml=value=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const textLayer=async(runs,{size=106,style='italic',box,align='center'}={})=>{
 const fontfile=path.join(fonts,style==='italic'?'Montserrat-BlackItalic.ttf':'Montserrat-Black.ttf');
 const font=style==='italic'?`Montserrat Heavy Italic ${size}`:`Montserrat Heavy ${size}`;
 const text=runs.map(([value,color])=>`<span foreground="${color}">${escapeXml(value)}</span>`).join('');
 let buffer=await sharp({text:{text,font,fontfile,dpi:72,rgba:true}}).png().toBuffer();
 buffer=await sharp(buffer).resize({width:box.width,height:box.height,fit:'inside',withoutEnlargement:true}).png().toBuffer();
 const m=await sharp(buffer).metadata();
 const x=align==='left'?box.left:align==='right'?box.left+box.width-m.width:box.left+Math.round((box.width-m.width)/2);
 return layer(buffer,x,box.top+Math.round((box.height-m.height)/2));
};
const label=async(value,size)=>sharp({text:{text:`<span foreground="white">${escapeXml(value)}</span>`,font:`Jost Medium ${size}`,fontfile:labelsFont,dpi:72,rgba:true}}).png().toBuffer();
const rightBox={left:664,top:588,width:586,height:104};
const leftBox={left:30,top:588,width:580,height:104};
const designs=[
 {id:'01',title:'12 WEEKS — в строку',copy:'12 WEEKS',layout:'single line, lower right',font:'Montserrat Black Italic'},
 {id:'02',title:'12 WEEKS — крупная цифра',copy:'12 WEEKS',layout:'large numeral, lower right',font:'Montserrat Black'},
 {id:'03',title:'WEEK 1 / WEEK 12',copy:'WEEK 1 / WEEK 12',layout:'paired lower labels',font:'Montserrat Black'},
 {id:'04',title:'LOSE FAT',copy:'LOSE FAT',layout:'single line, lower right',font:'Montserrat Black Italic'},
 {id:'05',title:'3 SIGNALS',copy:'3 SIGNALS',layout:'single line, lower right',font:'Montserrat Black Italic'},
 {id:'06',title:'STUCK?',copy:'STUCK?',layout:'question under the starting body',font:'Montserrat Black Italic'},
];
const bodies=await Promise.all(Object.keys(focus).map((name,j)=>focusedBody(name,positions[j])));
const separator=layer(svg(W,H,`<rect x="${W/2-dividerWidth/2}" y="0" width="${dividerWidth}" height="${H}" fill="${C.divider}"/>`),0,0);
const results=[];
for(const design of designs){
 const layers=[...bodies,separator];
 if(design.id==='01'){
  layers.push(await textLayer([['12 ',C.white],['WEEKS',C.green]],{box:rightBox,size:116}));
 }else if(design.id==='02'){
  layers.push(await textLayer([['12',C.green]],{style:'upright',size:200,box:{left:678,top:523,width:206,height:173}}));
  layers.push(await textLayer([['WEEKS',C.white]],{style:'upright',size:100,box:{left:890,top:589,width:351,height:105}}));
 }else if(design.id==='03'){
  layers.push(await textLayer([['WEEK 1',C.white]],{style:'upright',size:106,box:leftBox}));
  layers.push(await textLayer([['WEEK ',C.white],['12',C.green]],{style:'upright',size:106,box:rightBox}));
 }else if(design.id==='04'){
  layers.push(await textLayer([['LOSE ',C.white],['FAT',C.green]],{box:rightBox,size:116}));
 }else if(design.id==='05'){
  layers.push(await textLayer([['3 ',C.white],['SIGNALS',C.green]],{box:rightBox,size:116}));
 }else{
  layers.push(await textLayer([['STUCK',C.white],['?',C.green]],{box:leftBox,size:138}));
 }
 const file=`concept-${design.id}.jpg`;
 await sharp(svg(W,H,rect(W,H,C.black))).composite(layers).jpeg({quality:96,chromaSubsampling:'4:4:4'}).toFile(path.join(here,file));
 await sharp(path.join(here,file)).resize(320,180).jpeg({quality:94,chromaSubsampling:'4:4:4'}).toFile(path.join(here,`concept-${design.id}-small.jpg`));
 const metadata=await sharp(path.join(here,file)).metadata();
 results.push({...design,file,size:[metadata.width,metadata.height],bytes:(await fs.stat(path.join(here,file))).size,approved:false,purpose:'Refinement of the chosen light-focus composition; caption not selected'});
}

const makeBoard=async(panelW,name)=>{
 const small=panelW<=320,pad=small?20:32,gap=small?24:32,header=small?38:52;
 const panelH=Math.round(panelW*9/16),rows=Math.ceil(designs.length/2);
 const width=2*panelW+gap+2*pad,height=2*pad+rows*(header+panelH)+(rows-1)*gap;
 const layers=[];
 for(let j=0;j<designs.length;j++){
  const design=designs[j],row=Math.floor(j/2),x=pad+(j%2)*(panelW+gap),y=pad+row*(header+panelH+gap);
  const rendered=await sharp(await label(`${design.id}  ${design.title}`,small?21:28)).resize({width:panelW,withoutEnlargement:true}).png().toBuffer();
  layers.push(layer(rendered,x,y));
  layers.push(layer(await sharp(path.join(here,`concept-${design.id}.jpg`)).resize(panelW,panelH).png().toBuffer(),x,y+header));
 }
 await sharp(svg(width,height,rect(width,height,C.board))).composite(layers).jpeg({quality:95,chromaSubsampling:'4:4:4'}).toFile(path.join(here,name));
};
await makeBoard(768,'comparison.jpg');
await makeBoard(320,'small-comparison.jpg');

const sourceArtwork={};
for(const name of Object.keys(focus)){
 const buffer=await fs.readFile(path.join(img,name)),metadata=await sharp(buffer).metadata();
 sourceArtwork[name]={sha256:createHash('sha256').update(buffer).digest('hex'),nativeSize:[metadata.width,metadata.height]};
}
const manifest=JSON.parse(await fs.readFile(path.join(root,'provenance/CURRENT_MANIFEST.json'),'utf8'));
for(const [name,source] of Object.entries(sourceArtwork)){
 const original=manifest.files.find(file=>file.path===`episodes/ep1-v11/film/public/img/${name}`);
 if(!original||original.sha256!==source.sha256)throw new Error(`Source differs from the production manifest: ${name}`);
}
const checks=[];
for(const name of [...designs.flatMap(design=>[`concept-${design.id}.jpg`,`concept-${design.id}-small.jpg`]),'comparison.jpg','small-comparison.jpg']){
 const file=path.join(here,name),metadata=await sharp(file).metadata();
 await sharp(file).stats();
 const expected=name.endsWith('-small.jpg')?[320,180]:/^concept-\d+\.jpg$/.test(name)?[W,H]:null;
 if(expected&&(metadata.width!==expected[0]||metadata.height!==expected[1]))throw new Error(`Unexpected dimensions: ${name}`);
 checks.push({file:name,decoded:true,size:[metadata.width,metadata.height],bytes:(await fs.stat(file)).size});
}
const status='Light-focus direction chosen for refinement; final caption and illustration not selected';
await fs.writeFile(path.join(here,'concepts.json'),JSON.stringify({date:'2026-10-11',status,episode:'Current EP1 v11 only',source_artwork_unchanged:true,source_artwork:sourceArtwork,model_requests:0,focus:{region:'abdomen below the chest and above the waistband; exclude arm',paths_in_source_pixels:focus,crop,uniform_scale:H/crop.height,outside_dim_opacity:outsideDim,edge_feather_source_pixels:featherSource},divider:{x:640,width:dividerWidth,from:0,to:H,color:C.divider},designs:results},null,2)+'\n');
await fs.writeFile(path.join(here,'quality-check.json'),JSON.stringify({date:'2026-10-11',status,checks,source_hashes_match_production_manifest:true,source_artwork:sourceArtwork,model_requests:0,limitations:['Decode and size checks do not establish artistic approval.','The sketches enlarge existing illustrations; no new high-resolution drawing was generated.','Human visual review is recorded in README_RU.md; this script performs technical checks only.']},null,2)+'\n');
console.log(JSON.stringify({concepts:results.length,size:[W,H],focus:'source-bound abdomen',divider_width:dividerWidth,divider_full_height:true,model_requests:0,caption_selected:false}));
