/**
 * usePanelResize 组合式函数测试
 *
 * 测试面板调整大小功能：
 * 1. 拖拽开始/结束逻辑
 * 2. 宽度计算正确
 * 3. 宽度约束（200-600px）
 * 4. panelStore状态更新
 * 5. 事件监听器清理
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePanelResize } from '../usePanelResize'
import { usePanelStore } from '@/modules/writer/stores/panelStore'

describe('usePanelResize', () => {
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
        setItem: (key: string, value: string) => { store[key] = String(value) },
        removeItem: (key: string) => { delete store[key] },
        clear: () => { store = {} }
      }
    })()
    vi.stubGlobal('localStorage', localStorageMock)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('初始化', () => {
    it('应该初始化响应式宽度', () => {
      const { currentWidth } = usePanelResize({
        panelId: 'left',
        defaultWidth: 280,
        minWidth: 200,
        maxWidth: 600
      })

      expect(currentWidth.value).toBe(280)
    })

    it('应该使用正确的默认宽度', () => {
      const { currentWidth } = usePanelResize({
        panelId: 'right',
        defaultWidth: 320,
        minWidth: 200,
        maxWidth: 600
      })

      expect(currentWidth.value).toBe(320)
    })

    it('应该从panelStore加载保存的宽度', () => {
      // 预设localStorage
      localStorage.setItem('qingyu_editor_panel_layout', JSON.stringify({
        leftWidth: 350,
        rightWidth: 400,
        rightCollapsed: false
      }))

      const { currentWidth } = usePanelResize({
        panelId: 'left',
        defaultWidth: 280,
        minWidth: 200,
        maxWidth: 600
      })

      expect(currentWidth.value).toBe(350)
    })

    it('应该初始化为非拖拽状态', () => {
      const { isDragging } = usePanelResize({
        panelId: 'left',
        defaultWidth: 280,
        minWidth: 200,
        maxWidth: 600
      })

      expect(isDragging.value).toBe(false)
    })
  })

  describe('拖拽开始', () => {
    it('应该设置拖拽状态为true', () => {
      const { isDragging, startDrag } = usePanelResize({
        panelId: 'left',
        defaultWidth: 280,
        minWidth: 200,
        maxWidth: 600
      })

      startDrag({
        position: 'left',
        startX: 100,
        startY: 0
      })

      expect(isDragging.value).toBe(true)
    })

    it('应该记录拖拽起始位置', () => {
      const { startDrag } = usePanelResize({
        panelId: 'left',
        defaultWidth: 280,
        minWidth: 200,
        maxWidth: 600
      })

      startDrag({
        position: 'left',
        startX: 100,
        startY: 0
      })

      // 内部状态应该记录起始位置
      // 这个测试需要通过行为验证
    })

    it('应该记录拖拽起始宽度', () => {
      const { startDrag } = usePanelResize({
        panelId: 'left',
        defaultWidth: 280,
        minWidth: 200,
        maxWidth: 600
      })

      startDrag({
        position: 'left',
        startX: 100,
        startY: 0
      })

      // 内部状态应该记录起始宽度
      // 这个测试需要通过行为验证
    })
  })

  describe('宽度计算', () => {
    it('左侧面板向右拖拽应该增加宽度', () => {
      const { currentWidth, startDrag, onDrag } = usePanelResize({
        panelId: 'left',
        defaultWidth: 280,
        minWidth: 200,
        maxWidth: 600
      })

      startDrag({
        position: 'left',
        startX: 100,
        startY: 0
      })

      // 向右拖拽50px
      onDrag({ clientX: 150, clientY: 0 } as MouseEvent)

      // 新宽度 = 280 + (150 - 100) = 330
      expect(currentWidth.value).toBe(330)
    })

    it('左侧面板向左拖拽应该减少宽度', () => {
      const { currentWidth, startDrag, onDrag } = usePanelResize({
        panelId: 'left',
        defaultWidth: 280,
        minWidth: 200,
        maxWidth: 600
      })

      startDrag({
        position: 'left',
        startX: 100,
        startY: 0
      })

      // 向左拖拽30px
      onDrag({ clientX: 70, clientY: 0 } as MouseEvent)

      // 新宽度 = 280 + (70 - 100) = 250
      expect(currentWidth.value).toBe(250)
    })

    it('右侧面板向左拖拽应该增加宽度', () => {
      const { currentWidth, startDrag, onDrag } = usePanelResize({
        panelId: 'right',
        defaultWidth: 320,
        minWidth: 200,
        maxWidth: 600
      })

      startDrag({
        position: 'right',
        startX: 500,
        startY: 0
      })

      // 向左拖拽50px
      onDrag({ clientX: 450, clientY: 0 } as MouseEvent)

      // 新宽度 = 320 + (500 - 450) = 370
      expect(currentWidth.value).toBe(370)
    })

    it('右侧面板向右拖拽应该减少宽度', () => {
      const { currentWidth, startDrag, onDrag } = usePanelResize({
        panelId: 'right',
        defaultWidth: 320,
        minWidth: 200,
        maxWidth: 600
      })

      startDrag({
        position: 'right',
        startX: 500,
        startY: 0
      })

      // 向右拖拽30px
      onDrag({ clientX: 530, clientY: 0 } as MouseEvent)

      // 新宽度 = 320 + (500 - 530) = 290
      expect(currentWidth.value).toBe(290)
    })
  })

  describe('宽度约束', () => {
    it('应该限制最小宽度为200px', () => {
      const { currentWidth, startDrag, onDrag } = usePanelResize({
        panelId: 'left',
        defaultWidth: 250,
        minWidth: 200,
        maxWidth: 600
      })

      startDrag({
        position: 'left',
        startX: 100,
        startY: 0
      })

      // 尝试向左拖拽超过最小宽度
      onDrag({ clientX: -100, clientY: 0 } as MouseEvent)

      // 宽度应该被限制在200px
      expect(currentWidth.value).toBe(200)
    })

    it('应该限制最大宽度为600px', () => {
      const { currentWidth, startDrag, onDrag } = usePanelResize({
        panelId: 'left',
        defaultWidth: 500,
        minWidth: 200,
        maxWidth: 600
      })

      startDrag({
        position: 'left',
        startX: 100,
        startY: 0
      })

      // 尝试向右拖拽超过最大宽度
      onDrag({ clientX: 300, clientY: 0 } as MouseEvent)

      // 宽度应该被限制在600px
      expect(currentWidth.value).toBe(600)
    })

    it('应该使用自定义的minWidth', () => {
      const { currentWidth, startDrag, onDrag } = usePanelResize({
        panelId: 'left',
        defaultWidth: 300,
        minWidth: 250,
        maxWidth: 600
      })

      startDrag({
        position: 'left',
        startX: 100,
        startY: 0
      })

      // 尝试向左拖拽超过自定义最小宽度
      onDrag({ clientX: -100, clientY: 0 } as MouseEvent)

      // 宽度应该被限制在250px
      expect(currentWidth.value).toBe(250)
    })

    it('应该使用自定义的maxWidth', () => {
      const { currentWidth, startDrag, onDrag } = usePanelResize({
        panelId: 'left',
        defaultWidth: 450,
        minWidth: 200,
        maxWidth: 500
      })

      startDrag({
        position: 'left',
        startX: 100,
        startY: 0
      })

      // 尝试向右拖拽超过自定义最大宽度
      onDrag({ clientX: 200, clientY: 0 } as MouseEvent)

      // 宽度应该被限制在500px
      expect(currentWidth.value).toBe(500)
    })

    it('在约束范围内应该正常工作', () => {
      const { currentWidth, startDrag, onDrag } = usePanelResize({
        panelId: 'left',
        defaultWidth: 300,
        minWidth: 200,
        maxWidth: 600
      })

      startDrag({
        position: 'left',
        startX: 100,
        startY: 0
      })

      // 在约束范围内拖拽
      onDrag({ clientX: 150, clientY: 0 } as MouseEvent)

      // 宽度应该正常更新
      expect(currentWidth.value).toBe(350)
    })
  })

  describe('panelStore集成', () => {
    it('应该更新panelStore的leftWidth', () => {
      const store = usePanelStore()

      const { startDrag, onDrag, stopDrag } = usePanelResize({
        panelId: 'left',
        defaultWidth: 280,
        minWidth: 200,
        maxWidth: 600
      })

      startDrag({
        position: 'left',
        startX: 100,
        startY: 0
      })

      onDrag({ clientX: 150, clientY: 0 } as MouseEvent)

      stopDrag()

      // 验证panelStore已更新
      expect(store.leftWidth).toBe(330)
    })

    it('应该更新panelStore的rightWidth', () => {
      const store = usePanelStore()

      const { startDrag, onDrag, stopDrag } = usePanelResize({
        panelId: 'right',
        defaultWidth: 320,
        minWidth: 200,
        maxWidth: 600
      })

      startDrag({
        position: 'right',
        startX: 500,
        startY: 0
      })

      onDrag({ clientX: 450, clientY: 0 } as MouseEvent)

      stopDrag()

      // 验证panelStore已更新
      expect(store.rightWidth).toBe(370)
    })

    it('应该在拖拽结束后更新panelStore', () => {
      const store = usePanelStore()

      const { startDrag, onDrag, stopDrag } = usePanelResize({
        panelId: 'left',
        defaultWidth: 280,
        minWidth: 200,
        maxWidth: 600
      })

      startDrag({
        position: 'left',
        startX: 100,
        startY: 0
      })

      onDrag({ clientX: 120, clientY: 0 } as MouseEvent)

      // 拖拽过程中，panelStore还未更新
      expect(store.leftWidth).toBe(280)

      stopDrag()

      // 拖拽结束后，panelStore应该更新
      expect(store.leftWidth).toBe(300)
    })

    it('应该将新宽度保存到localStorage', () => {
      const { startDrag, onDrag, stopDrag } = usePanelResize({
        panelId: 'left',
        defaultWidth: 280,
        minWidth: 200,
        maxWidth: 600
      })

      startDrag({
        position: 'left',
        startX: 100,
        startY: 0
      })

      onDrag({ clientX: 120, clientY: 0 } as MouseEvent)

      stopDrag()

      // 验证localStorage已保存
      const saved = localStorage.getItem('qingyu_editor_panel_layout')
      expect(saved).toBeTruthy()
      const parsed = JSON.parse(saved!)
      expect(parsed.leftWidth).toBe(300)
    })
  })

  describe('拖拽结束', () => {
    it('应该设置拖拽状态为false', () => {
      const { isDragging, startDrag, stopDrag } = usePanelResize({
        panelId: 'left',
        defaultWidth: 280,
        minWidth: 200,
        maxWidth: 600
      })

      startDrag({
        position: 'left',
        startX: 100,
        startY: 0
      })

      expect(isDragging.value).toBe(true)

      stopDrag()

      expect(isDragging.value).toBe(false)
    })

    it('应该在拖拽结束后更新panelStore', () => {
      const store = usePanelStore()

      const { startDrag, onDrag, stopDrag } = usePanelResize({
        panelId: 'left',
        defaultWidth: 280,
        minWidth: 200,
        maxWidth: 600
      })

      startDrag({
        position: 'left',
        startX: 100,
        startY: 0
      })

      onDrag({ clientX: 120, clientY: 0 } as MouseEvent)

      stopDrag()

      expect(store.leftWidth).toBe(300)
    })

    it('未拖拽时调用stopDrag不应该更新panelStore', () => {
      const store = usePanelStore()

      const { stopDrag } = usePanelResize({
        panelId: 'left',
        defaultWidth: 280,
        minWidth: 200,
        maxWidth: 600
      })

      stopDrag()

      // panelStore应该保持不变
      expect(store.leftWidth).toBe(280)
    })
  })

  describe('事件监听器清理', () => {
    it('应该在组件卸载时清理mousemove监听器', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { cleanup } = usePanelResize({
        panelId: 'left',
        defaultWidth: 280,
        minWidth: 200,
        maxWidth: 600
      })

      cleanup()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
    })

    it('应该在组件卸载时清理mouseup监听器', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { cleanup } = usePanelResize({
        panelId: 'left',
        defaultWidth: 280,
        minWidth: 200,
        maxWidth: 600
      })

      cleanup()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
    })

    it('应该在组件卸载时停止拖拽', () => {
      const { isDragging, startDrag, cleanup } = usePanelResize({
        panelId: 'left',
        defaultWidth: 280,
        minWidth: 200,
        maxWidth: 600
      })

      startDrag({
        position: 'left',
        startX: 100,
        startY: 0
      })

      expect(isDragging.value).toBe(true)

      cleanup()

      expect(isDragging.value).toBe(false)
    })
  })

  describe('边界情况', () => {
    it('应该处理负的拖拽距离', () => {
      const { currentWidth, startDrag, onDrag } = usePanelResize({
        panelId: 'left',
        defaultWidth: 280,
        minWidth: 200,
        maxWidth: 600
      })

      startDrag({
        position: 'left',
        startX: 100,
        startY: 0
      })

      // 大幅向左拖拽
      onDrag({ clientX: -200, clientY: 0 } as MouseEvent)

      // 应该被限制在最小宽度
      expect(currentWidth.value).toBe(200)
    })

    it('应该处理非常大的拖拽距离', () => {
      const { currentWidth, startDrag, onDrag } = usePanelResize({
        panelId: 'left',
        defaultWidth: 280,
        minWidth: 200,
        maxWidth: 600
      })

      startDrag({
        position: 'left',
        startX: 100,
        startY: 0
      })

      // 大幅向右拖拽
      onDrag({ clientX: 1000, clientY: 0 } as MouseEvent)

      // 应该被限制在最大宽度
      expect(currentWidth.value).toBe(600)
    })

    it('应该处理零拖拽距离', () => {
      const { currentWidth, startDrag, onDrag } = usePanelResize({
        panelId: 'left',
        defaultWidth: 280,
        minWidth: 200,
        maxWidth: 600
      })

      startDrag({
        position: 'left',
        startX: 100,
        startY: 0
      })

      // 不移动鼠标
      onDrag({ clientX: 100, clientY: 0 } as MouseEvent)

      // 宽度应该保持不变
      expect(currentWidth.value).toBe(280)
    })

    it('应该处理在未开始拖拽时调用onDrag', () => {
      const { currentWidth, onDrag } = usePanelResize({
        panelId: 'left',
        defaultWidth: 280,
        minWidth: 200,
        maxWidth: 600
      })

      // 未开始拖拽就调用onDrag
      onDrag({ clientX: 150, clientY: 0 } as MouseEvent)

      // 宽度应该保持不变
      expect(currentWidth.value).toBe(280)
    })

    it('应该处理连续的拖拽', () => {
      const { currentWidth, startDrag, onDrag } = usePanelResize({
        panelId: 'left',
        defaultWidth: 280,
        minWidth: 200,
        maxWidth: 600
      })

      startDrag({
        position: 'left',
        startX: 100,
        startY: 0
      })

      // 连续多次拖拽
      onDrag({ clientX: 120, clientY: 0 } as MouseEvent)
      expect(currentWidth.value).toBe(300)

      onDrag({ clientX: 140, clientY: 0 } as MouseEvent)
      expect(currentWidth.value).toBe(320)

      onDrag({ clientX: 160, clientY: 0 } as MouseEvent)
      expect(currentWidth.value).toBe(340)
    })
  })

  describe('与panelStore同步', () => {
    it('应该响应panelStore的变化', () => {
      const store = usePanelStore()

      const { currentWidth } = usePanelResize({
        panelId: 'left',
        defaultWidth: 280,
        minWidth: 200,
        maxWidth: 600
      })

      expect(currentWidth.value).toBe(280)

      // 更新panelStore
      store.setLeftWidth(350)

      // currentWidth应该响应变化
      expect(currentWidth.value).toBe(350)
    })

    it('右侧面板应该响应rightCollapsed状态', () => {
      const store = usePanelStore()

      const { currentWidth } = usePanelResize({
        panelId: 'right',
        defaultWidth: 320,
        minWidth: 200,
        maxWidth: 600,
        collapsible: true
      })

      expect(currentWidth.value).toBe(320)

      // 折叠面板
      store.toggleRightCollapsed()

      // currentWidth应该变为0
      expect(currentWidth.value).toBe(0)
    })
  })
})
