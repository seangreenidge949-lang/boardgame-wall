import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { theme } from '../../styles/theme';
import { GemToken } from '../../components/GemToken';
import { AnimatedText } from '../../components/AnimatedText';
import type { GemColor } from '../../styles/theme';

// Scene 2: Collect Gems (45 frames = 3 seconds @ 15fps)
// Local frame 0-44 (global 30-74)
export const Scene2CollectGems: React.FC = () => {
  const frame = useCurrentFrame(); // 0-44

  const gemColors: GemColor[] = ['white', 'blue', 'green', 'red', 'black'];
  const poolX = 280;
  const poolY = 80;
  const playerAreaY = 260;
  const playerAreaX = 240;

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
      {/* Section label */}
      <AnimatedText
        text="行动一：拿取宝石"
        startFrame={0}
        fontSize={18}
        bold
        color={theme.accentPurple}
        x={240}
        y={15}
      />

      <AnimatedText
        text="公共宝石池"
        startFrame={2}
        fontSize={11}
        color={theme.textSecondary}
        x={290}
        y={55}
      />

      {/* Gem pool */}
      {gemColors.map((color, i) => (
        <React.Fragment key={color}>
          {[0, 1, 2].map((j) => (
            <GemToken
              key={`pool-${color}-${j}`}
              color={color}
              size={24}
              x={poolX + i * 34 - 60}
              y={poolY + j * 28}
              enterFrame={2 + i}
            />
          ))}
        </React.Fragment>
      ))}

      {/* Take 3 different text */}
      <AnimatedText
        text="选 3 枚不同色"
        startFrame={8}
        fontSize={14}
        color={theme.textPrimary}
        x={50}
        y={105}
        exitFrame={26}
      />

      {/* 3 gems flying to player */}
      <GemToken
        color="blue"
        size={28}
        x={poolX - 26}
        y={poolY}
        enterFrame={2}
        animateToX={playerAreaX}
        animateToY={playerAreaY}
        moveStartFrame={10}
        moveDuration={8}
      />
      <GemToken
        color="green"
        size={28}
        x={poolX + 8}
        y={poolY}
        enterFrame={3}
        animateToX={playerAreaX + 36}
        animateToY={playerAreaY}
        moveStartFrame={11}
        moveDuration={8}
      />
      <GemToken
        color="red"
        size={28}
        x={poolX + 42}
        y={poolY}
        enterFrame={4}
        animateToX={playerAreaX + 72}
        animateToY={playerAreaY}
        moveStartFrame={12}
        moveDuration={8}
      />

      {/* Player area */}
      <AnimatedText
        text="我的宝石"
        startFrame={12}
        fontSize={11}
        color={theme.textSecondary}
        x={265}
        y={240}
      />

      {/* Player area border */}
      <div
        style={{
          position: 'absolute',
          left: playerAreaX - 10,
          top: playerAreaY - 10,
          width: 210,
          height: 50,
          borderRadius: 8,
          border: `1px dashed ${theme.textSecondary}44`,
          opacity: interpolate(frame, [10, 15], [0, 0.5], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      />

      {/* OR take 2 same */}
      <AnimatedText
        text="或 拿 2 枚同色（该色 ≥ 4 枚时）"
        startFrame={25}
        fontSize={14}
        color={theme.textPrimary}
        x={170}
        y={310}
      />

      <GemToken
        color="white"
        size={28}
        x={poolX - 60}
        y={poolY}
        enterFrame={2}
        animateToX={playerAreaX + 120}
        animateToY={playerAreaY}
        moveStartFrame={28}
        moveDuration={8}
      />
      <GemToken
        color="white"
        size={28}
        x={poolX - 60}
        y={poolY + 28}
        enterFrame={2}
        animateToX={playerAreaX + 156}
        animateToY={playerAreaY}
        moveStartFrame={30}
        moveDuration={8}
      />
    </div>
  );
};
