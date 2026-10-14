import React from 'react';
import {registerRoot,Composition,AbsoluteFill,Img,staticFile,useCurrentFrame} from 'remotion';
import {Defs,useFonts,Phrase,eOut,ease} from './ep1lib';
const End=()=>{useFonts();const t=useCurrentFrame()/30;const p=eOut((t-4.15)/1.4),a=ease((t-4.15)/.95);const out=1-ease((t-14.15)/1.4);
 return <AbsoluteFill style={{background:'#060606',overflow:'hidden'}}><Defs/>
  <Img src={staticFile('progress-last.png')} style={{position:'absolute',inset:0,width:1920,height:1080,opacity:1-ease(t/.95)}} />
  <div style={{position:'absolute',inset:0,opacity:out}}>
   <Phrase words={[{w:'Next',at:1.2},{w:'time,',at:1.424},{w:'belly',at:2.547,big:true},{w:'fat.',at:2.98,big:true}]} x={960} y={530} size={46} accent t1={3.8}/>
   {t>=4.15&&<Img src={staticFile('hero-cutout.png')} style={{position:'absolute',height:1030,left:174+2*Math.sin((t-4.15)*.32),top:42+(1-p)*118+2.5*Math.sin((t-4.15)*.4),opacity:a}} />}
   <Phrase words={[{w:'Watch',at:4.92},{w:'this',at:5.152},{w:'next.',at:5.696,em:true}]} x={1425} y={157} size={44} t1={14.45} seed={5}/>
  </div>
  {t>=15.56&&<AbsoluteFill style={{background:'#000'}}/>}
 </AbsoluteFill>;};
const Root=()=> <Composition id="End4" component={End} width={1920} height={1080} fps={30} durationInFrames={468}/>;
registerRoot(Root);
