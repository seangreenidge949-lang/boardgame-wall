import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { theme, gemColorMap } from '../../styles/theme';
import { GemToken } from '../../components/GemToken';
import { DevelopmentCard } from '../../components/DevelopmentCard';
import { AnimatedText } from '../../components/AnimatedText';

// Scene 3: Buy Card + Discount (60 frames = 4 seconds @ 15fps)
// Local frame 0-59 (global 75-134)
export const Scene3BuyCard: React.FC = () => {
  const frame = useCurrentFrame(); // 0-59

  const cardAreaX = 300;
  const cardAreaY = 70;
  const playerX = 80;
  const playerY = 80;
  const playerCardX = 80;
  const playerCardY = 200;

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
      <AnimatedText
        text="行动二：购买卡牌"
        startFrame={0}
        fontSize={18}
        bold
        color={theme.accentPurple}
        x={240}
        y={15}
      />

      <AnimatedText
        text="消耗宝石 → 购买卡牌 → 永久折扣"
        startFrame={3}
        fontSize={13}
        color={theme.textSecondary}
        x={200}
        y={42}
      />

      {/* Cards on display */}
      <DevelopmentCard
        level={1}
        bonusColor="blue"
        points={0}
        costs={[
          { color: 'white', amount: 1 },
          { color: 'red', amount: 2 },
          { color: 'black', amount: 2 },
        ]}
        width={52}
        x={cardAreaX}
        y={cardAreaY}
        enterFrame={2}
        highlight
        highlightFrame={10}
      />
      <DevelopmentCard
        level={1}
        bonusColor="green"
        points={1}
        costs={[
          { color: 'blue', amount: 2 },
          { color: 'red', amount: 1 },
        ]}
        width={52}
        x={cardAreaX + 62}
        y={cardAreaY}
        enterFrame={3}
      />
      <DevelopmentCard
        level={2}
        bonusColor="red"
        points={2}
        costs={[
          { color: 'green', amount: 3 },
          { color: 'blue', amount: 2 },
        ]}
        width={52}
        x={cardAreaX + 124}
        y={cardAreaY}
        enterFrame={4}
      />

      {/* Player's gems */}
      <AnimatedText
        text="我的宝石"
        startFrame={3}
        fontSize={10}
        color={theme.textSecondary}
        x={playerX}
        y={playerY - 18}
      />

      {/* Gems fly to pay for card */}
      <GemToken
        color="white"
        size={24}
        x={playerX}
        y={playerY}
        enterFrame={3}
        animateToX={cardAreaX + 10}
        animateToY={cardAreaY + 50}
        moveStartFrame={13}
        moveDuration={8}
        exitFrame={23}
      />
      <GemToken
        color="red"
        size={24}
        x={playerX + 30}
        y={playerY}
        enterFrame={3}
        animateToX={cardAreaX + 10}
        animateToY={cardAreaY + 55}
        moveStartFrame={15}
        moveDuration={8}
        exitFrame={25}
      />
      <GemToken
        color="red"
        size={24}
        x={playerX + 60}
        y={playerY}
        enterFrame={3}
        animateToX={cardAreaX + 10}
        animateToY={cardAreaY + 60}
        moveStartFrame={16}
        moveDuration={8}
        exitFrame={26}
      />
      <GemToken
        color="black"
        size={24}
        x={playerX + 90}
        y={playerY}
        enterFrame={3}
        animateToX={cardAreaX + 10}
        animateToY={cardAreaY + 65}
        moveStartFrame={17}
        moveDuration={8}
        exitFrame={27}
      />
      <GemToken
        color="black"
        size={24}
        x={playerX + 120}
        y={playerY}
        enterFrame={3}
        animateToX={cardAreaX + 10}
        animateToY={cardAreaY + 70}
        moveStartFrame={18}
        moveDuration={8}
        exitFrame={28}
      />

      {/* Acquired card in player area */}
      {frame >= 28 && (
        <DevelopmentCard
          level={1}
          bonusColor="blue"
          points={0}
          costs={[]}
          width={52}
          x={playerCardX}
          y={playerCardY}
          enterFrame={28}
        />
      )}

      {/* Discount explanation */}
      <AnimatedText
        text="获得卡牌 = 永久折扣"
        startFrame={30}
        fontSize={14}
        bold
        color={theme.accentGold}
        x={playerCardX - 5}
        y={playerCardY + 80}
      />

      {/* Discount visual */}
      {frame >= 32 && (
        <div
          style={{
            position: 'absolute',
            left: playerCardX + 60,
            top: playerCardY + 20,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            opacity: interpolate(frame, [32, 37], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          <span style={{ fontSize: 18, color: theme.textPrimary }}>→</span>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 35%, ${gemColorMap.blue}dd, ${gemColorMap.blue}66)`,
              border: `1.5px solid ${gemColorMap.blue}88`,
            }}
          />
          <span style={{ fontSize: 11, color: theme.textSecondary }}>永久 -1 蓝</span>
        </div>
      )}

      {/* Cost comparison */}
      {frame >= 40 && (
        <div
          style={{
            position: 'absolute',
            left: 350,
            top: 220,
            opacity: interpolate(frame, [40, 45], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: theme.textSecondary }}>下次购买：</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 16,
                color: theme.textSecondary,
                textDecoration: 'line-through',
              }}
            >
              蓝×2
            </span>
            <span style={{ fontSize: 18, color: theme.accentGold }}>→</span>
            <span style={{ fontSize: 16, color: theme.accentGold, fontWeight: 'bold' }}>
              蓝×1
            </span>
          </div>
        </div>
      )}

      <AnimatedText
        text="越买越便宜 — 引擎加速！"
        startFrame={47}
        fontSize={15}
        bold
        color={theme.accentGold}
        x={200}
        y={310}
      />
    </div>
  );
};
