/**
 * Qingyu 主题系统
 * 统一管理所有主题色，方便切换和扩展
 */

// 主题类型定义
export interface ThemeColors {
  // 品牌色
  primary: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
  }
  // 辅助色
  secondary: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
  }
  // 渐变色
  gradient: {
    from: string
    to: string
    soft: {
      from: string
      to: string
    }
  }
  // 功能色
  success: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
  }
  warning: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
  }
  danger: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
  }
  info: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
  }
}

// 青羽主题（青蓝渐变）- 默认主题
export const qingyuTheme: ThemeColors = {
  primary: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',  // 悬停状态
    500: '#06b6d4',  // 主色
    600: '#0891b2',  // 激活状态
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },
  secondary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // 辅助色
    600: '#2563eb',  // 深色状态
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  gradient: {
    from: '#0891b2',  // cyan-600
    to: '#2563eb',    // blue-600
    soft: {
      from: '#22d3ee', // cyan-400
      to: '#3b82f6',   // blue-500
    },
  },
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
}

// 紫粉主题（备选）
export const berryTheme: ThemeColors = {
  primary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },
  secondary: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
  },
  gradient: {
    from: '#9333ea',  // purple-600
    to: '#db2777',    // pink-600
    soft: {
      from: '#c084fc', // purple-400
      to: '#f472b6',   // pink-400
    },
  },
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
}

// 森林主题（绿蓝渐变）
export const forestTheme: ThemeColors = {
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  secondary: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },
  gradient: {
    from: '#16a34a',  // green-600
    to: '#0891b2',    // cyan-600
    soft: {
      from: '#4ade80', // green-400
      to: '#22d3ee',   // cyan-400
    },
  },
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
}

// 主题映射
export const themes = {
  qingyu: qingyuTheme,     // 青羽主题（默认）
  berry: berryTheme,       // 紫粉主题
  forest: forestTheme,     // 森林主题
}

// 主题类型
export type ThemeName = keyof typeof themes

// 当前活动主题（默认青羽主题）
export let currentTheme: ThemeColors = qingyuTheme
export let currentThemeName: ThemeName = 'qingyu'

/**
 * 切换主题
 * @param themeName 主题名称
 */
export function setTheme(themeName: ThemeName): void {
  const theme = themes[themeName]
  if (!theme) {
    console.error(`Theme "${themeName}" not found`)
    return
  }

  // 添加切换中类（禁用过渡，避免闪烁）
  document.documentElement.classList.add('theme-switching')

  // 使用 requestAnimationFrame 确保类名生效后再更新 CSS 变量
  requestAnimationFrame(() => {
    // 更新 CSS 变量
    updateCSSVariables(theme)

    // 更新当前主题状态
    currentThemeName = themeName
    currentTheme = theme

    // 保存到 localStorage
    saveTheme(themeName)

    // 下一帧移除切换中类（启用过渡）
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('theme-switching')
    })
  })
}

/**
 * 更新 CSS 变量
 * @param theme 主题色配置
 */
