import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useStoryHarnessStore } from '@/modules/writer/stores/v3/storyHarnessStore'

describe('storyHarnessStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('保存后应冻结正式建议批次，并在切章时清空', () => {
    const store = useStoryHarnessStore()

    store.syncSession({
      projectId: 'project-1',
      chapterId: 'chapter-1',
      chapterTitle: '第一章',
      content: '张三开始怀疑李四。',
      chapterCount: 1,
    })

    store.commitSavedBatch([
      {
        id: 'cr-1',
        source: 'live',
        type: 'state',
        title: '角色状态可能需要更新：张三',
        summary: '状态可能转为怀疑或动摇',
        reason: '这类变化适合先作为 Change Request 预览。',
        severity: 'focus',
      },
    ])

    expect(store.savedBatchChangeRequests).toHaveLength(1)
    expect(store.savedBatchChangeRequests[0].source).toBe('save_batch')
    expect(store.savedBatchChangeRequests[0].id).toContain('save-batch:chapter-1')
    expect(store.savedBatchReceipt?.chapterId).toBe('chapter-1')
    expect(store.savedBatchReceipt?.chapterTitle).toBe('第一章')
    expect(store.savedBatchReceipt?.count).toBe(1)

    store.syncSession({
      projectId: 'project-1',
      chapterId: 'chapter-2',
      chapterTitle: '第二章',
      content: '李四没有回答。',
      chapterCount: 2,
    })

    expect(store.savedBatchChangeRequests).toEqual([])
    expect(store.savedBatchReceipt).toBeNull()
  })
})
