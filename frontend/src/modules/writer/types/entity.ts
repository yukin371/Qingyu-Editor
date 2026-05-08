import type { BaseEntity, ID } from './core'

// ==========================================
// 1. 枚举定义
// ==========================================

/**
 * 统一实体类型
 * 支持 @角色、#地点、%物品 和新增的 @概念
 */
export type EntityType =
  | 'character'
  | 'location'
  | 'item'
  | 'concept'
  | 'organization'
  | 'foreshadowing'

/**
 * 实体类型配置
 * 用于 UI 显示（图标、颜色、标签）
 */
export const ENTITY_TYPE_CONFIG: Record<
  EntityType,
  {
    icon: string
    color: string
    label: string
    symbol: string // 编辑器中的引用符号
  }
> = {
  character: {
    icon: 'User',
    color: '#5B8CFF',
    label: '角色',
    symbol: '@',
  },
  location: {
    icon: 'Location',
    color: '#52C41A',
    label: '地点',
    symbol: '#',
  },
  item: {
    icon: 'Box',
    color: '#FA8C16',
    label: '物品',
    symbol: '%',
  },
  concept: {
    icon: 'Lightbulb',
    color: '#722ED1',
    label: '概念',
    symbol: '@',
  },
  organization: {
    icon: 'OfficeBuilding',
    color: '#0F766E',
    label: '组织',
    symbol: '@',
  },
  foreshadowing: {
    icon: 'Bell',
    color: '#B45309',
    label: '伏笔',
    symbol: '@',
  },
}

/**
 * 实体类型选项列表
 * 用于 Select 组件
 */
export const ENTITY_TYPE_OPTIONS = [
  { label: '角色', value: 'character' as EntityType, icon: 'User', color: '#5B8CFF' },
  { label: '地点', value: 'location' as EntityType, icon: 'Location', color: '#52C41A' },
  { label: '物品', value: 'item' as EntityType, icon: 'Box', color: '#FA8C16' },
  { label: '概念', value: 'concept' as EntityType, icon: 'Lightbulb', color: '#722ED1' },
  { label: '组织', value: 'organization' as EntityType, icon: 'OfficeBuilding', color: '#0F766E' },
]

// ==========================================
// 2. 实体引用定义
// ==========================================

/**
 * 实体引用
 * 用于编辑器中的 @ 引用标记
 */
export interface EntityReference {
  id: string
  name: string
  type: EntityType
  position: { start: number; end: number }
}

/**
 * 实体搜索结果
 * 用于 EntitySelector 组件
 */
export interface EntitySearchResult {
  id: string
  name: string
  type: EntityType
  alias?: string[]
  summary?: string
  avatarUrl?: string // 角色头像
}

/**
 * 实体提及
 * 用于编辑器内容解析
 */
export interface EntityMention {
  id: string
  label: string
  type: EntityType
}

// ==========================================
// 3. 概念实体定义
// ==========================================

/**
 * 概念实体
 * 用于管理抽象概念（如魔法体系、世界观规则等）
 */
export interface Concept extends BaseEntity {
  projectId: ID
  name: string
  alias?: string[]
  summary?: string
  description?: string // 详细描述
  category?: string // 分类（如：魔法体系、世界观规则、势力等）
  relatedConcepts?: string[] // 关联概念 ID
  relatedCharacters?: string[] // 关联角色 ID
  relatedLocations?: string[] // 关联地点 ID
  relatedItems?: string[] // 关联物品 ID
}

/**
 * 创建概念请求
 */
export interface CreateConceptRequest {
  projectId: ID
  name: string
  alias?: string[]
  summary?: string
  description?: string
  category?: string
}

/**
 * 更新概念请求
 */
export interface UpdateConceptRequest {
  name?: string
  alias?: string[]
  summary?: string
  description?: string
  category?: string
  relatedConcepts?: string[]
  relatedCharacters?: string[]
  relatedLocations?: string[]
  relatedItems?: string[]
}

// ==========================================
// 4. 统一实体接口
// ==========================================

/**
 * 统一实体
 * 用于跨类型查询和显示
 */
export interface UnifiedEntity {
  id: string
  type: EntityType
  name: string
  alias?: string[]
  summary?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

/**
 * 创建实体请求（通用）
 */
export interface CreateEntityRequest {
  type: EntityType
  name: string
  alias?: string[]
  summary?: string
  projectId: string
}

// ==========================================
// 5. 辅助函数
// ==========================================

/**
 * 根据旧符号推断实体类型
 * 用于向后兼容旧的 #/% 引用格式
 */
export function inferEntityTypeFromSymbol(symbol: string): EntityType {
  switch (symbol) {
    case '@':
      return 'character'
    case '#':
      return 'location'
    case '%':
      return 'item'
    default:
      return 'character'
  }
}

/**
 * 获取实体的显示符号
 */
export function getEntitySymbol(type: EntityType): string {
  return ENTITY_TYPE_CONFIG[type]?.symbol || '@'
}

/**
 * 格式化实体引用文本
 */
export function formatEntityReference(name: string, type: EntityType): string {
  const symbol = getEntitySymbol(type)
  return `${symbol}${name}`
}
