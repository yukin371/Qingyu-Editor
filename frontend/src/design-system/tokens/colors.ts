/**
 * 颜色系统设计令牌
 *
 * 基于 Tailwind CSS 默认颜色风格
 * 参考: https://tailwindcss.com/docs/customizing-colors
 */

// 语义色 - 主色（青羽主题 cyan）
export const primary = {
  50: '#ecfeff',
  100: '#cffafe',
  200: '#a5f3fc',
  300: '#67e8f9',
  400: '#22d3ee',  // 悬停状态
  500: '#06b6d4',  // DEFAULT - 青羽主题主色
  600: '#0891b2',  // 激活状态
  700: '#0e7490',
  800: '#155e75',
  900: '#164e63',
  950: '#083344',
} as const

// 语义色 - 辅助色（青羽主题 blue）
export const secondary = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',  // DEFAULT - 青羽主题辅助色
  600: '#2563eb',  // 深色状态
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
  950: '#172554',
} as const

// 渐变色（青羽主题 cyan-blue）
export const gradient = {
  from: '#0891b2',    // cyan-600
  to: '#2563eb',      // blue-600
  'soft-from': '#22d3ee',  // cyan-400
  'soft-to': '#3b82f6',    // blue-500
} as const

// 功能色 - 成功
export const success = {
  light: '#34d399',
  DEFAULT: '#10b981',
  dark: '#059669',
} as const

// 功能色 - 警告
export const warning = {
  light: '#fbbf24',
  DEFAULT: '#f59e0b',
  dark: '#d97706',
} as const

// 功能色 - 危险/错误
export const danger = {
  light: '#f87171',
  DEFAULT: '#ef4444',
  dark: '#dc2626',
} as const

// 功能色 - 信息
export const info = {
  light: '#38bdf8',
  DEFAULT: '#0ea5e9',
  dark: '#0284c7',
} as const

// 中性色 - Slate
export const neutral = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
  950: '#020617',
} as const

// 颜色变量映射
export const colors = {
  primary,
  secondary,
  gradient,
  success,
  warning,
  danger,
  info,
  neutral,
} as const

// 颜色类型
export type Color = typeof colors
export type PrimaryColor = typeof primary
export type SecondaryColor = typeof secondary
export type GradientColor = typeof gradient
export type SuccessColor = typeof success
export type WarningColor = typeof warning
export type DangerColor = typeof danger
export type InfoColor = typeof info
export type NeutralColor = typeof neutral

// 颜色值类型
export type PrimaryShade = keyof PrimaryColor
export type SecondaryShade = keyof SecondaryColor
export type GradientShade = keyof GradientColor
export type NeutralShade = keyof NeutralColor

// 功能色变体
export type FunctionalVariant = 'light' | 'DEFAULT' | 'dark'

// Tailwind 颜色配置映射
export const tailwindColors = {
  primary: Object.fromEntries(
    Object.entries(primary).map(([k, v]) => [k, v])
  ),
  secondary: Object.fromEntries(
    Object.entries(secondary).map(([k, v]) => [k, v])
  ),
  gradient: {
    from: gradient.from,
    to: gradient.to,
    'soft-from': gradient['soft-from'],
    'soft-to': gradient['soft-to'],
  },
  success: {
    light: success.light,
    DEFAULT: success.DEFAULT,
    dark: success.dark,
  },
  warning: {
    light: warning.light,
    DEFAULT: warning.DEFAULT,
    dark: warning.dark,
  },
  danger: {
    light: danger.light,
    DEFAULT: danger.DEFAULT,
    dark: danger.dark,
  },
  info: {
    light: info.light,
    DEFAULT: info.DEFAULT,
    dark: info.dark,
  },
  slate: Object.fromEntries(
    Object.entries(neutral).filter(([k]) => k !== 'DEFAULT')
  ),
} as const

// 语义化颜色别名
export const semantic = {
  background: {
    DEFAULT: neutral[50], // '#f8fafc'
    paper: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  text: {
    primary: neutral[900], // '#0f172a'
    secondary: neutral[600], // '#475569'
    disabled: neutral[400], // '#94a3b8'
    inverse: '#ffffff',
  },
  border: {
    DEFAULT: neutral[200], // '#e2e8f0'
    focus: primary[500], // '#06b6d4'
  },
  shadow: {
    DEFAULT: 'rgba(0, 0, 0, 0.1)',
    light: 'rgba(0, 0, 0, 0.05)',
    medium: 'rgba(0, 0, 0, 0.15)',
    dark: 'rgba(0, 0, 0, 0.25)',
  },
} as const

export type SemanticColors = typeof semantic
