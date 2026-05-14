/**
 * Qingyu 统一主题系统
 * 全局 UI 与 writer 工作区共享同一套主题真相源。
 */

export interface ColorScale {
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

export interface ThemeGradient {
  from: string
  to: string
  soft: {
    from: string
    to: string
  }
}

export interface ThemeSurfaceTokens {
  base: string
  muted: string
  elevated: string
  overlay: string
  actbar: string
}

export interface ThemeTextTokens {
  primary: string
  secondary: string
  muted: string
  ghost: string
  inverse: string
}

export interface ThemeBorderTokens {
  default: string
  light: string
  focus: string
}

export interface ThemeShadowTokens {
  sm: string
  md: string
  lg: string
  ring: string
}

export interface ThemePreviewTokens {
  base: string
  accent: string
  accentSoft: string
}

export interface ThemeEditorTokens {
  contentBg: string
  contentFg: string
  headingColor: string
  selectionBg: string
  placeholderColor: string
  linkColor: string
  codeBg: string
  codeFg: string
  blockquoteBorder: string
  blockquoteFg: string
  lineHeight: string
  fontFamily: string
}

export interface ThemeMeta {
  label: string
  description: string
  preview: ThemePreviewTokens
  editorAlias: string
}

export interface ThemeColors {
  primary: ColorScale
  secondary: ColorScale
  gradient: ThemeGradient
  success: ColorScale
  warning: ColorScale
  danger: ColorScale
  info: ColorScale
  surface: ThemeSurfaceTokens
  text: ThemeTextTokens
  border: ThemeBorderTokens
  shadow: ThemeShadowTokens
  editor: ThemeEditorTokens
  meta: ThemeMeta
}

const DEFAULT_EDITOR_FONT =
  "'Noto Serif SC', 'Source Han Serif SC', Georgia, 'Times New Roman', serif"

const SHARED_SUCCESS: ColorScale = {
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
}

const SHARED_WARNING: ColorScale = {
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
}

const SHARED_DANGER: ColorScale = {
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
}

const SHARED_INFO: ColorScale = {
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
}

export const mistTheme: ThemeColors = {
  primary: {
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
  secondary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  gradient: {
    from: '#0891b2',
    to: '#2563eb',
    soft: {
      from: '#22d3ee',
      to: '#3b82f6',
    },
  },
  success: SHARED_SUCCESS,
  warning: SHARED_WARNING,
  danger: SHARED_DANGER,
  info: SHARED_INFO,
  surface: {
    base: '#ffffff',
    muted: '#f8fafc',
    elevated: '#f1f5f9',
    overlay: '#e2e8f0',
    actbar: '#f1f5f9',
  },
  text: {
    primary: '#0f172a',
    secondary: '#334155',
    muted: '#64748b',
    ghost: '#94a3b8',
    inverse: '#ffffff',
  },
  border: {
    default: '#e2e8f0',
    light: '#f1f5f9',
    focus: '#06b6d4',
  },
  shadow: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
    md: '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.10), 0 4px 8px rgba(0, 0, 0, 0.06)',
    ring: '0 0 0 4px rgb(37 99 235 / 0.12)',
  },
  editor: {
    contentBg: '#ffffff',
    contentFg: '#1e293b',
    headingColor: '#0f172a',
    selectionBg: 'rgba(6, 182, 212, 0.15)',
    placeholderColor: '#94a3b8',
    linkColor: '#0891b2',
    codeBg: '#f1f5f9',
    codeFg: '#e11d48',
    blockquoteBorder: '#cbd5e1',
    blockquoteFg: '#64748b',
    lineHeight: '1.75',
    fontFamily: DEFAULT_EDITOR_FONT,
  },
  meta: {
    label: '雾青',
    description: '清爽中性',
    preview: {
      base: '#f8fafc',
      accent: '#06b6d4',
      accentSoft: '#ecfeff',
    },
    editorAlias: 'mist',
  },
}

export const amberTheme: ThemeColors = {
  primary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#ea7b2c',
    600: '#c75f13',
    700: '#9a4612',
    800: '#7c3712',
    900: '#632f13',
  },
  secondary: {
    50: '#fdf8f0',
    100: '#f8f0e1',
    200: '#efdfc2',
    300: '#e0c49b',
    400: '#cfa36f',
    500: '#b98953',
    600: '#9f7245',
    700: '#815c39',
    800: '#67492f',
    900: '#523b27',
  },
  gradient: {
    from: '#c75f13',
    to: '#b98953',
    soft: {
      from: '#fb923c',
      to: '#e0c49b',
    },
  },
  success: SHARED_SUCCESS,
  warning: SHARED_WARNING,
  danger: SHARED_DANGER,
  info: SHARED_INFO,
  surface: {
    base: '#faf6f0',
    muted: '#f5ede0',
    elevated: '#efe5d3',
    overlay: '#e2d5c3',
    actbar: '#f0e8d8',
  },
  text: {
    primary: '#3e2c1c',
    secondary: '#5c4833',
    muted: '#8b7355',
    ghost: '#b09e82',
    inverse: '#faf6f0',
  },
  border: {
    default: '#e2d5c3',
    light: '#efe5d3',
    focus: '#c47a2a',
  },
  shadow: {
    sm: '0 1px 3px rgba(62, 44, 28, 0.06), 0 1px 2px rgba(62, 44, 28, 0.04)',
    md: '0 4px 12px rgba(62, 44, 28, 0.08), 0 2px 4px rgba(62, 44, 28, 0.04)',
    lg: '0 8px 24px rgba(62, 44, 28, 0.10), 0 4px 8px rgba(62, 44, 28, 0.06)',
    ring: '0 0 0 4px rgba(196, 122, 42, 0.16)',
  },
  editor: {
    contentBg: '#fdf8f0',
    contentFg: '#3e2c1c',
    headingColor: '#2a1e10',
    selectionBg: 'rgba(196, 122, 42, 0.18)',
    placeholderColor: '#b09e82',
    linkColor: '#a8651e',
    codeBg: '#f0e8d8',
    codeFg: '#9a3412',
    blockquoteBorder: '#d4c4a8',
    blockquoteFg: '#8b7355',
    lineHeight: '1.8',
    fontFamily: DEFAULT_EDITOR_FONT,
  },
  meta: {
    label: '暖砂',
    description: '长文护眼',
    preview: {
      base: '#faf6f0',
      accent: '#c47a2a',
      accentSoft: '#f5ede0',
    },
    editorAlias: 'amber',
  },
}

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
    500: '#0f9f73',
    600: '#0d7f5c',
    700: '#0b654a',
    800: '#0b503c',
    900: '#0d3d2f',
  },
  gradient: {
    from: '#166534',
    to: '#0f766e',
    soft: {
      from: '#4ade80',
      to: '#2dd4bf',
    },
  },
  success: SHARED_SUCCESS,
  warning: SHARED_WARNING,
  danger: SHARED_DANGER,
  info: SHARED_INFO,
  surface: {
    base: '#f7faf8',
    muted: '#eef6f1',
    elevated: '#e4efe8',
    overlay: '#d2dfd6',
    actbar: '#eef6f1',
  },
  text: {
    primary: '#163025',
    secondary: '#274739',
    muted: '#537062',
    ghost: '#8ba194',
    inverse: '#f7faf8',
  },
  border: {
    default: '#d6e3da',
    light: '#e7efe9',
    focus: '#15803d',
  },
  shadow: {
    sm: '0 1px 3px rgba(17, 39, 31, 0.06), 0 1px 2px rgba(17, 39, 31, 0.04)',
    md: '0 4px 12px rgba(17, 39, 31, 0.08), 0 2px 4px rgba(17, 39, 31, 0.04)',
    lg: '0 10px 24px rgba(17, 39, 31, 0.10), 0 4px 8px rgba(17, 39, 31, 0.06)',
    ring: '0 0 0 4px rgba(21, 128, 61, 0.14)',
  },
  editor: {
    contentBg: '#f7faf8',
    contentFg: '#1d352b',
    headingColor: '#163025',
    selectionBg: 'rgba(21, 128, 61, 0.16)',
    placeholderColor: '#8ba194',
    linkColor: '#166534',
    codeBg: '#e8f3ec',
    codeFg: '#0f766e',
    blockquoteBorder: '#bdd5c4',
    blockquoteFg: '#537062',
    lineHeight: '1.8',
    fontFamily: DEFAULT_EDITOR_FONT,
  },
  meta: {
    label: '松墨',
    description: '沉稳专注',
    preview: {
      base: '#f7faf8',
      accent: '#15803d',
      accentSoft: '#eef6f1',
    },
    editorAlias: 'forest',
  },
}

