/**
 * AIInputArea 组件测试
 */
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AIInputArea from '../AIInputArea.vue'
import type { ChatContextSnippet } from '../types'

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

describe('AIInputArea', () => {
  it('should render textarea', () => {
    const wrapper = mount(AIInputArea, {
      props: { modelValue: '' },
    })
    expect(wrapper.find('textarea').exists()).toBe(true)
  })

  it('should emit update:modelValue on input', async () => {
    const wrapper = mount(AIInputArea, {
      props: { modelValue: '' },
    })
    await wrapper.find('textarea').setValue('test message')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('should emit send event when send button is clicked', async () => {
    const wrapper = mount(AIInputArea, {
      props: { modelValue: 'test message' },
    })
    await wrapper.find('.send-button').trigger('click')
    expect(wrapper.emitted('send')).toBeTruthy()
  })

  it('should not emit send event when input is empty', async () => {
    const wrapper = mount(AIInputArea, {
      props: { modelValue: '' },
    })
    await wrapper.find('.send-button').trigger('click')
    expect(wrapper.emitted('send')).toBeFalsy()
  })

  it('should disable send button when input is empty', () => {
    const wrapper = mount(AIInputArea, {
      props: { modelValue: '' },
    })
    expect(wrapper.find('.send-button').element.disabled).toBe(true)
  })

  it('should disable all inputs when disabled prop is true', () => {
    const wrapper = mount(AIInputArea, {
      props: { modelValue: 'test', disabled: true },
    })
    expect(wrapper.find('textarea').element.disabled).toBe(true)
    expect(wrapper.find('.send-button').element.disabled).toBe(true)
  })

  it('should show context chip when context is provided', () => {
    const context: ChatContextSnippet = {
      text: '选中的文本',
      addedAt: Date.now(),
    }
    const wrapper = mount(AIInputArea, {
      props: { modelValue: '', context },
    })
    expect(wrapper.find('.chat-context-chip').exists()).toBe(true)
  })

  it('should show target scope bar when target label is provided', () => {
    const wrapper = mount(AIInputArea, {
      props: {
        modelValue: '',
        targetLabel: '本章全文',
        targetDetail: '将生成正文 diff',
      },
    })

    expect(wrapper.find('.target-scope-bar').exists()).toBe(true)
    expect(wrapper.find('.target-scope-bar').text()).toContain('本章全文')
    expect(wrapper.find('.target-scope-bar').text()).toContain('将生成正文 diff')
  })

  it('should emit clearContext when clear button is clicked', async () => {
    const context: ChatContextSnippet = {
      text: '选中的文本',
      addedAt: Date.now(),
    }
    const wrapper = mount(AIInputArea, {
      props: { modelValue: '', context },
    })
    await wrapper.find('.context-clear').trigger('click')
    expect(wrapper.emitted('clearContext')).toBeTruthy()
  })

  it('should send on Enter key', async () => {
    const wrapper = mount(AIInputArea, {
      props: { modelValue: 'test' },
    })
    await wrapper.find('textarea').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('send')).toBeTruthy()
  })

  it('should not send on Shift+Enter', async () => {
    const wrapper = mount(AIInputArea, {
      props: { modelValue: 'test' },
    })
    await wrapper.find('textarea').trigger('keydown', { key: 'Enter', shiftKey: true })
    expect(wrapper.emitted('send')).toBeFalsy()
  })
})
