import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AssetListPanel from '../AssetListPanel.vue'

const baseProps = {
  loading: false,
  searchKeyword: '',
  scopeView: 'global' as const,
  activeCategory: 'characters' as const,
  categoryOptions: [
    { id: 'characters' as const, label: '角色', count: 2 },
    { id: 'locations' as const, label: '地点', count: 1 },
  ],
  currentCategoryMeta: {
    title: '角色',
    eyebrow: 'Characters',
    copy: '角色资料',
  },
  assetScopeHint: '基于当前项目的资产聚合结果。',
  emptyMessage: '暂无资产',
  assets: [
    {
      id: 'asset-1',
      name: '林舟',
      summary: '戒备且沉默的主角。',
      typeLabel: '角色',
      badge: '主角',
      latestChapterId: 'chapter-1',
      scopeView: 'global' as const,
    },
    {
      id: 'asset-2',
      name: '旧码头',
      summary: '第一章冲突发生地。',
      typeLabel: '地点',
      badge: '',
      latestChapterId: 'chapter-2',
      scopeView: 'global' as const,
    },
  ],
  selectedAssetId: 'asset-1',
}

describe('AssetListPanel', () => {
  it('renders assets as compact file-list rows without inline summaries', () => {
    const wrapper = mount(AssetListPanel, {
      props: baseProps,
      global: {
        stubs: {
          QyIcon: true,
        },
      },
    })

    const items = wrapper.findAll('.asset-list-tree__item')

    expect(wrapper.findAll('.asset-list-tree__folder')).toHaveLength(2)
    expect(items).toHaveLength(2)
    expect(items[0].text()).toContain('林舟')
    expect(items[0].text()).toContain('角色')
    expect(items[0].text()).toContain('主角')
    expect(items[0].text()).not.toContain('戒备且沉默的主角。')
    expect(wrapper.find('.asset-list-panel__item-summary').exists()).toBe(false)
  })

  it('emits category selection from the explorer tree', async () => {
    const wrapper = mount(AssetListPanel, {
      props: baseProps,
      global: {
        stubs: {
          QyIcon: true,
        },
      },
    })

    await wrapper.findAll('.asset-list-tree__folder')[1].trigger('click')

    expect(wrapper.emitted('select-category')).toEqual([['locations']])
  })

  it('emits create-asset from the compact toolbar', async () => {
    const wrapper = mount(AssetListPanel, {
      props: baseProps,
      global: {
        stubs: {
          QyIcon: true,
        },
      },
    })

    await wrapper.get('.asset-list-panel__create-btn').trigger('click')

    expect(wrapper.emitted('create-asset')).toEqual([[]])
  })

  it('emits scope selection and renders local projection badges', async () => {
    const wrapper = mount(AssetListPanel, {
      props: {
        ...baseProps,
        scopeView: 'chapter',
        assets: [
          {
            ...baseProps.assets[0],
            scopeView: 'chapter' as const,
            isLocalProjection: true,
            referenceSource: '正文提及',
          },
          {
            ...baseProps.assets[1],
            id: 'ref-unresolved',
            scopeView: 'chapter' as const,
            isLocalProjection: true,
            unresolved: true,
          },
        ],
      },
      global: {
        stubs: {
          QyIcon: true,
        },
      },
    })

    await wrapper.findAll('.asset-list-panel__scope-tab')[2].trigger('click')

    expect(wrapper.emitted('update:scope-view')).toEqual([['volume']])
    expect(wrapper.text()).toContain('正文提及')
    expect(wrapper.text()).toContain('待确认')
    expect(wrapper.findAll('.asset-list-panel__create-btn')).toHaveLength(1)
  })
})
