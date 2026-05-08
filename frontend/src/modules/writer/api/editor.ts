import httpService from '@/core/services/http.service'
import type {
  AutoSaveRequest,
  AutoSaveResponse,
  SaveStatusResponse,
  DocumentContentResponse,
  UpdateContentRequest,
  WordCountRequest,
  WordCountResult,
  ShortcutConfig,
  UpdateShortcutsRequest,
  ShortcutCategory,
} from '../types/editor'

const BASE_DOC_URL = '/writer/documents'
const BASE_USER_URL = '/writer/user'

/**
 * 写作编辑器 API
 * @description 对接后端 /api/v1/documents 和 /api/v1/user 路由，提供文档编辑和用户配置功能
 * @endpoint /api/v1/documents
 * @category writer
 * @tags 编辑器
 */
export const editorApi = {
  // ==========================================
  // 文档内容与保存
  // ==========================================

  /**
   * 获取文档内容 (编辑器加载用)
   * @description 获取指定文档的内容，用于编辑器初始化加载
   * @endpoint GET /api/v1/documents/:id/content
   * @category writer
   * @tags 编辑器
   * @param {string} documentId - 文档ID
   * @response {DocumentContentResponse} 200 - 成功返回文档内容和元数据
   * @security BearerAuth
   */
  getContent(documentId: string) {
    return httpService.get<DocumentContentResponse>(`${BASE_DOC_URL}/${documentId}/content`)
  },

  /**
   * 手动更新/保存文档内容
   * @description 手动保存文档内容
   * @endpoint PUT /api/v1/documents/:id/content
   * @category writer
   * @tags 编辑器
   * @param {string} documentId - 文档ID
   * @param {UpdateContentRequest} data - 更新数据（包含内容和版本）
   * @response {void} 200 - 成功更新文档
   * @security BearerAuth
   */
  updateContent(documentId: string, data: UpdateContentRequest) {
    return httpService.put<void>(`${BASE_DOC_URL}/${documentId}/content`, data)
  },

  /**
   * 自动保存文档
   * @description 自动保存文档内容，返回409表示版本冲突需要处理
   * @endpoint POST /api/v1/documents/:id/autosave
   * @category writer
   * @tags 编辑器
   * @param {string} documentId - 文档ID
   * @param {AutoSaveRequest} data - 自动保存数据（内容和版本）
   * @response {AutoSaveResponse} 200 - 成功自动保存，409表示版本冲突
   * @security BearerAuth
   */
  autoSave(documentId: string, data: AutoSaveRequest) {
    return httpService.post<AutoSaveResponse>(`${BASE_DOC_URL}/${documentId}/autosave`, data, {
      silent: true,
      skipErrorHandler: true,
    } as any)
  },

  /**
   * 获取保存状态
   * @description 获取文档的保存状态和最后保存时间
   * @endpoint GET /api/v1/documents/:id/save-status
   * @category writer
   * @tags 编辑器
   * @param {string} documentId - 文档ID
   * @response {SaveStatusResponse} 200 - 成功返回保存状态
   * @security BearerAuth
   */
  getSaveStatus(documentId: string) {
    return httpService.get<SaveStatusResponse>(`${BASE_DOC_URL}/${documentId}/save-status`)
  },

  // ==========================================
  // 工具
  // ==========================================

  /**
   * 服务端计算字数
   * @description 使用服务端逻辑计算文档字数，结果可能更准确
   * @endpoint POST /api/v1/documents/:id/word-count
   * @category writer
   * @tags 编辑器
   * @param {string} documentId - 文档ID
   * @param {WordCountRequest} data - 字数计算请求参数
   * @response {WordCountResult} 200 - 成功返回字数统计结果
   * @security BearerAuth
   */
  calculateWordCount(documentId: string, data: WordCountRequest) {
    return httpService.post<WordCountResult>(`${BASE_DOC_URL}/${documentId}/word-count`, data)
  },

  // ==========================================
  // 用户快捷键配置
  // ==========================================

  /**
   * 获取用户快捷键配置
   * @description 获取用户的编辑器快捷键配置
   * @endpoint GET /api/v1/user/shortcuts
   * @category user
   * @tags 用户配置
   * @response {ShortcutConfig} 200 - 成功返回快捷键配置
   * @security BearerAuth
   */
  getShortcuts() {
    return httpService.get<ShortcutConfig>(`${BASE_USER_URL}/shortcuts`)
  },

  /**
   * 更新用户快捷键配置
   * @description 更新用户的编辑器快捷键配置
   * @endpoint PUT /api/v1/user/shortcuts
   * @category user
   * @tags 用户配置
   * @param {UpdateShortcutsRequest} data - 快捷键配置数据
   * @response {void} 200 - 成功更新快捷键配置
   * @security BearerAuth
   */
  updateShortcuts(data: UpdateShortcutsRequest) {
    return httpService.put<void>(`${BASE_USER_URL}/shortcuts`, data)
  },

  /**
   * 重置快捷键为默认
   * @description 将快捷键配置重置为系统默认值
   * @endpoint POST /api/v1/user/shortcuts/reset
   * @category user
   * @tags 用户配置
   * @response {void} 200 - 成功重置快捷键
   * @security BearerAuth
   */
  resetShortcuts() {
    return httpService.post<void>(`${BASE_USER_URL}/shortcuts/reset`)
  },

  /**
   * 获取快捷键帮助列表 (用于显示帮助弹窗)
   * @description 获取系统默认的快捷键帮助信息
   * @endpoint GET /api/v1/user/shortcuts/help
   * @category user
   * @tags 用户配置
   * @response {ShortcutCategory[]} 200 - 成功返回快捷键帮助列表
   * @security BearerAuth
   */
  getShortcutHelp() {
    return httpService.get<ShortcutCategory[]>(`${BASE_USER_URL}/shortcuts/help`)
  },
}

// ==========================================
// 命名导出函数 (为了向后兼容 writerStore)
// ==========================================

/**
 * 获取文档内容
 */
export const getDocumentContent = (documentId: string) => {
  return editorApi.getContent(documentId)
}

/**
 * 更新文档内容
 */
export const updateDocumentContent = (documentId: string, content: string, version: number = 1) => {
  return editorApi.updateContent(documentId, { documentId, content, version } as any)
}

/**
 * 自动保存文档
 */
export const autosaveDocument = (documentId: string, content: string, version: number) => {
  return editorApi.autoSave(documentId, { documentId, content, version } as any)
}

/**
 * 获取保存状态
 */
export const getSaveStatus = (documentId: string) => {
  return editorApi.getSaveStatus(documentId)
}
