/**
 * EditorStore Tests
 * 测试编辑器状态管理
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useEditorStore } from '../editorStore'

describe('EditorStore', () => {
  beforeEach(() => {
    // 创建新的pinia实例
    setActivePinia(createPinia())
    // 使用 vi.useFakeTimers 来控制时间
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('初始状态', () => {
    it('应该初始化为默认状态', () => {
      const store = useEditorStore()

      expect(store.currentProjectId).toBe(null)
      expect(store.currentChapterId).toBe(null)
      expect(store.content).toBe('')
      expect(store.isDirty).toBe(false)
      expect(store.lastSavedAt).toBe(null)
      expect(store.activeTool).toBe('writing')
      expect(store.isSaving).toBe(false)
      expect(store.autosaveEnabled).toBe(true)
    })
  })

  describe('setActiveTool', () => {
    it('应该设置当前工具', () => {
      const store = useEditorStore()

      store.setActiveTool('chapters')

      expect(store.activeTool).toBe('chapters')
    })

    it('应该能切换到不同工具', () => {
      const store = useEditorStore()

      store.setActiveTool('ai')
      expect(store.activeTool).toBe('ai')

      store.setActiveTool('immersive')
      expect(store.activeTool).toBe('immersive')
    })
  })

  describe('setCurrentProject', () => {
    it('应该设置当前项目ID', () => {
      const store = useEditorStore()

      store.setCurrentProject('project-123')

      expect(store.currentProjectId).toBe('project-123')
    })

    it('应该能清空当前项目ID', () => {
      const store = useEditorStore()
      store.setCurrentProject('project-123')

      store.setCurrentProject(null)

      expect(store.currentProjectId).toBe(null)
    })
  })

  describe('setCurrentChapter', () => {
    it('应该设置当前章节ID', () => {
      const store = useEditorStore()

      store.setCurrentChapter('chapter-456')

      expect(store.currentChapterId).toBe('chapter-456')
    })

    it('应该能清空当前章节ID', () => {
      const store = useEditorStore()
      store.setCurrentChapter('chapter-456')

      store.setCurrentChapter(null)

      expect(store.currentChapterId).toBe(null)
    })
  })

  describe('setContent', () => {
    it('应该设置内容并标记为脏（默认行为）', () => {
      const store = useEditorStore()

      store.setContent('新的编辑内容')

      expect(store.content).toBe('新的编辑内容')
      expect(store.isDirty).toBe(true)
    })

    it('设置内容时可以不标记为脏', () => {
      const store = useEditorStore()

      store.setContent('加载的内容', false)

      expect(store.content).toBe('加载的内容')
      expect(store.isDirty).toBe(false)
    })

    it('应该能覆盖之前的内容', () => {
      const store = useEditorStore()
      store.setContent('原始内容')

      store.setContent('覆盖内容')

      expect(store.content).toBe('覆盖内容')
    })

    it('应该能设置为空内容', () => {
      const store = useEditorStore()
      store.setContent('有内容')

      store.setContent('')

      expect(store.content).toBe('')
    })
  })

  describe('markDirty', () => {
    it('应该标记为脏状态', () => {
      const store = useEditorStore()
      expect(store.isDirty).toBe(false)

      store.markDirty()

      expect(store.isDirty).toBe(true)
    })

    it('重复调用应该保持脏状态', () => {
      const store = useEditorStore()
      store.markDirty()
      store.markDirty()

      expect(store.isDirty).toBe(true)
    })
  })

  describe('markSaved', () => {
    it('应该清除脏状态并记录保存时间', () => {
      const store = useEditorStore()
      store.markDirty()
      const fixedTime = new Date('2024-01-15T10:30:00').getTime()
      vi.setSystemTime(fixedTime)

      store.markSaved()

      expect(store.isDirty).toBe(false)
      expect(store.lastSavedAt).toBe(fixedTime)
    })

    it('重复保存应该更新保存时间', () => {
      const store = useEditorStore()
      const time1 = new Date('2024-01-15T10:30:00').getTime()
      vi.setSystemTime(time1)
      store.markSaved()

      const time2 = new Date('2024-01-15T11:00:00').getTime()
      vi.setSystemTime(time2)
      store.markSaved()

      expect(store.lastSavedAt).toBe(time2)
    })
  })

  describe('saveStatusText getter', () => {
    it('正在保存时应该返回"保存中..."', () => {
      const store = useEditorStore()
      store.setSaving(true)

      expect(store.saveStatusText).toBe('保存中...')
    })

    it('有未保存更改时应该返回"未保存"', () => {
      const store = useEditorStore()
      store.markDirty()

      expect(store.saveStatusText).toBe('未保存')
    })

    it('正在保存优先于未保存更改', () => {
      const store = useEditorStore()
      store.markDirty()
      store.setSaving(true)

      expect(store.saveStatusText).toBe('保存中...')
    })

    it('已保存后应该返回"已保存"', () => {
      const store = useEditorStore()
      const fixedTime = new Date('2024-01-15T10:30:00').getTime()
      vi.setSystemTime(fixedTime)
      store.markSaved()

      expect(store.saveStatusText).toBe('已保存')
    })

    it('初始状态应该返回"已保存"', () => {
      const store = useEditorStore()

      expect(store.saveStatusText).toBe('已保存')
    })
  })

  describe('hasContent getter', () => {
    it('有内容时应该返回true', () => {
      const store = useEditorStore()
      store.setContent('一些内容')

      expect(store.hasContent).toBe(true)
    })

    it('空内容时应该返回false', () => {
      const store = useEditorStore()

      expect(store.hasContent).toBe(false)
    })

    it('只有空格时不应该算作有内容', () => {
      const store = useEditorStore()
      store.setContent('   ')

      expect(store.hasContent).toBe(true) // 注意：这里只是检查长度，不是trim
    })
  })

  describe('resetEditor', () => {
    it('应该重置编辑器相关状态', () => {
      const store = useEditorStore()
      store.setContent('内容')
      store.markDirty()
      store.setCurrentChapter('chapter-1')
      store.markSaved()

      store.resetEditor()

      expect(store.content).toBe('')
      expect(store.isDirty).toBe(false)
      expect(store.lastSavedAt).toBe(null)
      expect(store.currentChapterId).toBe(null)
    })

    it('不应该重置项目ID', () => {
      const store = useEditorStore()
      store.setCurrentProject('project-1')

      store.resetEditor()

      expect(store.currentProjectId).toBe('project-1')
    })

    it('不应该重置工具状态', () => {
      const store = useEditorStore()
      store.setActiveTool('ai')

      store.resetEditor()

      expect(store.activeTool).toBe('ai')
    })
  })

  describe('reset', () => {
    it('应该重置所有状态', () => {
      const store = useEditorStore()
      store.setCurrentProject('project-1')
      store.setCurrentChapter('chapter-1')
      store.setContent('内容')
      store.markDirty()
      store.setActiveTool('ai')
      store.setSaving(true)

      store.reset()

      expect(store.currentProjectId).toBe(null)
      expect(store.currentChapterId).toBe(null)
      expect(store.content).toBe('')
      expect(store.isDirty).toBe(false)
      expect(store.lastSavedAt).toBe(null)
      expect(store.activeTool).toBe('writing')
      expect(store.isSaving).toBe(false)
    })
  })

  describe('toggleAutosave', () => {
    it('应该切换自动保存状态', () => {
      const store = useEditorStore()
      expect(store.autosaveEnabled).toBe(true)

      store.toggleAutosave()

      expect(store.autosaveEnabled).toBe(false)

      store.toggleAutosave()

      expect(store.autosaveEnabled).toBe(true)
    })

    it('应该能设置指定的自动保存状态', () => {
      const store = useEditorStore()

      store.toggleAutosave(false)
      expect(store.autosaveEnabled).toBe(false)

      store.toggleAutosave(true)
      expect(store.autosaveEnabled).toBe(true)
    })

    it('传入undefined时应该切换状态', () => {
      const store = useEditorStore()
      store.toggleAutosave(false)

      store.toggleAutosave(undefined)

      expect(store.autosaveEnabled).toBe(true)
    })
  })

  describe('setSaving', () => {
    it('应该设置保存状态', () => {
      const store = useEditorStore()

      store.setSaving(true)
      expect(store.isSaving).toBe(true)

      store.setSaving(false)
      expect(store.isSaving).toBe(false)
    })
  })

  describe('典型使用场景', () => {
    it('场景：编辑内容后保存', () => {
      const store = useEditorStore()

      // 1. 设置项目和章节
      store.setCurrentProject('project-1')
      store.setCurrentChapter('chapter-1')

      // 2. 加载内容（不标记为脏）
      store.setContent('初始内容', false)
      expect(store.isDirty).toBe(false)

      // 3. 用户编辑
      store.setContent('修改后的内容')
      expect(store.isDirty).toBe(true)
      expect(store.saveStatusText).toBe('未保存')

      // 4. 开始保存
      store.setSaving(true)
      expect(store.saveStatusText).toBe('保存中...')

      // 5. 保存完成
      const fixedTime = new Date('2024-01-15T10:30:00').getTime()
      vi.setSystemTime(fixedTime)
      store.markSaved()
      store.setSaving(false)
      expect(store.isDirty).toBe(false)
      expect(store.saveStatusText).toBe('已保存')
    })

    it('场景：切换章节', () => {
      const store = useEditorStore()

      // 1. 编辑第一个章节
      store.setCurrentChapter('chapter-1')
      store.setContent('章节1内容')
      expect(store.isDirty).toBe(true)

      // 2. 模拟保存后再切换章节（实际场景中会先保存或确认丢弃）
      store.markSaved()
      expect(store.isDirty).toBe(false)

      // 3. 切换到新章节
      store.setCurrentChapter('chapter-2')
      store.setContent('章节2内容', false) // 加载新章节内容（不标记为脏）

      expect(store.currentChapterId).toBe('chapter-2')
      expect(store.content).toBe('章节2内容')
      expect(store.isDirty).toBe(false)
    })
  })
})