export const graphiteTheme: ThemeColors = {
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },
  secondary: {
    50: '#f1f5f9',
    100: '#e2e8f0',
    200: '#cbd5e1',
    300: '#94a3b8',
    400: '#64748b',
    500: '#475569',
    600: '#334155',
    700: '#1e293b',
    800: '#0f172a',
    900: '#020617',
  },
  gradient: {
    from: '#312e81',
    to: '#334155',
    soft: {
      from: '#818cf8',
      to: '#64748b',
    },
  },
  success: SHARED_SUCCESS,
  warning: SHARED_WARNING,
  danger: SHARED_DANGER,
  info: SHARED_INFO,
  surface: {
    base: '#0f172a',
    muted: '#111c32',
    elevated: '#1a2741',
    overlay: '#24324d',
    actbar: '#111827',
  },
  text: {
    primary: '#e2e8f0',
    secondary: '#cbd5e1',
    muted: '#94a3b8',
    ghost: '#64748b',
    inverse: '#0f172a',
  },
  border: {
    default: '#23314c',
    light: '#31415f',
    focus: '#818cf8',
  },
  shadow: {
    sm: '0 1px 3px rgba(2, 6, 23, 0.32)',
    md: '0 4px 12px rgba(2, 6, 23, 0.4)',
    lg: '0 8px 24px rgba(2, 6, 23, 0.52)',
    ring: '0 0 0 4px rgba(99, 102, 241, 0.18)',
  },
  editor: {
    contentBg: '#0f172a',
    contentFg: '#dbe4f0',
    headingColor: '#f8fafc',
    selectionBg: 'rgba(99, 102, 241, 0.22)',
    placeholderColor: '#64748b',
    linkColor: '#a5b4fc',
    codeBg: '#1e293b',
    codeFg: '#f9a8d4',
    blockquoteBorder: '#334155',
    blockquoteFg: '#94a3b8',
    lineHeight: '1.75',
    fontFamily: DEFAULT_EDITOR_FONT,
  },
  meta: {
    label: '石墨',
    description: '低光沉浸',
    preview: {
      base: '#0f172a',
      accent: '#818cf8',
      accentSoft: '#1a2741',
    },
    editorAlias: 'graphite',
  },
}

