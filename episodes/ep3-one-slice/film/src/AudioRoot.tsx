import React from 'react';
import {AbsoluteFill, Audio, Composition, staticFile} from 'remotion';
import {FilmS} from './FilmS';
import {TOTAL} from './tl';

// The master already contains the 1-second voice pre-roll (AT in tl.ts). Do not add it again.
export const FilmSWithAudio = () => (
  <AbsoluteFill>
    <FilmS />
    <Audio src={staticFile('audio/master-ep3.wav')} />
  </AbsoluteFill>
);

export const AudioRoot = () => (
  <Composition id="Ep3Audio" component={FilmSWithAudio}
    durationInFrames={Math.ceil(TOTAL * 30)} fps={30} width={1920} height={1080} />
);
