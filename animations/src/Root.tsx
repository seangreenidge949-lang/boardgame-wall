import React from 'react';
import { Composition } from 'remotion';
import { SplendorDemo } from './compositions/SplendorDemo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SplendorDemo"
        component={SplendorDemo}
        durationInFrames={180}
        fps={15}
        width={640}
        height={360}
      />
    </>
  );
};
