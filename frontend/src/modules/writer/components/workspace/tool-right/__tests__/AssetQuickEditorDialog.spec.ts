import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AssetQuickEditorDialog from '../AssetQuickEditorDialog.vue'

const submittedPayload = (wrapper: ReturnType<typeof mount>) =>
  (wrapper.emitted('submit') as unknown[][] | undefined)?.[0]?.[0]

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

  it('submits through the native form submit button', async () => {
    const wrapper = mount(AssetQuickEditorDialog, {
      props: {
        visible: true,
        mode: 'create',
        category: 'characters',
      },
      global: {
        stubs: {
          QyModal: QyModalStub,
          QyInput: QyInputStub,
          QyTextarea: QyTextareaStub,
          QyButton: { template: '<button type="button"><slot /></button>' },
        },
      },
    })

    await wrapper.find('input[placeholder="如：林舟"]').setValue('新角色')
    await wrapper.find('button[type="submit"]').trigger('click')

    expect(submittedPayload(wrapper)).toEqual(
      expect.objectContaining({
        category: 'characters',
        name: '新角色',
      }),
    )
  })

  it('allows overview add flow to choose a category before creating', async () => {
    const wrapper = mount(AssetQuickEditorDialog, {
      props: {
        visible: true,
        mode: 'create',
        category: 'characters',
        allowCategorySelect: true,
      },
      global: {
        stubs: {
          QyModal: QyModalStub,
          QyInput: QyInputStub,
          QyTextarea: QyTextareaStub,
          QyButton: { template: '<button type="button"><slot /></button>' },
        },
      },
    })

    await wrapper.get('select[aria-label="资产类型"]').setValue('locations')
    await wrapper.find('input[placeholder="如：旧码头"]').setValue('新地点')
    await wrapper.find('button[type="submit"]').trigger('click')

    expect(submittedPayload(wrapper)).toEqual(
      expect.objectContaining({
        category: 'locations',
        name: '新地点',
      }),
    )
  })
})
