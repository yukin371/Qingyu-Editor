/**
 * Discovery API测试
 */

import * as discoveryApi from '../index'
import { http } from '@/core/http'

// Mock http模块
vi.mock('@/core/http', () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

describe('discoveryApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getRecommendations', () => {
    it('should return recommendations when API call succeeds', async () => {
      // Arrange
      const mockRecommendations = [
        {
          id: '1',
          type: 'book' as const,
          slot: 'banner' as const,
          title: '推荐书籍',
          description: '这是一本好书',
          cover: 'https://example.com/cover.jpg',
          link: '/books/1',
          priority: 1,
          startTime: '2024-01-01',
          endTime: '2024-12-31',
        },
      ]
      const mockResponse = {
        data: {
          code: 0,
          message: 'success',
          data: mockRecommendations,
        },
      }
      vi.mocked(http.get).mockResolvedValue(mockResponse)

      // Act
      const result = await discoveryApi.getRecommendations('banner')

      // Assert
      expect(result).toEqual(mockResponse)
      expect(http.get).toHaveBeenCalledWith('/api/v1/discovery/recommendations', {
        params: { slot: 'banner' },
      })
    })

    it('should call API without slot parameter when slot is not provided', async () => {
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
      await discoveryApi.getRecommendations()

      // Assert
      expect(http.get).toHaveBeenCalledWith('/api/v1/discovery/recommendations', {
        params: {},
      })
    })

    it('should throw error when API call fails', async () => {
      // Arrange
      const mockError = new Error('Network error')
      vi.mocked(http.get).mockRejectedValue(mockError)

      // Act & Assert
      await expect(discoveryApi.getRecommendations()).rejects.toThrow('Network error')
    })
  })

  describe('getPersonalizedRecommendations', () => {
    it('should return personalized recommendations when API call succeeds', async () => {
      // Arrange
      const mockData = {
        books: {
          forYou: [],
          similar: [],
          trending: [],
        },
        booklists: {
          recommended: [],
          popular: [],
        },
        authors: {
          suggested: [],
        },
      }
      const mockResponse = {
        data: {
          code: 0,
          message: 'success',
          data: mockData,
        },
      }
      vi.mocked(http.get).mockResolvedValue(mockResponse)

      // Act
      const result = await discoveryApi.getPersonalizedRecommendations()

      // Assert
      expect(result).toEqual(mockResponse)
      expect(http.get).toHaveBeenCalledWith('/api/v1/discovery/personalized')
    })

    it('should throw error when API call fails', async () => {
      // Arrange
      const mockError = new Error('Network error')
      vi.mocked(http.get).mockRejectedValue(mockError)

      // Act & Assert
      await expect(discoveryApi.getPersonalizedRecommendations()).rejects.toThrow('Network error')
    })
  })

  describe('getNewReleases', () => {
    it('should return new releases when API call succeeds', async () => {
      // Arrange
      const mockData = {
        list: [{ id: '1', title: '新书1' }],
        total: 1,
      }
      const mockResponse = {
        data: {
          code: 0,
          message: 'success',
          data: mockData,
        },
      }
      vi.mocked(http.get).mockResolvedValue(mockResponse)

      // Act
      const result = await discoveryApi.getNewReleases({ page: 1, size: 10 })

      // Assert
      expect(result).toEqual(mockResponse)
      expect(http.get).toHaveBeenCalledWith('/api/v1/discovery/new-releases', {
        params: { page: 1, size: 10 },
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
      await discoveryApi.getNewReleases()

      // Assert
      expect(http.get).toHaveBeenCalledWith('/api/v1/discovery/new-releases', {
        params: undefined,
      })
    })

    it('should throw error when API call fails', async () => {
      // Arrange
      const mockError = new Error('Network error')
      vi.mocked(http.get).mockRejectedValue(mockError)

      // Act & Assert
      await expect(discoveryApi.getNewReleases()).rejects.toThrow('Network error')
    })
  })

  describe('getEditorsPick', () => {
    it('should return editors pick when API call succeeds', async () => {
      // Arrange
      const mockData = {
        list: [{ id: '1', title: '编辑推荐1' }],
        total: 1,
      }
      const mockResponse = {
        data: {
          code: 0,
          message: 'success',
          data: mockData,
        },
      }
      vi.mocked(http.get).mockResolvedValue(mockResponse)

      // Act
      const result = await discoveryApi.getEditorsPick({ page: 1, size: 10, tag: 'fiction' })

      // Assert
      expect(result).toEqual(mockResponse)
      expect(http.get).toHaveBeenCalledWith('/api/v1/discovery/editors-pick', {
        params: { page: 1, size: 10, tag: 'fiction' },
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
      await discoveryApi.getEditorsPick()

      // Assert
      expect(http.get).toHaveBeenCalledWith('/api/v1/discovery/editors-pick', {
        params: undefined,
      })
    })

    it('should throw error when API call fails', async () => {
      // Arrange
      const mockError = new Error('Network error')
      vi.mocked(http.get).mockRejectedValue(mockError)

      // Act & Assert
      await expect(discoveryApi.getEditorsPick()).rejects.toThrow('Network error')
    })
  })

  describe('getTrending', () => {
    it('should return trending items when API call succeeds', async () => {
      // Arrange
      const mockData = [{ id: '1', title: '热门书籍1' }]
      const mockResponse = {
        data: {
          code: 0,
          message: 'success',
          data: mockData,
        },
      }
      vi.mocked(http.get).mockResolvedValue(mockResponse)

      // Act
      const result = await discoveryApi.getTrending({ type: 'daily', limit: 10 })

      // Assert
      expect(result).toEqual(mockResponse)
      expect(http.get).toHaveBeenCalledWith('/api/v1/discovery/trending', {
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
      await discoveryApi.getTrending()

      // Assert
      expect(http.get).toHaveBeenCalledWith('/api/v1/discovery/trending', {
        params: undefined,
      })
    })

    it('should throw error when API call fails', async () => {
      // Arrange
      const mockError = new Error('Network error')
      vi.mocked(http.get).mockRejectedValue(mockError)

      // Act & Assert
      await expect(discoveryApi.getTrending()).rejects.toThrow('Network error')
    })
  })

  describe('getTopics', () => {
    it('should return topics when API call succeeds', async () => {
      // Arrange
      const mockData = {
        list: [{ id: '1', title: '话题1' }],
        total: 1,
      }
      const mockResponse = {
        data: {
          code: 0,
          message: 'success',
          data: mockData,
        },
      }
      vi.mocked(http.get).mockResolvedValue(mockResponse)

      // Act
      const result = await discoveryApi.getTopics({ page: 1, size: 10 })

      // Assert
      expect(result).toEqual(mockResponse)
      expect(http.get).toHaveBeenCalledWith('/api/v1/discovery/topics', {
        params: { page: 1, size: 10 },
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
      await discoveryApi.getTopics()

      // Assert
      expect(http.get).toHaveBeenCalledWith('/api/v1/discovery/topics', {
        params: undefined,
      })
    })

    it('should throw error when API call fails', async () => {
      // Arrange
      const mockError = new Error('Network error')
      vi.mocked(http.get).mockRejectedValue(mockError)

      // Act & Assert
      await expect(discoveryApi.getTopics()).rejects.toThrow('Network error')
    })
  })

  describe('updateRecommendationConfig', () => {
    it('should update recommendation config when API call succeeds', async () => {
      // Arrange
      const mockConfig = {
        userId: 'user1',
        preferences: {
          favoriteGenres: ['fiction'],
          favoriteAuthors: [],
          favoriteTags: [],
        },
        history: {
          viewedBooks: [],
          viewedLists: [],
        },
      }
      const mockResponse = {
        data: {
          code: 0,
          message: 'success',
          data: mockConfig,
        },
      }
      vi.mocked(http.put).mockResolvedValue(mockResponse)

      // Act
      const result = await discoveryApi.updateRecommendationConfig(mockConfig)

      // Assert
      expect(result).toEqual(mockResponse)
      expect(http.put).toHaveBeenCalledWith('/api/v1/discovery/preferences', mockConfig)
    })

    it('should throw error when API call fails', async () => {
      // Arrange
      const mockError = new Error('Network error')
      vi.mocked(http.put).mockRejectedValue(mockError)

      // Act & Assert
      await expect(
        discoveryApi.updateRecommendationConfig({
          userId: 'user1',
          preferences: {
            favoriteGenres: [],
            favoriteAuthors: [],
            favoriteTags: [],
          },
          history: {
            viewedBooks: [],
            viewedLists: [],
          },
        })
      ).rejects.toThrow('Network error')
    })
  })

  describe('trackRecommendationAction', () => {
    it('should track recommendation action when API call succeeds', async () => {
      // Arrange
      const mockTrackingData = {
        itemId: 'book1',
        itemType: 'book' as const,
        action: 'view' as const,
      }
      const mockResponse = {
        data: {
          code: 0,
          message: 'success',
        },
      }
      vi.mocked(http.post).mockResolvedValue(mockResponse)

      // Act
      const result = await discoveryApi.trackRecommendationAction(mockTrackingData)

      // Assert
      expect(result).toEqual(mockResponse)
      expect(http.post).toHaveBeenCalledWith('/api/v1/discovery/track', mockTrackingData)
    })

    it('should throw error when API call fails', async () => {
      // Arrange
      const mockError = new Error('Network error')
      vi.mocked(http.post).mockRejectedValue(mockError)

      // Act & Assert
      await expect(
        discoveryApi.trackRecommendationAction({
          itemId: 'book1',
          itemType: 'book',
          action: 'view',
        })
      ).rejects.toThrow('Network error')
    })
  })
})
