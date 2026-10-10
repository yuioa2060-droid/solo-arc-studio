import React from 'react';import {Img,staticFile,useCurrentFrame,continueRender,delayRender} from 'remotion';
export const useT=()=>useCurrentFrame()/30;
export const clamp=(x:number)=>Math.max(0,Math.min(1,x));
export const ease=(x:number)=>{x=clamp(x);return x*x*(3-2*x);};
export const eOut=(x:number)=>{x=clamp(x);return 1-Math.pow(1-x,3);};
export const EM='#0B8371',INK='#F2F0EA',GREY='#77756f';
export const useFonts=()=>{const [hd]=React.useState(()=>delayRender('font'));React.useEffect(()=>{const f=new FontFace('Jost',`url(${staticFile('fonts/Jost.ttf')})`,{weight:'100 900'});f.load().then(x=>{(document as any).fonts.add(x);continueRender(hd);});},[]);};
export const float=(t:number,s:number,amp=1)=>({x:amp*4*Math.sin(t*0.71+s*1.7),y:amp*5*Math.sin(t*0.53+s*2.3),r:amp*0.45*Math.sin(t*0.37+s),k:1+amp*0.007*Math.sin(t*0.45+s*0.9)});
type Enter='up'|'left'|'right'|'focus'|'pop'|'slowup'|'fade'|'swap'|'drop';
// hero 'swim': slow smooth drift side-to-side + up/down + tiny tilt (only for character images h-*)
export const swim=(t:number,s:number)=>{const P=Math.PI*2;return {x:15*Math.sin(P*t/7.3+s)+5*Math.sin(P*t/3.1+s*2.1),y:11*Math.sin(P*t/5.2+s*1.3),r:0.75*Math.sin(P*t/8.6+s*0.7),k:1+0.006*Math.sin(P*t/6.4+s)};};
// back: DepthStack (shrink + blur + dim + drift); dimAt: FocusLift backdrop [t, level, tBack?]
export type ItemP={src:string;x:number;y:number;h:number;t0:number;t1:number;enter?:Enter;seed?:number;dur?:number;back?:{t:number;x?:number;y?:number;k?:number};dimAt?:[number,number,number?];pulseAt?:number[];moveTo?:{t:number;x:number;y:number;h:number;d?:number};z?:number;round?:boolean;blurUntil?:number;freeze?:[number,number];outD?:number;exit?:'left'|'right';vignette?:boolean};
export const Item:React.FC<ItemP>=({src,x,y,h,t0,t1,enter='up',seed=1,dur,back,dimAt,pulseAt=[],moveTo,z=1,round,blurUntil,freeze,outD,exit,vignette})=>{
  const t=useT();if(t<t0-0.01||t>t1+(outD??0.45)+0.1)return null;
  const D=dur??({up:0.9,left:0.8,right:0.8,focus:1.3,pop:0.45,slowup:1.6,fade:0.5,swap:0.6,drop:0.9}[enter]);
  const p=eOut((t-t0)/D),q=ease((t-t1)/(outD??0.45));
  let dx=0,dy=0,sc=1,op=clamp((t-t0)/(D*0.55))*(1-(exit?0:q)),bright=1,blur=0,rot=0;
  if(enter==='swap'){dx=(1-p)*760;rot=(1-p)*9;op=clamp((t-t0)/(D*0.3))*(1-(exit?0:q));}
  if(enter==='drop'){const u=clamp((t-t0)/1.4);dy=-(1-p)*240;rot=-7*(1-p)+3.2*Math.sin(u*Math.PI*3)*(1-u);}
  if(exit){const e=(t-t1)/(outD??0.45);const m=e>0?Math.pow(clamp(e),2):0;dx+=(exit==='left'?-1:1)*m*820;rot+=(exit==='left'?-1:1)*m*-8;op*=1-clamp(e*1.3-0.3);}
  if(enter==='up'||enter==='slowup')dy=(1-p)*(enter==='slowup'?380:260);
  if(enter==='left')dx=-(1-p)*340;if(enter==='right')dx=(1-p)*340;
  if(enter==='pop')sc=0.84+0.16*p;
  if(enter==='focus'){dy=(1-p)*140;bright=0.15+0.85*ease((t-t0-0.25)/(D-0.25));blur=(1-p)*7;sc=1.04-0.04*p;}
  if(outD===undefined&&!exit)dy+=q*36;
  let X=x,Y=y,H=h;
  if(moveTo){const m=ease((t-moveTo.t)/(moveTo.d??0.8));X+= (moveTo.x-x)*m;Y+=(moveTo.y-y)*m;H+=(moveTo.h-h)*m;}
  if(back){const m=ease((t-back.t)/0.7);X+=((back.x??x)-x)*m;Y+=((back.y??y)-y)*m;sc*=1-(1-(back.k??0.8))*m;blur+=6*m;bright*=1-0.62*m;}
  if(dimAt){const [td,lv,tb]=dimAt;let m=ease((t-td)/0.5);if(tb!==undefined)m*=1-ease((t-tb)/0.6);bright*=1-(1-lv)*m;}
  if(blurUntil!==undefined){blur+=8*(1-ease((t-blurUntil)/0.5));}
  for(const pa of pulseAt){const u=(t-pa)/0.6;if(u>0&&u<1)sc*=1+0.07*Math.sin(Math.PI*u);}
  const tf=freeze&&t>=freeze[0]&&t<freeze[1]?freeze[0]:t;const f=src.startsWith('h-')?swim(tf,seed):float(tf,seed);
  return <div style={{position:'absolute',left:X+dx+f.x,top:Y+dy+f.y,height:H,zIndex:z,transform:`translate(-50%,-50%) rotate(${f.r+rot}deg) scale(${sc*f.k})`,opacity:op,filter:`brightness(${bright}) blur(${blur}px)`}}>
    <Img src={staticFile('img/'+src+'.png')} style={{height:H,display:'block',borderRadius:round?'50%':undefined,WebkitMaskImage:vignette?'radial-gradient(ellipse 54% 56% at 50% 50%, black 30%, rgba(0,0,0,.55) 62%, transparent 92%)':undefined}}/></div>;
};
// circular preview (teaser) with emerald ring
export const Disc:React.FC<{src:string;x:number;y:number;s:number;t0:number;t1:number;sharpAt:number;grow?:number;seed?:number;pulseAt?:number[]}>=({src,x,y,s,t0,t1,sharpAt,grow=1.12,seed=2,pulseAt=[]})=>{
  const t=useT();if(t<t0||t>t1+0.5)return null;const p=eOut((t-t0)/0.5),q=ease((t-t1)/0.4),m=ease((t-sharpAt)/0.5),f=float(t,seed);
  let sc=(0.55+0.45*p)*(1+(grow-1)*m);for(const pa of pulseAt){const u=(t-pa)/0.55;if(u>0&&u<1)sc*=1+0.08*Math.sin(Math.PI*u);}
  return <div style={{position:'absolute',left:x+f.x,top:y+f.y-(1-p)*40,width:s,height:s,transform:`translate(-50%,-50%) scale(${sc})`,opacity:p*(1-q),borderRadius:'50%',overflow:'hidden',background:'#0d0d0d',boxShadow:`0 0 0 ${6}px ${EM}, 0 0 40px rgba(11,131,113,${0.25*m})`,filter:`blur(${7*(1-m)}px) brightness(${0.55+0.45*m})`}}>
    <Img src={staticFile('img/'+src+'.png')} style={{width:'100%',height:'100%',objectFit:'cover',transform:'scale(1.05)'}}/></div>;
};
// phrase: white by default; em = slightly bigger/bolder; accent = rare grey+big style
export type Wt={w:string;at:number;em?:boolean;big?:boolean};
export const Phrase:React.FC<{words:Wt[];x?:number;y:number;t1:number;size?:number;accent?:boolean;seed?:number;z?:number}>=({words,x=960,y,t1,size=66,accent,seed=3,z=5})=>{
  const t=useT();if(t<words[0].at-0.1||t>t1+0.3)return null;const q=ease((t-t1)/0.25),f=float(t,seed,0.5);
  return <div style={{position:'absolute',left:x+f.x,top:y+f.y,zIndex:z,transform:'translate(-50%,-50%)',display:'flex',alignItems:'baseline',gap:size*0.28,whiteSpace:'nowrap',fontFamily:'Jost',fontWeight:500,opacity:1-q,filter:'url(#rough)',textShadow:'0 2px 18px rgba(0,0,0,.9)'}}>
    {words.map((w,i)=>{const p=eOut((t-w.at+0.04)/0.32);const big=accent&&w.big;const fs=big?size*2.3:w.em?size*1.32:size;
      return <span key={i} style={{fontSize:fs,color:accent&&!w.big?GREY:INK,fontWeight:big||w.em?600:500,opacity:p,transform:`translateY(${(1-p)*16}px)`,display:'inline-block'}}>{w.w}</span>;})}</div>;
};
// value that changes in place (counter)
export const Counter:React.FC<{x:number;y:number;size:number;steps:[number,string][];t1:number;seed?:number}>=({x,y,size,steps,t1,seed=4})=>{
  const t=useT();if(t<steps[0][0]-0.05||t>t1+0.5)return null;let k=0;for(let i=0;i<steps.length;i++)if(t>=steps[i][0])k=i;
  const u=(t-steps[k][0])/0.35,pop=u>0&&u<1?1+0.12*Math.sin(Math.PI*u):1,q=ease((t-t1)/0.4),f=float(t,seed,0.5),p=eOut((t-steps[0][0])/0.3);
  return <div style={{position:'absolute',left:x+f.x,top:y+f.y,transform:`translate(-50%,-50%) scale(${pop})`,fontFamily:'Jost',fontWeight:600,fontSize:size,color:INK,opacity:p*(1-q),filter:'url(#rough)',whiteSpace:'nowrap'}}>{steps[k][1]}</div>;
};
export const Sticker:React.FC<{n:string;x:number;y:number;s:number;t0:number;t1:number;seed?:number}>=({n,x,y,s,t0,t1,seed=5})=>{
  const t=useT();if(t<t0||t>t1+0.5)return null;const p=eOut((t-t0)/0.45),q=ease((t-t1)/0.4),f=float(t,seed,0.8);
  return <div style={{position:'absolute',left:x+f.x,top:y+f.y,width:s,height:s,zIndex:6,transform:`translate(-50%,-50%) rotate(${-6+f.r*3}deg) scale(${0.7+0.3*p})`,opacity:p*(1-q)}}>
    <Img src={staticFile('img/k5-sticker.png')} style={{width:s,height:s,position:'absolute'}}/>
    <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Jost',fontWeight:700,fontSize:s*0.5,color:'#121212'}}>{n}</div></div>;
};
// progressive hand-drawn stroke (white by default; red only for 'wrong') (any svg path in a box)
export const Stroke:React.FC<{d:string;x:number;y:number;w:number;h:number;t0:number;t1:number;len?:number;sw?:number;dur?:number;c?:string;outD?:number}>=({d,x,y,w,h,t0,t1,len=900,sw=12,dur=0.55,c=INK,outD=0.4})=>{
  const t=useT();if(t<t0||t>t1+0.5)return null;const p=eOut((t-t0)/dur),q=ease((t-t1)/outD);
  return <svg style={{position:'absolute',left:x-w/2,top:y-h/2,opacity:1-q,zIndex:7,filter:'url(#rough)',overflow:'visible'}} width={w} height={h} viewBox={`0 0 ${w} ${h}`}><path d={d} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len*(1-p)}/></svg>;
};
export const Defs=()=> <svg width={0} height={0} style={{position:'absolute'}}><filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={4}/><feDisplacementMap in="SourceGraphic" scale={3}/></filter></svg>;
// background film: minimal for now (user will send a noise reference)
export const Film:React.FC=()=>{const fr=useCurrentFrame();const n=Math.floor(fr/4)%8;
  const specks=[];for(let k=0;k<2;k++){const r=Math.sin((Math.floor(fr/4)*13+k*71)*12.9898)*43758.5453;const u=r-Math.floor(r);if(u<0.18){const r2=Math.sin((Math.floor(fr/4)*7+k*31)*78.233)*12345.678;const v=r2-Math.floor(r2);specks.push(<div key={k} style={{position:'absolute',left:(u*5.3%1)*1920,top:v*1080,width:2+v*2,height:2+(u*3%1)*(k===0?10:2),background:'rgba(235,235,230,.25)',borderRadius:3,transform:`rotate(${v*180}deg)`}}/>);}}
  return <><div style={{position:'absolute',inset:0,zIndex:20,pointerEvents:'none',backgroundImage:`url(${staticFile('noise/'+n+'.png')})`,backgroundSize:'1920px 1080px',opacity:0.16,WebkitMaskImage:'radial-gradient(ellipse 70% 65% at 50% 50%, transparent 50%, black 100%)'}}/>{specks}</>;};
