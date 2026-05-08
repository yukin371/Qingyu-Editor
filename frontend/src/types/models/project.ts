/**
 * 项目和章节相关类型
 */


/**
 * 原始项目数据类型 (API 响应)
 */
export interface RawProjectData extends Record<string, unknown> {
  id?: string
  projectId?: string
  title?: string
  summary?: string
  description?: string
  coverUrl?: string
  coverImage?: string
  category?: string
  genre?: string
  tags?: string[]
  status?: string
  wordCount?: number
  totalWords?: number
  chapterCount?: number
  updatedAt?: string
  createdAt?: string
  lastUpdateTime?: string
}

/**
 * 项目列表响应类型
 */
export interface ProjectListResponse {
  projects?: RawProjectData[]
  items?: RawProjectData[]
  data?: {
    projects?: RawProjectData[]
    items?: RawProjectData[]
  }
  | RawProjectData[]
  total?: number
  page?: number
  size?: number
}

export interface LocationTreeNode {
  id: string
  name: string
  parentId?: string
  children?: LocationTreeNode[]
}

export interface StatisticsCacheItem {
  data: unknown
  timestamp: number
}
