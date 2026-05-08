/**
 * AIQuickActions 组件测试
 */
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AIQuickActions from '../AIQuickActions.vue'
import type { QuickAction } from '../types'

// Mock QyIcon
vi.mock('@/design-system/components/basic/QyIcon/QyIcon.vue', () => ({
  default: {
    name: 'QyIcon',
    template: '<span class="qy-icon"><slot /></span>',
  },
}))

describe('AIQuickActions', () => {
  const mockActions: QuickAction[] = [
    { id: 'continue', icon: 'Edit', label: '续写', prompt: '请帮我续写' },
    { id: 'polish', icon: 'Star', label: '润色', prompt: '请帮我润色' },
    { id: 'summary', icon: 'Document', label: '摘要', prompt: '请帮我总结' },
  ]

  it('should render all quick actions', () => {
    const wrapper = mount(AIQuickActions, {
      props: { actions: mockActions },
    })
    const cards = wrapper.findAll('.quick-action-card')
    expect(cards).toHaveLength(3)
  })

  it('should display action labels', () => {
    const wrapper = mount(AIQuickActions, {
      props: { actions: mockActions },
    })
    const labels = wrapper.findAll('.quick-action-label')
    expect(labels[0].text()).toBe('续写')
    expect(labels[1].text()).toBe('润色')
    expect(labels[2].text()).toBe('摘要')
  })

  it('should emit select event with action when clicked', async () => {
    const wrapper = mount(AIQuickActions, {
      props: { actions: mockActions },
    })
    await wrapper.findAll('.quick-action-card')[0].trigger('click')
    const emitted = wrapper.emitted('select') as unknown[][]
    expect(emitted).toBeTruthy()
    expect(emitted[0][0]).toEqual(mockActions[0])
  })

  it('should not render when actions array is empty', () => {
    const wrapper = mount(AIQuickActions, {
      props: { actions: [] },
    })
    expect(wrapper.find('.ai-quick-actions').exists()).toBe(false)
  })
})
