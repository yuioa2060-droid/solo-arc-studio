// Current Rendo branding. Generated bitmap assets stay separate from editable
// lettering and the approved native avatar mark. No model requests on rebuild.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const arg=name=>{const i=process.argv.indexOf(name);return i<0?null:process.argv[i+1];};
let sharp;
try{sharp=require(arg('--sharp-module')||'sharp');}catch{throw new Error('Install sharp or pass --sharp-module /absolute/path/to/sharp.');}
const assets=path.join(here,'assets'),out=path.join(here,'options'),variantsOut=path.join(out,'rendo');
await fs.mkdir(variantsOut,{recursive:true});
const C={black:'#060606',emerald:'#0B8371',cream:'#F4F3EF',white:'#F6F7F3',board:'#151716'};
const F={jost:{family:'Jost',file:path.join(root,'episodes/ep1-v11/film/public/fonts/Jost.ttf')},
 montserrat:{family:'Montserrat',file:path.join(root,'skills/solo-arc-motion/engines/html-motion/assets/template/assets/fonts/Montserrat-Bold.ttf')},
 italic:{family:'Montserrat',file:path.join(root,'skills/solo-arc-motion/engines/html-motion/assets/template/assets/fonts/Montserrat-BlackItalic.ttf')}};
const svg=(w,h,body,view=`0 0 ${w} ${h}`)=>Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${view}">${body}</svg>`);
const rect=(x,y,w,h,fill,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const text=async(value,size,color=C.white,weight='Regular',face=F.jost,tracking=0,markup=false)=>sharp({text:{text:`<span foreground="${color}" letter_spacing="${Math.round(tracking*1024)}">${markup?value:esc(value)}</span>`,font:`${face.family} ${weight} ${size}`,fontfile:face.file,dpi:72,rgba:true}}).png().toBuffer();
const layer=(input,left=0,top=0)=>({input,left,top});
const solid=(color)=>svg(2560,1440,rect(0,0,2560,1440,color));
const circle=async(buffer,size)=>sharp(buffer).resize(size,size).composite([{input:svg(size,size,`<circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/>`),blend:'dest-in'}]).png().toBuffer();
const label=async(value,size,color,left,top,weight='Regular')=>layer(await text(value,size,color,weight),left,top);
const sourcePortrait=await fs.readFile(path.join(assets,'avatar-portrait.png'));
const pm=await sharp(sourcePortrait).metadata();
if(!pm.hasAlpha||pm.width!==pm.height)throw new Error('The regenerated portrait must be square and have genuine alpha.');
// Exact same SVG geometry as avatar 02 / DRY BRUSH. Used only on the avatar.
const mirrored=body=>`${body}<g transform="translate(800 0) scale(-1 1)">${body}</g>`;
const dryBody=`<defs><mask id="dry-v"><rect width="800" height="1100" fill="white"/>${mirrored('<path d="M77 177 C86 204 95 232 103 257 M117 306 L132 343 M149 391 L157 414 M182 487 L198 529" fill="none" stroke="black" stroke-width="7" stroke-linecap="round"/><path d="M82 220 L90 242 M149 436 L159 468" fill="none" stroke="black" stroke-width="4"/>')}</mask></defs><g mask="url(#dry-v)">${mirrored(`<path d="M50 174 L61 164 L63 152 L80 157 L90 147 L99 164 L98 180 L114 208 L116 228 L130 252 L132 275 L150 314 L147 331 L163 363 L164 383 L184 425 L183 447 L204 485 L203 508 L230 566 L230 590 L253 644 L248 654 L300 787 L406 1027 L379 1046 L314 877 L258 748 L239 714 L216 648 L199 617 L181 558 L171 546 L151 481 L139 460 L130 421 L117 402 L110 364 L95 331 L94 312 L76 265 L74 243 L61 207 L61 192 Z" fill="${C.emerald}"/>`)}</g>`;
const avatar=await sharp(svg(pm.width,pm.height,rect(0,0,800,800,C.black)+dryBody,'0 0 800 800')).composite([layer(sourcePortrait)]).png().toBuffer();
await fs.writeFile(path.join(out,'rendo-avatar.png'),avatar);
await fs.writeFile(path.join(variantsOut,'v-dry-avatar.png'),avatar);
const avatarPreview=[await label('02 / DRY BRUSH',28,C.white,42,24,'Medium'),
 layer(await circle(avatar,480),40,92),layer(await circle(avatar,160),670,126),layer(await circle(avatar,96),930,158),layer(await circle(avatar,32),762,418),
 await label('160 px',20,'#A9B3AE',710,312),await label('96 px',20,'#A9B3AE',947,312),await label('32 px',20,'#A9B3AE',745,478),
 await label('NEW CLOSE-UP PORTRAIT',24,C.emerald,635,575,'Medium')];
await sharp(svg(1200,640,rect(0,0,1200,640,C.board))).composite(avatarPreview).png().toFile(path.join(variantsOut,'avatar-preview.png'));
// Retain this established link, now pointing at the current quality revision.
await fs.copyFile(path.join(variantsOut,'avatar-preview.png'),path.join(variantsOut,'avatars-comparison.png'));
const portraitLayer=async(width,left,top,{opacity=1,fade=false}={})=>{
 const resized=await sharp(sourcePortrait).resize({width}).png().toBuffer();
 const m=await sharp(resized).metadata();
 let image=resized;
 if(opacity!==1||fade){
  const mask=svg(m.width,m.height,fade?`<defs><linearGradient id="fade"><stop stop-color="white" stop-opacity="0"/><stop offset=".35" stop-color="white" stop-opacity="${opacity}"/><stop offset="1" stop-color="white" stop-opacity="${opacity}"/></linearGradient></defs>${rect(0,0,m.width,m.height,'url(#fade)')}`:rect(0,0,m.width,m.height,'white',`opacity="${opacity}"`));
  image=await sharp(image).composite([{input:mask,blend:'dest-in'}]).png().toBuffer();
 }
 const sx=Math.max(0,-left),sy=Math.max(0,-top),ex=Math.min(m.width,2560-left),ey=Math.min(m.height,1440-top);
 if(ex<=sx||ey<=sy)throw new Error('Portrait is outside canvas');
 return layer(await sharp(image).extract({left:sx,top:sy,width:ex-sx,height:ey-sy}).png().toBuffer(),Math.max(0,left),Math.max(0,top));
};
const background=async id=>sharp(path.join(assets,`${id}-background.png`)).resize(2560,1440,{fit:'cover',position:'centre'}).png().toBuffer();
const all=[
 {id:'01',title:'Quiet black',ru:'Тихий чёрный',kind:'type'},
 {id:'02',title:'Emerald on cream',ru:'Изумруд на светлом',kind:'type'},
 {id:'03',title:'Portrait editorial',ru:'Портрет и имя',kind:'portrait'},
 {id:'04',title:'Manga close-up',ru:'Крупный манга-фрагмент',kind:'portrait'},
 {id:'05',title:'Emerald split',ru:'Изумрудный разделённый фон',kind:'portrait'},
 {id:'06',title:'Soft silhouette',ru:'Лёгкий силуэт',kind:'portrait'},
 {id:'07',title:'Forest / dawn',ru:'Лес в тумане',kind:'generated-background'},
 {id:'08',title:'Ink landscape',ru:'Тушевый пейзаж',kind:'generated-background'},
 {id:'09',title:'City / dusk',ru:'Город вечером',kind:'generated-background'},
 {id:'10',title:'Wide italic',ru:'Крупное наклонное имя',kind:'type'},
 {id:'11',title:'Graphic stripe',ru:'Графическая полоса',kind:'type'},
 {id:'12',title:'Daylight',ru:'Дневной свет',kind:'generated-background'},
];
const banners=new Map(),verification=[];
for(const spec of all){
 const L=[],textBoxes=[];
 const name=async(value,size,color,cx=1280,cy=720,weight='Regular',face=F.jost,tracking=0)=>{
  const input=await text(value,size,color,weight,face,tracking),m=await sharp(input).metadata();
  const left=Math.round(cx-m.width/2),top=Math.round(cy-m.height/2);
  if(left<548||left+m.width>2012||top<536||top+m.height>904)throw new Error(`Unsafe wordmark in banner ${spec.id}`);
  textBoxes.push({text:value,box:[left,top,m.width,m.height]});L.push(layer(input,left,top));
 };
 let base=solid(C.black);
 switch(spec.id){
  case'01':
   await name('RENDO',115,C.white,1280,706,'Medium',F.jost,12);
   L.push(layer(svg(2560,1440,rect(1232,810,96,5,C.emerald))));break;
  case'02':
   base=solid(C.cream);await name('rendo',185,C.emerald);break;
  case'03':
   L.push(await portraitLayer(760,1340,400));await name('rendo',171,C.white,936,715,'Medium');
   L.push(layer(svg(2560,1440,rect(708,831,64,5,C.emerald))));break;
  case'04':
   L.push(await portraitLayer(1360,1370,32));await name('RENDO',138,C.white,959,690,'Bold',F.montserrat);
   L.push(layer(svg(2560,1440,rect(696,792,114,5,C.emerald))));break;
  case'05':
   L.push(layer(svg(2560,1440,rect(1580,0,980,1440,C.emerald))));
   L.push(await portraitLayer(850,1405,385));await name('rendo',176,C.white,956,705,'Medium');break;
  case'06':
   base=solid(C.cream);L.push(await portraitLayer(850,1290,390,{opacity:.17,fade:true}));
   await name('rendo',167,C.emerald,958,715);break;
  case'07':
   base=await background('forest');L.push(layer(svg(2560,1440,rect(0,0,2560,1440,C.black,'opacity=".12"'))));
   await name('RENDO',116,C.white,1280,709,'Medium',F.jost,13);
   L.push(layer(svg(2560,1440,rect(1240,819,80,4,C.emerald))));break;
  case'08':
   base=await background('ink');await name('Rendo',147,'#202724',1280,700,'Regular');
   L.push(layer(svg(2560,1440,rect(1250,814,60,4,C.emerald))));break;
  case'09':
   base=await background('city');await name('rendo',156,C.white,1110,702,'Regular');
   L.push(layer(svg(2560,1440,rect(901,820,60,4,C.emerald))));break;
  case'10':
   base=solid(C.cream);await name('RENDO',178,'#192420',1280,722,'Heavy Italic',F.italic,8);
   L.push(layer(svg(2560,1440,rect(978,850,604,8,C.emerald))));break;
  case'11':
   base=solid(C.cream);L.push(layer(svg(2560,1440,rect(0,574,2560,292,C.black)+rect(699,624,8,179,C.emerald))));
   await name('RENDO',133,C.white,1300,720,'Bold',F.montserrat,11);break;
  case'12':
   base=await background('daylight');await name('rendo',158,C.emerald,1280,720,'Regular');break;
 }
 const buffer=await sharp(base).composite(L).png().toBuffer();
 const filename=`banner-${spec.id}.png`;await fs.writeFile(path.join(variantsOut,filename),buffer);
 banners.set(spec.id,buffer);
 const mobile=await sharp(buffer).extract({left:530,top:520,width:1500,height:400}).resize(750).png().toBuffer();
 await fs.writeFile(path.join(variantsOut,`banner-${spec.id}-mobile.png`),mobile);
 verification.push({...spec,file:`options/rendo/${filename}`,size:[2560,1440],bytes:buffer.length,all_name_boxes_within_mobile_crop:true,text_boxes:textBoxes,banner_has_v_mark:false,approved:false});
}
// Existing entrypoint filenames stay current, without selecting a final banner.
await fs.writeFile(path.join(out,'rendo-banner.png'),banners.get('01'));
await fs.copyFile(path.join(variantsOut,'banner-01-mobile.png'),path.join(out,'rendo-mobile.png'));
await fs.writeFile(path.join(variantsOut,'minimal-banner.png'),banners.get('01'));
await fs.copyFile(path.join(variantsOut,'banner-01-mobile.png'),path.join(variantsOut,'minimal-mobile.png'));
await fs.writeFile(path.join(variantsOut,'nickname-banner.png'),banners.get('03'));
await fs.copyFile(path.join(variantsOut,'banner-03-mobile.png'),path.join(variantsOut,'nickname-mobile.png'));
const makeBoard=async(specs,columns,output,mobile=false)=>{
 const tw=mobile?750:1280,th=mobile?200:212,gap=36,pad=36,titleH=52,rowH=titleH+th+gap;
 const rows=Math.ceil(specs.length/columns),bw=pad*2+columns*tw+(columns-1)*gap,bh=pad*2+rows*rowH-gap;
 const layers=[];
 for(let i=0;i<specs.length;i++){
  const s=specs[i],x=pad+(i%columns)*(tw+gap),y=pad+Math.floor(i/columns)*rowH;
  layers.push(await label(`${s.id}  ${s.title}`,28,C.white,x,y,'Medium'));
  const crop=mobile?{left:530,top:520,width:1500,height:400}:{left:0,top:509,width:2560,height:423};
  layers.push(layer(await sharp(banners.get(s.id)).extract(crop).resize(tw,th).png().toBuffer(),x,y+titleH));
 }
 await sharp(svg(bw,bh,rect(0,0,bw,bh,C.board))).composite(layers).jpeg({quality:95}).toFile(output);
};
await makeBoard(all.slice(0,6),1,path.join(variantsOut,'comparison-01-06.jpg'));
await makeBoard(all.slice(6),1,path.join(variantsOut,'comparison-07-12.jpg'));
await makeBoard(all,2,path.join(variantsOut,'comparison.jpg'));
await makeBoard(all,2,path.join(variantsOut,'mobile-comparison.jpg'),true);
await sharp(path.join(variantsOut,'mobile-comparison.jpg')).png().toFile(path.join(variantsOut,'mobile-comparison.png'));
const desktop=await sharp(banners.get('01')).extract({left:0,top:509,width:2560,height:423}).resize(1480).png().toBuffer();
await sharp(svg(1600,510,rect(0,0,1600,510,C.board))).composite([
 await label('Rendo / updated avatar',27,C.white,60,25,'Medium'),layer(desktop,60,87),layer(await circle(avatar,100),75,367),
 await label('Rendo',31,C.white,205,377,'Medium'),await label('Banner 01 is a proposal',21,'#A9B3AE',205,432),
]).png().toFile(path.join(out,'rendo-preview.png'));
await fs.writeFile(path.join(here,'current-options.json'),JSON.stringify({date:'2026-10-11',selected_public_name:'Rendo',avatar_layout:'02 / DRY BRUSH',avatar_portrait_quality_revision:'Regenerated close crop, for user review',avatar_native_size:[pm.width,pm.height],portrait_sha256:createHash('sha256').update(sourcePortrait).digest('hex'),avatar_v_geometry_unchanged:true,banner_v_mark_forbidden:true,final_banner_selected:false,conservative_mobile_crop:[530,520,1500,400],desktop_crop:[0,509,2560,423],banners:verification},null,2)+'\n');
console.log(JSON.stringify({avatar:[pm.width,pm.height],portrait_regenerated:true,banners:verification.length,all_wordmarks_within_mobile_crop:true,model_requests_on_rebuild:0}));
