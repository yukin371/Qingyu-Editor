/**
 * 阅读器字体管理 API
 */
import { request } from '@/utils/request-adapter'

// 字体类型
export type FontType = 'serif' | 'sans-serif' | 'monospace' | 'custom'

// 字体配置
export interface Font {
  id: string
  name: string
  family: string
  type: FontType
  url?: string
  preview?: string
  is_builtin: boolean
  is_active: boolean
  created_at?: string
}

// 字体设置
export interface FontSettings {
  family: string
  size: number
  line_height: number
  letter_spacing: number
  weight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
}

/**
 * 获取所有可用字体
 */
export function getFonts() {
  return request<Font[]>({
    url: '/api/v1/reader/fonts',
    method: 'get'
  })
}

/**
 * 获取内置字体
 */
export function getBuiltinFonts() {
  return request<Font[]>({
    url: '/api/v1/reader/fonts/builtin',
    method: 'get'
  })
}

/**
 * 获取用户自定义字体
 */
export function getCustomFonts() {
  return request<Font[]>({
    url: '/api/v1/reader/fonts/custom',
    method: 'get'
  })
}

/**
 * 获取字体设置
 */
export function getFontSettings() {
  return request<FontSettings>({
    url: '/api/v1/reader/fonts/settings',
    method: 'get'
  })
}

/**
 * 更新字体设置
 */
export function updateFontSettings(settings: Partial<FontSettings>) {
  return request<FontSettings>({
    url: '/api/v1/reader/fonts/settings',
    method: 'put',
    data: settings
  })
}

/**
 * 上传自定义字体
 */
export function uploadCustomFont(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return request<Font>({
    url: '/api/v1/reader/fonts/custom',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 添加自定义字体
 */
export function addCustomFont(data: {
  name: string
  family: string
  url: string
}) {
  return request<Font>({
    url: '/api/v1/reader/fonts/custom',
    method: 'post',
    data
  })
}

/**
 * 删除自定义字体
 */
export function deleteCustomFont(fontId: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/reader/fonts/custom/${fontId}`,
    method: 'delete'
  })
}

/**
 * 设置字体
 */
export function setFont(fontId: string) {
  return request<{ success: boolean }>({
    url: '/api/v1/reader/fonts/active',
    method: 'post',
    data: { font_id: fontId }
  })
}

// 预定义字体
export const builtinFonts: Font[] = [
  {
    id: 'system',
    name: '系统默认',
    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    type: 'sans-serif',
    is_builtin: true,
    is_active: true
  },
  {
    id: 'songti',
    name: '宋体',
    family: '"SimSun", "STSong", serif',
    type: 'serif',
    is_builtin: true,
    is_active: false
  },
  {
    id: 'heiti',
    name: '黑体',
    family: '"SimHei", "STHeiti", sans-serif',
    type: 'sans-serif',
    is_builtin: true,
    is_active: false
  },
  {
    id: 'kaiti',
    name: '楷体',
    family: '"KaiTi", "STKaiti", serif',
    type: 'serif',
    is_builtin: true,
    is_active: false
  },
  {
    id: 'yahei',
    name: '微软雅黑',
    family: '"Microsoft YaHei", "PingFang SC", sans-serif',
    type: 'sans-serif',
    is_builtin: true,
    is_active: false
  },
  {
    id: 'lishu',
    name: '隶书',
    family: '"LiSu", "STLiti", serif',
    type: 'serif',
    is_builtin: true,
    is_active: false
  },
  {
    id: 'fangsong',
    name: '仿宋',
    family: '"FangSong", "STFangsong", serif',
    type: 'serif',
    is_builtin: true,
    is_active: false
  },
  {
    id: 'source-han',
    name: '思源黑体',
    family: '"Source Han Sans CN", "Noto Sans CJK SC", sans-serif',
    type: 'sans-serif',
    is_builtin: true,
    is_active: false
  },
  {
    id: 'source-serif',
    name: '思源宋体',
    family: '"Source Han Serif CN", "Noto Serif CJK SC", serif',
    type: 'serif',
    is_builtin: true,
    is_active: false
  },
  {
    id: 'code',
    name: '等宽',
    family: '"Consolas", "Monaco", "Courier New", monospace',
    type: 'monospace',
    is_builtin: true,
    is_active: false
  }
]

// 字体大小选项
export const fontSizeOptions = [
  { label: '极小', value: 12 },
  { label: '很小', value: 14 },
  { label: '小', value: 16 },
  { label: '标准', value: 18 },
  { label: '中', value: 20 },
  { label: '大', value: 22 },
  { label: '很大', value: 24 },
  { label: '极大', value: 28 }
]

// 行高选项
export const lineHeightOptions = [
  { label: '紧凑', value: 1.2 },
  { label: '标准', value: 1.5 },
  { label: '舒适', value: 1.8 },
  { label: '宽松', value: 2.0 },
  { label: '很宽', value: 2.2 }
]
