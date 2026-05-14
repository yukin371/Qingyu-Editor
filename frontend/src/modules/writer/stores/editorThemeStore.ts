import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  THEME_OPTIONS,
  THEME_OPTIONS_MAP,
  currentThemeName,
  initTheme as initGlobalTheme,
  loadTheme,
  setTheme as setGlobalTheme,
  type ThemeName,
} from '@/design-system/tokens/theme'

/**
 * 向后兼容旧命名，实际已收敛到统一 ThemeName。
 */
export type EditorThemeName = ThemeName

export const EDITOR_THEMES = Object.fromEntries(
  THEME_OPTIONS.map((option) => [
    option.value,
    {
      label: option.label,
      description: option.description,
      preview: option.preview,
    },
  ]),
) as Record<ThemeName, { label: string; description: string; preview: { base: string; accent: string; accentSoft: string } }>

export const useEditorThemeStore = defineStore('editor-theme', () => {
  const currentTheme = ref<ThemeName>(loadTheme() || currentThemeName)

  const themeOptions = computed(() => THEME_OPTIONS)

  const initTheme = () => {
    const resolvedTheme = loadTheme() || currentTheme.value || currentThemeName
    currentTheme.value = resolvedTheme
    initGlobalTheme(resolvedTheme)
  }

  const applyTheme = () => {
    setGlobalTheme(currentTheme.value)
  }

  const setTheme = (name: ThemeName) => {
    if (!(name in THEME_OPTIONS_MAP)) {
      return
    }
    currentTheme.value = name
    setGlobalTheme(name)
  }

  return {
    currentTheme,
    themeOptions,
    initTheme,
    setTheme,
    applyTheme,
  }
})