function updateCSSVariables(theme: ThemeColors): void {
  const root = document.documentElement

  // 主色
  root.style.setProperty('--color-primary-200', theme.primary[200])
  root.style.setProperty('--color-primary-300', theme.primary[300])
  root.style.setProperty('--color-primary-400', theme.primary[400])
  root.style.setProperty('--color-primary-500', theme.primary[500])
  root.style.setProperty('--color-primary-600', theme.primary[600])
  root.style.setProperty('--color-primary-700', theme.primary[700])
  root.style.setProperty('--color-primary-900', theme.primary[900])

  // 辅助色
  root.style.setProperty('--color-secondary-200', theme.secondary[200])
  root.style.setProperty('--color-secondary-400', theme.secondary[400])
  root.style.setProperty('--color-secondary-500', theme.secondary[500])
  root.style.setProperty('--color-secondary-600', theme.secondary[600])

  // RGB 变量（用于 rgba() 函数）
  const hexToRgb = (hex: string): string | null => {
    // 移除 # 号
    const cleanHex = hex.replace('#', '')

    // 处理 3 位缩写（如 #FFF → #FFFFFF）
    const fullHex = cleanHex.length === 3
      ? cleanHex.split('').map(c => c + c).join('')
      : cleanHex

    // 验证格式
    const isValid = /^[0-9A-Fa-f]{6}$/.test(fullHex)
    if (!isValid) return null

    // 转换为 RGB
    const r = parseInt(fullHex.substring(0, 2), 16)
    const g = parseInt(fullHex.substring(2, 4), 16)
    const b = parseInt(fullHex.substring(4, 6), 16)

    return `${r}, ${g}, ${b}`
  }

  root.style.setProperty('--color-primary-500-rgb', hexToRgb(theme.primary[500]) || '6, 182, 212')
  root.style.setProperty('--color-secondary-500-rgb', hexToRgb(theme.secondary[500]) || '59, 130, 246')

  // 渐变
  root.style.setProperty('--gradient-from', theme.gradient.from)
  root.style.setProperty('--gradient-to', theme.gradient.to)
  root.style.setProperty('--gradient-soft-from', theme.gradient.soft.from)
  root.style.setProperty('--gradient-soft-to', theme.gradient.soft.to)

  // 功能色
  // Success 颜色
  root.style.setProperty('--color-success-50', theme.success[50])
  root.style.setProperty('--color-success-100', theme.success[100])
  root.style.setProperty('--color-success-200', theme.success[200])
  root.style.setProperty('--color-success-300', theme.success[300])
  root.style.setProperty('--color-success-400', theme.success[400])
  root.style.setProperty('--color-success-500', theme.success[500])
  root.style.setProperty('--color-success-600', theme.success[600])
  root.style.setProperty('--color-success-700', theme.success[700])
  root.style.setProperty('--color-success-800', theme.success[800])
  root.style.setProperty('--color-success-900', theme.success[900])

  // Warning 颜色
  root.style.setProperty('--color-warning-50', theme.warning[50])
  root.style.setProperty('--color-warning-100', theme.warning[100])
  root.style.setProperty('--color-warning-200', theme.warning[200])
  root.style.setProperty('--color-warning-300', theme.warning[300])
  root.style.setProperty('--color-warning-400', theme.warning[400])
  root.style.setProperty('--color-warning-500', theme.warning[500])
  root.style.setProperty('--color-warning-600', theme.warning[600])
  root.style.setProperty('--color-warning-700', theme.warning[700])
  root.style.setProperty('--color-warning-800', theme.warning[800])
  root.style.setProperty('--color-warning-900', theme.warning[900])

  // Danger 颜色
  root.style.setProperty('--color-danger-50', theme.danger[50])
  root.style.setProperty('--color-danger-100', theme.danger[100])
  root.style.setProperty('--color-danger-200', theme.danger[200])
  root.style.setProperty('--color-danger-300', theme.danger[300])
  root.style.setProperty('--color-danger-400', theme.danger[400])
  root.style.setProperty('--color-danger-500', theme.danger[500])
  root.style.setProperty('--color-danger-600', theme.danger[600])
  root.style.setProperty('--color-danger-700', theme.danger[700])
  root.style.setProperty('--color-danger-800', theme.danger[800])
  root.style.setProperty('--color-danger-900', theme.danger[900])

  // Info 颜色
  root.style.setProperty('--color-info-50', theme.info[50])
  root.style.setProperty('--color-info-100', theme.info[100])
  root.style.setProperty('--color-info-200', theme.info[200])
  root.style.setProperty('--color-info-300', theme.info[300])
  root.style.setProperty('--color-info-400', theme.info[400])
  root.style.setProperty('--color-info-500', theme.info[500])
  root.style.setProperty('--color-info-600', theme.info[600])
  root.style.setProperty('--color-info-700', theme.info[700])
  root.style.setProperty('--color-info-800', theme.info[800])
  root.style.setProperty('--color-info-900', theme.info[900])
}

/**
 * 获取 Tailwind 颜色配置
 * @param theme 主题色配置
 */
export function getTailwindColors(theme: ThemeColors = currentTheme) {
  return {
    primary: theme.primary,
    secondary: theme.secondary,
    success: theme.success,
    warning: theme.warning,
    danger: theme.danger,
    info: theme.info,
  }
}

/**
 * 初始化主题（在应用启动时调用）
 * 优先从 localStorage 读取保存的主题，如果没有则使用默认主题
 */
export function initTheme(defaultThemeName: ThemeName = 'qingyu'): void {
  const savedTheme = loadTheme()

  if (savedTheme) {
    setTheme(savedTheme)
  } else {
    setTheme(defaultThemeName)
  }
}

/**
 * 保存主题偏好到 localStorage
 */
export function saveTheme(themeName: ThemeName): void {
  try {
    localStorage.setItem('qingyu-theme', themeName)
  } catch (error) {
    console.warn('Failed to save theme preference:', error)
  }
}

/**
 * 从 localStorage 读取主题偏好
 */
export function loadTheme(): ThemeName | null {
  try {
    const saved = localStorage.getItem('qingyu-theme')
    if (saved && isValidThemeName(saved)) {
      return saved as ThemeName
    }
    return null
  } catch (error) {
    console.warn('Failed to load theme preference:', error)
    return null
  }
}

/**
 * 验证主题名称是否有效
 */
function isValidThemeName(name: string): name is ThemeName {
  return ['qingyu', 'berry', 'forest'].includes(name)
}

/**
 * 清除主题偏好
 */
export function clearTheme(): void {
  try {
    localStorage.removeItem('qingyu-theme')
  } catch (error) {
    console.warn('Failed to clear theme preference:', error)
  }
}
