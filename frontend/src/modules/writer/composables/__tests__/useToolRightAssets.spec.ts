import { computed, effectScope, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const extractAssetsWithWorkbenchMock = vi.fn()
const createAssetMock = vi.fn()
const selectAssetMock = vi.fn()

const globalAssetsRef = ref([
  {
    id: 'asset-global-1',
    category: 'characters' as const,
    name: '林舟',
    totalReferenceCount: 3,
  },
])

vi.mock('@/modules/ai/api/workbench', () => ({
  extractAssetsWithWorkbench: (...args: unknown[]) => extractAssetsWithWorkbenchMock(...args),
}))

vi.mock('@/design-system/services', () => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}))

vi.mock('@/modules/writer/utils/writerAIError', () => ({
  resolveWriterAIErrorState: (error: unknown) => {
    const message = typeof (error as { message?: unknown })?.message === 'string'
      ? (error as { message: string }).message
      : ''
    return /network error/i.test(message)
      ? { message: 'AI 服务连接失败，请确认本地 AI 服务已启动。' }
      : { message: message || '抱歉，我遇到了一些问题。请稍后再试。' }
  },
}))

vi.mock('@/modules/writer/composables/useWriterAssetCatalog', () => ({
  useWriterAssetCatalog: () => ({
    filteredAssets: ref([]),
    selectedAsset: ref(null),
    createAsset: createAssetMock,
    updateAsset: vi.fn(),
    deleteAsset: vi.fn(),
    buildGraphFocusTarget: vi.fn(),
    globalAssets: computed(() => globalAssetsRef.value),
    loading: ref(false),
    categoryOptions: ref([]),
    emptyMessage: ref('暂无资产'),
    selectedDetailFields: ref([]),
    selectedStateFields: ref([]),
    selectedDataHint: ref(''),
    selectAsset: selectAssetMock,
  }),
}))

vi.mock('@/modules/writer/composables/useToolRightAssetActions', () => ({
  useToolRightAssetActions: () => ({
    selectedAsset: ref(null),
    assetEditorVisible: ref(false),
    assetEditorMode: ref('create'),
    assetEditorSubmitting: ref(false),
    assetEditorCategory: ref('characters'),
    handleAssetSelect: vi.fn(),
    handleCreateAsset: vi.fn(),
    handleEditAsset: vi.fn(),
    handleDeleteAsset: vi.fn(),
    handleAssetEditorSubmit: vi.fn(),
    handleOpenAssetsFullscreen: vi.fn(),
    handleOpenAssetGraph: vi.fn(),
  }),
}))

import { useToolRightAssets } from '../useToolRightAssets'

