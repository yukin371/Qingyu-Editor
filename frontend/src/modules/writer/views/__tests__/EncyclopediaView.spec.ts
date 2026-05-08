import { describe, expect, it, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const loadCharacters = vi.fn().mockResolvedValue(undefined)
const loadLocations = vi.fn().mockResolvedValue(undefined)
const listEntities = vi.fn()
const listConcepts = vi.fn()

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
}))

vi.mock('../api/concept', () => ({
  conceptApi: {
    list: (...args: unknown[]) => listConcepts(...args),
  },
}))
vi.mock('@/modules/writer/api/concept', () => ({
  conceptApi: {
    list: (...args: unknown[]) => listConcepts(...args),
  },
}))
vi.mock('../utils/writerAssetRefs', () => ({
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
    listConcepts.mockReset()

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
    expect(wrapper.text()).toContain('最近章节')
    expect(wrapper.text()).toContain('伏笔与未确认资产候选暂不进入资产总览')

    const organizationChip = wrapper
      .findAll('button')
      .find((button) => button.text().includes('组织'))

    expect(organizationChip).toBeTruthy()
    await organizationChip!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('组织总览')
    expect(wrapper.text()).toContain('巡夜司')
    expect(wrapper.emitted('update:activeCategory')?.at(-1)).toEqual(['organizations'])
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
      .find((button) => button.text().includes('关系图谱'))

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
      .find((button) => button.text().includes('前往章节'))

    expect(chapterButton).toBeTruthy()
    await chapterButton!.trigger('click')

    expect(wrapper.emitted('jump-to-chapter')?.[0]).toEqual(['chapter-1'])
  })
})
