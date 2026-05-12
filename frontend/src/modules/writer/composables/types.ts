/**
 * Workspace 共享类型定义
 *
 * 集中管理工作区相关的类型定义，避免重复定义
 */

// =======================
// 百科相关类型
// =======================

/** 百科子视图类型 */
export type EncyclopediaSubView =
  | 'relations'
  | 'structure'
  | 'encyclopedia'
  | 'timeline'
  | 'branches'

/** 百科分类类型 */
export type EncyclopediaCategory =
  | 'characters'
  | 'locations'
  | 'items'
  | 'organizations'
  | 'concepts'

export type GraphFocusAssetType = 'character' | 'location' | 'item' | 'organization' | 'concept'

export interface GraphFocusTarget {
  assetType: GraphFocusAssetType
  assetId?: string
  assetName: string
  latestChapterId?: string
}

// =======================
// 侧边栏数据类型
// =======================

/** 侧边栏项目摘要 */
export interface SidebarProjectSummary {
  id: string
  title: string
  status: string
  wordCount: number
  chapterCount: number
  updatedAt: string
}

/** 侧边栏章节摘要 */
export interface SidebarChapterSummary {
  id: string
  projectId: string
  parentId?: string
  chapterNum: number
  title: string
  wordCount: number
  updatedAt: string
  status: 'draft' | 'published'
  nodeType?: 'directory' | 'chapter'
  sortOrder?: number
  orderKey?: string // LexoRank 排序键
}

// =======================
// Mock 数据类型
// =======================

import type { Document } from '@/modules/writer/types/document'

/** Mock 项目数据结构 */
export interface MockProjectData {
  project?: SidebarProjectSummary
  chapters?: SidebarChapterSummary[]
  docs?: Document[]
  contentByDocId?: Record<string, string>
}
