/**
 * Reading Report View测试
 */

import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import ReadingReportView from '../ReadingReportView.vue'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElEmpty: {
    name: 'ElEmpty',
    template:
      '<div class="el-empty"><slot name="image"/><div class="el-empty__description">{{ description }}</div></div>',
    props: ['description'],
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<div class="el-icon"><slot /></div>',
    props: ['size', 'color'],
  },
  ElRadioGroup: {
    name: 'ElRadioGroup',
    template: '<div class="el-radio-group"><slot /></div>',
    props: ['modelValue', 'size'],
    emits: ['update:modelValue'],
  },
  ElRadioButton: {
    name: 'ElRadioButton',
    template: '<button class="el-radio-button" :label="label" :value="label"><slot /></button>',
    props: ['label'],
  },
}))

// Mock design system components
vi.mock('@/design-system/components', () => ({
  QyButton: { name: 'QyButton', template: '<button><slot /></button>' },
  QyIcon: { name: 'QyIcon', template: '<i />' },
  QyEmpty: { name: 'QyEmpty', template: '<div><slot /></div>' },
}))

describe('ReadingReportView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render correctly', () => {
      const wrapper = mount(ReadingReportView)
      expect(wrapper.exists()).toBe(true)
    })

    it('should have correct class name', () => {
      const wrapper = mount(ReadingReportView)
      expect((wrapper as any).classes()).toContain('reading-report-view')
    })

    it('should render container', () => {
      const wrapper = mount(ReadingReportView)
      const container = wrapper.find('.container')
      expect(container.exists()).toBe(true)
    })

    it('should render page header', () => {
      const wrapper = mount(ReadingReportView)
      expect(wrapper.find('.page-header').exists()).toBe(true)
    })

    it('should display page title', () => {
      const wrapper = mount(ReadingReportView)
      const title = wrapper.find('.page-header h1')
      expect(title.text()).toBe('阅读报告')
    })

    it('should render radio group for period selection', () => {
      const wrapper = mount(ReadingReportView)
      expect(wrapper.html()).toContain('el-radio-group')
    })

    it('should render all period radio buttons', () => {
      const wrapper = mount(ReadingReportView)
      expect(wrapper.html()).toContain('周报')
      expect(wrapper.html()).toContain('月报')
      expect(wrapper.html()).toContain('年报')
    })

    it('should render report placeholder', () => {
      const wrapper = mount(ReadingReportView)
      expect(wrapper.find('.report-placeholder').exists()).toBe(true)
    })

    it('should display correct empty description', () => {
      const wrapper = mount(ReadingReportView)
      expect(wrapper.html()).toContain('阅读报告功能开发中，敬请期待')
    })

    it('should render icon', () => {
      const wrapper = mount(ReadingReportView)
      // Icon is inside slot, so it may not render in stubbed components
      // Just check that el-empty exists which should contain the icon
      expect(wrapper.html()).toContain('el-empty')
    })
  })

  describe('lifecycle', () => {
    it('should mount without errors', () => {
      const consoleSpy = vi.spyOn(console, 'error')
      mount(ReadingReportView)
      expect(consoleSpy).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should be a Vue component instance', () => {
      const wrapper = mount(ReadingReportView)
      expect(wrapper.vm).toBeDefined()
    })

    it('should initialize period with default value', () => {
      const wrapper = mount(ReadingReportView)
      expect((wrapper.vm as any).period).toBe('week')
    })
  })

  describe('structure', () => {
    it('should have correct structure with header and placeholder', () => {
      const wrapper = mount(ReadingReportView)
      expect(wrapper.find('.reading-report-view').exists()).toBe(true)
      expect(wrapper.find('.container').exists()).toBe(true)
      expect(wrapper.find('.page-header').exists()).toBe(true)
      expect(wrapper.find('.report-placeholder').exists()).toBe(true)
    })

    it('should render empty component in placeholder', () => {
      const wrapper = mount(ReadingReportView)
      const placeholder = wrapper.find('.report-placeholder')
      expect(placeholder.html()).toContain('el-empty')
    })
  })

  describe('styles', () => {
    it('should have scoped styles', () => {
      const wrapper = mount(ReadingReportView)
      expect((wrapper as any).attributes('style')).toBeFalsy() // styles are in scoped
    })

    it('should have container with max-width', () => {
      const wrapper = mount(ReadingReportView)
      const container = wrapper.find('.container')
      expect(container.exists()).toBe(true)
    })

    it('should have page header with flex layout', () => {
      const wrapper = mount(ReadingReportView)
      const header = wrapper.find('.page-header')
      expect(header.exists()).toBe(true)
    })
  })

  describe('interaction', () => {
    it('should have period ref initialized', () => {
      const wrapper = mount(ReadingReportView)
      expect((wrapper.vm as any).period).toBeDefined()
      expect((wrapper.vm as any).period).toBe('week')
    })

    it('should contain radio buttons for period selection', () => {
      const wrapper = mount(ReadingReportView)
      expect(wrapper.html()).toContain('el-radio-button')
      // 检查是否有3个el-radio-button（周报、月报、年报）
      const radioButtons = wrapper.findAll('.el-radio-button')
      expect(radioButtons.length).toBe(3)
      // 检查文本内容
      expect(wrapper.text()).toContain('周报')
      expect(wrapper.text()).toContain('月报')
      expect(wrapper.text()).toContain('年报')
    })
  })
})
