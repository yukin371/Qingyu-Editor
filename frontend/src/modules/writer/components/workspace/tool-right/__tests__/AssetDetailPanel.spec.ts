import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AssetDetailPanel from '../AssetDetailPanel.vue'

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
    raw: {},
  },
  detailFields: [
    { label: '最近章节', value: '第一章 开端' },
    { label: '关联结构节点', value: '2' },
  ],
  stateFields: [],
  dataHint: '聚合口径说明',
}

describe('AssetDetailPanel', () => {
  it('switches to mention tab and shows chapter reference info', async () => {
    const wrapper = mount(AssetDetailPanel, {
      props: baseProps,
      global: {
        stubs: {
          QyIcon: true,
        },
      },
    })

    await wrapper.findAll('.asset-detail-panel__tab')[1].trigger('click')

    expect(wrapper.text()).toContain('第一章 开端')
    expect(wrapper.text()).toContain('关联结构节点 2')
  })
})
