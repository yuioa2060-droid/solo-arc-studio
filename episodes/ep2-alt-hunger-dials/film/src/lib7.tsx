import React from 'react';import {Img,staticFile} from 'remotion';
import {useT,clamp,ease,eOut,float,swim,EM,INK,GREY} from './lib';
import {SOFTRED} from './lib2';
// EP2 components: dials (the hunger alarm), alarm clock, 24 h hunger curve, signal lines, stat bars, day cards.
const life=(t:number,t0:number,t1:number,d=0.6,o=0.45)=>eOut((t-t0)/d)*(1-ease((t-t1)/o));
const mixc=(a:number[],b:number[],m:number)=>`rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*m)).join(',')})`;
const RGB_RED=[181,82,74],RGB_EM=[11,131,113];
const pol=(cx:number,cy:number,r:number,deg:number)=>[cx+r*Math.sin(deg*Math.PI/180),cy-r*Math.cos(deg*Math.PI/180)];
const overshoot=(x:number)=>{x=clamp(x);const c=1.35;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2);};

// ---- one volume knob: pointer sits at LOUD until turnAt, then turns to QUIET; arc goes red -> emerald
export const LOUD=118,QUIET=-104;
export const Knob:React.FC<{x:number;y:number;r:number;n:number;t0:number;t1:number;turnAt:number;bright?:number;scale?:number;seed?:number;up?:boolean;from?:number;to?:number;waves?:boolean;label?:string}>=({x,y,r,n,t0,t1,turnAt,bright=1,scale=1,seed=5,up=false,from,to,waves=false,label})=>{
  const t=useT();if(t<t0-0.01||t>t1+0.6)return null;const p=eOut((t-t0)/0.7),q=ease((t-t1)/0.5),f=float(t,seed,0.7);
  const A0=from??(up?QUIET:LOUD),A1=to??(up?LOUD:QUIET);
  const m=clamp((t-turnAt)/0.9),a=A0+(A1-A0)*overshoot(m);
  const loud=clamp((a-QUIET)/(LOUD-QUIET));const col=mixc(RGB_EM,RGB_RED,ease(loud));
  const tremble=loud>0.9?2.2*Math.sin(t*47+seed)+1.2*Math.sin(t*91):0;
  const ang=a+tremble;const [px,py]=pol(0,0,r*0.78,ang);const [qx,qy]=pol(0,0,r*0.12,ang);
  const [ax,ay]=pol(0,0,r*0.93,-135),[bx,by]=pol(0,0,r*0.93,Math.max(ang,-134));const large=(ang+135)>180?1:0;
  const ticks=[...Array(11).keys()].map(i=>{const d=-135+27*i;const [x0,y0]=pol(0,0,r*1.06,d),[x1,y1]=pol(0,0,r*(i%5===0?1.24:1.16),d);
    return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={INK} strokeOpacity={i%5===0?0.8:0.4} strokeWidth={i%5===0?5:3.5} strokeLinecap="round"/>;});
  const S=r*4;
  const wv=waves&&loud>0.6?[0,1,2].map(k=>{const ph=(t*1.5+k/3)%1,rr=r*(1.45+0.6*ph),o=(1-ph)*0.85*clamp((loud-0.6)/0.4);
    const [x0,y0]=pol(0,0,rr,55),[x1,y1]=pol(0,0,rr,125),[x2,y2]=pol(0,0,rr,-55),[x3,y3]=pol(0,0,rr,-125);
    return <g key={k} opacity={o} fill="none" stroke={SOFTRED} strokeWidth={8} strokeLinecap="round"><path d={`M${x0} ${y0} A${rr} ${rr} 0 0 1 ${x1} ${y1}`}/><path d={`M${x2} ${y2} A${rr} ${rr} 0 0 0 ${x3} ${y3}`}/></g>;}):null;
  return <div style={{position:'absolute',left:x+f.x-S/2,top:y+f.y-S/2+(1-p)*40,width:S,height:S,opacity:p*(1-q),zIndex:6,transform:`scale(${(0.72+0.28*p)*scale})`,filter:`brightness(${bright})`}}>
    <svg width={S} height={S} style={{overflow:'visible',filter:'url(#rough)'}}><g transform={`translate(${S/2},${S/2})`}>
      {wv}
      <circle r={r} fill="#0f0f0f" stroke={INK} strokeWidth={7}/>
      <circle r={r*0.62} fill="none" stroke={INK} strokeOpacity={0.14} strokeWidth={3}/>
      {ticks}
      <path d={`M${ax} ${ay} A${r*0.93} ${r*0.93} 0 ${large} 1 ${bx} ${by}`} fill="none" stroke={col} strokeWidth={12} strokeLinecap="round"/>
      {n>0?<text x={0} y={r*0.3} textAnchor="middle" fontFamily="Jost" fontWeight={700} fontSize={r*0.95} fill={INK} fillOpacity={0.16}>{n}</text>:null}
      <line x1={qx} y1={qy} x2={px} y2={py} stroke={INK} strokeWidth={11} strokeLinecap="round"/>
      <circle r={r*0.11} fill={INK}/>
      {label?<text x={0} y={r*1.72} textAnchor="middle" fontFamily="Jost" fontWeight={600} fontSize={46} letterSpacing={8} fill={INK}>{label}</text>:null}
    </g></svg></div>;};

