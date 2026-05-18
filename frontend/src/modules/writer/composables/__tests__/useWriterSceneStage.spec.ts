import { afterEach, describe, expect, it, vi } from 'vitest'
import { computed, nextTick, ref } from 'vue'
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

function stubStorage(initial: Record<string, string> = {}) {
  const storage: Record<string, string> = { ...initial }
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
  return storage
}

describe('useWriterSceneStage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('keeps the current scene across chapter switches and uses current backward coverage', async () => {
    const storage = stubStorage()
    const chapterId = ref('chapter-1')
    const chapterTitle = computed(() => (chapterId.value === 'chapter-1' ? '第一章' : '第二章'))

    const { sceneStage, updateSceneStageDraft, advanceSceneStageBeat, startNewSceneStage } =
      useWriterSceneStage({
        projectId: computed(() => 'project-1'),
        chapterId: computed(() => chapterId.value),
        chapterTitle,
        scopeLabel: computed(() => '第一场'),
        workflowContext,
        activeEntities: computed(() => []),
        changeRequests: computed(() => []),
        chapters: computed(() => [
          {
            id: 'chapter-1',
            projectId: 'project-1',
            title: '第一章',
            chapterNum: 1,
            wordCount: 1000,
            updatedAt: '',
            status: 'draft',
            nodeType: 'chapter',
          },
          {
            id: 'chapter-2',
            projectId: 'project-1',
            title: '第二章',
            chapterNum: 2,
            wordCount: 800,
            updatedAt: '',
            status: 'draft',
            nodeType: 'chapter',
          },
        ]),
      })

    updateSceneStageDraft({
      sceneTitle: '雨夜追杀',
      beatTitle: '旧友现身',
      goal: '逼主角做选择',
      conflict: '旧友现身',
      doneCondition: '主角放弃钥匙救人',
      nextBeatTitle: '代价显现',
    })

    expect(sceneStage.value.sceneTitle).toBe('雨夜追杀')
    expect(sceneStage.value.chapterIds).toEqual(['chapter-1'])

    chapterId.value = 'chapter-2'
    await nextTick()

    expect(sceneStage.value.sceneTitle).toBe('雨夜追杀')
    expect(sceneStage.value.beatTitle).toBe('旧友现身')
    expect(sceneStage.value.chapterIds).toEqual(['chapter-2'])
    expect(sceneStage.value.coverageLabel).toBe('第二章')
    expect(storage.qingyu_editor_scene_stage_sidecars_v2).toContain('chapter-2')

    updateSceneStageDraft({ coverageChapterCount: 2 })

    expect(sceneStage.value.chapterIds).toEqual(['chapter-1', 'chapter-2'])
    expect(sceneStage.value.coverageLabel).toBe('第一章 - 第二章（2章）')
    expect(sceneStage.value.coverageOptions.map((option) => option.label)).toEqual([
      '仅 第二章',
      '第一章 - 第二章（2章）',
    ])

    advanceSceneStageBeat()

    expect(sceneStage.value.beatTitle).toBe('代价显现')
    expect(sceneStage.value.goal).toBe('')
    expect(sceneStage.value.nextBeatTitle).toBe('')
    expect(sceneStage.value.chapterIds).toEqual(['chapter-1', 'chapter-2'])

    updateSceneStageDraft({ nextBeatTitle: '黑市脱身' })
    startNewSceneStage()

    expect(sceneStage.value.sceneTitle).toBe('未命名场景')
    expect(sceneStage.value.beatTitle).toBe('黑市脱身')
    expect(sceneStage.value.beatStatus).toBe('planned')
    expect(sceneStage.value.chapterIds).toEqual(['chapter-2'])
    const storedSidecar = JSON.parse(storage.qingyu_editor_scene_stage_sidecars_v2)
    expect(Object.keys(storedSidecar['project-1'].scenes)).toHaveLength(2)
  })

  it('offers contiguous backward coverage options from the current chapter only', () => {
    stubStorage()

    const { sceneStage, updateSceneStageDraft } = useWriterSceneStage({
      projectId: computed(() => 'project-1'),
      chapterId: computed(() => 'chapter-3'),
      chapterTitle: computed(() => '第三章'),
      scopeLabel: computed(() => ''),
      workflowContext,
      activeEntities: computed(() => []),
      changeRequests: computed(() => []),
      chapters: computed(() => [
        {
          id: 'chapter-1',
          projectId: 'project-1',
          title: '第一章',
          chapterNum: 1,
          wordCount: 1000,
          updatedAt: '',
          status: 'draft',
          nodeType: 'chapter',
        },
        {
          id: 'chapter-2',
          projectId: 'project-1',
          title: '第二章',
          chapterNum: 2,
          wordCount: 900,
          updatedAt: '',
          status: 'draft',
          nodeType: 'chapter',
        },
        {
          id: 'chapter-3',
          projectId: 'project-1',
          title: '第三章',
          chapterNum: 3,
          wordCount: 800,
          updatedAt: '',
          status: 'draft',
          nodeType: 'chapter',
        },
      ]),
    })

    expect(sceneStage.value.coverageOptions.map((option) => option.label)).toEqual([
      '仅 第三章',
      '第二章 - 第三章（2章）',
      '第一章 - 第三章（3章）',
    ])

    updateSceneStageDraft({ coverageChapterCount: 2 })

    expect(sceneStage.value.chapterIds).toEqual(['chapter-2', 'chapter-3'])
    expect(sceneStage.value.coverageLabel).toBe('第二章 - 第三章（2章）')
  })

  it('migrates legacy chapter-keyed draft into project scene sidecar', () => {
    stubStorage({
      qingyu_editor_scene_stage_drafts_v1: JSON.stringify({
        'project-1:chapter-1': {
          sceneTitle: '旧草稿场景',
          beatTitle: '旧草稿拍',
          nextBeatTitle: '下一拍',
        },
      }),
    })

    const { sceneStage } = useWriterSceneStage({
      projectId: computed(() => 'project-1'),
      chapterId: computed(() => 'chapter-1'),
      chapterTitle: computed(() => '第一章'),
      scopeLabel: computed(() => '第一场'),
      workflowContext,
      activeEntities: computed(() => []),
      changeRequests: computed(() => []),
      chapters: computed(() => []),
    })

    expect(sceneStage.value.sceneTitle).toBe('旧草稿场景')
    expect(sceneStage.value.beatTitle).toBe('旧草稿拍')
    expect(sceneStage.value.chapterIds).toEqual(['chapter-1'])
  })

  it('does not treat current chapter title as the default scene title', () => {
    stubStorage()

    const { sceneStage } = useWriterSceneStage({
      projectId: computed(() => 'project-1'),
      chapterId: computed(() => 'chapter-2'),
      chapterTitle: computed(() => '第二章'),
      scopeLabel: computed(() => ''),
      workflowContext,
      activeEntities: computed(() => []),
      changeRequests: computed(() => []),
      chapters: computed(() => []),
    })

    expect(sceneStage.value.sceneTitle).toBe('未命名场景')
    expect(sceneStage.value.coverageLabel).toBe('第二章')
    expect(sceneStage.value.summaryLine).not.toContain('当前场景 · 第二章')
    expect(sceneStage.value.summaryLine).toContain('当前章节：第二章')
    expect(sceneStage.value.summaryLine).toContain('系统覆盖：第二章')
  })

  it('treats persisted chapter-like scene titles as automatic residue unless manually edited', () => {
    stubStorage({
      qingyu_editor_scene_stage_sidecars_v2: JSON.stringify({
        'project-1': {
          activeSceneId: 'scene-1',
          scenes: {
            'scene-1': {
              sceneId: 'scene-1',
              beatId: 'beat-1',
              chapterIds: ['chapter-2'],
              sceneTitle: '第二章',
              goal: '手动目标也不证明章节名是场景名',
            },
          },
        },
      }),
    })

    const { sceneStage } = useWriterSceneStage({
      projectId: computed(() => 'project-1'),
      chapterId: computed(() => 'chapter-2'),
      chapterTitle: computed(() => '第二章'),
      scopeLabel: computed(() => '第二章'),
      workflowContext,
      activeEntities: computed(() => []),
      changeRequests: computed(() => []),
      chapters: computed(() => [
        {
          id: 'chapter-2',
          projectId: 'project-1',
          title: '第二章',
          chapterNum: 2,
          wordCount: 800,
          updatedAt: '',
          status: 'draft',
          nodeType: 'chapter',
        },
      ]),
    })

    expect(sceneStage.value.sceneTitle).toBe('未命名场景')
    expect(sceneStage.value.goal).toBe('手动目标也不证明章节名是场景名')
  })
})
