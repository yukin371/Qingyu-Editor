/**
 * Reading Stats Store测试
 */

import { createPinia, setActivePinia } from 'pinia'
import { useReadingStatsStore } from '../reading-stats.store'
import * as readingStatsApi from '../../api'

// Mock整个API模块
vi.mock('../../api/index', () => ({
  getReadingStats: vi.fn(),
  getReadingReport: vi.fn(),
  getWeeklyReport: vi.fn(),
  getMonthlyReport: vi.fn(),
  getYearlyReport: vi.fn(),
  getReadingRanking: vi.fn(),
  getReadingHistory: vi.fn(),
  syncReadingProgress: vi.fn(),
}))

describe('useReadingStatsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should initialize with correct state', () => {
      const store = useReadingStatsStore()
      expect(store.stats).toBeNull()
      expect(store.report).toBeNull()
      expect(store.history).toEqual([])
      expect(store.ranking).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should return 0 for totalReadingTime when stats is null', () => {
      const store = useReadingStatsStore()
      expect(store.totalReadingTime).toBe(0)
    })

    it('should return 0 for totalBooks when stats is null', () => {
      const store = useReadingStatsStore()
      expect(store.totalBooks).toBe(0)
    })
  })

  describe('totalReadingTime getter', () => {
    it('should return total reading time when stats exists', () => {
      const store = useReadingStatsStore()
      store.stats = {
        userId: 'user1',
        period: 'weekly',
        totalReadingTime: 3600,
        totalBooks: 10,
        totalChapters: 20,
        totalWords: 10000,
        averageDaily: 500,
        longestStreak: 5,
        currentStreak: 3,
        dailyTrend: [],
        weeklyTrend: [],
        monthlyTrend: [],
      } as any
      expect(store.totalReadingTime).toBe(3600)
    })

    it('should return 0 when stats is null', () => {
      const store = useReadingStatsStore()
      store.stats = null
      expect(store.totalReadingTime).toBe(0)
    })
  })

  describe('totalBooks getter', () => {
    it('should return total books when stats exists', () => {
      const store = useReadingStatsStore()
      store.stats = {
        userId: 'user1',
        period: 'weekly',
        totalReadingTime: 3600,
        totalBooks: 10,
        totalChapters: 20,
        totalWords: 10000,
        averageDaily: 500,
        longestStreak: 5,
        currentStreak: 3,
        dailyTrend: [],
        weeklyTrend: [],
        monthlyTrend: [],
      } as any
      expect(store.totalBooks).toBe(10)
    })

    it('should return 0 when stats is null', () => {
      const store = useReadingStatsStore()
      store.stats = null
      expect(store.totalBooks).toBe(0)
    })
  })

  describe('fetchStats', () => {
    it('should fetch stats successfully', async () => {
      const mockStats = {
        userId: 'user1',
        period: 'weekly',
        totalReadingTime: 3600,
        totalBooks: 10,
        totalChapters: 20,
        totalWords: 10000,
        averageDaily: 500,
        longestStreak: 5,
        currentStreak: 3,
        dailyTrend: [],
        weeklyTrend: [],
        monthlyTrend: [],
      }
      vi.mocked(readingStatsApi.getReadingStats).mockResolvedValue(mockStats as any)
      const store = useReadingStatsStore()

      await store.fetchStats('weekly')

      expect(store.stats).toEqual(mockStats)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
      expect(readingStatsApi.getReadingStats).toHaveBeenCalledWith('weekly')
    })

    it('should use weekly period as default', async () => {
      vi.mocked(readingStatsApi.getReadingStats).mockResolvedValue({} as any)
      const store = useReadingStatsStore()

      await store.fetchStats()

      expect(readingStatsApi.getReadingStats).toHaveBeenCalledWith('weekly')
    })

    it('should handle error when API call fails', async () => {
      const mockError = new Error('Network error')
      vi.mocked(readingStatsApi.getReadingStats).mockRejectedValue(mockError)
      const store = useReadingStatsStore()

      await store.fetchStats()

      expect(store.loading).toBe(false)
      expect(store.error).toEqual(mockError)
      expect(store.stats).toBeNull()
    })

    it('should not update stats when code is not 0', async () => {
      const mockError = new Error('API error: code is not 0')
      vi.mocked(readingStatsApi.getReadingStats).mockRejectedValue(mockError)
      const store = useReadingStatsStore()

      await store.fetchStats()

      expect(store.stats).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.error).toEqual(mockError)
    })
  })

  describe('fetchReport', () => {
    it('should fetch report successfully', async () => {
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
      vi.mocked(readingStatsApi.getReadingReport).mockResolvedValue(mockReport as any)
      const store = useReadingStatsStore()

      await store.fetchReport('weekly')

      expect(store.report).toEqual(mockReport)
      expect(store.loading).toBe(false)
      expect(readingStatsApi.getReadingReport).toHaveBeenCalledWith('weekly')
    })

    it('should use weekly period as default', async () => {
      vi.mocked(readingStatsApi.getReadingReport).mockResolvedValue({} as any)
      const store = useReadingStatsStore()

      await store.fetchReport()

      expect(readingStatsApi.getReadingReport).toHaveBeenCalledWith('weekly')
    })

    it('should handle error when API call fails', async () => {
      const mockError = new Error('Network error')
      vi.mocked(readingStatsApi.getReadingReport).mockRejectedValue(mockError)
      const store = useReadingStatsStore()

      await store.fetchReport()

      expect(store.loading).toBe(false)
      expect(store.report).toBeNull()
    })

    it('should not update report when API call fails', async () => {
      const mockError = new Error('API error: code is not 0')
      vi.mocked(readingStatsApi.getReadingReport).mockRejectedValue(mockError)
      const store = useReadingStatsStore()

      await store.fetchReport()

      expect(store.report).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.error).toEqual(mockError)
    })
  })

  describe('fetchWeeklyReport', () => {
    it('should fetch weekly report successfully', async () => {
      const mockReport = {
        period: 'weekly',
        summary: {},
      }
      vi.mocked(readingStatsApi.getReadingReport).mockResolvedValue(mockReport as any)
      const store = useReadingStatsStore()

      await store.fetchWeeklyReport()

      expect(store.report).toEqual(mockReport)
      expect(store.loading).toBe(false)
      expect(readingStatsApi.getReadingReport).toHaveBeenCalledWith('weekly')
    })

    it('should handle error when API call fails', async () => {
      const mockError = new Error('Network error')
      vi.mocked(readingStatsApi.getReadingReport).mockRejectedValue(mockError)
      const store = useReadingStatsStore()

      await store.fetchWeeklyReport()

      expect(store.loading).toBe(false)
      expect(store.report).toBeNull()
    })
  })

  describe('fetchMonthlyReport', () => {
    it('should fetch monthly report successfully', async () => {
      const mockReport = {
        period: 'monthly',
        summary: {},
      }
      vi.mocked(readingStatsApi.getReadingReport).mockResolvedValue(mockReport as any)
      const store = useReadingStatsStore()

      await store.fetchMonthlyReport()

      expect(store.report).toEqual(mockReport)
      expect(store.loading).toBe(false)
      expect(readingStatsApi.getReadingReport).toHaveBeenCalledWith('monthly')
    })

    it('should handle error when API call fails', async () => {
      const mockError = new Error('Network error')
      vi.mocked(readingStatsApi.getReadingReport).mockRejectedValue(mockError)
      const store = useReadingStatsStore()

      await store.fetchMonthlyReport()

      expect(store.loading).toBe(false)
      expect(store.report).toBeNull()
    })
  })

  describe('fetchYearlyReport', () => {
    it('should fetch yearly report successfully', async () => {
      const mockReport = {
        period: 'yearly',
        summary: {},
      }
      vi.mocked(readingStatsApi.getReadingReport).mockResolvedValue(mockReport as any)
      const store = useReadingStatsStore()

      await store.fetchYearlyReport()

      expect(store.report).toEqual(mockReport)
      expect(store.loading).toBe(false)
      expect(readingStatsApi.getReadingReport).toHaveBeenCalledWith('yearly')
    })

    it('should handle error when API call fails', async () => {
      const mockError = new Error('Network error')
      vi.mocked(readingStatsApi.getReadingReport).mockRejectedValue(mockError)
      const store = useReadingStatsStore()

      await store.fetchYearlyReport()

      expect(store.loading).toBe(false)
      expect(store.report).toBeNull()
    })
  })

  describe('fetchRanking', () => {
    it('should fetch ranking successfully', async () => {
      const mockRanking = [
        {
          userId: '1',
          username: 'user1',
          nickname: 'User One',
          avatar: 'https://example.com/avatar1.jpg',
          readingTime: 7200,
          rank: 1,
        },
      ]
      vi.mocked(readingStatsApi.getReadingRanking).mockResolvedValue(mockRanking)
      const store = useReadingStatsStore()

      await store.fetchRanking('daily')

      expect(store.ranking).toEqual(mockRanking)
      expect(readingStatsApi.getReadingRanking).toHaveBeenCalledWith({ type: 'daily' })
    })

    it('should use weekly type as default', async () => {
      vi.mocked(readingStatsApi.getReadingRanking).mockResolvedValue({
        data: {
          code: 0,
          message: 'success',
          data: [],
        },
      } as any)
      const store = useReadingStatsStore()

      await store.fetchRanking()

      expect(readingStatsApi.getReadingRanking).toHaveBeenCalledWith({ type: 'weekly' })
    })

    it('should handle error when API call fails', async () => {
      const mockError = new Error('Network error')
      vi.mocked(readingStatsApi.getReadingRanking).mockRejectedValue(mockError)
      const store = useReadingStatsStore()

      await store.fetchRanking()

      expect(store.ranking).toEqual([])
    })

    it('should not update ranking when API call fails', async () => {
      const mockError = new Error('API error: code is not 0')
      vi.mocked(readingStatsApi.getReadingRanking).mockRejectedValue(mockError)
      const store = useReadingStatsStore()

      await store.fetchRanking()

      expect(store.ranking).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toEqual(mockError)
    })
  })

  describe('fetchHistory', () => {
    it('should fetch history successfully', async () => {
      const mockHistory = [
        {
          date: '2024-01-01',
          bookId: '1',
          bookTitle: 'Book 1',
          bookCover: 'https://example.com/cover.jpg',
          chapterTitle: 'Chapter 1',
          readingTime: 1200,
        },
      ]
      vi.mocked(readingStatsApi.getReadingHistory).mockResolvedValue({
        list: mockHistory,
        total: 1,
      })
      const store = useReadingStatsStore()

      await store.fetchHistory()

      expect(store.history).toEqual(mockHistory)
      expect(store.loading).toBe(false)
      expect(readingStatsApi.getReadingHistory).toHaveBeenCalled()
    })

    it('should handle error when API call fails', async () => {
      const mockError = new Error('Network error')
      vi.mocked(readingStatsApi.getReadingHistory).mockRejectedValue(mockError)
      const store = useReadingStatsStore()

      await store.fetchHistory()

      expect(store.loading).toBe(false)
      expect(store.history).toEqual([])
    })

    it('should not update history when API call fails', async () => {
      const mockError = new Error('API error: code is not 0')
      vi.mocked(readingStatsApi.getReadingHistory).mockRejectedValue(mockError)
      const store = useReadingStatsStore()

      await store.fetchHistory()

      expect(store.history).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toEqual(mockError)
    })
  })
})
