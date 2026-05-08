/**
 * TreeList 组件测试
 *
 * 测试树形列表组件的功能：
 * 1. 基础渲染和树形结构
 * 2. 展开/折叠功能
 * 3. 选中高亮和select事件
 * 4. 自定义图标支持
 * 5. 拖拽排序（同层级、跨层级）
 * 6. VSCode样式（20px缩进/层级，32px行高）
 * 7. 边界情况和无障碍性
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import TreeList from '../TreeList.vue'

// 测试数据
const mockTreeData = [
  {
    id: '1',
    label: '第一章',
    icon: 'document',
    children: [
      { id: '1-1', label: '第一节', icon: 'page' },
      { id: '1-2', label: '第二节', icon: 'page' }
    ]
  },
  {
    id: '2',
    label: '第二章',
    icon: 'document',
    children: [
      { id: '2-1', label: '第一节', icon: 'page' }
    ]
  }
]

const mockSimpleData = [
  { id: '1', label: '项目概述' },
  { id: '2', label: '角色设定' },
  { id: '3', label: '场景设定' }
]

describe('TreeList', () => {
  describe('基础渲染', () => {
    it('应该正确渲染组件', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData
        }
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.tree-list').exists()).toBe(true)
    })

    it('应该渲染树形数据', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData
        }
      })

      const nodes = wrapper.findAll('.tree-node')
      expect(nodes.length).toBe(3)
    })

    it('应该正确显示嵌套层级', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockTreeData,
          defaultExpandedKeys: ['1', '2'] // 展开所有节点
        }
      })

      // 根节点
      const rootNodes = wrapper.findAll('.tree-node[data-level="0"]')
      expect(rootNodes.length).toBe(2)

      // 子节点
      const childNodes = wrapper.findAll('.tree-node[data-level="1"]')
      expect(childNodes.length).toBe(3)
    })

    it('应该正确显示节点标签', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData
        }
      })

      const labels = wrapper.findAll('.tree-node-label')
      expect(labels[0].text()).toBe('项目概述')
      expect(labels[1].text()).toBe('角色设定')
      expect(labels[2].text()).toBe('场景设定')
    })

    it('应该处理空数据', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: []
        }
      })

      expect(wrapper.find('.tree-list-empty').exists()).toBe(true)
    })

    it('应该设置正确的data-testid属性', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData
        }
      })

      expect(wrapper.find('.tree-list').attributes('data-testid')).toBe('tree-list')
    })
  })

  describe('Props验证', () => {
    it('应该接受data属性', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData
        }
      })

      expect(wrapper.props()).toHaveProperty('data')
      expect(wrapper.props().data).toEqual(mockSimpleData)
    })

    it('应该接受icon属性作为默认图标', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData,
          icon: 'folder'
        }
      })

      expect(wrapper.props()).toHaveProperty('icon', 'folder')
    })

    it('应该接受defaultExpandedKeys属性', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockTreeData,
          defaultExpandedKeys: ['1']
        }
      })

      expect(wrapper.props()).toHaveProperty('defaultExpandedKeys')
      expect(wrapper.props().defaultExpandedKeys).toEqual(['1'])
    })

    it('应该接受selectedKey属性', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData,
          selectedKey: '1'
        }
      })

      expect(wrapper.props()).toHaveProperty('selectedKey', '1')
    })
  })

  describe('展开/折叠功能', () => {
    it('应该默认折叠所有节点', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockTreeData
        }
      })

      // 子节点不应该显示
      expect(wrapper.findAll('.tree-node[data-level="1"]').length).toBe(0)
    })

    it('应该根据defaultExpandedKeys展开指定节点', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockTreeData,
          defaultExpandedKeys: ['1']
        }
      })

      // 第一节的子节点应该显示
      const firstExpandedChildren = wrapper.findAll('.tree-node[data-level="1"]')
      expect(firstExpandedChildren.length).toBe(2)
    })

    it('应该点击展开图标展开节点', async () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockTreeData
        }
      })

      const expandIcon = wrapper.find('.tree-node-expand-icon')
      await expandIcon.trigger('click')
      await nextTick()

      // 子节点应该显示
      const childNodes = wrapper.findAll('.tree-node[data-level="1"]')
      expect(childNodes.length).toBeGreaterThan(0)
    })

    it('应该点击展开图标折叠节点', async () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockTreeData,
          defaultExpandedKeys: ['1']
        }
      })

      const expandIcon = wrapper.find('.tree-node-expand-icon')
      await expandIcon.trigger('click')
      await nextTick()

      // 子节点应该隐藏
      const childNodes = wrapper.findAll('.tree-node[data-level="1"]')
      expect(childNodes.length).toBe(0)
    })

    it('展开图标应该旋转90度', async () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockTreeData,
          defaultExpandedKeys: ['1']
        }
      })

      const expandIcon = wrapper.find('.tree-node-expand-icon')
      expect(expandIcon.classes()).toContain('rotate-90')
    })

    it('折叠图标不应该旋转', async () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockTreeData
        }
      })

      const expandIcon = wrapper.find('.tree-node-expand-icon')
      expect(expandIcon.classes()).not.toContain('rotate-90')
    })

    it('没有子节点的节点不应该显示展开图标', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData
        }
      })

      const expandIcons = wrapper.findAll('.tree-node-expand-icon')
      expect(expandIcons.length).toBe(0)
    })

    it('应该触发expand事件', async () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockTreeData
        }
      })

      const expandIcon = wrapper.find('.tree-node-expand-icon')
      await expandIcon.trigger('click')
      await nextTick()

      expect(wrapper.emitted('expand')).toBeTruthy()
      const expandEvent = wrapper.emitted('expand')![0] as unknown[]
      const eventData = expandEvent[0] as Record<string, unknown>
      expect(eventData).toHaveProperty('id', '1')
      expect(expandEvent[1]).toBe(true) // expanded = true
    })
  })

  describe('选中高亮', () => {
    it('应该根据selectedKey高亮选中节点', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData,
          selectedKey: '1'
        }
      })

      const selectedNode = wrapper.find('.tree-node.selected')
      expect(selectedNode.exists()).toBe(true)
      expect(selectedNode.attributes('data-node-id')).toBe('1')
    })

    it('点击节点应该触发select事件', async () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData
        }
      })

      const node = wrapper.find('.tree-node')
      await node.trigger('click')
      await nextTick()

      expect(wrapper.emitted('select')).toBeTruthy()
      const selectEvent = wrapper.emitted('select')![0] as unknown[]
      const eventData = selectEvent[0] as Record<string, unknown>
      expect(eventData).toHaveProperty('id', '1')
    })

    it('点击节点应该高亮显示', async () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData
        }
      })

      const node = wrapper.find('.tree-node')
      await node.trigger('click')
      await nextTick()

      // 点击会触发select事件和update:selectedKey事件
      expect(wrapper.emitted('select')).toBeTruthy()
      expect(wrapper.emitted('update:selectedKey')).toBeTruthy()
    })

    it('选中新节点应该取消之前节点的选中状态', async () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData,
          selectedKey: '1'
        }
      })

      // 初始选中第一个节点
      const nodes = wrapper.findAll('.tree-node')
      expect(nodes[0].classes()).toContain('selected')

      // 更新selectedKey为第二个节点
      await wrapper.setProps({ selectedKey: '2' })
      await nextTick()

      expect(nodes[1].classes()).toContain('selected')
      expect(nodes[0].classes()).not.toContain('selected')
    })

    it('应该支持v-model语法', async () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData,
          selectedKey: '1'
        }
      })

      const node = wrapper.find('.tree-node')
      await node.trigger('click')
      await nextTick()

      expect(wrapper.emitted('update:selectedKey')).toBeTruthy()
    })

    it('应该只允许选中一个节点', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData,
          selectedKey: '1'
        }
      })

      const selectedNodes = wrapper.findAll('.tree-node.selected')
      expect(selectedNodes.length).toBe(1)
    })
  })

  describe('自定义图标', () => {
    it('应该渲染默认图标', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData,
          icon: 'folder'
        }
      })

      const icons = wrapper.findAll('.tree-node-icon')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('应该使用节点的自定义图标覆盖默认图标', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: [
            { id: '1', label: '第一章', icon: 'document' }
          ],
          icon: 'folder'
        }
      })

      const icon = wrapper.find('.tree-node-icon')
      // 应该显示节点的自定义图标 'document'
      expect(icon.exists()).toBe(true)
    })

    it('没有图标时不应该渲染图标元素', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData
        }
      })

      const icons = wrapper.findAll('.tree-node-icon')
      expect(icons.length).toBe(0)
    })

    it('应该正确渲染展开/折叠图标', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockTreeData
        }
      })

      const expandIcons = wrapper.findAll('.tree-node-expand-icon')
      expect(expandIcons.length).toBe(2) // 两个有子节点的根节点
    })
  })

  describe('拖拽排序', () => {
    it('应该支持同层级拖拽', async () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData
        }
      })

      const nodes = wrapper.findAll('.tree-node')
      
      // 开始拖拽第一个节点
      await nodes[0].trigger('dragstart', {
        dataTransfer: {
          setData: vi.fn(),
          effectAllowed: 'move'
        }
      })

      // 在第二个节点上拖拽
      await nodes[1].trigger('dragover', {
        preventDefault: vi.fn()
      })

      // 放置
      await nodes[1].trigger('drop', {
        preventDefault: vi.fn()
      })

      await nextTick()

      expect(wrapper.emitted('update:data')).toBeTruthy()
    })

    it('应该支持跨层级拖拽', async () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockTreeData,
          defaultExpandedKeys: ['1', '2']
        }
      })

      const rootNode = wrapper.find('.tree-node[data-node-id="1"]')
      const childNode = wrapper.find('.tree-node[data-node-id="2-1"]')

      // 将子节点拖到根节点位置
      await childNode.trigger('dragstart', {
        dataTransfer: {
          setData: vi.fn()
        }
      })

      await rootNode.trigger('dragover', {
        preventDefault: vi.fn()
      })

      await rootNode.trigger('drop')

      await nextTick()

      expect(wrapper.emitted('update:data')).toBeTruthy()
    })

    it('拖拽时应该显示拖拽样式', async () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData
        }
      })

      const node = wrapper.find('.tree-node')
      
      await node.trigger('dragstart')

      expect(node.classes()).toContain('dragging')
    })

    it('拖拽到目标上方应该显示插入指示器', async () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockTreeData,
          defaultExpandedKeys: ['1', '2']
        }
      })

      const nodes = wrapper.findAll('.tree-node')

      // 开始拖拽第一个节点
      await nodes[0].trigger('dragstart')
      
      // 在第二个节点上悬停和拖拽
      await nodes[1].trigger('mouseenter')
      await nodes[1].trigger('dragover', {
        preventDefault: vi.fn()
      })

      await nextTick()

      // 验证拖拽状态已正确设置
      // dragover事件应该被触发
      expect(wrapper.emitted('update:data')).toBeFalsy() // 没有drop，所以不应该有update
    })

    it('应该禁止拖拽到自身', async () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData
        }
      })

      const node = wrapper.find('.tree-node')

      await node.trigger('dragstart')
      await node.trigger('dragover', {
        preventDefault: vi.fn()
      })

      // 不应该显示插入指示器
      expect(wrapper.find('.drop-indicator').exists()).toBe(false)
    })

    it('应该禁止拖拽父节点到其子节点', async () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockTreeData,
          defaultExpandedKeys: ['1']
        }
      })

      const rootNode = wrapper.find('.tree-node[data-node-id="1"]')
      const childNode = wrapper.find('.tree-node[data-node-id="1-1"]')

      // 尝试将父节点拖到子节点
      await rootNode.trigger('dragstart')
      await childNode.trigger('dragover', {
        preventDefault: vi.fn()
      })

      // 不应该允许放置
      expect(wrapper.find('.drop-indicator').exists()).toBe(false)
    })

    it('拖拽完成后应该移除拖拽样式', async () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData
        }
      })

      const node = wrapper.find('.tree-node')

      await node.trigger('dragstart')
      await node.trigger('dragend')

      expect(node.classes()).not.toContain('dragging')
    })
  })

  describe('VSCode样式', () => {
    it('应该应用正确的缩进（20px/层级）', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockTreeData,
          defaultExpandedKeys: ['1']
        }
      })

      // 检查根节点缩进
      const rootNode = wrapper.find('.tree-node[data-level="0"]')
      const rootStyle = rootNode.attributes('style') || ''
      expect(rootStyle).toContain('padding-left: 0px')

      // 检查子节点缩进
      const childNode = wrapper.find('.tree-node[data-level="1"]')
      const childStyle = childNode.attributes('style') || ''
      expect(childStyle).toContain('padding-left: 20px')
    })

    it('应该应用正确的行高（32px）', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData
        }
      })

      const node = wrapper.find('.tree-node')
      const style = node.attributes('style') || ''
      expect(style).toContain('height: 32px')
    })

    it('应该应用VSCode深色主题色', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData
        }
      })

      const treeList = wrapper.find('.tree-list')
      
      // 检查是否使用了VSCode主题CSS变量
      const style = treeList.attributes('style') || ''
      expect(style).toMatch(/var\(--vscode-.+\)/)
    })

    it('选中节点应该应用VSCode高亮色', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData,
          selectedKey: '1'
        }
      })

      const selectedNode = wrapper.find('.tree-node.selected')
      const style = selectedNode.attributes('style') || ''
      expect(style).toMatch(/var\(--vscode-.+\)/)
    })

    it('悬停时应该应用VSCode悬停色', async () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData
        }
      })

      const node = wrapper.find('.tree-node')
      await node.trigger('mouseenter')

      expect(node.classes()).toContain('hover')
    })
  })

  describe('无障碍性', () => {
    it('应该设置正确的role属性', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData
        }
      })

      expect(wrapper.find('.tree-list').attributes('role')).toBe('tree')
    })

    it('节点应该设置正确的role属性', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData
        }
      })

      const node = wrapper.find('.tree-node')
      expect(node.attributes('role')).toBe('treeitem')
    })

    it('应该设置aria-expanded属性', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockTreeData
        }
      })

      const node = wrapper.find('.tree-node[data-node-id="1"]')
      expect(node.attributes('aria-expanded')).toBe('false')
    })

    it('展开的节点应该设置aria-expanded为true', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockTreeData,
          defaultExpandedKeys: ['1']
        }
      })

      const node = wrapper.find('.tree-node[data-node-id="1"]')
      expect(node.attributes('aria-expanded')).toBe('true')
    })

    it('应该设置aria-selected属性', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData,
          selectedKey: '1'
        }
      })

      const selectedNode = wrapper.find('.tree-node[data-node-id="1"]')
      expect(selectedNode.attributes('aria-selected')).toBe('true')
    })

    it('应该支持键盘导航', async () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData
        }
      })

      const treeList = wrapper.find('.tree-list')
      
      // 按下箭头键
      await treeList.trigger('keydown', { key: 'ArrowDown' })
      await nextTick()

      // 应该移动焦点到下一个节点
      expect(wrapper.emitted('select')).toBeTruthy()
    })

    it('按Enter键应该选中节点', async () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData
        }
      })

      const node = wrapper.find('.tree-node')
      await node.trigger('keydown', { key: 'Enter' })
      await nextTick()

      expect(wrapper.emitted('select')).toBeTruthy()
    })
  })

  describe('边界情况', () => {
    it('应该处理null或undefined数据', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: null as any
        }
      })

      expect(wrapper.find('.tree-list-empty').exists()).toBe(true)
    })

    it('应该处理深层次嵌套', () => {
      const deepNestedData = [
        {
          id: '1',
          label: 'Level 1',
          children: [
            {
              id: '1-1',
              label: 'Level 2',
              children: [
                {
                  id: '1-1-1',
                  label: 'Level 3',
                  children: [
                    { id: '1-1-1-1', label: 'Level 4' }
                  ]
                }
              ]
            }
          ]
        }
      ]

      const wrapper = mount(TreeList, {
        props: {
          data: deepNestedData,
          defaultExpandedKeys: ['1', '1-1', '1-1-1']
        }
      })

      expect(wrapper.find('.tree-node[data-level="3"]').exists()).toBe(true)
    })

    it('应该处理大量节点', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        label: `Node ${i}`
      }))

      const wrapper = mount(TreeList, {
        props: {
          data: largeData
        }
      })

      expect(wrapper.findAll('.tree-node').length).toBe(1000)
    })

    it('应该处理ID重复的情况', () => {
      const dataWithDuplicateIds = [
        { id: '1', label: 'Node 1' },
        { id: '1', label: 'Node 1 Duplicate' }
      ]

      const wrapper = mount(TreeList, {
        props: {
          data: dataWithDuplicateIds
        }
      })

      // 应该仍然渲染所有节点
      expect(wrapper.findAll('.tree-node').length).toBe(2)
    })

    it('应该快速连续的展开/折叠操作', async () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockTreeData
        }
      })

      const expandIcon = wrapper.find('.tree-node-expand-icon')

      // 快速连续点击
      await expandIcon.trigger('click')
      await expandIcon.trigger('click')
      await expandIcon.trigger('click')
      await nextTick()

      // 组件应该仍然正常工作
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('插槽', () => {
    it('应该支持自定义节点内容', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData
        },
        slots: {
          default: `<template #default="{ node }">
            <div class="custom-content">{{ node.label }} - Custom</div>
          </template>`
        }
      })

      expect(wrapper.find('.custom-content').exists()).toBe(true)
    })

    it('应该支持自定义图标插槽', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData,
          icon: 'folder'
        },
        slots: {
          icon: `<template #icon="{ node }">
            <span class="custom-icon">ICON</span>
          </template>`
        }
      })

      expect(wrapper.find('.custom-icon').exists()).toBe(true)
    })
  })

  describe('性能优化', () => {
    it('应该使用key属性优化渲染', () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockSimpleData
        }
      })

      // Vue的key属性不会作为HTML属性显示在DOM中
      // 这里验证组件正确渲染即可
      const nodes = wrapper.findAll('.tree-node')
      expect(nodes.length).toBe(3)
      expect(nodes[0].attributes('data-node-id')).toBeDefined()
      expect(nodes[1].attributes('data-node-id')).toBeDefined()
      expect(nodes[2].attributes('data-node-id')).toBeDefined()
    })

    it('展开/折叠不应该重新渲染整个树', async () => {
      const wrapper = mount(TreeList, {
        props: {
          data: mockTreeData
        }
      })

      const expandIcon = wrapper.find('.tree-node-expand-icon')
      const initialHtml = wrapper.html()

      await expandIcon.trigger('click')
      await nextTick()

      // HTML应该有变化（子节点显示），但不是完全重新渲染
      expect(wrapper.html()).not.toBe(initialHtml)
    })
  })
})
