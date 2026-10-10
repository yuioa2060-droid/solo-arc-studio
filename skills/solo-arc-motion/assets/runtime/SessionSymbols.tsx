import React from 'react';
// Original vector objects reconstructed from their functions, never source art.
export function ClockNumbers(){return <>{Array.from({length:12},(_,i)=>{const n=i+1,a=n/12*Math.PI*2;return <text key={n} x={215+65*Math.sin(a)} y={147-65*Math.cos(a)+5} textAnchor="middle" fontFamily="ReferenceHand" fontSize="17" fill="#222">{n}</text>;})}</>;}
export function FrequencyCycle({size=250,t=0}:any){
 const point=(deg:number,r:number)=>[150+r*Math.cos(deg*Math.PI/180),150+r*Math.sin(deg*Math.PI/180)].join(' ');
 const shape=`M${point(-112,110)}A110 110 0 0 1 ${point(-14,110)}L${point(13,116)}L${point(-8,48)}L${point(-19,70)}A70 70 0 0 0 ${point(-112,70)}Z`;
 return <svg width={size} height={size} viewBox="0 0 300 300" style={{transform:`rotate(${t*3.2}deg)`}}>
  <defs><pattern id="frequency-light-hatching" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 6L6 0" stroke="#777" strokeWidth=".8" opacity=".45"/></pattern></defs>
  {[0,120,240].map(r=><g key={r} transform={`rotate(${r} 150 150)`}><path d={shape} fill="#DDD" stroke="#333" strokeWidth="2.4"/><path d={shape} fill="url(#frequency-light-hatching)"/><path d={`M${point(-108,104)}A104 104 0 0 1 ${point(-17,104)}`} fill="none" stroke="#777" strokeWidth="1"/></g>)}
 </svg>;
}
