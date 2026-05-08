/**
 * Tailwind 主题扩展令牌
 *
 * 作为 Tailwind 配置的单一数据源，避免在 tailwind.config.js 中分散硬编码。
 */

import { gradient, neutral, semantic } from './colors'
import { animation as motionTokens, tailwindBorderRadius, tailwindSpacing } from './spacing'
import { qingyuTheme } from './theme'
import { tailwindTypography } from './typography'

function hexToRgbChannels(hex: string): string | null {
  const cleanHex = hex.replace('#', '')
  const fullHex = cleanHex.length === 3
    ? cleanHex.split('').map((char) => char + char).join('')
    : cleanHex

  if (!/^[0-9A-Fa-f]{6}$/.test(fullHex)) {
    return null
  }

  const r = parseInt(fullHex.slice(0, 2), 16)
  const g = parseInt(fullHex.slice(2, 4), 16)
  const b = parseInt(fullHex.slice(4, 6), 16)

  return `${r} ${g} ${b}`
}

const primary500Rgb = hexToRgbChannels(qingyuTheme.primary[500]) || '6 182 212'
const secondary500Rgb = hexToRgbChannels(qingyuTheme.secondary[500]) || '59 130 246'

export const tailwindColorTokens = {
  primary: qingyuTheme.primary,
  secondary: qingyuTheme.secondary,
  success: qingyuTheme.success,
  warning: qingyuTheme.warning,
  danger: qingyuTheme.danger,
  info: qingyuTheme.info,
  slate: neutral,
  gradient: {
    from: gradient.from,
    to: gradient.to,
    'soft-from': gradient['soft-from'],
    'soft-to': gradient['soft-to'],
  },
  text: semantic.text,
  border: semantic.border,
  background: semantic.background,
} as const

export const tailwindShadowTokens = {
  glow: `0 8px 24px -14px rgb(${primary500Rgb} / 0.55)`,
  'glow-strong': `0 14px 32px -16px rgb(${primary500Rgb} / 0.72)`,
  soft: `0 12px 28px -18px rgb(${secondary500Rgb} / 0.45)`,
  dock: '0 8px 32px rgba(15, 23, 42, 0.12)',
} as const

export const tailwindBackgroundImageTokens = {
  'qingyu-gradient': `linear-gradient(120deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
  'qingyu-gradient-soft': `linear-gradient(120deg, ${gradient['soft-from']} 0%, ${gradient['soft-to']} 100%)`,
} as const

export const tailwindKeyframesTokens = {
  float: {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-10px)' },
  },
} as const

export const tailwindAnimationTokens = {
  float: `float 7s ${motionTokens.easing.ios} infinite`,
  'float-fast': `float ${motionTokens.duration.slow} ${motionTokens.easing.ios} infinite`,
} as const

export const tailwindThemeExtension = {
  colors: tailwindColorTokens,
  spacing: tailwindSpacing,
  borderRadius: {
    ...tailwindBorderRadius,
    '4xl': '2rem',
  },
  boxShadow: tailwindShadowTokens,
  backgroundImage: tailwindBackgroundImageTokens,
  fontFamily: tailwindTypography.fontFamily,
  fontSize: tailwindTypography.fontSize,
  fontWeight: tailwindTypography.fontWeight,
  lineHeight: tailwindTypography.lineHeight,
  letterSpacing: tailwindTypography.letterSpacing,
  keyframes: tailwindKeyframesTokens,
  animation: tailwindAnimationTokens,
  transitionDuration: motionTokens.duration,
  transitionTimingFunction: motionTokens.easing,
} as const
