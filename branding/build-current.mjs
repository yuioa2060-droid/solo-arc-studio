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
const C={black:'#060606',emerald:'#0B8371',cream:'#FFFFFF',white:'#FFFFFF',board:'#151716'};
const F={jost:{family:'Jost',file:path.join(root,'episodes/ep1-v11/film/public/fonts/Jost.ttf')},
 montserrat:{family:'Montserrat',file:path.join(root,'skills/solo-arc-motion/engines/html-motion/assets/template/assets/fonts/Montserrat-Bold.ttf')},
 italic:{family:'Montserrat',file:path.join(root,'skills/solo-arc-motion/engines/html-motion/assets/template/assets/fonts/Montserrat-BlackItalic.ttf')},
 serif:{family:'DM Serif Display',file:path.join(here,'fonts/DMSerifDisplay-Regular.ttf')},
 hand:{family:'Caveat',file:path.join(here,'fonts/Caveat.ttf')}};
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
// Continue with the current original banner directions; no image generation.
await import('./build-banner-directions.mjs');
