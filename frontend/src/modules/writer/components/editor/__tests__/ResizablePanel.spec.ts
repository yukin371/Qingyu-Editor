/**
 * ResizablePanel 组件测试
 *
 * 测试可调整大小面板组件的功能：
 * 1. 组件渲染
 * 2. DragHandle组件集成
 * 3. 拖拽功能
 * 4. 宽度约束（200-600px）
 * 5. panelStore集成
 * 6. localStorage持久化
 * 7. collapsible功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import ResizablePanel from '../ResizablePanel.vue'
import DragHandle from '@/modules/writer/components/DragHandle.vue'
import { usePanelStore } from '@/modules/writer/stores/panelStore'

describe('ResizablePanel', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    // 清除localStorage
    localStorage.clear()
    // Mock localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {}
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = String(value)
        },
        removeItem: (key: string) => {
          delete store[key]
        },
        clear: () => {
          store = {}
        },
      }
    })()
    vi.stubGlobal('localStorage', localStorageMock)
  })

  describe('组件渲染', () => {
    it('应该正确渲染组件', () => {
      const wrapper = mount(ResizablePanel, {
        props: {
          panelId: 'left',
          defaultWidth: 280,
          position: 'left',
        },
        global: {
          plugins: [pinia],
          stubs: {
            DragHandle: true,
          },
        },
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.resizable-panel').exists()).toBe(true)
    })

    it('应该设置正确的初始宽度', () => {
      const wrapper = mount(ResizablePanel, {
        props: {
          panelId: 'left',
          defaultWidth: 280,
          position: 'left',
        },
        global: {
          plugins: [pinia],
          stubs: {
            DragHandle: true,
          },
        },
      })

      const panel = wrapper.find('.resizable-panel')
      expect(panel.attributes('style')).toContain('width:')
    })

    it('应该应用正确的位置类', () => {
      const wrapper = mount(ResizablePanel, {
        props: {
          panelId: 'right',
          defaultWidth: 320,
          position: 'right',
        },
        global: {
          plugins: [pinia],
          stubs: {
            DragHandle: true,
          },
        },
      })

      expect(wrapper.find('.resizable-panel--right').exists()).toBe(true)
    })
  })

  describe('Props验证', () => {
    it('应该接受panelId属性', () => {
      const wrapper = mount(ResizablePanel, {
        props: {
          panelId: 'left',
          defaultWidth: 280,
          position: 'left',
        },
        global: {
          plugins: [pinia],
          stubs: {
            DragHandle: true,
          },
        },
      })

      expect(wrapper.props()).toHaveProperty('panelId', 'left')
    })

    it('应该接受position属性', () => {
      const wrapper = mount(ResizablePanel, {
        props: {
          panelId: 'left',
          defaultWidth: 280,
          position: 'left',
        },
        global: {
          plugins: [pinia],
          stubs: {
            DragHandle: true,
          },
        },
      })

      expect(wrapper.props()).toHaveProperty('position', 'left')
    })

    it('应该有默认的minWidth和maxWidth', () => {
      const wrapper = mount(ResizablePanel, {
        props: {
          panelId: 'left',
          defaultWidth: 280,
          position: 'left',
        },
        global: {
          plugins: [pinia],
          stubs: {
            DragHandle: true,
          },
        },
      })

      expect(wrapper.props()).toHaveProperty('minWidth', 200)
      expect(wrapper.props()).toHaveProperty('maxWidth', 600)
    })

    it('应该接受自定义的minWidth和maxWidth', () => {
      const wrapper = mount(ResizablePanel, {
        props: {
          panelId: 'left',
          defaultWidth: 280,
          position: 'left',
          minWidth: 250,
          maxWidth: 500,
        },
        global: {
          plugins: [pinia],
          stubs: {
            DragHandle: true,
          },
        },
      })

      expect(wrapper.props()).toHaveProperty('minWidth', 250)
      expect(wrapper.props()).toHaveProperty('maxWidth', 500)
    })

    it('应该接受collapsible属性', () => {
      const wrapper = mount(ResizablePanel, {
        props: {
          panelId: 'right',
          defaultWidth: 320,
          position: 'right',
          collapsible: true,
        },
        global: {
          plugins: [pinia],
          stubs: {
            DragHandle: true,
          },
        },
      })

      expect(wrapper.props()).toHaveProperty('collapsible', true)
    })
  })

  describe('DragHandle集成', () => {
    it('应该渲染DragHandle组件', () => {
      const wrapper = mount(ResizablePanel, {
        props: {
          panelId: 'left',
          defaultWidth: 280,
          position: 'left',
        },
        global: {
          plugins: [pinia],
          stubs: {
            DragHandle: false,
          },
        },
      })

      expect(wrapper.findComponent(DragHandle).exists()).toBe(true)
    })

    it('应该向DragHandle传递正确的position属性', () => {
      const wrapper = mount(ResizablePanel, {
        props: {
          panelId: 'left',
          defaultWidth: 280,
          position: 'left',
        },
        global: {
          plugins: [pinia],
          stubs: {
            DragHandle: false,
          },
        },
      })

      const dragHandle = wrapper.findComponent(DragHandle)
      expect(dragHandle.props('position')).toBe('left')
    })

    it('应该监听DragHandle的drag-start事件', async () => {
      const wrapper = mount(ResizablePanel, {
        props: {
          panelId: 'left',
          defaultWidth: 280,
          position: 'left',
        },
        global: {
          plugins: [pinia],
          stubs: {
            DragHandle: false,
          },
        },
      })

      const dragHandle = wrapper.findComponent(DragHandle)
      const dragStartEvent = {
        position: 'left' as const,
        startX: 100,
        startY: 0,
      }

      await dragHandle.vm.$emit('drag-start', dragStartEvent)

      // 验证组件开始拖拽状态
      expect((wrapper.vm as any).isDragging).toBe(true)
    })
  })

  describe('拖拽功能', () => {
    it('应该在拖拽时更新面板宽度', async () => {
      const wrapper = mount(ResizablePanel, {
        props: {
          panelId: 'left',
          defaultWidth: 280,
          position: 'left',
        },
        global: {
          plugins: [pinia],
          stubs: {
            DragHandle: false,
          },
        },
      })

      const dragHandle = wrapper.findComponent(DragHandle)

      // 开始拖拽
      await dragHandle.vm.$emit('drag-start', {
        position: 'left' as const,
        startX: 100,
        startY: 0,
      })

      // 模拟鼠标移动
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 0,
        buttons: 1,
      })
      window.dispatchEvent(mouseMoveEvent)
      await nextTick()

      // 验证宽度已更新
      const panel = wrapper.find('.resizable-panel')
      const style = panel.attributes('style') || ''
      // 新宽度应该约为 280 + (150 - 100) = 330
      expect(style).toContain('width:')
    })

    it('应该在鼠标松开时停止拖拽', async () => {
      const wrapper = mount(ResizablePanel, {
        props: {
          panelId: 'left',
          defaultWidth: 280,
          position: 'left',
        },
        global: {
          plugins: [pinia],
          stubs: {
            DragHandle: false,
          },
        },
      })

      const dragHandle = wrapper.findComponent(DragHandle)

      // 开始拖拽
      await dragHandle.vm.$emit('drag-start', {
        position: 'left' as const,
        startX: 100,
        startY: 0,
      })

      // 鼠标松开
      const mouseUpEvent = new MouseEvent('mouseup', {
        clientX: 150,
        clientY: 0,
      })
      window.dispatchEvent(mouseUpEvent)
      await nextTick()

      // 验证拖拽已停止
      expect((wrapper.vm as any).isDragging).toBe(false)
    })
  })

  describe('宽度约束', () => {
    it('应该限制最小宽度为200px', async () => {
      const wrapper = mount(ResizablePanel, {
        props: {
          panelId: 'left',
          defaultWidth: 250,
          position: 'left',
          minWidth: 200,
        },
        global: {
          plugins: [pinia],
          stubs: {
            DragHandle: false,
          },
        },
      })

      const dragHandle = wrapper.findComponent(DragHandle)

      // 开始拖拽，尝试将宽度减少到200px以下
      await dragHandle.vm.$emit('drag-start', {
        position: 'left' as const,
        startX: 100,
        startY: 0,
      })

      // 模拟鼠标移动，使新宽度为150px
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 0,
        clientY: 0,
        buttons: 1,
      })
      window.dispatchEvent(mouseMoveEvent)
      await nextTick()

      const panel = wrapper.find('.resizable-panel')
      const style = panel.attributes('style') || ''
      // 宽度应该被限制在200px
      expect(style).toContain('width: 200px')
    })

    it('应该限制最大宽度为600px', async () => {
      const wrapper = mount(ResizablePanel, {
        props: {
          panelId: 'left',
          defaultWidth: 500,
          position: 'left',
          maxWidth: 600,
        },
        global: {
          plugins: [pinia],
          stubs: {
            DragHandle: false,
          },
        },
      })

      const dragHandle = wrapper.findComponent(DragHandle)

      // 开始拖拽，尝试将宽度增加到600px以上
      await dragHandle.vm.$emit('drag-start', {
        position: 'left' as const,
        startX: 100,
        startY: 0,
      })

      // 模拟鼠标移动，使新宽度为700px
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 300,
        clientY: 0,
        buttons: 1,
      })
      window.dispatchEvent(mouseMoveEvent)
      await nextTick()

      const panel = wrapper.find('.resizable-panel')
      const style = panel.attributes('style') || ''
      // 宽度应该被限制在600px
      expect(style).toContain('width: 600px')
    })

    it('应该使用自定义的minWidth和maxWidth', async () => {
      const wrapper = mount(ResizablePanel, {
        props: {
          panelId: 'left',
          defaultWidth: 300,
          position: 'left',
          minWidth: 250,
          maxWidth: 500,
        },
        global: {
          plugins: [pinia],
          stubs: {
            DragHandle: false,
          },
        },
      })

      const dragHandle = wrapper.findComponent(DragHandle)

      // 测试最小宽度约束
      await dragHandle.vm.$emit('drag-start', {
        position: 'left' as const,
        startX: 100,
        startY: 0,
      })

      // 尝试将宽度减少到250px以下
      const mouseMoveEvent1 = new MouseEvent('mousemove', {
        clientX: -100,
        clientY: 0,
        buttons: 1,
      })
      window.dispatchEvent(mouseMoveEvent1)
      await nextTick()

      const panel = wrapper.find('.resizable-panel')
      const style1 = panel.attributes('style') || ''
      expect(style1).toContain('width: 250px')

      // 测试最大宽度约束
      const mouseMoveEvent2 = new MouseEvent('mousemove', {
        clientX: 300,
        clientY: 0,
        buttons: 1,
      })
      window.dispatchEvent(mouseMoveEvent2)
      await nextTick()

      const style2 = panel.attributes('style') || ''
      expect(style2).toContain('width: 500px')
    })
  })

  describe('panelStore集成', () => {
    it('应该从panelStore加载初始宽度', () => {
      // 预设localStorage
      localStorage.setItem(
        'qingyu_editor_panel_layout',
        JSON.stringify({
          leftWidth: 350,
          rightWidth: 400,
          rightCollapsed: false,
        }),
      )

      const wrapper = mount(ResizablePanel, {
        props: {
          panelId: 'left',
          defaultWidth: 280,
          position: 'left',
        },
        global: {
          plugins: [pinia],
          stubs: {
            DragHandle: true,
          },
        },
      })

      // 面板应该使用存储的宽度
      const panel = wrapper.find('.resizable-panel')
      const style = panel.attributes('style') || ''
      expect(style).toContain('width: 350px')
    })

    it('应该在拖拽结束时更新panelStore', async () => {
      const store = usePanelStore()

      const wrapper = mount(ResizablePanel, {
        props: {
          panelId: 'left',
          defaultWidth: 280,
          position: 'left',
        },
        global: {
          plugins: [pinia],
          stubs: {
            DragHandle: false,
          },
        },
      })

      const dragHandle = wrapper.findComponent(DragHandle)

      // 开始拖拽
      await dragHandle.vm.$emit('drag-start', {
        position: 'left' as const,
        startX: 100,
        startY: 0,
      })

      // 移动鼠标
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 0,
        buttons: 1,
      })
      window.dispatchEvent(mouseMoveEvent)
      await nextTick()

      // 停止拖拽
      const mouseUpEvent = new MouseEvent('mouseup', {
        clientX: 150,
        clientY: 0,
      })
      window.dispatchEvent(mouseUpEvent)
      await nextTick()

      // 验证panelStore已更新
      expect(store.leftWidth).toBe(330)
    })

    it('应该将新宽度保存到localStorage', async () => {
      const wrapper = mount(ResizablePanel, {
        props: {
          panelId: 'left',
          defaultWidth: 280,
          position: 'left',
        },
        global: {
          plugins: [pinia],
          stubs: {
            DragHandle: false,
          },
        },
      })

      const dragHandle = wrapper.findComponent(DragHandle)

      // 开始拖拽
      await dragHandle.vm.$emit('drag-start', {
        position: 'left' as const,
        startX: 100,
        startY: 0,
      })

      // 移动鼠标
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 120,
        clientY: 0,
        buttons: 1,
      })
      window.dispatchEvent(mouseMoveEvent)

      // 停止拖拽
      const mouseUpEvent = new MouseEvent('mouseup', {
        clientX: 120,
        clientY: 0,
      })
      window.dispatchEvent(mouseUpEvent)
      await nextTick()

      // 验证localStorage已保存
      const saved = localStorage.getItem('qingyu_editor_panel_layout')
      expect(saved).toBeTruthy()
      const parsed = JSON.parse(saved!)
      expect(parsed.leftWidth).toBe(300)
    })
  })

  describe('collapsible功能', () => {
    it('应该在collapsible为true时响应折叠状态类名', async () => {
      const store = usePanelStore()

      const wrapper = mount(ResizablePanel, {
        props: {
          panelId: 'right',
          defaultWidth: 320,
          position: 'right',
          collapsible: true,
        },
        global: {
          plugins: [pinia],
          stubs: {
            DragHandle: true,
          },
        },
      })

      store.setRightCollapsed(true)
      await nextTick()

      expect(wrapper.find('.resizable-panel--collapsed-right').exists()).toBe(true)
    })

    it('应该在collapsible为false时忽略折叠状态', async () => {
      const store = usePanelStore()

      const wrapper = mount(ResizablePanel, {
        props: {
          panelId: 'right',
          defaultWidth: 320,
          position: 'right',
          collapsible: false,
        },
        global: {
          plugins: [pinia],
          stubs: {
            DragHandle: true,
          },
        },
      })

      store.setRightCollapsed(true)
      await nextTick()

      expect(wrapper.find('.resizable-panel--collapsed-right').exists()).toBe(false)
    })

    it('应该在折叠时把面板宽度收为0', async () => {
      const store = usePanelStore()

      const wrapper = mount(ResizablePanel, {
        props: {
          panelId: 'right',
          defaultWidth: 320,
          position: 'right',
          collapsible: true,
        },
        global: {
          plugins: [pinia],
          stubs: {
            DragHandle: true,
          },
        },
      })

      store.setRightCollapsed(true)
      await nextTick()

      const panel = wrapper.find('.resizable-panel')
      const style = panel.attributes('style') || ''
      expect(style).toContain('width: 0px')
    })

    it('折叠时应该应用折叠宽度类', async () => {
      const store = usePanelStore()

      const wrapper = mount(ResizablePanel, {
        props: {
          panelId: 'right',
          defaultWidth: 320,
          position: 'right',
          collapsible: true,
        },
        global: {
          plugins: [pinia],
          stubs: {
            DragHandle: true,
          },
        },
      })

      store.setRightCollapsed(true)
      await nextTick()

      expect(wrapper.find('.resizable-panel--collapsed-right').exists()).toBe(true)
    })

    it('折叠状态改变时应该更新localStorage', async () => {
      const store = usePanelStore()

      mount(ResizablePanel, {
        props: {
          panelId: 'right',
          defaultWidth: 320,
          position: 'right',
          collapsible: true,
        },
        global: {
          plugins: [pinia],
          stubs: {
            DragHandle: true,
          },
        },
      })

      store.setRightCollapsed(true)
      await nextTick()

      const saved = localStorage.getItem('qingyu_editor_panel_layout')
      expect(saved).toBeTruthy()
      const parsed = JSON.parse(saved!)
      expect(parsed.rightCollapsed).toBe(true)
    })
  })

  describe('不同位置面板', () => {
    it('左侧面板拖拽应该向右增加宽度', async () => {
      const wrapper = mount(ResizablePanel, {
        props: {
          panelId: 'left',
          defaultWidth: 280,
          position: 'left',
        },
        global: {
          plugins: [pinia],
          stubs: {
            DragHandle: false,
          },
        },
      })

      const dragHandle = wrapper.findComponent(DragHandle)

      await dragHandle.vm.$emit('drag-start', {
        position: 'left' as const,
        startX: 100,
        startY: 0,
      })

      // 向右拖拽
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 0,
        buttons: 1,
      })
      window.dispatchEvent(mouseMoveEvent)
      await nextTick()

      const panel = wrapper.find('.resizable-panel')
      const style = panel.attributes('style') || ''
      // 新宽度 = 280 + (150 - 100) = 330
      expect(style).toContain('width: 330px')
    })

    it('右侧面板拖拽应该向左增加宽度', async () => {
      const wrapper = mount(ResizablePanel, {
        props: {
          panelId: 'right',
          defaultWidth: 320,
          position: 'right',
        },
        global: {
          plugins: [pinia],
          stubs: {
            DragHandle: false,
          },
        },
      })

      const dragHandle = wrapper.findComponent(DragHandle)

      await dragHandle.vm.$emit('drag-start', {
        position: 'right' as const,
        startX: 500,
        startY: 0,
      })

      // 向左拖拽（减少clientX）
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 450,
        clientY: 0,
        buttons: 1,
      })
      window.dispatchEvent(mouseMoveEvent)
      await nextTick()

      const panel = wrapper.find('.resizable-panel')
      const style = panel.attributes('style') || ''
      // 新宽度 = 320 + (500 - 450) = 370
      expect(style).toContain('width: 370px')
    })
  })

  describe('边界情况', () => {
    it('应该处理快速拖拽', async () => {
      const wrapper = mount(ResizablePanel, {
        props: {
          panelId: 'left',
          defaultWidth: 280,
          position: 'left',
        },
        global: {
          plugins: [pinia],
          stubs: {
            DragHandle: false,
          },
        },
      })

      const dragHandle = wrapper.findComponent(DragHandle)

      await dragHandle.vm.$emit('drag-start', {
        position: 'left' as const,
        startX: 100,
        startY: 0,
      })

      // 快速连续的鼠标移动
      for (let i = 0; i < 10; i++) {
        const mouseMoveEvent = new MouseEvent('mousemove', {
          clientX: 100 + i * 10,
          clientY: 0,
          buttons: 1,
        })
        window.dispatchEvent(mouseMoveEvent)
      }
      await nextTick()

      // 组件应该仍然正常工作
      expect((wrapper.vm as any).isDragging).toBe(true)
    })

    it('应该处理未完成的拖拽（鼠标离开窗口）', async () => {
      const wrapper = mount(ResizablePanel, {
        props: {
          panelId: 'left',
          defaultWidth: 280,
          position: 'left',
        },
        global: {
          plugins: [pinia],
          stubs: {
            DragHandle: false,
          },
        },
      })

      const dragHandle = wrapper.findComponent(DragHandle)

      await dragHandle.vm.$emit('drag-start', {
        position: 'left' as const,
        startX: 100,
        startY: 0,
      })

      // 组件通过 document 监听 mouseup 来结束拖拽
      document.dispatchEvent(new MouseEvent('mouseup'))
      await nextTick()

      // 拖拽应该停止
      expect((wrapper.vm as any).isDragging).toBe(false)
    })

    it('应该在组件卸载时清理事件监听器', async () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const wrapper = mount(ResizablePanel, {
        props: {
          panelId: 'left',
          defaultWidth: 280,
          position: 'left',
        },
        global: {
          plugins: [pinia],
          stubs: {
            DragHandle: false,
          },
        },
      })

      const dragHandle = wrapper.findComponent(DragHandle)

      await dragHandle.vm.$emit('drag-start', {
        position: 'left' as const,
        startX: 100,
        startY: 0,
      })

      // 卸载组件
      wrapper.unmount()
      await nextTick()

      // 应该清理事件监听器
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function) as any)
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function) as any)
    })
  })

  describe('插槽', () => {
    it('应该渲染默认插槽内容', () => {
      const wrapper = mount(ResizablePanel, {
        props: {
          panelId: 'left',
          defaultWidth: 280,
          position: 'left',
        },
        slots: {
          default: '<div class="test-content">Test Content</div>',
        },
        global: {
          plugins: [pinia],
          stubs: {
            DragHandle: true,
          },
        },
      })

      expect(wrapper.find('.test-content').exists()).toBe(true)
      expect(wrapper.find('.test-content').text()).toBe('Test Content')
    })
  })
})
