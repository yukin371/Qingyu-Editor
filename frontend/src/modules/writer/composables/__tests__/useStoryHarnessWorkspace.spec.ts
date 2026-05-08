import { computed, nextTick, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useStoryHarnessWorkspace } from '../useStoryHarnessWorkspace'
import { useStoryHarnessStore } from '@/modules/writer/stores/v3/storyHarnessStore'
import { useWriterStore } from '@/modules/writer/stores/writerStore'

const { mockStoryHarnessService } = vi.hoisted(() => ({
  mockStoryHarnessService: {
    getLatestBatch: vi.fn(),
    persistBatch: vi.fn(),
    fetchChapterContext: vi.fn(),
    fetchChangeRequests: vi.fn(),
    processChangeRequest: vi.fn(),
    triggerIndex: vi.fn(),
    rebuildProjection: vi.fn(),
  },
}))

vi.mock('@/modules/writer/services/storyHarness.service', () => ({
  storyHarnessService: mockStoryHarnessService,
  default: mockStoryHarnessService,
}))

describe('useStoryHarnessWorkspace', () => {
  beforeEach(() => {
    vi.useRealTimers()
    setActivePinia(createPinia())
    vi.clearAllMocks()

    mockStoryHarnessService.getLatestBatch.mockResolvedValue(null)
    mockStoryHarnessService.persistBatch.mockImplementation(async (payload) => ({
      changeRequests: payload.changeRequests.map((changeRequest: any, index: number) => ({
        ...changeRequest,
        id: `save-batch:batch-local:${index}:${changeRequest.id}`,
        source: 'save_batch',
        sourceTimestamp: 1712345678901,
      })),
      receipt: {
        chapterId: payload.chapterId,
        chapterTitle: payload.chapterTitle,
        count: payload.changeRequests.length,
        committedAt: 1712345678901,
        batchId: 'batch-local',
        source: 'remote',
      },
    }))
    mockStoryHarnessService.fetchChapterContext.mockResolvedValue({
      characters: [
        {
          id: 'char-1',
          name: '张三',
          traits: ['热血'],
          currentState: '怀疑中',
        },
      ],
      relations: [],
      pendingCRs: 1,
    })
    mockStoryHarnessService.fetchChangeRequests.mockResolvedValue([
      {
        id: 'backend-cr-1',
        batchId: 'batch-1',
        chapterId: 'chapter-1',
        category: 'state',
        priority: 'high',
        status: 'pending',
        title: '正文指令建议：更新 张三',
        description: '张三状态应切换为重伤撤退。',
        evidence: [
          {
            documentId: 'chapter-1',
            paragraphIdx: 0,
            quoteText: '// @张三 受伤严重，退出后续战斗。',
          },
        ],
        source: 'indexer',
        createdAt: '2026-04-06T06:00:00.000Z',
      },
    ])
    mockStoryHarnessService.processChangeRequest.mockResolvedValue(true)
    mockStoryHarnessService.triggerIndex.mockResolvedValue({
      batchId: 'batch-1',
      generated: 1,
      pending: 1,
      deduplicated: 0,
      source: 'manual',
    })
    mockStoryHarnessService.rebuildProjection.mockResolvedValue({
      projectId: 'project-1',
      chapterId: 'chapter-1',
      replayedCount: 1,
      lastRequestId: 'backend-cr-1',
    })
  })

  it('应整合作用域上下文，并优先展示后端正式建议', async () => {
    const writerStore = useWriterStore()
    const harnessStore = useStoryHarnessStore()

    writerStore.characters.list = [
      { id: 'char-1', name: '张三', traits: ['热血'], currentState: '强撑' },
      { id: 'char-2', name: '李四', traits: ['冷静'], currentState: '负伤' },
    ] as any
    writerStore.characters.relations = [
      {
        id: 'rel-1',
        fromId: 'char-1',
        toId: 'char-2',
        type: '同盟',
        strength: 72,
      },
    ] as any
    writerStore.outline.tree = [
      {
        id: 'outline-1',
        documentId: 'chapter-1',
        title: '雨夜祠堂',
        characters: ['char-1'],
        children: [],
      },
    ] as any
    writerStore.outline.currentNode = null

    const displayChapterId = ref('chapter-1')
    const displayChapterTitle = ref('第一章')
    const currentChapterPlainText = ref(
      '张三看见李四断了手，却没敢立刻追问。\n// @张三 受伤严重，退出后续战斗。',
    )
    const availableDocMap = computed(
      () =>
        new Map([
          [
            'chapter-1',
            {
              id: 'chapter-1',
              title: '第一章',
              characterIds: ['char-2'],
            },
          ],
        ]) as any,
    )

    const harness = useStoryHarnessWorkspace({
      projectId: computed(() => 'project-1'),
      displayChapterId: computed(() => displayChapterId.value),
      displayChapterTitle: computed(() => displayChapterTitle.value),
      currentChapterPlainText: computed(() => currentChapterPlainText.value),
      availableDocMap,
    })

    await flushPromises()
    await nextTick()

    expect(harness.currentScopeLabel.value).toBe('雨夜祠堂')
    expect(harness.activeScopeCharacters.value).toEqual([
      {
        id: 'char-1',
        name: '张三',
        traits: ['热血'],
        currentState: '怀疑中',
      },
    ])
    expect(harness.storyHarnessLiveChangeRequests.value.length).toBeGreaterThan(0)
    expect(harness.storyHarnessChangeRequests.value[0].id).toBe('backend-cr-1')
    expect(
      harness.storyHarnessChangeRequests.value.filter((item) => item.title.includes('正文指令建议')).length,
    ).toBe(1)

    await harness.persistCurrentLiveChangeRequests()

    expect(harnessStore.savedBatchReceipt?.count).toBeGreaterThan(0)
    expect(
      harness.storyHarnessChangeRequests.value.some((item) => item.id === 'backend-cr-1'),
    ).toBe(true)
  })

  it('accept 后应同步后端并刷新 Context Lens', async () => {
    const writerStore = useWriterStore()

    writerStore.characters.list = [{ id: 'char-1', name: '张三', traits: ['热血'], currentState: '强撑' }] as any
    writerStore.characters.relations = [] as any
    writerStore.outline.tree = [
      {
        id: 'outline-1',
        documentId: 'chapter-1',
        title: '雨夜祠堂',
        characters: ['char-1'],
        children: [],
      },
    ] as any

    mockStoryHarnessService.fetchChapterContext
      .mockResolvedValueOnce({
        characters: [{ id: 'char-1', name: '张三', traits: ['热血'], currentState: '怀疑中' }],
        relations: [],
        pendingCRs: 1,
      })
      .mockResolvedValueOnce({
        characters: [{ id: 'char-1', name: '张三', traits: ['热血'], currentState: '重伤撤退' }],
        relations: [],
        pendingCRs: 0,
      })

    const harness = useStoryHarnessWorkspace({
      projectId: computed(() => 'project-1'),
      displayChapterId: computed(() => 'chapter-1'),
      displayChapterTitle: computed(() => '第一章'),
      currentChapterPlainText: computed(() => '// @张三 受伤严重，退出后续战斗。'),
      availableDocMap: computed(() => new Map([['chapter-1', { id: 'chapter-1', title: '第一章' }]]) as any),
    })

    await flushPromises()
    await nextTick()

    expect(harness.activeScopeCharacters.value[0].currentState).toBe('怀疑中')

    const success = await harness.handleChangeRequestDecision('backend-cr-1', 'accepted')
    await flushPromises()
    await nextTick()

    expect(success).toBe(true)
    expect(mockStoryHarnessService.processChangeRequest).toHaveBeenCalledWith('backend-cr-1', 'accepted')
    expect(harness.activeScopeCharacters.value[0].currentState).toBe('重伤撤退')
  })

  it('ignore 后应刷新后端待处理队列', async () => {
    const writerStore = useWriterStore()

    writerStore.characters.list = [{ id: 'char-1', name: '张三', traits: ['热血'], currentState: '强撑' }] as any
    writerStore.characters.relations = [] as any
    writerStore.outline.tree = [] as any

    mockStoryHarnessService.fetchChapterContext.mockResolvedValue({
      characters: [{ id: 'char-1', name: '张三', traits: ['热血'], currentState: '强撑' }],
      relations: [],
      pendingCRs: 1,
    })
    mockStoryHarnessService.fetchChangeRequests
      .mockResolvedValueOnce([
        {
          id: 'backend-cr-ignore-1',
          batchId: 'batch-1',
          chapterId: 'chapter-1',
          category: 'relation',
          priority: 'medium',
          status: 'pending',
          title: '关系需要补充说明',
          description: '当前人物关系缺少过渡说明。',
          evidence: [],
          source: 'indexer',
          createdAt: '2026-04-06T06:00:00.000Z',
        },
      ])
      .mockResolvedValueOnce([])

    const harness = useStoryHarnessWorkspace({
      projectId: computed(() => 'project-1'),
      displayChapterId: computed(() => 'chapter-1'),
      displayChapterTitle: computed(() => '第一章'),
      currentChapterPlainText: computed(() => '张三看着李四，没有说话。'),
      availableDocMap: computed(() => new Map([['chapter-1', { id: 'chapter-1', title: '第一章' }]]) as any),
    })

    await flushPromises()
    await nextTick()

    expect(harness.storyHarnessChangeRequests.value.some((item) => item.id === 'backend-cr-ignore-1')).toBe(true)

    const success = await harness.handleChangeRequestDecision('backend-cr-ignore-1', 'ignored')
    await flushPromises()
    await nextTick()

    expect(success).toBe(true)
    expect(mockStoryHarnessService.processChangeRequest).toHaveBeenCalledWith('backend-cr-ignore-1', 'ignored')
    expect(harness.storyHarnessChangeRequests.value.some((item) => item.id === 'backend-cr-ignore-1')).toBe(false)
  })

  it('保存后若后端未自动产出建议，应兜底触发 trigger-index', async () => {
    vi.useFakeTimers()

    const writerStore = useWriterStore()
    writerStore.characters.list = [{ id: 'char-1', name: '张三', traits: ['热血'], currentState: '强撑' }] as any
    writerStore.characters.relations = [] as any
    writerStore.outline.tree = [] as any

    mockStoryHarnessService.fetchChapterContext.mockResolvedValue({
      characters: [{ id: 'char-1', name: '张三', traits: ['热血'], currentState: '强撑' }],
      relations: [],
      pendingCRs: 1,
    })
    mockStoryHarnessService.fetchChangeRequests.mockResolvedValue([])

    const harness = useStoryHarnessWorkspace({
      projectId: computed(() => 'project-1'),
      displayChapterId: computed(() => 'chapter-1'),
      displayChapterTitle: computed(() => '第一章'),
      currentChapterPlainText: computed(() => '// @张三 受伤严重，退出后续战斗。'),
      availableDocMap: computed(() => new Map([['chapter-1', { id: 'chapter-1', title: '第一章' }]]) as any),
    })

    await flushPromises()
    await nextTick()

    mockStoryHarnessService.fetchChangeRequests.mockReset()
    mockStoryHarnessService.fetchChangeRequests
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 'backend-cr-1',
          batchId: 'batch-1',
          chapterId: 'chapter-1',
          category: 'state',
          priority: 'high',
          status: 'pending',
          title: '正文指令建议：更新 张三',
          description: '张三状态应切换为重伤撤退。',
          evidence: [],
          source: 'indexer',
          createdAt: '2026-04-06T06:00:00.000Z',
        },
      ])

    const refreshPromise = harness.refreshAfterSave()
    await vi.runAllTimersAsync()
    await refreshPromise
    await flushPromises()

    expect(mockStoryHarnessService.triggerIndex).toHaveBeenCalledWith('project-1', 'chapter-1')
    expect(harness.storyHarnessChangeRequests.value[0].id).toBe('backend-cr-1')
  })

  it('accept 后如果 context 为空，应兜底重建 projection 再刷新一次', async () => {
    const writerStore = useWriterStore()

    writerStore.characters.list = [{ id: 'char-1', name: '张三', traits: ['热血'], currentState: '强撑' }] as any
    writerStore.characters.relations = [] as any
    writerStore.outline.tree = [] as any

    mockStoryHarnessService.fetchChapterContext
      .mockResolvedValueOnce({
        characters: [{ id: 'char-1', name: '张三', traits: ['热血'], currentState: '怀疑中' }],
        relations: [],
        pendingCRs: 1,
      })
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        characters: [{ id: 'char-1', name: '张三', traits: ['热血'], currentState: '重伤撤退' }],
        relations: [],
        pendingCRs: 0,
      })

    const harness = useStoryHarnessWorkspace({
      projectId: computed(() => 'project-1'),
      displayChapterId: computed(() => 'chapter-1'),
      displayChapterTitle: computed(() => '第一章'),
      currentChapterPlainText: computed(() => '// @张三 受伤严重，退出后续战斗。'),
      availableDocMap: computed(() => new Map([['chapter-1', { id: 'chapter-1', title: '第一章' }]]) as any),
    })

    await flushPromises()
    await nextTick()

    const success = await harness.handleChangeRequestDecision('backend-cr-1', 'accepted')
    await flushPromises()
    await nextTick()

    expect(success).toBe(true)
    expect(mockStoryHarnessService.rebuildProjection).toHaveBeenCalledWith('project-1', 'chapter-1')
    expect(harness.activeScopeCharacters.value[0].currentState).toBe('重伤撤退')
  })
})
