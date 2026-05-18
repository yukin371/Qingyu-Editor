import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import WorkspaceBottomPanel from '../WorkspaceBottomPanel.vue'
import type { WriterSceneStageState } from '@/modules/writer/types/sceneStage'

const sceneStage: WriterSceneStageState = {
  projectId: 'project-1',
  sceneId: 'scene-1',
  beatId: 'beat-1',
  chapterId: 'chapter-1',
  chapterTitle: '第一章',
  chapterIds: ['chapter-1'],
  chapterCount: 1,
  coverageLabel: '第一章',
  coverageChapterCount: 1,
  coverageOptions: [{ value: 1, label: '仅 第一章', chapterIds: ['chapter-1'] }],
  currentChapterLinked: true,
  sceneTitle: '雨夜祠堂',
  beatStatus: 'active',
  assets: [],
  evidence: [],
  summaryLine: '雨夜祠堂 · 下一拍未定',
  isEmpty: false,
  draft: {},
}

const mountPanel = () =>
  mount(WorkspaceBottomPanel, {
    props: {
      visible: true,
      height: 220,
      sceneStage,
    },
    global: {
      stubs: {
        WorkspaceSceneStagePanel: { template: '<div data-testid="scene-stage-panel" />' },
      },
    },
  })

describe('WorkspaceBottomPanel', () => {
  it('renders the resizable scene stage with persisted height', () => {
    const wrapper = mountPanel()

    expect(wrapper.get('.workspace-bottom-panel').attributes('style')).toContain('height: 220px')
    expect(wrapper.get('.workspace-bottom-panel__resize-handle').attributes('role')).toBe(
      'separator',
    )
    expect(wrapper.get('.workspace-bottom-panel__resize-handle').attributes('aria-label')).toBe(
      '调整场景舞台高度',
    )
    expect(wrapper.text()).not.toContain('当前场景')
    expect(wrapper.text()).not.toContain('当前章节：第一章')
    expect(wrapper.text()).toContain('收起')
  })

  it('emits the next height when dragging upward or downward', async () => {
    const wrapper = mountPanel()
    const handle = wrapper.get('.workspace-bottom-panel__resize-handle')

    await handle.trigger('mousedown', { clientY: 200 })
    window.dispatchEvent(new MouseEvent('mousemove', { clientY: 160 }))
    window.dispatchEvent(new MouseEvent('mousemove', { clientY: 240 }))
    window.dispatchEvent(new MouseEvent('mouseup'))

    expect(wrapper.emitted('resize')).toEqual([[260], [180]])
  })
})
