import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { theme } from '../styles/theme';

interface AnimatedTextProps {
  text: string;
  startFrame: number;
  durationFrames?: number;
  fontSize?: number;
  color?: string;
  x?: number;
  y?: number;
  bold?: boolean;
  exitFrame?: number;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  startFrame,
  durationFrames = 8,
  fontSize = 16,
  color = theme.textPrimary,
  x,
  y,
  bold = false,
  exitFrame,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const translateY = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [12, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const fadeOut = exitFrame
    ? interpolate(frame, [exitFrame - 5, exitFrame], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  return (
    <div
      style={{
        position: x !== undefined ? 'absolute' : 'relative',
        left: x,
        top: y,
        fontSize,
        fontWeight: bold ? 'bold' : 'normal',
        color,
        opacity: opacity * fadeOut,
        transform: `translateY(${translateY}px)`,
        whiteSpace: 'nowrap',
        fontFamily: '"Noto Sans SC", "PingFang SC", sans-serif',
        textShadow: '0 2px 8px rgba(0,0,0,0.5)',
      }}
    >
      {text}
    </div>
  );
};
