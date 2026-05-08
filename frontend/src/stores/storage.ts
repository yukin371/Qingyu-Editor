import { defineStore } from 'pinia'
import * as storageAPI from '@/modules/shared/api/storage'
import type { FileInfo, FileListParams, UploadProgress, FileCategory } from '@/types/shared'

/**
 * 存储状态接口
 */
export interface StorageState {
  // 文件列表
  files: FileInfo[]
  filesTotal: number
  filesPage: number
  filesPageSize: number

  // 上传队列
  uploadQueue: UploadProgress[]

  // 当前分类
  currentCategory: string

  // 加载状态
  loading: boolean
  uploading: boolean
  error: string | null
}

export const useStorageStore = defineStore('storage', {
  state: (): StorageState => ({
    // 文件列表
    files: [],
    filesTotal: 0,
    filesPage: 1,
    filesPageSize: 20,

    // 上传队列
    uploadQueue: [],

    // 当前分类
    currentCategory: '',

    // 加载状态
    loading: false,
    uploading: false,
    error: null
  }),

  getters: {
    /**
     * 获取上传中的文件数量
     */
    uploadingCount: (state): number => {
      return state.uploadQueue.filter((item) => item.status === 'uploading').length
    },

    /**
     * 获取上传成功的文件数量
     */
    uploadSuccessCount: (state): number => {
      return state.uploadQueue.filter((item) => item.status === 'done').length
    },

    /**
     * 获取上传失败的文件数量
     */
    uploadErrorCount: (state): number => {
      return state.uploadQueue.filter((item) => item.status === 'error').length
    },

    /**
     * 是否有文件正在上传
     */
    hasUploading: (state): boolean => {
      return state.uploadQueue.some((item) => item.status === 'uploading')
    },

    /**
     * 按分类筛选的文件列表
     */
    filesByCategory: (state) => (category: string): FileInfo[] => {
      if (!category) return state.files
      return state.files.filter((file) => file.category === category)
    },

    /**
     * 文件总大小（字节）
     */
    totalFileSize: (state): number => {
      return state.files.reduce((sum, file) => sum + file.size, 0)
    },

    /**
     * 格式化的文件总大小
     */
    formattedTotalSize: (state): string => {
      const size = state.files.reduce((sum, file) => sum + file.size, 0)
      return formatFileSize(size)
    }
  },

  actions: {
    /**
     * 获取文件列表
     */
    async fetchFiles(params?: FileListParams): Promise<void> {
      this.loading = true
      this.error = null

      try {
        const queryParams: FileListParams = {
          page: params?.page || this.filesPage,
          page_size: params?.page_size || this.filesPageSize,
          category: params?.category || (this.currentCategory as FileCategory) || undefined
        }

        const response = await storageAPI.listFiles(queryParams)

        // 处理响应数据
        if (Array.isArray(response)) {
          this.files = response
        } else if (response.data) {
          this.files = response.data
          this.filesTotal = response.pagination?.total || 0
          this.filesPage = response.pagination?.page || queryParams.page!
          this.filesPageSize = response.pagination?.pageSize || queryParams.page_size!
        }
      } catch (error: any) {
        this.error = error.message || '获取文件列表失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 上传文件
     */
    async uploadFile(file: File, path?: string): Promise<FileInfo> {
      // 添加到上传队列
      const uploadItem: UploadProgress = {
        loaded: 0,
        total: file.size,
        percentage: 0,
        status: 'uploading'
      }
      this.uploadQueue.push(uploadItem)

      this.uploading = true
      this.error = null

      try {
        // 调用上传API
        const result = await storageAPI.uploadFile(file, path)

        // 更新上传队列状态
        const index = this.uploadQueue.findIndex((item) => item === uploadItem)
        if (index !== -1) {
          this.uploadQueue[index].status = 'done'
          this.uploadQueue[index].percentage = 100
        }

        // 刷新文件列表
        await this.fetchFiles()

        return result.data?.file || result.data as any || result as any
      } catch (error: any) {
        // 更新上传队列状态
        const index = this.uploadQueue.findIndex((item) => item === uploadItem)
        if (index !== -1) {
          this.uploadQueue[index].status = 'error'
        }

        this.error = error.message || '上传文件失败'
        throw error
      } finally {
        this.uploading = this.uploadQueue.some((item) => item.status === 'uploading')
      }
    },

    /**
     * 批量上传文件
     */
    async uploadFiles(files: File[], path?: string): Promise<FileInfo[]> {
      const results: FileInfo[] = []

      for (const file of files) {
        try {
          const result = await this.uploadFile(file, path)
          results.push(result)
        } catch (error) {
          console.error(`上传文件 ${file.name} 失败:`, error)
        }
      }

      return results
    },

    /**
     * 删除文件
     */
    async deleteFile(fileId: string): Promise<void> {
      this.loading = true
      this.error = null

      try {
        await storageAPI.deleteFile(fileId)

        // 从文件列表中移除
        const index = this.files.findIndex((file) => file.fileId === fileId)
        if (index !== -1) {
          this.files.splice(index, 1)
          this.filesTotal--
        }
      } catch (error: any) {
        this.error = error.message || '删除文件失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取文件信息
     */
    async getFileInfo(fileId: string): Promise<FileInfo> {
      this.loading = true
      this.error = null

      try {
        const fileInfo = await storageAPI.getFileInfo(fileId)
        return fileInfo.data as any || fileInfo as any
      } catch (error: any) {
        this.error = error.message || '获取文件信息失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取文件访问URL
     */
    async getFileURL(fileId: string, expire = 3600): Promise<string> {
      try {
        const result = await storageAPI.getFileURL(fileId, expire)
        return result.data?.url || ''
      } catch (error: any) {
        this.error = error.message || '获取文件URL失败'
        throw error
      }
    },

    /**
     * 下载文件
     */
    async downloadFile(fileId: string, filename: string): Promise<void> {
      try {
        const blob = await storageAPI.downloadFile(fileId)

        // 创建下载链接
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (error: any) {
        this.error = error.message || '下载文件失败'
        throw error
      }
    },

    /**
     * 设置当前分类
     */
    setCategory(category: string): void {
      this.currentCategory = category
    },

    /**
     * 清除上传队列
     */
    clearUploadQueue(): void {
      this.uploadQueue = []
    },

    /**
     * 移除上传队列中的项
     */
    removeUploadItem(fileId: string): void {
      const index = this.uploadQueue.findIndex((item) => item.fileId === fileId)
      if (index !== -1) {
        this.uploadQueue.splice(index, 1)
      }
    },

    /**
     * 清除错误
     */
    clearError(): void {
      this.error = null
    },

    /**
     * 重置状态
     */
    reset(): void {
      this.files = []
      this.filesTotal = 0
      this.filesPage = 1
      this.uploadQueue = []
      this.currentCategory = ''
      this.error = null
    }
  }
})

/**
 * 格式化文件大小
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

