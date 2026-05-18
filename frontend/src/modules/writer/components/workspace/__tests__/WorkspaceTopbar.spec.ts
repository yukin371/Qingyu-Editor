import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import WorkspaceTopbar from '../WorkspaceTopbar.vue'

const findButtonByTitle = (wrapper: ReturnType<typeof createWrapper>, title: string) =>
  wrapper.findAll('button').find((button) => button.attributes('title') === title)

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
        QyDialog: {
          name: 'QyDialog',
          template: '<div class="qy-dialog-stub"><slot /></div>',
        },
        Dialog: {
          name: 'Dialog',
          template: '<div class="qy-dialog-stub"><slot /></div>',
        },
        QyIcon: true,
        WorkspaceSettingsPanel: true,
      },
    },
  })

describe('WorkspaceTopbar', () => {
  it('renders current workspace metadata', () => {
    const wrapper = createWrapper()

    expect(wrapper.find('.topbar-back-btn').text()).toContain('测试项目')
    expect(wrapper.find('.chapter-title').text()).toBe('第一章')
    expect(wrapper.find('.status-text').text()).toContain('已保存')
    expect(wrapper.find('.tool-chip').text()).toBe('写作')
  })

  it('emits back, save and export events from primary actions', async () => {
    const wrapper = createWrapper()
    const saveButton = findButtonByTitle(wrapper, '保存')
    const exportButton = findButtonByTitle(wrapper, '导出正文')

    await wrapper.get('.topbar-back-btn').trigger('click')
    expect(saveButton).toBeTruthy()
    expect(exportButton).toBeTruthy()
    await saveButton!.trigger('click')
    await exportButton!.trigger('click')

    expect(wrapper.emitted('back')).toHaveLength(1)
    expect(wrapper.emitted('save')).toHaveLength(1)
    expect(wrapper.emitted('export')).toHaveLength(1)
  })

  it('emits quick workspace actions from text shortcuts', async () => {
    const wrapper = createWrapper()
    const immersiveButton = findButtonByTitle(wrapper, '全屏')
    const assetsButton = findButtonByTitle(wrapper, '设定')
    const proofreadButton = findButtonByTitle(wrapper, '校对')
    const inspirationButton = findButtonByTitle(wrapper, '灵感')
    const aiButton = findButtonByTitle(wrapper, 'AI 助手')

    await immersiveButton!.trigger('click')
    await assetsButton!.trigger('click')
    await proofreadButton!.trigger('click')
    await inspirationButton!.trigger('click')
    await aiButton!.trigger('click')

    expect(wrapper.emitted('toggle-immersive')).toHaveLength(1)
    expect(wrapper.emitted('open-right-tool')).toEqual([
      ['assets'],
      ['proofread'],
      ['inspiration'],
      ['ai'],
    ])
  })

  it('emits share from the overflow menu', async () => {
    const wrapper = createWrapper()

    await wrapper.get('.topbar-overflow .topbar-btn--icon').trigger('click')
    expect(wrapper.find('.topbar-overflow__menu').exists()).toBe(true)

    const shareButton = wrapper.findAll('.topbar-overflow__item')[0]
    await shareButton.trigger('click')

    expect(wrapper.emitted('share')).toHaveLength(1)
    expect(wrapper.find('.topbar-overflow__menu').exists()).toBe(false)
  })

  it('keeps shortcut settings only in the workspace settings dialog', async () => {
    const wrapper = createWrapper()

    await wrapper.get('.topbar-overflow .topbar-btn--icon').trigger('click')

    expect(wrapper.find('.topbar-overflow__menu').text()).not.toContain('快捷键设置')
    expect(findButtonByTitle(wrapper, '设置')).toBeTruthy()
  })

  it('opens integrated help docs from the overflow menu', async () => {
    const wrapper = createWrapper()

    await wrapper.get('.topbar-overflow .topbar-btn--icon').trigger('click')
    const helpButton = wrapper
      .findAll('.topbar-overflow__item')
      .find((button) => button.text().includes('使用文档'))

    expect(helpButton).toBeTruthy()
    await helpButton!.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.workspace-help-docs').exists()).toBe(true)
    expect(wrapper.text()).toContain('推荐创作流程')
    expect(wrapper.text()).toContain('docs/user-guide.md')
  })
})
