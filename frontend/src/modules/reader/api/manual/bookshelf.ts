/**
 * 书架批量操作 API
 * 基于现有API封装批量操作
 */
import { httpService } from '@/core/services/http.service'

/**
 * 批量移动请求参数
 */
export interface BatchMoveRequest {
  book_ids: string[]
  category: string // reading, want_read, finished
}

/**
 * 批量删除请求参数
 */
export interface BatchRemoveRequest {
  book_ids: string[]
}

/**
 * 导出请求参数
 */
export interface ExportRequest {
  book_ids: string[]
  format: 'json' | 'csv' | 'txt'
}

/**
 * 批量操作结果
 */
export interface BatchOperationResult {
  success: boolean
  count: number
  message?: string
}

/**
 * 书架批量操作 API
 */
export const bookshelfAPI = {
  /**
   * 批量更新书籍状态（可用于"移动"到不同分类）
   * 使用现有的 /api/v1/reader/books/batch/status 接口
   */
  async batchUpdateStatus(bookIds: string[], status: string): Promise<BatchOperationResult> {
    const result = await httpService.put<{ count: number }>('/reader/books/batch/status', {
      bookIds,
      status,
    })
    return {
      success: true,
      count: result.count,
    }
  },

  /**
   * 批量移出书架（循环调用单个删除）
   */
  async batchRemove(bookIds: string[]): Promise<BatchOperationResult> {
    let successCount = 0
    const errors: string[] = []

    for (const bookId of bookIds) {
      try {
        await httpService.delete(`/reader/books/${bookId}`)
        successCount++
      } catch (error: any) {
        errors.push(`${bookId}: ${error.message || '删除失败'}`)
      }
    }

    return {
      success: errors.length === 0,
      count: successCount,
      message: errors.length > 0 ? `部分删除失败: ${errors.join('; ')}` : undefined,
    }
  },

  /**
   * 导出书架数据（客户端实现）
   * @param books 书架数据
   * @param format 导出格式
   */
  exportBooks(books: any[], format: 'json' | 'csv' | 'txt'): void {
    let content = ''
    let filename = `bookshelf_${new Date().toISOString().slice(0, 10)}`
    let mimeType = 'text/plain'

    switch (format) {
      case 'json':
        content = JSON.stringify(books, null, 2)
        filename += '.json'
        mimeType = 'application/json'
        break

      case 'csv':
        content = this.booksToCSV(books)
        filename += '.csv'
        mimeType = 'text/csv'
        break

      case 'txt':
        content = this.booksToTXT(books)
        filename += '.txt'
        mimeType = 'text/plain'
        break
    }

    // 创建下载
    const blob = new Blob([content], { type: mimeType })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  },

  /**
   * 将书籍数据转换为CSV格式
   */
  booksToCSV(books: any[]): string {
    const headers = ['书名', '作者', '分类', '当前章节', '总章节', '进度', '最后阅读时间']
    const rows = [headers.join(',')]

    for (const book of books) {
      const row = [
        this.escapeCSV(book.book?.title || book.title || ''),
        this.escapeCSV(book.book?.author || book.author || ''),
        this.escapeCSV(book.book?.category || book.category || ''),
        String(book.current_chapter || 0),
        String(book.book?.total_chapters || book.total_chapters || 0),
        `${Math.round((book.progress || 0) * 100)}%`,
        book.last_read_at || book.updatedAt || '',
      ]
      rows.push(row.join(','))
    }

    return rows.join('\n')
  },

  /**
   * 将书籍数据转换为TXT格式
   */
  booksToTXT(books: any[]): string {
    const lines = ['=== 我的书架 ===\n']

    for (let i = 0; i < books.length; i++) {
      const book = books[i]
      const title = book.book?.title || book.title || '未知书名'
      const author = book.book?.author || book.author || '未知作者'
      const progress = Math.round((book.progress || 0) * 100)
      const currentChapter = book.current_chapter || 0
      const totalChapters = book.book?.total_chapters || book.total_chapters || 0

      lines.push(`${i + 1}. ${title}`)
      lines.push(`   作者: ${author}`)
      lines.push(`   进度: ${progress}% (${currentChapter}/${totalChapters}章)`)
      lines.push(`   最后阅读: ${book.last_read_at || book.updatedAt || '未读'}\n`)
    }

    return lines.join('\n')
  },

  /**
   * 转义CSV字段
   */
  escapeCSV(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`
    }
    return field
  },
}

export default bookshelfAPI
