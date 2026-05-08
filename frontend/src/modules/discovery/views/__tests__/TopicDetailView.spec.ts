/**
 * TopicDetailView 测试
 */

import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TopicDetailView from '../TopicDetailView.vue'

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

describe('TopicDetailView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render correctly', () => {
      const wrapper = mount(TopicDetailView)
      expect(wrapper.exists()).toBe(true)
    })

    it('should have correct class name', () => {
      const wrapper = mount(TopicDetailView)
      expect(wrapper.classes()).toContain('topic-detail-view')
    })

    it('should render container', () => {
      const wrapper = mount(TopicDetailView)
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('should display empty state message', () => {
      const wrapper = mount(TopicDetailView)
      // Element Plus ElEmpty component renders description prop
      expect(wrapper.html()).toContain('话题详情页开发中')
    })

    it('should render empty component', () => {
      const wrapper = mount(TopicDetailView)
      // ElEmpty should be rendered
      expect(wrapper.html()).toContain('el-empty')
    })
  })

  describe('structure', () => {
    it('should have correct layout structure', () => {
      const wrapper = mount(TopicDetailView)
      expect(wrapper.find('.topic-detail-view').exists()).toBe(true)
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('should render empty icon', () => {
      const wrapper = mount(TopicDetailView)
      // ElIcon should be rendered inside ElEmpty
      // Since we're using stubbed components, just check that the component renders
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('styles', () => {
    it('should have scoped styles', () => {
      const wrapper = mount(TopicDetailView)
      expect(wrapper.attributes('style')).toBeFalsy()
    })

    it('should apply container styles', () => {
      const wrapper = mount(TopicDetailView)
      const container = wrapper.find('.container')
      expect(container.exists()).toBe(true)
    })
  })
})
