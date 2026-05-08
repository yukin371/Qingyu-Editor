/**
 * 设计系统 - 间距Token
 * 定义统一的间距变量，确保布局一致性
 */

export const spacing = {
  // 基础间距单位 (px)
  unit: 4,

  // 预定义间距
  none: '0',
  xs: '4px',    // 1 unit
  sm: '8px',    // 2 units
  md: '16px',   // 4 units
  lg: '24px',   // 6 units
  xl: '32px',   // 8 units
  '2xl': '48px', // 12 units
  '3xl': '64px', // 16 units
  '4xl': '96px', // 24 units

  // 组件特定间距
  component: {
    cardPadding: '24px',
    cardGap: '16px',
    sectionPadding: '32px',
    containerPadding: '24px',
    formItemMargin: '16px',
    buttonPadding: '12px 24px',
    inputPadding: '8px 12px'
  },

  // 布局间距
  layout: {
    headerHeight: '64px',
    sidebarWidth: '240px',
    footerHeight: '80px',
    contentMaxWidth: '1200px',
    mobileContentPadding: '16px',
    desktopContentPadding: '24px'
  }
}

// 生成间距工具函数
export const getSpacing = (multiplier: number): string => {
  return `${spacing.unit * multiplier}px`
}

// 导出CSS变量格式
export const spacingToCssVars = () => {
  const vars: Record<string, string> = {}

  Object.entries(spacing).forEach(([key, value]) => {
    if (typeof value === 'string') {
      vars[`--spacing-${key}`] = value
    } else if (typeof value === 'object') {
      Object.entries(value).forEach(([subKey, subValue]) => {
        vars[`--spacing-${key}-${subKey}`] = subValue as string
      })
    }
  })

  return vars
}

export default spacing

