/**
 * Stream Bookstore Service
 * 流式搜索服务 - 支持NDJSON解析和请求取消
 */

import type {
  BookBrief,
  SearchParams
} from '../types/bookstore.types'
import type {
  StreamMessage,
  StreamOptions,
  StreamResult,
  StreamUpdate
} from '../types/search.types'

/**
 * 流式书店搜索服务
 */
class StreamBookstoreService {
  private abortController: AbortController | null = null

  /**
   * 流式搜索书籍
   * @param keyword 搜索关键词
   * @param params 搜索参数
   * @param options 流式选项
   * @returns 流式搜索结果
   */
  async streamSearchBooks(
    keyword: string,
    params: Omit<SearchParams, 'keyword'> = {},
    options: StreamOptions = {}
  ): Promise<StreamResult> {
    const {
      limit = 100,
      initialCursor,
      onUpdate,
      onComplete,
      onError,
    } = options

    // 取消之前的请求
    this.abortCurrentRequest()

    // 创建新的 AbortController
    this.abortController = new AbortController()

    try {
      // 构建查询参数
      const queryParams = new URLSearchParams()

      if (keyword) {
        queryParams.set('keyword', keyword)
      }

      if (params.category) {
        queryParams.set('category', params.category)
      }

      if (params.status) {
        queryParams.set('status', params.status)
      }

      if (params.sort_by) {
        queryParams.set('sort_by', params.sort_by)
      }

      if (params.order) {
        queryParams.set('order', params.order)
      }

      if (initialCursor) {
        queryParams.set('cursor', initialCursor)
      }

      if (limit) {
        queryParams.set('limit', limit.toString())
      }

      // 发起流式请求
      const response = await fetch(
        `/api/v1/bookstore/books/stream?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/x-ndjson',
          },
          signal: this.abortController.signal,
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // 处理流式响应
      return await this.processStream(
        response.body!,
        onUpdate,
        onComplete
      )
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request was aborted')
        }
        onError?.(error)
      }
      throw error
    }
  }

  /**
   * 处理NDJSON流
   * @param body ReadableStream
   * @param onUpdate 更新回调
   * @param onComplete 完成回调
   * @returns 流式结果
   */
  private async processStream(
    body: ReadableStream<Uint8Array>,
    onUpdate?: (data: StreamUpdate) => void,
    onComplete?: (result: StreamResult) => void
  ): Promise<StreamResult> {
    const reader = body.getReader()
    const decoder = new TextDecoder()

    // 用于存储不完整的行
    let buffer = ''

    // 存储所有书籍
    const allBooks: BookBrief[] = []

    // 最终结果
    let finalCursor = ''
    let total = 0
    let hasMore = true

    try {
      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        // 解码chunk并处理跨chunk的不完整行
        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        // 按行分割
        const lines = buffer.split('\n')

        // 保留最后一个可能不完整的行
        buffer = lines.pop() || ''

        // 处理每一行
        for (const line of lines) {
          if (!line.trim()) {
            continue
          }

          try {
            const data: StreamMessage = JSON.parse(line)

            // 检查是否为error消息，立即抛出
            if (data.type === 'error') {
              throw new Error(data.error || 'Stream error')
            }

            this.handleStreamData(data, allBooks, onUpdate)

            // 更新最终状态
            if (data.type === 'done') {
              finalCursor = data.cursor
              total = data.total
              hasMore = data.hasMore
            } else if (data.type === 'meta') {
              finalCursor = data.cursor
              total = data.total ?? 0
              hasMore = data.hasMore
            }
          } catch (e) {
            // 检查是否是我们抛出的error消息（而不是JSON解析错误）
            if (e instanceof Error) {
              // 如果是error消息，重新抛出
              if (e.message !== 'Stream error' &&
                  !e.message.includes('Unexpected token') &&
                  !e.message.includes('JSON')) {
                throw e
              }
            }
            // JSON解析错误，跳过该行
            console.error('Failed to parse stream line:', line, e)
          }
        }
      }

      // 处理缓冲区中剩余的内容
      if (buffer.trim()) {
        try {
          const data: StreamMessage = JSON.parse(buffer)

          // 检查是否为error消息，立即抛出
          if (data.type === 'error') {
            throw new Error(data.error || 'Stream error')
          }

          this.handleStreamData(data, allBooks, onUpdate)

          if (data.type === 'done') {
            finalCursor = data.cursor
            total = data.total
            hasMore = data.hasMore
          }
        } catch (e) {
          // 检查是否是我们抛出的error消息（而不是JSON解析错误）
          if (e instanceof Error) {
            // 如果是error消息，重新抛出
            if (e.message !== 'Stream error' &&
                !e.message.includes('Unexpected token') &&
                !e.message.includes('JSON')) {
              throw e
            }
          }
          console.error('Failed to parse remaining buffer:', buffer, e)
        }
      }

      const result: StreamResult = {
        cursor: finalCursor,
        total,
        hasMore,
        items: allBooks,
      }

      onComplete?.(result)
      return result
    } finally {
      // 安全释放reader锁，避免mock对象导致错误
      if (reader && typeof reader.releaseLock === 'function') {
        reader.releaseLock()
      }
    }
  }

  /**
   * 处理流数据
   * @param data 流消息
   * @param allBooks 所有书籍数组
   * @param onUpdate 更新回调
   */
  private handleStreamData(
    data: StreamMessage,
    allBooks: BookBrief[],
    onUpdate?: (update: StreamUpdate) => void
  ): void {
    switch (data.type) {
      case 'meta':
        onUpdate?.({
          type: 'meta',
          cursor: data.cursor,
          total: data.total ?? 0,
          hasMore: data.hasMore,
        })
        break

      case 'data':
        if (data.books && Array.isArray(data.books)) {
          allBooks.push(...data.books)
          onUpdate?.({
            type: 'data',
            books: data.books,
          })
        }
        break

      case 'progress':
        onUpdate?.({
          type: 'progress',
          loaded: data.loaded,
          total: data.total,
        })
        break

      case 'error':
        throw new Error(data.error || 'Stream error')

      case 'done':
        // Done消息主要在processStream中处理
        break
    }
  }

  /**
   * 取消当前请求
   */
  abortCurrentRequest(): void {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.abortCurrentRequest()
  }
}

// 导出单例
export const streamBookstoreService = new StreamBookstoreService()
export default streamBookstoreService
