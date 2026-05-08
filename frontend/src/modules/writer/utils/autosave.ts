/**
 * 自动保存管理器
 * 用于管理文档的自动保存、防抖和版本冲突检测
 */

export interface Draft {
  id: string
  content: string
  title: string
  version: number
  timestamp: number
}

export interface AutoSaveOptions {
  interval?: number // 自动保存间隔，单位毫秒
  debounceDelay?: number // 输入防抖时间，单位毫秒
  storageKey?: string // localStorage key前缀
  onSave?: (draft: Draft) => Promise<void> // 保存回调
  onConflict?: (localVersion: number, serverVersion: number) => void // 冲突回调
}

export class AutoSaveManager {
  private options: Required<AutoSaveOptions>
  private autoSaveTimer: ReturnType<typeof setInterval> | null = null
  private debounceTimer: ReturnType<typeof setTimeout> | null = null
  private currentDraft: Draft | null = null
  private isActive = false

  constructor(options: AutoSaveOptions = {}) {
    this.options = {
      interval: options.interval ?? 30000, // 默认30秒
      debounceDelay: options.debounceDelay ?? 300, // 默认300ms
      storageKey: options.storageKey ?? 'editor_draft',
      onSave: options.onSave ?? this.defaultSaveHandler,
      onConflict: options.onConflict ?? this.defaultConflictHandler
    }
  }

  /**
   * 启动自动保存
   */
  start(docId: string, content: string, version: number, title: string = '未命名文档') {
    this.isActive = true
    this.currentDraft = {
      id: docId,
      content,
      title,
      version,
      timestamp: Date.now()
    }

    // 尝试从本地存储恢复
    this.loadFromStorage(docId)

    // 启动定时保存
    this.startAutoSaveInterval()
  }

  /**
   * 停止自动保存
   */
  stop() {
    this.isActive = false
    this.clearTimers()
  }

  /**
   * 内容变化时调用
   */
  onContentChange(docId: string, content: string, title: string) {
    if (!this.isActive || !this.currentDraft || this.currentDraft.id !== docId) {
      return
    }

    this.currentDraft.content = content
    this.currentDraft.title = title
    this.currentDraft.timestamp = Date.now()

    // 保存到本地存储
    this.saveToStorage()

    // 清除之前的防抖定时器
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    // 设置新的防抖定时器
    this.debounceTimer = setTimeout(() => {
      this.save()
    }, this.options.debounceDelay)
  }

  /**
   * 立即保存
   */
  async saveNow(docId: string, content: string, title: string): Promise<boolean> {
    if (!this.currentDraft) {
      this.currentDraft = {
        id: docId,
        content,
        title,
        version: 0,
        timestamp: Date.now()
      }
    } else {
      this.currentDraft.content = content
      this.currentDraft.title = title
      this.currentDraft.timestamp = Date.now()
    }

    return await this.save()
  }

  /**
   * 执行保存
   */
  private async save(): Promise<boolean> {
    if (!this.currentDraft || !this.isActive) {
      return false
    }

    try {
      await this.options.onSave(this.currentDraft)
      this.currentDraft.version++
      this.saveToStorage()
      return true
    } catch (error) {
      console.error('Auto save failed:', error)
      return false
    }
  }

  /**
   * 启动自动保存定时器
   */
  private startAutoSaveInterval() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer)
    }

    this.autoSaveTimer = setInterval(() => {
      if (this.isActive && this.currentDraft) {
        this.save()
      }
    }, this.options.interval)
  }

  /**
   * 清除所有定时器
   */
  private clearTimers() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer)
      this.autoSaveTimer = null
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
  }

  /**
   * 保存到本地存储
   */
  private saveToStorage() {
    if (!this.currentDraft) return

    try {
      const key = `${this.options.storageKey}_${this.currentDraft.id}`
      localStorage.setItem(key, JSON.stringify(this.currentDraft))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  /**
   * 从本地存储加载
   */
  private loadFromStorage(docId: string): Draft | null {
    try {
      const key = `${this.options.storageKey}_${docId}`
      const data = localStorage.getItem(key)
      if (data) {
        const draft = JSON.parse(data) as Draft

        // 检查是否有更新的草稿
        if (this.currentDraft && draft.timestamp > this.currentDraft.timestamp) {
          this.currentDraft = draft
          return draft
        }
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
    }
    return null
  }

  /**
   * 清除本地存储的草稿
   */
  clearStorage(docId: string) {
    try {
      const key = `${this.options.storageKey}_${docId}`
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
    }
  }

  /**
   * 获取所有草稿列表
   */
  getAllDrafts(): Draft[] {
    const drafts: Draft[] = []
    try {
      const prefix = this.options.storageKey + '_'
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(prefix)) {
          const data = localStorage.getItem(key)
          if (data) {
            drafts.push(JSON.parse(data))
          }
        }
      }
    } catch (error) {
      console.error('Failed to get drafts:', error)
    }
    return drafts.sort((a, b) => b.timestamp - a.timestamp)
  }

  /**
   * 检查版本冲突
   */
  checkConflict(serverVersion: number): boolean {
    if (!this.currentDraft) return false

    if (serverVersion > this.currentDraft.version) {
      this.options.onConflict(this.currentDraft.version, serverVersion)
      return true
    }
    return false
  }

  /**
   * 默认保存处理器
   */
  private defaultSaveHandler = async (draft: Draft) => {
    console.log('Saving draft:', draft.id, draft.title)
    // 默认只保存到本地存储
    return Promise.resolve()
  }

  /**
   * 默认冲突处理器
   */
  private defaultConflictHandler = (localVersion: number, serverVersion: number) => {
    console.warn('Version conflict detected:', {
      local: localVersion,
      server: serverVersion
    })
  }

  /**
   * 获取当前草稿
   */
  getCurrentDraft(): Draft | null {
    return this.currentDraft
  }

  /**
   * 获取字数统计
   */
  getWordCount(): number {
    if (!this.currentDraft) return 0
    return this.currentDraft.content.replace(/[\s\n\r]/g, '').length
  }
}

/**
 * Vue Composition API hook for auto-save
 * 用于在Vue组件中使用自动保存功能
 */
import { ref, watch, onMounted, onUnmounted } from 'vue'

export function useAutoSave(
  initialContent: string,
  initialTitle: string,
  options: AutoSaveOptions = {}
) {
  const content = ref(initialContent)
  const title = ref(initialTitle)
  const saveStatus = ref('已加载')
  const lastSavedTime = ref('')
  const autoSaveManager = new AutoSaveManager(options)

  onMounted(() => {
    autoSaveManager.start('default', content.value, 0, title.value)
  })

  onUnmounted(() => {
    autoSaveManager.stop()
  })

  watch([content, title], ([newContent, newTitle]) => {
    autoSaveManager.onContentChange('default', newContent, newTitle)
    saveStatus.value = '未保存'
  })

  const saveNow = async () => {
    saveStatus.value = '保存中...'
    const success = await autoSaveManager.saveNow('default', content.value, title.value)
    if (success) {
      saveStatus.value = '已保存'
      lastSavedTime.value = new Date().toLocaleTimeString()
    } else {
      saveStatus.value = '保存失败'
    }
    return success
  }

  return {
    content,
    title,
    saveStatus,
    lastSavedTime,
    saveNow,
    manager: autoSaveManager
  }
}
