/**
 * useI18n - 国际化组合式函数
 * 简单的国际化实现，支持中文和英文
 */

import { computed } from 'vue'

export type Locale = 'zh-CN' | 'en-US'

interface I18nMessages {
  [key: string]: string | I18nMessages
}

// 中文翻译
const zhCN: I18nMessages = {
  editor: {
    save: '保存 (Ctrl+S)',
    undo: '撤销 (Ctrl+Z)',
    redo: '重做 (Ctrl+Y)',
    aiAssistant: 'AI助手 (Ctrl+Shift+A)',
    focusMode: '专注模式 (F11)',
    contentArea: '编辑器内容区域',
    placeholder: '开始写作...',
    wordCount: '字数',
    readTime: '阅读时间',
    line: '行',
    minutes: '分钟',
    saved: '已保存',
    saving: '保存中...',
    unsaved: '未保存'
  }
}

// 英文翻译
const enUS: I18nMessages = {
  editor: {
    save: 'Save (Ctrl+S)',
    undo: 'Undo (Ctrl+Z)',
    redo: 'Redo (Ctrl+Y)',
    aiAssistant: 'AI Assistant (Ctrl+Shift+A)',
    focusMode: 'Focus Mode (F11)',
    contentArea: 'Editor Content Area',
    placeholder: 'Start writing...',
    wordCount: 'Words',
    readTime: 'Read Time',
    line: 'Line',
    minutes: 'min',
    saved: 'Saved',
    saving: 'Saving...',
    unsaved: 'Unsaved'
  }
}

// 翻译资源
const messages: Record<Locale, I18nMessages> = {
  'zh-CN': zhCN,
  'en-US': enUS
}

// 当前语言环境
let currentLocale: Locale = 'zh-CN'

/**
 * 设置语言环境
 */
export function setLocale(locale: Locale) {
  currentLocale = locale
}

/**
 * 获取当前语言环境
 */
export function getLocale(): Locale {
  return currentLocale
}

/**
 * 国际化组合式函数
 */
export function useI18n() {
  /**
   * 翻译函数
   * @param key 翻译键，支持点分隔的路径（如 'editor.save'）
   * @param defaultValue 默认值，当翻译不存在时使用
   */
  const t = (key: string, defaultValue?: string): string => {
    const keys = key.split('.')
    let result: any = messages[currentLocale]

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k]
      } else {
        // 翻译不存在，返回默认值或键本身
        return defaultValue || key
      }
    }

    return typeof result === 'string' ? result : defaultValue || key
  }

  /**
   * 切换语言
   */
  const locale = computed({
    get: () => currentLocale,
    set: (value: Locale) => {
      setLocale(value)
    }
  })

  return {
    t,
    locale,
    setLocale,
    getLocale
  }
}

/**
 * 翻译工具函数（非组合式）
 */
export function i18n(key: string, defaultValue?: string): string {
  const { t } = useI18n()
  return t(key, defaultValue)
}
