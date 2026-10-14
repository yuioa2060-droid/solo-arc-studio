import React from 'react';import {Composition} from 'remotion';import {Film7} from './FilmH';import {TOTAL} from './tl';
export const Root=()=> <Composition id="Ep2" component={Film7} durationInFrames={Math.ceil(TOTAL*30)} fps={30} width={1920} height={1080}/>;
