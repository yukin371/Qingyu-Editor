import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AssetQuickEditorDialog from '../AssetQuickEditorDialog.vue'

const QyModalStub = {
  props: ['visible', 'title'],
  template: '<div v-if="visible" data-testid="modal"><slot /><slot name="footer" /></div>',
}

const QyInputStub = {
  props: ['modelValue', 'placeholder'],
  emits: ['update:modelValue'],
  template:
    '<input :placeholder="placeholder" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
}

const QyTextareaStub = {
  props: ['modelValue', 'placeholder'],
  emits: ['update:modelValue'],
  template:
    '<textarea :placeholder="placeholder" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
}

describe('AssetQuickEditorDialog', () => {
  it('shows category-specific template placeholders for items', () => {
    const wrapper = mount(AssetQuickEditorDialog, {
      props: {
        visible: true,
        mode: 'create',
        category: 'items',
      },
      global: {
        stubs: {
          QyModal: QyModalStub,
          QyInput: QyInputStub,
          QyTextarea: QyTextareaStub,
          QyButton: { template: '<button><slot /></button>' },
        },
      },
    })

    expect(wrapper.html()).toContain('如：青铜钥匙')
    expect(wrapper.html()).toContain('用途 / 限制 / 归属 / 第一次出现章节')
  })
})
