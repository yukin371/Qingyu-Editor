import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import WorkspaceStatusbar from '../WorkspaceStatusbar.vue'

vi.mock('@/modules/writer/composables/useWritingStats', () => ({
  useWritingStats: () => ({
    todayStats: { value: { todayWords: 0 } },
    initTodayStats: vi.fn(),
  }),
  getGlobalTodayWords: () => 0,
}))

const createWrapper = (props = {}) =>
  mount(WorkspaceStatusbar, {
    props: {
      chapterCount: 12,
      directoryCount: 2,
      activeToolLabel: '写作模式',
      saveStatusLabel: '已保存',
      isImmersiveMode: false,
      immersiveTimerText: '',
      ...props,
    },
    global: {
      stubs: {
        WritingStatsChip: true,
      },
    },
  })

describe('WorkspaceStatusbar', () => {
  it('renders visible bottom workbench switches', () => {
    const wrapper = createWrapper({ sceneStageTitle: '第一场' })

    expect(wrapper.find('.workspace-statusbar__stage-label').text()).toBe('场景舞台')
    expect(wrapper.find('.workspace-statusbar__stage-title').text()).toBe('第一场')
  })

  it('opens a hidden bottom panel from the status bar switcher', async () => {
    const wrapper = createWrapper({ bottomPanelVisible: false, activeBottomPanelId: 'scene' })

    await wrapper.find('.workspace-statusbar__stage-btn').trigger('click')

    expect(wrapper.emitted('select-bottom-panel')).toEqual([['scene']])
    expect(wrapper.emitted('toggle-bottom-panel')).toHaveLength(1)
  })

  it('closes the active bottom panel when clicking the active switch', async () => {
    const wrapper = createWrapper({ bottomPanelVisible: true, activeBottomPanelId: 'scene' })

    await wrapper.find('.workspace-statusbar__stage-btn').trigger('click')

    expect(wrapper.emitted('select-bottom-panel')).toBeUndefined()
    expect(wrapper.emitted('toggle-bottom-panel')).toHaveLength(1)
  })
})