export const themes = {
  mist: mistTheme,
  amber: amberTheme,
  forest: forestTheme,
  graphite: graphiteTheme,
}

export type ThemeName = keyof typeof themes

export type LegacyThemeName = 'qingyu' | 'berry'
export type LegacyEditorThemeName = 'light' | 'sepia' | 'dark' | 'focus'

export interface ThemeOption {
  value: ThemeName
  label: string
  description: string
  preview: ThemePreviewTokens
  editorAlias: string
}

export const THEME_OPTIONS: ThemeOption[] = Object.entries(themes).map(([value, theme]) => ({
  value: value as ThemeName,
  label: theme.meta.label,
  description: theme.meta.description,
  preview: theme.meta.preview,
  editorAlias: theme.meta.editorAlias,
}))

export const THEME_OPTIONS_MAP: Record<ThemeName, ThemeOption> = THEME_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = option
    return acc
  },
  {} as Record<ThemeName, ThemeOption>,
)

export const qingyuTheme = mistTheme
export const berryTheme = amberTheme

export let currentTheme: ThemeColors = mistTheme
export let currentThemeName: ThemeName = 'mist'

const THEME_STORAGE_KEY = 'qingyu-theme'
const LEGACY_EDITOR_THEME_STORAGE_KEY = 'qingyu-editor-theme'

const LEGACY_THEME_NAME_MAP: Record<LegacyThemeName, ThemeName> = {
  qingyu: 'mist',
  berry: 'amber',
}

const LEGACY_EDITOR_THEME_MAP: Record<LegacyEditorThemeName, ThemeName> = {
  light: 'mist',
  sepia: 'amber',
  dark: 'graphite',
  focus: 'forest',
}

function hexToRgb(hex: string): string | null {
  const cleanHex = hex.replace('#', '')
  const fullHex =
    cleanHex.length === 3 ? cleanHex.split('').map((value) => value + value).join('') : cleanHex
  if (!/^[0-9A-Fa-f]{6}$/.test(fullHex)) {
    return null
  }

  const r = parseInt(fullHex.slice(0, 2), 16)
  const g = parseInt(fullHex.slice(2, 4), 16)
  const b = parseInt(fullHex.slice(4, 6), 16)
  return `${r}, ${g}, ${b}`
}

