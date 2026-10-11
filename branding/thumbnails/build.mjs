// Current EP1: local soft light, small centered "12 WEEKS", interrupted divider.
// Font variants are native editable layout; source artwork is not redrawn or warped.
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
const mortFonts='skills/solo-arc-motion/engines/html-motion/assets/template/assets/fonts';
const labelsFont=path.join(root,'episodes/ep1-v11/film/public/fonts/Jost.ttf');
const C={black:'#060606',white:'#FFFFFF',green:'#0B8371',divider:'#B9BDBC',board:'#171919'};
const W=1280,H=720,crop={left:300,top:178,width:265,height:370},positions=[55,695];
const focus={
 'b-w1.png':{cx:513,cy:355,rx:105,ry:113},
 'b-w3.png':{cx:481,cy:354,rx:68,ry:110},
};
const stops=[[0,0],[0.48,0],[0.68,0.14],[0.90,0.65],[1,0.78]];
const dividerWidth=10,dividerGap=82;
const svg=(w,h,body)=>Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`);
const rect=(w,h,color)=>`<rect width="${w}" height="${h}" fill="${color}"/>`;
const layer=(input,left,top)=>({input,left,top});
const escapeXml=value=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const focusedBody=async(name,left)=>{
 const scale=H/crop.height,{cx,cy,rx,ry}=focus[name];
 let buffer=await sharp(path.join(img,name)).extract(crop).resize({height:H}).png().toBuffer();
 const {width}=await sharp(buffer).metadata();
 const gradient=stops.map(([offset,opacity])=>`<stop offset="${offset}" stop-color="black" stop-opacity="${opacity}"/>`).join('');
 const overlay=svg(width,H,`<defs><radialGradient id="light" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="translate(${(cx-crop.left)*scale} ${(cy-crop.top)*scale}) scale(${rx*scale} ${ry*scale})">${gradient}</radialGradient></defs><rect width="100%" height="100%" fill="url(#light)"/>`);
 buffer=await sharp(buffer).composite([{input:overlay,blend:'atop'}]).png().toBuffer();
 return layer(buffer,left,0);
};
const designs=[
 {id:'01',title:'Jost Medium',copy:'12 WEEKS',font:'Jost Medium',size:48,fontFile:'episodes/ep1-v11/film/public/fonts/Jost.ttf'},
 {id:'02',title:'Montserrat Bold',copy:'12 WEEKS',font:'Montserrat Bold',size:43,fontFile:`${mortFonts}/Montserrat-Bold.ttf`},
 {id:'03',title:'Montserrat Black Italic',copy:'12 WEEKS',font:'Montserrat Heavy Italic',size:42,fontFile:`${mortFonts}/Montserrat-BlackItalic.ttf`},
 {id:'04',title:'DM Serif Display',copy:'12 WEEKS',font:'DM Serif Display',size:44,fontFile:'branding/fonts/DMSerifDisplay-Regular.ttf'},
 {id:'05',title:'JetBrains Mono',copy:'12 WEEKS',font:'JetBrains Mono',size:36,fontFile:`${mortFonts}/JetBrainsMono-Regular.ttf`},
 {id:'06',title:'Caveat Bold',copy:'12 weeks',font:'Caveat Bold',size:56,fontFile:'branding/fonts/Caveat.ttf'},
];
const caption=async design=>{
 let buffer=await sharp({text:{text:`<span foreground="${C.white}">${escapeXml(design.copy)}</span>`,font:`${design.font} ${design.size}`,fontfile:path.join(root,design.fontFile),dpi:72,rgba:true}}).png().toBuffer();
 buffer=await sharp(buffer).resize({width:196,height:42,fit:'inside',withoutEnlargement:true}).png().toBuffer();
 const metadata=await sharp(buffer).metadata();
 return {placement:layer(buffer,Math.round((W-metadata.width)/2),Math.round((H-metadata.height)/2)),size:[metadata.width,metadata.height]};
};
const label=async(value,size)=>sharp({text:{text:`<span foreground="white">${escapeXml(value)}</span>`,font:`Jost Medium ${size}`,fontfile:labelsFont,dpi:72,rgba:true}}).png().toBuffer();
const bodies=await Promise.all(Object.keys(focus).map((name,j)=>focusedBody(name,positions[j])));
const lineTopEnd=(H-dividerGap)/2,lineBottomStart=(H+dividerGap)/2;
const separator=layer(svg(W,H,`<rect x="${W/2-dividerWidth/2}" y="0" width="${dividerWidth}" height="${lineTopEnd}" fill="${C.divider}"/><rect x="${W/2-dividerWidth/2}" y="${lineBottomStart}" width="${dividerWidth}" height="${H-lineBottomStart}" fill="${C.divider}"/>`),0,0);
const results=[];
for(const design of designs){
 const text=await caption(design),file=`concept-${design.id}.jpg`;
 await sharp(svg(W,H,rect(W,H,C.black))).composite([...bodies,separator,text.placement]).jpeg({quality:96,chromaSubsampling:'4:4:4'}).toFile(path.join(here,file));
 await sharp(path.join(here,file)).resize(320,180).jpeg({quality:94,chromaSubsampling:'4:4:4'}).toFile(path.join(here,`concept-${design.id}-small.jpg`));
 const metadata=await sharp(path.join(here,file)).metadata();
 results.push({...design,file,size:[metadata.width,metadata.height],caption_pixels:text.size,caption_box:{left:text.placement.left,top:text.placement.top,width:text.size[0],height:text.size[1]},bytes:(await fs.stat(path.join(here,file))).size,approved:false,purpose:'Font variants for the requested small centered caption; lighting and font under review'});
}

const makeBoard=async(panelW,name,{centerCrop=false}={})=>{
 const small=panelW<=320,pad=small?20:32,gap=small?24:32,header=small?38:52;
 const panelH=centerCrop?Math.round(panelW/2):Math.round(panelW*9/16),rows=Math.ceil(designs.length/2);
 const width=2*panelW+gap+2*pad,height=2*pad+rows*(header+panelH)+(rows-1)*gap;
 const layers=[];
 for(let j=0;j<designs.length;j++){
  const design=designs[j],row=Math.floor(j/2),x=pad+(j%2)*(panelW+gap),y=pad+row*(header+panelH+gap);
  const rendered=await sharp(await label(`${design.id}  ${design.title}`,small?21:28)).resize({width:panelW,withoutEnlargement:true}).png().toBuffer();
  layers.push(layer(rendered,x,y));
  let panel=sharp(path.join(here,`concept-${design.id}.jpg`));
  if(centerCrop)panel=panel.extract({left:480,top:280,width:320,height:160});
  layers.push(layer(await panel.resize(panelW,panelH).png().toBuffer(),x,y+header));
 }
 await sharp(svg(width,height,rect(width,height,C.board))).composite(layers).jpeg({quality:95,chromaSubsampling:'4:4:4'}).toFile(path.join(here,name));
};
await makeBoard(768,'comparison.jpg');
await makeBoard(320,'small-comparison.jpg');
await makeBoard(480,'font-comparison.jpg',{centerCrop:true});

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
for(const name of [...designs.flatMap(design=>[`concept-${design.id}.jpg`,`concept-${design.id}-small.jpg`]),'comparison.jpg','small-comparison.jpg','font-comparison.jpg']){
 const file=path.join(here,name),metadata=await sharp(file).metadata();
 await sharp(file).stats();
 const expected=name.endsWith('-small.jpg')?[320,180]:/^concept-\d+\.jpg$/.test(name)?[W,H]:null;
 if(expected&&(metadata.width!==expected[0]||metadata.height!==expected[1]))throw new Error(`Unexpected dimensions: ${name}`);
 checks.push({file:name,decoded:true,size:[metadata.width,metadata.height],bytes:(await fs.stat(file)).size});
}
const status='12 WEEKS and small centered placement requested; font and refined soft lighting under review';
await fs.writeFile(path.join(here,'concepts.json'),JSON.stringify({date:'2026-10-11',status,episode:'Current EP1 v11 only',source_artwork_unchanged:true,source_artwork:sourceArtwork,model_requests:0,focus:{type:'elliptical soft falloff aimed at the front of the abdomen; no anatomical cutout',ellipses_in_source_pixels:focus,black_opacity_stops:stops,crop,uniform_scale:H/crop.height},divider:{x:640,width:dividerWidth,top:[0,lineTopEnd],bottom:[lineBottomStart,H],gap:dividerGap,color:C.divider},caption:{center:[640,360],max_size:[196,42],color:C.white},font_preview:{file:'font-comparison.jpg',source_crop:{left:480,top:280,width:320,height:160},uniform_enlargement:1.5},designs:results},null,2)+'\n');
await fs.writeFile(path.join(here,'quality-check.json'),JSON.stringify({date:'2026-10-11',status,checks,source_hashes_match_production_manifest:true,source_artwork:sourceArtwork,model_requests:0,limitations:['Decode and size checks do not establish artistic approval.','The sketches enlarge existing illustrations; no new high-resolution drawing was generated.','Human visual review is recorded in README_RU.md; this script performs technical checks only.']},null,2)+'\n');
console.log(JSON.stringify({concepts:results.length,size:[W,H],focus:'soft localized elliptical falloff',divider_width:dividerWidth,divider_gap:dividerGap,caption_center:[640,360],model_requests:0,font_selected:false}));
