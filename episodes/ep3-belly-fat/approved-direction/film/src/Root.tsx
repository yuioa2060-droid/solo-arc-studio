import React from 'react';
import {Composition,AbsoluteFill,Audio,staticFile} from 'remotion';
import {Redo} from './Redo';
const WithAudio:React.FC=()=> <AbsoluteFill><Redo/><Audio src={staticFile('audio/preview-master.wav')}/></AbsoluteFill>;
export const Root:React.FC=()=> <><Composition id="EP3-REDO-TEST" component={Redo} durationInFrames={1809} fps={30} width={1920} height={1080}/><Composition id="EP3-REDO-TEST-AUDIO" component={WithAudio} durationInFrames={1809} fps={30} width={1920} height={1080}/></>;
