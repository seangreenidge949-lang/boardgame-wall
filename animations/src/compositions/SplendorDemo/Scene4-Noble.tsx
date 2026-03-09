import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { theme } from '../../styles/theme';
import { DevelopmentCard } from '../../components/DevelopmentCard';
import { NobleCard } from '../../components/NobleCard';
import { AnimatedText } from '../../components/AnimatedText';
import type { GemColor } from '../../styles/theme';

// Scene 4: Noble Visit + Victory (45 frames = 3 seconds @ 15fps)
// Local frame 0-44 (global 135-179)
export const Scene4Noble: React.FC = () => {
  const frame = useCurrentFrame(); // 0-44

  // Fade out at end for GIF loop
  const fadeOut = interpolate(frame, [38, 44], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const playerCardColors: GemColor[] = ['red', 'red', 'red', 'red', 'green', 'green', 'green', 'green'];

  return (
    <div
      style={{
        width: 640,
        height: 360,
        background: theme.bgPrimary,
        position: 'relative',
        overflow: 'hidden',
        opacity: fadeOut,
      }}
    >
      <AnimatedText
        text="贵族到访 + 胜利"
        startFrame={0}
        fontSize={18}
        bold
        color={theme.accentPurple}
        x={240}
        y={15}
      />

      {/* Player's collected cards */}
      <AnimatedText
        text="已收集的折扣卡"
        startFrame={2}
        fontSize={10}
        color={theme.textSecondary}
        x={60}
        y={50}
      />
      {playerCardColors.map((color, i) => (
        <DevelopmentCard
          key={`pc-${i}`}
          level={1}
          bonusColor={color}
          points={i >= 6 ? 1 : 0}
          width={36}
          x={60 + (i % 4) * 44}
          y={65 + Math.floor(i / 4) * 56}
          enterFrame={2 + i}
        />
      ))}

      {/* Noble card */}
      <NobleCard
        requirements={[
          { color: 'red', amount: 4 },
          { color: 'green', amount: 4 },
        ]}
        size={60}
        x={400}
        y={60}
        enterFrame={2}
        glowFrame={13}
      />

      <AnimatedText
        text="集齐 4红 + 4绿 折扣"
        startFrame={5}
        fontSize={12}
        color={theme.textSecondary}
        x={370}
        y={130}
      />

      {/* Noble acquired arrow */}
      {frame >= 13 && (
        <div
          style={{
            position: 'absolute',
            left: 340,
            top: 100,
            fontSize: 24,
            color: theme.accentGold,
            opacity: interpolate(frame, [13, 17], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            transform: `translateX(${interpolate(frame, [13, 20], [30, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })}px)`,
          }}
        >
          ← +3分
        </div>
      )}

      {/* Score counter */}
      {frame >= 17 && (
        <div
          style={{
            position: 'absolute',
            left: 280,
            top: 200,
            textAlign: 'center',
            opacity: interpolate(frame, [17, 21], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          <div style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 4 }}>
            当前分数
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: theme.accentGold,
              textShadow: `0 0 20px ${theme.accentGold}66`,
            }}
          >
            {frame >= 21
              ? Math.min(15, Math.round(interpolate(frame, [21, 29], [12, 15], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                })))
              : 12}
          </div>
        </div>
      )}

      {/* Victory */}
      {frame >= 29 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 280,
            textAlign: 'center',
            opacity: interpolate(frame, [29, 33], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            transform: `scale(${interpolate(frame, [29, 33, 37], [0.8, 1.1, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })})`,
          }}
        >
          <span
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: theme.accentGold,
              textShadow: `0 0 30px ${theme.accentGold}88`,
              fontFamily: '"Noto Sans SC", "PingFang SC", sans-serif',
            }}
          >
            达到 15 分，胜利！
          </span>
        </div>
      )}

      <AnimatedText
        text="率先达到 15 分触发终局"
        startFrame={20}
        fontSize={11}
        color={theme.textSecondary}
        x={250}
        y={330}
      />
    </div>
  );
};
