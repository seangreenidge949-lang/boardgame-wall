import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { gemColorMap, type GemColor } from '../styles/theme';

interface GemTokenProps {
  color: GemColor;
  size?: number;
  x?: number;
  y?: number;
  enterFrame?: number;
  exitFrame?: number;
  animateToX?: number;
  animateToY?: number;
  moveStartFrame?: number;
  moveDuration?: number;
}

export const GemToken: React.FC<GemTokenProps> = ({
  color,
  size = 32,
  x = 0,
  y = 0,
  enterFrame = 0,
  exitFrame,
  animateToX,
  animateToY,
  moveStartFrame,
  moveDuration = 10,
}) => {
  const frame = useCurrentFrame();
  const hex = gemColorMap[color];

  // Fade in
  const opacity = interpolate(frame, [enterFrame, enterFrame + 5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Fade out
  const fadeOut = exitFrame
    ? interpolate(frame, [exitFrame - 5, exitFrame], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  // Movement animation
  let currentX = x;
  let currentY = y;
  if (animateToX !== undefined && animateToY !== undefined && moveStartFrame !== undefined) {
    currentX = interpolate(
      frame,
      [moveStartFrame, moveStartFrame + moveDuration],
      [x, animateToX],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    currentY = interpolate(
      frame,
      [moveStartFrame, moveStartFrame + moveDuration],
      [y, animateToY],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
  }

  // Scale bounce on enter
  const scale = interpolate(frame, [enterFrame, enterFrame + 3, enterFrame + 6], [0.5, 1.1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: currentX,
        top: currentY,
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, ${hex}dd, ${hex}88, ${hex}44)`,
        boxShadow: `0 2px 8px ${hex}44, inset 0 -2px 4px ${hex}22`,
        border: `1.5px solid ${hex}66`,
        opacity: opacity * fadeOut,
        transform: `scale(${scale})`,
      }}
    />
  );
};
