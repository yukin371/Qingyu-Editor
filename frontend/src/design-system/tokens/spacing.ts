/**
 * 间距系统设计令牌
 *
 * 基于 Tailwind CSS 默认间距系统
 * 参考: https://tailwindcss.com/docs/customizing-spacing
 */

// 基础间距单位（rem）
export const base = {
  0: '0rem',
  px: '1px', // 1px
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
  36: '9rem', // 144px
  40: '10rem', // 160px
  44: '11rem', // 176px
  48: '12rem', // 192px
  52: '13rem', // 208px
  56: '14rem', // 224px
  60: '15rem', // 240px
  64: '16rem', // 256px
  72: '18rem', // 288px
  80: '20rem', // 320px
  96: '24rem', // 384px
} as const

// 语义化间距预设
export const spacing = {
  // 内边距预设
  padding: {
    none: '0',
    xs: base[1], // 4px
    sm: base[2], // 8px
    md: base[4], // 16px
    lg: base[6], // 24px
    xl: base[8], // 32px
    '2xl': base[12], // 48px
    '3xl': base[16], // 64px
  },
  // 外边距预设
  margin: {
    none: '0',
    xs: base[1], // 4px
    sm: base[2], // 8px
    md: base[4], // 16px
    lg: base[6], // 24px
    xl: base[8], // 32px
    '2xl': base[12], // 48px
    '3xl': base[16], // 64px
  },
  // 间隙预设 (用于 flex/grid gap)
  gap: {
    0: '0',
    xs: base[1], // 4px
    sm: base[2], // 8px
    md: base[4], // 16px
    lg: base[6], // 24px
    xl: base[8], // 32px
  },
} as const

// 组件特定间距
export const component = {
  // 按钮内边距
  button: {
    xs: { x: base[2], y: base[1] }, // 8px 4px
    sm: { x: base[3], y: base[1.5] }, // 12px 6px
    md: { x: base[4], y: base[2] }, // 16px 8px
    lg: { x: base[6], y: base[2.5] }, // 24px 10px
    xl: { x: base[8], y: base[3] }, // 32px 12px
  },
  // 输入框内边距
  input: {
    sm: { x: base[3], y: base[1.5] }, // 12px 6px
    md: { x: base[3], y: base[2] }, // 12px 8px
    lg: { x: base[4], y: base[2.5] }, // 16px 10px
  },
  // 卡片内边距
  card: {
    sm: base[4], // 16px
    md: base[6], // 24px
    lg: base[8], // 32px
  },
  // 表单项间距
  form: {
    item: { bottom: base[4] }, // 16px
    section: { bottom: base[8] }, // 32px
  },
} as const

// 圆角
export const borderRadius = {
  none: '0',
  sm: '0.125rem', // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px', // 完全圆角
} as const

// 类型定义
export type SpacingValue = keyof typeof base
export type SpacingPreset = keyof typeof spacing.padding
export type BorderRadius = keyof typeof borderRadius

// Tailwind 间距配置映射
export const tailwindSpacing = Object.fromEntries(
  Object.entries(base).map(([k, v]) => [k, v])
)

export const tailwindBorderRadius = Object.fromEntries(
  Object.entries(borderRadius).map(([k, v]) => [k, v])
)

// Apple 风格玻璃拟态间距
export const glassmorphism = {
  // 玻璃卡片内边距
  card: {
    sm: base[4],  // 16px - 小玻璃卡片
    md: base[6],  // 24px - 中等玻璃卡片
    lg: base[8],  // 32px - 大玻璃卡片
  },
  // 模糊区域外边距
  blur: {
    sm: base[2],  // 8px - 小模糊区域
    md: base[3],  // 12px - 中等模糊区域
    lg: base[4],  // 16px - 大模糊区域
  },
  // 浮动元素阴影扩散距离
  floatShadow: {
    sm: base[2],  // 8px
    md: base[4],  // 16px
    lg: base[6],  // 24px
  },
} as const

// Apple 风格栅格间距
export const grid = {
  // macOS 风格窗口栅格
  macWindow: base[4],  // 16px - 窗口之间的间距
  // iOS 风格应用网格
  iosApp: base[3],     // 12px - 应用图标之间的间距
  // 仪表盘卡片栅格
  dashboard: base[6],  // 24px - 仪表盘卡片间距
} as const

// Apple 风格动画时序
export const animation = {
  // 标准动画时长
  duration: {
    instant: '150ms',
    fast: '200ms',
    standard: '300ms',
    slow: '500ms',
  },
  // 缓动函数
  easing: {
    // iOS 风格
    ios: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    // macOS 风格
    mac: 'cubic-bezier(0.42, 0, 0.58, 1)',
    // 自定义弹性
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
} as const

// 类型定义
export type GlassmorphismSpacing = typeof glassmorphism
export type GridSpacing = typeof grid
export type AnimationTiming = typeof animation
