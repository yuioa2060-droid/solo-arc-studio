import React from 'react';import {Img,staticFile} from 'remotion';
import {useT,clamp,ease,eOut,float,EM,INK,GREY} from './lib';
// muted annotation colours (brand bible: natural, desaturated; no cyan/purple)
export const VEG='#6f9a5a',PROT='#b4674f',CARB='#c9a866',SOFTRED='#b5524a';
const life=(t:number,t0:number,t1:number,d=0.5)=>eOut((t-t0)/d)*(1-ease((t-t1)/0.4));
// Plate diagram: vector circle split half / quarter / quarter (exact geometry, no image registration needed)
export const Pie:React.FC<{x:number;y:number;r:number;t0:number;t1:number;at:[number,number,number];labels:[string,string,string]}>=({x,y,r,t0,t1,at,labels})=>{
  const t=useT();if(t<t0||t>t1+0.5)return null;const o=life(t,t0,t1),f=float(t,31,0.6);
  const seg=(a0:number,a1:number,p:number)=>{const a=a0+(a1-a0)*p;const P=(A:number)=>[r+r*0.92*Math.cos(A),r+r*0.92*Math.sin(A)];const [x0,y0]=P(a0),[x1,y1]=P(a);const large=a-a0>Math.PI?1:0;return `M${r} ${r} L${x0} ${y0} A${r*0.92} ${r*0.92} 0 ${large} 1 ${x1} ${y1} Z`;};
  const S=[[-Math.PI/2,Math.PI/2,VEG],[Math.PI/2,Math.PI,PROT],[Math.PI,1.5*Math.PI,CARB]] as const;
  const lab=[[r*1.45,r*1.0],[r*0.62,r*1.42],[r*0.62,r*0.58]];
  return <div style={{position:'absolute',left:x-r+f.x,top:y-r+f.y,width:2*r,height:2*r,opacity:o,transform:`rotate(${f.r}deg)`}}>
    <svg width={2*r} height={2*r} style={{position:'absolute',overflow:'visible',filter:'url(#rough)'}}>
      <circle cx={r} cy={r} r={r*0.98} fill="#151515" stroke={INK} strokeWidth={6}/>
      {S.map(([a0,a1,c],i)=>{const p=eOut((t-at[i])/0.6);return p>0?<path key={i} d={seg(a0,a1,p)} fill={c} opacity={0.92} stroke="#0a0a0a" strokeWidth={5}/>:null;})}
      <circle cx={r} cy={r} r={r*0.92} fill="none" stroke="#0a0a0a" strokeWidth={4}/>
    </svg>
    {labels.map((l,i)=>{const p=eOut((t-at[i]-0.15)/0.4);return <div key={i} style={{position:'absolute',left:lab[i][0],top:lab[i][1],transform:'translate(-50%,-50%)',fontFamily:'Jost',fontWeight:600,fontSize:i===0?44:36,color:INK,opacity:p,textAlign:'center',lineHeight:1.05,textShadow:'0 2px 10px rgba(0,0,0,.8)',whiteSpace:'pre'}}>{l}</div>;})}
  </div>;};
// weekly weigh-ins: jittery dots + drawn emerald average line
export const Avg:React.FC<{x:number;y:number;w:number;h:number;t0:number;tLine:number;t1:number}>=({x,y,w,h,t0,tLine,t1})=>{
  const t=useT();if(t<t0||t>t1+0.5)return null;const o=life(t,t0,t1),f=float(t,33,0.5);
  const vals=[0.35,0.62,0.28,0.55,0.4,0.7,0.45,0.52,0.3,0.6,0.38,0.5];const n=vals.length;const lp=eOut((t-tLine)/0.9);
  return <svg width={w} height={h} style={{position:'absolute',left:x-w/2+f.x,top:y-h/2+f.y,opacity:o,overflow:'visible',filter:'url(#rough)'}}>
    <line x1={0} y1={h} x2={w} y2={h} stroke={GREY} strokeWidth={3}/>
    {vals.map((v,i)=>{const p=eOut((t-t0-0.12*i)/0.3);return <circle key={i} cx={(i+0.5)*w/n} cy={h*0.15+v*h*0.65} r={11*p} fill={INK} opacity={0.85}/>;})}
    <line x1={0} y1={h*0.15+0.47*h*0.65} x2={w*lp} y2={h*0.15+0.47*h*0.65} stroke={EM} strokeWidth={10} strokeLinecap="round"/>
  </svg>;};
