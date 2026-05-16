import { computed, nextTick, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useWriterAISummaryContext } from '../useWriterAISummaryContext'

const loadCreativeWorkflow = vi.fn()
const buildCreativeWorkflowSnapshot = vi.fn()
const buildCreativeWorkflowSummaryLines = vi.fn()
const currentWriterAssetSummaryItemsRef = ref<Array<{ label: string; count: number }>>([])
const assetRefStateRef = ref({
  chapterRefs: {},
  volumeRefs: {},
})

vi.mock('@/modules/writer/composables/useWriterAssetSummary', () => ({
  useWriterAssetSummary: () => ({
    assetRefState: assetRefStateRef,
    currentWriterAssetSummaryItems: currentWriterAssetSummaryItemsRef,
  }),
}))

vi.mock('@/modules/writer/services/creativeWorkflow.service', () => ({
  loadCreativeWorkflow: (...args: unknown[]) => loadCreativeWorkflow(...args),
  buildCreativeWorkflowSnapshot: (...args: unknown[]) => buildCreativeWorkflowSnapshot(...args),
  buildCreativeWorkflowSummaryLines: (...args: unknown[]) => buildCreativeWorkflowSummaryLines(...args),
}))

describe('useWriterAISummaryContext', () => {
  beforeEach(() => {
    loadCreativeWorkflow.mockReset()
    buildCreativeWorkflowSnapshot.mockReset()
    buildCreativeWorkflowSummaryLines.mockReset()
    currentWriterAssetSummaryItemsRef.value = []
    assetRefStateRef.value = {
      chapterRefs: {},
      volumeRefs: {},
    }

    loadCreativeWorkflow.mockResolvedValue({
      projectId: 'project-1',
    })
    buildCreativeWorkflowSnapshot.mockReturnValue({
      projectId: 'project-1',
    })
    buildCreativeWorkflowSummaryLines.mockReturnValue([
      '题材模板：都市逆袭',
      '目标读者：男频都市',
      '核心承诺：打脸与反转',
    ])
  })

  it('merges creative workflow summary with current chapter asset summary', async () => {
    currentWriterAssetSummaryItemsRef.value = [
      { label: '角色', count: 2 },
      { label: '地点', count: 1 },
    ]

    const projectId = ref('project-1')
    const chapterId = ref('chapter-1')
    const chapters = ref([])

    const { aiSummaryContextLines, aiSummaryContextText, creativeWorkflowSnapshot } =
      useWriterAISummaryContext({
        projectId: computed(() => projectId.value),
        chapterId: computed(() => chapterId.value),
        chapters: computed(() => chapters.value),
      })

    await Promise.resolve()
    await nextTick()

    expect(loadCreativeWorkflow).toHaveBeenCalledWith('project-1')
    expect(creativeWorkflowSnapshot.value).toEqual({ projectId: 'project-1' })
    expect(aiSummaryContextLines.value).toEqual([
      '题材模板：都市逆袭',
      '目标读者：男频都市',
      '核心承诺：打脸与反转',
      '当前章节资产：角色 2；地点 1',
    ])
    expect(aiSummaryContextText.value).toContain('创作蓝图与资产摘要：')
    expect(aiSummaryContextText.value).toContain('当前章节资产：角色 2；地点 1')
  })

  it('projects chapter and volume asset refs into compact ai summaries', async () => {
    assetRefStateRef.value = {
      chapterRefs: {
        'chapter-1': [
          {
            id: 'ref-1',
            assetType: 'character',
            assetId: 'char-1',
            assetName: '林舟',
            scopeType: 'chapter',
            scopeId: 'chapter-1',
            source: 'mention',
            evidence: '@林舟',
            createdAt: '2026-05-16T00:00:00.000Z',
            updatedAt: '2026-05-16T00:00:00.000Z',
          },
        ],
      },
      volumeRefs: {
        'volume-1': [
          {
            id: 'ref-2',
            assetType: 'location',
            assetId: 'loc-1',
            assetName: '旧车站',
            scopeType: 'volume',
            scopeId: 'volume-1',
            source: 'chapter_rollup',
            evidence: '卷级常驻场景',
            createdAt: '2026-05-16T00:00:00.000Z',
            updatedAt: '2026-05-16T00:00:00.000Z',
          },
        ],
      },
    }

    const { aiAssetSummaries } = useWriterAISummaryContext({
      projectId: computed(() => 'project-1'),
      chapterId: computed(() => 'chapter-1'),
      chapters: computed(() => [
        {
          id: 'chapter-1',
          projectId: 'project-1',
          parentId: 'volume-1',
          chapterNum: 1,
          title: '雨夜',
          wordCount: 0,
          updatedAt: '2026-05-16T00:00:00.000Z',
          status: 'draft',
        },
      ]),
    })

    expect(aiAssetSummaries.value).toEqual([
      expect.objectContaining({
        scope: 'chapter',
        assetType: 'character',
        assetName: '林舟',
      }),
      expect.objectContaining({
        scope: 'volume',
        assetType: 'location',
        assetName: '旧车站',
      }),
    ])
  })

  it('returns empty summary text when both workflow and asset summary are empty', async () => {
    buildCreativeWorkflowSummaryLines.mockReturnValue([])

    const { aiSummaryContextLines, aiSummaryContextText } = useWriterAISummaryContext({
      projectId: computed(() => 'project-1'),
      chapterId: computed(() => 'chapter-1'),
      chapters: computed(() => []),
    })

    await Promise.resolve()
    await nextTick()

    expect(aiSummaryContextLines.value).toEqual([])
    expect(aiSummaryContextText.value).toBe('')
  })
})
