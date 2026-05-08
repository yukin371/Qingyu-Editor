/**
 * Booklist Store测试
 */
// @ts-nocheck - Test file with flexible type assertions

import { createPinia, setActivePinia } from 'pinia'
import { createMockBooklist, createMockBooklists } from '../../../../tests/fixtures'
import { mockSuccessApiCall, mockErrorApiCall } from '@/tests/utils/api-mock'

// Mock API - 必须在import之前
vi.mock('../../api', () => ({
  getBookLists: vi.fn(),
  getBookListDetail: vi.fn(),
  createBookList: vi.fn(),
  updateBookList: vi.fn(),
  deleteBookList: vi.fn(),
  favoriteBookList: vi.fn(),
  unfavoriteBookList: vi.fn(),
  addBookToList: vi.fn(),
  removeBookFromList: vi.fn(),
  getMyBookListStats: vi.fn(),
  getPopularTags: vi.fn(),
}))

// 导入mock后的API函数
import {
  getBookLists,
  getBookListDetail,
  createBookList,
  updateBookList,
  deleteBookList,
  favoriteBookList,
  unfavoriteBookList,
  addBookToList,
  removeBookFromList,
  getMyBookListStats,
  getPopularTags,
} from '../../api'
import { useBooklistStore } from '../booklist.store'

