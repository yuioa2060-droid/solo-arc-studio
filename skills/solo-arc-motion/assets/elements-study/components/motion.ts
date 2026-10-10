export const clamp=(x:number)=>Math.max(0,Math.min(1,x));
export const ease=(x:number)=>{x=clamp(x);return x*x*(3-2*x);};
// One small overshoot, zero velocity at the settled hold. Deterministic in seconds.
export const settle=(t:number,d=1)=>{if(t<=0)return 0;if(t>=d)return 1;const q=t/d-1;return 1+1.65*q*q*q+.65*q*q;};
export const envelope=(t:number,start:number,end:number,fadeIn=.3,fadeOut=.45)=>ease((t-start)/fadeIn)*ease((end-t)/fadeOut);
export const pulse=(t:number,at=0,period=1.25,min=.03,max=.56)=>min+(max-min)*(1+Math.cos(2*Math.PI*(t-at)/period))/2;
export const focusState=(t:number,at:number,d=.5)=>ease((t-at)/d);

