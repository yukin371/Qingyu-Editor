import { computed, defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const assetRefState = ref({
  chapterRefs: {} as Record<string, any[]>,
  volumeRefs: {} as Record<string, any[]>,
})

const writerStoreState = {
  currentProjectId: 'project-1',
  outline: {
    tree: [
      {
        id: 'node-1',
        title: '第1章',
        documentId: 'chapter-1',
        children: [],
      },
    ],
  },
  characters: {
    list: [
      {
        id: 'char-1',
        projectId: 'project-1',
        name: '回归角色甲',
        alias: ['甲'],
        summary: '浏览器回归用角色',
        traits: ['冷静'],
        background: '背景',
      },
    ],
  },
  locations: {
    list: [],
  },
  loadCharacters: vi.fn().mockResolvedValue(undefined),
  loadLocations: vi.fn().mockResolvedValue(undefined),
}

vi.mock('@/modules/writer/stores/writerStore', () => ({
  useWriterStore: () => writerStoreState,
}))

vi.mock('@/modules/writer/api/entities', () => ({
  listEntities: vi.fn().mockResolvedValue([]),
  createLocalEntity: vi.fn(),
  updateLocalEntity: vi.fn(),
  deleteLocalEntity: vi.fn(),
}))

vi.mock('@/modules/writer/api/concept', () => ({
  conceptApi: {
    list: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/modules/writer/api/character', () => ({
  createCharacter: vi.fn(),
  updateCharacter: vi.fn(),
  deleteCharacter: vi.fn(),
}))

vi.mock('@/modules/writer/api/location', () => ({
  locationApi: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/modules/writer/composables/useWriterAssetRefState', () => ({
  useWriterAssetRefState: () => ({
    assetRefState: computed(() => assetRefState.value),
    reloadWriterAssetRefs: vi.fn(),
  }),
}))

import { useWriterAssetCatalog } from '../useWriterAssetCatalog'

describe('useWriterAssetCatalog', () => {
  beforeEach(() => {
    assetRefState.value = {
      chapterRefs: {},
      volumeRefs: {},
    }
  })

  it('应在引用统计更新后刷新当前选中资产详情', async () => {
    const activeCategory = ref<'characters'>('characters')
    const searchKeyword = ref('')
    let catalog!: ReturnType<typeof useWriterAssetCatalog>

    const Harness = defineComponent({
      setup() {
        catalog = useWriterAssetCatalog({
          projectId: computed(() => 'project-1'),
          chapters: computed(() => [
            {
              id: 'chapter-1',
              projectId: 'project-1',
              chapterNum: 1,
              title: '第1章',
              wordCount: 9,
              updatedAt: '2026-05-15T00:00:00.000Z',
              status: 'draft',
              nodeType: 'chapter',
            },
          ]),
          activeCategory,
          searchKeyword,
        })
        return () => null
      },
    })

    const wrapper = mount(Harness)
    await nextTick()
    await nextTick()

    catalog.selectAsset(catalog.filteredAssets.value[0] || null)
    expect(catalog.selectedDetailFields.value).toEqual(
      expect.arrayContaining([{ label: '提及章节', value: '0 章' }]),
    )

    assetRefState.value = {
      chapterRefs: {
        'chapter-1': [
          {
            assetType: 'character',
            assetId: 'char-1',
            assetName: '回归角色甲',
          },
        ],
      },
      volumeRefs: {},
    }
    await nextTick()

    expect(catalog.selectedAsset.value?.chapterReferenceCount).toBe(1)
    expect(catalog.selectedDetailFields.value).toEqual(
      expect.arrayContaining([
        { label: '最近章节', value: '第1章' },
        { label: '提及章节', value: '1 章' },
        { label: '关联结构节点', value: '1' },
      ]),
    )

    wrapper.unmount()
  })

  it('应把章节自动检出引用映射为只读局部资产列表', async () => {
    const activeCategory = ref<'characters'>('characters')
    const searchKeyword = ref('')
    const scopeView = ref<'chapter'>('chapter')
    let catalog!: ReturnType<typeof useWriterAssetCatalog>

    assetRefState.value = {
      chapterRefs: {
        'chapter-1': [
          {
            id: 'ref-1',
            assetType: 'character',
            assetId: 'char-1',
            assetName: '回归角色甲',
            scopeType: 'chapter',
            scopeId: 'chapter-1',
            source: 'mention',
            evidence: '回归角色甲',
            createdAt: '2026-05-16T00:00:00.000Z',
            updatedAt: '2026-05-16T00:00:00.000Z',
          },
          {
            id: 'ref-2',
            assetType: 'character',
            assetName: '未建档角色',
            scopeType: 'chapter',
            scopeId: 'chapter-1',
            source: 'mention',
            evidence: '未建档角色',
            unresolved: true,
            createdAt: '2026-05-16T00:00:00.000Z',
            updatedAt: '2026-05-16T00:00:00.000Z',
          },
        ],
      },
      volumeRefs: {},
    }

    const Harness = defineComponent({
      setup() {
        catalog = useWriterAssetCatalog({
          projectId: computed(() => 'project-1'),
          chapters: computed(() => [
            {
              id: 'chapter-1',
              projectId: 'project-1',
              chapterNum: 1,
              title: '第1章',
              wordCount: 9,
              updatedAt: '2026-05-15T00:00:00.000Z',
              status: 'draft',
              nodeType: 'chapter',
            },
          ]),
          activeCategory,
          searchKeyword,
          scopeView,
          chapterId: computed(() => 'chapter-1'),
        })
        return () => null
      },
    })

    const wrapper = mount(Harness)
    await nextTick()
    await nextTick()

    expect(catalog.categoryOptions.value[0].count).toBe(2)
    expect(catalog.filteredAssets.value).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'char-1',
          isLocalProjection: true,
          unresolved: false,
          referenceSource: '正文提及',
        }),
        expect.objectContaining({
          id: 'ref-2',
          isLocalProjection: true,
          unresolved: true,
          badge: '待确认',
        }),
      ]),
    )

    wrapper.unmount()
  })
})
