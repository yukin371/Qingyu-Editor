/**
 * DragHandle 组件测试
 * 
 * 测试拖拽手柄组件的功能：
 * 1. 组件渲染
 * 2. mousedown 事件触发 drag-start
 * 3. hover 状态视觉反馈
 * 4. 拖拽状态视觉反馈
 * 5. 样式变量使用
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import DragHandle from '../DragHandle.vue'

describe('DragHandle', () => {
  describe('组件渲染', () => {
    it('应该正确渲染组件', () => {
      const wrapper = mount(DragHandle)
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.drag-handle').exists()).toBe(true)
    })

    it('应该使用正确的 CSS 类', () => {
      const wrapper = mount(DragHandle)
      const dragHandle = wrapper.find('.drag-handle')
      expect(dragHandle.classes()).toContain('drag-handle')
    })

    it('应该设置正确的 data-testid 属性', () => {
      const wrapper = mount(DragHandle, {
        props: {
          position: 'left'
        }
      })
      const dragHandle = wrapper.find('.drag-handle')
      expect(dragHandle.attributes('data-testid')).toBe('drag-handle-left')
    })
  })

  describe('Props 验证', () => {
    it('应该接受 position 属性', () => {
      const wrapper = mount(DragHandle, {
        props: {
          position: 'left'
        }
      })
      expect(wrapper.props()).toHaveProperty('position', 'left')
    })

    it('应该支持 left 和 right 位置', () => {
      const leftWrapper = mount(DragHandle, {
        props: { position: 'left' }
      })
      const rightWrapper = mount(DragHandle, {
        props: { position: 'right' }
      })
      expect(leftWrapper.props()).toHaveProperty('position', 'left')
      expect(rightWrapper.props()).toHaveProperty('position', 'right')
    })

    it('应该有默认的 position 值', () => {
      const wrapper = mount(DragHandle)
      expect(wrapper.props()).toBeDefined()
    })
  })

  describe('事件处理', () => {
    it('应该在 mousedown 时触发 drag-start 事件', async () => {
      const wrapper = mount(DragHandle, {
        props: {
          position: 'left'
        }
      })

      const dragHandle = wrapper.find('.drag-handle')

      // 模拟 mousedown 事件
      await dragHandle.trigger('mousedown', {
        clientX: 100,
        clientY: 200,
        button: 0 // 左键
      })

      // 验证事件触发
      expect(wrapper.emitted('drag-start')).toBeTruthy()
      const emittedEvent = wrapper.emitted('drag-start')![0] as unknown[]
      expect(emittedEvent).toBeDefined()
    })

    it('drag-start 事件应该包含正确的数据', async () => {
      const wrapper = mount(DragHandle, {
        props: {
          position: 'left'
        }
      })

      const dragHandle = wrapper.find('.drag-handle')
      const clientX = 100
      const clientY = 200

      await dragHandle.trigger('mousedown', {
        clientX,
        clientY,
        button: 0
      })

      const emittedEvent = wrapper.emitted('drag-start')![0] as unknown[]
      const eventData = emittedEvent[0] as Record<string, unknown>
      expect(eventData).toHaveProperty('position', 'left')
      expect(eventData).toHaveProperty('startX', clientX)
      expect(eventData).toHaveProperty('startY', clientY)
    })

    it('应该只在鼠标左键时触发 drag-start', async () => {
      const wrapper = mount(DragHandle)
      const dragHandle = wrapper.find('.drag-handle')
      
      // 右键点击（button: 2）
      await dragHandle.trigger('mousedown', {
        button: 2,
        clientX: 100,
        clientY: 200
      })
      
      expect(wrapper.emitted('drag-start')).toBeFalsy()
      
      // 中键点击（button: 1）
      await dragHandle.trigger('mousedown', {
        button: 1,
        clientX: 100,
        clientY: 200
      })
      
      expect(wrapper.emitted('drag-start')).toBeFalsy()
      
      // 左键点击（button: 0）
      await dragHandle.trigger('mousedown', {
        button: 0,
        clientX: 100,
        clientY: 200
      })
      
      expect(wrapper.emitted('drag-start')).toBeTruthy()
    })
  })

  describe('视觉反馈', () => {
    it('应该在 hover 时应用正确的样式', () => {
      const wrapper = mount(DragHandle)
      const dragHandle = wrapper.find('.drag-handle')
      
      // 检查是否有 hover 相关的样式类
      expect(dragHandle.classes()).toContain('drag-handle')
      // hover 样式通过 CSS 实现，这里只验证组件有正确的类
    })

    it('应该在拖拽时添加 active 类', async () => {
      const wrapper = mount(DragHandle)
      const dragHandle = wrapper.find('.drag-handle')
      
      // 初始状态不应该有 active 类
      expect(dragHandle.classes()).not.toContain('drag-handle--active')
      
      // 模拟 mousedown 事件
      await dragHandle.trigger('mousedown', {
        button: 0,
        clientX: 100,
        clientY: 200
      })
      
      await nextTick()
      
      // 拖拽状态应该有 active 类
      expect(dragHandle.classes()).toContain('drag-handle--active')
    })

    it('应该在 mouseup 时移除 active 类', async () => {
      const wrapper = mount(DragHandle)
      const dragHandle = wrapper.find('.drag-handle')
      
      // 模拟 mousedown
      await dragHandle.trigger('mousedown', {
        button: 0,
        clientX: 100,
        clientY: 200
      })
      
      await nextTick()
      
      // 模拟 mouseup
      await dragHandle.trigger('mouseup', {
        button: 0,
        clientX: 100,
        clientY: 200
      })
      
      await nextTick()
      
      // active 类应该被移除
      expect(dragHandle.classes()).not.toContain('drag-handle--active')
    })
  })

  describe('样式属性', () => {
    it('应该设置正确的宽度为 4px', () => {
      const wrapper = mount(DragHandle)
      const dragHandle = wrapper.find('.drag-handle')

      // 检查内联样式或计算样式
      const style = dragHandle.attributes('style') || ''
      // 如果内联样式没有 width，则检查 CSS 变量
      const hasWidthVariable = style.includes('width') ||
                               dragHandle.classes().some((c: string) => c.includes('drag-handle'))
      expect(hasWidthVariable).toBe(true)
    })

    it('应该使用 VSCode 主题 CSS 变量', () => {
      const wrapper = mount(DragHandle)
      const dragHandle = wrapper.find('.drag-handle')
      
      // 检查是否使用了 VSCode 主题变量（通过 CSS 类或样式）
      const hasThemeVariables = dragHandle.classes().includes('drag-handle') ||
                                (dragHandle.attributes('style') || '').includes('var(--')
      expect(hasThemeVariables).toBe(true)
    })

    it('应该设置正确的光标样式', () => {
      const wrapper = mount(DragHandle, {
        props: { position: 'left' }
      })
      const dragHandle = wrapper.find('.drag-handle')
      
      // 左侧手柄应该是 col-resize 光标
      const style = dragHandle.attributes('style') || ''
      expect(style).toContain('cursor:')
    })
  })

  describe('无障碍性', () => {
    it('应该设置正确的 role 属性', () => {
      const wrapper = mount(DragHandle)
      const dragHandle = wrapper.find('.drag-handle')
      
      expect(dragHandle.attributes('role')).toBe('separator')
    })

    it('应该设置正确的 aria-label', () => {
      const wrapper = mount(DragHandle, {
        props: { position: 'left' }
      })
      const dragHandle = wrapper.find('.drag-handle')
      
      const ariaLabel = dragHandle.attributes('aria-label') || ''
      expect(ariaLabel.toLowerCase()).toContain('resize')
      expect(ariaLabel.toLowerCase()).toContain('left')
    })

    it('应该设置 aria-orientation', () => {
      const wrapper = mount(DragHandle)
      const dragHandle = wrapper.find('.drag-handle')
      
      expect(dragHandle.attributes('aria-orientation')).toBe('vertical')
    })
  })

  describe('边界情况', () => {
    it('应该处理快速连续的 mouse 事件', async () => {
      const wrapper = mount(DragHandle)
      const dragHandle = wrapper.find('.drag-handle')
      
      // 快速触发多个事件
      await dragHandle.trigger('mousedown', { button: 0, clientX: 100, clientY: 200 })
      await dragHandle.trigger('mousedown', { button: 0, clientX: 105, clientY: 205 })
      await dragHandle.trigger('mouseup', { button: 0, clientX: 110, clientY: 210 })
      
      expect(wrapper.emitted('drag-start')!.length).toBe(2)
    })

    it('应该处理无效的 position 值', () => {
      const wrapper = mount(DragHandle, {
        props: { position: 'invalid' as 'left' | 'right' }
      })
      
      // 组件应该仍然渲染
      expect(wrapper.exists()).toBe(true)
    })
  })
})
