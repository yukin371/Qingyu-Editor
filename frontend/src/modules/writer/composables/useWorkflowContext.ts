/**
 * 共享 Workflow Context Composable
 *
 * 统一构建 ProjectWorkspace / Story Harness / 全屏工具共享的最小工作流上下文。
 */
import { computed, type ComputedRef } from 'vue'
import type { EntityReference } from '@/modules/writer/types/entity'
import type {
  StoryHarnessCharacterSummary,
  StoryHarnessChangeRequestPreview,
  StoryHarnessRelationSummary,
} from '@/modules/writer/stores/v3/storyHarnessStore'
import type { WriterWorkflowContext } from '@/modules/writer/types/workflow'
import { buildWriterWorkflowContextSignature } from '@/modules/writer/types/workflow'

export interface EntityStatsSnapshot {
  characters: number
  items: number
  locations: number
  concepts: number
}

export interface ActiveEntitySummary {
  id: string
  name: string
  type: string
  summary?: string
}

export interface ActiveEntityPreviewItem extends ActiveEntitySummary {
  key: string
  typeLabel: string
}

export interface ActiveEntityPreview {
  items: ActiveEntityPreviewItem[]
  hiddenCount: number
  total: number
}

export interface UseWorkflowContextOptions {
  projectId: ComputedRef<string>
  chapterId: ComputedRef<string>
  chapterTitle?: ComputedRef<string>
  scopeLabel?: ComputedRef<string | undefined>
  activeCharacters?: ComputedRef<StoryHarnessCharacterSummary[]>
  activeRelations?: ComputedRef<StoryHarnessRelationSummary[]>
  changeRequests?: ComputedRef<StoryHarnessChangeRequestPreview[]>
  entityReferences?: ComputedRef<EntityReference[]>
  entityStats?: ComputedRef<EntityStatsSnapshot>
}

export interface UseWorkflowContextReturn {
  /** 当前工作流上下文签名 */
  workflowContextSignature: ComputedRef<string>
  /** 完整的工作流上下文对象 */
  workflowContext: ComputedRef<WriterWorkflowContext>
  /** 当前章节活跃的角色列表 */
  activeCharacters: ComputedRef<StoryHarnessCharacterSummary[]>
  /** 当前章节活跃的关系列表 */
  activeRelations: ComputedRef<StoryHarnessRelationSummary[]>
  /** 当前章节待处理的变更建议数量 */
  pendingChangeRequestsCount: ComputedRef<number>
  /** 实体统计（多类型） */
  entityStats: ComputedRef<EntityStatsSnapshot & { pending: number }>
  /** 当前章节可供工具消费的活跃实体摘要 */
  activeEntities: ComputedRef<ActiveEntitySummary[]>
}

const ACTIVE_ENTITY_TYPE_LABELS: Record<string, string> = {
  character: '角色',
  item: '物品',
  location: '地点',
  concept: '概念',
  organization: '组织',
  foreshadowing: '伏笔',
}

/**
 * 使用共享的 Workflow Context
 *
 * @param options - 项目、章节及上下文构建依赖
 * @returns 工作流上下文及其相关数据
 */
