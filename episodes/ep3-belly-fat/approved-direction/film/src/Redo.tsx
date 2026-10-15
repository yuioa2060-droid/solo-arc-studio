import React from 'react';
import {AbsoluteFill,Img,staticFile,useCurrentFrame,continueRender,delayRender,cancelRender} from 'remotion';
import meta from '../public/art/meta.json';
const BG='#060606',W='#F2F0EA',G='#92918b',EM='#0B8371',R='#B65A54';
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const sm=(x:number)=>{x=clamp(x);return x*x*(3-2*x)};
const out=(x:number)=>1-Math.pow(1-clamp(x),4);
const lerp=(a:number,b:number,p:number)=>a+(b-a)*p;
const appear=(t:number,a:number,d=.4)=>sm((t-a)/d);
const vanish=(t:number,b:number,d=.3)=>1-sm((t-b+d)/d);
const window=(t:number,a:number,b:number,d=.4)=>appear(t,a,d)*vanish(t,b,Math.min(d,.3));
const spring=(x:number)=>{x=clamp(x);return x===1?1:1-Math.exp(-6*x)*Math.cos(5*x)};
const M=meta as Record<string,{width:number;height:number}>;
function useFont(){const [h]=React.useState(()=>delayRender('Load actual Jost, no fallback'));React.useEffect(()=>{new FontFace('Jost',`url(${staticFile('fonts/Jost.ttf')})`,{weight:'100 900'}).load().then(f=>{document.fonts.add(f);continueRender(h)}).catch(e=>cancelRender(e))},[h]);}
function A({name,t,a,b,x,y,h,w=1800,move='up',dur=.95,hero=false,opacity=1,k=1,r=0,freeze=false}:{name:string;t:number;a:number;b:number;x:number;y:number;h:number;w?:number;move?:string;dur?:number;hero?:boolean;opacity?:number;k?:number;r?:number;freeze?:boolean}){
 const m=M[name];if(!m)throw Error('Missing '+name);const z=Math.min(w/m.width,h/m.height),iw=m.width*z,ih=m.height*z;const p=move==='inertia'?spring((t-a)/dur):out((t-a)/dur);
 let dx=move==='left'?-150*(1-p):move==='right'?150*(1-p):0,dy=['up','inertia'].includes(move)?100*(1-p):0;
 const seed=name.length*.83;const drift=hero&&!freeze?{x:11*Math.sin((t-a)*.82+seed),y:7*Math.sin((t-a)*1.04+seed*.5),r:.38*Math.sin((t-a)*.64+seed)}:{x:0,y:0,r:0};
 const zoom=move==='focus'?lerp(.94,1,p):1;
 return <div data-art={name} style={{position:'absolute',left:x-iw/2+dx+drift.x,top:y-ih/2+dy+drift.y,width:iw,height:ih,opacity:window(t,a,b)*opacity,transform:`scale(${k*zoom}) rotate(${r+drift.r}deg)`,clipPath:'inset(2px)'}}><Img src={staticFile('art/'+name+'.png')} style={{width:'100%',height:'100%'}}/></div>;
}
function T({children,t,a,b,x=960,y=480,w=1500,size=84,weight=700,color=W,align='center',tracking=0,mode='rise',d=.5}:{children:React.ReactNode;t:number;a:number;b:number;x?:number;y?:number;w?:number;size?:number;weight?:number;color?:string;align?:'left'|'center'|'right';tracking?:number;mode?:string;d?:number}){
 const p=out((t-a)/d);return <div data-qa-text style={{position:'absolute',left:x-w/2,top:y,width:w,color,fontSize:size,fontFamily:'Jost',fontWeight:weight,lineHeight:1.13,letterSpacing:tracking,textAlign:align,whiteSpace:'pre-wrap',opacity:window(t,a,b,Math.min(.3,d)),transform:`translate(${mode==='side'?35*(1-p):0}px,${mode==='rise'?26*(1-p):0}px)`,clipPath:mode==='wipe'?`inset(0 ${100*(1-p)}% 0 0)`:'none'}}>{children}</div>;
}
function Line({t,a,b,x,y,w=500,color=R,curve=false,weight=4}:{t:number;a:number;b:number;x:number;y:number;w?:number;color?:string;curve?:boolean;weight?:number}){return <svg width={w} height={35} style={{position:'absolute',left:x,top:y,opacity:vanish(t,b)}}><path d={curve?`M 5 15 Q ${w*.45} 11 ${w-5} 18`:`M 4 17 L ${w-4} 17`} fill="none" stroke={color} strokeWidth={weight} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1-sm((t-a)/.52)}/></svg>}
function Crunch({t,a,b,x=960,y=625,h=640,w=1450,up,down,entry='fade'}:{t:number;a:number;b:number;x?:number;y?:number;h?:number;w?:number;up:number;down?:number;entry?:string}){const q=t>=up&&(!down||t<down)?1:0;return <><A name="x-crunch-low" t={t} a={a} b={b} x={x} y={y} h={h} w={w} move={entry} freeze opacity={1-q}/><A name="x-crunch-high" t={t} a={a} b={b} x={x} y={y} h={h} w={w} move={entry} freeze opacity={q}/></>}
function Opening({t}:{t:number}){const k=1+.025*sm(t/3);return <>
<A name="h-intro" t={t} a={0} b={3.53} x={490} y={612} h={1150} w={700} move="left" hero k={k}/>
<T t={t} a={.76} b={2.25} x={1330} y={452} w={820} size={45} weight={450} color={G} align="left">your shirts</T>
<T t={t} a={1.316} b={2.25} x={1330} y={520} w={820} size={91} align="left" mode="side">fit better.</T>
<T t={t} a={2.294} b={3.53} x={1330} y={438} w={820} size={45} weight={450} color={G} align="left">your face looks</T>
<T t={t} a={2.854} b={3.53} x={1330} y={505} w={820} size={108} align="left" mode="side">leaner.</T>
</>}
function Mirror({t,a=3.48,b=8.66,quick=false}:{t:number;a?:number;b?:number;quick?:boolean}){
 const zoom=quick?0:sm((t-5.6)/2.25),x=quick?960:lerp(980,1310,zoom),y=quick?490:lerp(560,535,zoom);
 return <><A name="s-mirror" t={t} a={a} b={b} x={x} y={y} h={quick?760:910} w={1000} k={quick?1:lerp(1,1.12,zoom)} move="focus"/>{!quick&&<><T t={t} a={5.977} b={b} x={555} y={408} w={780} align="left" size={45} weight={450} color={G}>but your belly...</T><T t={t} a={6.96} b={b} x={555} y={485} w={780} align="left" size={96}>still here.</T></>}{quick&&<T t={t} a={12.83} b={b} y={913} size={57} weight={500}>Again tomorrow.</T>}</>;
}
function Loop({t}:{t:number}){const q=sm((t-9.65)/.3);return <>
{t<10.5&&<><A name="o2-plate-potato" t={t} a={8.66} b={10.5} x={960} y={595} h={670} w={1000} move="inertia" dur={.8} opacity={1-q} r={-2+2*out((t-8.66)/.8)}/><A name="o2-plate-empty" t={t} a={8.66} b={10.5} x={960} y={595} h={670} w={1000} move="inertia" dur={.8} opacity={q}/><T t={t} a={9.65} b={10.5} y={190} size={72} weight={650}>Eat less.</T></>}
{t>=10.45&&t<11.9&&<><Crunch t={t} a={10.45} b={11.9} up={10.99} down={11.6} h={580} y={620}/><T t={t} a={10.902} b={11.9} y={150} size={72} weight={650}>More crunches.</T></>}
{t>=11.857&&<Mirror t={t} a={11.857} b={13.82} quick/>}
</>}
function Fatigue({t}:{t:number}){return <><A name="h-think" t={t} a={13.8} b={17.9} x={510} y={620} h={1090} w={770} move="right" hero/>
<T t={t} a={15.043} b={17.9} x={1320} y={382} w={820} align="left" size={94} weight={650}>tired.</T><T t={t} a={15.899} b={17.9} x={1320} y={517} w={820} align="left" size={94} weight={650} color={G}>hungry.</T>
<T t={t} a={17.9} b={19.45} y={435} size={91} weight={700} mode="wipe">nothing is working.</T>
</>}
function Scoreboard({t}:{t:number}){const p=sm((t-21.0)/1.0);return <>
<A name="s-mirror" t={t} a={19.45} b={24.4} x={540} y={570} h={840} w={700} move="left" k={.99+.02*p}/>
<T t={t} a={19.8} b={24.4} x={1330} y={313} w={790} size={40} color={G} weight={450} tracking={2.5}>HERE'S THE PROBLEM</T>
<T t={t} a={21.737} b={24.4} x={1320} y={427} w={820} size={135} weight={300}>TODAY</T>
<Line t={t} a={23.03} b={24.4} x={1075} y={492} w={490} color={R} curve/>
<T t={t} a={23.495} b={24.4} x={1320} y={655} w={830} size={61} weight={650}>A terrible scoreboard.</T>
</>}
function TwoProblems({t}:{t:number}){return <>
{t<27.08&&<><Crunch t={t} a={24.39} b={27.13} x={950} y={660} h={565} up={25.25}/><T t={t} a={25.817} b={27.13} y={147} size={45} weight={450} color={G}>you might be chasing</T><T t={t} a={26.23} b={27.13} y={220} size={93}>the wrong change.</T></>}
{t>=27.08&&<><A name="o-hourglass-full" t={t} a={27.08} b={30.12} x={1285} y={560} h={820} w={460} move="right" dur={1.0}/><T t={t} a={27.803} b={30.12} x={565} y={407} w={760} size={46} weight={450} align="left" color={G}>the right change...</T><T t={t} a={28.937} b={30.12} x={565} y={479} w={760} size={88} align="left">the wrong clock.</T></>}
</>}
function Promise({t}:{t:number}){return <><A name="h-tape" t={t} a={30.09} b={37.2} x={1315} y={572} h={1015} w={765} move="inertia" dur={1.25}/>
<T t={t} a={31.37} b={37.2} x={555} y={274} w={790} size={40} color={G} weight={450} align="left" tracking={3}>BY THE END, YOU'LL KNOW</T>
<T t={t} a={32.822} b={37.2} x={555} y={395} w={790} size={114} align="left" mode="wipe">WHAT</T>
<T t={t} a={34.262} b={37.2} x={555} y={541} w={790} size={114} align="left" mode="wipe">WHEN</T>
<T t={t} a={35.567} b={37.2} x={555} y={750} w={790} size={46} color={G} weight={450} align="left">to change your plan.</T>
</>}
function Myths({t}:{t:number}){const first=t<38.75,a=first?37.19:38.75,b=first?38.78:40.26;return <><T t={t} a={a} b={b} y={432} size={92} weight={650}>{first?'Belly burner.':'Punishment workout.'}</T><Line t={t} a={first?37.979:39.58} b={b} x={first?694:497} y={466} w={first?532:926} color={R}/></>}
function ReadSignal({t}:{t:number}){return <><A name="h-open" t={t} a={40.246} b={43.3} x={550} y={630} h={1150} w={1060} move="left" hero/>
<T t={t} a={40.767} b={43.3} x={1340} y={390} w={815} size={43} color={G} weight={450} align="left">a better way to read</T>
<T t={t} a={41.862} b={43.3} x={1340} y={470} w={815} size={86} align="left">what's happening.</T>
</>}
function Training({t}:{t:number}){const start=43.28;return <>
<T t={t} a={start} b={56.38} x={147} y={48} w={90} size={54} weight={300} color={EM}>01</T><T t={t} a={43.78} b={56.38} x={719} y={65} w={1020} size={40} weight={650} align="left">Give training the right job</T>
{t<52.04&&<Crunch t={t} a={44.0} b={52.15} y={650} h={620} up={47.407} down={51.85} entry="up"/>}
{t<52.04&&<><T t={t} a={46.417} b={52.06} y={200} size={74} weight={650}>Training a muscle</T><T t={t} a={48.23} b={52.06} y={296} size={51} weight={450} color={G}>doesn't reliably choose where fat comes off.</T></>}
{t>=52.04&&<><Crunch t={t} a={52.04} b={56.38} y={650} h={620} up={53.007}/><T t={t} a={53.65} b={55.25} y={205} size={50} weight={450} color={G}>a message to your abs</T><T t={t} a={55.572} b={56.38} y={190} size={94}>Get stronger.</T></>}
</>}
function Close({t}:{t:number}){return <><T t={t} a={56.363} b={60.13} y={328} size={53} weight={450} color={G}>It isn't</T><T t={t} a={57.234} b={60.13} y={413} size={92}>a shipping address</T><T t={t} a={58.15} b={60.13} y={533} size={92}>for fat loss.</T></>}
export const Redo:React.FC=()=>{useFont();const f=useCurrentFrame(),t=f/30;const ref=React.useRef<HTMLDivElement>(null);
 React.useLayoutEffect(()=>{const h=delayRender('Layout audit');requestAnimationFrame(()=>requestAnimationFrame(()=>{if(ref.current){const base=ref.current.getBoundingClientRect();if(!base.width||!base.height){continueRender(h);return}const sx=1920/base.width,sy=1080/base.height;const failures:any[]=[];for(const e of ref.current.querySelectorAll('[data-qa-text]')){let o=1,p:Element|null=e;while(p&&p!==ref.current){o*=Number(getComputedStyle(p).opacity);p=p.parentElement}if(o<.08)continue;const r=document.createRange();r.selectNodeContents(e);for(const q of Array.from(r.getClientRects())){const b={left:(q.left-base.left)*sx,right:(q.right-base.left)*sx,top:(q.top-base.top)*sy,bottom:(q.bottom-base.top)*sy};if(b.left<34||b.right>1886||b.top<25||b.bottom>1055)failures.push({text:e.textContent,bounds:b})}}if(failures.length)console.log('REDOQA '+JSON.stringify({frame:f,failures}));}continueRender(h)}));},[f]);
 return <AbsoluteFill ref={ref} style={{background:BG,overflow:'hidden'}}>
 {t<3.53&&<Opening t={t}/>}{t>=3.48&&t<8.66&&<Mirror t={t}/>}{t>=8.66&&t<13.82&&<Loop t={t}/>}{t>=13.8&&t<19.45&&<Fatigue t={t}/>}{t>=19.45&&t<24.4&&<Scoreboard t={t}/>}{t>=24.39&&t<30.12&&<TwoProblems t={t}/>}{t>=30.09&&t<37.2&&<Promise t={t}/>}{t>=37.19&&t<40.26&&<Myths t={t}/>}{t>=40.246&&t<43.3&&<ReadSignal t={t}/>}{t>=43.28&&t<56.38&&<Training t={t}/>}{t>=56.363&&<Close t={t}/>}
 </AbsoluteFill>;
};
