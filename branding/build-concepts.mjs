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
const imgRoot=path.join(root,'episodes/ep1-v11/film/public/img');
const colors={black:'#060606',emerald:'#0B8371',cream:'#F4F3EF',gray:'#A1A1A1'};
const svg=(w,h,body)=>Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`);
const rect=(x,y,w,h,fill,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const text=async(value,size,color=colors.cream,weight='Bold')=>sharp({text:{text:`<span foreground="${color}">${esc(value)}</span>`,font:`Jost ${weight} ${size}`,fontfile:font,dpi:72,rgba:true}}).png().toBuffer();
const label=async(value,size,color,left,top,weight='Bold')=>({input:await text(value,size,color,weight),left,top});
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
const concepts=[
 {id:'eiro',name:'EIRO',number:'01',about:'Fat loss, explained simply.',tone:'Clean / emerald',bg:colors.black,ink:colors.cream,hero:'h-intro.png'},
 {id:'rendo',name:'RENDO',number:'02',about:'Understand your body. Get leaner.',tone:'Manga / high contrast',bg:colors.cream,ink:colors.black,hero:'h-fist.png'},
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
        bannerLayers.push(await portrait(c.hero,950,262,550,2560,1440));
        bannerLayers.push(await label(c.name,188,c.ink,1038,624));
        bannerLayers.push(await label('UNDERSTAND YOUR BODY.',35,'#424242',1050,837,'Medium'));
        bannerLayers.push(await label('GET LEANER.',35,colors.emerald,1050,884,'Bold'));
        avatar=await sharp(svg(800,800,rect(0,0,800,800,colors.black))).composite([await portrait(c.hero,1560,-364,35,800,800)]).png().toBuffer();
    }else{
        bannerLayers.push(await portrait(c.hero,930,1210,522,2560,1440));
        bannerLayers.push(await label(c.name,164,c.ink,588,652));
        const monogram=await text('K',552,colors.cream,'Bold');
        const mm=await metadata(monogram);
        avatar=await sharp(svg(800,800,rect(0,0,800,800,'#07594F'))).composite([{input:monogram,left:Math.floor((800-mm.width)/2),top:Math.floor((800-mm.height)/2)}]).png().toBuffer();
    }
    const banner=await sharp(bannerBase).composite(bannerLayers).png().toBuffer();
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
console.log('Saved current branding concepts. Names remain proposals.');
