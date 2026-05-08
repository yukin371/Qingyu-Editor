/**
 * 阅读器主题管理 API
 */
import { request } from '@/utils/request-adapter'

// 主题类型
export type ThemeType = 'light' | 'dark' | 'sepia' | 'eye-care' | 'night' | 'custom'

// 主题配色
export interface ThemeColors {
  background: string
  foreground: string
  accent: string
  secondary: string
  border: string
  shadow: string
}

// 主题配置
export interface Theme {
  id: string
  name: string
  type: ThemeType
  colors: ThemeColors
  preview?: string
  is_builtin: boolean
  created_at?: string
}

// 自定义主题创建参数
export interface CreateThemeParams {
  name: string
  type: 'custom'
  colors: ThemeColors
}

/**
 * 获取所有可用主题
 */
export function getThemes() {
  return request<Theme[]>({
    url: '/api/v1/reader/themes',
    method: 'get'
  })
}

/**
 * 获取内置主题
 */
export function getBuiltinThemes() {
  return request<Theme[]>({
    url: '/api/v1/reader/themes/builtin',
    method: 'get'
  })
}

/**
 * 获取用户自定义主题
 */
export function getCustomThemes() {
  return request<Theme[]>({
    url: '/api/v1/reader/themes/custom',
    method: 'get'
  })
}

/**
 * 获取当前激活主题
 */
export function getActiveTheme() {
  return request<Theme>({
    url: '/api/v1/reader/themes/active',
    method: 'get'
  })
}

/**
 * 设置激活主题
 */
export function setActiveTheme(themeId: string) {
  return request<{ success: boolean }>({
    url: '/api/v1/reader/themes/active',
    method: 'post',
    data: { theme_id: themeId }
  })
}

/**
 * 创建自定义主题
 */
export function createCustomTheme(data: CreateThemeParams) {
  return request<Theme>({
    url: '/api/v1/reader/themes/custom',
    method: 'post',
    data
  })
}

/**
 * 更新自定义主题
 */
export function updateCustomTheme(themeId: string, data: Partial<CreateThemeParams>) {
  return request<Theme>({
    url: `/api/v1/reader/themes/custom/${themeId}`,
    method: 'put',
    data
  })
}

/**
 * 删除自定义主题
 */
export function deleteCustomTheme(themeId: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/reader/themes/custom/${themeId}`,
    method: 'delete'
  })
}

/**
 * 导出主题
 */
export function exportTheme(themeId: string) {
  return request<{ theme: Theme; data: string }>({
    url: `/api/v1/reader/themes/${themeId}/export`,
    method: 'get'
  })
}

/**
 * 导入主题
 */
export function importTheme(data: {
  name: string
  theme_data: string
}) {
  return request<Theme>({
    url: '/api/v1/reader/themes/import',
    method: 'post',
    data
  })
}

// 预定义主题配色
export const builtinThemes: Theme[] = [
  {
    id: 'light',
    name: '明亮',
    type: 'light',
    colors: {
      background: '#ffffff',
      foreground: '#333333',
      accent: '#409EFF',
      secondary: '#909399',
      border: '#DCDFE6',
      shadow: 'rgba(0, 0, 0, 0.1)'
    },
    is_builtin: true
  },
  {
    id: 'dark',
    name: '暗黑',
    type: 'dark',
    colors: {
      background: '#1a1a1a',
      foreground: '#e0e0e0',
      accent: '#409EFF',
      secondary: '#909399',
      border: '#4c4d4f',
      shadow: 'rgba(0, 0, 0, 0.3)'
    },
    is_builtin: true
  },
  {
    id: 'sepia',
    name: '护眼',
    type: 'sepia',
    colors: {
      background: '#f4ecd8',
      foreground: '#5c4b37',
      accent: '#d4a058',
      secondary: '#8b7355',
      border: '#e3d5b8',
      shadow: 'rgba(92, 75, 55, 0.1)'
    },
    is_builtin: true
  },
  {
    id: 'eye-care',
    name: '夜间护眼',
    type: 'eye-care',
    colors: {
      background: '#c7edcc',
      foreground: '#2d5a30',
      accent: '#52c41a',
      secondary: '#5a8d5f',
      border: '#a8d5ae',
      shadow: 'rgba(45, 90, 48, 0.1)'
    },
    is_builtin: true
  },
  {
    id: 'night',
    name: '夜间',
    type: 'night',
    colors: {
      background: '#0f0f0f',
      foreground: '#b0b0b0',
      accent: '#5D5D5D',
      secondary: '#707070',
      border: '#2a2a2a',
      shadow: 'rgba(0, 0, 0, 0.5)'
    },
    is_builtin: true
  }
]
