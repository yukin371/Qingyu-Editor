import type { BaseEntity, ID } from './core'

// ==========================================
// 1. 枚举与常量 (Enums & Constants)
// ==========================================

/**
 * 地点关系类型
 * 对应后端 LocationRelationType const
 */
export enum LocationRelationType {
  ADJACENT = 'adjacent', // 相邻
  CONTAINS = 'contains', // 包含 (也可通过 parentId 实现，关系表通常用于跨层级或特殊包含)
  NEAR = 'near', // 附近
  FAR = 'far', // 远离
  CONNECTED = 'connected', // 连通 (如传送门、贸易路线)
}

/**
 * UI 辅助选项列表
 * 用于 Select 组件或可视化连线的 Label
 */
export const LOCATION_RELATION_OPTIONS = [
  { label: '相邻', value: LocationRelationType.ADJACENT, color: '#409EFF' },
  { label: '包含', value: LocationRelationType.CONTAINS, color: '#67C23A' },
  { label: '附近', value: LocationRelationType.NEAR, color: '#E6A23C' },
  { label: '远离', value: LocationRelationType.FAR, color: '#909399' },
  { label: '连通', value: LocationRelationType.CONNECTED, color: '#79BBFF' },
]

// ==========================================
// 2. 实体定义 (Entities)
// ==========================================

/**
 * 地点/场景
 * 对应后端 Location struct
 */
export interface Location extends BaseEntity {
  projectId: ID
  name: string
  description?: string
  climate?: string // 气候
  culture?: string // 文化
  geography?: string // 地理
  atmosphere?: string // 氛围
  parentId?: ID // 父级 ID
  imageUrl?: string // 图片/地图链接

  // 前端辅助字段 (用于树形组件 Element Plus Tree 等)
  children?: Location[]
}

/**
 * 地点关系 (边)
 * 对应后端 LocationRelation struct
 */
export interface LocationRelation extends BaseEntity {
  projectId: ID
  fromId: ID
  toId: ID
  type: LocationRelationType
  distance?: string // 距离描述 (如 "三天路程", "500公里")
  notes?: string
}

/**
 * 地点图谱 (用于可视化地图)
 */
export interface LocationGraph {
  nodes: Location[]
  edges: LocationRelation[]
}

// ==========================================
// 3. DTOs (请求参数)
// ==========================================

/**
 * 创建/更新地点请求
 */
export interface SaveLocationRequest {
  projectId: ID
  name: string
  parentId?: ID
  description?: string
  climate?: string
  culture?: string
  geography?: string
  atmosphere?: string
  imageUrl?: string
}

/**
 * 创建/更新地点关系请求
 */
export interface SaveLocationRelationRequest {
  projectId: ID
  fromId: ID
  toId: ID
  type: LocationRelationType
  distance?: string
  notes?: string
}
