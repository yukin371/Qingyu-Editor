/**
 * ChapterStore Tests
 * 测试章节管理状态
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useChapterStore, type ChapterNode } from '../chapterStore'

describe('ChapterStore', () => {
  beforeEach(() => {
    // 创建新的pinia实例
    setActivePinia(createPinia())
  })

  describe('初始状态', () => {
    it('应该初始化为空状态', () => {
      const store = useChapterStore()

      expect(store.chapters).toEqual([])
      expect(store.currentChapterId).toBe(null)
      expect(store.loading).toBe(false)
    })
  })

  describe('setCurrentChapter', () => {
    it('应该设置当前章节ID', () => {
      const store = useChapterStore()

      store.setCurrentChapter('chapter-1')

      expect(store.currentChapterId).toBe('chapter-1')
    })

    it('应该能清空当前章节ID', () => {
      const store = useChapterStore()
      store.setCurrentChapter('chapter-1')

      store.setCurrentChapter(null)

      expect(store.currentChapterId).toBe(null)
    })
  })

  describe('addChapter', () => {
    it('应该添加新章节', () => {
      const store = useChapterStore()
      const newChapter: ChapterNode = {
        id: 'chapter-1',
        parentId: null,
        projectId: 'project-1',
        title: '第一章',
        order: 1,
        wordCount: 0,
        status: 'draft'
      }

      store.addChapter(newChapter)

      expect(store.chapters).toHaveLength(1)
      expect(store.chapters[0]).toEqual(newChapter)
    })

    it('应该添加多个章节', () => {
      const store = useChapterStore()
      const chapter1: ChapterNode = {
        id: 'chapter-1',
        parentId: null,
        projectId: 'project-1',
        title: '第一章',
        order: 1,
        wordCount: 0,
        status: 'draft'
      }
      const chapter2: ChapterNode = {
        id: 'chapter-2',
        parentId: null,
        projectId: 'project-1',
        title: '第二章',
        order: 2,
        wordCount: 0,
        status: 'draft'
      }

      store.addChapter(chapter1)
      store.addChapter(chapter2)

      expect(store.chapters).toHaveLength(2)
    })
  })

  describe('updateChapter', () => {
    it('应该更新指定章节', () => {
      const store = useChapterStore()
      const chapter: ChapterNode = {
        id: 'chapter-1',
        parentId: null,
        projectId: 'project-1',
        title: '第一章',
        order: 1,
        wordCount: 0,
        status: 'draft'
      }
      store.setChapters([chapter])

      store.updateChapter('chapter-1', { title: '修改后的标题', wordCount: 1000 })

      expect(store.chapters[0].title).toBe('修改后的标题')
      expect(store.chapters[0].wordCount).toBe(1000)
      // 未更新的字段应保持不变
      expect(store.chapters[0].status).toBe('draft')
    })

    it('更新不存在的章节应该无操作', () => {
      const store = useChapterStore()
      const chapter: ChapterNode = {
        id: 'chapter-1',
        parentId: null,
        projectId: 'project-1',
        title: '第一章',
        order: 1,
        wordCount: 0,
        status: 'draft'
      }
      store.setChapters([chapter])

      store.updateChapter('non-existent', { title: '新标题' })

      expect(store.chapters).toHaveLength(1)
      expect(store.chapters[0].title).toBe('第一章')
    })
  })

  describe('deleteChapter', () => {
    it('应该删除指定章节', () => {
      const store = useChapterStore()
      const chapter1: ChapterNode = {
        id: 'chapter-1',
        parentId: null,
        projectId: 'project-1',
        title: '第一章',
        order: 1,
        wordCount: 0,
        status: 'draft'
      }
      const chapter2: ChapterNode = {
        id: 'chapter-2',
        parentId: null,
        projectId: 'project-1',
        title: '第二章',
        order: 2,
        wordCount: 0,
        status: 'draft'
      }
      store.setChapters([chapter1, chapter2])

      store.deleteChapter('chapter-1')

      expect(store.chapters).toHaveLength(1)
      expect(store.chapters[0].id).toBe('chapter-2')
    })

    it('删除当前选中章节时应该清空选中状态', () => {
      const store = useChapterStore()
      const chapter: ChapterNode = {
        id: 'chapter-1',
        parentId: null,
        projectId: 'project-1',
        title: '第一章',
        order: 1,
        wordCount: 0,
        status: 'draft'
      }
      store.setChapters([chapter])
      store.setCurrentChapter('chapter-1')

      store.deleteChapter('chapter-1')

      expect(store.currentChapterId).toBe(null)
    })

    it('删除非当前选中章节时应该保持选中状态', () => {
      const store = useChapterStore()
      const chapter1: ChapterNode = {
        id: 'chapter-1',
        parentId: null,
        projectId: 'project-1',
        title: '第一章',
        order: 1,
        wordCount: 0,
        status: 'draft'
      }
      const chapter2: ChapterNode = {
        id: 'chapter-2',
        parentId: null,
        projectId: 'project-1',
        title: '第二章',
        order: 2,
        wordCount: 0,
        status: 'draft'
      }
      store.setChapters([chapter1, chapter2])
      store.setCurrentChapter('chapter-1')

      store.deleteChapter('chapter-2')

      expect(store.currentChapterId).toBe('chapter-1')
    })
  })

  describe('currentChapter getter', () => {
    it('应该返回当前选中的章节', () => {
      const store = useChapterStore()
      const chapter1: ChapterNode = {
        id: 'chapter-1',
        parentId: null,
        projectId: 'project-1',
        title: '第一章',
        order: 1,
        wordCount: 0,
        status: 'draft'
      }
      const chapter2: ChapterNode = {
        id: 'chapter-2',
        parentId: null,
        projectId: 'project-1',
        title: '第二章',
        order: 2,
        wordCount: 0,
        status: 'draft'
      }
      store.setChapters([chapter1, chapter2])
      store.setCurrentChapter('chapter-2')

      expect(store.currentChapter).toEqual(chapter2)
    })

    it('未选中章节时应该返回 null', () => {
      const store = useChapterStore()

      expect(store.currentChapter).toBe(null)
    })

    it('选中的章节ID不存在时应该返回 null', () => {
      const store = useChapterStore()
      const chapter: ChapterNode = {
        id: 'chapter-1',
        parentId: null,
        projectId: 'project-1',
        title: '第一章',
        order: 1,
        wordCount: 0,
        status: 'draft'
      }
      store.setChapters([chapter])
      store.setCurrentChapter('non-existent')

      expect(store.currentChapter).toBe(null)
    })
  })

  describe('chapterTree getter', () => {
    it('空列表应该返回空树', () => {
      const store = useChapterStore()

      expect(store.chapterTree).toEqual([])
    })

    it('应该构建单层树形结构', () => {
      const store = useChapterStore()
      const chapter1: ChapterNode = {
        id: 'chapter-1',
        parentId: null,
        projectId: 'project-1',
        title: '第一章',
        order: 1,
        wordCount: 0,
        status: 'draft'
      }
      const chapter2: ChapterNode = {
        id: 'chapter-2',
        parentId: null,
        projectId: 'project-1',
        title: '第二章',
        order: 2,
        wordCount: 0,
        status: 'draft'
      }
      store.setChapters([chapter1, chapter2])

      const tree = store.chapterTree

      expect(tree).toHaveLength(2)
      expect(tree[0].id).toBe('chapter-1')
      expect(tree[1].id).toBe('chapter-2')
    })

    it('应该构建多层树形结构', () => {
      const store = useChapterStore()
      const root: ChapterNode = {
        id: 'root',
        parentId: null,
        projectId: 'project-1',
        title: '根目录',
        order: 1,
        wordCount: 0,
        status: 'draft'
      }
      const child1: ChapterNode = {
        id: 'child-1',
        parentId: 'root',
        projectId: 'project-1',
        title: '子章节1',
        order: 1,
        wordCount: 0,
        status: 'draft'
      }
      const child2: ChapterNode = {
        id: 'child-2',
        parentId: 'root',
        projectId: 'project-1',
        title: '子章节2',
        order: 2,
        wordCount: 0,
        status: 'draft'
      }
      store.setChapters([root, child1, child2])

      const tree = store.chapterTree

      expect(tree).toHaveLength(1)
      expect(tree[0].id).toBe('root')
      expect(tree[0].children).toHaveLength(2)
      expect(tree[0].children![0].id).toBe('child-1')
      expect(tree[0].children![1].id).toBe('child-2')
    })

    it('应该按order字段排序', () => {
      const store = useChapterStore()
      const chapter1: ChapterNode = {
        id: 'chapter-1',
        parentId: null,
        projectId: 'project-1',
        title: '第三章',
        order: 3,
        wordCount: 0,
        status: 'draft'
      }
      const chapter2: ChapterNode = {
        id: 'chapter-2',
        parentId: null,
        projectId: 'project-1',
        title: '第一章',
        order: 1,
        wordCount: 0,
        status: 'draft'
      }
      const chapter3: ChapterNode = {
        id: 'chapter-3',
        parentId: null,
        projectId: 'project-1',
        title: '第二章',
        order: 2,
        wordCount: 0,
        status: 'draft'
      }
      store.setChapters([chapter1, chapter2, chapter3])

      const tree = store.chapterTree

      expect(tree[0].order).toBe(1)
      expect(tree[1].order).toBe(2)
      expect(tree[2].order).toBe(3)
    })

    it('子节点也应该按order排序', () => {
      const store = useChapterStore()
      const root: ChapterNode = {
        id: 'root',
        parentId: null,
        projectId: 'project-1',
        title: '根目录',
        order: 1,
        wordCount: 0,
        status: 'draft'
      }
      const child1: ChapterNode = {
        id: 'child-1',
        parentId: 'root',
        projectId: 'project-1',
        title: '子章节3',
        order: 3,
        wordCount: 0,
        status: 'draft'
      }
      const child2: ChapterNode = {
        id: 'child-2',
        parentId: 'root',
        projectId: 'project-1',
        title: '子章节1',
        order: 1,
        wordCount: 0,
        status: 'draft'
      }
      store.setChapters([root, child1, child2])

      const tree = store.chapterTree

      expect(tree[0].children![0].order).toBe(1)
      expect(tree[0].children![1].order).toBe(3)
    })

    it('孤儿节点（父节点不存在）应该作为根节点', () => {
      const store = useChapterStore()
      const orphan: ChapterNode = {
        id: 'orphan',
        parentId: 'non-existent-parent',
        projectId: 'project-1',
        title: '孤儿章节',
        order: 1,
        wordCount: 0,
        status: 'draft'
      }
      store.setChapters([orphan])

      const tree = store.chapterTree

      expect(tree).toHaveLength(1)
      expect(tree[0].id).toBe('orphan')
    })
  })

  describe('setChapters', () => {
    it('应该批量设置章节', () => {
      const store = useChapterStore()
      const chapters: ChapterNode[] = [
        {
          id: 'chapter-1',
          parentId: null,
          projectId: 'project-1',
          title: '第一章',
          order: 1,
          wordCount: 0,
          status: 'draft'
        },
        {
          id: 'chapter-2',
          parentId: null,
          projectId: 'project-1',
          title: '第二章',
          order: 2,
          wordCount: 0,
          status: 'draft'
        }
      ]

      store.setChapters(chapters)

      expect(store.chapters).toHaveLength(2)
    })

    it('应该替换现有章节', () => {
      const store = useChapterStore()
      const oldChapter: ChapterNode = {
        id: 'old',
        parentId: null,
        projectId: 'project-1',
        title: '旧章节',
        order: 1,
        wordCount: 0,
        status: 'draft'
      }
      store.setChapters([oldChapter])

      const newChapters: ChapterNode[] = [
        {
          id: 'new-1',
          parentId: null,
          projectId: 'project-1',
          title: '新章节1',
          order: 1,
          wordCount: 0,
          status: 'draft'
        },
        {
          id: 'new-2',
          parentId: null,
          projectId: 'project-1',
          title: '新章节2',
          order: 2,
          wordCount: 0,
          status: 'draft'
        }
      ]
      store.setChapters(newChapters)

      expect(store.chapters).toHaveLength(2)
      expect(store.chapters.find(c => c.id === 'old')).toBeUndefined()
    })
  })

  describe('reset', () => {
    it('应该重置所有状态', () => {
      const store = useChapterStore()
      const chapter: ChapterNode = {
        id: 'chapter-1',
        parentId: null,
        projectId: 'project-1',
        title: '第一章',
        order: 1,
        wordCount: 1000,
        status: 'writing'
      }
      store.setChapters([chapter])
      store.setCurrentChapter('chapter-1')
      store.loading = true

      store.reset()

      expect(store.chapters).toEqual([])
      expect(store.currentChapterId).toBe(null)
      expect(store.loading).toBe(false)
    })
  })
})