export function useWorkflowContext(options: UseWorkflowContextOptions): UseWorkflowContextReturn {
  const { projectId, chapterId } = options

  /** 当前章节活跃的角色列表 */
  const activeCharacters = computed<StoryHarnessCharacterSummary[]>(() =>
    (options.activeCharacters?.value ?? []).slice(0, 3).map((character) => ({
      id: character.id,
      name: character.name,
      traits: character.traits ?? [],
      currentState: character.currentState,
    })),
  )

  /** 当前章节活跃的关系列表 */
  const activeRelations = computed<StoryHarnessRelationSummary[]>(() =>
    (options.activeRelations?.value ?? []).slice(0, 2),
  )

  /** 当前章节待处理的变更建议数量 */
  const pendingChangeRequestsCount = computed(() => options.changeRequests?.value.length ?? 0)

  /** 完整的工作流上下文对象 */
  const workflowContext = computed<WriterWorkflowContext>(() => {
    const context = {
      projectId: projectId.value,
      chapterId: chapterId.value,
      chapterTitle: options.chapterTitle?.value ?? '',
      scopeLabel: options.scopeLabel?.value,
      activeCharacters: activeCharacters.value.map((character) => ({
        id: character.id,
        name: character.name,
        currentState: character.currentState,
      })),
      activeRelations: activeRelations.value.map((relation) => ({
        id: relation.id,
        fromName: relation.fromName,
        toName: relation.toName,
        type: relation.type,
      })),
      pendingChangeRequests: (options.changeRequests?.value ?? [])
        .slice(0, 3)
        .map((changeRequest) => ({
          id: changeRequest.id,
          title: changeRequest.title,
          summary: changeRequest.summary,
          type: changeRequest.type,
        })),
      pendingChangeRequestCount: pendingChangeRequestsCount.value,
    }

    return {
      ...context,
      signature: buildWriterWorkflowContextSignature(context),
    }
  })

  /** 工作流上下文签名 */
  const workflowContextSignature = computed(() => workflowContext.value.signature)

  /** 实体统计（多类型） */
  const entityStats = computed(() => ({
    characters: options.entityStats?.value.characters ?? activeCharacters.value.length,
    items: options.entityStats?.value.items ?? 0,
    locations: options.entityStats?.value.locations ?? 0,
    concepts: options.entityStats?.value.concepts ?? 0,
    pending: pendingChangeRequestsCount.value,
  }))

  const activeEntities = computed<ActiveEntitySummary[]>(() => {
    const entities = new Map<string, ActiveEntitySummary>()

    for (const character of activeCharacters.value) {
      entities.set(`character:${character.id || character.name}`, {
        id: character.id,
        name: character.name,
        type: 'character',
        summary: character.currentState,
      })
    }

    for (const reference of options.entityReferences?.value ?? []) {
      const key = `${reference.type}:${reference.id || reference.name}`
      if (entities.has(key)) {
        continue
      }

      entities.set(key, {
        id: reference.id || key,
        name: reference.name,
        type: reference.type,
      })
    }

    return Array.from(entities.values())
  })

  return {
    workflowContextSignature,
    workflowContext,
    activeCharacters,
    activeRelations,
    pendingChangeRequestsCount,
    entityStats,
    activeEntities,
  }
}

/**
 * 构建实体摘要列表（用于 Context Lens）
 */
export function buildEntitySummary(
  characters: StoryHarnessCharacterSummary[],
): Array<{ id: string; name: string; type: string; summary?: string }> {
  return characters.map((character) => ({
    id: character.id,
    name: character.name,
    type: 'character',
    summary: character.currentState,
  }))
}

/**
 * 格式化实体统计为标签文本
 */
export function formatEntityStatsLabel(stats: {
  characters: number
  items: number
  locations: number
  concepts?: number
  pending: number
}): string {
  const parts: string[] = []
  if (stats.characters > 0) parts.push(`角色 ${stats.characters}`)
  if (stats.items > 0) parts.push(`物品 ${stats.items}`)
  if (stats.locations > 0) parts.push(`地点 ${stats.locations}`)
  if ((stats.concepts ?? 0) > 0) parts.push(`概念 ${stats.concepts ?? 0}`)
  if (stats.pending > 0) parts.push(`待处理 ${stats.pending}`)
  return parts.join(' · ') || '暂无数据'
}

export function formatActiveEntitiesPrompt(
  activeEntities: ActiveEntitySummary[] | null | undefined,
  limit = 4,
): string {
  const preview = buildActiveEntityPreview(activeEntities, limit)
  if (preview.total === 0) {
    return ''
  }

  const summary = preview.items
    .map((entity) => {
      return entity.summary
        ? `${entity.typeLabel}：${entity.name}（${entity.summary}）`
        : `${entity.typeLabel}：${entity.name}`
    })
    .join('；')

  return preview.hiddenCount > 0
    ? `当前活跃实体：${summary}；其余 ${preview.hiddenCount} 项见章节上下文`
    : `当前活跃实体：${summary}`
}

export function getActiveEntityTypeLabel(type: string): string {
  return ACTIVE_ENTITY_TYPE_LABELS[type] || type || '实体'
}

export function buildActiveEntityPreview(
  activeEntities: ActiveEntitySummary[] | null | undefined,
  limit = 4,
): ActiveEntityPreview {
  if (!activeEntities?.length) {
    return {
      items: [],
      hiddenCount: 0,
      total: 0,
    }
  }

  const items = activeEntities.slice(0, limit).map((entity) => ({
    ...entity,
    key: `${entity.type}:${entity.id || entity.name}`,
    summary: entity.summary?.trim(),
    typeLabel: getActiveEntityTypeLabel(entity.type),
  }))

  return {
    items,
    hiddenCount: Math.max(activeEntities.length - items.length, 0),
    total: activeEntities.length,
  }
}
