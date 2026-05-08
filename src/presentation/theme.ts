// Design tokens — single source of truth for all UI values.
// 8px spacing grid, one glass formula, one type scale.

export const C = {
  bg:            '#0D0621',
  surface:       'rgba(255,255,255,0.075)',
  surfaceBorder: 'rgba(255,255,255,0.11)',

  purple:     '#7C3AED',
  purpleDeep: '#4C1D95',
  purpleGlow: '#9333EA',
  violet:     '#A78BFA',
  violetDim:  'rgba(167,139,250,0.55)',

  textPrimary:   '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.55)',
  textAccent:    '#A78BFA',

  chipBg:     'rgba(139,92,246,0.18)',
  chipBorder: 'rgba(139,92,246,0.28)',
  greenBg:    'rgba(16,185,129,0.14)',
  greenBorder:'rgba(16,185,129,0.25)',
  redBg:      'rgba(239,68,68,0.13)',
  redBorder:  'rgba(239,68,68,0.27)',

  red:   '#EF4444',
  amber: '#F59E0B',
  green: '#10B981',
} as const;

// Gradient stop arrays for expo-linear-gradient
export const G = {
  cta:    ['#9B6DFF', '#7C3AED'] as const,
  record: ['#9333EA', '#7C3AED'] as const,
  icon:   ['#8B5CF6', '#6D28D9'] as const,
};

// Spacing (8px grid)
export const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 } as const;

// Border radius
export const R = { card: 20, el: 11, chip: 20, sm: 9 } as const;

// Font sizes
export const FS = { hero: 50, h1: 22, h2: 14, body: 11, small: 10, micro: 9 } as const;