describe('useToolRightAssets', () => {
  beforeEach(() => {
    extractAssetsWithWorkbenchMock.mockReset()
    createAssetMock.mockReset()
    selectAssetMock.mockReset()
    globalAssetsRef.value = [
      {
        id: 'asset-global-1',
        category: 'characters',
        name: '林舟',
        totalReferenceCount: 3,
      },
    ]
  })

  it('应在编辑候选名时即时提示空名与全局重名，并在修正后恢复待创建', async () => {
    extractAssetsWithWorkbenchMock.mockResolvedValue({
      summary: '识别到 1 个候选资产。',
      candidates: [
        {
          name: '林雁',
          category: 'character',
          summary: '主视角人物。',
          evidence: '林雁回到城门口',
        },
      ],
    })

    const scope = effectScope()
    const assets = scope.run(() =>
      useToolRightAssets({
        projectId: computed(() => 'project-1'),
        chapterId: computed(() => 'chapter-1'),
        chapterTitle: computed(() => '第一章'),
        sourceText: computed(() => '林雁回到城门口。'),
        chapters: computed(() => [{ id: 'chapter-1', parentId: 'volume-1' }] as any),
      }),
    )

    expect(assets).toBeTruthy()
    await assets!.handleExtractAssets()

    const candidateId = assets!.assetListPanelProps.value.extractedCandidates[0]?.id as string
    expect(assets!.assetListPanelProps.value.extractedCandidates[0]).toEqual(
      expect.objectContaining({
        name: '林雁',
        status: 'pending',
        errorMessage: undefined,
      }),
    )

    assets!.handleUpdateExtractedAssetField(candidateId, 'name', '林舟')
    expect(assets!.assetListPanelProps.value.extractedCandidates[0]).toEqual(
      expect.objectContaining({
        name: '林舟',
        status: 'error',
        errorMessage: '已存在同名资产',
      }),
    )

    assets!.handleUpdateExtractedAssetField(candidateId, 'name', '   ')
    expect(assets!.assetListPanelProps.value.extractedCandidates[0]).toEqual(
      expect.objectContaining({
        status: 'error',
        errorMessage: '资产名称不能为空',
      }),
    )

    assets!.handleUpdateExtractedAssetField(candidateId, 'name', '林雁')
    expect(assets!.assetListPanelProps.value.extractedCandidates[0]).toEqual(
      expect.objectContaining({
        name: '林雁',
        status: 'pending',
        errorMessage: undefined,
      }),
    )

    scope.stop()
  })

  it('应在候选列表内重名时同步提示，并在修改后一起恢复', async () => {
    extractAssetsWithWorkbenchMock.mockResolvedValue({
      summary: '识别到 2 个候选资产。',
      candidates: [
        {
          name: '旧码头',
          category: 'location',
          summary: '故事发生地。',
        },
        {
          name: '旧码头',
          category: 'location',
          summary: '重复候选。',
        },
      ],
    })

    const scope = effectScope()
    const assets = scope.run(() =>
      useToolRightAssets({
        projectId: computed(() => 'project-1'),
        chapterId: computed(() => 'chapter-1'),
        chapterTitle: computed(() => '第一章'),
        sourceText: computed(() => '他们在旧码头碰面。'),
        chapters: computed(() => [{ id: 'chapter-1', parentId: 'volume-1' }] as any),
      }),
    )

    expect(assets).toBeTruthy()
    await assets!.handleExtractAssets()

    expect(assets!.assetListPanelProps.value.extractedCandidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: '旧码头',
          status: 'error',
          errorMessage: '候选列表中已有同名资产',
        }),
      ]),
    )

    const secondCandidateId = assets!.assetListPanelProps.value.extractedCandidates[1]?.id as string
    assets!.handleUpdateExtractedAssetField(secondCandidateId, 'name', '新码头')

    expect(assets!.assetListPanelProps.value.extractedCandidates).toEqual([
      expect.objectContaining({
        name: '旧码头',
        status: 'pending',
        errorMessage: undefined,
      }),
      expect.objectContaining({
        name: '新码头',
        status: 'pending',
        errorMessage: undefined,
      }),
    ])

    scope.stop()
  })

  it('应把提取阶段的网络错误映射为本地 AI 服务提示', async () => {
    extractAssetsWithWorkbenchMock.mockRejectedValue({
      message: 'Network Error',
    })

    const scope = effectScope()
    const assets = scope.run(() =>
      useToolRightAssets({
        projectId: computed(() => 'project-1'),
        chapterId: computed(() => 'chapter-1'),
        chapterTitle: computed(() => '第一章'),
        sourceText: computed(() => '林雁回到城门口。'),
        chapters: computed(() => [{ id: 'chapter-1', parentId: 'volume-1' }] as any),
      }),
    )

    expect(assets).toBeTruthy()
    await assets!.handleExtractAssets()

    expect(assets!.assetListPanelProps.value.extractedAssetError).toBe(
      'AI 服务连接失败，请确认本地 AI 服务已启动。',
    )
    expect(assets!.assetListPanelProps.value.extractedCandidates).toEqual([])

    scope.stop()
  })
})
