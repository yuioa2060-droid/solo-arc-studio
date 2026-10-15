import React from 'react';import BODY from './body.json';import {Img,staticFile} from 'remotion';
import {useT,clamp,ease,eOut,float,swim,EM,INK,GREY} from './lib';
// v6 components — brand blocks (k5 torn sticker, k2 tape paper), no plaques/pills, colour only by meaning.
export const RED6='#b5524a';
const life=(t:number,t0:number,t1:number,d=0.6,o=0.45)=>eOut((t-t0)/d)*(1-ease((t-t1)/o));
// piecewise smooth value: keys [[time,value],...] (eased between consecutive keys, 0.5 s per change)
export const pw=(t:number,keys:[number,number][],d=0.5)=>{let v=keys[0][1];for(let i=1;i<keys.length;i++){const m=ease((t-keys[i][0])/d);v=v+(keys[i][1]-v)*m;}return v;};

// ---- signal sticker: torn paper circle; inside a silhouette (hidden) that reveals to the real colour drawing; '?' for the mystery signal
export const SigSticker:React.FC<{n:number;src:string;x:number;y:number;s:number;t0:number;t1:number;reveal?:number;mystery?:boolean;bright?:[number,number][];scale?:[number,number][];seed?:number;enter?:'up'|'slowup'|'pop';pulse?:number[]}>=({n,src,x,y,s,t0,t1,reveal=1e9,mystery,bright=[[0,1]],scale=[[0,1]],seed=5,enter='up',pulse=[]})=>{
  const t=useT();if(t<t0-0.01||t>t1+0.6)return null;const D=enter==='slowup'?1.4:enter==='pop'?0.55:0.9;const p=eOut((t-t0)/D),q=ease((t-t1)/0.5),f=float(t,seed,0.8);
  const r=ease((t-reveal)/0.9);const b=pw(t,bright);let k=pw(t,scale);for(const pa of pulse){const u=(t-pa)/0.7;if(u>0&&u<1)k*=1+0.08*Math.sin(Math.PI*u);}
  const dy=enter==='pop'?(1-p)*40:(1-p)*(enter==='slowup'?300:200);if(enter==='pop')k*=0.72+0.28*p;
  return <div style={{position:'absolute',left:x+f.x,top:y+f.y+dy,width:s,height:s,zIndex:6,transform:`translate(-50%,-50%) rotate(${f.r*2}deg) scale(${k})`,opacity:clamp((t-t0)/(D*0.6))*(1-q),filter:`brightness(${b})`}}>
    <Img src={staticFile('img/k5-sticker.png')} style={{width:s,height:s,position:'absolute'}}/>
    <div style={{position:'absolute',left:s*0.17,top:s*0.17,width:s*0.66,height:s*0.66,borderRadius:'50%',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
      {mystery&&r<1?<div style={{position:'absolute',fontFamily:'Jost',fontWeight:600,fontSize:s*0.42,color:'#1a1a1a',opacity:1-r,filter:'url(#rough)'}}>?</div>:null}
      {!mystery||r>0?<Img src={staticFile('img/'+src+'.png')} style={{width:'96%',height:'96%',objectFit:'contain',filter:mystery?'none':`blur(${(1-r)*9}px) brightness(${0.5+0.5*r}) saturate(${0.5+0.5*r})`,opacity:mystery?r:1}}/>:null}
    </div>
    <div style={{position:'absolute',left:-s*0.06,top:-s*0.04,width:s*0.36,height:s*0.36}}>
      <Img src={staticFile('img/k5-sticker.png')} style={{width:'100%',height:'100%',position:'absolute',transform:'rotate(-14deg)'}}/>
      <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Jost',fontWeight:700,fontSize:s*0.15,color:'#141414'}}>#{n}</div></div>
  </div>;};

// ---- chapter map: three signal stickers + dashed passage between passed ones + labels of revealed signals (ChapterPassage)
const MAPX=[560,960,1360],MAPY=480,MAPS=270,NAMES=['PLATE','MUSCLE','RECOVERY'],SRC=['o-plate','o-dumbbell','o-moon'];
// sequential build: sticker 1 lands -> dashed passage draws to 2 -> sticker 2 lands -> ... (future stickers fade in dim, no passage)
export const MAP_G=0.8,MAP_SEG0=0.32,MAP_SEGD=0.48;   // mirrored in mix6.py (dash sound)
export const ChapterMap:React.FC<{t0:number;t1:number;act:number;revealT:number;pulses?:number[]}>=({t0,t1,act,revealT,pulses=[]})=>{
  const t=useT();if(t<t0-0.01||t>t1+0.7)return null;const q=1-ease((t-t1)/0.5);
  const all=act<0,last=all?2:act;
  const st=(i:number)=>i<=last?t0+i*MAP_G:t0+last*MAP_G+0.35+0.2*(i-last-1);
  return <>{[0,1,2].map(i=>{const passed=all||i<act,isAct=i===act;const rev=all||passed?0:isAct?revealT:1e9;
      const br:[number,number][]=all?[[0,1]]:isAct?[[0,0.55],[revealT-0.25,1]]:passed?[[0,0.55]]:[[0,0.3]];
      const sc:[number,number][]=isAct?[[0,1],[revealT-0.25,1.14]]:[[0,0.92]];
      return <SigSticker key={i} n={i+1} src={SRC[i]} x={MAPX[i]} y={MAPY} s={MAPS} t0={st(i)} t1={t1} reveal={rev} mystery={i===2} bright={br} scale={sc} seed={11+i} enter="pop" pulse={pulses[i]!==undefined?[pulses[i]]:[]}/>;})}
    <svg style={{position:'absolute',left:0,top:0,overflow:'visible',zIndex:5,opacity:q}} width={1920} height={1080}>
      {[0,1].map(i=>{if(!(i<last))return null;const ts=st(i)+MAP_SEG0;if(t<ts)return null;const pp=clamp((t-ts)/MAP_SEGD);
        const x0=MAPX[i]+MAPS*0.52,x1=MAPX[i+1]-MAPS*0.52,L=x1-x0;
        return <line key={i} x1={x0} y1={MAPY} x2={x0+L*pp} y2={MAPY} stroke={INK} strokeOpacity={0.75} strokeWidth={4} strokeDasharray="12 10" strokeLinecap="round"/>;})}
    </svg>
    {[0,1,2].map(i=>{const vis=all||i<act?clamp((t-st(i)-0.25)/0.4):i===act?clamp((t-revealT-0.2)/0.5):0;if(vis<=0)return null;const f=float(t,21+i,0.5);
      return <div key={i} style={{position:'absolute',left:MAPX[i]+f.x,top:MAPY+MAPS*0.66+f.y,transform:'translate(-50%,-50%)',fontFamily:'Jost',fontWeight:600,fontSize:46,letterSpacing:8,color:INK,opacity:q*vis*(all||i===act?1:0.55),filter:'url(#rough)'}}>{NAMES[i]}</div>;})}
  </>;};

// ---- side text (v4 vibe): hero LEFT, stacked lines on the RIGHT; small grey words + big white key words, each word on its voice time
export type SW={w:string;at:number;big?:boolean};
export const SideText:React.FC<{lines:SW[][];x?:number;y?:number;t1:number;size?:number;seed?:number;checks?:boolean}>=({lines,x=930,y=540,t1,size=54,seed=7,checks})=>{
  const t=useT();const first=lines[0][0].at;if(t<first-0.1||t>t1+0.35)return null;const q=ease((t-t1)/0.3),f=float(t,seed,0.6);
  const lh=lines.map(l=>l.some(w=>w.big)?size*2.25:size*1.55);const H=lh.reduce((a,b)=>a+b,0);let yy=y-H/2;
  return <div style={{position:'absolute',left:0,top:0,width:1920,height:1080,zIndex:6,opacity:1-q,filter:'url(#rough)'}}>{lines.map((l,li)=>{const top=yy;yy+=lh[li];
    return <div key={li} style={{position:'absolute',left:x+f.x,top:top+f.y,height:lh[li],display:'flex',alignItems:'flex-end',paddingBottom:size*0.2,boxSizing:'border-box',whiteSpace:'nowrap',fontFamily:'Jost',textShadow:'0 2px 18px rgba(0,0,0,.9)'}}>{checks?(()=>{const c=eOut((t-l[0].at+0.15)/0.4);return <svg width={60} height={60} style={{position:'absolute',left:-84,bottom:size*0.35,overflow:'visible'}}><path d='M6 32 L24 50 L56 8' fill='none' stroke={EM} strokeWidth={9} strokeLinecap='round' strokeLinejoin='round' pathLength={100} strokeDasharray='100 100' strokeDashoffset={100*(1-c)}/></svg>;})():null}<div style={{display:'flex',alignItems:'baseline',gap:size*0.3}}>
      {l.map((w,i)=>{const p=eOut((t-w.at+0.04)/0.32);return <span key={i} style={{fontSize:w.big?size*1.9:size,fontWeight:w.big?700:500,color:w.big?INK:GREY,opacity:p,transform:`translateY(${(1-p)*16}px)`,display:'inline-block',letterSpacing:w.big?1:0}}>{w.w}</span>;})}</div></div>;})}</div>;};

// ---- sleep window on a 24 h dial: emerald arc 23:00 -> 06:30 draws, "7 h+" in the centre
export const SleepRing:React.FC<{x:number;y:number;r:number;t0:number;t1:number;tArc:number}>=({x,y,r,t0,t1,tArc})=>{
  const t=useT();if(t<t0||t>t1+0.5)return null;const o=eOut((t-t0)/0.6)*(1-ease((t-t1)/0.45)),f=float(t,61,0.6);
  const p=eOut((t-tArc)/1.4);const ang=(h:number)=>(h/24)*Math.PI*2-Math.PI/2;const pt=(h:number,rr=r)=>[rr*Math.cos(ang(h)),rr*Math.sin(ang(h))];
  const a0=23,a1=23+7.5*p;const [sx,sy]=pt(a0),[ex,ey]=pt(a1);const large=(a1-a0)>12?1:0;
  const ticks=[];for(let h=0;h<24;h++){const [ax,ay]=pt(h,r+26),[bx,by]=pt(h,r+(h%6===0?52:40));ticks.push(<line key={h} x1={ax} y1={ay} x2={bx} y2={by} stroke={INK} strokeOpacity={h%6===0?0.85:0.35} strokeWidth={h%6===0?5:3} strokeLinecap="round"/>);}
  const lab=(h:number,txt:string,show:number)=>{const [lx,ly]=pt(h,r+92);return <text x={lx} y={ly+12} textAnchor="middle" fontFamily="Jost" fontWeight={600} fontSize={34} fill={INK} opacity={show}>{txt}</text>;};
  return <svg style={{position:'absolute',left:x-r-160+f.x,top:y-r-160+f.y,overflow:'visible',zIndex:6,opacity:o,filter:'url(#rough)'}} width={2*r+320} height={2*r+320}>
    <g transform={`translate(${r+160},${r+160})`}>
      <circle r={r} fill="none" stroke={INK} strokeOpacity={0.18} strokeWidth={30}/>{ticks}
      {p>0.001?<path d={`M${sx} ${sy} A${r} ${r} 0 ${large} 1 ${ex} ${ey}`} fill="none" stroke={EM} strokeWidth={30} strokeLinecap="round"/>:null}
      {lab(23,'23:00',clamp((t-tArc)/0.4))}{lab(6.5,'06:30',clamp((t-tArc-1.2)/0.4))}
      <text x={0} y={22} textAnchor="middle" fontFamily="Jost" fontWeight={700} fontSize={92} fill={INK} opacity={clamp((t-tArc-0.6)/0.5)}>7 h+</text>
    </g></svg>;};

// ---- plain caption (white, readable, centred at x,y)
export const Caption:React.FC<{x:number;y:number;text:string;t0:number;t1:number;size?:number;c?:string;w?:number;seed?:number}>=({x,y,text,t0,t1,size=46,c=INK,w=600,seed=9})=>{
  const t=useT();if(t<t0-0.01||t>t1+0.5)return null;const p=eOut((t-t0)/0.45),o=p*(1-ease((t-t1)/0.35)),f=float(t,seed,0.5);
  return <div style={{position:'absolute',left:x+f.x,top:y+f.y+(1-p)*14,transform:'translate(-50%,-50%)',zIndex:8,fontFamily:'Jost',fontWeight:w,fontSize:size,color:c,opacity:o,whiteSpace:'pre',textAlign:'center',lineHeight:1.15,textShadow:'0 2px 16px rgba(0,0,0,.95)',filter:'url(#rough)'}}>{text}</div>;};

// ---- emerald tape label (brand k2 tape strip), used for week marks
export const TapeLabel:React.FC<{x:number;y:number;text:string;t0:number;t1:number;dim?:number;rot?:number;seed?:number}>=({x,y,text,t0,t1,dim,rot=-4,seed=13})=>{
  const t=useT();if(t<t0-0.01||t>t1+0.5)return null;const p=eOut((t-t0)/0.5),f=float(t,seed,0.5);const d=dim!==undefined?1-0.6*ease((t-dim)/0.5):1;
  return <div style={{position:'absolute',left:x+f.x,top:y+f.y+(1-p)*-20,transform:`translate(-50%,-50%) rotate(${rot+f.r}deg)`,zIndex:7,opacity:p*(1-ease((t-t1)/0.4))*d}}>
    <div style={{background:'rgba(11,131,113,.92)',padding:'10px 26px 12px',fontFamily:'Jost',fontWeight:600,fontSize:40,letterSpacing:5,color:INK,whiteSpace:'nowrap',filter:'url(#rough)',
      clipPath:'polygon(0% 8%,4% 0%,9% 6%,15% 1%,22% 5%,30% 0%,38% 6%,47% 1%,55% 5%,63% 0%,71% 6%,80% 1%,88% 5%,95% 0%,100% 7%,98% 50%,100% 93%,95% 100%,88% 95%,80% 100%,71% 94%,63% 100%,55% 95%,47% 100%,38% 94%,30% 100%,22% 95%,15% 100%,9% 94%,4% 100%,0% 92%,2% 50%)'}}>{text}</div></div>;};

// ---- hand-drawn emerald ring (marks a belt hole etc.)
export const Ring:React.FC<{x:number;y:number;r:number;t0:number;t1:number;c?:string;sw?:number}>=({x,y,r,t0,t1,c=EM,sw=7})=>{
  const t=useT();if(t<t0||t>t1+0.5)return null;const p=eOut((t-t0)/0.7),o=1-ease((t-t1)/0.4);const L=2*Math.PI*r*1.15;
  const d=`M${x+r} ${y-r*0.15} A${r} ${r*0.92} 0 1 1 ${x+r*0.7} ${y-r*0.75} L${x+r*1.08} ${y-r*0.35}`;
  return <svg style={{position:'absolute',left:0,top:0,overflow:'visible',zIndex:8,opacity:o,filter:'url(#rough)'}} width={1920} height={1080}><path d={d} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L*(1-p)}/></svg>;};

// ---- plan cards (HiddenPlan): tease = blurred fan on the right, only "DAY 1" readable; show = sharp row with the real plan
export const PLAN:[string,string][]=[['Train','+ 10-min walk'],['Walk','15 min'],['Train','+ 10-min walk'],['Walk','15 min'],['Train','+ 10-min walk'],['Long walk','30 min'],['Rest','avg weight\n+ waist']];
export const PlanCards:React.FC<{t0:number;t1:number;mode:'tease'|'show';dimAt?:number}>=({t0,t1,mode,dimAt})=>{
  const t=useT();if(t<t0-0.01||t>t1+0.6)return null;const tease=mode==='tease';
  const W=tease?205:236,H=W*1179/905;const dm=dimAt!==undefined?1-0.55*ease((t-dimAt)/0.6):1;
  return <>{PLAN.map((pl,i)=>{const ti=t0+i*(tease?0.13:0.11);const p=eOut((t-ti)/0.8),o=clamp((t-ti)/0.4)*(1-ease((t-t1-i*0.03)/0.45));const f=float(t,40+i,0.6);
      const x=tease?1080+i*112:200+i*253,y=tease?560+Math.abs(i-3)*14:600,rot=tease?(i-3)*3.2:(i%2?1.6:-1.8);
      const blur=tease?(i===0?2.2:6.5):0;
      return <div key={i} style={{position:'absolute',left:x+f.x,top:y+f.y+(1-p)*160,width:W,height:H,transform:`translate(-50%,-50%) rotate(${rot+f.r}deg)`,opacity:o*dm,zIndex:6+(tease?7-i:0)}}>
        <div style={{position:'absolute',inset:0,filter:`blur(${blur}px) brightness(${tease?0.8:1})`}}>
          <div style={{position:'absolute',inset:0,borderRadius:22,background:'linear-gradient(180deg,#181818,#0e0e0e)',border:'1.5px solid #2c2c2a',boxShadow:'0 18px 40px rgba(0,0,0,.6)'}}><div style={{position:'absolute',left:'30%',right:'30%',top:0,height:4,borderRadius:2,background:'#0B8371'}}/></div>
          <div style={{position:'absolute',left:0,right:0,top:H*0.2,textAlign:'center',fontFamily:'Jost',color:INK}}>
            <div style={{fontSize:W*0.15,fontWeight:700,letterSpacing:3}}>DAY {i+1}</div>
            <div style={{width:W*0.4,height:3,background:'#0B8371',margin:`${W*0.05}px auto`}}/>
            <div style={{fontSize:W*0.14,fontWeight:600,marginTop:W*0.06}}>{pl[0]}</div>
            <div style={{fontSize:W*0.1,fontWeight:500,marginTop:W*0.03,whiteSpace:'pre',lineHeight:1.15,color:GREY}}>{pl[1]}</div></div></div>
      </div>;})}
    {!tease?<Caption x={960} y={215} text={'every day:  protein in each meal  ·  same bedtime  ·  7 h+ sleep'} t0={t0+0.9} t1={t1} size={40} w={500} seed={48}/>:null}
  </>;};

// ---- exercise preview cards (k2 paper with the pose inside)
export const ExCards:React.FC<{t0:number;t1:number;items:{src:string;name:string}[];x0:number;dx:number;y:number}>=({t0,t1,items,x0,dx,y})=>{
  const t=useT();if(t<t0-0.01||t>t1+0.6)return null;const W=270,H=W*1179/905;
  return <>{items.map((it,i)=>{const ti=t0+i*0.3;const p=eOut((t-ti)/0.8),o=clamp((t-ti)/0.4)*(1-ease((t-t1)/0.45));const f=float(t,50+i,0.6);
    return <div key={i} style={{position:'absolute',left:x0+i*dx+f.x,top:y+f.y+(1-p)*180,width:W,height:H,transform:`translate(-50%,-50%) rotate(${(i-1)*2.5+f.r}deg)`,opacity:o,zIndex:6}}>
      <div style={{position:'absolute',inset:0,borderRadius:22,background:'linear-gradient(180deg,#181818,#0e0e0e)',border:'1.5px solid #2c2c2a',boxShadow:'0 18px 40px rgba(0,0,0,.6)'}}><div style={{position:'absolute',left:'30%',right:'30%',top:0,height:4,borderRadius:2,background:'#0B8371'}}/></div>
      <div style={{position:'absolute',left:W*0.13,right:W*0.13,top:H*0.15,height:H*0.56,display:'flex',alignItems:'center',justifyContent:'center',background:'#080808',borderRadius:14}}>
        <Img src={staticFile('img/'+it.src+'.png')} style={{maxWidth:'90%',maxHeight:'90%',objectFit:'contain'}}/></div>
      <div style={{position:'absolute',left:0,right:0,top:H*0.75,textAlign:'center',fontFamily:'Jost',fontWeight:600,fontSize:30,color:INK,lineHeight:1.1,whiteSpace:'pre'}}>{it.name}</div>
    </div>;})}</>;};

// ---- small exercise title, top-left (number + name)
export const ExTitle:React.FC<{n:string;name:string;t0:number;t1:number}>=({n,name,t0,t1})=>{
  const t=useT();if(t<t0||t>t1+0.5)return null;const o=life(t,t0+0.3,t1,0.6,0.4);
  return <div style={{position:'absolute',left:120,top:96,zIndex:9,fontFamily:'Jost',color:INK,opacity:o,filter:'url(#rough)',display:'flex',alignItems:'baseline',gap:22}}>
    <span style={{fontSize:40,fontWeight:500,color:GREY,letterSpacing:3}}>{n}</span><span style={{fontSize:54,fontWeight:600}}>{name}</span></div>;};

// ---- push-up from above: elbows ~45° from the body (correct, emerald) vs flared 90° (muted red, brief)
export const TopView45:React.FC<{x:number;y:number;t0:number;t1:number;wrongAt:number}>=({x,y,t0,t1,wrongAt})=>{
  const t=useT();if(t<t0||t>t1+0.5)return null;const o=life(t,t0,t1,0.6,0.4),f=float(t,57,0.5);
  const a=eOut((t-t0-0.3)/0.9);const w=clamp((t-wrongAt)/0.3)*(1-ease((t-wrongAt-1.6)/0.5));
  const S=(d:string,c:string,p:number,sw=9)=><path d={d} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" pathLength={100} strokeDasharray="100 100" strokeDashoffset={100*(1-p)}/>;
  return <div style={{position:'absolute',left:x-200+f.x,top:y-170+f.y,width:400,height:340,opacity:o,zIndex:9,transform:'scale(1.5)',transformOrigin:'50% 50%'}}>
    <svg width={400} height={340} style={{overflow:'visible',filter:'url(#rough)'}}>
      <ellipse cx={200} cy={62} rx={30} ry={34} fill="none" stroke={INK} strokeWidth={7}/>
      {S('M140 118 Q200 104 260 118 L246 300 Q200 312 154 300 Z',INK,1,7)}
      {S('M146 124 L92 190 L96 250',EM,a)}{S('M254 124 L308 190 L304 250',EM,a)}
      <path d="M150 168 A48 48 0 0 1 118 160" fill="none" stroke={EM} strokeWidth={4} opacity={a}/>
      <g opacity={w}>{S('M146 124 L52 124 L52 186','#b5524a',1,7)}{S('M254 124 L348 124 L348 186','#b5524a',1,7)}</g>
    </svg>
    <div style={{position:'absolute',left:-4,top:196,fontFamily:'Jost',fontWeight:600,fontSize:46,color:EM,opacity:a,textShadow:'0 2px 10px rgba(0,0,0,.9)'}}>45°</div>
    <div style={{position:'absolute',left:362,top:112,fontFamily:'Jost',fontWeight:600,fontSize:38,color:'#c9675e',opacity:w}}>90°</div>
    <div style={{position:'absolute',left:0,right:0,top:322,textAlign:'center',fontFamily:'Jost',fontWeight:500,fontSize:30,letterSpacing:4,color:GREY,opacity:a}}>TOP VIEW</div>
  </div>;};

// ---- sleep study bars with values
export const FatBars:React.FC<{x:number;y:number;t0:number;t1:number;rows:{label:string;val:number;txt:string;c?:string;at:number}[]}>=({x,y,t0,t1,rows})=>{
  const t=useT();if(t<t0||t>t1+0.5)return null;const o=life(t,t0,t1,0.5,0.4),f=float(t,35,0.5);const W=820;
  return <div style={{position:'absolute',left:x-W/2+f.x,top:y+f.y,width:W,opacity:o,fontFamily:'Jost',color:INK,zIndex:6}}>
    <div style={{fontSize:34,fontWeight:500,color:GREY,letterSpacing:4,marginBottom:30,marginLeft:224}}>FAT LOST</div>
    {rows.map((r,i)=>{const p=eOut((t-r.at)/0.9);return <div key={i} style={{display:'flex',alignItems:'center',gap:24,marginBottom:38,opacity:clamp((t-r.at+0.3)/0.3)}}>
      <div style={{width:200,fontSize:48,fontWeight:600,textAlign:'right'}}>{r.label}</div>
      <div style={{height:58,width:(W-430)*r.val*p,background:r.c??EM,borderRadius:3,filter:'url(#rough)'}}/>
      <div style={{fontSize:44,fontWeight:600,opacity:clamp((t-r.at-0.6)/0.4)}}>{r.txt}</div></div>;})}</div>;};

export const FadeBlack:React.FC<{at:number;d:number}>=({at,d})=>{const t=useT();if(t<at)return null;return <div style={{position:'absolute',inset:0,background:'#000',zIndex:40,opacity:ease((t-at)/d)}}/>;};

// ---- v9 BODY PROGRESS: hero in side profile, week 1 -> weeks 3-6 -> weeks 8-12 (aligned PNGs b-w1..3, cross-morph)
// emerald waist line (back -> belly, same row) shrinks on every morph; final: line-up, earlier states dim.
export const BodyProgress:React.FC<{t0:number;tA:number;tB:number;tLine:number;t1:number;labels:string[];caps:[string,number,number][]}>=({t0,tA,tB,tLine,t1,labels,caps})=>{
  const t=useT();if(t<t0-0.01||t>t1+0.8)return null;
  const B=BODY as any;const Hh=900,k=Hh/B.h,Wd=B.w*k;const out=1-ease((t-t1)/0.6);
  const m1=ease((t-tA)/1.1),m2=ease((t-tB)/1.1),lu=ease((t-tLine)/1.3);
  const cx=760,top=1030-Hh;const sw=swim(t,3);const enterP=eOut((t-t0)/1.3);
  const slotX=[540,960,1380];
  const fig=(i:number)=>{const main=[1-m1,m1*(1-m2),m2][i];
    const x=cx+(slotX[i]-cx)*lu;const kk=1-0.26*lu;
    const opMain=i===2?main:main*(1-lu);const opLine=lu*(i===2?1:0.42);const op=Math.max(opMain,opLine)*enterP*out;
    if(op<0.003)return null;const dim=i===2?1:1-0.5*lu;const blur=(i<2?(i===0?m1:m2):0)*(1-lu)*3;
    return <div key={i} style={{position:'absolute',left:x-Wd*kk/2+sw.x*(1-lu),top:top+Hh*(1-kk)-60*lu+(1-enterP)*140+sw.y*(1-lu),width:Wd*kk,height:Hh*kk,opacity:op,zIndex:5+i,filter:`brightness(${(0.25+0.75*enterP)*dim}) saturate(${dim}) blur(${blur}px)`}}>
      <Img src={staticFile(`img/b-w${i+1}.png`)} style={{width:'100%',height:'100%'}}/></div>;};
  const wl=B.waist[0][0]+(B.waist[1][0]-B.waist[0][0])*m1+(B.waist[2][0]-B.waist[1][0])*m2,wr=B.waist[0][1]+(B.waist[1][1]-B.waist[0][1])*m1+(B.waist[2][1]-B.waist[1][1])*m2;
  const lineP=eOut((t-t0-1.0)/0.8)*(1-ease((t-tLine)/0.5))*out;const X0=cx-Wd/2+(wl-14)*k+sw.x,X1=cx-Wd/2+(wr+14)*k+sw.x,Y=top+B.row*k+sw.y;
  const ghost=cx-Wd/2+(B.waist[0][1]+14)*k+sw.x;
  const ph=t<tA?0:t<tB?1:2;const at=[t0,tA,tB][ph];const tp=eOut((t-at-0.25)/0.6)*(1-ease((t-(ph<2?[tA,tB][ph]:tLine)+0.3)/0.3))*out;
  return <>{[0,1,2].map(fig)}
    <svg style={{position:'absolute',left:0,top:0,overflow:'visible',zIndex:9,opacity:lineP}} width={1920} height={1080}>
      {m1>0.02?<line x1={X1} y1={Y} x2={ghost} y2={Y} stroke={INK} strokeOpacity={0.25*Math.min(1,m1*3)} strokeWidth={3} strokeDasharray="6 8"/>:null}
      <line x1={X0} y1={Y} x2={X0+(X1-X0)*clamp(lineP*1.2)} y2={Y} stroke={EM} strokeWidth={6} strokeLinecap="round"/>
      <circle cx={X0} cy={Y} r={7} fill={EM}/><circle cx={X1} cy={Y} r={7} fill={EM}/>
    </svg>
    <div style={{position:'absolute',left:1230,top:430,zIndex:9,opacity:tp,transform:`translateY(${(1-tp)*18}px)`,fontFamily:'Jost',filter:'url(#rough)'}}>
      <div style={{fontSize:38,fontWeight:600,letterSpacing:8,color:EM}}>{labels[ph]}</div>
      {caps.filter(c=>t>=c[1]-0.1&&t<c[2]+0.4).slice(-1).map(c=>{const q=eOut((t-c[1])/0.45)*(1-ease((t-c[2])/0.35));return <div key={c[0]} style={{marginTop:18,fontSize:56,fontWeight:600,color:INK,opacity:q,whiteSpace:'nowrap'}}>{c[0]}</div>;})}
    </div>
    {[0,1,2].map(i=>{const q=eOut((t-tLine-0.6-0.2*i)/0.6)*out;if(q<=0)return null;return <div key={'l'+i} style={{position:'absolute',left:slotX[i],top:1035,transform:'translate(-50%,-50%)',zIndex:9,opacity:q*(i===2?1:0.55),fontFamily:'Jost',fontWeight:600,fontSize:34,letterSpacing:6,color:i===2?EM:GREY,filter:'url(#rough)'}}>{labels[i]}</div>;})}
  </>;};

// ---- v9 WEEK GRID (replaces the torn notebook page): 14 days as dots; week 1 fills, week 2 stops after 3 days -> the quit point
export const WeekGrid:React.FC<{x:number;y:number;t0:number;t1:number;stopAt:number}>=({x,y,t0,t1,stopAt})=>{
  const t=useT();if(t<t0-0.01||t>t1+0.6)return null;const o=eOut((t-t0)/0.6)*(1-ease((t-t1)/0.45)),f=float(t,71,0.6);
  const R=26,G=86,days=[...Array(14).keys()];const fillT=(d:number)=>t0+0.35+d*0.11;const quit=9;
  return <div style={{position:'absolute',left:x+f.x,top:y+f.y,transform:'translate(-50%,-50%)',zIndex:6,opacity:o,filter:'url(#rough)'}}>
    <svg width={7*G+190} height={2*G+40} style={{overflow:'visible'}}>
      {['WEEK 1','WEEK 2'].map((w,r)=><text key={w} x={0} y={r*G+R+30} fontFamily="Jost" fontWeight={600} fontSize={30} letterSpacing={4} fill={r===1?EM:GREY}>{w}</text>)}
      {days.map(d=>{const r=Math.floor(d/7),c=d%7,cx=190+c*G+R,cy=r*G+R+20;const on=d<=quit?eOut((t-fillT(d))/0.3):0;
        const dimA=d>quit?1-0.6*ease((t-stopAt)/0.6):1;
        return <g key={d} opacity={dimA}><circle cx={cx} cy={cy} r={R} fill="none" stroke={INK} strokeOpacity={0.3} strokeWidth={3}/>
          <circle cx={cx} cy={cy} r={R*on} fill={d===quit?EM:INK} fillOpacity={d===quit?1:0.85}/></g>;})}
      {(()=>{const p=eOut((t-stopAt)/0.6);const cx=190+(quit%7)*G+R,cy=G+R+20;return <circle cx={cx} cy={cy} r={R+14} fill="none" stroke={EM} strokeWidth={4} strokeDasharray={`${p*2*Math.PI*(R+14)} 999`} transform={`rotate(-90 ${cx} ${cy})`}/>;})()}
    </svg></div>;};
