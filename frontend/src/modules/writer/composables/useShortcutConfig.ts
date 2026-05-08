import { onMounted, onUnmounted, ref } from 'vue'
import type { Shortcut, ShortcutCategory } from '../types/editor'
import { editorApi } from '../api/editor'
import {
  WORKSPACE_SHORTCUT_DEFAULTS,
  WORKSPACE_SYSTEM_SHORTCUT_IDS,
} from './workspaceShortcutActions'

// =======================
// 常量
// =======================

const STORAGE_KEY = 'qingyu_shortcut_config'

/** 系统级快捷键 ID 前缀（不可修改） */
const SYSTEM_SHORTCUT_IDS = WORKSPACE_SYSTEM_SHORTCUT_IDS

/**
 * 默认快捷键列表
 * @description 包含导航、编辑器、AI、工具四大分类的默认快捷键
 */
export const DEFAULT_SHORTCUTS: Shortcut[] = [
  // Navigation
  { id: 'workspace.save', keys: ['Ctrl', 'S'], description: '保存文档', category: 'navigation' },
  { id: 'workspace.undo', keys: ['Ctrl', 'Z'], description: '撤销', category: 'navigation' },
  { id: 'workspace.redo', keys: ['Ctrl', 'Y'], description: '重做', category: 'navigation' },
  {
    id: 'workspace.toggleLeftPanel',
    keys: ['Ctrl', '['],
    description: '折叠/展开左侧面板',
    category: 'navigation',
  },
  {
    id: 'workspace.toggleRightPanel',
    keys: ['Ctrl', ']'],
    description: '折叠/展开右侧面板',
    category: 'navigation',
  },
  { id: 'workspace.focusMode', keys: ['F11'], description: '专注模式', category: 'navigation' },
  // Editor
  { id: 'editor.bold', keys: ['Ctrl', 'B'], description: '粗体', category: 'editor' },
  { id: 'editor.italic', keys: ['Ctrl', 'I'], description: '斜体', category: 'editor' },
  { id: 'editor.link', keys: ['Ctrl', 'K'], description: '插入链接', category: 'editor' },
  { id: 'editor.insertTab', keys: ['Tab'], description: '插入缩进', category: 'editor' },
  // AI
  { id: 'ai.ask', keys: ['Ctrl', 'K'], description: 'AI 对话', category: 'ai' },
  { id: 'ai.continue', keys: ['Ctrl', 'Shift', 'K'], description: 'AI 续写', category: 'ai' },
  { id: 'ai.polish', keys: ['Ctrl', 'Shift', 'P'], description: 'AI 润色', category: 'ai' },
  ...WORKSPACE_SHORTCUT_DEFAULTS,
]

// =======================
// 工具函数
// =======================

/**
 * 判断是否为系统快捷键（不可修改）
 */
function isSystemShortcut(actionId: string): boolean {
  return SYSTEM_SHORTCUT_IDS.some((prefix) => actionId.startsWith(prefix))
}

/**
 * 将快捷键组合排序后拼接，用于比较
 * ['Ctrl', 'S'] -> 'ctrl+s'
 */
function normalizeKeyCombo(keys: string[]): string {
  return [...keys]
    .sort()
    .map((k) => k.toLowerCase())
    .join('+')
}

/**
 * 将键名数组格式化为可读字符串
 * ['Ctrl', 'S'] -> 'Ctrl+S'
 */
function formatKeys(keys: string[]): string {
  return keys.join('+')
}

/**
 * 判断 KeyboardEvent 是否匹配指定的快捷键组合
 * @description 支持跨平台：Cmd (Meta) 等同于 Ctrl
 */
function matchKeyEvent(event: KeyboardEvent, keys: string[]): boolean {
  for (const key of keys) {
    const lower = key.toLowerCase()

    if (lower === 'ctrl') {
      if (!event.ctrlKey && !event.metaKey) return false
    } else if (lower === 'meta') {
      if (!event.ctrlKey && !event.metaKey) return false
    } else if (lower === 'shift') {
      if (!event.shiftKey) return false
    } else if (lower === 'alt') {
      if (!event.altKey) return false
    } else if (key === 'Escape' || key === 'F11' || key === 'Tab') {
      if (event.key !== key) return false
    } else {
      // 单个字母，如 'S'
      if (event.key.toLowerCase() !== lower) return false
    }
  }

  // 反向校验：确保没有多余的修饰键被按下
  // 统计 keys 中声明的修饰键数量，与事件中实际按下的修饰键数量比较
  const declaredModifiers = keys.filter((k) =>
    ['ctrl', 'meta', 'shift', 'alt'].includes(k.toLowerCase()),
  ).length
  const activeModifiers = [event.ctrlKey || event.metaKey, event.shiftKey, event.altKey].filter(
    Boolean,
  ).length

  // 如果声明了修饰键，需要精确匹配
  if (declaredModifiers > 0 && activeModifiers !== declaredModifiers) {
    return false
  }

  return true
}

