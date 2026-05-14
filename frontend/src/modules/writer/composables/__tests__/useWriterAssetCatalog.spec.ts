import { computed, defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const assetRefState = ref({
  chapterRefs: {} as Record<string, Array<{ assetType: string; assetId?: string; assetName: string }>>,
  volumeRefs: {} as Record<string, Array<{ assetType: string; assetId?: string; assetName: string }>>,
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
    let catalog: ReturnType<typeof useWriterAssetCatalog> | null = null

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

    catalog?.selectAsset(catalog.filteredAssets.value[0] || null)
    expect(catalog?.selectedDetailFields.value).toEqual(
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

    expect(catalog?.selectedAsset.value?.chapterReferenceCount).toBe(1)
    expect(catalog?.selectedDetailFields.value).toEqual(
      expect.arrayContaining([
        { label: '最近章节', value: '第1章' },
        { label: '提及章节', value: '1 章' },
        { label: '关联结构节点', value: '1' },
      ]),
    )

    wrapper.unmount()
  })
})
