import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 编辑器主题名称
 */
export type EditorThemeName = 'light' | 'sepia' | 'dark' | 'focus'

const STORAGE_KEY = 'qingyu-editor-theme'

/**
 * 主题元数据（用于 UI 展示）
 */
export const EDITOR_THEMES: Record<EditorThemeName, { label: string; description: string; previewColor: string }> = {
  light: {
    label: '经典白',
    description: '简洁明亮',
    previewColor: '#ffffff'
  },
  sepia: {
    label: '暖纸',
    description: '护眼暖色',
    previewColor: '#faf6f0'
  },
  dark: {
    label: '深空',
    description: '暗色主题',
    previewColor: '#1e1e2e'
  },
  focus: {
    label: '专注',
    description: '极简沉浸',
    previewColor: '#f5f5f5'
  }
}

export const useEditorThemeStore = defineStore('editor-theme', () => {
  const currentTheme = ref<EditorThemeName>('light')

  /**
   * 从 localStorage 恢复主题
   */
  const initTheme = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved && saved in EDITOR_THEMES) {
        currentTheme.value = saved as EditorThemeName
      }
    } catch {
      // localStorage 不可用时使用默认值
    }
    applyTheme()
  }

  /**
   * 将主题应用到 DOM（更新 data-editor-theme 属性）
   */
  const applyTheme = () => {
    const el = document.querySelector('.workspace-studio')
    if (el) {
      // 防闪烁：先添加切换类
      document.documentElement.classList.add('theme-switching')
      el.setAttribute('data-editor-theme', currentTheme.value)
      // 双帧后移除切换类
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.documentElement.classList.remove('theme-switching')
        })
      })
    }
  }

  /**
   * 切换主题
   */
  const setTheme = (name: EditorThemeName) => {
    if (!(name in EDITOR_THEMES)) return
    currentTheme.value = name
    applyTheme()
    try {
      localStorage.setItem(STORAGE_KEY, name)
    } catch {
      // localStorage 不可用时静默失败
    }
  }

  return {
    currentTheme,
    initTheme,
    setTheme,
    applyTheme
  }
})
