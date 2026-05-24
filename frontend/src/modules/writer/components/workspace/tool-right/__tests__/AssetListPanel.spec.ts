import { mount } from '@vue/test-utils'
import AssetListPanel from '../AssetListPanel.vue'

const AssetListPanelUnderTest = AssetListPanel as any

const baseProps = {
  loading: false,
  searchKeyword: '',
  scopeView: 'global' as const,
  activeCategory: 'characters' as const,
  categoryOptions: [
    { id: 'characters' as const, label: '角色', count: 2 },
    { id: 'locations' as const, label: '地点', count: 1 },
  ],
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
  canExtractAssets: true,
  isExtractingAssets: false,
  isCreatingExtractedAssets: false,
  extractedAssetSummary: '',
  extractedAssetError: '',
  selectedExtractedAssetCount: 0,
  extractedCandidates: [],
}

describe('AssetListPanel', () => {
  it('renders assets as compact file-list rows without inline summaries', () => {
    const wrapper = mount(AssetListPanelUnderTest, {
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
    const wrapper = mount(AssetListPanelUnderTest, {
      props: baseProps,
      global: {
        stubs: {
          QyIcon: true,
        },
      },
    })

    await wrapper.findAll('.asset-list-tree__folder-main')[1].trigger('click')

    expect(wrapper.emitted('select-category')).toEqual([['locations']])
  })

  it('emits create-asset from the compact toolbar', async () => {
    const wrapper = mount(AssetListPanelUnderTest, {
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

  it('emits extract-assets from the toolbar and renders extracted candidates', async () => {
    const wrapper = mount(AssetListPanelUnderTest, {
      props: {
        ...baseProps,
        extractedAssetSummary: '识别到 2 个候选资产。',
        selectedExtractedAssetCount: 1,
        extractedCandidates: [
          {
            id: 'candidate-1',
            name: '林雁',
            category: 'characters' as const,
            categoryLabel: '角色',
            summary: '主视角人物。',
            evidence: '林雁回到潮声码头',
            selected: true,
            status: 'pending' as const,
          },
          {
            id: 'candidate-2',
            name: '潮声码头',
            category: 'locations' as const,
            categoryLabel: '地点',
            summary: '故事发生地。',
            selected: false,
            status: 'exists' as const,
          },
        ],
      },
      global: {
        stubs: {
          QyIcon: true,
        },
      },
    })

    await wrapper.get('.asset-list-panel__ai-btn').trigger('click')
    await wrapper.get('.asset-list-panel__extractor-apply').trigger('click')
    await wrapper.get('.asset-list-panel__extractor-check input').setValue(false)

    expect(wrapper.emitted('extract-assets')).toEqual([[]])
    expect(wrapper.emitted('create-selected-extracted-assets')).toEqual([[]])
    expect(wrapper.emitted('toggle-extracted-asset')).toEqual([['candidate-1', false]])
    expect(wrapper.text()).toContain('识别到 2 个候选资产。')
    expect(wrapper.text()).toContain('林雁')
    expect(wrapper.text()).toContain('潮声码头')
    expect(wrapper.text()).toContain('已存在')
  })

  it('emits extracted candidate field updates from inline edit controls', async () => {
    const wrapper = mount(AssetListPanelUnderTest, {
      props: {
        ...baseProps,
        extractedCandidates: [
          {
            id: 'candidate-1',
            name: '林雁',
            category: 'characters' as const,
            categoryLabel: '角色',
            summary: '主视角人物。',
            selected: true,
            status: 'pending' as const,
          },
        ],
      },
      global: {
        stubs: {
          QyIcon: true,
        },
      },
    })

    expect(wrapper.find('.asset-list-panel__extractor-form').exists()).toBe(false)

    await wrapper.get('.asset-list-panel__extractor-edit').trigger('click')
    await wrapper.get('.asset-list-panel__extractor-input').setValue('林雁（改）')
    await wrapper.get('.asset-list-panel__extractor-select').setValue('concepts')
    await wrapper.get('.asset-list-panel__extractor-textarea').setValue('新的摘要')

    expect(wrapper.emitted('update-extracted-asset-field')).toEqual([
      ['candidate-1', 'name', '林雁（改）'],
      ['candidate-1', 'writerCategory', 'concepts'],
      ['candidate-1', 'summary', '新的摘要'],
    ])
  })

  it('renders scope tabs from local to global and emits category quick-create', async () => {
    const wrapper = mount(AssetListPanelUnderTest, {
      props: baseProps,
      global: {
        stubs: {
          QyIcon: true,
        },
      },
    })

    expect(wrapper.findAll('.asset-list-panel__scope-tab').map((node) => node.text())).toEqual([
      '本章',
      '本卷',
      '全局',
    ])

    await wrapper.get('.asset-list-tree__folder-create').trigger('click')

    expect(wrapper.emitted('create-asset')).toEqual([['characters']])
  })

  it('does not render category quick-create in local scope views', () => {
    const wrapper = mount(AssetListPanelUnderTest, {
      props: {
        ...baseProps,
        scopeView: 'chapter',
      },
      global: {
        stubs: {
          QyIcon: true,
        },
      },
    })

    expect(wrapper.find('.asset-list-tree__folder-create').exists()).toBe(false)
  })

  it('emits scope selection and renders local projection badges', async () => {
    const wrapper = mount(AssetListPanelUnderTest, {
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

    await wrapper.findAll('.asset-list-panel__scope-tab')[1].trigger('click')

    expect(wrapper.emitted('update:scope-view')).toEqual([['volume']])
    expect(wrapper.text()).toContain('正文提及')
    expect(wrapper.text()).toContain('待确认')
    expect(wrapper.findAll('.asset-list-panel__create-btn')).toHaveLength(1)
  })
})
