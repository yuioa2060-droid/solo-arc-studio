// Three original Rendo layouts, each on black and white. Uses existing A6API
// artwork and editable lettering/geometry. Rebuilding sends no model requests.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const index=process.argv.indexOf('--sharp-module');
const sharp=require(index<0?'sharp':process.argv[index+1]);
const W=2560,H=1440,G='#0B8371',B='#060606',WHITE='#FFFFFF';
const out=path.join(here,'options/rendo');
await fs.mkdir(out,{recursive:true});
const mobile={left:507,top:508,width:1546,height:423};
const conservative={left:530,top:520,width:1500,height:400};
const desktop={left:0,top:508,width:2560,height:423};
const F={
 anton:{family:'Anton',file:path.join(here,'fonts/Anton-Regular.ttf')},
 bebas:{family:'Bebas Neue',file:path.join(here,'fonts/BebasNeue-Regular.ttf')},
 bangers:{family:'Bangers',file:path.join(here,'fonts/Bangers-Regular.ttf')},
 label:{family:'Jost',file:path.join(root,'episodes/ep1-v11/film/public/fonts/Jost.ttf')}
};
const svg=(w,h,body)=>Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`);
const rectangle=(x,y,w,h,color,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" ${extra}/>`;
const layer=(input,left=0,top=0)=>({input,left:Math.round(left),top:Math.round(top)});
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
async function lettering(value,font,size,color,maxW=Infinity,maxH=Infinity){
 const raw=await sharp({text:{text:`<span foreground="${color}">${esc(value)}</span>`,font:`${font.family} ${size}`,fontfile:font.file,dpi:72,rgba:true}}).png().toBuffer();
 const meta=await sharp(raw).metadata();
 const scale=Math.min(1,maxW/meta.width,maxH/meta.height);
 const input=scale<1?await sharp(raw).resize({width:Math.round(meta.width*scale)}).png().toBuffer():raw;
 const m=await sharp(input).metadata();
 return {input,width:m.width,height:m.height};
}
const sourcePaths={
 cross:path.join(root,'episodes/ep1-v11/film/public/img/h-cross.png'),
 think:path.join(root,'episodes/ep1-v11/film/public/img/h-think.png')
};
const sources={};
for(const [key,p] of Object.entries(sourcePaths)){
 const bytes=await fs.readFile(p);
 const m=await sharp(bytes).metadata();
 if(!m.hasAlpha)throw Error('Existing prepared A6API art needs alpha: '+key);
 const rawAudit=JSON.parse(await fs.readFile(path.join(root,`episodes/ep1-v11/raw/h-${key}.png.audit.json`),'utf8'));
 if(rawAudit.endpoint!=='https://a6.a6api.com/v1/images/edits'||rawAudit.httpStatus!==200)throw Error('Missing A6API origin: '+key);
 sources[key]={bytes,width:m.width,height:m.height,sha256:createHash('sha256').update(bytes).digest('hex'),audit:rawAudit};
}
async function character(key,width,x,y,mask=null){
 if(width>sources[key].width)throw Error('Character enlargement is unnecessary for this banner.');
 let bytes=await sharp(sources[key].bytes).resize({width}).png().toBuffer();
 const canvas=await sharp(svg(W,H,'')).composite([layer(bytes,x,y)]).png().toBuffer();
 return mask?await sharp(canvas).composite([{input:svg(W,H,mask),blend:'dest-in'}]).png().toBuffer():canvas;
}
const definitions=[
 {key:'letter-o',title:'Портрет внутри буквы',font:F.anton,asset:'think'},
 {key:'center',title:'Герой между буквами',font:F.bebas,asset:'cross'},
 {key:'ribbon',title:'Изумрудная лента',font:F.bangers,asset:'think'}
];
const records=[];
for(const [di,def] of definitions.entries()){
 for(const [bi,background] of [B,WHITE].entries()){
  const id=String(di*2+bi+1).padStart(2,'0');
  const foreground=background===B?WHITE:B;
  const layers=[];
  const textBoxes=[];
  let faceBox,accent;
  if(def.key==='letter-o'){
   const word=await lettering('REND',def.font,366,foreground,865,282);
   const oW=318,oH=318,gap=32,total=word.width+gap+oW,x=Math.round((W-total)/2),oy=561;
   const wordY=Math.round(720-word.height/2);
   layers.push(layer(word.input,x,wordY));
   textBoxes.push({text:'REND',box:[x,wordY,word.width,word.height]});
   const ox=x+word.width+gap;
   const window=`<ellipse cx="${ox+oW/2}" cy="${oy+oH/2}" rx="119" ry="120" fill="white"/>`;
   const portraitWidth=325,portraitX=ox+(oW-portraitWidth)/2,portraitY=585;
   layers.push(layer(await character('think',portraitWidth,portraitX,portraitY,window)));
   layers.push(layer(svg(W,H,`<ellipse cx="${ox+oW/2}" cy="${oy+oH/2}" rx="140" ry="145" fill="none" stroke="${G}" stroke-width="36"/>`)));
   textBoxes.push({text:'O',box:[ox,oy,oW,oH]});
   faceBox=[ox+90,oy+60,142,163];
   accent='Emerald O is a real letter and contains the thoughtful portrait.';
  } else if(def.key==='center'){
   const l=await lettering('RE',def.font,420,foreground,358,294);
   const r=await lettering('NDO',def.font,420,foreground,526,294);
   const xL=668,xR=1454,yL=Math.round(720-l.height/2),yR=Math.round(720-r.height/2);
   layers.push(layer(svg(W,H,`<path d="M1178 520 C1200 486 1256 472 1301 482 L1418 515 C1444 523 1460 548 1458 579 L1423 969 C1418 1003 1390 1017 1358 1008 L1192 966 C1167 959 1155 935 1159 908 Z" fill="${G}"/>`)));
   layers.push(layer(l.input,xL,yL),layer(r.input,xR,yR));
   textBoxes.push({text:'RE',box:[xL,yL,l.width,l.height]},{text:'NDO',box:[xR,yR,r.width,r.height]});
   layers.push(layer(await character('cross',412,1074,508)));
   faceBox=[1176,553,186,175];
   accent='A broad curved emerald shape anchors the central character; the name is split around him.';
  } else {
   const word=await lettering('RENDO',def.font,318,foreground,916,254);
   const x=1052,y=Math.round(721-word.height/2)-14;
   layers.push(layer(svg(W,H,`
    <path d="M870 716 C964 561 1137 531 1404 564 C1598 588 1781 599 1945 551 L1980 715 C1806 768 1604 738 1394 715 C1193 694 1073 701 992 818 Z" fill="${G}"/>
    <path d="M1945 551 L1980 715 L1917 771 L1905 602 Z" fill="#086354"/>
    <path d="M1394 715 C1604 738 1806 768 1980 715 L1917 771 C1742 813 1589 790 1391 770 Z" fill="${background}"/>
   `)));
   layers.push(layer(word.input,x,y));
   textBoxes.push({text:'RENDO',box:[x,y,word.width,word.height]});
   layers.push(layer(await character('think',443,622,508)));
   faceBox=[736,545,198,186];
   accent='A wide curved emerald ribbon folds through the lettering; the thinking pose overlaps its left edge.';
  }
  for(const {box} of textBoxes){
   const [x,y,w,h]=box;
   if(x<conservative.left||y<conservative.top||x+w>conservative.left+conservative.width||y+h>conservative.top+conservative.height)throw Error('Name leaves conservative mobile crop: '+id);
  }
  const bytes=await sharp(svg(W,H,rectangle(0,0,W,H,background))).composite(layers).png().toBuffer();
  const filename=`banner-${id}.png`;
  await fs.writeFile(path.join(out,filename),bytes);
  await sharp(bytes).extract(desktop).resize({width:1600}).jpeg({quality:95,chromaSubsampling:'4:4:4'}).toFile(path.join(out,`banner-${id}-desktop.jpg`));
  await sharp(bytes).extract(mobile).resize({width:1000}).png().toFile(path.join(out,`banner-${id}-mobile.png`));
  const decoded=await sharp(bytes).raw().toBuffer({resolveWithObject:true});
  if(decoded.info.width!==W||decoded.info.height!==H)throw Error('Decode failed.');
  records.push({id,title:def.title,layout:def.key,background:background===B?'black':'white',font:def.font.family,file:`options/rendo/${filename}`,size:[W,H],bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),text_boxes:textBoxes,face_box:faceBox,all_name_boxes_within_mobile_crop:true,artwork_source:`episodes/ep1-v11/film/public/img/h-${def.asset}.png`,artwork_source_sha256:sources[def.asset].sha256,artwork_origin:'Existing A6API /images/edits result; reused without regeneration',accent,banner_has_v_mark:false,small_green_underline:false,approved:false});
 }
}
async function board(items,{kind='desktop',columns=2}={}){
 const thumbW=kind==='desktop'?1180:750;
 const thumbH=Math.round(thumbW*(kind==='desktop'?423/2560:423/1546));
 const pad=30,labelHeight=44,gap=26,rowHeight=labelHeight+thumbH+gap;
 const width=pad*2+columns*thumbW+(columns-1)*gap;
 const height=pad*2+Math.ceil(items.length/columns)*rowHeight-gap;
 const layers=[];
 for(const [i,record] of items.entries()){
  const x=pad+(i%columns)*(thumbW+gap),y=pad+Math.floor(i/columns)*rowHeight;
  const label=`${record.id}  ${record.title} / ${record.background==='black'?'чёрный':'белый'}`;
  const labelImage=await lettering(label,F.label,25,WHITE,thumbW);
  layers.push(layer(labelImage.input,x,y+2));
  const source=await fs.readFile(path.join(here,record.file));
  const image=await sharp(source).extract(kind==='desktop'?desktop:mobile).resize({width:thumbW}).png().toBuffer();
  layers.push(layer(image,x,y+labelHeight));
 }
 return sharp(svg(width,height,rectangle(0,0,width,height,'#151716'))).composite(layers).jpeg({quality:96,chromaSubsampling:'4:4:4'}).toBuffer();
}
await fs.writeFile(path.join(out,'comparison.jpg'),await board(records));
await fs.writeFile(path.join(out,'mobile-comparison.jpg'),await board(records,{kind:'mobile'}));
await fs.writeFile(path.join(out,'comparison-black.jpg'),await board(records.filter(r=>r.background==='black'),{columns:1}));
await fs.writeFile(path.join(out,'comparison-white.jpg'),await board(records.filter(r=>r.background==='white'),{columns:1}));
// Keep the established downloadable preview path as a clearly temporary choice.
await fs.copyFile(path.join(out,'banner-03.png'),path.join(here,'options/rendo-banner.png'));
const metadata={
 date:'2026-10-12',revision:'Three original banner directions following the owner reference; six black/white versions',
 selected_public_name:'Rendo',avatar_layout:'02 / DRY BRUSH',avatar_changed:false,
 banner_v_mark_forbidden:true,banner_allowed_backgrounds:[WHITE,B],scenic_backgrounds_rejected:true,tiny_green_underline_rejected:true,
 reference_used_for:'Personality, scale, and lettering/character interaction only',
 reference_composition_copied:false,competitor_image_pixels_used:false,new_model_requests:0,
 existing_artwork_origin:'A6API',final_font_selected:false,final_background_selected:false,final_banner_selected:false,
 temporary_preview:'03',mobile_crop:Object.values(mobile),conservative_mobile_crop:Object.values(conservative),desktop_crop:Object.values(desktop),banners:records
};
await fs.writeFile(path.join(here,'current-options.json'),JSON.stringify(metadata,null,2)+'\n');
await fs.writeFile(path.join(here,'quality-check.json'),JSON.stringify({...metadata,decoded_banner_count:records.length,name_safe_area_checked:true,visual_review_completed:false},null,2)+'\n');
console.log(JSON.stringify({banners:records.length,new_model_requests:0,artwork_origin:'Existing A6API assets',output:out}));
