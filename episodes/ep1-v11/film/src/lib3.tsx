import React from 'react';import {Img,staticFile} from 'remotion';
import {useT,clamp,ease,eOut,float,EM,INK,GREY} from './lib';
// v5 palette: annotation lines are white (INK); colour only for body-part fills/tags: red / orange / green
export const ORANGE='#d9822b',RED='#c8463c';
const life=(t:number,t0:number,t1:number,d=0.5)=>eOut((t-t0)/d)*(1-ease((t-t1)/0.4));
// chapter-map callout on the hero: marker fill on a body part + slow white dashed leader (no end dots) + label outside the body
// the dashed line draws over DRAW s; the mix plays dash-train for exactly that time (t0+0.1 .. t0+0.1+DRAW)
export const CALLOUT_DRAW=0.9;
export const Callout:React.FC<{px:number;py:number;rx:number;ry:number;lx:number;ly:number;label:string;sub?:string;c:string;t0:number;t1:number}>=({px,py,rx,ry,lx,ly,label,sub,c,t0,t1})=>{
  const t=useT();if(t<t0||t>t1+0.5)return null;const o=life(t,t0,t1,0.6),p=clamp((t-t0-0.1)/CALLOUT_DRAW),f=float(t,61,0.6);
  const ex=lx+(lx>px?-14:14);const pe=ease(p)*0.35+p*0.65;
  return <>
    <div style={{position:'absolute',left:px-rx+f.x,top:py-ry+f.y,width:2*rx,height:2*ry,borderRadius:'50%',zIndex:3,mixBlendMode:'multiply',opacity:0.62*o,
      background:`radial-gradient(ellipse at center, ${c} 0%, ${c} 45%, rgba(255,255,255,0) 72%)`,filter:'url(#rough)'}}/>
    <svg style={{position:'absolute',left:0,top:0,overflow:'visible',zIndex:4,opacity:o}} width={1} height={1}>
      {pe>0?<line x1={px+f.x} y1={py+f.y} x2={px+f.x+(ex-px)*pe} y2={py+f.y+(ly-py)*pe} stroke={INK} strokeWidth={4} strokeDasharray="12 9" strokeLinecap="round"/>:null}</svg>
    <div style={{position:'absolute',left:lx+f.x,top:ly+f.y,zIndex:5,transform:`translate(${lx>px?0:-100}%,-50%)`,fontFamily:'Jost',color:INK,opacity:o*clamp((t-t0-0.1-CALLOUT_DRAW*0.85)/0.3),whiteSpace:'nowrap',filter:'url(#rough)',textAlign:lx>px?'left':'right'}}>
      <div style={{fontSize:62,fontWeight:600,color:c,lineHeight:1}}>{label}</div>{sub?<div style={{fontSize:34,fontWeight:500,color:INK,marginTop:6}}>{sub}</div>:null}</div></>;};
// coloured tag (muscle accent / mistake)
export const Tag:React.FC<{x:number;y:number;text:string;c:string;t0:number;t1:number;size?:number}>=({x,y,text,c,t0,t1,size=40})=>{
  const t=useT();if(t<t0||t>t1+0.5)return null;const o=life(t,t0,t1,0.4),f=float(t,63,0.5);
  return <div style={{position:'absolute',left:x+f.x,top:y+f.y,zIndex:6,transform:`translate(-50%,-50%) scale(${0.85+0.15*eOut((t-t0)/0.4)})`,opacity:o,fontFamily:'Jost',fontWeight:600,fontSize:size,color:INK,
    border:`4px solid ${c}`,background:'rgba(10,10,11,.85)',padding:'8px 22px',borderRadius:40,whiteSpace:'nowrap',filter:'url(#rough)'}}>{text}</div>;};
