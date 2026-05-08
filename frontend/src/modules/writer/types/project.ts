import type { BaseEntity, ID, ISODate } from './core'

// =======================
// Enums
// =======================

export enum ProjectStatus {
  DRAFT = 'draft',
  SERIALIZING = 'serializing',
  COMPLETED = 'completed',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived',
}

export enum Visibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
}

export enum CollaboratorRole {
  OWNER = 'owner',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

// =======================
// Sub-types
// =======================

export interface ProjectStats {
  totalWords: number
  chapterCount: number
  documentCount: number
  lastUpdateAt: ISODate
}

export interface ProjectSettings {
  autoBackup: boolean
  backupInterval: number
  wordCountGoal?: number
}

export interface Collaborator {
  userId: ID
  role: CollaboratorRole
  invitedAt: ISODate
  acceptedAt?: ISODate
}

// =======================
// Main Entity
// =======================

export interface Project extends BaseEntity {
  authorId: ID
  projectId?: ID // 别名，指向id字段
  title: string
  summary?: string
  coverUrl?: string
  status: ProjectStatus
  category?: string
  tags?: string[]
  visibility: Visibility

  statistics: ProjectStats
  settings: ProjectSettings
  collaborators?: Collaborator[]

  publishedAt?: ISODate
}

/**
 * 项目摘要（列表项）
 */
export interface ProjectSummary {
  id: string
  title: string
  summary?: string
  coverUrl?: string
  status: ProjectStatus
  category?: string
  tags?: string[]
  totalWords: number
  chapterCount: number
  lastUpdateAt: string
}

/**
 * 项目详情（完整信息）
 */
export interface ProjectDetail extends Project {
  chapters?: ChapterSummary[]
  recentDocuments?: DocumentSummary[]
}

/**
 * 章节摘要
 */
export interface ChapterSummary {
  id: string
  title: string
  wordCount: number
  status: string
  updatedAt: string
}

/**
 * 文档摘要
 */
export interface DocumentSummary {
  id: string
  title: string
  wordCount: number
  updatedAt: string
}


// =======================
// DTOs (Data Transfer Objects) - 请求参数
// =======================

export interface CreateProjectRequest {
  title: string
  summary?: string
  coverUrl?: string
  category?: string
  tags?: string[]
  visibility?: Visibility
}

export interface UpdateProjectRequest {
  title?: string
  summary?: string
  coverUrl?: string
  status?: ProjectStatus
  category?: string
  tags?: string[]
  visibility?: Visibility
  settings?: Partial<ProjectSettings>
}