describe('useBooklistStore', () => {
  beforeEach(() => {
    // 创建新的pinia实例
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should initialize with correct default state', () => {
      // Act
      const store = useBooklistStore()

      // Assert
      expect(store.booklists).toEqual([])
      expect(store.currentBooklist).toBeNull()
      expect(store.myBooklists).toEqual([])
      expect(store.favoriteBooklists).toEqual([])
      expect(store.myStats).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.total).toBe(0)
      expect(store.popularTags).toEqual([])
    })

    it('should compute hasBooklists correctly', () => {
      // Arrange
      const store = useBooklistStore()

      // Assert
      expect(store.hasBooklists).toBe(false)

      // Act
      store.booklists = createMockBooklists(3)

      // Assert
      expect(store.hasBooklists).toBe(true)
    })
  })

  describe('fetchBooklists', () => {
    it('should fetch booklists successfully', async () => {
      // Arrange
      const mockData = {
        list: createMockBooklists(3),
        total: 3,
        page: 1,
        size: 10,
      }
      vi.mocked(getBookLists).mockImplementation(mockSuccessApiCall(mockData))
      const store = useBooklistStore()

      // Act
      await store.fetchBooklists({ page: 1, size: 10 })

      // Assert
      expect(store.loading).toBe(false)
      expect(store.booklists).toEqual(mockData.list)
      expect(store.total).toBe(mockData.total)
      expect(store.error).toBeNull()
      expect(getBookLists).toHaveBeenCalledWith({ page: 1, size: 10 })
    })

    it('should handle fetch booklists error', async () => {
      // Arrange
      const error = new Error('Network error')
      vi.mocked(getBookLists).mockImplementation(mockErrorApiCall(error.message))
      const store = useBooklistStore()

      // Act
      await store.fetchBooklists()

      // Assert
      expect(store.loading).toBe(false)
      expect(store.error).toBeInstanceOf(Error)
      expect(store.error?.message).toBe(error.message)
      expect(store.booklists).toEqual([])
    })

    it('should set loading to true during fetch', async () => {
      // Arrange
      const mockData = {
        list: createMockBooklists(3),
        total: 3,
        page: 1,
        size: 10,
      }
      vi.mocked(getBookLists).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockData), 100)
          }),
      )
      const store = useBooklistStore()

      // Act
      const fetchPromise = store.fetchBooklists()

      // Assert: loading should be true during fetch
      expect(store.loading).toBe(true)

      // Wait for completion
      await fetchPromise

      // Assert: loading should be false after fetch
      expect(store.loading).toBe(false)
    })
  })

  describe('fetchBooklistDetail', () => {
    it('should fetch booklist detail successfully', async () => {
      // Arrange
      const mockBooklist = createMockBooklist()
      vi.mocked(getBookListDetail).mockImplementation(mockSuccessApiCall(mockBooklist))
      const store = useBooklistStore()

      // Act
      await store.fetchBooklistDetail(mockBooklist.id)

      // Assert
      expect(store.loading).toBe(false)
      expect(store.currentBooklist).toEqual(mockBooklist)
      expect(store.error).toBeNull()
      expect(getBookListDetail).toHaveBeenCalledWith(mockBooklist.id)
    })

    it('should handle fetch booklist detail error', async () => {
      // Arrange
      const error = new Error('Booklist not found')
      vi.mocked(getBookListDetail).mockImplementation(mockErrorApiCall(error.message))
      const store = useBooklistStore()

      // Act
      await store.fetchBooklistDetail('invalid-id')

      // Assert
      expect(store.loading).toBe(false)
      expect(store.error).toBeInstanceOf(Error)
      expect(store.error?.message).toBe(error.message)
      expect(store.currentBooklist).toBeNull()
    })
  })

  describe('fetchMyBooklists', () => {
    it('should fetch my booklists successfully', async () => {
      // Arrange
      const mockData = {
        list: createMockBooklists(5),
        total: 5,
        page: 1,
        size: 10,
      }
      vi.mocked(getBookLists).mockImplementation(mockSuccessApiCall(mockData))
      const store = useBooklistStore()

      // Act
      await store.fetchMyBooklists()

      // Assert
      expect(store.myBooklists).toEqual(mockData.list)
      expect(store.loading).toBe(false)
      expect(getBookLists).toHaveBeenCalledWith({ sort: 'latest' })
    })
  })

  describe('fetchFavoriteBooklists', () => {
    it('should fetch favorite booklists successfully', async () => {
      // Arrange
      const mockData = {
        list: createMockBooklists(3),
        total: 3,
        page: 1,
        size: 10,
      }
      vi.mocked(getBookLists).mockImplementation(mockSuccessApiCall(mockData))
      const store = useBooklistStore()

      // Act
      await store.fetchFavoriteBooklists()

      // Assert
      expect(store.favoriteBooklists).toEqual(mockData.list)
      expect(store.loading).toBe(false)
      expect(getBookLists).toHaveBeenCalledWith({ sort: 'hottest' })
    })
  })

  describe('fetchMyStats', () => {
    it('should fetch my stats successfully', async () => {
      // Arrange
      const mockStats = {
        totalBooklists: 10,
        totalBooks: 100,
        totalLikes: 50,
        created: 8,
        favorited: 2,
      }
      vi.mocked(getMyBookListStats).mockImplementation(mockSuccessApiCall(mockStats) as any)
      const store = useBooklistStore()

      // Act
      await store.fetchMyStats()

      // Assert
      expect(store.myStats).toEqual(mockStats)
      expect(getMyBookListStats).toHaveBeenCalledWith()
    })
  })

  describe('fetchPopularTags', () => {
    it('should fetch popular tags successfully', async () => {
      // Arrange
      const mockTags = [
        { tag: '玄幻', count: 100 },
        { tag: '仙侠', count: 80 },
      ]
      vi.mocked(getPopularTags).mockImplementation(mockSuccessApiCall(mockTags))
      const store = useBooklistStore()

      // Act
      await store.fetchPopularTags()

      // Assert
      expect(store.popularTags).toEqual(['玄幻', '仙侠'])
      expect(getPopularTags).toHaveBeenCalledWith(20)
    })
  })

  describe('createBooklist', () => {
    it('should create booklist successfully', async () => {
      // Arrange
      const newBooklist = {
        title: '新书单',
        description: '这是一个新书单',
        isPublic: true,
        tags: ['玄幻'],
      }
      const mockBooklist = createMockBooklist(newBooklist)
      vi.mocked(createBookList).mockImplementation(mockSuccessApiCall(mockBooklist))
      const store = useBooklistStore()

      // Act
      const result = await store.createBooklist(newBooklist)

      // Assert
      expect(result).toEqual(mockBooklist)
      expect(store.loading).toBe(false)
      expect(createBookList).toHaveBeenCalledWith(newBooklist)
    })

    it('should handle create booklist error', async () => {
      // Arrange
      const newBooklist = {
        title: '新书单',
        description: '这是一个新书单',
        isPublic: true,
      }
      const error = new Error('Create failed')
      vi.mocked(createBookList).mockImplementation(mockErrorApiCall(error.message))
      const store = useBooklistStore()

      // Act & Assert
      await expect(store.createBooklist(newBooklist)).rejects.toThrow('Create failed')
      expect(store.loading).toBe(false)
    })
  })

  describe('updateBooklist', () => {
    it('should update booklist successfully', async () => {
      // Arrange
      const booklistId = 'booklist_123'
      const updateData = {
        title: '更新后的标题',
      }
      const updatedBooklist = createMockBooklist(updateData)
      vi.mocked(updateBookList).mockImplementation(mockSuccessApiCall(updatedBooklist))
      const store = useBooklistStore()

      // Act
      const result = await store.updateBooklist(booklistId, updateData)

      // Assert
      expect(result).toEqual(updatedBooklist)
      expect(store.loading).toBe(false)
      expect(updateBookList).toHaveBeenCalledWith(booklistId, updateData)
    })
  })

  describe('deleteBooklist', () => {
    it('should delete booklist successfully', async () => {
      // Arrange
      const booklistId = 'booklist_123'
      const mockBooklists = createMockBooklists(3)
      const mockResponse = { success: true }
      vi.mocked(deleteBookList).mockImplementation(mockSuccessApiCall(mockResponse))
      const store = useBooklistStore()
      store.booklists = mockBooklists
      store.myBooklists = mockBooklists

      // Act
      const result = await store.deleteBooklist(booklistId)

      // Assert
      expect(result).toBe(true)
      expect(store.booklists).not.toContainEqual(expect.objectContaining({ id: booklistId }))
      expect(store.myBooklists).not.toContainEqual(expect.objectContaining({ id: booklistId }))
      expect(deleteBookList).toHaveBeenCalledWith(booklistId)
    })
  })

  describe('favoriteBooklist', () => {
    it('should favorite booklist successfully', async () => {
      // Arrange
      const booklistId = 'booklist_123'
      const mockBooklist = createMockBooklist({
        id: booklistId,
        isLiked: false,
        likeCount: 10,
      })
      const mockResponse = { success: true }
      vi.mocked(favoriteBookList).mockImplementation(mockSuccessApiCall(mockResponse))
      const store = useBooklistStore()
      store.booklists = [mockBooklist]

      // Act
      const result = await store.favoriteBooklist(booklistId)

      // Assert
      expect(result).toBe(true)
      expect(store.booklists[0].isLiked).toBe(true)
      expect(store.booklists[0].likeCount).toBe(11)
      expect(favoriteBookList).toHaveBeenCalledWith(booklistId)
    })
  })

  describe('unfavoriteBooklist', () => {
    it('should unfavorite booklist successfully', async () => {
      // Arrange
      const booklistId = 'booklist_123'
      const mockBooklist = createMockBooklist({
        id: booklistId,
        isLiked: true,
        likeCount: 10,
      })
      const mockResponse = { success: true }
      vi.mocked(unfavoriteBookList).mockImplementation(mockSuccessApiCall(mockResponse))
      const store = useBooklistStore()
      store.booklists = [mockBooklist]

      // Act
      const result = await store.unfavoriteBooklist(booklistId)

      // Assert
      expect(result).toBe(true)
      expect(store.booklists[0].isLiked).toBe(false)
      expect(store.booklists[0].likeCount).toBe(9)
      expect(unfavoriteBookList).toHaveBeenCalledWith(booklistId)
    })
  })

  describe('addBookToList', () => {
    it('should add book to list successfully', async () => {
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
      vi.mocked(addBookToList).mockImplementation(mockSuccessApiCall(mockResponse))
      const store = useBooklistStore()

      // Act
      const result = await store.addBookToList(listId, bookId, note)

      // Assert
      expect(result).toEqual(mockResponse)
      expect(addBookToList).toHaveBeenCalledWith(listId, {
        bookId,
        note,
      })
    })
  })

  describe('removeBookFromList', () => {
    it('should remove book from list successfully', async () => {
      // Arrange
      const listId = 'booklist_123'
      const bookId = 'book_456'
      const mockBooklist = createMockBooklist({
        id: listId,
        books: [
          {
            bookId,
            title: '书籍1',
            author: '作者1',
            addedAt: new Date().toISOString(),
          },
          {
            bookId: 'book_789',
            title: '书籍2',
            author: '作者2',
            addedAt: new Date().toISOString(),
          },
        ],
        bookCount: 2,
      })
      const mockResponse = { success: true }
      vi.mocked(removeBookFromList).mockImplementation(mockSuccessApiCall(mockResponse))
      const store = useBooklistStore()
      store.currentBooklist = mockBooklist

      // Act
      const result = await store.removeBookFromList(listId, bookId)

      // Assert
      expect(result).toBe(true)
      expect(store.currentBooklist?.books).toHaveLength(1)
      expect(store.currentBooklist?.books[0].bookId).toBe('book_789')
      expect(store.currentBooklist?.bookCount).toBe(1)
      expect(removeBookFromList).toHaveBeenCalledWith(listId, bookId)
    })
  })
})
