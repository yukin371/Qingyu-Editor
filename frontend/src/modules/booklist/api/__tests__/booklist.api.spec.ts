/**
 * Booklist API测试
 */


import * as booklistApi from '../index'
import { createMockBooklist, createMockBooklists } from '../../../../tests/fixtures'
import { mockSuccessApiCall, mockErrorApiCall } from '@/tests/utils/api-mock'

// Mock HTTP服务
vi.mock('@/core/http', () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

import { http } from '@/core/http'

describe('booklistApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getBookLists', () => {
    it('should return booklist list when API call succeeds', async () => {
      // Arrange
      const mockData = {
        list: createMockBooklists(3),
        total: 3,
        page: 1,
        size: 10,
      }
      vi.mocked(http.get).mockImplementation(mockSuccessApiCall(mockData))

      // Act
      const result = await booklistApi.getBookLists({ page: 1, size: 10 })

      // Assert
      expect(result).toEqual(mockData)
      expect(http.get).toHaveBeenCalledTimes(1)
      expect(http.get).toHaveBeenCalledWith('/api/v1/booklists', {
        params: { page: 1, size: 10 },
      })
    })

    it('should return booklist list without params', async () => {
      // Arrange
      const mockData = {
        list: createMockBooklists(5),
        total: 5,
        page: 1,
        size: 10,
      }
      vi.mocked(http.get).mockImplementation(mockSuccessApiCall(mockData))

      // Act
      const result = await booklistApi.getBookLists()

      // Assert
      expect(result).toEqual(mockData)
      expect(http.get).toHaveBeenCalledWith('/api/v1/booklists', { params: undefined })
    })

    it('should throw error when API call fails', async () => {
      // Arrange
      const error = new Error('Network error')
      vi.mocked(http.get).mockImplementation(mockErrorApiCall(error.message))

      // Act & Assert
      await expect(booklistApi.getBookLists({})).rejects.toThrow('Network error')
    })
  })

  describe('getBookListDetail', () => {
    it('should return booklist detail when API call succeeds', async () => {
      // Arrange
      const mockBooklist = createMockBooklist()
      vi.mocked(http.get).mockImplementation(mockSuccessApiCall(mockBooklist))

      // Act
      const result = await booklistApi.getBookListDetail(mockBooklist.id)

      // Assert
      expect(result).toEqual(mockBooklist)
      expect(http.get).toHaveBeenCalledWith(`/api/v1/booklists/${mockBooklist.id}`)
    })

    it('should throw error when booklist not found', async () => {
      // Arrange
      const error = new Error('Booklist not found')
      vi.mocked(http.get).mockImplementation(mockErrorApiCall(error.message))

      // Act & Assert
      await expect(booklistApi.getBookListDetail('invalid-id')).rejects.toThrow(
        'Booklist not found'
      )
    })
  })

  describe('createBookList', () => {
    it('should create booklist when data is valid', async () => {
      // Arrange
      const newBooklist = {
        title: '新书单',
        description: '这是一个新书单',
        cover: 'https://example.com/cover.jpg',
        isPublic: true,
        tags: ['玄幻', '仙侠'],
      }
      const mockBooklist = createMockBooklist(newBooklist)
      vi.mocked(http.post).mockImplementation(mockSuccessApiCall(mockBooklist))

      // Act
      const result = await booklistApi.createBookList(newBooklist)

      // Assert
      expect(result).toEqual(mockBooklist)
      expect(http.post).toHaveBeenCalledWith('/api/v1/booklists', newBooklist)
    })

    it('should throw error when data is invalid', async () => {
      // Arrange
      const invalidData = {
        title: '',
        description: '',
        isPublic: true,
      }
      const error = new Error('Invalid data')
      vi.mocked(http.post).mockImplementation(mockErrorApiCall(error.message))

      // Act & Assert
      await expect(booklistApi.createBookList(invalidData)).rejects.toThrow('Invalid data')
    })
  })

  describe('updateBookList', () => {
    it('should update booklist when data is valid', async () => {
      // Arrange
      const booklistId = 'booklist_123'
      const updateData = {
        title: '更新后的标题',
        description: '更新后的描述',
      }
      const updatedBooklist = createMockBooklist({ ...updateData })
      vi.mocked(http.put).mockImplementation(mockSuccessApiCall(updatedBooklist))

      // Act
      const result = await booklistApi.updateBookList(booklistId, updateData)

      // Assert
      expect(result).toEqual(updatedBooklist)
      expect(http.put).toHaveBeenCalledWith(`/api/v1/booklists/${booklistId}`, updateData)
    })
  })

  describe('deleteBookList', () => {
    it('should delete booklist when API call succeeds', async () => {
      // Arrange
      const booklistId = 'booklist_123'
      const mockResponse = { success: true }
      vi.mocked(http.delete).mockImplementation(mockSuccessApiCall(mockResponse))

      // Act
      const result = await booklistApi.deleteBookList(booklistId)

      // Assert
      expect(result).toEqual(mockResponse)
      expect(http.delete).toHaveBeenCalledWith(`/api/v1/booklists/${booklistId}`)
    })
  })

  describe('favoriteBookList', () => {
    it('should favorite booklist when API call succeeds', async () => {
      // Arrange
      const booklistId = 'booklist_123'
      const mockResponse = { success: true }
      vi.mocked(http.post).mockImplementation(mockSuccessApiCall(mockResponse))

      // Act
      const result = await booklistApi.favoriteBookList(booklistId)

      // Assert
      expect(result).toEqual(mockResponse)
      expect(http.post).toHaveBeenCalledWith(`/api/v1/booklists/${booklistId}/favorite`)
    })
  })

  describe('unfavoriteBookList', () => {
    it('should unfavorite booklist when API call succeeds', async () => {
      // Arrange
      const booklistId = 'booklist_123'
      const mockResponse = { success: true }
      vi.mocked(http.delete).mockImplementation(mockSuccessApiCall(mockResponse))

      // Act
      const result = await booklistApi.unfavoriteBookList(booklistId)

      // Assert
      expect(result).toEqual(mockResponse)
      expect(http.delete).toHaveBeenCalledWith(`/api/v1/booklists/${booklistId}/favorite`)
    })
  })

  describe('addBookToList', () => {
    it('should add book to list when API call succeeds', async () => {
      // Arrange
      const listId = 'booklist_123'
      const bookId = 'book_456'
      const note = '推荐书籍'
      const mockResponse = {
        bookId,
        listId,
        note,
        addedAt: new Date().toISOString(),
      }
      vi.mocked(http.post).mockImplementation(mockSuccessApiCall(mockResponse))

      // Act
      const result = await booklistApi.addBookToList(listId, { bookId, note })

      // Assert
      expect(result).toEqual(mockResponse)
      expect(http.post).toHaveBeenCalledWith(`/api/v1/booklists/${listId}/books`, {
        bookId,
        note,
      })
    })
  })

  describe('removeBookFromList', () => {
    it('should remove book from list when API call succeeds', async () => {
      // Arrange
      const listId = 'booklist_123'
      const bookId = 'book_456'
      const mockResponse = { success: true }
      vi.mocked(http.delete).mockImplementation(mockSuccessApiCall(mockResponse))

      // Act
      const result = await booklistApi.removeBookFromList(listId, bookId)

      // Assert
      expect(result).toEqual(mockResponse)
      expect(http.delete).toHaveBeenCalledWith(
        `/api/v1/booklists/${listId}/books/${bookId}`
      )
    })
  })

  describe('getMyBookListStats', () => {
    it('should return my booklist stats when API call succeeds', async () => {
      // Arrange
      const mockStats = {
        totalBooklists: 10,
        totalBooks: 100,
        totalLikes: 50,
      }
      vi.mocked(http.get).mockImplementation(mockSuccessApiCall(mockStats))

      // Act
      const result = await booklistApi.getMyBookListStats()

      // Assert
      expect(result).toEqual(mockStats)
      expect(http.get).toHaveBeenCalledWith('/api/v1/booklists/my/stats')
    })
  })

  describe('getPopularTags', () => {
    it('should return popular tags when API call succeeds', async () => {
      // Arrange
      const mockTags = [
        { tag: '玄幻', count: 100 },
        { tag: '仙侠', count: 80 },
        { tag: '都市', count: 60 },
      ]
      vi.mocked(http.get).mockImplementation(mockSuccessApiCall(mockTags))

      // Act
      const result = await booklistApi.getPopularTags(20)

      // Assert
      expect(result).toEqual(mockTags)
      expect(http.get).toHaveBeenCalledWith('/api/v1/booklists/tags/popular', {
        params: { limit: 20 },
      })
    })

    it('should use default limit when not provided', async () => {
      // Arrange
      const mockTags = [{ tag: '玄幻', count: 100 }]
      vi.mocked(http.get).mockImplementation(mockSuccessApiCall(mockTags))

      // Act
      const result = await booklistApi.getPopularTags()

      // Assert
      expect(result).toEqual(mockTags)
      expect(http.get).toHaveBeenCalledWith('/api/v1/booklists/tags/popular', {
        params: { limit: 20 },
      })
    })
  })
})
