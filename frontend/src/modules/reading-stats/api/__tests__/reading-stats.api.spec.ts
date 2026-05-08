/**
 * Reading Stats API测试
 */

import * as readingStatsApi from '../index'
import { http } from '@/core/http'

// Mock http模块
vi.mock('@/core/http', () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('readingStatsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getReadingStats', () => {
    it('should return reading stats when API call succeeds', async () => {
      // Arrange
      const mockStats = {
        totalReadingTime: 3600,
        totalBooks: 10,
        dailyStats: [],
        weeklyStats: [],
        monthlyStats: [],
      }
      const mockResponse = {
        data: {
          code: 0,
          message: 'success',
          data: mockStats,
        },
      }
      vi.mocked(http.get).mockResolvedValue(mockResponse)

      // Act
      const result = await readingStatsApi.getReadingStats('weekly')

      // Assert
      expect(result).toEqual(mockResponse)
      expect(http.get).toHaveBeenCalledWith('/api/v1/reading/stats', {
        params: { period: 'weekly' },
      })
    })

    it('should call API with different period parameter', async () => {
      // Arrange
      const mockResponse = {
        data: {
          code: 0,
          message: 'success',
          data: {},
        },
      }
      vi.mocked(http.get).mockResolvedValue(mockResponse)

      // Act
      await readingStatsApi.getReadingStats('monthly')

      // Assert
      expect(http.get).toHaveBeenCalledWith('/api/v1/reading/stats', {
        params: { period: 'monthly' },
      })
    })

    it('should throw error when API call fails', async () => {
      // Arrange
      const mockError = new Error('Network error')
      vi.mocked(http.get).mockRejectedValue(mockError)

      // Act & Assert
      await expect(readingStatsApi.getReadingStats('weekly')).rejects.toThrow('Network error')
    })
  })

  describe('getReadingReport', () => {
    it('should return reading report when API call succeeds', async () => {
      // Arrange
      const mockReport = {
        period: 'weekly',
        startDate: '2024-01-01',
        endDate: '2024-01-07',
        summary: {
          totalReadingTime: 3600,
          totalBooks: 5,
          completedChapters: 20,
        },
        dailyBreakdown: [],
        topBooks: [],
      }
      const mockResponse = {
        data: {
          code: 0,
          message: 'success',
          data: mockReport,
        },
      }
      vi.mocked(http.get).mockResolvedValue(mockResponse)

      // Act
      const result = await readingStatsApi.getReadingReport('weekly')

      // Assert
      expect(result).toEqual(mockResponse)
      expect(http.get).toHaveBeenCalledWith('/api/v1/reading/report', {
        params: { period: 'weekly' },
      })
    })

    it('should call API with monthly period', async () => {
      // Arrange
      const mockResponse = {
        data: {
          code: 0,
          message: 'success',
          data: {},
        },
      }
      vi.mocked(http.get).mockResolvedValue(mockResponse)

      // Act
      await readingStatsApi.getReadingReport('monthly')

      // Assert
      expect(http.get).toHaveBeenCalledWith('/api/v1/reading/report', {
        params: { period: 'monthly' },
      })
    })

    it('should throw error when API call fails', async () => {
      // Arrange
      const mockError = new Error('Network error')
      vi.mocked(http.get).mockRejectedValue(mockError)

      // Act & Assert
      await expect(readingStatsApi.getReadingReport('weekly')).rejects.toThrow('Network error')
    })
  })

  describe('getWeeklyReport', () => {
    it('should return weekly report when API call succeeds', async () => {
      // Arrange
      const mockReport = {
        period: 'weekly',
        summary: {},
      }
      const mockResponse = {
        data: {
          code: 0,
          message: 'success',
          data: mockReport,
        },
      }
      vi.mocked(http.get).mockResolvedValue(mockResponse)

      // Act
      const result = await readingStatsApi.getWeeklyReport()

      // Assert
      expect(result).toEqual(mockResponse)
      expect(http.get).toHaveBeenCalledWith('/api/v1/reading/report', {
        params: { period: 'weekly' },
      })
    })

    it('should throw error when API call fails', async () => {
      // Arrange
      const mockError = new Error('Network error')
      vi.mocked(http.get).mockRejectedValue(mockError)

      // Act & Assert
      await expect(readingStatsApi.getWeeklyReport()).rejects.toThrow('Network error')
    })
  })

  describe('getMonthlyReport', () => {
    it('should return monthly report when API call succeeds', async () => {
      // Arrange
      const mockReport = {
        period: 'monthly',
        summary: {},
      }
      const mockResponse = {
        data: {
          code: 0,
          message: 'success',
          data: mockReport,
        },
      }
      vi.mocked(http.get).mockResolvedValue(mockResponse)

      // Act
      const result = await readingStatsApi.getMonthlyReport()

      // Assert
      expect(result).toEqual(mockResponse)
      expect(http.get).toHaveBeenCalledWith('/api/v1/reading/report', {
        params: { period: 'monthly' },
      })
    })

    it('should throw error when API call fails', async () => {
      // Arrange
      const mockError = new Error('Network error')
      vi.mocked(http.get).mockRejectedValue(mockError)

      // Act & Assert
      await expect(readingStatsApi.getMonthlyReport()).rejects.toThrow('Network error')
    })
  })

  describe('getYearlyReport', () => {
    it('should return yearly report when API call succeeds', async () => {
      // Arrange
      const mockReport = {
        period: 'yearly',
        summary: {},
      }
      const mockResponse = {
        data: {
          code: 0,
          message: 'success',
          data: mockReport,
        },
      }
      vi.mocked(http.get).mockResolvedValue(mockResponse)

      // Act
      const result = await readingStatsApi.getYearlyReport()

      // Assert
      expect(result).toEqual(mockResponse)
      expect(http.get).toHaveBeenCalledWith('/api/v1/reading/report', {
        params: { period: 'yearly' },
      })
    })

    it('should throw error when API call fails', async () => {
      // Arrange
      const mockError = new Error('Network error')
      vi.mocked(http.get).mockRejectedValue(mockError)

      // Act & Assert
      await expect(readingStatsApi.getYearlyReport()).rejects.toThrow('Network error')
    })
  })

  describe('getReadingRanking', () => {
    it('should return reading ranking when API call succeeds', async () => {
      // Arrange
      const mockRanking = [
        {
          userId: '1',
          username: 'user1',
          nickname: 'User One',
          avatar: 'https://example.com/avatar1.jpg',
          readingTime: 7200,
          rank: 1,
        },
        {
          userId: '2',
          username: 'user2',
          nickname: 'User Two',
          avatar: 'https://example.com/avatar2.jpg',
          readingTime: 3600,
          rank: 2,
        },
      ]
      const mockResponse = {
        data: {
          code: 0,
          message: 'success',
          data: mockRanking,
        },
      }
      vi.mocked(http.get).mockResolvedValue(mockResponse)

      // Act
      const result = await readingStatsApi.getReadingRanking({ type: 'daily', limit: 10 })

      // Assert
      expect(result).toEqual(mockResponse)
      expect(http.get).toHaveBeenCalledWith('/api/v1/reading/ranking', {
        params: { type: 'daily', limit: 10 },
      })
    })

    it('should call API without params when params are not provided', async () => {
      // Arrange
      const mockResponse = {
        data: {
          code: 0,
          message: 'success',
          data: [],
        },
      }
      vi.mocked(http.get).mockResolvedValue(mockResponse)

      // Act
      await readingStatsApi.getReadingRanking()

      // Assert
      expect(http.get).toHaveBeenCalledWith('/api/v1/reading/ranking', {
        params: undefined,
      })
    })

    it('should throw error when API call fails', async () => {
      // Arrange
      const mockError = new Error('Network error')
      vi.mocked(http.get).mockRejectedValue(mockError)

      // Act & Assert
      await expect(readingStatsApi.getReadingRanking()).rejects.toThrow('Network error')
    })
  })

  describe('getReadingHistory', () => {
    it('should return reading history when API call succeeds', async () => {
      // Arrange
      const mockHistory = {
        list: [
          {
            date: '2024-01-01',
            bookId: '1',
            bookTitle: 'Book 1',
            bookCover: 'https://example.com/cover.jpg',
            chapterTitle: 'Chapter 1',
            readingTime: 1200,
          },
        ],
        total: 1,
      }
      const mockResponse = {
        data: {
          code: 0,
          message: 'success',
          data: mockHistory,
        },
      }
      vi.mocked(http.get).mockResolvedValue(mockResponse)

      // Act
      const result = await readingStatsApi.getReadingHistory({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        page: 1,
        size: 10,
      })

      // Assert
      expect(result).toEqual(mockResponse)
      expect(http.get).toHaveBeenCalledWith('/api/v1/reading/history', {
        params: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          page: 1,
          size: 10,
        },
      })
    })

    it('should call API without params when params are not provided', async () => {
      // Arrange
      const mockResponse = {
        data: {
          code: 0,
          message: 'success',
          data: { list: [], total: 0 },
        },
      }
      vi.mocked(http.get).mockResolvedValue(mockResponse)

      // Act
      await readingStatsApi.getReadingHistory()

      // Assert
      expect(http.get).toHaveBeenCalledWith('/api/v1/reading/history', {
        params: undefined,
      })
    })

    it('should throw error when API call fails', async () => {
      // Arrange
      const mockError = new Error('Network error')
      vi.mocked(http.get).mockRejectedValue(mockError)

      // Act & Assert
      await expect(readingStatsApi.getReadingHistory()).rejects.toThrow('Network error')
    })
  })

  describe('syncReadingProgress', () => {
    it('should sync reading progress when API call succeeds', async () => {
      // Arrange
      const mockProgress = {
        bookId: 'book1',
        chapterId: 'chapter1',
        progress: 50,
        readingTime: 1800,
      }
      const mockResponse = {
        data: {
          code: 0,
          message: 'success',
        },
      }
      vi.mocked(http.post).mockResolvedValue(mockResponse)

      // Act
      const result = await readingStatsApi.syncReadingProgress(mockProgress)

      // Assert
      expect(result).toEqual(mockResponse)
      expect(http.post).toHaveBeenCalledWith('/api/v1/reading/sync', mockProgress)
    })

    it('should throw error when API call fails', async () => {
      // Arrange
      const mockError = new Error('Network error')
      vi.mocked(http.post).mockRejectedValue(mockError)

      // Act & Assert
      await expect(
        readingStatsApi.syncReadingProgress({
          bookId: 'book1',
          chapterId: 'chapter1',
          progress: 50,
          readingTime: 1800,
        })
      ).rejects.toThrow('Network error')
    })
  })
})
