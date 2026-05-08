/**
 * 排版系统设计令牌
 *
 * 基于 Tailwind CSS 默认字体系统
 * 参考: https://tailwindcss.com/docs/font-size
 * 参考: https://tailwindcss.com/docs/line-height
 */

// 字体族
export const fontFamily = {
  sans: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ],
  mono: [
    'ui-monospace',
    'SFMono-Regular',
    'Menlo',
    'Monaco',
    'Consolas',
    '"Liberation Mono"',
    '"Courier New"',
    'monospace',
  ],
} as const

// 字体大小（使用 Tailwind 默认值）
export const fontSize = {
  xs: ['0.75rem', { lineHeight: '1rem' }], // 12px / 16px
  sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px / 20px
  base: ['1rem', { lineHeight: '1.5rem' }], // 16px / 24px
  lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px / 28px
  xl: ['1.25rem', { lineHeight: '1.75rem' }], // 20px / 28px
  '2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px / 32px
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px / 36px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px / 40px
  '5xl': ['3rem', { lineHeight: '1' }], // 48px
  '6xl': ['3.75rem', { lineHeight: '1' }], // 60px
  '7xl': ['4.5rem', { lineHeight: '1' }], // 72px
  '8xl': ['6rem', { lineHeight: '1' }], // 96px
  '9xl': ['8rem', { lineHeight: '1' }], // 128px
} as const

// 字体粗细
export const fontWeight = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const

// 行高
export const lineHeight = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const

// 字母间距
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const

// 语义化排版预设
export const typography = {
  // 标题
  heading: {
    h1: {
      fontSize: fontSize['3xl'],
      fontWeight: fontWeight.bold,
      lineHeight: lineHeight.tight,
      letterSpacing: letterSpacing.tighter,
    },
    h2: {
      fontSize: fontSize['2xl'],
      fontWeight: fontWeight.bold,
      lineHeight: lineHeight.tight,
      letterSpacing: letterSpacing.tighter,
    },
    h3: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.semibold,
      lineHeight: lineHeight.snug,
    },
    h4: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semibold,
      lineHeight: lineHeight.snug,
    },
    h5: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
      lineHeight: lineHeight.normal,
    },
    h6: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.normal,
    },
  },
  // 正文
  body: {
    large: {
      fontSize: fontSize.lg,
      lineHeight: lineHeight.relaxed,
    },
    base: {
      fontSize: fontSize.base,
      lineHeight: lineHeight.normal,
    },
    small: {
      fontSize: fontSize.sm,
      lineHeight: lineHeight.normal,
    },
    tiny: {
      fontSize: fontSize.xs,
      lineHeight: lineHeight.normal,
    },
  },
  // 标签/标签
  label: {
    large: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.normal,
    },
    base: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.normal,
    },
    small: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.normal,
      lineHeight: lineHeight.normal,
    },
  },
  // 代码
  code: {
    fontSize: fontSize.sm,
    fontWeight: fontFamily.mono,
    lineHeight: lineHeight.normal,
  },
} as const

// 文本对齐
export const textAlign = {
  left: 'left',
  center: 'center',
  right: 'right',
  justify: 'justify',
} as const

// 文本变换
export const textTransform = {
  uppercase: 'uppercase',
  lowercase: 'lowercase',
  capitalize: 'capitalize',
} as const

// Apple 风格字体栈
export const appleFontStack = {
  // 中文优先字体栈
  chinese: [
    '-apple-system',
    'BlinkMacSystemFont',
    'PingFang SC',
    'Microsoft YaHei',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ].join(', '),

  // 英文优先字体栈
  english: [
    '-apple-system',
    'BlinkMacSystemFont',
    'SF Pro Display',
    'SF Pro Text',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ].join(', '),

  // 等宽字体栈（代码）
  mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Courier New', 'monospace'].join(
    ', ',
  ),
} as const

// Apple 风格字体权重
export const appleFontWeight = {
  // 系统标准权重
  ultralight: 100, // iOS: Ultralight
  thin: 200, // iOS: Thin
  light: 300, // iOS: Light
  regular: 400, // iOS: Regular
  medium: 500, // iOS: Medium
  semibold: 600, // iOS: Semibold
  bold: 700, // iOS: Bold
  heavy: 800, // iOS: Heavy
  black: 900, // iOS: Black
} as const

// Apple 风格行高（相对于字号）
export const appleLineHeight = {
  tight: 1.2, // 大标题紧凑行高
  standard: 1.4, // 标准行高
  relaxed: 1.6, // 宽松行高
  loose: 1.8, // 正文宽松行高
} as const

// Apple 风格语义化字体预设
export const appleTypography = {
  // macOS 大标题风格
  macTitle: {
    fontFamily: appleFontStack.english,
    fontSize: fontSize['7xl'], // 4.5rem / 72px
    fontWeight: appleFontWeight.bold, // 700
    lineHeight: appleLineHeight.tight, // 1.2
    letterSpacing: letterSpacing.tighter, // -0.025em
  },
  // iOS 导航栏大标题风格
  iosNavigation: {
    fontFamily: appleFontStack.chinese,
    fontSize: fontSize['3xl'], // 2.25rem / 36px
    fontWeight: appleFontWeight.bold, // 700
    lineHeight: appleLineHeight.standard, // 1.4
    letterSpacing: letterSpacing.normal, // 0
  },
  // iOS 次级标题风格
  iosSecondary: {
    fontFamily: appleFontStack.chinese,
    fontSize: fontSize['2xl'], // 1.5rem / 24px
    fontWeight: appleFontWeight.semibold, // 600
    lineHeight: appleLineHeight.standard, // 1.4
    letterSpacing: letterSpacing.normal, // 0
  },
  // 正文风格
  body: {
    fontFamily: appleFontStack.chinese,
    fontSize: fontSize.base, // 1rem / 16px
    fontWeight: appleFontWeight.regular, // 400
    lineHeight: appleLineHeight.relaxed, // 1.6
    letterSpacing: letterSpacing.normal, // 0
  },
  // 辅助文字风格
  caption: {
    fontFamily: appleFontStack.chinese,
    fontSize: fontSize.sm, // 0.875rem / 14px
    fontWeight: appleFontWeight.regular, // 400
    lineHeight: appleLineHeight.standard, // 1.4
    letterSpacing: letterSpacing.normal, // 0
  },
} as const

// 类型定义
export type FontSize = keyof typeof fontSize
export type FontWeight = keyof typeof fontWeight
export type LineHeight = keyof typeof lineHeight
export type LetterSpacing = keyof typeof letterSpacing
export type AppleFontStack = typeof appleFontStack
export type AppleFontWeight = typeof appleFontWeight
export type AppleLineHeight = typeof appleLineHeight
export type AppleTypography = typeof appleTypography

// Tailwind 配置映射
export const tailwindTypography = {
  fontFamily: Object.fromEntries(Object.entries(fontFamily).map(([k, v]) => [k, v])),
  fontSize: Object.fromEntries(Object.entries(fontSize).map(([k, v]) => [k, v])),
  fontWeight: Object.fromEntries(Object.entries(fontWeight).map(([k, v]) => [k, v])),
  lineHeight: Object.fromEntries(Object.entries(lineHeight).map(([k, v]) => [k, v])),
  letterSpacing: Object.fromEntries(Object.entries(letterSpacing).map(([k, v]) => [k, v])),
} as const
