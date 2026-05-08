/**
 * Discovery Store测试
 */

import { createPinia, setActivePinia } from 'pinia'
import { useDiscoveryStore } from '../../stores/discovery.store'
import * as discoveryApi from '../../api'

// Mock整个API模块
vi.mock('../../api/index', () => ({
  getRecommendations: vi.fn(),
  getPersonalizedRecommendations: vi.fn(),
  getNewReleases: vi.fn(),
  getEditorsPick: vi.fn(),
  getTrending: vi.fn(),
  getTopics: vi.fn(),
}))

describe('useDiscoveryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should initialize with correct state', () => {
      // Act
      const store = useDiscoveryStore()

      // Assert
      expect(store.recommendations).toEqual([])
      expect(store.personalized).toBeNull()
      expect(store.newReleases).toEqual([])
      expect(store.editorsPick).toEqual([])
      expect(store.trending).toEqual([])
      expect(store.topics).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should return false for hasRecommendations when no recommendations', () => {
      // Arrange
      const store = useDiscoveryStore()

      // Assert
      expect(store.hasRecommendations).toBe(false)
    })
  })

  describe('hasRecommendations getter', () => {
    it('should return true when recommendations exist', () => {
      // Arrange
      const store = useDiscoveryStore()
      store.recommendations = [
        {
          id: '1',
          type: 'book',
          slot: 'banner',
          title: '推荐',
          description: '描述',
          cover: '',
          link: '',
          priority: 1,
          startTime: '',
          endTime: '',
        },
      ]

      // Assert
      expect(store.hasRecommendations).toBe(true)
    })

    it('should return false when recommendations is empty', () => {
      // Arrange
      const store = useDiscoveryStore()
      store.recommendations = []

      // Assert
      expect(store.hasRecommendations).toBe(false)
    })
  })

  describe('fetchRecommendations', () => {
    it('should fetch recommendations successfully', async () => {
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
      vi.mocked(discoveryApi.getRecommendations).mockResolvedValue(mockRecommendations)
      const store = useDiscoveryStore()

      // Act
      await store.fetchRecommendations()

      // Assert
      expect(store.recommendations).toEqual(mockRecommendations)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
      expect(discoveryApi.getRecommendations).toHaveBeenCalledTimes(1)
    })

    it('should handle error when API call fails', async () => {
      // Arrange
      const mockError = new Error('Network error')
      vi.mocked(discoveryApi.getRecommendations).mockRejectedValue(mockError)
      const store = useDiscoveryStore()

      // Act
      await store.fetchRecommendations()

      // Assert
      expect(store.loading).toBe(false)
      expect(store.error).toEqual(mockError)
      expect(store.recommendations).toEqual([])
    })

    it('should not update recommendations when API call fails', async () => {
      // Arrange
      const mockError = new Error('API error')
      vi.mocked(discoveryApi.getRecommendations).mockRejectedValue(mockError)
      const store = useDiscoveryStore()

      // Act
      await store.fetchRecommendations()

      // Assert
      expect(store.recommendations).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toEqual(mockError)
    })
  })

  describe('fetchPersonalized', () => {
    it('should fetch personalized recommendations successfully', async () => {
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
      vi.mocked(discoveryApi.getPersonalizedRecommendations).mockResolvedValue(mockData)
      const store = useDiscoveryStore()

      // Act
      await store.fetchPersonalized()

      // Assert
      expect(store.personalized).toEqual(mockData)
      expect(store.loading).toBe(false)
      expect(discoveryApi.getPersonalizedRecommendations).toHaveBeenCalledTimes(1)
    })

    it('should handle error when API call fails', async () => {
      // Arrange
      const mockError = new Error('Network error')
      vi.mocked(discoveryApi.getPersonalizedRecommendations).mockRejectedValue(mockError)
      const store = useDiscoveryStore()

      // Act
      await store.fetchPersonalized()

      // Assert
      expect(store.loading).toBe(false)
      expect(store.personalized).toBeNull()
    })
  })

  describe('fetchNewReleases', () => {
    it('should fetch new releases successfully', async () => {
      // Arrange
      const mockData = [
        { id: '1', title: '新书1' },
        { id: '2', title: '新书2' },
      ]
      vi.mocked(discoveryApi.getNewReleases).mockResolvedValue({
        list: mockData,
        total: 2,
      })
      const store = useDiscoveryStore()

      // Act
      await store.fetchNewReleases()

      // Assert
      expect(store.newReleases).toEqual(mockData)
      expect(store.loading).toBe(false)
      expect(discoveryApi.getNewReleases).toHaveBeenCalledTimes(1)
    })

    it('should handle error when API call fails', async () => {
      // Arrange
      const mockError = new Error('Network error')
      vi.mocked(discoveryApi.getNewReleases).mockRejectedValue(mockError)
      const store = useDiscoveryStore()

      // Act
      await store.fetchNewReleases()

      // Assert
      expect(store.loading).toBe(false)
      expect(store.newReleases).toEqual([])
    })
  })

  describe('fetchEditorsPick', () => {
    it('should fetch editors pick successfully', async () => {
      // Arrange
      const mockData = [
        { id: '1', title: '编辑推荐1' },
        { id: '2', title: '编辑推荐2' },
      ]
      vi.mocked(discoveryApi.getEditorsPick).mockResolvedValue({
        list: mockData,
        total: 2,
      })
      const store = useDiscoveryStore()

      // Act
      await store.fetchEditorsPick()

      // Assert
      expect(store.editorsPick).toEqual(mockData)
      expect(store.loading).toBe(false)
      expect(discoveryApi.getEditorsPick).toHaveBeenCalledTimes(1)
    })

    it('should handle error when API call fails', async () => {
      // Arrange
      const mockError = new Error('Network error')
      vi.mocked(discoveryApi.getEditorsPick).mockRejectedValue(mockError)
      const store = useDiscoveryStore()

      // Act
      await store.fetchEditorsPick()

      // Assert
      expect(store.loading).toBe(false)
      expect(store.editorsPick).toEqual([])
    })
  })

  describe('fetchTrending', () => {
    it('should fetch trending successfully with daily type', async () => {
      // Arrange
      const mockData = [
        { id: '1', title: '热门1' },
        { id: '2', title: '热门2' },
      ]
      vi.mocked(discoveryApi.getTrending).mockResolvedValue(mockData)
      const store = useDiscoveryStore()

      // Act
      await store.fetchTrending('daily')

      // Assert
      expect(store.trending).toEqual(mockData)
      expect(discoveryApi.getTrending).toHaveBeenCalledWith({ type: 'daily' })
    })

    it('should use default type daily when not provided', async () => {
      // Arrange
      vi.mocked(discoveryApi.getTrending).mockResolvedValue([])
      const store = useDiscoveryStore()

      // Act
      await store.fetchTrending()

      // Assert
      expect(discoveryApi.getTrending).toHaveBeenCalledWith({ type: 'daily' })
    })

    it('should handle error when API call fails', async () => {
      // Arrange
      const mockError = new Error('Network error')
      vi.mocked(discoveryApi.getTrending).mockRejectedValue(mockError)
      const store = useDiscoveryStore()

      // Act
      await store.fetchTrending()

      // Assert
      expect(store.trending).toEqual([])
    })
  })

  describe('fetchTopics', () => {
    it('should fetch topics successfully', async () => {
      // Arrange
      const mockData = [
        { id: '1', title: '话题1' },
        { id: '2', title: '话题2' },
      ]
      vi.mocked(discoveryApi.getTopics).mockResolvedValue({
        list: mockData,
        total: 2,
      })
      const store = useDiscoveryStore()

      // Act
      await store.fetchTopics()

      // Assert
      expect(store.topics).toEqual(mockData)
      expect(discoveryApi.getTopics).toHaveBeenCalledTimes(1)
    })

    it('should handle error when API call fails', async () => {
      // Arrange
      const mockError = new Error('Network error')
      vi.mocked(discoveryApi.getTopics).mockRejectedValue(mockError)
      const store = useDiscoveryStore()

      // Act
      await store.fetchTopics()

      // Assert
      expect(store.topics).toEqual([])
    })
  })
})
