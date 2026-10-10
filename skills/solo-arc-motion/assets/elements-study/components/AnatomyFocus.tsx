import React from 'react';
import {Img,staticFile} from 'remotion';
import {ease,settle,envelope} from './motion';
import {progressivePath} from '../progressive-path.mjs';
export type MuscleRegion={id:string;label:string;color:string;path:string;anchor:[number,number];labelPoint:[number,number];at:number};
export function AnatomyFocus({t,src,width,height,x,y,w,regions,selectAt=5.4,selected='side',end=10}:any){const p=settle(t,1),top=y+100*(1-p),left=x-w/2,h=w*height/width;const select=ease((t-selectAt)/.55);return <div data-anatomy="one-base-image" style={{position:'absolute',left,top,width:w,height:h,opacity:envelope(t,0,end,.6,.6)}}>
 <Img src={staticFile(src)} style={{position:'absolute',inset:0,width:'100%',height:'100%'}}/>
 <svg viewBox={`0 0 ${width} ${height}`} style={{position:'absolute',inset:0,width:'100%',height:'100%',overflow:'visible'}}>
 {regions.map((r:MuscleRegion)=>{const shown=ease((t-r.at)/.4)*(r.id===selected?1:1-select),line=ease((t-r.at-.14)/.82),text=ease((t-r.at-.55)/.35);return <g key={r.id} data-muscle={r.id} data-opacity={shown.toFixed(4)} opacity={shown}>
  <path data-mask={r.id} d={r.path} fill={r.color} fillOpacity=".68" style={{mixBlendMode:'multiply'}}/>
  <path d={progressivePath([r.anchor,r.labelPoint],line)} fill="none" stroke="#000" strokeWidth={9*width/w} strokeDasharray={`${13*width/w} ${12*width/w}`}/>
  <path data-leader={r.id} data-anchor={r.anchor.join(',')} d={progressivePath([r.anchor,r.labelPoint],line)} fill="none" stroke="#EEE" strokeWidth={4*width/w} strokeDasharray={`${13*width/w} ${12*width/w}`}/>
  <text data-annotation={r.label} x={r.labelPoint[0]} y={r.labelPoint[1]-22*width/w} textAnchor={r.labelPoint[0]<r.anchor[0]?'end':'start'} fill="#EEE" fontFamily="ReferenceHand" fontSize={43*width/w} opacity={text}>{r.label}</text>
 </g>;})}
 </svg></div>;}
