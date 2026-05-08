/**
 * CreatePostView视图测试
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CreatePostView from '../CreatePostView.vue'

describe('CreatePostView', () => {
  describe('rendering', () => {
    it('should render view correctly', () => {
      // Act
      const wrapper = mount(CreatePostView)

      // Assert
      expect(wrapper.find('.create-post-view').exists()).toBe(true)
    })

    it('should render container', () => {
      // Act
      const wrapper = mount(CreatePostView)

      // Assert
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('should show development in progress message', () => {
      // Act
      const wrapper = mount(CreatePostView)

      // Assert
      expect(wrapper.find('.el-empty').exists()).toBe(true)
    })
  })

  describe('structure', () => {
    it('should have correct CSS classes', () => {
      // Act
      const wrapper = mount(CreatePostView)

      // Assert
      expect(wrapper.find('.create-post-view').exists()).toBe(true)
      expect(wrapper.find('.container').exists()).toBe(true)
    })
  })
})
