import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import QyTree from '../QyTree/QyTree.vue'

const treeData = [
  {
    id: 'v1',
    title: '第一卷',
    children: [
      { id: 'c1', title: '第一章' },
      { id: 'c2', title: '第二章' },
    ],
  },
  {
    id: 'v2',
    title: '第二卷',
  },
]

describe('QyTree', () => {
  it('应渲染根节点', () => {
    const wrapper = mount(QyTree, {
      props: { data: treeData },
    })
    expect(wrapper.text()).toContain('第一卷')
    expect(wrapper.text()).toContain('第二卷')
    expect(wrapper.text()).not.toContain('第一章')
  })

  it('defaultExpandAll=true 时应展开子节点', () => {
    const wrapper = mount(QyTree, {
      props: { data: treeData, defaultExpandAll: true },
    })
    expect(wrapper.text()).toContain('第一章')
    expect(wrapper.text()).toContain('第二章')
  })

  it('点击节点应触发 select 和 update:selectedKeys', async () => {
    const wrapper = mount(QyTree, {
      props: { data: treeData },
    })

    const nodeButton = wrapper.findAll('.qy-tree-node__text').find((n) => n.text() === '第一卷')
    expect(nodeButton).toBeTruthy()
    await nodeButton!.trigger('click')

    const selectEvents = wrapper.emitted('select')
    const selectedKeyEvents = wrapper.emitted('update:selectedKeys') as unknown[][] | undefined
    expect(selectEvents).toBeTruthy()
    expect(selectedKeyEvents).toBeTruthy()
    expect((selectedKeyEvents?.[0]?.[0] as string[])[0]).toBe('v1')
  })

  it('拖拽节点应触发 drop-node', async () => {
    const wrapper = mount(QyTree, {
      props: { data: treeData, defaultExpandAll: true, draggable: true },
    })

    const labels = wrapper.findAll('.qy-tree-node__label')
    const from = labels[0]
    const to = labels[1]
    const dataTransfer = {
      getData: () => 'v1',
      setData: () => {},
    }

    await from.trigger('dragstart', { dataTransfer })
    await to.trigger('drop', { dataTransfer })

    const dropEvents = wrapper.emitted('drop-node') as unknown[][] | undefined
    expect(dropEvents).toBeTruthy()
    expect(dropEvents?.[0]?.[0]).toEqual({ dragId: 'v1', dropId: 'c1' })
  })
})