function applyDOMThemeState(themeName: ThemeName) {
  const root = document.documentElement
  const body = document.body
  const option = THEME_OPTIONS_MAP[themeName]
  root.dataset.theme = themeName
  root.setAttribute('data-editor-theme', option.editorAlias)
  root.style.setProperty('color-scheme', themeName === 'graphite' ? 'dark' : 'light')
  if (body) {
    body.dataset.theme = themeName
    body.setAttribute('data-editor-theme', option.editorAlias)
  }

  const workspaceTargets = document.querySelectorAll('.workspace-studio, .writer-editor-shell')
  workspaceTargets.forEach((element) => {
    ;(element as HTMLElement).setAttribute('data-editor-theme', option.editorAlias)
    ;(element as HTMLElement).dataset.theme = themeName
  })
}

function updateCSSVariables(theme: ThemeColors): void {
  const root = document.documentElement

  const setScale = (prefix: string, scale: ColorScale) => {
    root.style.setProperty(`--${prefix}-50`, scale[50])
    root.style.setProperty(`--${prefix}-100`, scale[100])
    root.style.setProperty(`--${prefix}-200`, scale[200])
    root.style.setProperty(`--${prefix}-300`, scale[300])
    root.style.setProperty(`--${prefix}-400`, scale[400])
    root.style.setProperty(`--${prefix}-500`, scale[500])
    root.style.setProperty(`--${prefix}-600`, scale[600])
    root.style.setProperty(`--${prefix}-700`, scale[700])
    root.style.setProperty(`--${prefix}-800`, scale[800])
    root.style.setProperty(`--${prefix}-900`, scale[900])
  }

  setScale('color-primary', theme.primary)
  setScale('color-secondary', theme.secondary)
  setScale('color-success', theme.success)
  setScale('color-warning', theme.warning)
  setScale('color-danger', theme.danger)
  setScale('color-info', theme.info)

  root.style.setProperty('--color-primary-500-rgb', hexToRgb(theme.primary[500]) || '6, 182, 212')
  root.style.setProperty(
    '--color-secondary-500-rgb',
    hexToRgb(theme.secondary[500]) || '59, 130, 246',
  )
  root.style.setProperty('--gradient-from', theme.gradient.from)
  root.style.setProperty('--gradient-to', theme.gradient.to)
  root.style.setProperty('--gradient-soft-from', theme.gradient.soft.from)
  root.style.setProperty('--gradient-soft-to', theme.gradient.soft.to)

  root.style.setProperty('--color-ink-primary', theme.text.primary)
  root.style.setProperty('--color-ink-secondary', theme.text.secondary)
  root.style.setProperty('--color-ink-tertiary', theme.text.muted)
  root.style.setProperty('--color-surface-base', theme.surface.base)
  root.style.setProperty('--color-surface-muted', theme.surface.muted)
  root.style.setProperty('--color-surface-elevated', theme.surface.elevated)
  root.style.setProperty('--color-surface-glass', theme.surface.overlay)
  root.style.setProperty('--color-line-soft', theme.border.default)
  root.style.setProperty('--color-line-strong', theme.border.light)
  root.style.setProperty('--shadow-card', theme.shadow.lg)
  root.style.setProperty('--shadow-control', theme.shadow.sm)
  root.style.setProperty('--ring-brand', theme.shadow.ring)

  root.style.setProperty('--theme-surface-base', theme.surface.base)
  root.style.setProperty('--theme-surface-muted', theme.surface.muted)
  root.style.setProperty('--theme-surface-elevated', theme.surface.elevated)
  root.style.setProperty('--theme-surface-overlay', theme.surface.overlay)
  root.style.setProperty('--theme-surface-actbar', theme.surface.actbar)
  root.style.setProperty('--theme-text-primary', theme.text.primary)
  root.style.setProperty('--theme-text-secondary', theme.text.secondary)
  root.style.setProperty('--theme-text-muted', theme.text.muted)
  root.style.setProperty('--theme-text-ghost', theme.text.ghost)
  root.style.setProperty('--theme-text-inverse', theme.text.inverse)
  root.style.setProperty('--theme-border-default', theme.border.default)
  root.style.setProperty('--theme-border-light', theme.border.light)
  root.style.setProperty('--theme-border-focus', theme.border.focus)
  root.style.setProperty('--theme-accent', theme.primary[500])
  root.style.setProperty('--theme-accent-hover', theme.primary[600])
  root.style.setProperty('--theme-accent-soft', theme.primary[50])
  root.style.setProperty('--theme-accent-soft-border', theme.primary[200])
  root.style.setProperty('--theme-shadow-sm', theme.shadow.sm)
  root.style.setProperty('--theme-shadow-md', theme.shadow.md)
  root.style.setProperty('--theme-shadow-lg', theme.shadow.lg)
  root.style.setProperty('--theme-ring', theme.shadow.ring)

  root.style.setProperty('--theme-editor-content-bg', theme.editor.contentBg)
  root.style.setProperty('--theme-editor-content-fg', theme.editor.contentFg)
  root.style.setProperty('--theme-editor-heading-color', theme.editor.headingColor)
  root.style.setProperty('--theme-editor-selection-bg', theme.editor.selectionBg)
  root.style.setProperty('--theme-editor-placeholder-color', theme.editor.placeholderColor)
  root.style.setProperty('--theme-editor-link-color', theme.editor.linkColor)
  root.style.setProperty('--theme-editor-code-bg', theme.editor.codeBg)
  root.style.setProperty('--theme-editor-code-fg', theme.editor.codeFg)
  root.style.setProperty('--theme-editor-blockquote-border', theme.editor.blockquoteBorder)
  root.style.setProperty('--theme-editor-blockquote-fg', theme.editor.blockquoteFg)
  root.style.setProperty('--theme-editor-line-height', theme.editor.lineHeight)
  root.style.setProperty('--theme-editor-font-family', theme.editor.fontFamily)
}