// ---- four knobs in a row with names; act = the dial being explained, turnT = when it turns down
export const DIAL_NAMES=['PROTEIN','VOLUME','REAL FOOD','EVENING'];
export const DIAL_X=[345,755,1165,1575],DIAL_Y=465,DIAL_R=126;
export const DialMap:React.FC<{t0:number;t1:number;act:number;turnT?:number;appear?:number[];nameAt?:number[];downAt?:number[];overview?:boolean;dx?:number}>=({t0,t1,act,turnT=1e9,appear,nameAt,downAt,overview,dx=0})=>{
  const t=useT();if(t<t0-0.01||t>t1+0.7)return null;const q=1-ease((t-t1)/0.5);
  const ap=appear??[0,1,2,3].map(i=>t0+0.1*i);const allDone=act>=4;
  return <>{[0,1,2,3].map(i=>{
      const turned=overview?1e9:i<act?(downAt?.[i]??-1):i===act?turnT:1e9;
      const isAct=!overview&&i===act;const done=!overview&&i<act;
      const br=overview||allDone?1:isAct?1:done?0.62:0.42;const sc=isAct?1.1:1;
      return <Knob key={i} n={i+1} x={DIAL_X[i]+dx} y={DIAL_Y} r={DIAL_R} t0={ap[i]} t1={t1} turnAt={turned} bright={br} scale={sc} seed={21+i}/>;})}
    {[0,1,2,3].map(i=>{const vis=clamp((t-(nameAt?nameAt[i]:t0+0.3))/0.4);if(vis<=0)return null;const f=float(t,31+i,0.5);const isAct=overview||allDone||i===act;
      return <div key={i} style={{position:'absolute',left:DIAL_X[i]+dx+f.x,top:DIAL_Y+DIAL_R*1.85+f.y,transform:'translate(-50%,-50%)',zIndex:6,fontFamily:'Jost',fontWeight:600,fontSize:42,letterSpacing:7,color:INK,opacity:q*vis*(isAct?1:0.55),filter:'url(#rough)',whiteSpace:'nowrap'}}>{DIAL_NAMES[i]}</div>;})}
    <svg style={{position:'absolute',left:0,top:0,overflow:'visible',zIndex:5,opacity:q}} width={1920} height={1080}>
      {[0,1,2].map(i=>{const ts=ap[i+1]+0.15;if(t<ts)return null;const pp=clamp((t-ts)/0.4);const x0=DIAL_X[i]+dx+DIAL_R*1.45,x1=DIAL_X[i+1]+dx-DIAL_R*1.45;
        return <line key={i} x1={x0} y1={DIAL_Y} x2={x0+(x1-x0)*pp} y2={DIAL_Y} stroke={INK} strokeOpacity={0.5} strokeWidth={4} strokeDasharray="12 10" strokeLinecap="round"/>;})}
    </svg></>;};

