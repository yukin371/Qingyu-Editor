import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ref, computed } from 'vue'
import {
  buildActiveEntityPreview,
  useWorkflowContext,
  formatEntityStatsLabel,
  buildEntitySummary,
  formatActiveEntitiesPrompt,
} from '../useWorkflowContext'

describe('useWorkflowContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const buildOptions = () => ({
    projectId: computed(() => 'project-1'),
    chapterId: computed(() => 'chapter-1'),
    chapterTitle: computed(() => '第一章'),
    scopeLabel: computed(() => '第一幕 / 城门口'),
    activeCharacters: computed(() => [
      { id: 'char-1', name: '张三', traits: ['勇敢'], currentState: '紧张' },
      { id: 'char-2', name: '李四', traits: ['聪明'], currentState: '平静' },
    ]),
    activeRelations: computed(() => [
      { id: 'rel-1', fromName: '张三', toName: '李四', type: '朋友', strength: 5 },
    ]),
    changeRequests: computed(() => [
      { id: 'cr-1', title: '更新张三的恐惧值', summary: '...', type: 'state' as const },
      { id: 'cr-2', title: '关系变更', summary: '...', type: 'relation' as const },
    ]),
    entityReferences: computed(() => [
      { id: 'char-1', name: '张三', type: 'character' as const, position: { start: 0, end: 0 } },
      { id: 'loc-1', name: '青石镇', type: 'location' as const, position: { start: 0, end: 0 } },
      { id: 'item-1', name: '铜钥匙', type: 'item' as const, position: { start: 0, end: 0 } },
    ]),
    entityStats: computed(() => ({
      characters: 2,
      items: 1,
      locations: 1,
      concepts: 0,
    })),
  })

  it('returns workflow context signature based on project and chapter id', () => {
    const { workflowContextSignature } = useWorkflowContext(buildOptions())

    expect(workflowContextSignature.value).toContain('"projectId":"project-1"')
    expect(workflowContextSignature.value).toContain('"chapterId":"chapter-1"')
  })

  it('returns workflow context with correct structure', () => {
    const { workflowContext } = useWorkflowContext(buildOptions())

    expect(workflowContext.value.signature).toContain('"chapterId":"chapter-1"')
    expect(workflowContext.value.projectId).toBe('project-1')
    expect(workflowContext.value.chapterId).toBe('chapter-1')
    expect(workflowContext.value.chapterTitle).toBe('第一章')
    expect(workflowContext.value.pendingChangeRequests).toHaveLength(2)
  })

  it('returns active characters from writer store', () => {
    const { activeCharacters } = useWorkflowContext(buildOptions())

    expect(activeCharacters.value).toHaveLength(2)
    expect(activeCharacters.value[0].name).toBe('张三')
    expect(activeCharacters.value[0].currentState).toBe('紧张')
  })

  it('returns active relations from writer store', () => {
    const { activeRelations } = useWorkflowContext(buildOptions())

    expect(activeRelations.value).toHaveLength(1)
    expect(activeRelations.value[0].fromName).toBe('张三')
    expect(activeRelations.value[0].toName).toBe('李四')
  })

  it('returns pending change requests count', () => {
    const { pendingChangeRequestsCount } = useWorkflowContext(buildOptions())

    expect(pendingChangeRequestsCount.value).toBe(2)
  })

  it('returns entity stats with multi-type counts', () => {
    const { entityStats } = useWorkflowContext(buildOptions())

    expect(entityStats.value.characters).toBe(2)
    expect(entityStats.value.items).toBe(1)
    expect(entityStats.value.locations).toBe(1)
    expect(entityStats.value.pending).toBe(2)
  })

  it('builds activeEntities from active characters and parsed entity references', () => {
    const { activeEntities } = useWorkflowContext(buildOptions())

    expect(activeEntities.value).toHaveLength(4)
    expect(activeEntities.value[0]).toMatchObject({
      id: 'char-1',
      name: '张三',
      type: 'character',
      summary: '紧张',
    })
    expect(activeEntities.value).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: '青石镇', type: 'location' }),
        expect.objectContaining({ name: '铜钥匙', type: 'item' }),
      ]),
    )
  })
})

describe('formatEntityStatsLabel', () => {
  it('formats entity stats with all types', () => {
    const stats = {
      characters: 3,
      items: 2,
      locations: 1,
      concepts: 1,
      pending: 5,
    }

    const label = formatEntityStatsLabel(stats)

    expect(label).toContain('角色 3')
    expect(label).toContain('物品 2')
    expect(label).toContain('地点 1')
    expect(label).toContain('概念 1')
    expect(label).toContain('待处理 5')
  })

  it('returns "暂无数据" for zero stats', () => {
    const stats = { characters: 0, items: 0, locations: 0, concepts: 0, pending: 0 }

    const label = formatEntityStatsLabel(stats)

    expect(label).toBe('暂无数据')
  })
})

describe('buildEntitySummary', () => {
  it('builds entity summary from characters', () => {
    const characters = [
      { id: 'char-1', name: '张三', currentState: '紧张', traits: [] },
      { id: 'char-2', name: '李四', currentState: '平静', traits: [] },
    ]

    const summary = buildEntitySummary(characters)

    expect(summary).toHaveLength(2)
    expect(summary[0]).toEqual({
      id: 'char-1',
      name: '张三',
      type: 'character',
      summary: '紧张',
    })
  })
})

describe('formatActiveEntitiesPrompt', () => {
  it('formats multi-type active entity prompt text', () => {
    const prompt = formatActiveEntitiesPrompt([
      { id: 'char-1', name: '张三', type: 'character', summary: '紧张' },
      { id: 'item-1', name: '铜钥匙', type: 'item' },
      { id: 'loc-1', name: '青石镇', type: 'location' },
      { id: 'org-1', name: '巡夜司', type: 'organization' },
      { id: 'concept-1', name: '禁术传闻', type: 'concept' },
    ])

    expect(prompt).toContain('当前活跃实体：')
    expect(prompt).toContain('角色：张三（紧张）')
    expect(prompt).toContain('物品：铜钥匙')
    expect(prompt).toContain('地点：青石镇')
    expect(prompt).toContain('其余 1 项见章节上下文')
  })

  it('returns empty string when there are no active entities', () => {
    expect(formatActiveEntitiesPrompt([])).toBe('')
    expect(formatActiveEntitiesPrompt(undefined)).toBe('')
  })
})

describe('buildActiveEntityPreview', () => {
  it('builds labeled preview items and hidden count', () => {
    const preview = buildActiveEntityPreview([
      { id: 'char-1', name: '张三', type: 'character', summary: ' 紧张 ' },
      { id: 'item-1', name: '铜钥匙', type: 'item' },
      { id: 'loc-1', name: '青石镇', type: 'location' },
      { id: 'org-1', name: '巡夜司', type: 'organization' },
      { id: 'concept-1', name: '禁术传闻', type: 'concept' },
    ])

    expect(preview.total).toBe(5)
    expect(preview.hiddenCount).toBe(1)
    expect(preview.items[0]).toMatchObject({
      key: 'character:char-1',
      typeLabel: '角色',
      summary: '紧张',
    })
    expect(preview.items[3]).toMatchObject({
      typeLabel: '组织',
    })
  })

  it('returns empty preview when there are no active entities', () => {
    expect(buildActiveEntityPreview([])).toEqual({
      items: [],
      hiddenCount: 0,
      total: 0,
    })
  })
})
