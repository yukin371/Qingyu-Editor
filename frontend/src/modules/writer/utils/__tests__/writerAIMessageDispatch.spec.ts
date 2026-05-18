import { describe, expect, it } from 'vitest'
import { buildWriterMessageDispatch } from '../writerAIMessageDispatch'

describe('writerAIMessageDispatch', () => {
  it('builds merged request for chat route with selected context', () => {
    const result = buildWriterMessageDispatch({
      content: '帮我分析人物动机',
      selectedContext: {
        kind: 'selection',
        text: '她沉默地看向窗外',
      },
      interactionMode: 'chat',
      canEditDirectly: true,
      hasSelectionContext: true,
      workflowContext: {
        signature: 'sig',
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        activeCharacters: [],
        activeRelations: [],
        pendingChangeRequests: [],
        pendingChangeRequestCount: 0,
      },
      aiSummaryContextText: '前文摘要',
      sceneStage: {
        sceneTitle: '雨夜追杀',
        beatTitle: '旧友现身',
        beatStatus: 'active',
        goal: '逼主角做选择',
        conflict: '救人与守秘冲突',
        rangeLabel: '第3-5章',
        doneCondition: '主角放弃钥匙救人',
        nextBeatTitle: '代价显现',
        locationName: '废弃车站',
        povCharacterName: '林秋',
        assetNames: ['林秋', '钥匙'],
      },
    })

    expect(result.promptExecution.route).toBe('chat')
    expect(result.finalRequestMessage).toContain('参考片段：她沉默地看向窗外')
    expect(result.finalRequestMessage).toContain('前文摘要')
    expect(result.finalRequestMessage).toContain('当前场景舞台：')
    expect(result.finalRequestMessage).toContain('当前拍：旧友现身')
    expect(result.finalRequestMessage).toContain('冲突：救人与守秘冲突')
  })

  it('does not build chat request for edit route', () => {
    const result = buildWriterMessageDispatch({
      content: '把这段改写得更紧张',
      selectedContext: null,
      interactionMode: 'edit',
      canEditDirectly: true,
      hasSelectionContext: true,
    })

    expect(result.promptExecution.route).toBe('edit')
    expect(result.finalRequestMessage).toBeUndefined()
  })
})
