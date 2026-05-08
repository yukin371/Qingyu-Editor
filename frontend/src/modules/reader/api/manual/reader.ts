/**
 * 阅读器核心 API 模块 (v1.3)
 * 对接后端 /api/v1/reader/* 路由
 * 后端路由文档: Qingyu_backend/router/reader/reader_router.go
 */

import { httpService } from '@/core/services/http.service'

/**
 * 章节
 */
export interface Chapter {
  id: string
  bookId: string
  chapterNumber: number
  title: string
  content?: string
  wordCount?: number
  publishedAt?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * 章节内容
 */
export interface ChapterContent {
  chapter: Chapter
  content: string
  paragraphs?: ChapterParagraph[]
  nextChapter?: Chapter
  prevChapter?: Chapter
}

export interface ChapterParagraph {
  id: string
  paragraphOrder: number
  content: string
  format?: string
  wordCount?: number
}

/**
 * 章节列表项
 */
export interface ChapterListItem {
  id: string
  chapterNumber: number
  title: string
  wordCount?: number
  publishedAt?: string
}

/**
 * 章节导航
 */
export interface ChapterNavigation {
  previous: Chapter | null
  current: Chapter
  next: Chapter | null
}

/**
 * 阅读进度
 */
export interface ReadingProgress {
  bookId: string
  chapterId: string
  chapterNumber: number
  progress: number
  lastReadTime: string
}

/**
 * 阅读历史
 */
export interface ReadingHistory {
  id: string
  bookId: string
  chapterId: string
  position: number
  duration?: number
  timestamp: string
}

/**
 * 阅读设置
 */
export interface ReadingSettings {
  fontSize: number
  lineHeight: number
  theme: 'light' | 'dark' | 'sepia'
  fontFamily: string
  autoScroll?: boolean
  scrollSpeed?: number
}

/**
 * 注记类型
 */
export type AnnotationType = 'bookmark' | 'highlight' | 'note'

/**
 * 注记
 */
export interface Annotation {
  id: string
  bookId: string
  chapterId: string
  type: AnnotationType
  position: number
  length?: number
  content?: string
  note?: string
  color?: string
  createTime: string
  updateTime: string
}

/**
 * 注记统计
 */
export interface AnnotationStats {
  total: number
  bookmarks: number
  highlights: number
  notes: number
}

/**
 * 阅读器核心 API 接口 (v1.3)
 * @description 对接后端 /api/v1/reader/* 路由，提供章节阅读、进度管理、注记等功能
 * @endpoint /api/v1/reader
 * @category reader
 * @tags 阅读器核心
 */
export const readerAPI = {
  // ==================== 章节阅读 ====================

  /**
   * 获取章节信息（使用公开API，不需要登录）
   * @description 获取章节的元数据信息，不包含正文内容
   * @endpoint GET /api/v1/bookstore/chapters/:chapterId
   * @category reader
   * @tags 章节阅读
   * @param {string} chapterId - 章节ID
   * @response {APIResponse<Chapter>} 200 - 成功返回章节信息
   */
  async getChapterInfo(chapterId: string): Promise<Chapter> {
    return httpService.get<Chapter>(`/bookstore/chapters/${chapterId}`)
  },

  /**
   * 获取章节内容（使用公开API，不需要登录）
   * @description 获取章节的详细内容，包含正文和相邻章节信息
   * @endpoint GET /api/v1/bookstore/chapters/:chapterId/content
   * @category reader
   * @tags 章节阅读
   * @param {string} _bookId - 书籍ID (未使用，保留用于兼容)
   * @param {string} chapterId - 章节ID
   * @response {ChapterContent} 200 - 成功返回章节内容和相邻章节
   */
  async getChapterContent(_bookId: string, chapterId: string): Promise<ChapterContent> {
    return httpService.get<ChapterContent>(
      `/bookstore/chapters/${chapterId}/content`
    )
  },

  /**
   * 获取书籍章节列表（使用公开API，不需要登录）
   * @description 获取指定书籍的章节列表，支持分页
   * @endpoint GET /api/v1/bookstore/books/:bookId/chapters
   * @category reader
   * @tags 章节阅读
   * @param {string} bookId - 书籍ID
   * @param {number} page - 页码（默认1）
   * @param {number} size - 每页数量（默认20）
   * @response {PaginatedResponse<ChapterListItem>} 200 - 成功返回章节列表
   */
  async getChapterList(
    bookId: string,
    page: number = 1,
    size: number = 20
  ): Promise<ChapterListItem[]> {
    return httpService.get<ChapterListItem[]>(
      `/bookstore/books/${bookId}/chapters?page=${page}&size=${size}`
    )
  },

  /**
   * 获取下一章
   * @description 获取当前章节的下一章信息
   * @endpoint GET /api/v1/reader/books/:bookId/chapters/:chapterId/next
   * @category reader
   * @tags 章节阅读
   * @param {string} bookId - 书籍ID
   * @param {string} chapterId - 当前章节ID
   * @response {APIResponse<Chapter>} 200 - 成功返回下一章信息，如果已是最后章节则返回null
   * @security BearerAuth
   */
  async getNextChapter(bookId: string, chapterId: string): Promise<Chapter> {
    return httpService.get<Chapter>(
      `/reader/books/${bookId}/chapters/${chapterId}/next`
    )
  },

  /**
   * 获取上一章
   * @description 获取当前章节的上一章信息
   * @endpoint GET /api/v1/reader/books/:bookId/chapters/:chapterId/previous
   * @category reader
   * @tags 章节阅读
   * @param {string} bookId - 书籍ID
   * @param {string} chapterId - 当前章节ID
   * @response {APIResponse<Chapter>} 200 - 成功返回上一章信息，如果已是第一章则返回null
   * @security BearerAuth
   */
  async getPreviousChapter(bookId: string, chapterId: string): Promise<Chapter> {
    return httpService.get<Chapter>(
      `/reader/books/${bookId}/chapters/${chapterId}/previous`
    )
  },

  /**
   * 根据章节号获取章节
   * @description 根据章节序号直接获取章节信息
   * @endpoint GET /api/v1/reader/books/:bookId/chapters/by-number/:chapterNum
   * @category reader
   * @tags 章节阅读
   * @param {string} bookId - 书籍ID
   * @param {number} chapterNum - 章节序号
   * @response {APIResponse<Chapter>} 200 - 成功返回章节信息
   * @security BearerAuth
   */
  async getChapterByNumber(bookId: string, chapterNum: number): Promise<Chapter> {
    return httpService.get<Chapter>(
      `/reader/books/${bookId}/chapters/by-number/${chapterNum}`
    )
  },

  // ==================== 阅读进度 ====================

  /**
   * 获取阅读进度
   * @description 获取指定书籍的阅读进度
   * @endpoint GET /api/v1/reader/progress/:bookId
   * @category reader
   * @tags 阅读进度
   * @param {string} bookId - 书籍ID
   * @response {APIResponse<ReadingProgress>} 200 - 成功返回阅读进度
   * @security BearerAuth
   */
  async getProgress(bookId: string): Promise<ReadingProgress> {
    return httpService.get<ReadingProgress>(`/reader/progress/${bookId}`)
  },

  /**
   * 保存阅读进度
   * @description 保存或更新当前书籍的阅读进度
   * @endpoint POST /api/v1/reader/progress
   * @category reader
   * @tags 阅读进度
   * @param {Object} progressData - 阅读进度数据
   * @param {string} progressData.bookId - 书籍ID
   * @param {string} progressData.chapterId - 章节ID
   * @param {number} progressData.chapterNumber - 章节序号
   * @param {number} progressData.progress - 阅读进度（0-100）
   * @response {APIResponse<ReadingProgress>} 201 - 成功保存阅读进度
   * @security BearerAuth
   */
  async saveProgress(progressData: {
    bookId: string
    chapterId: string
    chapterNumber: number
    progress: number
  }): Promise<ReadingProgress> {
    return httpService.post<ReadingProgress>('/reader/progress', progressData)
  },

  /**
   * 更新阅读时长
   * @description 更新当前章节的阅读时长统计
   * @endpoint POST /api/v1/reader/progress/time
   * @category reader
   * @tags 阅读进度
   * @param {Object} timeData - 阅读时长数据
   * @param {string} timeData.bookId - 书籍ID
   * @param {string} timeData.chapterId - 章节ID
   * @param {number} timeData.duration - 阅读时长（秒）
   * @response {APIResponse<void>} 200 - 成功更新阅读时长
   * @security BearerAuth
   */
  async updateReadingTime(timeData: {
    bookId: string
    chapterId: string
    duration: number
  }): Promise<void> {
    return httpService.post<void>('/reader/progress/time', timeData)
  },

  /**
   * 获取阅读历史
   * @description 获取用户的阅读历史记录，支持分页
   * @endpoint GET /api/v1/reader/progress/history
   * @category reader
   * @tags 阅读进度
   * @param {number} page - 页码（默认1）
   * @param {number} size - 每页数量（默认20）
   * @response {PaginatedResponse<ReadingHistory>} 200 - 成功返回阅读历史
   * @security BearerAuth
   */
  async getReadingHistory(
    page: number = 1,
    size: number = 20
  ): Promise<ReadingHistory[]> {
    return httpService.get<ReadingHistory[]>('/reader/progress/history', {
      params: { page, size }
    })
  },

  /**
   * 获取总阅读时长
   * @description 获取用户的阅读时长统计信息
   * @endpoint GET /api/v1/reader/progress/stats
   * @category reader
   * @tags 阅读进度
   * @response {APIResponse<{totalTime: number, todayTime: number, weekTime: number}>} 200 - 成功返回阅读统计数据
   * @security BearerAuth
   */
  async getTotalReadingTime(): Promise<{
    totalTime: number
    todayTime: number
    weekTime: number
  }> {
    return httpService.get<{
      totalTime: number
      todayTime: number
      weekTime: number
    }>('/reader/progress/stats')
  },

  // ==================== 注记功能 ====================

  /**
   * 创建注记
   * @description 在指定位置创建书签、高亮或笔记
   * @endpoint POST /api/v1/reader/annotations
   * @category reader
   * @tags 注记功能
   * @param {Omit<Annotation, 'id' | 'createTime' | 'updateTime'>} annotation - 注记数据
   * @response {APIResponse<Annotation>} 201 - 成功创建注记
   * @security BearerAuth
   */
  async createAnnotation(
    annotation: Omit<Annotation, 'id' | 'createTime' | 'updateTime'>
  ): Promise<Annotation> {
    return httpService.post<Annotation>('/reader/annotations', annotation)
  },

  /**
   * 更新注记
   * @description 更新已有注记的内容或类型
   * @endpoint PUT /api/v1/reader/annotations/:id
   * @category reader
   * @tags 注记功能
   * @param {string} id - 注记ID
   * @param {Partial<Annotation>} annotation - 要更新的注记字段
   * @response {APIResponse<Annotation>} 200 - 成功更新注记
   * @security BearerAuth
   */
  async updateAnnotation(
    id: string,
    annotation: Partial<Annotation>
  ): Promise<Annotation> {
    return httpService.put<Annotation>(
      `/reader/annotations/${id}`,
      annotation
    )
  },

  /**
   * 删除注记
   * @description 删除指定的注记
   * @endpoint DELETE /api/v1/reader/annotations/:id
   * @category reader
   * @tags 注记功能
   * @param {string} id - 注记ID
   * @response {APIResponse<void>} 204 - 成功删除注记
   * @security BearerAuth
   */
  async deleteAnnotation(id: string): Promise<void> {
    return httpService.delete<void>(`/reader/annotations/${id}`)
  },

  /**
   * 获取书籍注记列表
   * @description 获取指定书籍的所有注记，支持按类型筛选和分页
   * @endpoint GET /api/v1/reader/annotations/book/:bookId
   * @category reader
   * @tags 注记功能
   * @param {string} bookId - 书籍ID
   * @param {AnnotationType | ''} type - 注记类型（bookmark: 书签, highlight: 高亮, note: 笔记，空字符串表示全部）
   * @param {number} page - 页码（默认1）
   * @param {number} size - 每页数量（默认20）
   * @response {PaginatedResponse<Annotation>} 200 - 成功返回注记列表
   * @security BearerAuth
   */
  async getBookAnnotations(
    bookId: string,
    type: AnnotationType | '' = '',
    page: number = 1,
    size: number = 20
  ): Promise<Annotation[]> {
    return httpService.get<Annotation[]>(
      `/reader/annotations/book/${bookId}`,
      { params: { type, page, size } }
    )
  },

  /**
   * 获取章节注记列表
   * @description 获取指定章节的所有注记
   * @endpoint GET /api/v1/reader/annotations/chapter/:chapterId
   * @category reader
   * @tags 注记功能
   * @param {string} chapterId - 章节ID
   * @response {APIResponse<Annotation[]>} 200 - 成功返回章节注记列表
   * @security BearerAuth
   */
  async getChapterAnnotations(chapterId: string): Promise<Annotation[]> {
    return httpService.get<Annotation[]>(
      `/reader/annotations/chapter/${chapterId}`
    )
  },

  /**
   * 获取注记统计
   * @description 获取用户的注记统计信息
   * @endpoint GET /api/v1/reader/annotations/stats
   * @category reader
   * @tags 注记功能
   * @response {APIResponse<AnnotationStats>} 200 - 成功返回注记统计
   * @security BearerAuth
   */
  async getAnnotationStats(): Promise<AnnotationStats> {
    return httpService.get<AnnotationStats>('/reader/annotations/stats')
  },

  /**
   * 批量创建注记
   * @description 批量创建多个注记，用于导入或同步
   * @endpoint POST /api/v1/reader/annotations/batch
   * @category reader
   * @tags 注记功能
   * @param {Omit<Annotation, 'id' | 'createTime' | 'updateTime'>[]} annotations - 注记数组
   * @response {APIResponse<{successCount: number, failedCount: number}>} 201 - 返回成功和失败数量
   * @security BearerAuth
   */
  async batchCreateAnnotations(
    annotations: Omit<Annotation, 'id' | 'createTime' | 'updateTime'>[]
  ): Promise<{
    successCount: number
    failedCount: number
  }> {
    return httpService.post<{
      successCount: number
      failedCount: number
    }>('/reader/annotations/batch', { annotations })
  },

  // ==================== 阅读设置 ====================

  /**
   * 获取阅读设置
   * @description 获取用户的阅读器设置（字体、主题、行高等）
   * @endpoint GET /api/v1/reader/settings
   * @category reader
   * @tags 阅读设置
   * @response {APIResponse<ReadingSettings>} 200 - 成功返回阅读设置
   * @security BearerAuth
   */
  async getSettings(): Promise<ReadingSettings> {
    return httpService.get<ReadingSettings>('/reader/settings')
  },

  /**
   * 保存阅读设置
   * @description 保存用户的阅读器设置
   * @endpoint POST /api/v1/reader/settings
   * @category reader
   * @tags 阅读设置
   * @param {ReadingSettings} settings - 阅读设置数据
   * @response {APIResponse<ReadingSettings>} 201 - 成功保存阅读设置
   * @security BearerAuth
   */
  async saveSettings(settings: ReadingSettings): Promise<ReadingSettings> {
    return httpService.post<ReadingSettings>('/reader/settings', settings)
  },

  /**
   * 更新阅读设置
   * @description 更新用户的阅读器设置（部分更新）
   * @endpoint PUT /api/v1/reader/settings
   * @category reader
   * @tags 阅读设置
   * @param {Partial<ReadingSettings>} settings - 要更新的设置字段
   * @response {APIResponse<ReadingSettings>} 200 - 成功更新阅读设置
   * @security BearerAuth
   */
  async updateSettings(
    settings: Partial<ReadingSettings>
  ): Promise<ReadingSettings> {
    return httpService.put<ReadingSettings>('/reader/settings', settings)
  }
}

export default readerAPI
