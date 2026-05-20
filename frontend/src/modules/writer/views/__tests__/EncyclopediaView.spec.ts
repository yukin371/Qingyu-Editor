import { describe, expect, it, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const loadCharacters = vi.fn().mockResolvedValue(undefined)
const loadLocations = vi.fn().mockResolvedValue(undefined)
const listEntities = vi.fn()
const createCharacter = vi.fn()
const updateCharacter = vi.fn()
const deleteCharacter = vi.fn()
const createLocalEntity = vi.fn()
const updateLocalEntity = vi.fn()
const deleteLocalEntity = vi.fn()
const listConcepts = vi.fn()
const messageSuccess = vi.fn()
const messageError = vi.fn()
const messageConfirm = vi.fn()

const writerStoreState = {
  currentProjectId: 'project-1',
  outline: {
    tree: [
      {
        id: 'node-1',
        title: '第一幕',
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
        name: '林舟',
        alias: ['阿舟'],
        summary: '主角',
        traits: ['冷静'],
        background: '来自北境',
      },
    ],
  },
  locations: {
    list: [
      {
        id: 'loc-1',
        projectId: 'project-1',
        name: '云港',
        description: '重要港口',
        climate: '温润',
      },
    ],
  },
  loadCharacters,
  loadLocations,
}

vi.mock('../stores/writerStore', () => ({
  useWriterStore: () => writerStoreState,
}))
vi.mock('@/modules/writer/stores/writerStore', () => ({
  useWriterStore: () => writerStoreState,
}))

vi.mock('../api/entities', () => ({
  listEntities: (...args: unknown[]) => listEntities(...args),
}))
vi.mock('@/modules/writer/api/entities', () => ({
  listEntities: (...args: unknown[]) => listEntities(...args),
  createLocalEntity: (...args: unknown[]) => createLocalEntity(...args),
  updateLocalEntity: (...args: unknown[]) => updateLocalEntity(...args),
  deleteLocalEntity: (...args: unknown[]) => deleteLocalEntity(...args),
}))

vi.mock('@/modules/writer/api/character', () => ({
  createCharacter: (...args: unknown[]) => createCharacter(...args),
  updateCharacter: (...args: unknown[]) => updateCharacter(...args),
  deleteCharacter: (...args: unknown[]) => deleteCharacter(...args),
}))

vi.mock('@/modules/writer/api/location', () => ({
  locationApi: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('../api/concept', () => ({
  conceptApi: {
    list: (...args: unknown[]) => listConcepts(...args),
  },
}))
vi.mock('@/modules/writer/api/concept', () => ({
  conceptApi: {
    list: (...args: unknown[]) => listConcepts(...args),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/design-system/services', () => ({
  message: {
    success: (...args: unknown[]) => messageSuccess(...args),
    error: (...args: unknown[]) => messageError(...args),
  },
  messageBox: {
    confirm: (...args: unknown[]) => messageConfirm(...args),
  },
}))
vi.mock('../utils/writerAssetRefs', () => ({
  WRITER_ASSET_REFS_UPDATED_EVENT: 'qingyu:writer-asset-refs-updated',
  createWriterAssetRefKey: (assetType: string, assetId?: string, assetName?: string) =>
    `${assetType}:${assetId || assetName}`,
  buildWriterAssetReferenceProjection: () =>
    new Map([
      [
        'character:char-1',
        {
          key: 'character:char-1',
          assetType: 'character',
          assetId: 'char-1',
          assetName: '林舟',
          totalReferenceCount: 1,
          chapterReferenceCount: 1,
          volumeReferenceCount: 0,
          latestChapterId: 'chapter-1',
          latestUpdatedAt: '2026-04-14T00:00:00.000Z',
          chapterIds: ['chapter-1'],
          volumeIds: [],
          unresolved: false,
        },
      ],
      [
        'item:item-1',
        {
          key: 'item:item-1',
          assetType: 'item',
          assetId: 'item-1',
          assetName: '青铜钥匙',
          totalReferenceCount: 1,
          chapterReferenceCount: 1,
          volumeReferenceCount: 0,
          latestChapterId: 'chapter-1',
          latestUpdatedAt: '2026-04-14T00:00:00.000Z',
          chapterIds: ['chapter-1'],
          volumeIds: [],
          unresolved: false,
        },
      ],
    ]),
  loadWriterAssetRefState: () => ({
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
          createdAt: '2026-04-14T00:00:00.000Z',
          updatedAt: '2026-04-14T00:00:00.000Z',
        },
        {
          id: 'ref-2',
          assetType: 'item',
          assetId: 'item-1',
          assetName: '青铜钥匙',
          scopeType: 'chapter',
          scopeId: 'chapter-1',
          source: 'mention',
          createdAt: '2026-04-14T00:00:00.000Z',
          updatedAt: '2026-04-14T00:00:00.000Z',
        },
      ],
    },
    volumeRefs: {},
  }),
}))
vi.mock('@/modules/writer/utils/writerAssetRefs', () => ({
  WRITER_ASSET_REFS_UPDATED_EVENT: 'qingyu:writer-asset-refs-updated',
  createWriterAssetRefKey: (assetType: string, assetId?: string, assetName?: string) =>
    `${assetType}:${assetId || assetName}`,
  buildWriterAssetReferenceProjection: () =>
    new Map([
      [
        'character:char-1',
        {
          key: 'character:char-1',
          assetType: 'character',
          assetId: 'char-1',
          assetName: '林舟',
          chapterIds: ['chapter-1'],
          volumeIds: ['volume-1'],
          totalReferenceCount: 2,
          latestChapterId: 'chapter-1',
          unresolved: false,
        },
      ],
      [
        'location:loc-1',
        {
          key: 'location:loc-1',
          assetType: 'location',
          assetId: 'loc-1',
          assetName: '云港',
          chapterIds: ['chapter-1'],
          volumeIds: [],
          totalReferenceCount: 1,
          latestChapterId: 'chapter-1',
          unresolved: false,
        },
      ],
      [
        'organization:org-1',
        {
          key: 'organization:org-1',
          assetType: 'organization',
          assetId: 'org-1',
          assetName: '北庭司',
          chapterIds: ['chapter-1'],
          volumeIds: [],
          totalReferenceCount: 1,
          latestChapterId: 'chapter-1',
          unresolved: false,
        },
      ],
      [
        'concept:concept-1',
        {
          key: 'concept:concept-1',
          assetType: 'concept',
          assetId: 'concept-1',
          assetName: '门禁法则',
          chapterIds: ['chapter-1'],
          volumeIds: [],
          totalReferenceCount: 1,
          latestChapterId: 'chapter-1',
          unresolved: false,
        },
      ],
    ]),
  loadWriterAssetRefState: () => ({
    chapterRefs: {
      'chapter-1': [
        {
          id: 'ref-1',
          assetType: 'character',
          assetId: 'char-1',
          assetName: '林舟',
          scopeType: 'chapter',
          scopeId: 'chapter-1',
        },
      ],
    },
    volumeRefs: {},
  }),
}))
vi.mock('@/modules/writer/utils/writerAssetRefs', () => ({
  WRITER_ASSET_REFS_UPDATED_EVENT: 'qingyu:writer-asset-refs-updated',
  createWriterAssetRefKey: (assetType: string, assetId?: string, assetName?: string) =>
    `${assetType}:${assetId || assetName}`,
  buildWriterAssetReferenceProjection: () =>
    new Map([
      [
        'character:char-1',
        {
          key: 'character:char-1',
          assetType: 'character',
          assetId: 'char-1',
          assetName: '林舟',
          totalReferenceCount: 1,
          chapterReferenceCount: 1,
          volumeReferenceCount: 0,
          latestChapterId: 'chapter-1',
          latestUpdatedAt: '2026-04-14T00:00:00.000Z',
          chapterIds: ['chapter-1'],
          volumeIds: [],
          unresolved: false,
        },
      ],
      [
        'item:item-1',
        {
          key: 'item:item-1',
          assetType: 'item',
          assetId: 'item-1',
          assetName: '青铜钥匙',
          totalReferenceCount: 1,
          chapterReferenceCount: 1,
          volumeReferenceCount: 0,
          latestChapterId: 'chapter-1',
          latestUpdatedAt: '2026-04-14T00:00:00.000Z',
          chapterIds: ['chapter-1'],
          volumeIds: [],
          unresolved: false,
        },
      ],
    ]),
  loadWriterAssetRefState: () => ({
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
          createdAt: '2026-04-14T00:00:00.000Z',
          updatedAt: '2026-04-14T00:00:00.000Z',
        },
        {
          id: 'ref-2',
          assetType: 'item',
          assetId: 'item-1',
          assetName: '青铜钥匙',
          scopeType: 'chapter',
          scopeId: 'chapter-1',
          source: 'mention',
          createdAt: '2026-04-14T00:00:00.000Z',
          updatedAt: '2026-04-14T00:00:00.000Z',
        },
      ],
    },
    volumeRefs: {},
  }),
}))

