import type { BaseEntity, ID, ISODate } from './core'

// ==========================================
// 1. 新架构：文档历史版本 (Main Architecture)
// ==========================================

/**
 * 文档版本
 * 对应后端 Version struct
 */
export interface DocumentVersion {
  id: ID
  documentId: ID
  versionNum: number
  content: string
  gridfsId?: string // 大文件引用
  contentType: string // 'markdown' | 'richtext'
  wordCount: number
  comment?: string // 版本说明/备注
  createdBy: string // User ID or 'AI'
  createdAt: ISODate
  isAutoSave: boolean
}

// ==========================================
// 2. 补丁与协作状态 (Patches & Collaboration)
// ==========================================

/**
 * 补丁状态枚举
 * 对应后端 Status const
 */
export enum PatchStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  APPLIED = 'applied',
}

/**
 * 补丁/变更建议
 * 对应后端 FilePatch struct
 */
export interface FilePatch extends BaseEntity {
  projectId: ID
  nodeId: ID
  baseVersion: number
  diffFormat: 'unified' | 'json-patch' | 'full' | string
  diffPayload: string // 原始 diff 内容
  createdBy: string
  status: PatchStatus | string
  preview?: string // 合并后的预览内容
  metadata?: Record<string, any>
}

// ==========================================
// 3. 冲突检测与解决 (Conflict Handling)
// ==========================================

/**
 * 单个文件的冲突信息
 * 对应后端 ConflictInfo struct
 */
export interface ConflictInfo {
  hasConflict: boolean
  currentVersion: number
  expectedVersion: number
  conflictingRevisions?: FileRevision[]
  lastModified?: ISODate
}

/**
 * 批量冲突检测结果
 * 对应后端 BatchConflictResult struct
 */
export interface BatchConflictResult {
  projectId: ID
  hasConflicts: boolean
  conflicts: Record<string, ConflictInfo> // key 是 nodeID/documentID
}

/**
 * 冲突解决策略配置
 * 对应后端 ConflictResolution struct
 */
export interface ConflictResolution {
  strategy: 'auto' | 'manual' | 'force'
  resolvedBy: string
  resolution: string // 解决方案描述
  mergedContent: string // 最终合并的内容
}

/**
 * 批量解决冲突请求
 * 对应后端 BatchConflictResolution struct
 */
export interface ResolveConflictRequest {
  projectId: ID
  authorId: ID
  message?: string
  resolutions: Record<string, ConflictResolution> // key 是 nodeID
}

// ==========================================
// 4. 高级/旧版版本控制 (Legacy/Advanced)
// ==========================================

/**
 * 提交记录 (类似于 Git Commit)
 * 对应后端 Commit struct
 */
export interface Commit {
  id: ID
  projectId: ID
  authorId: ID
  message?: string
  fileCount: number
  metadata?: Record<string, any>
  createdAt: ISODate
}

/**
 * 文件修订记录
 * 对应后端 FileRevision struct
 */
export interface FileRevision {
  id: ID
  nodeId: ID
  projectId?: ID
  commitId: ID
  version: number
  authorId: ID
  message?: string
  snapshot?: string
  parentVersion: number
  metadata?: Record<string, any>
  storageRef?: string
  compressed?: boolean
  createdAt: ISODate
}

// ==========================================
// 5. API DTOs (请求/响应)
// ==========================================

/**
 * 获取版本列表响应
 */
export interface VersionListResponse {
  versions: DocumentVersion[]
  total: number
}

/**
 * 提交单个文件变更请求
 * 对应后端 CommitFile struct
 */
export interface CommitFileRequest {
  nodeId: ID
  content: string
  expectedVersion: number // 用于乐观锁检测
}

/**
 * 版本对比结果
 * 前端 Diff 组件通常需要这种结构
 */
export interface VersionDiff {
  oldVersion: number
  newVersion: number
  diffContent: string // Unified Diff string
  additions: number
  deletions: number
}
