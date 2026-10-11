// Compose channel concepts from existing approved PNGs. No image-generation API.
// node build-concepts.mjs --sharp-module /absolute/path/to/sharp
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const arg=name=>{const i=process.argv.indexOf(name);return i<0?null:process.argv[i+1];};
let sharp;
try{sharp=require(arg('--sharp-module')||'sharp');}catch{throw Error('Install sharp or pass --sharp-module /absolute/path/to/sharp.');}
const out=path.join(here,'options');
await fs.mkdir(out,{recursive:true});
const font=path.join(root,'episodes/ep1-v11/film/public/fonts/Jost.ttf');
const brandFonts=path.join(root,'skills/solo-arc-motion/engines/html-motion/assets/template/assets/fonts');
const montserrat={family:'Montserrat',file:path.join(brandFonts,'Montserrat-Black.ttf')};
const montserratItalic={family:'Montserrat',file:path.join(brandFonts,'Montserrat-BlackItalic.ttf')};
const imgRoot=path.join(root,'episodes/ep1-v11/film/public/img');
const colors={black:'#060606',emerald:'#0B8371',cream:'#F4F3EF',gray:'#A1A1A1'};
const svg=(w,h,body)=>Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`);
const rect=(x,y,w,h,fill,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const text=async(value,size,color=colors.cream,weight='Bold',typeface={family:'Jost',file:font})=>sharp({text:{text:`<span foreground="${color}">${esc(value)}</span>`,font:`${typeface.family} ${weight} ${size}`,fontfile:typeface.file,dpi:72,rgba:true}}).png().toBuffer();
const label=async(value,size,color,left,top,weight='Bold',typeface)=>({input:await text(value,size,color,weight,typeface),left,top});
const metadata=b=>sharp(b).metadata();
const heroCache=new Map();
const cleanExteriorMatte=async(file)=>{
    if(heroCache.has(file))return heroCache.get(file);
    const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    const {width:w,height:h}=info,n=w*h;
    const bg=new Uint8Array(n),queue=new Int32Array(n);
    let head=0,tail=0;
    const eligible=i=>data[i*4+3]===0||Math.max(data[i*4],data[i*4+1],data[i*4+2])<20;
    const add=i=>{if(!bg[i]&&eligible(i)){bg[i]=1;queue[tail++]=i;}};
    for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}
    for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}
    while(head<tail){const i=queue[head++],x=i%w,y=Math.floor(i/w);if(x)add(i-1);if(x<w-1)add(i+1);if(y)add(i-w);if(y<h-1)add(i+w);}
    // Retain the original RGB and a two-pixel ink edge; only exterior alpha changes.
    // This removes the black rectangular matte fragments visible on colored backdrops.
    const keep=new Uint8Array(n);
    for(let i=0;i<n;i++)if(!bg[i])keep[i]=1;
    for(let pass=0;pass<2;pass++){
        const next=keep.slice();
        for(let i=0;i<n;i++)if(keep[i]){const x=i%w,y=Math.floor(i/w);if(x)next[i-1]=1;if(x<w-1)next[i+1]=1;if(y)next[i-w]=1;if(y<h-1)next[i+w]=1;}
        keep.set(next);
    }
    for(let i=0;i<n;i++)if(bg[i]&&!keep[i])data[i*4+3]=0;
    const result=await sharp(data,{raw:info}).png().toBuffer();
    heroCache.set(file,result);
    return result;
};
const fit=async(file,width)=>sharp(await cleanExteriorMatte(file)).resize({width}).png().toBuffer();
const portrait=async(filename,width,x,y,targetW,targetH)=>{
    const source=await fit(path.join(imgRoot,filename),width);
    const m=await metadata(source);
    const sx=Math.max(0,-x),sy=Math.max(0,-y);
    const ex=Math.min(m.width,targetW-x),ey=Math.min(m.height,targetH-y);
    const cut=await sharp(source).extract({left:sx,top:sy,width:ex-sx,height:ey-sy}).png().toBuffer();
    return {input:cut,left:Math.max(0,x),top:Math.max(0,y)};
};
const circle=async(buffer,size)=>sharp(buffer).resize(size,size).composite([{input:svg(size,size,`<circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/>`),blend:'dest-in'}]).png().toBuffer();
// The owner chose the light Rendo direction. Lettering below is still a proposal.
// Reuse the approved drawing; editable typography and geometric accents change.
// The owner requests emerald on the banner and a little emerald on the avatar,
// keeping the dark avatar background rather than filling it with green.
const rendoVariants=[
 {id:'wordmark',number:'01',title:'Emerald name'},
 {id:'nickname',number:'02',title:'Diagonal accent / lowercase'},
 {id:'minimal',number:'03',title:'Wide underline'},
];
const rendoOut=path.join(out,'rendo');
await fs.mkdir(rendoOut,{recursive:true});
const rendoBanners=new Map();
const avatarPortrait=await portrait('h-fist.png',1560,-364,35,800,800);
// Avatar 02 was selected. Add the right-hand stroke to suggest a V behind the
// same portrait. The concealed point lies below the crop, like a large mark
// obscured by the presenter. All four styles are proposals, not final choices.
const mirrored=body=>`${body}<g transform="translate(800 0) scale(-1 1)">${body}</g>`;
const vStyles=[
 {id:'ink',number:'01',title:'INK',body:mirrored(`<path d="M89 189 C87 169 101 160 112 153 L129 144 L124 165 L140 157 C150 191 148 216 158 250 C173 300 179 350 209 428 C234 510 265 616 318 760 L410 1035 L389 1048 C320 871 268 748 226 629 C191 533 170 463 146 392 C126 326 101 263 89 189 Z" fill="${colors.emerald}"/>`)},
 {id:'dry',number:'02',title:'DRY BRUSH',body:`<defs><mask id="dry-v"><rect width="800" height="1100" fill="white"/>${mirrored('<path d="M77 177 C86 204 95 232 103 257 M117 306 L132 343 M149 391 L157 414 M182 487 L198 529" fill="none" stroke="black" stroke-width="7" stroke-linecap="round"/><path d="M82 220 L90 242 M149 436 L159 468" fill="none" stroke="black" stroke-width="4"/>')}</mask></defs><g mask="url(#dry-v)">${mirrored(`<path d="M50 174 L61 164 L63 152 L80 157 L90 147 L99 164 L98 180 L114 208 L116 228 L130 252 L132 275 L150 314 L147 331 L163 363 L164 383 L184 425 L183 447 L204 485 L203 508 L230 566 L230 590 L253 644 L248 654 L300 787 L406 1027 L379 1046 L314 877 L258 748 L239 714 L216 648 L199 617 L181 558 L171 546 L151 481 L139 460 L130 421 L117 402 L110 364 L95 331 L94 312 L76 265 L74 243 L61 207 L61 192 Z" fill="${colors.emerald}"/>`)}</g>`},
 {id:'flow',number:'03',title:'FLOW',body:mirrored(`<path d="M111 155 C126 154 135 168 133 188 C135 238 113 281 112 333 C111 410 170 457 195 540 C219 624 286 793 409 1033 L391 1045 C298 829 246 718 212 643 C185 576 166 526 138 483 C99 425 87 372 87 326 C86 274 111 221 97 178 C92 163 98 156 111 155 Z" fill="${colors.emerald}"/>`)},
 {id:'taper',number:'04',title:'MANGA SLASH',body:mirrored(`<path d="M99 146 C126 187 119 215 137 257 C163 322 175 392 207 482 C235 567 276 691 410 1040 L391 1034 C292 802 238 690 207 597 C174 499 152 431 137 359 C117 286 115 230 99 146 Z" fill="${colors.emerald}"/>`)},
];
const vAvatars=new Map();
for(const style of vStyles){
    const avatar=await sharp(svg(800,800,rect(0,0,800,800,colors.black))).composite([
        {input:svg(800,800,style.body),left:0,top:0},avatarPortrait,
    ]).png().toBuffer();
    vAvatars.set(style.id,avatar);
    if(style.id!=='ink')await fs.writeFile(path.join(rendoOut,`v-${style.id}-avatar.png`),avatar);
    console.log(JSON.stringify({avatar_v:style.id,bytes:avatar.length,generative_requests:0}));
}
const currentAvatar=vAvatars.get('ink');
for(const variant of rendoVariants){
    const layers=[];
    if(variant.id==='nickname'){
        layers.push({input:svg(2560,1440,`<path d="M970 648 H1016 L1042 790 H996 Z" fill="${colors.emerald}"/>`),left:0,top:0});
    }
    layers.push(await portrait('h-fist.png',950,262,550,2560,1440));
    if(variant.id==='wordmark'){
        layers.push(await label('RENDO',170,colors.emerald,1048,642,'Black Italic',montserratItalic));
        layers.push({input:svg(48,5,rect(0,0,48,5,colors.emerald)),left:1057,top:829});
        layers.push(await label('Fat loss, made clear.',34,'#484A47',1123,811,'Medium'));
    }else if(variant.id==='nickname'){
        const name=await text('rendo',212,colors.black,'Medium');
        const m=await metadata(name);
        const dot=await text('.',212,colors.emerald,'Medium');
        const dm=await metadata(dot);
        layers.push({input:name,left:1050,top:641});
        layers.push({input:dot,left:1060+m.width,top:641+m.height-dm.height});
        layers.push(await label('Fat loss, made clear.',34,'#484A47',1058,836,'Medium'));
    }else{
        layers.push(await label('RENDO',158,colors.black,1060,685,'Black',montserrat));
        layers.push({input:svg(540,16,rect(0,0,540,16,colors.emerald)),left:1067,top:827});
    }
    const banner=await sharp(svg(2560,1440,rect(0,0,2560,1440,colors.cream))).composite(layers).png().toBuffer();
    rendoBanners.set(variant.id,banner);
    // The first proposal is exported to the existing rendo-banner.png path below.
    // Keep just two additional alternatives, without duplicate full-size PNGs.
    if(variant.id!=='wordmark')await fs.writeFile(path.join(rendoOut,`${variant.id}-banner.png`),banner);
    const mobile=await sharp(banner).extract({left:530,top:520,width:1500,height:400}).resize(600).png().toBuffer();
    if(variant.id!=='wordmark')await fs.writeFile(path.join(rendoOut,`${variant.id}-mobile.png`),mobile);
    console.log(JSON.stringify({banner_variant:variant.id,bytes:banner.length,generative_requests:0}));
}
const concepts=[
 {id:'eiro',name:'EIRO',number:'01',about:'Fat loss, explained simply.',tone:'Clean / emerald',bg:colors.black,ink:colors.cream,hero:'h-intro.png'},
 {id:'rendo',name:'RENDO',number:'02',about:'Understand your body. Get leaner.',tone:'Light manga / emerald accents',bg:colors.cream,ink:colors.black,hero:'h-fist.png'},
 {id:'kairen',name:'KAIREN',number:'03',about:'Fat loss and fitness, made clear.',tone:'Bold / portrait and monogram',bg:'#07594F',ink:colors.cream,hero:'h-intro.png'},
];
const comparisonLayers=[];
for(let index=0;index<concepts.length;index++){
    const c=concepts[index];
    const bannerLayers=[];
    const bannerBase=svg(2560,1440,rect(0,0,2560,1440,c.bg));
    let avatar;
    if(c.id==='eiro'){
        bannerLayers.push(await portrait(c.hero,900,1240,524,2560,1440));
        bannerLayers.push(await label(c.name,204,c.ink,610,623));
        bannerLayers.push({input:svg(136,7,rect(0,0,136,7,colors.emerald)),left:612,top:831});
        bannerLayers.push(await label('FAT LOSS, EXPLAINED SIMPLY.',34,'#B7B7B7',612,862,'Medium'));
        avatar=await sharp(svg(800,800,rect(0,0,800,800,colors.emerald))).composite([await portrait(c.hero,1600,-400,38,800,800)]).png().toBuffer();
    }else if(c.id==='rendo'){
        avatar=currentAvatar;
    }else{
        bannerLayers.push(await portrait(c.hero,930,1210,522,2560,1440));
        bannerLayers.push(await label(c.name,164,c.ink,588,652));
        const monogram=await text('K',552,colors.cream,'Bold');
        const mm=await metadata(monogram);
        avatar=await sharp(svg(800,800,rect(0,0,800,800,'#07594F'))).composite([{input:monogram,left:Math.floor((800-mm.width)/2),top:Math.floor((800-mm.height)/2)}]).png().toBuffer();
    }
    const banner=c.id==='rendo'?rendoBanners.get('wordmark'):await sharp(bannerBase).composite(bannerLayers).png().toBuffer();
    await fs.writeFile(path.join(out,`${c.id}-banner.png`),banner);
    await fs.writeFile(path.join(out,`${c.id}-avatar.png`),avatar);
    const desktop=await sharp(banner).extract({left:0,top:509,width:2560,height:423}).resize(1480).png().toBuffer();
    const mobile=await sharp(banner).extract({left:530,top:520,width:1500,height:400}).resize(600).png().toBuffer();
    await fs.writeFile(path.join(out,`${c.id}-mobile.png`),mobile);
    const previewLayers=[
        await label(`${c.number}  ${c.name}`,31,colors.cream,60,27),
        await label(c.tone,20,'#A7AAA9',1000,33,'Medium'),
        {input:desktop,left:60,top:87},
        {input:await circle(avatar,104),left:80,top:361},
        await label(c.name,35,colors.cream,210,373),
        await label(c.about,25,'#BFC3C1',210,425,'Medium'),
    ];
    const preview=await sharp(svg(1600,510,rect(0,0,1600,510,'#151716'))).composite(previewLayers).png().toBuffer();
    await fs.writeFile(path.join(out,`${c.id}-preview.png`),preview);
    comparisonLayers.push({input:preview,left:0,top:index*534});
    console.log(JSON.stringify({concept:c.id,banner:[2560,1440],avatar:[800,800],preview:[1600,510],source:c.hero,generative_requests:0}));
}
await sharp(svg(1600,1578,rect(0,0,1600,1578,'#080A09'))).composite(comparisonLayers).jpeg({quality:93}).toFile(path.join(out,'comparison.jpg'));
const rendoComparison=[];
const mobileComparison=[];
for(let i=0;i<rendoVariants.length;i++){
    const v=rendoVariants[i],banner=rendoBanners.get(v.id),y=i*344;
    const desktop=await sharp(banner).extract({left:0,top:509,width:2560,height:423}).resize(1480).png().toBuffer();
    rendoComparison.push(await label(`${v.number}  ${v.title}`,25,colors.cream,60,y+23,'Medium'));
    rendoComparison.push({input:desktop,left:60,top:y+76});
    const mobile=await sharp(banner).extract({left:530,top:520,width:1500,height:400}).resize(720).png().toBuffer();
    mobileComparison.push(await label(`${v.number}`,26,colors.cream,40,i*251+15,'Medium'));
    mobileComparison.push({input:mobile,left:40,top:i*251+60});
}
await sharp(svg(1600,1032,rect(0,0,1600,1032,'#151716'))).composite(rendoComparison).jpeg({quality:94}).toFile(path.join(rendoOut,'comparison.jpg'));
await sharp(svg(800,753,rect(0,0,800,753,'#151716'))).composite(mobileComparison).png().toFile(path.join(rendoOut,'mobile-comparison.png'));
const avatarComparison=[];
for(let i=0;i<vStyles.length;i++){
    const v=vStyles[i],avatar=vAvatars.get(v.id),x=(i%2)*600,y=Math.floor(i/2)*570;
    avatarComparison.push(await label(`${v.number}  ${v.title}`,27,colors.cream,x+115,y+27,'Medium'));
    avatarComparison.push({input:await circle(avatar,320),left:x+140,top:y+83});
    avatarComparison.push({input:await circle(avatar,96),left:x+185,top:y+431});
    avatarComparison.push({input:await circle(avatar,32),left:x+349,top:y+463});
    avatarComparison.push(await label('96 px',18,'#BFC3C1',x+210,y+540,'Medium'));
    avatarComparison.push(await label('32 px',18,'#BFC3C1',x+342,y+540,'Medium'));
}
await sharp(svg(1200,1140,rect(0,0,1200,1140,'#151716'))).composite(avatarComparison).png().toFile(path.join(rendoOut,'avatars-comparison.png'));
console.log('Saved current banners and four organic V-avatar proposals. The portrait and dark background are preserved.');
