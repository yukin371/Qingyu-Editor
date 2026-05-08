import { describe, expect, it } from 'vitest'

import {
  buildStructureNodeTags,
  findBoundChapter,
  getBoundChapterId,
  getStructureNodeBindingState,
} from '../structureNodeTypes'

describe('structureNodeTypes', () => {
  it('应优先通过 documentId 读取结构节点绑定章节', () => {
    const node = {
      id: 'node-1',
      title: '第一幕冲突',
      documentId: 'chapter-1',
      tags: ['chapter-binding:legacy-chapter'],
    } as any

    expect(getBoundChapterId(node)).toBe('chapter-1')
    expect(getStructureNodeBindingState(node)).toEqual({
      label: '已绑定章节',
      tone: 'linked',
    })
  })

  it('不再生成 chapter-binding 标签，并通过 documentId 解析章节标题', () => {
    const node = {
      id: 'node-2',
      title: '第二幕转折',
      documentId: 'chapter-2',
    } as any

    expect(buildStructureNodeTags(node, 'chapter-2')).toEqual([])
    expect(
      findBoundChapter(node, [
        {
          id: 'chapter-2',
          projectId: 'project-1',
          chapterNum: 2,
          title: '第二章',
          wordCount: 1500,
          updatedAt: '2026-04-14T00:00:00.000Z',
          status: 'draft',
          nodeType: 'chapter',
        },
      ]),
    ).toMatchObject({
      id: 'chapter-2',
      title: '第二章',
    })
  })
})