/**
 * 从默认列表构建 Record<string, Shortcut>
 */
function buildDefaultRecord(): Record<string, Shortcut> {
  const record: Record<string, Shortcut> = {}
  for (const s of DEFAULT_SHORTCUTS) {
    record[s.id] = { ...s }
  }
  return record
}

/**
 * 从 localStorage 读取缓存
 */
function loadFromCache(): Record<string, Shortcut> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && 'shortcuts' in parsed) {
      return parsed.shortcuts as Record<string, Shortcut>
    }
    return null
  } catch {
    return null
  }
}

/**
 * 写入 localStorage 缓存
 */
function saveToCache(shortcuts: Record<string, Shortcut>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ shortcuts }))
  } catch {
    // localStorage 不可用时静默忽略
  }
}

// =======================
// Composable
// =======================

/**
 * 快捷键配置管理
 * @description 提供快捷键的加载、修改、冲突检测、事件绑定等功能
 */
export function useShortcutConfig() {
  const shortcuts = ref<Record<string, Shortcut>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 已注册的键盘事件处理器
  const handlers = new Map<string, (e: KeyboardEvent) => void>()

  /**
   * 加载快捷键配置
   * 优先级：localStorage -> 后端 API -> 默认值
   */
  async function loadShortcuts(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      // 1. 先尝试 localStorage 缓存
      const cached = loadFromCache()
      if (cached && Object.keys(cached).length > 0) {
        // Sanitize: ensure all shortcuts have valid keys array
        for (const [id, s] of Object.entries(cached)) {
          if (!Array.isArray(s.keys)) {
            const defaultShortcut = DEFAULT_SHORTCUTS.find((d) => d.id === id)
            s.keys = defaultShortcut?.keys ?? []
          }
        }
        shortcuts.value = cached
      }

      // 2. 从后端获取最新配置
      try {
        const res = await editorApi.getShortcuts()
        const data = (res as any)?.data ?? res
        if (data && data.shortcuts && Object.keys(data.shortcuts).length > 0) {
          // Sanitize: ensure all shortcuts from API have valid keys array
          const apiShortcuts = data.shortcuts as Record<string, Shortcut>
          for (const [id, s] of Object.entries(apiShortcuts)) {
            if (!Array.isArray(s.keys)) {
              const defaultShortcut = DEFAULT_SHORTCUTS.find((d) => d.id === id)
              s.keys = defaultShortcut?.keys ?? []
            }
          }
          shortcuts.value = apiShortcuts
          saveToCache(apiShortcuts)
        } else if (!cached) {
          // API 返回空且无缓存，使用默认值
          shortcuts.value = buildDefaultRecord()
        }
      } catch (apiErr) {
        // API 调用失败，如果已有缓存则保留，否则用默认值
        if (!cached || Object.keys(cached).length === 0) {
          shortcuts.value = buildDefaultRecord()
        }
        // 不阻塞流程，仅在控制台记录
        console.warn('[useShortcutConfig] 加载远程快捷键失败，使用缓存/默认值:', apiErr)
      }
    } catch (err) {
      error.value = '加载快捷键配置失败'
      shortcuts.value = buildDefaultRecord()
      console.error('[useShortcutConfig] loadShortcuts error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取指定动作的当前快捷键组合
   */
  function getKeyCombo(actionId: string): string[] {
    const shortcut = shortcuts.value[actionId]
    return shortcut ? [...shortcut.keys] : []
  }

  /**
   * 检测快捷键冲突
   * @returns 冲突的快捷键对象，无冲突返回 null
   */
  function detectConflict(actionId: string, keys: string[]): Shortcut | null {
    const normalized = normalizeKeyCombo(keys)

    for (const [id, shortcut] of Object.entries(shortcuts.value)) {
      if (id === actionId) continue
      if (normalizeKeyCombo(shortcut.keys) === normalized) {
        return shortcut
      }
    }

    return null
  }

  /**
   * 设置快捷键
   * @returns true 设置成功，false 冲突或系统快捷键
   */
  function setShortcut(actionId: string, keys: string[]): boolean {
    // 系统快捷键不可修改
    if (isSystemShortcut(actionId)) {
      return false
    }

    // 检测冲突
    const conflict = detectConflict(actionId, keys)
    if (conflict) {
      return false
    }

    // 更新本地状态
    const existing = shortcuts.value[actionId]
    shortcuts.value = {
      ...shortcuts.value,
      [actionId]: {
        ...existing,
        id: actionId,
        keys: [...keys],
        description: existing?.description ?? '',
        category: existing?.category ?? '',
        isCustom: true,
      },
    }

    // 更新缓存
    saveToCache(shortcuts.value)

    // 异步同步到后端（不阻塞）
    editorApi.updateShortcuts({ shortcuts: shortcuts.value }).catch((err: unknown) => {
      console.warn('[useShortcutConfig] 同步快捷键到后端失败:', err)
    })

    return true
  }

  /**
   * 重置为默认快捷键
   */
  async function resetToDefaults(): Promise<void> {
    try {
      await editorApi.resetShortcuts()
      shortcuts.value = buildDefaultRecord()
      saveToCache(shortcuts.value)
      error.value = null
    } catch (err) {
      error.value = '重置快捷键失败'
      console.error('[useShortcutConfig] resetToDefaults error:', err)
      throw err
    }
  }

  /**
   * 获取所有快捷键冲突对
   */
  function getAllConflicts(): Array<{ action1: Shortcut; action2: Shortcut }> {
    const conflicts: Array<{ action1: Shortcut; action2: Shortcut }> = []
    const comboMap = new Map<string, Shortcut>()

    for (const shortcut of Object.values(shortcuts.value)) {
      const normalized = normalizeKeyCombo(shortcut.keys)
      const existing = comboMap.get(normalized)
      if (existing) {
        conflicts.push({ action1: existing, action2: shortcut })
      } else {
        comboMap.set(normalized, shortcut)
      }
    }

    return conflicts
  }

  /**
   * 按分类分组快捷键
   */
  function getShortcutsByCategory(): ShortcutCategory[] {
    const categoryMap = new Map<string, Shortcut[]>()

    for (const shortcut of Object.values(shortcuts.value)) {
      const cat = shortcut.category || 'other'
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, [])
      }
      categoryMap.get(cat)!.push(shortcut)
    }

    const categoryTitles: Record<string, string> = {
      navigation: '导航',
      editor: '编辑器',
      ai: 'AI',
      tool: '工具',
      other: '其他',
    }

    return Array.from(categoryMap.entries()).map(([name, shortcutsList]) => ({
      name,
      title: categoryTitles[name] ?? name,
      shortcuts: shortcutsList,
    }))
  }

  /**
   * 注册键盘事件处理器
   * @param actionId 动作 ID，匹配 shortcuts 中的 id
   * @param handler 键盘事件处理函数
   * @returns 取消注册的函数
   */
  function registerHandler(actionId: string, handler: (e: KeyboardEvent) => void): () => void {
    const wrappedHandler = (e: KeyboardEvent) => {
      const keys = getKeyCombo(actionId)
      if (keys.length > 0 && matchKeyEvent(e, keys)) {
        handler(e)
      }
    }

    handlers.set(actionId, wrappedHandler)
    document.addEventListener('keydown', wrappedHandler)

    return () => {
      const current = handlers.get(actionId)
      if (current) {
        document.removeEventListener('keydown', current)
        handlers.delete(actionId)
      }
    }
  }

  onMounted(() => {
    // 初始化时自动加载
    loadShortcuts()
  })

  onUnmounted(() => {
    // 清理所有已注册的处理器
    for (const handler of Array.from(handlers.values())) {
      document.removeEventListener('keydown', handler)
    }
    handlers.clear()
  })

  return {
    // State
    shortcuts,
    loading,
    error,

    // Core methods
    loadShortcuts,
    getKeyCombo,
    setShortcut,
    detectConflict,
    resetToDefaults,
    getAllConflicts,
    getShortcutsByCategory,

    // Keyboard event handling
    registerHandler,
    formatKeys,
    keysToString: formatKeys,
  }
}
