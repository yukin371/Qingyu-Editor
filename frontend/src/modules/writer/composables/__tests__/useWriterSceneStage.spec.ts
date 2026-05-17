import { afterEach, describe, expect, it, vi } from 'vitest'
import { computed } from 'vue'
import { useWriterSceneStage } from '../useWriterSceneStage'

const workflowContext = computed(() => ({
  signature: 'chapter-1',
  projectId: 'project-1',
  chapterId: 'chapter-1',
  chapterTitle: '第一章',
  scopeLabel: '第一场',
  activeCharacters: [],
  activeRelations: [],
  pendingChangeRequests: [
    {
      id: 'change-1',
      type: 'relation' as const,
      title: '冲突不足',
      summary: '压迫感不足',
      severity: 'focus' as const,
    },
  ],
  pendingChangeRequestCount: 1,
}))

describe('useWriterSceneStage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('lets manual scene tempo override derived values and persists the draft', () => {
    const storage: Record<string, string> = {}
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => storage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        storage[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete storage[key]
      }),
      clear: vi.fn(() => {
        for (const key of Object.keys(storage)) {
          delete storage[key]
        }
      }),
    })

    const { sceneStage, updateSceneStageDraft, advanceSceneStageBeat } = useWriterSceneStage({
      projectId: computed(() => 'project-1'),
      chapterId: computed(() => 'chapter-1'),
      chapterTitle: computed(() => '第一章'),
      scopeLabel: computed(() => '第一场'),
      workflowContext,
      activeEntities: computed(() => []),
      changeRequests: computed(() => []),
    })

    updateSceneStageDraft({
      sceneTitle: '雨夜追杀',
      beatTitle: '旧友现身',
      goal: '逼主角做选择',
      conflict: '旧友现身',
      rangeLabel: '第3-5章',
      doneCondition: '主角放弃钥匙救人',
      nextBeatTitle: '代价显现',
    })

    expect(sceneStage.value.sceneTitle).toBe('雨夜追杀')
    expect(sceneStage.value.beatTitle).toBe('旧友现身')
    expect(sceneStage.value.goal).toBe('逼主角做选择')
    expect(sceneStage.value.conflict).toBe('旧友现身')
    expect(sceneStage.value.rangeLabel).toBe('第3-5章')
    expect(sceneStage.value.doneCondition).toBe('主角放弃钥匙救人')
    expect(sceneStage.value.nextBeatTitle).toBe('代价显现')
    expect(sceneStage.value.evidence.map((item) => item.type)).toContain('manual')
    expect(storage.qingyu_editor_scene_stage_drafts_v1).toContain('代价显现')

    advanceSceneStageBeat()

    expect(sceneStage.value.beatTitle).toBe('代价显现')
    expect(sceneStage.value.goal).toBe('')
    expect(sceneStage.value.nextBeatTitle).toBe('')
  })
})
