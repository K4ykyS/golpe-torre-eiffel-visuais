import React from 'react';
import {Composition} from 'remotion';
import {Pilot} from './Pilot';
import {FPS, PILOT_LEN} from './story';

export const Root: React.FC = () => (
  <Composition id="Piloto" component={Pilot} width={720} height={1280} fps={FPS} durationInFrames={Math.round(PILOT_LEN * FPS)} />
);
