/**
 * Bookshelf Service
 * Business logic for bookshelf management
 */

import * as bookshelfAPI from '@/modules/reader/api'
import type { BookshelfItem } from '../types/reader.types'

class BookshelfService {
  private toTimestamp(value?: string | number | null): number {
    if (typeof value === 'number') return value
    if (!value) return 0

    const parsed = new Date(value).getTime()
    return Number.isFinite(parsed) ? parsed : 0
  }

  /**
   * Get bookshelf items
   */
  async getBookshelf(): Promise<BookshelfItem[]> {
    const response = await bookshelfAPI.getBookshelf()
    return (response as any).data?.items || (response as any).items || []
  }

  /**
   * Add book to bookshelf
   */
  async addToBookshelf(bookId: string): Promise<void> {
    await bookshelfAPI.addToBookshelf(bookId)
  }

  /**
   * Remove book from bookshelf
   */
  async removeFromBookshelf(bookId: string): Promise<void> {
    await bookshelfAPI.removeFromBookshelf(bookId)
  }

  /**
   * Check if book is in bookshelf
   */
  async isInBookshelf(bookId: string): Promise<boolean> {
    try {
      const bookshelf = await this.getBookshelf()
      return bookshelf.some(item => item.book.id === bookId)
    } catch (error) {
      return false
    }
  }

  /**
   * Update book status (reading/want_read/finished)
   */
  async updateBookStatus(bookId: string, status: 'reading' | 'want_read' | 'finished'): Promise<void> {
    await bookshelfAPI.updateBookStatus(bookId, { status } as any)
  }

  /**
   * Batch update book status
   */
  async batchUpdateBookStatus(
    bookIds: string[],
    status: 'reading' | 'want_read' | 'finished'
  ): Promise<{ count: number }> {
    const response = await bookshelfAPI.batchUpdateBookStatus({ bookIds, status } as any)
    return (response as any).data || { count: bookIds.length }
  }

  /**
   * Sort bookshelf items
   */
  sortBookshelf(
    items: BookshelfItem[],
    sortBy: 'addTime' | 'updateTime' | 'lastReadTime'
  ): BookshelfItem[] {
    return [...items].sort((a, b) => {
      switch (sortBy) {
        case 'addTime':
          return (b.addTime || 0) - (a.addTime || 0)
        case 'updateTime':
          return this.toTimestamp(b.book.updateTime) - this.toTimestamp(a.book.updateTime)
        case 'lastReadTime':
          return (b.lastReadTime || 0) - (a.lastReadTime || 0)
        default:
          return 0
      }
    })
  }

  /**
   * Filter bookshelf items
   */
  filterBookshelf(
    items: BookshelfItem[],
    filters: {
      status?: string
      category?: string
      hasUpdate?: boolean
    }
  ): BookshelfItem[] {
    let filtered = items

    if (filters.status) {
      filtered = filtered.filter(item => item.book.status === filters.status)
    }

    if (filters.category) {
      filtered = filtered.filter(item => item.book.category === filters.category)
    }

    if (filters.hasUpdate) {
      filtered = filtered.filter(item => item.hasUpdate)
    }

    return filtered
  }
}

export const bookshelfService = new BookshelfService()
export default bookshelfService
