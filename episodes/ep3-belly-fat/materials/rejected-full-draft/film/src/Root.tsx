import React from 'react';import {Composition} from 'remotion';import {Episode3} from './Episode3';import plan from './timeline.json';
export const Root:React.FC=()=> <Composition id="EP3" component={Episode3} durationInFrames={Math.ceil(plan.duration*30)} fps={30} width={1920} height={1080}/>;
