/**
 * 设计系统 Token 兼容导出
 *
 * 这里保留给历史调用方，实际 owner 已收口到 `src/design-system/tokens`。
 */

import {
  colors as qyColors,
  component as qyComponentSpacing,
  spacing as qySpacing,
  typography as qyTypography,
} from '@/design-system/tokens'

export { colors as qyColors, spacing as qySpacing, typography as qyTypography } from '@/design-system/tokens'

export const colors = qyColors
export const spacing = {
  ...qySpacing,
  unit: 4,
  none: '0',
  xs: qySpacing.padding.xs,
  sm: qySpacing.padding.sm,
  md: qySpacing.padding.md,
  lg: qySpacing.padding.lg,
  xl: qySpacing.padding.xl,
  '2xl': qySpacing.padding['2xl'],
  '3xl': qySpacing.padding['3xl'],
  '4xl': '96px',
  component: qyComponentSpacing,
  layout: {
    headerHeight: '64px',
    sidebarWidth: '240px',
    footerHeight: '80px',
    contentMaxWidth: '1200px',
    mobileContentPadding: '16px',
    desktopContentPadding: '24px',
  },
}
export const typography = qyTypography

export const getSpacing = (multiplier: number): string => `${4 * multiplier}px`

const flattenTokensToCssVars = (input: Record<string, unknown>, prefix: string) => {
  const vars: Record<string, string> = {}

  Object.entries(input).forEach(([key, value]) => {
    if (typeof value === 'string' || typeof value === 'number') {
      vars[`--${prefix}-${key}`] = String(value)
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        vars[`--${prefix}-${key}-${index}`] = String(item)
      })
      return
    }

    if (value && typeof value === 'object') {
      Object.entries(value as Record<string, unknown>).forEach(([subKey, subValue]) => {
        if (typeof subValue === 'string' || typeof subValue === 'number') {
          vars[`--${prefix}-${key}-${subKey}`] = String(subValue)
        }
      })
    }
  })

  return vars
}

export const colorsToCssVars = () => flattenTokensToCssVars(qyColors as Record<string, unknown>, 'color')
export const spacingToCssVars = () => flattenTokensToCssVars(qySpacing as Record<string, unknown>, 'spacing')
export const typographyToCssVars = () => flattenTokensToCssVars(qyTypography as Record<string, unknown>, 'typography')

export const allTokensToCssVars = () => ({
  ...colorsToCssVars(),
  ...spacingToCssVars(),
  ...typographyToCssVars(),
})
