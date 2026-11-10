import React from 'react';
import {Composition} from 'remotion';
import {Film} from './Film';
import {Airbnb, AIRBNB_FRAMES} from './Airbnb';
import {FPS} from './story';

export const Root: React.FC = () => (
  <>
    <Composition id="Video" component={Film} width={720} height={1280} fps={FPS} durationInFrames={1500} />
    <Composition id="Airbnb" component={Airbnb} width={720} height={1280} fps={FPS} durationInFrames={AIRBNB_FRAMES} />
  </>
);
