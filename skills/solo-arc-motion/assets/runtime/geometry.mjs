export const clamp=x=>Math.max(0,Math.min(1,x));
export const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
export const arrive=(time,duration=1.55)=>{const q=clamp(time/duration)-1;return 1+1.18*q*q*q+.18*q*q;};
export const active=(t,s)=>t>=s.a&&t<s.b;
export const alpha=(t,a,b,fadeIn=.60,fadeOut=.62)=>smooth((t-a)/fadeIn)*smooth((b-t)/fadeOut);
export const bob=(t,a,entry=1.55)=>3.8*Math.sin(Math.max(0,t-a-entry)*2*Math.PI/7.5)*smooth((t-a-entry)/.9);
export function graphicDy(s,t){
 const corner=s.type==='badge'&&s.size===135;
 const rise=s.rise??(corner?0:['heading','symbol','connector'].includes(s.type)?12:s.type==='plan'?0:400);
 const entry=s.entryDuration??Math.min(1.5,Math.max(.75,(s.b-s.a)*.4));
 return rise*(1-arrive(t-s.a,entry))+(corner||s.idleMotion===false?0:bob(t,s.a,entry));
}
export function geometry(s,t,m){
 const w=s.w,h=w*m.height/m.width,entry=s.entryDuration??1.55;
 const dy=(s.rise??480)*(1-arrive(t-s.a,entry))+(s.idleMotion===false?0:bob(t,s.a,entry));
 const left=s.x-w/2+(s.slideX??0)*(1-arrive(t-s.a,entry)),top=s.y+dy;
 return {w,h,left,top,point:([u,v])=>[left+u*w,top+v*h]};
}
