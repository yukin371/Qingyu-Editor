/**
 * 阅读设置 composable
 * 管理字体大小、主题、行距、页面宽度等阅读器设置
 */
import { computed, unref } from 'vue'
import { useReaderStore } from '@/stores/reader'
import { message } from '@/design-system/services'

export interface ReaderSettings {
  fontSize: number
  lineHeight: number
  theme: string
  fontFamily: string
  pageWidth: number
  pageMode: string
  autoSave?: boolean
}

export interface ThemeOption {
  label: string
  value: string
  bg: string
  color: string
}

// 主题配置（与reader-variables.scss中的CSS变量保持一致）
export const READER_THEMES: ThemeOption[] = [
  { label: '默认', value: 'light', bg: '#ffffff', color: '#2c3e50' },
  { label: '护眼', value: 'sepia', bg: '#f4ecd8', color: '#5c4a2f' },
  { label: '夜间', value: 'night', bg: '#1a1a1a', color: '#c9c9c9' },
  { label: '暗黑', value: 'dark', bg: '#121212', color: '#e0e0e0' }
]

// 行距配置
export const LINE_HEIGHT_MIN = 1.6
export const LINE_HEIGHT_MAX = 2.2
export const LINE_HEIGHT_STEP = 0.1
export const LINE_HEIGHT_MARKS: Record<number, string> = {
  1.6: '紧凑',
  1.8: '标准',
  2.0: '舒适',
  2.2: '宽松'
}

// 页面宽度配置
export const PAGE_WIDTH_MIN = 680
export const PAGE_WIDTH_MAX = 980
export const PAGE_WIDTH_STEP = 20
export const PAGE_WIDTH_MARKS: Record<number, string> = {
  680: '窄',
  780: '标准',
  880: '宽',
  980: '超宽'
}

// 字体大小限制
export const FONT_SIZE_MIN = 14
export const FONT_SIZE_MAX = 24

export function useReaderSettings() {
  const readerStore = useReaderStore()

  // 当前设置
  const settings = computed((): ReaderSettings => {
    const s = unref(readerStore.settings) as ReaderSettings | undefined
    return {
      fontSize: s?.fontSize ?? 16,
      lineHeight: s?.lineHeight ?? 1.8,
      theme: s?.theme ?? 'light',
      fontFamily: s?.fontFamily ?? 'system-ui',
      pageWidth: s?.pageWidth ?? 800,
      pageMode: s?.pageMode ?? 'scroll',
      autoSave: s?.autoSave ?? true
    }
  })

  // 主题类名
  const themeClass = computed(() => `theme-${settings.value.theme}`)

  // 容器样式
  const containerStyle = computed(() => ({
    fontSize: `${settings.value.fontSize}px`,
    lineHeight: settings.value.lineHeight,
    maxWidth: `${settings.value.pageWidth}px`,
    fontFamily: settings.value.fontFamily
  }))

  // 增大字体
  const increaseFontSize = () => {
    if (settings.value.fontSize < FONT_SIZE_MAX) {
      readerStore.updateSettings({ fontSize: settings.value.fontSize + 1 })
    }
  }

  // 减小字体
  const decreaseFontSize = () => {
    if (settings.value.fontSize > FONT_SIZE_MIN) {
      readerStore.updateSettings({ fontSize: settings.value.fontSize - 1 })
    }
  }

  // 切换主题
  const changeTheme = (theme: string) => {
    readerStore.updateSettings({ theme: theme as ReaderSettings['theme'] })
  }

  // 设置行距
  const setLineHeight = (value: number) => {
    readerStore.updateSettings({ lineHeight: value })
  }

  // 设置页面宽度
  const setPageWidth = (value: number) => {
    readerStore.updateSettings({ pageWidth: value })
  }

  // 重置设置
  const resetSettings = () => {
    readerStore.resetSettings()
    readerStore.updateSettings({ autoSave: true })
    message.success('设置已重置')
  }

  return {
    // 配置常量
    themes: READER_THEMES,
    lineHeightMin: LINE_HEIGHT_MIN,
    lineHeightMax: LINE_HEIGHT_MAX,
    lineHeightStep: LINE_HEIGHT_STEP,
    lineHeightMarks: LINE_HEIGHT_MARKS,
    pageWidthMin: PAGE_WIDTH_MIN,
    pageWidthMax: PAGE_WIDTH_MAX,
    pageWidthStep: PAGE_WIDTH_STEP,
    pageWidthMarks: PAGE_WIDTH_MARKS,

    // 响应式状态
    settings,
    themeClass,
    containerStyle,

    // 方法
    increaseFontSize,
    decreaseFontSize,
    changeTheme,
    setLineHeight,
    setPageWidth,
    resetSettings
  }
}
