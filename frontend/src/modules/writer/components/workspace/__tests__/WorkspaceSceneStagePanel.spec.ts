import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import WorkspaceSceneStagePanel from '../WorkspaceSceneStagePanel.vue'
import type { WriterSceneStageState } from '@/modules/writer/types/sceneStage'

const sceneStage: WriterSceneStageState = {
  projectId: 'project-1',
  chapterId: 'chapter-1',
  chapterTitle: '第一章',
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
  it('renders editable scene tempo fields', () => {
    const wrapper = mount(WorkspaceSceneStagePanel, {
      props: { sceneStage },
    })

    expect(wrapper.get('input[aria-label="场景名称"]').element).toHaveProperty('value', '雨夜祠堂')
    expect(wrapper.find('input[name="scene-stage-beat-title"]').exists()).toBe(true)
    expect(wrapper.find('input[name="scene-stage-range"]').exists()).toBe(true)
    expect(wrapper.find('textarea[name="scene-stage-done-condition"]').exists()).toBe(true)
    expect(wrapper.find('input[name="scene-stage-next-beat-title"]').exists()).toBe(true)
  })

  it('emits draft patches when editing tempo fields', async () => {
    const wrapper = mount(WorkspaceSceneStagePanel, {
      props: { sceneStage },
    })

    await wrapper.get('input[aria-label="场景名称"]').setValue('雨夜追杀')
    await wrapper.get('input[name="scene-stage-beat-title"]').setValue('旧友现身')
    await wrapper.get('input[name="scene-stage-range"]').setValue('第3-5章')
    await wrapper.get('input[name="scene-stage-goal"]').setValue('逼主角做选择')
    await wrapper.get('textarea[name="scene-stage-conflict"]').setValue('旧友逼问')
    await wrapper.get('textarea[name="scene-stage-done-condition"]').setValue('主角放弃钥匙救人')
    await wrapper.get('input[name="scene-stage-next-beat-title"]').setValue('代价显现')

    expect(wrapper.emitted('update-draft')).toEqual([
      [{ sceneTitle: '雨夜追杀' }],
      [{ beatTitle: '旧友现身' }],
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

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('advance-beat')).toHaveLength(1)
  })
})
