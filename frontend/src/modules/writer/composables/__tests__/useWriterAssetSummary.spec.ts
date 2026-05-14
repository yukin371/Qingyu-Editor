import { computed, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/modules/writer/utils/writerAssetRefs', () => ({
  loadWriterAssetRefState: () => ({
    chapterRefs: {},
    volumeRefs: {},
  }),
  buildWriterAssetSummaryByChapterId: () => ({
    'chapter-1': {
      total: 2,
      characters: 1,
      locations: 0,
      items: 1,
      organizations: 0,
      concepts: 0,
    },
  }),
  buildWriterAssetSummaryItems: (summary: {
    characters: number
    locations: number
    items: number
    organizations: number
    concepts: number
  }) =>
    [
      summary.characters ? { type: 'character', label: '角色', count: summary.characters } : null,
      summary.locations ? { type: 'location', label: '地点', count: summary.locations } : null,
      summary.items ? { type: 'item', label: '物品', count: summary.items } : null,
      summary.organizations
        ? { type: 'organization', label: '组织', count: summary.organizations }
        : null,
      summary.concepts ? { type: 'concept', label: '概念', count: summary.concepts } : null,
    ].filter(Boolean),
}))

import { useWriterAssetSummary } from '../useWriterAssetSummary'

describe('useWriterAssetSummary', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('prefers chapter asset summary over activeEntities fallback', () => {
    const chapterId = ref('chapter-1')
    const summary = useWriterAssetSummary({
      projectId: computed(() => 'project-1'),
      chapterId,
      chapters: computed(() => [
        {
          id: 'chapter-1',
          projectId: 'project-1',
          chapterNum: 1,
          title: '第一章',
          wordCount: 1000,
          updatedAt: '2026-05-15T00:00:00.000Z',
          status: 'draft',
          nodeType: 'chapter',
        },
      ]),
      activeEntities: computed(() => [
        { id: 'char-1', name: '林舟', type: 'character', summary: '迟疑' },
        { id: 'loc-1', name: '云港', type: 'location' },
      ]),
    })

    expect(summary.visibleAssetSummaryItems.value).toEqual([
      { key: 'character', label: '角色', count: 1 },
      { key: 'item', label: '物品', count: 1 },
    ])
  })

  it('falls back to activeEntities summary when chapter summary is empty', () => {
    const summary = useWriterAssetSummary({
      projectId: computed(() => 'project-1'),
      chapterId: computed(() => 'chapter-2'),
      chapters: computed(() => []),
      activeEntities: computed(() => [
        { id: 'char-1', name: '林舟', type: 'character', summary: '迟疑' },
        { id: 'loc-1', name: '云港', type: 'location' },
      ]),
    })

    expect(summary.visibleAssetSummaryItems.value).toEqual([
      { key: 'character', label: '角色', count: 1 },
      { key: 'location', label: '地点', count: 1 },
    ])
  })
})
