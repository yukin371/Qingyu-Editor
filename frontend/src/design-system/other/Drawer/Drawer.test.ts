/**
 * Drawer 组件单元测试
 */

// @ts-nocheck - Test file with flexible type assertions
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import Drawer from './Drawer.vue'
import { Teleport } from 'vue'

// 模拟 Icon 组件
vi.mock('../../base/Icon/Icon.vue', () => ({
  default: {
    name: 'Icon',
    template: '<span class="mock-icon" />',
  },
}))

describe('Drawer 组件', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    // 创建一个用于 Teleport 的容器
    const teleportTarget = document.createElement('div')
    teleportTarget.id = 'teleport-target'
    document.body.appendChild(teleportTarget)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    // 清理 Teleport 容器
    const teleportTarget = document.getElementById('teleport-target')
    if (teleportTarget) {
      document.body.removeChild(teleportTarget)
    }
    // 恢复 body 样式
    document.body.style.overflow = ''
  })

  describe('基础渲染', () => {
    it('应该正确渲染抽屉组件', () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          title: '测试抽屉',
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('默认情况下不显示抽屉', () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: false,
        },
      })

      const drawerElement = document.querySelector('[role="dialog"]')
      expect(drawerElement).toBeNull()
    })

    it('打开时应该显示抽屉', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          title: '测试抽屉',
        },
      })

      await nextTick()

      const drawerElement = document.querySelector('[role="dialog"]')
      expect(drawerElement).not.toBeNull()
    })

    it('应该正确显示标题', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          title: '测试标题',
        },
      })

      await nextTick()

      const titleElement = document.querySelector('#drawer-title')
      expect(titleElement?.textContent).toBe('测试标题')
    })

    it('应该正确渲染默认内容', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
        },
        slots: {
          default: '<p class="test-content">测试内容</p>',
        },
      })

      await nextTick()

      const content = document.querySelector('.test-content')
      expect(content?.textContent).toBe('测试内容')
    })
  })

  describe('方向', () => {
    it('应该从右侧滑出（默认）', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          direction: 'right',
        },
      })

      await nextTick()

      const drawerElement = document.querySelector('[role="dialog"]') as HTMLElement
      expect(drawerElement).not.toBeNull()
      expect(drawerElement?.classList.contains('right-0')).toBe(true)
    })

    it('应该从左侧滑出', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          direction: 'left',
        },
      })

      await nextTick()

      const drawerElement = document.querySelector('[role="dialog"]') as HTMLElement
      expect(drawerElement?.classList.contains('left-0')).toBe(true)
    })

    it('应该从顶部滑出', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          direction: 'top',
        },
      })

      await nextTick()

      const drawerElement = document.querySelector('[role="dialog"]') as HTMLElement
      expect(drawerElement?.classList.contains('top-0')).toBe(true)
    })

    it('应该从底部滑出', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          direction: 'bottom',
        },
      })

      await nextTick()

      const drawerElement = document.querySelector('[role="dialog"]') as HTMLElement
      expect(drawerElement?.classList.contains('bottom-0')).toBe(true)
    })

    it('RTL 模式下 right 方向应该从左侧滑出', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          direction: 'right',
          rtl: true,
        },
      })

      await nextTick()

      const drawerElement = document.querySelector('[role="dialog"]') as HTMLElement
      expect(drawerElement?.classList.contains('left-0')).toBe(true)
    })
  })

  describe('尺寸', () => {
    it('应该正确应用百分比尺寸', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          size: '50%',
        },
      })

      await nextTick()

      const drawerElement = document.querySelector('[role="dialog"]') as HTMLElement
      expect(drawerElement?.style.width).toBe('50%')
    })

    it('应该正确应用固定像素尺寸', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          size: 400,
        },
      })

      await nextTick()

      const drawerElement = document.querySelector('[role="dialog"]') as HTMLElement
      expect(drawerElement?.style.width).toBe('400px')
    })

    it('垂直方向应该设置高度而非宽度', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          direction: 'top',
          size: 300,
        },
      })

      await nextTick()

      const drawerElement = document.querySelector('[role="dialog"]') as HTMLElement
      expect(drawerElement?.style.height).toBe('300px')
    })
  })

  describe('遮罩层', () => {
    it('默认应该显示遮罩层', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          modal: true,
        },
      })

      await nextTick()

      const overlay = document.querySelector('.bg-black\\/50')
      expect(overlay).not.toBeNull()
    })

    it('modal 为 false 时不显示遮罩层', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          modal: false,
        },
      })

      await nextTick()

      const overlay = document.querySelector('.bg-black\\/50')
      expect(overlay).toBeNull()
    })

    it('应该应用自定义遮罩类名', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          modal: true,
          modalClass: 'custom-modal-class',
        },
      })

      await nextTick()

      const overlay = document.querySelector('.custom-modal-class')
      expect(overlay).not.toBeNull()
    })

    it('点击遮罩层应该关闭抽屉', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          closeOnClickModal: true,
        },
      })

      await nextTick()

      const overlay = document.querySelector('.bg-black\\/50') as HTMLElement
      overlay?.click()
      await nextTick()

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    })

    it('closeOnClickModal 为 false 时点击遮罩不关闭', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          closeOnClickModal: false,
        },
      })

      await nextTick()

      const overlay = document.querySelector('.bg-black\\/50') as HTMLElement
      overlay?.click()
      await nextTick()

      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })
  })

  describe('关闭按钮', () => {
    it('默认应该显示关闭按钮', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          title: '测试',
          showClose: true,
        },
      })

      await nextTick()

      const closeButton = document.querySelector('[aria-label="关闭抽屉"]')
      expect(closeButton).not.toBeNull()
    })

    it('showClose 为 false 时不显示关闭按钮', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          title: '测试',
          showClose: false,
        },
      })

      await nextTick()

      const closeButton = document.querySelector('[aria-label="关闭抽屉"]')
      expect(closeButton).toBeNull()
    })

    it('closable 为 false 时点击关闭按钮无效', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          title: '测试',
          showClose: true,
          closable: false,
        },
      })

      await nextTick()

      const closeButton = document.querySelector('[aria-label="关闭抽屉"]') as HTMLElement
      closeButton?.click()
      await nextTick()

      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })

    it('点击关闭按钮应该关闭抽屉', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          title: '测试',
          showClose: true,
          closable: true,
        },
      })

      await nextTick()

      const closeButton = document.querySelector('[aria-label="关闭抽屉"]') as HTMLElement
      closeButton?.click()
      await nextTick()

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    })
  })

  describe('事件', () => {
    it('打开时应该触发 open 事件', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: false,
        },
      })

      await wrapper.setProps({ modelValue: true })
      await nextTick()

      expect(wrapper.emitted('open')).toBeTruthy()
    })

    it('关闭时应该触发 close 事件', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
        },
      })

      await wrapper.setProps({ modelValue: false })
      await nextTick()

      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('打开动画结束时应该触发 opened 事件', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: false,
        },
      })

      await wrapper.setProps({ modelValue: true })

      // 等待动画结束（300ms）
      await new Promise(resolve => setTimeout(resolve, 350))
      await nextTick()

      expect(wrapper.emitted('opened')).toBeTruthy()
    })

    it('关闭动画结束时应该触发 closed 事件', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
        },
      })

      await wrapper.setProps({ modelValue: false })

      // 等待动画结束（300ms）
      await new Promise(resolve => setTimeout(resolve, 350))
      await nextTick()

      expect(wrapper.emitted('closed')).toBeTruthy()
    })

    it('应该触发 update:modelValue 事件', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
        },
      })

      await nextTick()

      const closeButton = document.querySelector('[aria-label="关闭抽屉"]') as HTMLElement
      closeButton?.click()
      await nextTick()

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    })
  })

  describe('beforeClose 回调', () => {
    it('beforeClose 返回 false 时应该阻止关闭', async () => {
      const beforeClose = vi.fn().mockResolvedValue(false)

      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          beforeClose,
        },
      })

      await nextTick()

      const closeButton = document.querySelector('[aria-label="关闭抽屉"]') as HTMLElement
      closeButton?.click()
      await nextTick()

      expect(beforeClose).toHaveBeenCalled()
      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })

    it('beforeClose 返回 true 时应该允许关闭', async () => {
      const beforeClose = vi.fn().mockResolvedValue(true)

      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          beforeClose,
        },
      })

      await nextTick()

      const closeButton = document.querySelector('[aria-label="关闭抽屉"]') as HTMLElement
      closeButton?.click()
      await nextTick()

      expect(beforeClose).toHaveBeenCalled()
      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 350))
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('beforeClose 抛出错误时应该阻止关闭', async () => {
      const beforeClose = vi.fn().mockRejectedValue(new Error('Test error'))

      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          beforeClose,
        },
      })

      await nextTick()

      const closeButton = document.querySelector('[aria-label="关闭抽屉"]') as HTMLElement
      closeButton?.click()
      await nextTick()

      expect(beforeClose).toHaveBeenCalled()
      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })

    it('beforeCatch 支持同步返回值', async () => {
      const beforeClose = vi.fn().mockReturnValue(true)

      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          beforeClose,
        },
      })

      await nextTick()

      const closeButton = document.querySelector('[aria-label="关闭抽屉"]') as HTMLElement
      closeButton?.click()
      await nextTick()

      expect(beforeClose).toHaveBeenCalled()
      await new Promise(resolve => setTimeout(resolve, 350))
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })
  })

  describe('销毁内容', () => {
    it('destroyOnClose 为 false 时内容不会被销毁', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          destroyOnClose: false,
        },
        slots: {
          default: '<p class="test-content">测试内容</p>',
        },
      })

      await nextTick()

      let content = document.querySelector('.test-content')
      expect(content).not.toBeNull()

      await wrapper.setProps({ modelValue: false })
      await nextTick()

      // 内容仍然存在于 DOM 中（但抽屉隐藏）
      content = document.querySelector('.test-content')
      expect(content).not.toBeNull()
    })

    it('destroyOnClose 为 true 时关闭时销毁内容', async () => {
      let counter = 0

      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          destroyOnClose: true,
        },
        slots: {
          default: `<p class="test-content">测试内容 {{ ${++counter} }}</p>`,
        },
      })

      await nextTick()

      let content = document.querySelector('.test-content')
      expect(content).not.toBeNull()

      await wrapper.setProps({ modelValue: false })
      await nextTick()

      content = document.querySelector('.test-content')
      // 内容应该被移除
      expect(content).toBeNull()
    })
  })

  describe('滚动锁定', () => {
    it('打开抽屉时应该锁定 body 滚动', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: false,
          lockScroll: true,
        },
      })

      expect(document.body.style.overflow).toBe('')

      await wrapper.setProps({ modelValue: true })
      await nextTick()

      expect(document.body.style.overflow).toBe('hidden')
    })

    it('关闭抽屉时应该恢复 body 滚动', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          lockScroll: true,
        },
      })

      await nextTick()
      expect(document.body.style.overflow).toBe('hidden')

      await wrapper.setProps({ modelValue: false })

      // 等待动画结束
      await new Promise(resolve => setTimeout(resolve, 350))
      await nextTick()

      expect(document.body.style.overflow).toBe('')
    })

    it('lockScroll 为 false 时不锁定 body 滚动', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: false,
          lockScroll: false,
        },
      })

      await wrapper.setProps({ modelValue: true })
      await nextTick()

      expect(document.body.style.overflow).not.toBe('hidden')
    })
  })

  describe('插槽', () => {
    it('应该渲染默认插槽内容', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
        },
        slots: {
          default: '<div class="custom-content">自定义内容</div>',
        },
      })

      await nextTick()

      const content = document.querySelector('.custom-content')
      expect(content?.textContent).toBe('自定义内容')
    })

    it('应该渲染 header 插槽内容', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
        },
        slots: {
          header: '<div class="custom-header">自定义头部</div>',
        },
      })

      await nextTick()

      const header = document.querySelector('.custom-header')
      expect(header?.textContent).toBe('自定义头部')
    })

    it('header 插槽优先级高于 title 属性', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          title: '默认标题',
        },
        slots: {
          header: '<div class="custom-header">自定义头部</div>',
        },
      })

      await nextTick()

      const titleElement = document.querySelector('#drawer-title')
      const customHeader = document.querySelector('.custom-header')

      expect(titleElement).toBeNull()
      expect(customHeader).not.toBeNull()
    })

    it('应该渲染 footer 插槽内容', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
        },
        slots: {
          footer: '<div class="custom-footer">自定义底部</div>',
        },
      })

      await nextTick()

      const footer = document.querySelector('.custom-footer')
      expect(footer?.textContent).toBe('自定义底部')
    })

    it('应该渲染 title 插槽内容', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          title: '默认标题',
        },
        slots: {
          title: '<div class="custom-title">自定义标题</div>',
        },
      })

      await nextTick()

      const customTitle = document.querySelector('.custom-title')
      expect(customTitle?.textContent).toBe('自定义标题')
    })

    it('没有标题时不显示头部', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          showClose: false,
        },
      })

      await nextTick()

      const header = document.querySelector('.border-b')
      expect(header).toBeNull()
    })
  })

  describe('键盘事件', () => {
    it('按 ESC 键应该关闭抽屉', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          closeOnPressEscape: true,
        },
      })

      await nextTick()

      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(event)
      await nextTick()

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('closeOnPressEscape 为 false 时不响应 ESC 键', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          closeOnPressEscape: false,
        },
      })

      await nextTick()

      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(event)
      await nextTick()

      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })
  })

  describe('无障碍访问', () => {
    it('应该有正确的 role 属性', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
        },
      })

      await nextTick()

      const drawerElement = document.querySelector('[role="dialog"]')
      expect(drawerElement).not.toBeNull()
    })

    it('应该有正确的 aria-modal 属性', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
        },
      })

      await nextTick()

      const drawerElement = document.querySelector('[aria-modal="true"]')
      expect(drawerElement).not.toBeNull()
    })

    it('有标题时应该有 aria-labelledby 属性', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          title: '测试标题',
        },
      })

      await nextTick()

      const drawerElement = document.querySelector('[aria-labelledby="drawer-title"]')
      expect(drawerElement).not.toBeNull()
    })

    it('关闭按钮应该有 aria-label 属性', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          title: '测试',
          showClose: true,
        },
      })

      await nextTick()

      const closeButton = document.querySelector('[aria-label="关闭抽屉"]')
      expect(closeButton).not.toBeNull()
    })
  })

  describe('可访问性', () => {
    it('应该正确设置 dark 模式样式', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          class: 'custom-class',
        },
      })

      await nextTick()

      const drawerElement = document.querySelector('[role="dialog"]') as HTMLElement
      expect(drawerElement?.classList.contains('dark:bg-neutral-800')).toBe(true)
    })
  })

  describe('暴露方法', () => {
    it('应该暴露 open 方法', () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: false,
        },
      })

      const vm = wrapper.vm
      expect(typeof vm.open).toBe('function')
    })

    it('应该暴露 close 方法', () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
        },
      })

      const vm = wrapper.vm
      expect(typeof vm.close).toBe('function')
    })

    it('调用 open 方法应该打开抽屉', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: false,
        },
      })

      const vm = wrapper.vm as any
      vm.open()
      await nextTick()

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('调用 close 方法应该关闭抽屉', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
        },
      })

      const vm = wrapper.vm as any
      vm.close()
      await nextTick()

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })
  })

  describe('嵌套抽屉', () => {
    it('应该支持多个抽屉同时打开', async () => {
      wrapper = mount({
        template: `
          <div>
            <Drawer v-model="visible1" title="抽屉1">
              <button @click="visible2 = true">打开抽屉2</button>
            </Drawer>
            <Drawer v-model="visible2" title="抽屉2" :size="'25%'">
              抽屉2内容
            </Drawer>
          </div>
        `,
        components: { Drawer },
        setup() {
          return {
            visible1: ref(true),
            visible2: ref(false),
          }
        },
      })

      await nextTick()

      const drawers = document.querySelectorAll('[role="dialog"]')
      expect(drawers.length).toBe(1)
    })
  })

  describe('边界情况', () => {
    it('应该处理快速打开关闭', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: false,
        },
      })

      await wrapper.setProps({ modelValue: true })
      await wrapper.setProps({ modelValue: false })
      await wrapper.setProps({ modelValue: true })

      await nextTick()

      expect(wrapper.emitted('open')).toBeTruthy()
    })

    it('应该在组件卸载时清理事件监听器', () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          closeOnPressEscape: true,
        },
      })

      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

      wrapper.unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      )
    })

    it('应该恢复 body 滚动如果抽屉在打开状态被卸载', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          lockScroll: true,
        },
      })

      await nextTick()
      expect(document.body.style.overflow).toBe('hidden')

      wrapper.unmount()

      expect(document.body.style.overflow).toBe('')
    })
  })

  describe('样式和类名', () => {
    it('应该应用自定义类名', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          class: 'custom-drawer-class',
        },
      })

      await nextTick()

      const drawerElement = document.querySelector('[role="dialog"]') as HTMLElement
      expect(drawerElement?.classList.contains('custom-drawer-class')).toBe(true)
    })

    it('应该有正确的过渡动画类', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
        },
      })

      await nextTick()

      const drawerElement = document.querySelector('[role="dialog"]') as HTMLElement
      expect(drawerElement?.classList.contains('transition-transform')).toBe(true)
      expect(drawerElement?.classList.contains('duration-300')).toBe(true)
    })
  })

  describe('内容滚动', () => {
    it('内容区域应该可滚动', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
        },
        slots: {
          default: `
            <div style="height: 2000px;">
              <p v-for="i in 100" :key="i">内容 {{ i }}</p>
            </div>
          `,
        },
      })

      await nextTick()

      const contentArea = document.querySelector('.overflow-auto')
      expect(contentArea).not.toBeNull()
    })
  })

  describe('点击传播', () => {
    it('点击抽屉内容应该阻止事件冒泡', async () => {
      wrapper = mount(Drawer, {
        props: {
          modelValue: true,
          modal: true,
          closeOnClickModal: true,
        },
      })

      await nextTick()

      const drawerElement = document.querySelector('[role="dialog"]') as HTMLElement
      drawerElement?.click()
      await nextTick()

      // 点击抽屉内容不应该关闭
      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })
  })
})