import EncyclopediaView from '../EncyclopediaView.vue'

describe('EncyclopediaView', () => {
  beforeEach(() => {
    loadCharacters.mockClear()
    loadLocations.mockClear()
    listEntities.mockReset()
    createCharacter.mockReset()
    updateCharacter.mockReset()
    deleteCharacter.mockReset()
    createLocalEntity.mockReset()
    updateLocalEntity.mockReset()
    deleteLocalEntity.mockReset()
    listConcepts.mockReset()
    messageSuccess.mockReset()
    messageError.mockReset()
    messageConfirm.mockReset()
    createCharacter.mockResolvedValue({ id: 'char-new' })
    updateCharacter.mockResolvedValue(undefined)
    deleteCharacter.mockResolvedValue(undefined)
    createLocalEntity.mockResolvedValue({ id: 'entity-new' })
    updateLocalEntity.mockResolvedValue(undefined)
    deleteLocalEntity.mockResolvedValue(undefined)
    messageConfirm.mockResolvedValue(undefined)

    listEntities.mockImplementation((_projectId: string, entityType?: string) => {
      if (entityType === 'item') {
        return Promise.resolve([
          {
            id: 'item-1',
            name: '青铜钥匙',
            entityType: 'item',
            summary: '关键道具',
          },
        ])
      }

      if (entityType === 'organization') {
        return Promise.resolve([
          {
            id: 'org-1',
            name: '巡夜司',
            entityType: 'organization',
            summary: '维护城内秩序',
          },
        ])
      }

      return Promise.resolve([])
    })

    listConcepts.mockResolvedValue({
      data: [
        {
          id: 'concept-1',
          projectId: 'project-1',
          name: '灵脉潮汐',
          summary: '世界规则',
          category: '世界观',
        },
      ],
    })
  })

  function mountView() {
    return mount(EncyclopediaView, {
      props: {
        projectId: 'project-1',
        embedded: true,
        chapters: [
          {
            id: 'chapter-1',
            projectId: 'project-1',
            chapterNum: 1,
            title: '第一章',
            wordCount: 1200,
            updatedAt: '2026-04-14T00:00:00.000Z',
            status: 'draft',
            nodeType: 'chapter',
          },
        ],
      },
      global: {
        stubs: {
          QyIcon: { template: '<span />' },
          SystemStatCard: {
            props: ['label', 'value'],
            template: '<div class="stat-card">{{ label }} {{ value }}</div>',
          },
          AssetQuickEditorDialog: {
            props: ['visible', 'mode', 'category', 'asset', 'submitting'],
            emits: ['update:visible', 'submit'],
            template:
              '<div v-if="visible" data-testid="asset-dialog"><button data-testid="submit-asset" @click="$emit(\'submit\', { category, name: mode === \'edit\' ? \'林舟改\' : \'新角色\', summary: \'摘要\' })">submit</button></div>',
          },
        },
      },
    })
  }

  it('展示五分类资产总览并支持切换到组织分类', async () => {
    const wrapper = mountView()
    await flushPromises()

    expect(loadCharacters).toHaveBeenCalledWith('project-1')
    expect(loadLocations).toHaveBeenCalledWith('project-1')
    expect(listEntities).toHaveBeenCalledWith('project-1', 'item')
    expect(listEntities).toHaveBeenCalledWith('project-1', 'organization')
    expect(wrapper.text()).toContain('角色')
    expect(wrapper.text()).toContain('地点')
    expect(wrapper.text()).toContain('物件')
    expect(wrapper.text()).toContain('组织')
    expect(wrapper.text()).toContain('概念')
    expect(wrapper.text()).toContain('第一章')
    expect(wrapper.text()).toContain('1 章')
    expect(wrapper.text()).toContain('0 卷')
    expect(wrapper.text()).toContain('伏笔与未确认资产候选暂不进入资产总览')

    const organizationChip = wrapper
      .findAll('button')
      .find((button) => button.text().includes('组织'))

    expect(organizationChip).toBeTruthy()
    await organizationChip!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('组织总览')
    expect(wrapper.text()).toContain('巡夜司')
    const events = wrapper.emitted('update:activeCategory') as unknown[][] | undefined
    expect(events?.[events.length - 1]).toEqual(['organizations'])
  })

  it('从资产详情可以跳到关系图谱和最近章节', async () => {
    const wrapper = mountView()
    await flushPromises()

    const characterChip = wrapper.findAll('button').find((button) => button.text().includes('角色'))
    await characterChip!.trigger('click')
    await flushPromises()

    const characterCard = wrapper.findAll('button').find((button) => button.text().includes('林舟'))
    await characterCard!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('第一章')
    expect(wrapper.text()).toContain('关联结构节点')

    const switchButton = wrapper
      .findAll('button')
      .find((button) => button.attributes('title') === '关系图谱')

    expect(switchButton).toBeTruthy()
    await switchButton!.trigger('click')

    expect(wrapper.emitted('focus-graph-asset')?.[0]).toEqual([
      {
        assetType: 'character',
        assetId: 'char-1',
        assetName: '林舟',
        latestChapterId: 'chapter-1',
      },
    ])
    expect(wrapper.emitted('switch-tool')?.[0]).toEqual(['relations'])

    const chapterButton = wrapper
      .findAll('button')
      .find((button) => button.attributes('title') === '前往章节')

    expect(chapterButton).toBeTruthy()
    await chapterButton!.trigger('click')

    expect(wrapper.emitted('jump-to-chapter')?.[0]).toEqual(['chapter-1'])
  })

  it('支持在资产总览中新建、编辑和删除全局资产', async () => {
    const wrapper = mountView()
    await flushPromises()

    await wrapper.get('.assets-view__primary-action').trigger('click')
    expect(wrapper.find('[data-testid="asset-dialog"]').exists()).toBe(true)
    await wrapper.get('[data-testid="submit-asset"]').trigger('click')
    await flushPromises()

    expect(createCharacter).toHaveBeenCalledWith(
      'project-1',
      expect.objectContaining({
        name: '新角色',
        summary: '摘要',
      }),
    )
    expect(messageSuccess).toHaveBeenCalledWith('资产已创建')

    const characterCard = wrapper.findAll('button').find((button) => button.text().includes('林舟'))
    await characterCard!.trigger('click')
    await flushPromises()

    const editButton = wrapper
      .findAll('button')
      .find((button) => button.attributes('title') === '编辑资产')
    expect(editButton).toBeTruthy()
    await editButton!.trigger('click')
    await wrapper.get('[data-testid="submit-asset"]').trigger('click')
    await flushPromises()

    expect(updateCharacter).toHaveBeenCalledWith(
      'char-1',
      'project-1',
      expect.objectContaining({
        name: '林舟改',
      }),
    )
    expect(messageSuccess).toHaveBeenCalledWith('资产已更新')

    const deleteButton = wrapper
      .findAll('button')
      .find((button) => button.attributes('title') === '删除资产')
    expect(deleteButton).toBeTruthy()
    await deleteButton!.trigger('click')
    await flushPromises()

    expect(messageConfirm).toHaveBeenCalledWith(
      expect.stringContaining('确定删除资产「林舟」吗？'),
      '删除资产',
      expect.objectContaining({ type: 'warning' }),
    )
    expect(deleteCharacter).toHaveBeenCalledWith('char-1', 'project-1')
    expect(messageSuccess).toHaveBeenCalledWith('资产已删除')
  })
})
