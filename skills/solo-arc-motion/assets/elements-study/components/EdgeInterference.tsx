import React from 'react';
import {Img,staticFile} from 'remotion';
export function EdgeInterference({t,fps=60}:any){const phase=Math.floor(t*7)%8;const scratches=Array.from({length:7},(_,i)=>{const cycle=(t+i*1.43)%7.6,q=cycle/7.6,opacity=.07*Math.sin(Math.PI*q)**4;const x=i<4?12+i*27:1910-(i-4)*33;return <path key={i} d={`M${x} ${150+q*400} l${Math.sin(i*5.7)*6} ${220+i*9}`} stroke={i%2?'#9da59d':'#536158'} strokeWidth={i%3===0?2:1} opacity={opacity}/>;});return <div data-interference={phase} style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:30}}>
 <Img src={staticFile('noise/'+phase+'.png')} style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:.012,imageRendering:'auto'}}/>
 <div style={{position:'absolute',inset:0,maskImage:'radial-gradient(ellipse 68% 88% at 50% 47%, transparent 47%, #000 100%)'}}><Img src={staticFile('noise/'+((phase+3)%8)+'.png')} style={{width:'100%',height:'100%',opacity:.085}}/><svg width="1920" height="1080" style={{position:'absolute',inset:0}}>{scratches}</svg></div>
 </div>;}
