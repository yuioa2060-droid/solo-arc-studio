import React from 'react';import {Composition} from 'remotion';import {FilmS} from './FilmS';import {TOTAL} from './tl';
export const Root=()=> <Composition id="Ep3" component={FilmS} durationInFrames={Math.ceil(TOTAL*30)} fps={30} width={1920} height={1080}/>;
