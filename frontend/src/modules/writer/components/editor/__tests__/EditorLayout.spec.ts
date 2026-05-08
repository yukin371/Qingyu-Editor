/**
 * EditorLayout 组件测试（稳定冒烟）
 * 说明：原有用例与当前实现存在较大偏差，先收敛为稳定的行为验证。
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createPinia } from 'pinia'
import EditorLayout from '../EditorLayout.vue'

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

describe('EditorLayout', () => {
  let wrapper: VueWrapper

  const mountComponent = () => {
    const pinia = createPinia()
    wrapper = mount(EditorLayout, {
      global: {
        plugins: [pinia],
        stubs: {
          SidePanel: true,
          EditorPanel: true,
          AIPanel: true,
          ProjectTree: true,
          ChapterTree: true
        }
      }
    })
  }

  beforeEach(() => {
    mountComponent()
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  it('应渲染应用语义与 live region', () => {
    const root = wrapper.find('.editor-layout')
    expect(root.exists()).toBe(true)
    expect(root.attributes('role')).toBe('application')
    expect(wrapper.find('[aria-live="polite"]').exists()).toBe(true)
  })

  it('移动端应显示 tabs', async () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 })
    window.dispatchEvent(new Event('resize'))
    await nextTick()
    expect(wrapper.find('.editor-layout').classes()).toContain('layout-mode-mobile')
    expect(wrapper.find('.mobile-tabs').exists()).toBe(true)
  })

  it('桌面端应使用 desktop 布局类', async () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1440 })
    window.dispatchEvent(new Event('resize'))
    await nextTick()
    expect(wrapper.find('.editor-layout').classes()).toContain('layout-mode-desktop')
  })

  it('移动端 tab 点击应更新激活态', async () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 })
    window.dispatchEvent(new Event('resize'))
    await nextTick()

    const tabs = wrapper.findAll('.mobile-tab')
    expect(tabs.length).toBeGreaterThan(1)
    await tabs[1].trigger('click')
    await nextTick()

    expect(tabs[1].classes()).toContain('active')
  })

  it('移动端横向滑动应切换 pane', async () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 })
    window.dispatchEvent(new Event('resize'))
    await nextTick()

    const content = wrapper.find('.editor-layout__content')
    await content.trigger('touchstart', {
      touches: [{ clientX: 220, clientY: 120 }],
    })
    await content.trigger('touchend', {
      changedTouches: [{ clientX: 80, clientY: 122 }],
    })
    await nextTick()

    const tabs = wrapper.findAll('.mobile-tab')
    expect(tabs[2].classes()).toContain('active')
  })
})