// red X / circle strokes for mistakes
export const RedX:React.FC<{x:number;y:number;s:number;t0:number;t1:number}>=({x,y,s,t0,t1})=>{
  const t=useT();if(t<t0||t>t1+0.5)return null;const p=eOut((t-t0)/0.45),q=ease((t-t1)/0.4);const L=s*1.45;
  return <svg style={{position:'absolute',left:x-s/2,top:y-s/2,opacity:1-q,zIndex:7,overflow:'visible',filter:'url(#rough)'}} width={s} height={s}>
    <path d={`M${s*0.1} ${s*0.1} L${s*0.9} ${s*0.9}`} stroke={RED} strokeWidth={16} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L*(1-clamp(p*2))}/>
    <path d={`M${s*0.9} ${s*0.1} L${s*0.1} ${s*0.9}`} stroke={RED} strokeWidth={16} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L*(1-clamp(p*2-1))}/></svg>;};
// morph: same pose, three bodies crossfading in place + week label underneath
export const Morph:React.FC<{srcs:string[];at:number[];sz:Record<string,[number,number]>;x:number;y:number;h:number;t1:number}>=({srcs,at,sz,x,y,h,t1})=>{
  const t=useT();if(t<at[0]-0.05||t>t1+0.6)return null;const o=clamp((t-at[0])/0.8)*(1-ease((t-t1)/0.5)),f=float(t,71,0.5);
  return <div style={{position:'absolute',left:x+f.x,top:y+f.y,opacity:o}}>{srcs.map((s,i)=>{const a=ease((t-at[i])/0.9)*(i<srcs.length-1?1-ease((t-at[i+1])/0.9):1);const S=sz[s]??[700,1000];const W=h*S[0]/S[1];
    return a>0.001?<Img key={i} src={staticFile('img/'+s+'.png')} style={{position:'absolute',left:-W/2,top:-h/2,height:h,width:W,opacity:a,filter:`blur(${(1-a)*3}px)`}}/>:null;})}</div>;};
// progression steps (staircase)
export const Steps:React.FC<{x:number;y:number;t1:number;rows:{label:string;at:number}[]}>=({x,y,t1,rows})=>{
  const t=useT();if(t<rows[0].at-0.1||t>t1+0.5)return null;const o=1-ease((t-t1)/0.4),f=float(t,73,0.5);
  return <div style={{position:'absolute',left:x+f.x,top:y+f.y,opacity:o,fontFamily:'Jost',color:INK}}>{rows.map((r,i)=>{const p=eOut((t-r.at)/0.5);return <div key={i} style={{position:'absolute',left:i*230-345,top:-i*110,width:210,height:90+i*110,opacity:p,transform:`translateY(${(1-p)*30}px)`}}>
    <div style={{position:'absolute',bottom:0,width:210,height:24+i*110,background:i===rows.length-1?EM:'#2a2a2a',border:`3px solid ${INK}`,borderRadius:6,filter:'url(#rough)'}}/>
    <div style={{position:'absolute',bottom:40+i*110,width:210,textAlign:'center',fontSize:36,fontWeight:600,whiteSpace:'nowrap'}}>{r.label}</div></div>;})}</div>;};

