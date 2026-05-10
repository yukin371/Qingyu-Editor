/**
 * 导出模块类型定义
 * 与后端API契约保持一致
 */

/**
 * 导出格式
 */
export type ExportFormat = 'txt' | 'md' | 'docx' | 'zip'

/**
 * 导出任务状态
 */
export type ExportTaskStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'

/**
 * 导出类型
 */
export type ExportType = 'document' | 'project'

/**
 * 导出选项
 */
export interface ExportOptions {
  /** 是否生成目录 */
  toc?: boolean
  /** 是否添加页码 */
  pageNumbers?: boolean
  /** 是否包含注释 */
  includeNotes?: boolean
  /** 是否包含标签 */
  includeTags?: boolean
  /** 页眉 */
  header?: string
  /** 页脚 */
  footer?: string
  /** 字号 */
  fontSize?: number
  /** 行间距 */
  lineSpacing?: number
  /** 排除的章节ID */
  excludeChapters?: string[]
}

/**
 * 导出文档请求
 */
export interface ExportDocumentRequest {
  /** 导出格式 */
  format: ExportFormat
  /** 是否包含元数据 */
  includeMeta?: boolean
  /** 导出选项 */
  options?: ExportOptions
}

/**
 * 导出项目请求
 */
export interface ExportProjectRequest {
  /** 是否包含文档 */
  includeDocuments?: boolean
  /** 是否包含角色 */
  includeCharacters?: boolean
  /** 是否包含地点 */
  includeLocations?: boolean
  /** 是否包含时间线 */
  includeTimeline?: boolean
  /** 文档导出格式 */
  documentFormats?: ExportFormat
  /** 导出选项 */
  options?: ExportOptions
}

/**
 * 导出任务
 */
export interface ExportTask {
  /** 任务ID */
  id: string
  /** 导出类型 */
  type: ExportType
  /** 资源ID（文档ID或项目ID） */
  resourceId: string
  /** 资源标题 */
  resourceTitle: string
  /** 导出格式 */
  format: ExportFormat
  /** 任务状态 */
  status: ExportTaskStatus
  /** 进度（0-100） */
  progress: number
  /** 文件大小（字节） */
  fileSize: number
  /** 下载链接 */
  fileUrl?: string
  /** 文件过期时间 */
  expiresAt: string
  /** 错误信息 */
  errorMsg?: string
  /** 创建者 */
  createdBy: string
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
  /** 完成时间 */
  completedAt?: string
}

/**
 * 导出文件
 */
export interface ExportFile {
  /** 文件名 */
  filename: string
  /** 文件内容（可选） */
  content?: ArrayBuffer
  /** 文件URL */
  url?: string
  /** MIME类型 */
  mimeType: string
  /** 文件大小 */
  fileSize: number
}

/**
 * 导出任务列表响应
 */
export interface ExportTaskListResponse {
  /** 任务列表 */
  items: ExportTask[]
  /** 总数 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页数量 */
  pageSize: number
}

/**
 * 导出格式常量
 */
export const ExportFormats = {
  TXT: 'txt' as ExportFormat,
  MD: 'md' as ExportFormat,
  DOCX: 'docx' as ExportFormat,
  ZIP: 'zip' as ExportFormat,
} as const

/**
 * 导出任务状态常量
 */
export const ExportTaskStatuses = {
  PENDING: 'pending' as ExportTaskStatus,
  PROCESSING: 'processing' as ExportTaskStatus,
  COMPLETED: 'completed' as ExportTaskStatus,
  FAILED: 'failed' as ExportTaskStatus,
  CANCELLED: 'cancelled' as ExportTaskStatus,
} as const

/**
 * 导出类型常量
 */
export const ExportTypes = {
  DOCUMENT: 'document' as ExportType,
  PROJECT: 'project' as ExportType,
} as const

/**
 * 导出格式选项（用于UI展示）
 */
export const exportFormatOptions = [
  { label: 'TXT 文本', value: ExportFormats.TXT, icon: 'Document' },
  { label: 'Markdown', value: ExportFormats.MD, icon: 'Document' },
  { label: 'Word 文档', value: ExportFormats.DOCX, icon: 'Document' },
]

/**
 * 导出范围选项（用于UI展示）
 */
export const exportScopeOptions = [{ label: '全部章节', value: 'all' }]