// comparison bars (sleep study)
export const Bars:React.FC<{x:number;y:number;t0:number;t1:number;rows:{label:string;at:number;val:number;c?:string}[];w?:number}>=({x,y,t0,t1,rows,w=760})=>{
  const t=useT();if(t<t0||t>t1+0.5)return null;const o=life(t,t0,t1),f=float(t,35,0.5);
  return <div style={{position:'absolute',left:x-w/2+f.x,top:y+f.y,width:w,opacity:o,fontFamily:'Jost',color:INK}}>
    {rows.map((r,i)=>{const p=eOut((t-r.at)/0.8);return <div key={i} style={{display:'flex',alignItems:'center',gap:24,marginBottom:34,opacity:clamp((t-r.at+0.3)/0.3)}}>
      <div style={{width:200,fontSize:44,fontWeight:600,textAlign:'right'}}>{r.label}</div>
      <div style={{height:54,width:(w-240)*r.val*p,background:r.c??EM,borderRadius:4,filter:'url(#rough)'}}/></div>;})}</div>;};
// exercise demo: two poses (cropped, same scale, bottom-anchored), switch on narration verbs / demo rhythm
export const Demo:React.FC<{a:string;b:string;sa:[number,number];sb:[number,number];x:number;bottom:number;scale:number;t0:number;t1:number;sw:number[];seed?:number;enter?:'up'|'left'|'right'|'fade'}>=({a,b,sa,sb,x,bottom,scale,t0,t1,sw,seed=40,enter='up'})=>{
  const t=useT();if(t<t0-0.01||t>t1+0.5)return null;const p=eOut((t-t0)/0.9),q=ease((t-t1)/0.45),f=float(t,seed,0.5);
  let k=0;let last=-9;for(const s of sw)if(t>=s){k=1-k;last=s;}const mix=ease((t-last)/0.28);const wb=k===1?mix:1-mix;
  const dx=enter==='left'?-(1-p)*320:enter==='right'?(1-p)*320:0,dy=enter==='up'?(1-p)*240:0;
  const im=(s:string,sz:[number,number],op:number)=> <Img src={staticFile('img/'+s+'.png')} style={{position:'absolute',left:-sz[0]*scale/2,top:-sz[1]*scale,width:sz[0]*scale,height:sz[1]*scale,opacity:op}}/>;
  return <div style={{position:'absolute',left:x+dx+f.x,top:bottom+dy+f.y,opacity:clamp((t-t0)/0.5)*(1-q),transform:`rotate(${f.r*0.5}deg)`}}>{im(a,sa,1-wb)}{im(b,sb,wb)}</div>;};
// rep counter: "1 … n" pops on each rep
export const Reps:React.FC<{x:number;y:number;t0:number;t1:number;times:number[]}>=({x,y,t0,t1,times})=>{
  const t=useT();if(t<t0||t>t1+0.5)return null;let n=0,lt=0;for(const s of times)if(t>=s){n++;lt=s;}if(!n)return null;
  const u=(t-lt)/0.3,pop=u<1?1+0.18*Math.sin(Math.PI*u):1,o=1-ease((t-t1)/0.4);
  return <div style={{position:'absolute',left:x,top:y,transform:`translate(-50%,-50%) scale(${pop})`,fontFamily:'Jost',color:INK,opacity:o,textAlign:'center',filter:'url(#rough)'}}>
    <div style={{fontSize:30,color:GREY,fontWeight:500,letterSpacing:4}}>REP</div><div style={{fontSize:120,fontWeight:600,lineHeight:1}}>{n}</div></div>;};
// dashed leader + small label (annotation next to the hero, used sparingly)
export const Leader:React.FC<{x0:number;y0:number;x1:number;y1:number;t0:number;t1:number;label:string;c?:string}>=({x0,y0,x1,y1,t0,t1,label,c=INK})=>{
  const t=useT();if(t<t0||t>t1+0.5)return null;const p=eOut((t-t0)/1.0),o=1-ease((t-t1)/0.4);
  return <><svg style={{position:'absolute',left:0,top:0,overflow:'visible',opacity:o}} width={1} height={1}><line x1={x0} y1={y0} x2={x0+(x1-x0)*p} y2={y0+(y1-y0)*p} stroke={c} strokeWidth={3} strokeDasharray="10 8"/></svg>
  <div style={{position:'absolute',left:x1+(x1>x0?16:-16),top:y1,transform:`translate(${x1>x0?0:-100}%,-50%)`,fontFamily:'Jost',fontWeight:500,fontSize:40,color:INK,opacity:o*clamp((t-t0-0.8)/0.3),whiteSpace:'nowrap'}}>{label}</div></>;};
