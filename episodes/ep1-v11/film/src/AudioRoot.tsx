import React from 'react';
import {AbsoluteFill, Audio, Composition, staticFile} from 'remotion';
import {Film6} from './Film6';
import {TOTAL} from './tl6';

// This master already includes EP1's 1-second voice offset. Do not add it again.
export const Film6WithAudio = () => (
  <AbsoluteFill>
    <Film6 />
    <Audio src={staticFile('audio/master-v11.wav')} />
  </AbsoluteFill>
);

export const AudioRoot = () => (
  <Composition id="Ep6Audio" component={Film6WithAudio}
    durationInFrames={Math.ceil(TOTAL * 30)} fps={30} width={1920} height={1080} />
);
