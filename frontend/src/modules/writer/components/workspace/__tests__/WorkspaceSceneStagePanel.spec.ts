import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import WorkspaceSceneStagePanel from '../WorkspaceSceneStagePanel.vue'
import type { WriterSceneStageState } from '@/modules/writer/types/sceneStage'

const sceneStage: WriterSceneStageState = {
  projectId: 'project-1',
  sceneId: 'scene-1',
  beatId: 'beat-1',
  chapterId: 'chapter-1',
  chapterTitle: '第一章',
  chapterIds: ['chapter-1', 'chapter-2'],
  chapterCount: 2,
  coverageLabel: '第一章 - 第二章（2章）',
  coverageChapterCount: 2,
  coverageOptions: [
    { value: 1, label: '仅 第二章', chapterIds: ['chapter-2'] },
    { value: 2, label: '第一章 - 第二章（2章）', chapterIds: ['chapter-1', 'chapter-2'] },
  ],
  currentChapterLinked: true,
  sceneTitle: '雨夜祠堂',
  beatTitle: '守庙人试探',
  goal: '找到钥匙',
  conflict: '守庙人阻拦',
  rangeLabel: '第1-2章',
  beatStatus: 'active',
  doneCondition: '主角发现供桌暗格',
  nextBeatTitle: '旧友现身',
  assets: [],
  evidence: [],
  summaryLine: '场景舞台 · 雨夜祠堂',
  isEmpty: false,
  draft: {},
}

describe('WorkspaceSceneStagePanel', () => {
  it('renders compact scene stage summary', () => {
    const wrapper = mount(WorkspaceSceneStagePanel, {
      props: { sceneStage },
    })

    expect(wrapper.text()).toContain('当前场景')
    expect(wrapper.text()).toContain('当前章节：第一章')
    expect(wrapper.text()).toContain('第一章 - 第二章（2章）')
    expect(wrapper.text()).toContain('2 章覆盖')
    expect(wrapper.find('input[name="scene-stage-beat-title"]').exists()).toBe(true)
  })

  it('shows editing fields by default and emits draft patches when editing tempo fields', async () => {
    const wrapper = mount(WorkspaceSceneStagePanel, {
      props: { sceneStage },
    })

    await wrapper.get('input[aria-label="场景名称"]').setValue('雨夜追杀')
    await wrapper.get('input[name="scene-stage-beat-title"]').setValue('旧友现身')
    await wrapper.get('select[name="scene-stage-coverage-count"]').setValue('1')
    await wrapper.get('input[name="scene-stage-range"]').setValue('第3-5章')
    expect(wrapper.text()).toContain('系统覆盖')
    await wrapper.get('textarea[name="scene-stage-goal"]').setValue('逼主角做选择')
    await wrapper.get('textarea[name="scene-stage-conflict"]').setValue('旧友逼问')
    await wrapper.get('textarea[name="scene-stage-done-condition"]').setValue('主角放弃钥匙救人')
    await wrapper.get('input[name="scene-stage-next-beat-title"]').setValue('代价显现')

    expect(wrapper.emitted('update-draft')).toEqual([
      [{ sceneTitle: '雨夜追杀' }],
      [{ beatTitle: '旧友现身' }],
      [{ coverageChapterCount: '1' }],
      [{ rangeLabel: '第3-5章' }],
      [{ goal: '逼主角做选择' }],
      [{ conflict: '旧友逼问' }],
      [{ doneCondition: '主角放弃钥匙救人' }],
      [{ nextBeatTitle: '代价显现' }],
    ])
  })

  it('emits advance-beat when moving to the next beat', async () => {
    const wrapper = mount(WorkspaceSceneStagePanel, {
      props: { sceneStage },
    })

    const advanceButton = wrapper.findAll('button').find((button) => button.text() === '进入下一拍')
    await advanceButton?.trigger('click')

    expect(wrapper.emitted('advance-beat')).toHaveLength(1)
  })

  it('emits start-scene when starting a new scene', async () => {
    const wrapper = mount(WorkspaceSceneStagePanel, {
      props: { sceneStage },
    })

    const startButton = wrapper.findAll('button').find((button) => button.text() === '新场景')
    await startButton?.trigger('click')

    expect(wrapper.emitted('start-scene')).toHaveLength(1)
  })
})
