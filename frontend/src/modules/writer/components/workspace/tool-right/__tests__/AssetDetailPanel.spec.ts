import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AssetDetailPanel from '../AssetDetailPanel.vue'

const AssetDetailPanelUnderTest = AssetDetailPanel as any

const baseProps = {
  asset: {
    id: 'asset-1',
    name: '设定1',
    category: 'concepts',
    typeLabel: '概念',
    summary: '这是设定1',
    latestChapterId: 'chapter-1',
    latestChapterTitle: '第一章 开端',
    linkedNodeCount: 2,
    chapterReferenceCount: 3,
    volumeReferenceCount: 1,
    totalReferenceCount: 4,
    scopeView: 'global',
    raw: {},
  },
  detailFields: [
    { label: '最近章节', value: '第一章 开端' },
    { label: '提及章节', value: '3 章' },
    { label: '涉及卷', value: '1 卷' },
    { label: '关联结构节点', value: '2' },
  ],
  stateFields: [],
  dataHint: '聚合口径说明',
}

describe('AssetDetailPanel', () => {
  it('switches to mention tab and shows chapter reference info', async () => {
    const wrapper = mount(AssetDetailPanelUnderTest, {
      props: baseProps,
      global: {
        stubs: {
          QyIcon: true,
        },
      },
    })

    await wrapper.findAll('.asset-detail-content__tab')[1].trigger('click')

    expect(wrapper.text()).toContain('第一章 开端')
    expect(wrapper.text()).toContain('3 章 · 1 卷')
    expect(wrapper.text()).toContain('关联结构节点 2')
  })

  it('emits quick edit and delete actions from the header', async () => {
    const wrapper = mount(AssetDetailPanelUnderTest, {
      props: baseProps,
      global: {
        stubs: {
          QyIcon: true,
        },
      },
    })

    const buttons = wrapper.findAll('.asset-detail-header__ghost')
    await buttons[0].trigger('click')
    await buttons[buttons.length - 1].trigger('click')

    expect(wrapper.emitted('edit')).toEqual([[]])
    expect(wrapper.emitted('delete')).toEqual([[]])
  })

  it('renders unresolved local references as read-only', () => {
    const wrapper = mount(AssetDetailPanelUnderTest, {
      props: {
        ...baseProps,
        asset: {
          ...baseProps.asset,
          id: 'ref-1',
          name: '新势力',
          scopeView: 'chapter',
          isLocalProjection: true,
          unresolved: true,
        },
      },
      global: {
        stubs: {
          QyIcon: true,
        },
      },
    })

    expect(wrapper.text()).toContain('新势力')
    expect(wrapper.findAll('.asset-detail-header__ghost')).toHaveLength(2)
    expect(wrapper.text()).not.toContain('聚合口径说明')
  })
})
