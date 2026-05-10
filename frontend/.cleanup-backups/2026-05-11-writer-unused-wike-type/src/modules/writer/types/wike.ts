import type { BaseEntity, ID } from './core'

// =======================
// Organization
// =======================
export interface Organization extends BaseEntity {
  projectId: ID
  name: string
  type: string
  description?: string
  leaderId?: ID
  baseLocationId?: ID
  motto?: string
  resources?: string
}

export interface OrganizationRelation extends BaseEntity {
  fromOrgId: ID
  toOrgId: ID
  relation: string
  notes?: string
}

// =======================
// Item
// =======================
export interface Item extends BaseEntity {
  projectId: ID
  name: string
  type: string // 'weapon', 'consumable', 'key_item'
  description?: string
  ownerId?: ID
  locationId?: ID
  rarity?: string
  function?: string
}

// =======================
// Concept (Setting)
// =======================

/**
 * 概念分类类型枚举
 */
export enum ConceptCategory {
  MAGIC = 'magic',         // 魔法体系
  BIOLOGY = 'biology',     // 生物/种族
  HISTORY = 'history',     // 历史/事件
  CULTURE = 'culture',     // 文化/习俗
  TECHNOLOGY = 'technology', // 科技/工艺
  POLITICS = 'politics',   // 政治/制度
  ECONOMY = 'economy',     // 经济/贸易
  RELIGION = 'religion',   // 宗教/信仰
  OTHER = 'other',         // 其他
}

/**
 * UI 辅助选项列表
 * 用于 Select 组件
 */
export const CONCEPT_CATEGORY_OPTIONS = [
  { label: '魔法体系', value: ConceptCategory.MAGIC },
  { label: '生物/种族', value: ConceptCategory.BIOLOGY },
  { label: '历史/事件', value: ConceptCategory.HISTORY },
  { label: '文化/习俗', value: ConceptCategory.CULTURE },
  { label: '科技/工艺', value: ConceptCategory.TECHNOLOGY },
  { label: '政治/制度', value: ConceptCategory.POLITICS },
  { label: '经济/贸易', value: ConceptCategory.ECONOMY },
  { label: '宗教/信仰', value: ConceptCategory.RELIGION },
  { label: '其他', value: ConceptCategory.OTHER },
]

/**
 * 概念实体
 * 用于设定百科中的概念管理
 */
export interface Concept extends BaseEntity {
  projectId: ID
  name: string
  alias?: string[]           // 别名列表
  summary?: string           // 简短摘要
  description?: string       // 详细描述
  category: ConceptCategory | string  // 分类
  tags?: string[]            // 标签
  relatedConcepts?: ID[]     // 关联概念 ID 列表
}

// ==========================================
// DTOs (请求参数)
// ==========================================

/**
 * 创建概念请求
 */
export interface CreateConceptRequest {
  projectId: ID
  name: string
  alias?: string[]
  summary?: string
  description?: string
  category: ConceptCategory | string
  tags?: string[]
  relatedConcepts?: ID[]
}

/**
 * 更新概念请求
 */
export interface UpdateConceptRequest {
  name?: string
  alias?: string[]
  summary?: string
  description?: string
  category?: ConceptCategory | string
  tags?: string[]
  relatedConcepts?: ID[]
}
