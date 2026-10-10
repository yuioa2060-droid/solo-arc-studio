import React from 'react';import {Composition} from 'remotion';import {Film6} from './Film6';import {TOTAL} from './tl6';
export const Root=()=> <Composition id="Ep6" component={Film6} durationInFrames={Math.ceil(TOTAL*30)} fps={30} width={1920} height={1080}/>;