// ---- alarm clock: shakes and rings between ringFrom..ringTo (rings stop when the alarm is turned down)
export const Alarm:React.FC<{src:string;x:number;y:number;h:number;t0:number;t1:number;ringFrom:number;ringTo:number;aw?:number;ah?:number;seed?:number}>=({src,x,y,h,t0,t1,ringFrom,ringTo,aw=0.62,ah=0.12,seed=3})=>{
  const t=useT();if(t<t0-0.01||t>t1+0.6)return null;const p=eOut((t-t0)/0.9),q=ease((t-t1)/0.5),f=float(t,seed,0.6);
  const ring=clamp((t-ringFrom)/0.25)*(1-clamp((t-ringTo)/0.5));const shake=ring*(2.2*Math.sin(t*58)+0.9*Math.sin(t*23));
  const arcs=[0,1,2].map(k=>{const ph=((t*1.6+k/3)%1);const o=ring*(1-ph)*0.9;const rr=h*(0.34+0.2*ph+0.08*k);return {rr,o,k};});
  const cy=y-h*0.34+f.y;
  return <><div style={{position:'absolute',left:x+f.x,top:y+f.y+(1-p)*200,height:h,zIndex:4,transform:`translate(-50%,-50%) rotate(${f.r+shake}deg)`,opacity:clamp((t-t0)/0.5)*(1-q),clipPath:'inset(2px)'}}>
      <Img src={staticFile('img/'+src+'.png')} style={{height:h,display:'block'}}/></div>
    <svg style={{position:'absolute',left:0,top:0,overflow:'visible',zIndex:5,opacity:1-q,filter:'url(#rough)'}} width={1920} height={1080}>
      {arcs.map(({rr,o,k})=>o>0.02?<g key={k} opacity={o}>
        <path d={`M${x-rr*0.82+f.x} ${cy-rr*0.58} A${rr} ${rr} 0 0 0 ${x-rr*1.02+f.x} ${cy+rr*0.05}`} fill="none" stroke={SOFTRED} strokeWidth={9} strokeLinecap="round"/>
        <path d={`M${x+rr*0.82+f.x} ${cy-rr*0.58} A${rr} ${rr} 0 0 1 ${x+rr*1.02+f.x} ${cy+rr*0.05}`} fill="none" stroke={SOFTRED} strokeWidth={9} strokeLinecap="round"/></g>:null)}
    </svg></>;};

