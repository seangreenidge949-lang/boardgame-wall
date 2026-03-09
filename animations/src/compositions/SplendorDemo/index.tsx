import React from 'react';
import { useCurrentFrame, Sequence } from 'remotion';
import { Scene1Intro } from './Scene1-Intro';
import { Scene2CollectGems } from './Scene2-CollectGems';
import { Scene3BuyCard } from './Scene3-BuyCard';
import { Scene4Noble } from './Scene4-Noble';
import { theme } from '../../styles/theme';

// Main composition: 12 seconds @ 15fps = 180 frames
// Scene 1: 0-29   (2s)  - Intro
// Scene 2: 30-74  (3s)  - Collect Gems
// Scene 3: 75-134 (4s)  - Buy Card + Discount
// Scene 4: 135-179 (3s) - Noble + Victory
export const SplendorDemo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        width: 640,
        height: 360,
        background: theme.bgPrimary,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Sequence from={0} durationInFrames={30}>
        <Scene1Intro />
      </Sequence>
      <Sequence from={30} durationInFrames={45}>
        <Scene2CollectGems />
      </Sequence>
      <Sequence from={75} durationInFrames={60}>
        <Scene3BuyCard />
      </Sequence>
      <Sequence from={135} durationInFrames={45}>
        <Scene4Noble />
      </Sequence>
    </div>
  );
};
