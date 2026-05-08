import type { Document } from './document'

// =======================
// Type Definitions
// =======================

/**
 * 批量操作类型
 */
export type BatchOperationType =
  | 'delete'           // 删除
  | 'move'             // 移动
  | 'copy'             // 复制
  | 'export'           // 导出
  | 'apply_template'   // 应用模板

/**
 * 执行模式
 */
export type ExecutionMode =
  | 'standard_atomic'  // 标准原子模式（默认）
  | 'saga_atomic'      // Saga原子模式（支持补偿）
  | 'non_atomic'       // 非原子模式

/**
 * 冲突策略
 */
export type ConflictPolicy =
  | 'abort'      // 中止操作
  | 'overwrite'  // 覆盖
  | 'skip'       // 跳过冲突项

/**
 * 批量操作状态
 */
export type BatchOperationStatus =
  | 'pending'           // 等待执行
  | 'running'           // 执行中
  | 'completed'         // 已完成
  | 'failed'            // 失败
  | 'cancelled'         // 已取消
  | 'partially_failed'  // 部分失败

/**
 * 子项状态
 */
export type BatchItemStatus =
  | 'pending'      // 等待处理
  | 'processing'   // 处理中
  | 'succeeded'    // 成功
  | 'failed'       // 失败
  | 'skipped'      // 跳过
  | 'cancelled'    // 已取消

/**
 * 文档命令类型
 */
export type DocumentCommandType =
  | 'create'     // 创建
  | 'update'     // 更新
  | 'move'       // 移动
  | 'copy'       // 复制
  | 'delete'     // 删除
  | 'restore'    // 恢复

// =======================
// Interfaces - Preflight
// =======================

/**
 * Preflight摘要
 */
export interface PreflightSummary {
  totalCount: number    // 总数量
  validCount: number    // 有效数量
  invalidCount: number  // 无效数量
  skippedCount: number  // 跳过数量
}

/**
 * Preflight结果
 */
export interface PreflightResult {
  validIds: string[]                   // 有效ID列表
  invalidIds: InvalidTarget[]          // 无效ID列表
  skippedIds: string[]                 // 跳过ID列表
  warnings: string[]                   // 警告信息
  documentMap: Record<string, Document> // 文档映射表
}

/**
 * 无效目标
 */
export interface InvalidTarget {
  id: string      // 目标ID
  reason: string  // 无效原因
  code: string    // 错误码
}

// =======================
// Interfaces - Request
// =======================

/**
 * 提交批量操作请求
 */
export interface SubmitBatchOperationRequest {
  projectId: string                      // 项目ID
  type: BatchOperationType               // 操作类型
  targetIds: string[]                    // 目标ID列表
  atomic?: boolean                       // 是否原子操作（默认true）
  payload?: BatchOperationPayload        // 操作载荷
  conflictPolicy?: ConflictPolicy        // 冲突策略
  expectedVersions?: Record<string, number> // 期望版本（乐观锁）
  clientRequestId?: string               // 客户端请求ID（幂等性）
  includeDescendants?: boolean           // 是否包含后代节点
}

/**
 * 批量操作载荷
 */
export interface BatchOperationPayload {
  // 移动/复制参数
  parentId?: string                      // 目标父节点ID
  referenceId?: string                   // 参考节点ID
  position?: 'inner' | 'before' | 'after' // 相对位置
  preserveRelativeOrder?: boolean        // 保持相对顺序
  includeDescendants?: boolean           // 包含后代节点

  // 跨项目参数
  targetProjectId?: string               // 目标项目ID
  rewriteReferences?: boolean            // 重写引用
}

// =======================
// Interfaces - Response
// =======================

/**
 * 批量操作
 */
export interface BatchOperation {
  id: string                             // 批量操作ID
  projectId: string                      // 项目ID
  type: BatchOperationType               // 操作类型
  targetIds: string[]                    // 目标ID列表
  originalTargetIds?: string[]           // 原始目标ID列表（用于包含后代的情况）
  executionMode?: ExecutionMode          // 执行模式
  atomic: boolean                        // 是否原子操作
  payload?: BatchOperationPayload        // 操作载荷
  conflictPolicy?: ConflictPolicy        // 冲突策略
  expectedVersions?: Record<string, number> // 期望版本
  clientRequestId?: string               // 客户端请求ID
  status: BatchOperationStatus           // 操作状态
  cancelable: boolean                    // 是否可取消
  createdBy: string                      // 创建者ID
  createdAt: Date                        // 创建时间
  startedAt?: Date                       // 开始时间
  finishedAt?: Date                      // 完成时间
  preflightSummary?: PreflightSummary    // Preflight摘要
}

/**
 * 批量操作进度
 */
export interface BatchOperationProgress {
  batchId: string                        // 批量操作ID
  status: BatchOperationStatus           // 操作状态
  totalItems: number                     // 总项数
  completedItems: number                 // 已完成项数
  failedItems: number                    // 失败项数
  startedAt?: Date                       // 开始时间
  finishedAt?: Date                      // 完成时间
}

// =======================
// Interfaces - Operation Log
// =======================

/**
 * 操作日志
 */
export interface OperationLog {
  id: string                 // 日志ID
  projectId: string          // 项目ID
  userId: string             // 用户ID
  batchOpId?: string         // 批量操作ID
  chainId: string            // 命令链ID
  documentId: string         // 文档ID
  command: DocumentCommand   // 执行的命令
  inverseCommand?: InverseCommand // 逆命令（用于撤销）
  executedAt: Date           // 执行时间
}

/**
 * 文档命令
 */
export interface DocumentCommand {
  type: DocumentCommandType  // 命令类型
  documentId: string         // 文档ID
  data: Record<string, any>  // 命令数据
}

/**
 * 逆命令（用于撤销）
 */
export interface InverseCommand {
  type: DocumentCommandType  // 命令类型
  documentId: string         // 文档ID
  data: Record<string, any>  // 逆命令数据
}

// =======================
// Interfaces - Batch Item
// =======================

/**
 * 批量操作项
 */
export interface BatchOperationItem {
  id: string                 // 项ID
  batchOpId: string          // 批量操作ID
  targetId: string           // 目标ID
  status: BatchItemStatus    // 项状态
  command?: DocumentCommand  // 执行的命令
  inverseCommand?: InverseCommand // 逆命令
  error?: string             // 错误信息
  processedAt?: Date         // 处理时间
}

// =======================
// Interfaces - Submit Response
// =======================

/**
 * 提交批量操作响应
 */
export interface SubmitBatchOperationResponse {
  batchId: string                    // 批量操作ID
  status: BatchOperationStatus       // 初始状态
  preflightSummary?: PreflightSummary // Preflight摘要
}

// =======================
// Interfaces - UI Display
// =======================

/**
 * 批量操作结果项（UI展示用）
 */
export interface BatchOperationResultItem {
  id: string                         // 项ID
  title: string                      // 显示标题
  status: 'succeeded' | 'failed' | 'skipped'  // UI状态
  errorCode?: string                 // 错误码
  errorMessage?: string              // 错误信息
  retryable?: boolean                // 是否可重试
}

/**
 * 批量操作结果汇总（UI展示用）
 */
export interface BatchOperationSummary {
  successCount: number               // 成功数量
  failedCount: number                // 失败数量
  skippedCount: number               // 跳过数量
}