// ---- 24 h hunger curve: lowest 8 AM, highest 8 PM (internal body clock), a dot travels along it
const hv=(h:number)=>0.5-0.5*Math.cos(2*Math.PI*(h-8)/24);
export const HungerCurve:React.FC<{x:number;y:number;w:number;h:number;t0:number;t1:number;tDraw:number;drawDur?:number;tPeak:number}>=({x,y,w,h,t0,t1,tDraw,drawDur=3.2,tPeak})=>{
  const t=useT();if(t<t0-0.01||t>t1+0.6)return null;const o=life(t,t0,t1,0.6,0.45),f=float(t,77,0.5);
  const H0=6,H1=24;const X=(hh:number)=>(hh-H0)/(H1-H0)*w,Y=(v:number)=>h-(0.06+0.88*v)*h;
  const pr=eOut((t-tDraw)/drawDur);const hEnd=H0+(H1-H0)*pr;
  let d='';for(let hh=H0;hh<=hEnd+1e-6;hh+=0.25)d+=(d?' L':'M')+X(hh).toFixed(1)+' '+Y(hv(hh)).toFixed(1);
  const dotX=X(hEnd),dotY=Y(hv(hEnd));const pk=eOut((t-tPeak)/0.5);const pulse=t>tPeak?1+0.12*Math.sin((t-tPeak)*5):1;
  const lab=(hh:number,s:string,show:number)=><text x={X(hh)} y={h+54} textAnchor="middle" fontFamily="Jost" fontWeight={600} fontSize={34} letterSpacing={3} fill={INK} opacity={show}>{s}</text>;
  return <svg style={{position:'absolute',left:x-w/2+f.x,top:y-h/2+f.y,overflow:'visible',zIndex:6,opacity:o,filter:'url(#rough)'}} width={w} height={h+90}>
    <line x1={0} y1={h} x2={w} y2={h} stroke={GREY} strokeWidth={3}/>
    <line x1={0} y1={0} x2={0} y2={h} stroke={GREY} strokeWidth={3}/>
    <text x={-18} y={h*0.5} textAnchor="end" fontFamily="Jost" fontWeight={600} fontSize={30} letterSpacing={4} fill={GREY} transform={`rotate(-90 ${-18} ${h*0.5})`}>HUNGER</text>
    {lab(8,'8 AM',clamp((t-tDraw-0.3)/0.4))}{lab(20,'8 PM',clamp((t-tPeak)/0.4))}
    {d?<path d={d} fill="none" stroke={EM} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round"/>:null}
    {pr>0.01?<circle cx={dotX} cy={dotY} r={13} fill={INK}/>:null}
    {pk>0?<g opacity={pk}><circle cx={X(20)} cy={Y(1)} r={34*pulse} fill="none" stroke={SOFTRED} strokeWidth={7}/></g>:null}
  </svg>;};

// ---- two signal lines that leave the baseline after dieting and stay displaced (qualitative)
export const SignalLines:React.FC<{x:number;y:number;w:number;h:number;t0:number;t1:number;at:number[];labels:string[];hungerLabel?:string;fullLabel?:string}>=({x,y,w,h,t0,t1,at,labels,hungerLabel='HUNGER SIGNALS',fullLabel='FULLNESS SIGNALS'})=>{
  const t=useT();if(t<t0-0.01||t>t1+0.6)return null;const o=life(t,t0,t1,0.6,0.45),f=float(t,79,0.5);
  const xs=[0.06,0.5,0.94].map(v=>v*w),base=h*0.5;
  const up=[base,h*0.14,h*0.26],down=[base,h*0.86,h*0.74];
  const seg=(arr:number[],i:number,c:string)=>{const p=clamp((t-at[i])/1.1);if(p<=0)return null;const x0=xs[i-1],y0=arr[i-1],x1=x0+(xs[i]-x0)*p,y1=y0+(arr[i]-y0)*ease(p);
    return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={c} strokeWidth={11} strokeLinecap="round"/>;};
  const dot=(arr:number[],i:number,c:string)=>{const p=eOut((t-(i===0?at[0]:at[i]+0.9))/0.4);return p>0?<circle key={i} cx={xs[i]} cy={arr[i]} r={14*p} fill={c}/>:null;};
  const lab=clamp((t-at[1]-0.8)/0.5);
  return <svg style={{position:'absolute',left:x-w/2+f.x,top:y-h/2+f.y,overflow:'visible',zIndex:6,opacity:o,filter:'url(#rough)'}} width={w} height={h+80}>
    <line x1={0} y1={base} x2={w} y2={base} stroke={GREY} strokeWidth={3} strokeDasharray="10 10"/>
    {[0,1,2].map(i=><text key={i} x={xs[i]} y={h+56} textAnchor="middle" fontFamily="Jost" fontWeight={600} fontSize={32} letterSpacing={3} fill={INK} opacity={clamp((t-at[i]+0.2)/0.4)}>{labels[i]}</text>)}
    {seg(up,1,SOFTRED)}{seg(up,2,SOFTRED)}{seg(down,1,INK)}{seg(down,2,INK)}
    {[0,1,2].map(i=>dot(up,i,SOFTRED))}{[0,1,2].map(i=>dot(down,i,INK))}
    <text x={xs[2]+36} y={up[2]-2} fontFamily="Jost" fontWeight={600} fontSize={34} letterSpacing={3} fill={SOFTRED} opacity={lab}>{hungerLabel.split(' ').map((w,k)=><tspan key={k} x={xs[2]+36} dy={k?38:0}>{w}</tspan>)}</text>
    <text x={xs[2]+36} y={down[2]-2} fontFamily="Jost" fontWeight={600} fontSize={34} letterSpacing={3} fill={INK} opacity={lab}>{fullLabel.split(' ').map((w,k)=><tspan key={k} x={xs[2]+36} dy={k?38:0}>{w}</tspan>)}</text>
  </svg>;};

// ---- horizontal stat bars with a small title; value text counts in after the bar
export const StatBars:React.FC<{x:number;y:number;t0:number;t1:number;title:string;rows:{label:string;val:number;txt:string;c?:string;at:number}[];W?:number;labelW?:number;seed?:number;fs?:number}>=({x,y,t0,t1,title,rows,W=1000,labelW=260,seed=35,fs=44})=>{
  const t=useT();if(t<t0||t>t1+0.5)return null;const o=life(t,t0,t1,0.5,0.4),f=float(t,seed,0.5);
  return <div style={{position:'absolute',left:x-W/2+f.x,top:y+f.y,width:W,opacity:o,fontFamily:'Jost',color:INK,zIndex:6}}>
    <div style={{fontSize:fs*0.78,fontWeight:500,color:GREY,letterSpacing:4,marginBottom:fs*0.7,marginLeft:labelW+24}}>{title}</div>
    {rows.map((r,i)=>{const p=eOut((t-r.at)/0.9);return <div key={i} style={{display:'flex',alignItems:'center',gap:24,marginBottom:fs*0.86,opacity:clamp((t-r.at+0.3)/0.3)}}>
      <div style={{width:labelW,fontSize:fs,fontWeight:600,textAlign:'right',lineHeight:1.05,whiteSpace:'pre'}}>{r.label}</div>
      <div style={{height:fs*1.32,width:(W-labelW-fs*6.6)*r.val*p,background:r.c??EM,borderRadius:3,filter:'url(#rough)'}}/>
      <div style={{fontSize:fs,fontWeight:600,opacity:clamp((t-r.at-0.6)/0.4),whiteSpace:'nowrap'}}>{r.txt}</div></div>;})}</div>;};

// ---- one-day plan cards: tease = blurred fan on the right, show = sharp row
export const DAY:[string,string][]=[['Breakfast','protein\nfirst'],['Lunch','big bowl\nof veg first'],['Dinner','real food\n+ water before'],['Evening','one planned\nsnack + walk'],['Night','same bedtime\n7 h +']];
export const DayCards:React.FC<{t0:number;t1:number;mode:'tease'|'show';dimAt?:number;checkAt?:number[];at?:number[]}>=({t0,t1,mode,dimAt,checkAt,at})=>{
  const t=useT();if(t<t0-0.01||t>t1+0.6)return null;const tease=mode==='tease';
  const W=tease?215:300,H=W*1179/905;const dm=dimAt!==undefined?1-0.55*ease((t-dimAt)/0.6):1;
  return <>{DAY.map((pl,i)=>{const ti=at?at[i]:t0+i*(tease?0.14:0.16);const p=eOut((t-ti)/0.8),o=clamp((t-ti)/0.4)*(1-ease((t-t1-i*0.03)/0.45));const f=float(t,60+i,0.6);
      const x=tease?1130+i*140:250+i*355,y=tease?560+Math.abs(i-2)*16:560,rot=tease?(i-2)*3.4:(i%2?1.4:-1.6);
      const blur=tease?(i===0?2.2:6.5):0;const ck=checkAt?eOut((t-checkAt[i])/0.45):0;
      return <div key={i} style={{position:'absolute',left:x+f.x,top:y+f.y+(1-p)*160,width:W,height:H,transform:`translate(-50%,-50%) rotate(${rot+f.r}deg)`,opacity:o*dm,zIndex:6+(tease?6-i:0)}}>
        <div style={{position:'absolute',inset:0,filter:`blur(${blur}px) brightness(${tease?0.8:1})`}}>
          <div style={{position:'absolute',inset:0,borderRadius:22,background:'linear-gradient(180deg,#181818,#0e0e0e)',border:'1.5px solid #2c2c2a',boxShadow:'0 18px 40px rgba(0,0,0,.6)'}}><div style={{position:'absolute',left:'30%',right:'30%',top:0,height:4,borderRadius:2,background:'#0B8371'}}/></div>
          <div style={{position:'absolute',left:0,right:0,top:H*0.17,textAlign:'center',fontFamily:'Jost',color:INK}}>
            <div style={{fontSize:W*0.13,fontWeight:700,letterSpacing:3,textTransform:'uppercase'}}>{pl[0]}</div>
            <div style={{width:W*0.4,height:3,background:'#0B8371',margin:`${W*0.06}px auto`}}/>
            <div style={{fontSize:W*0.125,fontWeight:500,marginTop:W*0.05,whiteSpace:'pre',lineHeight:1.2}}>{pl[1]}</div></div>
          {ck>0?<svg width={W*0.22} height={W*0.22} viewBox="0 0 60 60" style={{position:'absolute',left:W*0.39,bottom:H*0.07,overflow:'visible'}}><path d="M6 32 L24 50 L56 8" fill="none" stroke={EM} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" pathLength={100} strokeDasharray="100 100" strokeDashoffset={100*(1-ck)}/></svg>:null}
        </div></div>;})}</>;};

// ---- ledger of matched items: each row gets an emerald "=" when its word is spoken
export const Ledger:React.FC<{x:number;y:number;t0:number;t1:number;title:string;rows:{label:string;at:number}[]}>=({x,y,t0,t1,title,rows})=>{
  const t=useT();if(t<t0||t>t1+0.5)return null;const o=life(t,t0,t1,0.5,0.4),f=float(t,83,0.5);
  return <div style={{position:'absolute',left:x+f.x,top:y+f.y,transform:'translate(-50%,0)',opacity:o,fontFamily:'Jost',color:INK,zIndex:6,textAlign:'center'}}>
    <div style={{fontSize:34,fontWeight:500,color:GREY,letterSpacing:5,marginBottom:34,whiteSpace:'nowrap'}}>{title}</div>
    {rows.map((r,i)=>{const p=eOut((t-r.at+0.05)/0.45);return <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:44,marginBottom:30,opacity:clamp((t-r.at+0.2)/0.3),transform:`translateY(${(1-p)*14}px)`}}>
      <div style={{width:330,fontSize:62,fontWeight:600,textAlign:'right'}}>{r.label}</div>
      <svg width={96} height={64} viewBox="0 0 96 64" style={{overflow:'visible',filter:'url(#rough)'}}><path d="M8 20 L88 20 M8 46 L88 46" fill="none" stroke={EM} strokeWidth={11} strokeLinecap="round" pathLength={100} strokeDasharray="100 100" strokeDashoffset={100*(1-p)}/></svg>
      <div style={{width:330,fontSize:62,fontWeight:600,textAlign:'left'}}>{r.label}</div></div>;})}</div>;};
