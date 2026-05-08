/**
 * 存储服务API模块 (v1.3)
 * 基于 doc/api/frontend/共享服务API参考.md
 */

import { httpService } from '@/core/services/http.service'
import type { APIResponse, PaginatedResponse } from '@/types/api'
import type {
  FileInfo,
  UploadResponse,
  FileListParams,
  FileCategory
} from '@/types/shared'

/**
 * 存储API接口 (v1.3)
 */
export const storageAPI = {
  /**
   * 上传文件
   */
  async uploadFile(file: File, path?: string, category?: FileCategory): Promise<APIResponse<UploadResponse>> {
    const formData = new FormData()
    formData.append('file', file)
    if (path) {
      formData.append('path', path)
    }
    if (category) {
      formData.append('category', category)
    }

    return httpService.post<APIResponse<UploadResponse>>('/shared/storage/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  /**
   * 下载文件
   */
  async downloadFile(fileId: string): Promise<Blob> {
    return httpService.get<Blob>(`/shared/storage/download/${fileId}`, {
      responseType: 'blob'
    })
  },

  /**
   * 删除文件
   */
  async deleteFile(fileId: string): Promise<APIResponse<null>> {
    return httpService.delete<APIResponse<null>>(`/shared/storage/files/${fileId}`)
  },

  /**
   * 获取文件信息
   */
  async getFileInfo(fileId: string): Promise<APIResponse<FileInfo>> {
    return httpService.get<APIResponse<FileInfo>>(`/shared/storage/files/${fileId}`)
  },

  /**
   * 列出文件
   */
  async listFiles(params?: FileListParams): Promise<PaginatedResponse<FileInfo>> {
    return httpService.get<PaginatedResponse<FileInfo>>('/shared/storage/files', {
      params
    })
  },

  /**
   * 获取文件访问URL
   */
  async getFileURL(fileId: string, expire: number = 3600): Promise<APIResponse<{ url: string; expiresAt: string }>> {
    return httpService.get<APIResponse<{ url: string; expiresAt: string }>>(`/shared/storage/files/${fileId}/url`, {
      params: { expire }
    })
  }
}

// 向后兼容：导出旧的函数名
export const uploadFile = (file: File, path?: string) => storageAPI.uploadFile(file, path)
export const downloadFile = (fileId: string) => storageAPI.downloadFile(fileId)
export const deleteFile = (fileId: string) => storageAPI.deleteFile(fileId)
export const getFileInfo = (fileId: string) => storageAPI.getFileInfo(fileId)
export const listFiles = (params: FileListParams) => storageAPI.listFiles(params)
export const getFileURL = (fileId: string, expire?: number) => storageAPI.getFileURL(fileId, expire)

export default storageAPI