export function isValidThemeName(name: string): name is ThemeName {
  return name in themes
}

function resolveThemeName(name: string | null): ThemeName | null {
  if (!name) {
    return null
  }
  if (isValidThemeName(name)) {
    return name
  }
  if (name in LEGACY_THEME_NAME_MAP) {
    return LEGACY_THEME_NAME_MAP[name as LegacyThemeName]
  }
  if (name in LEGACY_EDITOR_THEME_MAP) {
    return LEGACY_EDITOR_THEME_MAP[name as LegacyEditorThemeName]
  }
  return null
}

export function loadTheme(): ThemeName | null {
  try {
    const savedTheme = resolveThemeName(localStorage.getItem(THEME_STORAGE_KEY))
    if (savedTheme) {
      if (savedTheme !== localStorage.getItem(THEME_STORAGE_KEY)) {
        localStorage.setItem(THEME_STORAGE_KEY, savedTheme)
      }
      return savedTheme
    }

    const legacyEditorTheme = resolveThemeName(localStorage.getItem(LEGACY_EDITOR_THEME_STORAGE_KEY))
    if (legacyEditorTheme) {
      localStorage.setItem(THEME_STORAGE_KEY, legacyEditorTheme)
      return legacyEditorTheme
    }

    return null
  } catch (error) {
    console.warn('Failed to load theme preference:', error)
    return null
  }
}

export function saveTheme(themeName: ThemeName): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeName)
    localStorage.removeItem(LEGACY_EDITOR_THEME_STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to save theme preference:', error)
  }
}

export function clearTheme(): void {
  try {
    localStorage.removeItem(THEME_STORAGE_KEY)
    localStorage.removeItem(LEGACY_EDITOR_THEME_STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear theme preference:', error)
  }
}

export function setTheme(themeName: ThemeName): void {
  const theme = themes[themeName]
  if (!theme) {
    console.error(`Theme "${themeName}" not found`)
    return
  }

  document.documentElement.classList.add('theme-switching')
  requestAnimationFrame(() => {
    updateCSSVariables(theme)
    applyDOMThemeState(themeName)
    currentThemeName = themeName
    currentTheme = theme
    saveTheme(themeName)

    requestAnimationFrame(() => {
      document.documentElement.classList.remove('theme-switching')
    })
  })
}

export function initTheme(defaultThemeName: ThemeName = 'mist'): void {
  const savedTheme = loadTheme()
  setTheme(savedTheme || defaultThemeName)
}

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
