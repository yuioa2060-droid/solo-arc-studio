import React from 'react';
import {AbsoluteFill,Img,staticFile,useCurrentFrame,delayRender,continueRender} from 'remotion';
import plan from './timeline.json';
import meta from '../public/art/meta.json';
const EM='#0B8371', WHITE='#F2F0EA', GREY='#a3a39e', RED='#bc5752';
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const ease=(x:number)=>{x=clamp(x);return x*x*(3-2*x)};
const arrive=(x:number)=>{x=clamp(x);return 1-Math.pow(1-x,3)};
const M=meta as Record<string,{width:number;height:number}>;
const useFonts=()=>{const [id]=React.useState(()=>delayRender('Load Jost'));React.useEffect(()=>{const f=new FontFace('Jost',`url(${staticFile('fonts/Jost.ttf')})`,{weight:'100 900'});f.load().then(font=>{document.fonts.add(font);continueRender(id)}).catch(()=>continueRender(id))},[id])};
function Art({name,x=960,y=520,w=900,h=850,t=2,at=0,enter='up',flip=false,drift=true,scale=1,opacity=1}:{name:string;x?:number;y?:number;w?:number;h?:number;t?:number;at?:number;enter?:string;flip?:boolean;drift?:boolean;scale?:number;opacity?:number}){
 if(!M[name])throw new Error('Missing art '+name);const m=M[name];const z=Math.min(w/m.width,h/m.height);const aw=m.width*z,ah=m.height*z;const p=arrive((t-at)/.8);const op=ease((t-at)/.4)*opacity;
 const dx=enter==='left'?-110*(1-p):enter==='right'?110*(1-p):0,dy=enter==='up'?65*(1-p):0;
 const fx=drift?3*Math.sin(t*.42+x/100):0,fy=drift?3*Math.sin(t*.31+y/100):0;
 return <div data-art={name} style={{position:'absolute',left:x-aw/2+dx+fx,top:y-ah/2+dy+fy,width:aw,height:ah,opacity:op,transform:`scale(${(flip?-1:1)*scale},${scale})`,clipPath:'inset(1px)'}}><Img src={staticFile(`art/${name}.png`)} style={{width:'100%',height:'100%',objectFit:'contain'}}/></div>;
}
function Txt({text,x=960,y=500,w=1440,size=72,t=2,at=.2,color=WHITE,align='center',weight=550}:{text:string;x?:number;y?:number;w?:number;size?:number;t?:number;at?:number;color?:string;align?:'left'|'center'|'right';weight?:number}){
 const p=arrive((t-at)/.55);return <div data-qa-text style={{position:'absolute',left:x-w/2,top:y,width:w,fontFamily:'Jost',fontWeight:weight,fontSize:size,lineHeight:1.14,textAlign:align,color,opacity:ease((t-at)/.3),transform:`translateY(${20*(1-p)}px)`,whiteSpace:'pre-wrap'}}>{text}</div>;
}
function Lines({s,t,x=960,y=390,w=1400,size=76,gap=118,align='center'}:{s:any;t:number;x?:number;y?:number;w?:number;size?:number;gap?:number;align?:'left'|'center'|'right'}){
 return <>{s.lines.map((l:string,i:number)=><Txt key={l} text={l} x={x} y={y+i*gap} w={w} size={size} t={t} at={s.lineTimes?.[i]??(.3+i*.6)} color={s.accent===i?EM:WHITE} align={align} weight={s.accent===i?650:550}/>)}</>;
}
const Cap=({text,t,y=950}:{text:string;t:number;y?:number})=><Txt text={text} y={y} size={30} color={GREY} t={t} at={.8} w={1650} weight={450}/>;
const Stroke=({t,at=1,x=960,y=760,w=450,color=EM}:{t:number;at?:number;x?:number;y?:number;w?:number;color?:string})=>{const p=ease((t-at)/.85);return <svg style={{position:'absolute',left:x-w/2,top:y}} width={w} height={35}><path d={`M 8 14 Q ${w*.45} 21 ${w-8} 12`} stroke={color} strokeWidth={5} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1-p}/></svg>};
function Pose({s,t,x=640,y=630,w=1180,h=620}:{s:any;t:number;x?:number;y?:number;w?:number;h?:number}){
 const names=s.assets||['h-crunch','h-down'];let a=names[0],b=names[1];
 // Original down/up poses are whole-image fades. One controlled repetition, no torso deformation.
 if(s.motion==='crunch'||s.kind==='mechanism'){a='x-crunch-low';b='x-crunch-high'}
 const start=Math.min(1.3,Math.max(.55,s.duration*.22)),end=start+Math.min(1.3,Math.max(.6,s.duration*.28));
 const blend=ease((t-start)/.16)*(1-ease((t-end)/.16));
 return <><Art name={a} x={x} y={y} w={w} h={h} t={t} opacity={1-blend} drift={false}/><Art name={b} x={x} y={y} w={w} h={h} t={t} opacity={blend} drift={false}/></>;
}
function Scene({s,global}:{s:any;global:number}){
 const t=global-s.a,fade=ease((s.b-global)/.22);let content:React.ReactNode=null;
 if(s.kind==='hero'){
  const right=s.side==='right',wide=M[s.asset]?.width/M[s.asset]?.height>.85;
  content=<><Art name={s.asset} x={s.asset==='h-open'?(right?1410:510):(right?1370:510)} y={s.asset==='h-open'?585:565} w={s.asset==='h-open'?880:(wide?900:820)} h={s.asset==='h-open'?940:940} t={t} enter={right?'right':'left'} flip={right&&s.asset==='h-open'}/><Lines s={s} t={t} x={right?565:1320} y={380} w={right?820:860} size={s.lines.some((l:string)=>l.length>36)?52:66} gap={155} align="center"/></>;
 }else if(s.kind==='text'){
  content=<>{Math.min(...s.lineTimes)>.8&&t<Math.min(...s.lineTimes)&&<div style={{opacity:1-ease((t-Math.min(...s.lineTimes)+.28)/.28)}}><Txt text={s.phrase.charAt(0).toUpperCase()+s.phrase.slice(1)+'.'} y={420} size={66} t={t} at={0}/></div>}<Lines s={s} t={t} y={s.lines.length>1?370:460} size={s.small?66:s.lines.some((l:string)=>l.length>35)?70:88} gap={130}/><Stroke t={t} at={Math.max(1.25,Math.min(...s.lineTimes)+.7)} x={960} y={700} w={460} color={s.accent!==undefined?EM:'#545450'}/></>;
 }else if(s.kind==='image'){
  const name=s.asset,wide=M[name].width/M[name].height>1.1;
  content=<><Art name={name} w={s.imageW??1050} h={name==='s-meal'?870:name.startsWith('b-')?790:wide?675:820} x={960} y={name==='s-meal'?605:470} t={t} scale={1+.035*ease(t/s.duration)}/><Lines s={s} t={t} y={name==='s-meal'?60:900} size={59} gap={75}/></>;
 }else if(s.kind==='cycle'){
  const k=Math.min(2,Math.floor(t/(s.duration/3))),lt=t-k*(s.duration/3);
  content=<><Art name={s.assets[k]} x={660} y={530} w={930} h={770} t={lt} enter={k%2?'right':'left'}/><Txt text={s.lines[k]} x={1380} y={445} w={690} size={76} t={lt} at={0}/></>;
 }else if(s.kind==='contrast'||s.kind==='photo'){
  content=<>{s.assets.map((n:string,i:number)=><Art key={i} name={n} x={i?1320:590} y={520} w={540} h={650} t={t} at={i*.55} drift={false}/>)}<Txt text={s.lines[0]} x={570} y={850} w={680} size={63} t={t} at={.45}/><Txt text={s.lines[1]} x={1350} y={850} w={680} size={63} t={t} at={1.0}/>{s.caption&&<Cap text={s.caption} t={t} y={1000}/>}</>;
 }else if(s.kind==='exercise'||s.kind==='mechanism'){
  const hinge=s.motion==='hinge';content=<><Pose s={s} t={t} x={hinge?800:920} y={hinge?565:610} w={hinge?1400:1540} h={hinge?870:740}/><Lines s={s} t={t} y={70} size={62} gap={90}/>{s.kind==='mechanism'&&<Stroke t={t} y={255} w={340}/>}</>;
 }else if(s.kind==='study'){
  content=<><Art name={s.asset} x={605} y={570} w={1000} h={700} t={t}/><Lines s={s} t={t} x={1410} y={310} w={700} size={85} gap={185}/><Cap text={s.caption} t={t}/></>;
 }else if(s.kind==='studyResult'){
  content=<><Art name={s.asset} x={440} y={600} w={750} h={550} t={t}/><Txt text={s.lines[0]} x={1330} y={300} w={870} size={61} t={t} at={1.0} color={EM}/><Txt text={s.lines[1]} x={1330} y={515} w={870} size={60} t={t} at={3.4}/><Cap text={s.caption} t={t}/></>;
 }else if(s.kind==='triptych'||s.kind==='evidence'||s.kind==='audit'){
  const isAudit=s.kind==='audit';content=<>{s.assets.map((n:string,i:number)=><Art key={i} name={n} x={430+i*530} y={470} w={420} h={520} t={t} at={i*.85}/>) }{s.lines.map((l:string,i:number)=><Txt key={i} text={l} x={430+i*530} y={795} w={455} size={isAudit?44:58} t={t} at={i*.85+.3}/>)}</>;
 }else if(s.kind==='bodyconditions'){
  content=<><Art name={s.asset} x={630} y={525} w={500} h={850} t={t} drift={false}/><Lines s={s} t={t} x={1370} y={245} w={600} size={72} gap={165}/></>;
 }else if(s.kind==='measurement'){
  content=<><Art name={s.asset} x={560} y={525} w={900} h={850} t={t} drift={false}/><Lines s={s} t={t} x={1375} y={280} w={830} size={58} gap={145}/><Stroke t={t} at={2} x={1370} y={720} w={420}/></>;
 }else if(s.kind==='measureClose'){
  // A uniform camera move on the full image, not a distorted/cut-out belly.
  content=<><Art name={s.asset} x={570} y={480} w={1010} h={900} t={t} drift={false} scale={1+.025*ease(t/3)}/><Lines s={s} t={t} x={1350} y={340} w={860} size={62} gap={170}/><svg style={{position:'absolute',left:960,top:705}} width={720} height={80}><path d="M 25 22 L 680 22" fill="none" stroke={EM} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1-ease((t-1.5)/1.0)}/></svg></>;
 }else if(s.kind==='session'){
  content=<><Txt text={s.lines[0]} y={225} size={83} t={t}/>{[0,1,2].map(i=><div key={i} style={{position:'absolute',left:430+i*390,top:495,width:280,height:195,borderBottom:`5px solid ${EM}`,opacity:ease((t-.8-i*.55)/.6)}}><Txt text={['MON','WED','FRI'][i]} x={140} y={40} w={270} size={64} t={t} at={.8+i*.55}/></div>)}<Cap text={s.caption} t={t} y={870}/></>;
 }else if(s.kind==='exerciseMenu'){
  content=<>{s.assets.map((n:string,i:number)=><Art key={i} name={n} x={300+i*440} y={525} w={390} h={550} t={t} at={i*.65} drift={false}/>)}{s.lines.map((l:string,i:number)=><Txt key={i} text={l} x={300+i*440} y={845} w={390} size={47} t={t} at={i*.65+.25}/>)}</>;
 }else if(s.kind==='log'||s.kind==='logProgress'){
  content=<><Art name={s.asset} x={540} y={550} w={830} h={920} t={t}/><Lines s={s} t={t} x={1360} y={300} w={790} size={65} gap={170}/>{s.kind==='logProgress'?<><Stroke t={t} at={1.5} x={1360} y={740} w={410}/><Txt text="REPS → CHALLENGE" x={1360} y={815} w={790} size={40} color={GREY} t={t} at={2.2}/></>:<Stroke t={t} at={1.8} x={1360} y={670} w={350}/>}</>;
 }else if(s.kind==='frequency'){
  content=<><Art name={s.asset} x={625} y={600} w={1080} h={630} t={t}/><Lines s={s} t={t} x={1450} y={290} w={620} size={90} gap={200}/><Cap text={s.caption} t={t}/></>;
 }else if(s.kind==='protein'){
  content=<><Art name={s.asset} x={640} y={540} w={1070} h={660} t={t}/><Txt text={s.lines[0]} x={1440} y={380} w={760} size={79} t={t} at={s.lineTimes[0]} color={EM}/><Cap text={s.caption} t={t}/></>;
 }else if(s.kind==='formula'){
  content=<><Lines s={s} t={t} y={305} size={94} gap={160}/><Cap text={s.caption} t={t} y={800}/></>;
 }else if(s.kind==='signals'){
  content=<>{s.lines.map((l:string,i:number)=><React.Fragment key={i}><Txt text="✓" x={445} y={250+i*165} w={100} size={78} color={EM} t={t} at={i*.8+.3}/><Txt text={l} x={1085} y={255+i*165} w={1080} size={78} t={t} at={i*.8+.5} align="left"/></React.Fragment>)}<Cap text={s.caption} t={t} y={905}/></>;
 }else if(s.kind==='plan'){
  content=<><Txt text="Your next week" y={70} size={80} t={t}/>{s.lines.map((l:string,i:number)=>{const y=280+i*170;return <div key={i} style={{position:'absolute',left:270,top:y,width:1380,height:145,background:'#101412',borderLeft:`6px solid ${EM}`,opacity:ease((t-.8-i*2.2)/.6),transform:`translateX(${55*(1-arrive((t-.8-i*2.2)/.7))}px)`}}><Art name={s.assets[i]} x={110} y={72} w={185} h={128} t={t} at={.8+i*2.2} drift={false}/><Txt text={l} x={850} y={35} w={1060} size={58} t={t} at={.9+i*2.2} align="left"/></div>})}</>;
 }else if(s.kind==='ending'){
  content=<><Art name={s.asset} x={555} y={545} w={890} h={850} t={t} drift={false}/><Lines s={s} t={t} x={1340} y={350} w={850} size={68} gap={165}/><Stroke t={t} at={2.4} x={1340} y={750} w={430}/></>;
 }else throw Error('Unknown scene kind '+s.kind);
 const end=s.kind==='ending'?ease((plan.duration-global-.1)/1.15):1;
 return <AbsoluteFill data-scene={s.id} style={{opacity:fade*end}}>{content}</AbsoluteFill>;
}
export const Episode3:React.FC=()=>{useFonts();const frame=useCurrentFrame(),t=frame/30;const ref=React.useRef<HTMLDivElement>(null);const active=(plan.scenes as any[]).filter(s=>t>=s.a&&t<s.b);
React.useLayoutEffect(()=>{const qaHandle=delayRender('QA text layout');requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!ref.current){continueRender(qaHandle);return;}const bounds=ref.current.getBoundingClientRect(),kx=1920/bounds.width,ky=1080/bounds.height;if(!bounds.width||!bounds.height){continueRender(qaHandle);return;}const visible=(el:Element)=>{let op=1,p:Element|null=el;while(p&&p!==ref.current){op*=Number(getComputedStyle(p).opacity);p=p.parentElement;}return op>.1;};const rects:Array<{text:string;left:number;right:number;top:number;bottom:number}>=[];for(const el of ref.current.querySelectorAll('[data-qa-text]')){if(!visible(el))continue;const range=document.createRange();range.selectNodeContents(el);for(const r of Array.from(range.getClientRects())){if(r.width<1||r.height<1)continue;rects.push({text:el.textContent||'',left:(r.left-bounds.left)*kx,right:(r.right-bounds.left)*kx,top:(r.top-bounds.top)*ky,bottom:(r.bottom-bounds.top)*ky})}}const failures=rects.filter(r=>r.left<12||r.right>1908||r.top<12||r.bottom>1068);if(failures.length)console.log('EP3QA '+JSON.stringify({frame,scene:active[0]?.id,failures}));continueRender(qaHandle);}));},[frame]);
return <AbsoluteFill ref={ref} style={{background:'#060606',color:WHITE,fontFamily:'Jost',overflow:'hidden'}}>{active.map(s=><Scene key={s.id} s={s} global={t}/>)}</AbsoluteFill>};
