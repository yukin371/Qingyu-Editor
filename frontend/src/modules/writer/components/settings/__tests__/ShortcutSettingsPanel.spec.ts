import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ShortcutSettingsPanel from '../ShortcutSettingsPanel.vue'

const shortcuts = ref({
  'workspace.closeOverlay': {
    id: 'workspace.closeOverlay',
    keys: ['Escape'],
    description: '关闭覆盖层',
    category: 'navigation',
  },
  'editor.insertTab': {
    id: 'editor.insertTab',
    keys: ['Tab'],
    description: '插入缩进',
    category: 'editor',
  },
})

vi.mock('@/modules/writer/composables/useShortcutConfig', () => ({
  useShortcutConfig: () => ({
    shortcuts,
    loading: ref(false),
    setShortcut: vi.fn(),
    detectConflict: vi.fn(() => null),
    resetToDefaults: vi.fn(),
    getAllConflicts: vi.fn(() => []),
    getShortcutsByCategory: vi.fn(() => [
      {
        name: 'navigation',
        title: '导航',
        shortcuts: [shortcuts.value['workspace.closeOverlay']],
      },
      {
        name: 'editor',
        title: '编辑器',
        shortcuts: [shortcuts.value['editor.insertTab']],
      },
    ]),
    formatKeys: vi.fn((keys: string[]) => keys.join('+')),
  }),
}))

const ElButtonStub = defineComponent({
  name: 'ElButtonStub',
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    return () => h('button', attrs, slots.default?.())
  },
})

const ElInputStub = defineComponent({
  name: 'ElInputStub',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  setup(props) {
    return () => h('input', { value: props.modelValue })
  },
})

const ElTagStub = defineComponent({
  name: 'ElTagStub',
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    return () => h('span', attrs, slots.default?.())
  },
})

describe('ShortcutSettingsPanel', () => {
  beforeEach(() => {
    shortcuts.value = {
      'workspace.closeOverlay': {
        id: 'workspace.closeOverlay',
        keys: ['Escape'],
        description: '关闭覆盖层',
        category: 'navigation',
      },
      'editor.insertTab': {
        id: 'editor.insertTab',
        keys: ['Tab'],
        description: '插入缩进',
        category: 'editor',
      },
    }
  })

  const mountPanel = () =>
    mount(ShortcutSettingsPanel, {
      global: {
        stubs: {
          ElButton: ElButtonStub,
          ElInput: ElInputStub,
          ElTag: ElTagStub,
        },
      },
    })

  it('应按 action id 锁定关闭 overlay，而不是按 Escape 键名泛化锁定', () => {
    const wrapper = mountPanel()
    const rows = wrapper.findAll('.shortcut-settings__row')
    const overlayRow = rows.find((row) => row.text().includes('关闭覆盖层'))

    expect(overlayRow?.classes()).toContain('is-system')
    expect(overlayRow?.find('.shortcut-settings__lock-icon').exists()).toBe(true)
    expect(overlayRow?.find('.shortcut-settings__edit-btn').exists()).toBe(false)
  })

  it('Tab 默认快捷键不应仅因键名被误判为系统锁定', () => {
    const wrapper = mountPanel()
    const rows = wrapper.findAll('.shortcut-settings__row')
    const tabRow = rows.find((row) => row.text().includes('插入缩进'))

    expect(tabRow?.classes()).not.toContain('is-system')
    expect(tabRow?.find('.shortcut-settings__lock-icon').exists()).toBe(false)
    expect(tabRow?.find('.shortcut-settings__edit-btn').exists()).toBe(true)
  })
})
