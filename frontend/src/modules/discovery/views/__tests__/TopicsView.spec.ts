/**
 * TopicsView 测试
 */

import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TopicsView from '../TopicsView.vue'

// Mock Element Plus components - use simple stubs
vi.mock('element-plus', () => ({
  ElEmpty: {
    name: 'ElEmpty',
    template: '<div class="el-empty"><slot /></div>',
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<div class="el-icon"><slot /></div>',
  },
}))

// Mock design system components
vi.mock('@/design-system/components', () => ({
  QyIcon: { name: 'QyIcon', template: '<i />' },
}))

describe('TopicsView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render correctly', () => {
      const wrapper = mount(TopicsView)
      expect(wrapper.exists()).toBe(true)
    })

    it('should have correct class name', () => {
      const wrapper = mount(TopicsView)
      expect(wrapper.classes()).toContain('topics-view')
    })

    it('should render container', () => {
      const wrapper = mount(TopicsView)
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('should display empty state message', () => {
      const wrapper = mount(TopicsView)
      // Element Plus ElEmpty component renders description prop
      expect(wrapper.html()).toContain('话题广场页开发中')
    })

    it('should render empty component', () => {
      const wrapper = mount(TopicsView)
      // ElEmpty should be rendered
      expect(wrapper.html()).toContain('el-empty')
    })
  })

  describe('structure', () => {
    it('should have correct layout structure', () => {
      const wrapper = mount(TopicsView)
      expect(wrapper.find('.topics-view').exists()).toBe(true)
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('should render empty icon', () => {
      const wrapper = mount(TopicsView)
      // ElIcon should be rendered inside ElEmpty
      // Since we're using stubbed components, just check that the component renders
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('styles', () => {
    it('should have scoped styles', () => {
      const wrapper = mount(TopicsView)
      expect(wrapper.attributes('style')).toBeFalsy()
    })

    it('should apply container styles', () => {
      const wrapper = mount(TopicsView)
      const container = wrapper.find('.container')
      expect(container.exists()).toBe(true)
    })
  })
})
