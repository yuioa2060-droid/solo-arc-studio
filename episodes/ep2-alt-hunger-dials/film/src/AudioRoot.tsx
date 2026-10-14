import React from 'react';
import {AbsoluteFill, Audio, Composition, staticFile} from 'remotion';
import {Film7} from './FilmH';
import {TOTAL} from './tl';

// The master already contains the 1-second voice pre-roll (AT in tl.ts). Do not add it again.
export const Film7WithAudio = () => (
  <AbsoluteFill>
    <Film7 />
    <Audio src={staticFile('audio/master-ep2.wav')} />
  </AbsoluteFill>
);

export const AudioRoot = () => (
  <Composition id="Ep2Audio" component={Film7WithAudio}
    durationInFrames={Math.ceil(TOTAL * 30)} fps={30} width={1920} height={1080} />
);
