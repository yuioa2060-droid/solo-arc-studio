import React from 'react';
import {Img,staticFile} from 'remotion';
import {ease,settle,envelope} from './motion';
export type LiftItem={id:string;src:string;at:number;x:number;y:number;size:number;pixelated?:boolean};
export function FocusLift({t,background,items,dimAt=1.1,dimDuration=.5,darkness=.72,releaseAt=5.6,end=7,rise=105,entry=.62}:any){const dim=darkness*ease((t-dimAt)/dimDuration)*(1-ease((t-releaseAt)/.6));return <>
 <div data-layer="focus-background" style={{position:'absolute',inset:0,opacity:envelope(t,0,end,.6,.5)}}>{background}</div>
 <div data-dim={dim.toFixed(4)} style={{position:'absolute',inset:0,background:'#000',opacity:dim,pointerEvents:'none'}}/>
 {items.map((v:LiftItem)=>{const p=settle(t-v.at,entry),scale=.22+.78*p,opacity=envelope(t,v.at,releaseAt,.26,.45);return <div key={v.id} data-lift={v.id} data-progress={p.toFixed(4)} style={{position:'absolute',left:v.x-v.size/2,top:v.y-v.size/2+rise*(1-p),width:v.size,height:v.size,opacity,transform:`scale(${scale})`,borderRadius:'50%',background:'#7A299F',boxShadow:'inset 0 0 0 5px #451459',overflow:'hidden'}}><Img src={staticFile(v.src)} style={{width:'100%',height:'100%',objectFit:'contain',imageRendering:v.pixelated?'pixelated':undefined}}/></div>;})}
 </>;}

