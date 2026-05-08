/**
 * AISelectionNotice 组件测试
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AISelectionNotice from '../AISelectionNotice.vue'
import type { SelectionNotice } from '../types'

describe('AISelectionNotice', () => {
  const mockNotice: SelectionNotice = {
    action: 'polish',
    actionLabel: '润色',
    text: '这是一段需要润色的文本内容',
    instructions: '请保持原意',
    status: 'running',
    statusText: '正在处理选中内容...',
  }

  it('should not render when notice is null', () => {
    const wrapper = mount(AISelectionNotice, {
      props: { notice: null },
    })
    expect(wrapper.find('.selection-notice').exists()).toBe(false)
  })

  it('should render notice with all fields', () => {
    const wrapper = mount(AISelectionNotice, {
      props: { notice: mockNotice },
    })
    expect(wrapper.find('.selection-title').text()).toContain('润色')
    expect(wrapper.find('.selection-content').text()).toBe(mockNotice.text)
    expect(wrapper.find('.selection-extra').text()).toContain('请保持原意')
    expect(wrapper.find('.selection-status').text()).toBe(mockNotice.statusText)
  })

  it('should apply status class correctly', () => {
    const wrapper = mount(AISelectionNotice, {
      props: { notice: mockNotice },
    })
    expect(wrapper.find('.selection-notice').classes()).toContain('is-running')
  })

  it('should display character count', () => {
    const wrapper = mount(AISelectionNotice, {
      props: { notice: mockNotice },
    })
    expect(wrapper.find('.selection-title').text()).toContain('13')
  })

  it('should not show instructions when not provided', () => {
    const noticeWithoutInstructions = { ...mockNotice, instructions: undefined }
    const wrapper = mount(AISelectionNotice, {
      props: { notice: noticeWithoutInstructions },
    })
    expect(wrapper.find('.selection-extra').exists()).toBe(false)
  })
})
