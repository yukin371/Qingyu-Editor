/**
 * AIConversationToolbar 组件测试
 */
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AIConversationToolbar from '../AIConversationToolbar.vue'
import type { ConversationMeta } from '../types'

// Mock QyIcon
vi.mock('@/design-system/components/basic/QyIcon/QyIcon.vue', () => ({
  default: {
    name: 'QyIcon',
    template: '<span class="qy-icon"><slot /></span>',
  },
}))

describe('AIConversationToolbar', () => {
  const mockConversations: ConversationMeta[] = [
    { id: '1', title: '对话1', updatedAt: Date.now() },
    { id: '2', title: '对话2', updatedAt: Date.now() },
  ]

  it('should render conversation select with options', () => {
    const wrapper = mount(AIConversationToolbar, {
      props: {
        conversationList: mockConversations,
        currentId: '1',
      },
    })
    const options = wrapper.findAll('option')
    expect(options).toHaveLength(2)
    expect(options[0].text()).toBe('对话1')
  })

  it('should emit update:currentId when selection changes', async () => {
    const wrapper = mount(AIConversationToolbar, {
      props: {
        conversationList: mockConversations,
        currentId: '1',
      },
    })
    await wrapper.find('select').setValue('2')
    const emitted = wrapper.emitted('update:currentId') as unknown[][]
    expect(emitted).toBeTruthy()
    expect(emitted[0][0]).toBe('2')
  })

  it('should emit create event when create button is clicked', async () => {
    const wrapper = mount(AIConversationToolbar, {
      props: {
        conversationList: mockConversations,
        currentId: '1',
      },
    })
    await wrapper.find('.conversation-new-btn').trigger('click')
    expect(wrapper.emitted('create')).toBeTruthy()
  })

  it('should emit clear event when clear button is clicked', async () => {
    const wrapper = mount(AIConversationToolbar, {
      props: {
        conversationList: mockConversations,
        currentId: '1',
      },
    })
    await wrapper.find('.conversation-action-btn--ghost').trigger('click')
    expect(wrapper.emitted('clear')).toBeTruthy()
  })

  it('should emit rename event when rename button is clicked', async () => {
    const wrapper = mount(AIConversationToolbar, {
      props: {
        conversationList: mockConversations,
        currentId: '1',
      },
    })
    await wrapper.findAll('.conversation-action-btn')[1].trigger('click')
    expect(wrapper.emitted('rename')).toBeTruthy()
  })

  it('should disable all buttons when disabled prop is true', () => {
    const wrapper = mount(AIConversationToolbar, {
      props: {
        conversationList: mockConversations,
        currentId: '1',
        disabled: true,
      },
    })
    expect(wrapper.find('select').element.disabled).toBe(true)
    expect(wrapper.find('.conversation-new-btn').element.disabled).toBe(true)
    expect(wrapper.find('.conversation-action-btn--ghost').element.disabled).toBe(true)
  })
})
