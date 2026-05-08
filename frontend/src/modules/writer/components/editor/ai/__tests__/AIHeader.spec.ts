/**
 * AIHeader 组件测试
 */
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AIHeader from '../AIHeader.vue'

// Mock QyIcon
vi.mock('@/design-system/components/basic/QyIcon/QyIcon.vue', () => ({
  default: {
    name: 'QyIcon',
    template: '<span class="qy-icon"><slot /></span>',
  },
}))

// Mock useI18n
vi.mock('@/composables/useI18n', () => ({
  useI18n: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}))

describe('AIHeader', () => {
  it('should render lightweight chat caption', () => {
    const wrapper = mount(AIHeader)
    expect(wrapper.find('.header-caption').text()).toBe('对话协作')
  })

  it('should emit clear event when clear button is clicked', async () => {
    const wrapper = mount(AIHeader)
    await wrapper.find('.icon-button').trigger('click')
    expect(wrapper.emitted('clear')).toBeTruthy()
  })

  it('should have correct aria-label on clear button', () => {
    const wrapper = mount(AIHeader)
    expect(wrapper.find('.icon-button').attributes('aria-label')).toBe('清空对话')
  })
})
