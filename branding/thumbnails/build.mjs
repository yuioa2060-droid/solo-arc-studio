// Current EP1: newly drawn body pair, preferred font 03, two central caption sizes.
// Typography and divider remain native editable layout.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';

const require=createRequire(import.meta.url),here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..'),argument=process.argv.indexOf('--sharp-module');
const sharp=require(argument<0?'sharp':process.argv[argument+1]);
const mortFonts='skills/solo-arc-motion/engines/html-motion/assets/template/assets/fonts';
const labelsFont=path.join(root,'episodes/ep1-v11/film/public/fonts/Jost.ttf');
const artPath=path.join(here,'assets/body-pair.png'),art=await fs.readFile(artPath);
const artMeta=await sharp(art).metadata();
const C={black:'#060606',white:'#FFFFFF',divider:'#B9BDBC',board:'#171919'};
const W=1280,H=720,nativeWidth=1664,nativeHeight=936,dividerWidth=10,dividerGap=96;
const svg=(w,h,body)=>Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`);
const rect=(w,h,color)=>`<rect width="${w}" height="${h}" fill="${color}"/>`;
const layer=(input,left,top)=>({input,left,top});
const escapeXml=value=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const designs=[
 {id:'03-a',title:'A — 268 px',copy:'12 WEEKS',font:'Montserrat Heavy Italic',size:80,maxWidth:268,fontFile:`${mortFonts}/Montserrat-BlackItalic.ttf`},
 {id:'03-b',title:'B — 304 px',copy:'12 WEEKS',font:'Montserrat Heavy Italic',size:80,maxWidth:304,fontFile:`${mortFonts}/Montserrat-BlackItalic.ttf`},
];
const caption=async(design,width,height)=>{
 const scale=width/W;
 let buffer=await sharp({text:{text:`<span foreground="${C.white}">${escapeXml(design.copy)}</span>`,font:`${design.font} ${design.size*scale}`,fontfile:path.join(root,design.fontFile),dpi:72,rgba:true}}).png().toBuffer();
 buffer=await sharp(buffer).resize({width:Math.round(design.maxWidth*scale),height:Math.round(64*scale),fit:'inside',withoutEnlargement:true}).png().toBuffer();
 const metadata=await sharp(buffer).metadata();
 return {placement:layer(buffer,Math.round((width-metadata.width)/2),Math.round((height-metadata.height)/2)),size:[metadata.width,metadata.height]};
};
const compose=async(design,width,height)=>{
 const scale=width/W,text=await caption(design,width,height);
 const divider=layer(svg(width,height,`<rect x="${width/2-dividerWidth*scale/2}" y="0" width="${dividerWidth*scale}" height="${(height-dividerGap*scale)/2}" fill="${C.divider}"/><rect x="${width/2-dividerWidth*scale/2}" y="${(height+dividerGap*scale)/2}" width="${dividerWidth*scale}" height="${(height-dividerGap*scale)/2}" fill="${C.divider}"/>`),0,0);
 const bodies=await sharp(art).resize(width,height,{fit:'cover'}).png().toBuffer();
 const buffer=await sharp(svg(width,height,rect(width,height,C.black))).composite([layer(bodies,0,0),divider,text.placement]).png().toBuffer();
 return {buffer,text};
};
const label=async(value,size)=>sharp({text:{text:`<span foreground="white">${escapeXml(value)}</span>`,font:`Jost Medium ${size}`,fontfile:labelsFont,dpi:72,rgba:true}}).png().toBuffer();
const results=[];
for(const design of designs){
 const rendered=await compose(design,W,H),file=`concept-${design.id}.jpg`;
 await sharp(rendered.buffer).jpeg({quality:98,chromaSubsampling:'4:4:4'}).toFile(path.join(here,file));
 await sharp(rendered.buffer).resize(320,180).jpeg({quality:96,chromaSubsampling:'4:4:4'}).toFile(path.join(here,`concept-${design.id}-small.jpg`));
 results.push({...design,file,size:[W,H],caption_pixels:rendered.text.size,caption_box:{left:rendered.text.placement.left,top:rendered.text.placement.top,width:rendered.text.size[0],height:rendered.text.size[1]},bytes:(await fs.stat(path.join(here,file))).size,approved:false,purpose:'Enlarged preferred font 03 with newly generated artwork; final size and artwork under review'});
}
const native=await compose(designs[1],nativeWidth,nativeHeight);
await fs.writeFile(path.join(here,'thumbnail.png'),native.buffer);
const makeBoard=async(panelW,name)=>{
 const small=panelW<=320,pad=small?20:32,gap=small?24:32,header=small?38:52;
 const panelH=Math.round(panelW*9/16),width=2*panelW+gap+2*pad,height=2*pad+header+panelH;
 const layers=[];
 for(let j=0;j<designs.length;j++){
  const design=designs[j],x=pad+j*(panelW+gap);
  const rendered=await sharp(await label(`${design.id}  ${design.title}`,small?21:28)).resize({width:panelW,withoutEnlargement:true}).png().toBuffer();
  layers.push(layer(rendered,x,pad));
  layers.push(layer(await sharp(path.join(here,`concept-${design.id}.jpg`)).resize(panelW,panelH).png().toBuffer(),x,pad+header));
 }
 await sharp(svg(width,height,rect(width,height,C.board))).composite(layers).jpeg({quality:97,chromaSubsampling:'4:4:4'}).toFile(path.join(here,name));
};
await makeBoard(768,'comparison.jpg');
await makeBoard(320,'small-comparison.jpg');

const sourceArtwork={};
for(const name of ['b-w1.png','b-w3.png']){
 const buffer=await fs.readFile(path.join(root,'episodes/ep1-v11/film/public/img',name));
 sourceArtwork[name]={sha256:createHash('sha256').update(buffer).digest('hex')};
}
const manifest=JSON.parse(await fs.readFile(path.join(root,'provenance/CURRENT_MANIFEST.json'),'utf8'));
for(const [name,source] of Object.entries(sourceArtwork)){
 const original=manifest.files.find(file=>file.path===`episodes/ep1-v11/film/public/img/${name}`);
 if(!original||original.sha256!==source.sha256)throw new Error(`Episode source differs from the production manifest: ${name}`);
}
const checks=[];
for(const name of [...designs.flatMap(design=>[`concept-${design.id}.jpg`,`concept-${design.id}-small.jpg`]),'comparison.jpg','small-comparison.jpg','thumbnail.png']){
 const file=path.join(here,name),metadata=await sharp(file).metadata();
 await sharp(file).stats();
 const expected=name==='thumbnail.png'?[nativeWidth,nativeHeight]:name.endsWith('-small.jpg')?[320,180]:/^concept-03-[ab]\.jpg$/.test(name)?[W,H]:null;
 if(expected&&(metadata.width!==expected[0]||metadata.height!==expected[1]))throw new Error(`Unexpected dimensions: ${name}`);
 checks.push({file:name,decoded:true,size:[metadata.width,metadata.height],bytes:(await fs.stat(file)).size});
}
const alphaStats=await sharp(art).stats();
if(!artMeta.hasAlpha||alphaStats.channels[3].min!==0||alphaStats.channels[3].max!==255)throw new Error('Generated artwork does not contain a transparent background and opaque subjects');
if(artMeta.width<nativeWidth||artMeta.height<nativeHeight)throw new Error('Native export must not enlarge generated artwork');
const generatedArtwork={file:'assets/body-pair.png',sha256:createHash('sha256').update(art).digest('hex'),native_size:[artMeta.width,artMeta.height],has_alpha:artMeta.hasAlpha,artwork_generation:'Built-in image_gen; one fresh redraw',generation_record:'assets/generation.json'};
const status='Font 03 preferred; body pair regenerated on request; final artwork and caption size under review';
await fs.writeFile(path.join(here,'concepts.json'),JSON.stringify({date:'2026-10-11',status,episode:'Current EP1 v11 only',episode_source_artwork_unchanged:true,episode_source_artwork:sourceArtwork,generated_artwork:generatedArtwork,model_requests_during_build:0,focus:'Soft localized lighting included in the generated artwork; no hard anatomical mask',native_export:{file:'thumbnail.png',size:[nativeWidth,nativeHeight],uniform_fit:'cover; slight crop for exact 16:9; no enlargement',caption_pixels:native.text.size},divider:{center:640,width:dividerWidth,top:[0,312],bottom:[408,H],gap:dividerGap,color:C.divider},caption:{center:[640,360],previous_width:196,color:C.white},designs:results},null,2)+'\n');
await fs.writeFile(path.join(here,'quality-check.json'),JSON.stringify({date:'2026-10-11',status,checks,generated_artwork:generatedArtwork,alpha_extrema:[alphaStats.channels[3].min,alphaStats.channels[3].max],native_export_does_not_upscale:true,episode_source_hashes_match_manifest:true,episode_source_artwork:sourceArtwork,model_requests_during_build:0,limitations:['Decode and size checks do not establish artistic approval.','The generated native artwork is 1672 × 941; this is not a 4K generation.','Human visual review is recorded in README_RU.md; this script performs technical checks only.']},null,2)+'\n');
console.log(JSON.stringify({concepts:results.length,artwork_size:[artMeta.width,artMeta.height],native_export:[nativeWidth,nativeHeight],model_requests_during_build:0,preferred_font:'03 — Montserrat Black Italic'}));
