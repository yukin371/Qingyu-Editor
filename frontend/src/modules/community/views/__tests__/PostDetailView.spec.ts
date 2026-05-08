/**
 * PostDetailView视图测试
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PostDetailView from '../PostDetailView.vue'

describe('PostDetailView', () => {
  describe('rendering', () => {
    it('should render view correctly', () => {
      // Act
      const wrapper = mount(PostDetailView)

      // Assert
      expect(wrapper.find('.post-detail-view').exists()).toBe(true)
    })

    it('should render container', () => {
      // Act
      const wrapper = mount(PostDetailView)

      // Assert
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('should show development in progress message', () => {
      // Act
      const wrapper = mount(PostDetailView)

      // Assert
      expect(wrapper.text()).toContain('动态详情页开发中，敬请期待...')
    })
  })

  describe('structure', () => {
    it('should have correct CSS classes', () => {
      // Act
      const wrapper = mount(PostDetailView)

      // Assert
      expect(wrapper.find('.post-detail-view').exists()).toBe(true)
      expect(wrapper.find('.container').exists()).toBe(true)
    })
  })
})
