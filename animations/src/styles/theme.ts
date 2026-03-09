export const theme = {
  bgPrimary: '#0F0F13',
  bgCard: '#1A1A24',
  bgCardLight: '#252536',
  accentGold: '#F5C518',
  accentPurple: '#6C63FF',
  textPrimary: '#E8E8ED',
  textSecondary: '#8888A0',
  gemWhite: '#E8E8E8',
  gemBlue: '#2563EB',
  gemGreen: '#16A34A',
  gemRed: '#DC2626',
  gemBlack: '#374151',
  gemGold: '#F5C518',
} as const;

export type GemColor = 'white' | 'blue' | 'green' | 'red' | 'black' | 'gold';

export const gemColorMap: Record<GemColor, string> = {
  white: theme.gemWhite,
  blue: theme.gemBlue,
  green: theme.gemGreen,
  red: theme.gemRed,
  black: theme.gemBlack,
  gold: theme.gemGold,
};

export const gemNames: Record<GemColor, string> = {
  white: '钻石',
  blue: '蓝宝石',
  green: '翡翠',
  red: '红宝石',
  black: '缟玛瑙',
  gold: '黄金',
};
