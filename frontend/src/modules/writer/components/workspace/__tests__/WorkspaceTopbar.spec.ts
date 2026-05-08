import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import WorkspaceTopbar from '../WorkspaceTopbar.vue'

const createWrapper = () =>
  mount(WorkspaceTopbar, {
    props: {
      projectDisplayName: '测试项目',
      currentChapterTitle: '第一章',
      activeToolLabel: '写作',
      saveStatusLabel: '已保存',
      isImmersiveMode: false,
    },
    global: {
      plugins: [createPinia()],
      stubs: {
        ElDialog: {
          name: 'ElDialog',
          template: '<div class="el-dialog-stub"><slot /></div>',
        },
        QyIcon: true,
        ShortcutSettingsPanel: true,
      },
    },
  })

describe('WorkspaceTopbar', () => {
  it('renders current workspace metadata', () => {
    const wrapper = createWrapper()

    expect(wrapper.find('.topbar-back-btn').text()).toContain('测试项目')
    expect(wrapper.find('.chapter-title').text()).toBe('第一章')
    expect(wrapper.find('.status-text').text()).toContain('已保存')
  })

  it('emits back, save and export events from primary actions', async () => {
    const wrapper = createWrapper()
    const buttons = wrapper.findAll('button')

    await buttons[0].trigger('click')
    await buttons[1].trigger('click')
    await buttons[2].trigger('click')

    expect(wrapper.emitted('back')).toHaveLength(1)
    expect(wrapper.emitted('save')).toHaveLength(1)
    expect(wrapper.emitted('export')).toHaveLength(1)
  })

  it('emits share from the overflow menu', async () => {
    const wrapper = createWrapper()

    await wrapper.find('.topbar-btn--icon').trigger('click')
    expect(wrapper.find('.topbar-overflow__menu').exists()).toBe(true)

    const shareButton = wrapper.findAll('.topbar-overflow__item')[0]
    await shareButton.trigger('click')

    expect(wrapper.emitted('share')).toHaveLength(1)
    expect(wrapper.find('.topbar-overflow__menu').exists()).toBe(false)
  })
})
