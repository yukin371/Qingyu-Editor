import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type EditorFontFamily = 'serif' | 'sans'

interface EditorAppearanceSnapshot {
  fontSize: number
  lineHeight: number
  contentWidth: number
  compactToolbar: boolean
  fontFamily: EditorFontFamily
}

const STORAGE_KEY = 'qingyu-editor-appearance'

const DEFAULT_APPEARANCE: EditorAppearanceSnapshot = {
  fontSize: 19,
  lineHeight: 1.95,
  contentWidth: 860,
  compactToolbar: true,
  fontFamily: 'serif',
}

function clamp(value: unknown, min: number, max: number, fallback: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback
  return Math.max(min, Math.min(max, value))
}

function loadSnapshot(): EditorAppearanceSnapshot {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_APPEARANCE
    const parsed = JSON.parse(raw) as Partial<EditorAppearanceSnapshot>
    return {
      fontSize: Math.round(clamp(parsed.fontSize, 16, 26, DEFAULT_APPEARANCE.fontSize)),
      lineHeight: Number(clamp(parsed.lineHeight, 1.6, 2.4, DEFAULT_APPEARANCE.lineHeight).toFixed(2)),
      contentWidth: Math.round(clamp(parsed.contentWidth, 680, 1080, DEFAULT_APPEARANCE.contentWidth)),
      compactToolbar:
        typeof parsed.compactToolbar === 'boolean'
          ? parsed.compactToolbar
          : DEFAULT_APPEARANCE.compactToolbar,
      fontFamily:
        parsed.fontFamily === 'sans' || parsed.fontFamily === 'serif'
          ? parsed.fontFamily
          : DEFAULT_APPEARANCE.fontFamily,
    }
  } catch {
    return DEFAULT_APPEARANCE
  }
}

export const useEditorAppearanceStore = defineStore('writer-editor-appearance', () => {
  const snapshot = ref<EditorAppearanceSnapshot>(loadSnapshot())

  const saveSnapshot = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot.value))
    } catch {
      // ignore localStorage failures
    }
  }

  const fontSize = computed({
    get: () => snapshot.value.fontSize,
    set: (value: number) => {
      snapshot.value.fontSize = Math.round(clamp(value, 16, 26, DEFAULT_APPEARANCE.fontSize))
      saveSnapshot()
    },
  })

  const lineHeight = computed({
    get: () => snapshot.value.lineHeight,
    set: (value: number) => {
      snapshot.value.lineHeight = Number(
        clamp(value, 1.6, 2.4, DEFAULT_APPEARANCE.lineHeight).toFixed(2),
      )
      saveSnapshot()
    },
  })

  const contentWidth = computed({
    get: () => snapshot.value.contentWidth,
    set: (value: number) => {
      snapshot.value.contentWidth = Math.round(
        clamp(value, 680, 1080, DEFAULT_APPEARANCE.contentWidth),
      )
      saveSnapshot()
    },
  })

  const compactToolbar = computed({
    get: () => snapshot.value.compactToolbar,
    set: (value: boolean) => {
      snapshot.value.compactToolbar = Boolean(value)
      saveSnapshot()
    },
  })

  const fontFamily = computed({
    get: () => snapshot.value.fontFamily,
    set: (value: EditorFontFamily) => {
      snapshot.value.fontFamily = value === 'sans' ? 'sans' : 'serif'
      saveSnapshot()
    },
  })

  const cssVariables = computed<Record<string, string>>(() => ({
    '--writer-font-size': `${snapshot.value.fontSize}px`,
    '--writer-line-height': String(snapshot.value.lineHeight),
    '--writer-content-width': `${snapshot.value.contentWidth}px`,
    '--writer-font-family':
      snapshot.value.fontFamily === 'sans'
        ? '"Source Han Sans SC", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif'
        : '"Source Han Serif SC", "Noto Serif SC", "Songti SC", "STSong", serif',
  }))

  const initAppearance = () => {
    snapshot.value = loadSnapshot()
  }

  const resetAppearance = () => {
    snapshot.value = { ...DEFAULT_APPEARANCE }
    saveSnapshot()
  }

  return {
    fontSize,
    lineHeight,
    contentWidth,
    compactToolbar,
    fontFamily,
    cssVariables,
    initAppearance,
    resetAppearance,
  }
})