// ---------- v5: technique guides drawn on the exercising body ----------
// pts in screen px. kind: 'line' (polyline), 'arrow' (polyline + chevron head), 'curve' (quadratic p0-p1-p2, optional head)
// c: INK = direction/neutral, EM = correct form, RED = mistake, ORANGE = muscle accent. Dashed by default, no end dots.
export type Guide={pts:[number,number][];kind:'line'|'arrow'|'curve';head?:boolean;c?:string;dash?:boolean;sw?:number;t0:number;t1:number;dur?:number;label?:string;lx?:number;ly?:number;align?:'l'|'r'|'c';spot?:{x:number;y:number;rx:number;ry:number;c:string}};
export const GuideSet:React.FC<{g:Guide[];seed:number;amp?:number}>=({g,seed,amp=0.5})=>{
  const t=useT();const f=float(t,seed,amp);
  return <>{g.map((G,i)=>{if(t<G.t0||t>G.t1+0.4)return null;const dur=G.dur??1.0,c=G.c??INK,sw=G.sw??5;
    const p=clamp((t-G.t0)/dur),pe=p*0.7+ease(p)*0.3,o=clamp((t-G.t0)/0.12)*(1-ease((t-G.t1)/0.35));
    const P=G.pts;const d=G.kind==='curve'?`M${P[0][0]} ${P[0][1]} Q${P[1][0]} ${P[1][1]} ${P[2][0]} ${P[2][1]}`:'M'+P.map(q=>q[0]+' '+q[1]).join(' L');
    const head=G.kind==='arrow'||G.head;const a=P[P.length-1],b=P[P.length-2];const ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const hl=30;
    const hp=clamp((p-0.92)/0.08);
    const h1=[a[0]-hl*Math.cos(ang-0.5),a[1]-hl*Math.sin(ang-0.5)],h2=[a[0]-hl*Math.cos(ang+0.5),a[1]-hl*Math.sin(ang+0.5)];
    const mid='m'+i+'_'+seed;const lo=o*clamp((t-G.t0-dur*0.6)/0.35);
    return <React.Fragment key={i}>
      {G.spot?<div style={{position:'absolute',left:G.spot.x-G.spot.rx+f.x,top:G.spot.y-G.spot.ry+f.y,width:2*G.spot.rx,height:2*G.spot.ry,borderRadius:'50%',zIndex:3,mixBlendMode:'multiply',opacity:0.6*o*ease(p*1.5),
        background:`radial-gradient(ellipse at center, ${G.spot.c} 0%, ${G.spot.c} 45%, rgba(255,255,255,0) 72%)`,filter:'url(#rough)'}}/>:null}
      <svg style={{position:'absolute',left:f.x,top:f.y,overflow:'visible',zIndex:8,opacity:o,filter:'url(#rough)'}} width={1920} height={1080}>
        <defs><mask id={mid} maskUnits="userSpaceOnUse" x={-200} y={-200} width={2400} height={1500}><path d={d} pathLength={1000} fill="none" stroke="#fff" strokeWidth={sw+14} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1000 1000" strokeDashoffset={1000*(1-pe)}/></mask></defs>
        <path d={d} fill="none" stroke={c===EM?INK:"#0a0a0b"} strokeOpacity={c===EM?0.9:0.55} strokeWidth={sw+6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={G.dash===false?undefined:'16 11'} mask={`url(#${mid})`}/>
        <path d={d} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={G.dash===false?undefined:'16 11'} mask={`url(#${mid})`}/>
        {head&&hp>0?<path d={`M${h1[0]} ${h1[1]} L${a[0]} ${a[1]} L${h2[0]} ${h2[1]}`} fill="none" stroke={c} strokeWidth={sw+1} strokeLinecap="round" strokeLinejoin="round" opacity={hp}/>:null}
      </svg>
      {G.label?<div style={{position:'absolute',left:(G.lx??a[0])+f.x,top:(G.ly??a[1])+f.y,zIndex:9,transform:`translate(${G.align==='r'?'-100%':G.align==='c'?'-50%':'0'},-50%) translateY(${(1-lo)*10}px)`,opacity:lo,fontFamily:'Jost',fontWeight:600,fontSize:40,color:INK,whiteSpace:'nowrap',textShadow:'0 2px 14px rgba(0,0,0,.95), 0 0 4px rgba(0,0,0,.9)',filter:'url(#rough)'}}>{G.label}</div>:null}
    </React.Fragment>;})}</>;};
// ---------- v5 hook: sketch scale display (digits flicker, then freeze), viewfinder brackets + flash ----------
export const ScaleLCD:React.FC<{x:number;y:number;t0:number;tF:number;tOff:number;t1:number;val:string}>=({x,y,t0,tF,tOff,t1,val})=>{
  const t=useT();if(t<t0||t>t1+0.5)return null;const p=eOut((t-t0)/0.45),q=ease((t-t1)/0.4);const fr=Math.floor(t*30);
  const tf=t>=tF&&t<tOff?tF:t;const f=float(tf,81,0.5);
  let txt=val;if(t<tF){const r=Math.abs(Math.sin(Math.floor(fr/2)*91.7)*43758.5)%1;txt=(180+r*80).toFixed(1);}
  const off=t>=tOff;const dim=off?1-0.75*ease((t-tOff)/0.4):1;
  const k=t>=tF&&t<tF+0.25?1+0.05*Math.sin(Math.PI*(t-tF)/0.25):1;
  return <div style={{position:'absolute',left:x+f.x,top:y+f.y+(1-p)*30,transform:`translate(-50%,-50%) scale(${(0.9+0.1*p)*k})`,opacity:p*(1-q),zIndex:6}}>
    <div style={{width:440,height:190,border:`6px solid ${INK}`,borderRadius:34,background:'#121212',filter:'url(#rough)',position:'relative'}}>
      <div style={{position:'absolute',left:44,top:34,width:340,height:110,border:`4px solid ${GREY}`,borderRadius:10,background:'#0b0b0b'}}/>
      <div style={{position:'absolute',left:44,top:34,width:300,height:110,display:'flex',alignItems:'center',justifyContent:'flex-end',fontFamily:'Jost',fontWeight:600,fontSize:92,color:INK,opacity:dim,letterSpacing:2,fontVariantNumeric:'tabular-nums'}}>{off?'– – –':txt}</div>
      <div style={{position:'absolute',left:350,top:96,fontFamily:'Jost',fontWeight:500,fontSize:30,color:GREY,opacity:dim}}>lb</div>
    </div></div>;};
export const Brackets:React.FC<{x0:number;y0:number;x1:number;y1:number;t0:number;t1:number}>=({x0,y0,x1,y1,t0,t1})=>{
  const t=useT();if(t<t0||t>t1+0.3)return null;const o=clamp((t-t0)/0.06)*(1-ease((t-t1)/0.25));const L=70;
  const c=(x:number,y:number,sx:number,sy:number)=>`M${x} ${y+sy*L} L${x} ${y} L${x+sx*L} ${y}`;
  return <svg style={{position:'absolute',left:0,top:0,overflow:'visible',zIndex:9,opacity:o,filter:'url(#rough)'}} width={1920} height={1080}>
    <path d={c(x0,y0,1,1)+c(x1,y0,-1,1)+c(x0,y1,1,-1)+c(x1,y1,-1,-1)} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round"/></svg>;};
export const Flash:React.FC<{at:number;peak?:number}>=({at,peak=0.75})=>{const t=useT();const u=t-at;if(u<0||u>0.4)return null;
  return <div style={{position:'absolute',inset:0,zIndex:25,background:'#fff',opacity:peak*(u<0.03?u/0.03:1-ease((u-0.03)/0.37))}}/>;};
// ---------- v5 ending: WEEK 1 stamp slams on, then hard cut ----------
export const Stamp:React.FC<{x:number;y:number;at:number;text:string;c:string}>=({x,y,at,text,c})=>{
  const t=useT();if(t<at)return null;const u=t-at;const s=u<0.12?1.7-0.7*eOut(u/0.12):1+0.03*Math.max(0,1-(u-0.12)/0.15)*Math.sin((u-0.12)*60);
  return <div style={{position:'absolute',left:x,top:y,zIndex:12,transform:`translate(-50%,-50%) rotate(-8deg) scale(${s})`,opacity:clamp(u/0.06)}}>
    <div style={{border:`10px solid ${c}`,borderRadius:16,padding:'6px 40px 10px',fontFamily:'Jost',fontWeight:700,fontSize:150,lineHeight:1.05,color:c,letterSpacing:6,whiteSpace:'nowrap',filter:'url(#rough)',boxShadow:`inset 0 0 0 4px rgba(10,10,11,.6)`}}>{text}</div></div>;};
export const HardCut:React.FC<{at:number}>=({at})=>{const t=useT();return t>=at?<div style={{position:'absolute',inset:0,background:'#000',zIndex:50}}/>:null;};
