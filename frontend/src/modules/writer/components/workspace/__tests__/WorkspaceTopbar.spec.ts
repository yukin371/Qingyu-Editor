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
      activeRightTool: 'ai',
      isRightToolVisible: false,
      isBottomPanelVisible: false,
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
    expect(wrapper.find('.tool-chip').exists()).toBe(false)
  })

  it('only shows mode chip for non-default editor modes', () => {
    const wrapper = mount(WorkspaceTopbar, {
      props: {
        projectDisplayName: '测试项目',
        currentChapterTitle: '第一章',
        activeToolLabel: '沉浸',
        saveStatusLabel: '已保存',
        isImmersiveMode: true,
        activeRightTool: 'ai',
        isRightToolVisible: false,
        isBottomPanelVisible: false,
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

    expect(wrapper.find('.tool-chip').text()).toBe('沉浸')
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

  it('shows active state for the currently visible right tool', () => {
    const wrapper = mount(WorkspaceTopbar, {
      props: {
        projectDisplayName: '测试项目',
        currentChapterTitle: '第一章',
        activeToolLabel: '写作',
        saveStatusLabel: '已保存',
        isImmersiveMode: false,
        activeRightTool: 'proofread',
        isRightToolVisible: true,
        isBottomPanelVisible: false,
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

    const proofreadButton = findButtonByTitle(wrapper, '校对')
    const aiButton = findButtonByTitle(wrapper, 'AI 助手')

    expect(proofreadButton?.classes()).toContain('topbar-icon-btn--active')
    expect(proofreadButton?.attributes('aria-pressed')).toBe('true')
    expect(aiButton?.classes()).not.toContain('topbar-icon-btn--active')
    expect(aiButton?.attributes('aria-pressed')).toBe('false')
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

  it('shows scene stage open state in the overflow menu', async () => {
    const wrapper = mount(WorkspaceTopbar, {
      props: {
        projectDisplayName: '测试项目',
        currentChapterTitle: '第一章',
        activeToolLabel: '写作',
        saveStatusLabel: '已保存',
        isImmersiveMode: false,
        activeRightTool: 'ai',
        isRightToolVisible: false,
        isBottomPanelVisible: true,
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

    await wrapper.get('.topbar-overflow .topbar-btn--icon').trigger('click')

    const sceneStageButton = wrapper
      .findAll('.topbar-overflow__item')
      .find((button) => button.text().includes('场景舞台'))

    expect(sceneStageButton?.text()).toContain('收起场景舞台')
    expect(sceneStageButton?.classes()).toContain('topbar-overflow__item--active')
    expect(sceneStageButton?.attributes('aria-pressed')).toBe('true')
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
    expect(wrapper.text()).toContain('Qingyu-Editor 产品说明书')
    expect(wrapper.text()).toContain('从灵感到第一章')
    expect(wrapper.text()).toContain('截图演示：新项目骨架')
    expect(wrapper.find('.workspace-help-docs__figure').exists()).toBe(true)
    expect(wrapper.text()).toContain('docs/user-guide.md')
  })
})
