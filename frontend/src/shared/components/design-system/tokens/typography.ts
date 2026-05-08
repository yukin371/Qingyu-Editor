/**
 * 设计系统 - 排版Token
 * 定义统一的字体、字号、行高等排版变量
 */

export const typography = {
  // 字体族
  fontFamily: {
    base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'Menlo, Monaco, Consolas, "Courier New", monospace',
    chinese: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
  },

  // 字号
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px'
  },

  // 字重
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },

  // 行高
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
    loose: '2'
  },

  // 字间距
  letterSpacing: {
    tight: '-0.05em',
    normal: '0',
    wide: '0.05em',
    wider: '0.1em'
  },

  // 标题样式
  heading: {
    h1: {
      fontSize: '36px',
      fontWeight: '700',
      lineHeight: '1.25'
    },
    h2: {
      fontSize: '30px',
      fontWeight: '700',
      lineHeight: '1.25'
    },
    h3: {
      fontSize: '24px',
      fontWeight: '600',
      lineHeight: '1.3'
    },
    h4: {
      fontSize: '20px',
      fontWeight: '600',
      lineHeight: '1.4'
    },
    h5: {
      fontSize: '18px',
      fontWeight: '600',
      lineHeight: '1.5'
    },
    h6: {
      fontSize: '16px',
      fontWeight: '600',
      lineHeight: '1.5'
    }
  },

  // 正文样式
  body: {
    large: {
      fontSize: '18px',
      lineHeight: '1.75'
    },
    default: {
      fontSize: '16px',
      lineHeight: '1.5'
    },
    small: {
      fontSize: '14px',
      lineHeight: '1.5'
    },
    tiny: {
      fontSize: '12px',
      lineHeight: '1.5'
    }
  }
}

// 导出CSS变量格式
export const typographyToCssVars = () => {
  const vars: Record<string, string> = {}

  Object.entries(typography).forEach(([category, values]) => {
    if (typeof values === 'object' && !Array.isArray(values)) {
      Object.entries(values).forEach(([key, value]) => {
        if (typeof value === 'string') {
          vars[`--typography-${category}-${key}`] = value
        }
      })
    }
  })

  return vars
}

export default typography

