import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { theme, gemColorMap, type GemColor } from '../styles/theme';

interface NobleRequirement {
  color: GemColor;
  amount: number;
}

interface NobleCardProps {
  requirements?: NobleRequirement[];
  size?: number;
  x?: number;
  y?: number;
  enterFrame?: number;
  glowFrame?: number;
}

export const NobleCard: React.FC<NobleCardProps> = ({
  requirements = [],
  size = 52,
  x = 0,
  y = 0,
  enterFrame = 0,
  glowFrame,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [enterFrame, enterFrame + 5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const isGlowing = glowFrame !== undefined && frame >= glowFrame;
  const glowIntensity = isGlowing
    ? interpolate(frame, [glowFrame!, glowFrame! + 8], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  const scale = isGlowing
    ? interpolate(frame, [glowFrame!, glowFrame! + 4, glowFrame! + 8], [1, 1.15, 1.05], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: 8,
        background: `linear-gradient(135deg, ${theme.bgCard}, ${theme.bgCardLight})`,
        border: `1.5px solid ${isGlowing ? theme.accentGold : theme.accentGold + '44'}`,
        boxShadow: isGlowing
          ? `0 0 20px ${theme.accentGold}88, 0 0 40px ${theme.accentGold}44`
          : `0 2px 4px rgba(0,0,0,0.3)`,
        opacity,
        transform: `scale(${scale})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
      }}
    >
      <span style={{ fontSize: 16 }}>👑</span>
      <span
        style={{
          fontSize: 11,
          fontWeight: 'bold',
          color: theme.accentGold,
        }}
      >
        3
      </span>
      <div style={{ display: 'flex', gap: 2 }}>
        {requirements.map((req, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: gemColorMap[req.color],
            }}
          />
        ))}
      </div>
    </div>
  );
};
