import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { theme } from '../../styles/theme';
import { GemToken } from '../../components/GemToken';
import { DevelopmentCard } from '../../components/DevelopmentCard';
import { NobleCard } from '../../components/NobleCard';
import { AnimatedText } from '../../components/AnimatedText';
import type { GemColor } from '../../styles/theme';

// Scene 1: Intro (30 frames = 2 seconds @ 15fps)
// Shows: game table layout, title
export const Scene1Intro: React.FC = () => {
  const frame = useCurrentFrame(); // 0-29 (local to this Sequence)

  const bgOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const gemColors: GemColor[] = ['white', 'blue', 'green', 'red', 'black'];

  return (
    <div
      style={{
        width: 640,
        height: 360,
        background: theme.bgPrimary,
        opacity: bgOpacity,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Noble row at top */}
      <NobleCard
        requirements={[{ color: 'red', amount: 4 }, { color: 'green', amount: 4 }]}
        size={40}
        x={245}
        y={20}
        enterFrame={8}
      />
      <NobleCard
        requirements={[{ color: 'blue', amount: 4 }, { color: 'white', amount: 4 }]}
        size={40}
        x={295}
        y={20}
        enterFrame={10}
      />
      <NobleCard
        requirements={[{ color: 'black', amount: 3 }, { color: 'red', amount: 3 }, { color: 'white', amount: 3 }]}
        size={40}
        x={345}
        y={20}
        enterFrame={12}
      />

      {/* Level 3 cards */}
      {[0, 1, 2, 3].map((i) => (
        <DevelopmentCard
          key={`l3-${i}`}
          level={3}
          bonusColor={(['blue', 'red', 'green', 'black'] as GemColor[])[i]}
          points={4}
          costs={[{ color: 'white', amount: 3 }, { color: 'blue', amount: 3 }, { color: 'green', amount: 3 }]}
          width={44}
          x={220 + i * 54}
          y={72}
          enterFrame={5 + i}
        />
      ))}
      {/* Level 2 cards */}
      {[0, 1, 2, 3].map((i) => (
        <DevelopmentCard
          key={`l2-${i}`}
          level={2}
          bonusColor={(['green', 'white', 'black', 'red'] as GemColor[])[i]}
          points={2}
          costs={[{ color: 'red', amount: 2 }, { color: 'black', amount: 2 }]}
          width={44}
          x={220 + i * 54}
          y={140}
          enterFrame={7 + i}
        />
      ))}
      {/* Level 1 cards */}
      {[0, 1, 2, 3].map((i) => (
        <DevelopmentCard
          key={`l1-${i}`}
          level={1}
          bonusColor={(['white', 'blue', 'red', 'green'] as GemColor[])[i]}
          points={0}
          costs={[{ color: 'black', amount: 2 }, { color: 'blue', amount: 1 }]}
          width={44}
          x={220 + i * 54}
          y={208}
          enterFrame={9 + i}
        />
      ))}

      {/* Gem pool */}
      {gemColors.map((color, i) => (
        <GemToken
          key={`gem-${color}`}
          color={color}
          size={28}
          x={100 + (i % 3) * 36}
          y={100 + Math.floor(i / 3) * 36}
          enterFrame={6 + i * 2}
        />
      ))}
      <GemToken color="gold" size={28} x={136} y={172} enterFrame={16} />

      {/* Title */}
      <AnimatedText
        text="璀璨宝石 — 核心机制"
        startFrame={15}
        fontSize={22}
        bold
        color={theme.accentGold}
        x={190}
        y={290}
      />
      <AnimatedText
        text="10秒看懂怎么玩"
        startFrame={20}
        fontSize={12}
        color={theme.textSecondary}
        x={255}
        y={322}
      />
    </div>
  );
};
