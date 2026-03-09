import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { theme, gemColorMap, type GemColor } from '../styles/theme';

interface CardCost {
  color: GemColor;
  amount: number;
}

interface DevelopmentCardProps {
  level: 1 | 2 | 3;
  bonusColor: GemColor;
  points?: number;
  costs?: CardCost[];
  width?: number;
  x?: number;
  y?: number;
  enterFrame?: number;
  highlight?: boolean;
  highlightFrame?: number;
}

export const DevelopmentCard: React.FC<DevelopmentCardProps> = ({
  level,
  bonusColor,
  points = 0,
  costs = [],
  width = 52,
  x = 0,
  y = 0,
  enterFrame = 0,
  highlight = false,
  highlightFrame,
}) => {
  const frame = useCurrentFrame();
  const height = Math.round(width * 1.4);
  const bonusHex = gemColorMap[bonusColor];

  const opacity = interpolate(frame, [enterFrame, enterFrame + 5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const isHighlighted =
    highlight && highlightFrame !== undefined && frame >= highlightFrame;
  const glowOpacity = isHighlighted
    ? interpolate(frame, [highlightFrame!, highlightFrame! + 5], [0, 0.6], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  const levelDot = level === 1 ? '•' : level === 2 ? '••' : '•••';

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        borderRadius: 6,
        background: theme.bgCard,
        border: `1px solid ${isHighlighted ? theme.accentGold : 'rgba(255,255,255,0.08)'}`,
        boxShadow: isHighlighted
          ? `0 0 12px ${theme.accentGold}66`
          : '0 2px 4px rgba(0,0,0,0.3)',
        opacity,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top color bar (bonus) */}
      <div
        style={{
          height: 8,
          background: `linear-gradient(90deg, ${bonusHex}cc, ${bonusHex}66)`,
        }}
      />
      {/* Points */}
      <div
        style={{
          padding: '2px 4px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {points > 0 && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 'bold',
              color: theme.textPrimary,
            }}
          >
            {points}
          </span>
        )}
        <span
          style={{
            fontSize: 6,
            color: theme.textSecondary,
            marginLeft: 'auto',
          }}
        >
          {levelDot}
        </span>
      </div>
      {/* Cost dots at bottom */}
      <div
        style={{
          marginTop: 'auto',
          padding: '3px',
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {costs.map((cost, i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: gemColorMap[cost.color],
              fontSize: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: cost.color === 'black' ? '#fff' : '#000',
              fontWeight: 'bold',
            }}
          >
            {cost.amount}
          </div>
        ))}
      </div>
      {/* Glow overlay */}
      {glowOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle, ${theme.accentGold}33, transparent)`,
            opacity: glowOpacity,
          }}
        />
      )}
    </div>
  );
};
