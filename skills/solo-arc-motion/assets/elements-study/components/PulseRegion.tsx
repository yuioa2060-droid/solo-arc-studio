import React from 'react';
import {ease,pulse} from './motion';
// Render inside the exact same SVG viewBox/wrapper as the one base image.
export function PulseRegion({t,at=.8,period=1.25,min=.03,max=.56,path,color='#ED737E',glow=0,muscleId='lats'}:any){const opacity= ease((t-at)/.35)*pulse(t,at,period,min,max);return <g data-pulse-opacity={opacity.toFixed(5)} data-region-fixed="true" style={{mixBlendMode:'multiply'}}><path data-mask={muscleId} d={path} fill={color} opacity={opacity} style={glow?{filter:`drop-shadow(0 0 ${glow*opacity}px ${color})`}:undefined}/></g>;}
