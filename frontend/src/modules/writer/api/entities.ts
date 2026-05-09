/**
 * 统一实体 API
 *
 * 对接后端 /api/v1/writer/projects/:id/entities 系列接口
 */
import { request } from '@/utils/request-adapter'
import { isWailsWriterAvailable } from '../data-bridge/wails'

/**
 * 实体类型
 */
export type EntityType = 'character' | 'item' | 'location' | 'organization' | 'foreshadowing'

/**
 * 状态值
 */
export interface StateValue {
  current: unknown
  min?: number
  max?: number
  unit?: string
  description?: string
}

/**
 * 统一实体摘要
 */
export interface EntitySummary {
  id: string
  name: string
  entityType: EntityType
  summary?: string
  stateFields?: Record<string, StateValue>
}

/**
 * 关系边
 */
export interface RelationEdge {
  fromId: string
  toId: string
  fromType: EntityType
  toType: EntityType
  type: string
  strength?: number
  notes?: string
}

/**
 * 统一实体图谱
 */
export interface EntityGraph {
  nodes: EntitySummary[]
  edges: RelationEdge[]
}

const EMPTY_ENTITY_GRAPH: EntityGraph = {
  nodes: [],
  edges: [],
}

function throwDesktopEntityWriteUnsupported(): never {
  throw new Error('桌面端暂未接入统一实体写入，本地 owner 待实现')
}

/**
 * 获取项目下的实体列表
 * @param projectId 项目ID
 * @param entityType 可选的实体类型筛选
 */
export async function listEntities(
  projectId: string,
  entityType?: EntityType,
): Promise<EntitySummary[]> {
  if (isWailsWriterAvailable()) {
    return []
  }

  const params: Record<string, string> = {}
  if (entityType) {
    params.type = entityType
  }

  const response = await request<{ data: EntitySummary[] }>({
    url: `/api/v1/writer/projects/${projectId}/entities`,
    method: 'get',
    params,
  })

  return response.data ?? []
}

/**
 * 获取项目的统一实体图谱
 * @param projectId 项目ID
 */
export async function getEntityGraph(projectId: string): Promise<EntityGraph> {
  if (isWailsWriterAvailable()) {
    return EMPTY_ENTITY_GRAPH
  }

  const response = await request<EntityGraph>({
    url: `/api/v1/writer/projects/${projectId}/entities/graph`,
    method: 'get',
  })

  return response
}

/**
 * 更新实体的状态字段
 * @param entityId 实体ID
 * @param stateFields 状态字段
 */
export async function updateEntityStateFields(
  entityId: string,
  stateFields: Record<string, StateValue>,
): Promise<void> {
  if (isWailsWriterAvailable()) {
    throwDesktopEntityWriteUnsupported()
  }

  await request({
    url: `/api/v1/writer/entities/${entityId}/state-fields`,
    method: 'put',
    data: stateFields,
  })
}
