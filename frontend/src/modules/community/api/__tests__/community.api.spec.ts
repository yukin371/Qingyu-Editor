/**
 * Community API测试
 */

import * as communityApi from '../index'
import {
  createMockPost,
  createMockPosts,
  createMockComment,
  createMockComments,
  createMockTopics,
} from '../../../../tests/fixtures'
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

describe('communityApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPosts', () => {
    it('should return posts list when API call succeeds', async () => {
      // Arrange
      const mockData = {
        list: createMockPosts(3),
        total: 3,
        page: 1,
        size: 10,
      }
      vi.mocked(http.get).mockImplementation(mockSuccessApiCall(mockData))

      // Act
      const result = await communityApi.getPosts({ page: 1, size: 10 })

      // Assert
      expect(result).toEqual(mockData)
      expect(http.get).toHaveBeenCalledWith('/api/v1/community/posts', {
        params: { page: 1, size: 10 },
      })
    })

    it('should return posts list without params', async () => {
      // Arrange
      const mockData = {
        list: createMockPosts(5),
        total: 5,
        page: 1,
        size: 10,
      }
      vi.mocked(http.get).mockImplementation(mockSuccessApiCall(mockData))

      // Act
      const result = await communityApi.getPosts()

      // Assert
      expect(result).toEqual(mockData)
      expect(http.get).toHaveBeenCalledWith('/api/v1/community/posts', { params: undefined })
    })

    it('should throw error when API call fails', async () => {
      // Arrange
      const error = new Error('Network error')
      vi.mocked(http.get).mockImplementation(mockErrorApiCall(error.message))

      // Act & Assert
      await expect(communityApi.getPosts({})).rejects.toThrow('Network error')
    })
  })

  describe('getPostDetail', () => {
    it('should return post detail when API call succeeds', async () => {
      // Arrange
      const mockPost = createMockPost()
      vi.mocked(http.get).mockImplementation(mockSuccessApiCall(mockPost))

      // Act
      const result = await communityApi.getPostDetail(mockPost.id)

      // Assert
      expect(result).toEqual(mockPost)
      expect(http.get).toHaveBeenCalledWith(`/api/v1/community/posts/${mockPost.id}`)
    })

    it('should throw error when post not found', async () => {
      // Arrange
      const error = new Error('Post not found')
      vi.mocked(http.get).mockImplementation(mockErrorApiCall(error.message))

      // Act & Assert
      await expect(communityApi.getPostDetail('invalid-id')).rejects.toThrow('Post not found')
    })
  })

  describe('createPost', () => {
    it('should create post when data is valid', async () => {
      // Arrange
      const newPost = {
        type: 'text',
        content: '这是一个新动态',
        images: [],
        topics: ['玄幻', '仙侠'],
      }
      const mockPost = createMockPost(newPost)
      vi.mocked(http.post).mockImplementation(mockSuccessApiCall(mockPost))

      // Act
      const result = await communityApi.createPost(newPost)

      // Assert
      expect(result).toEqual(mockPost)
      expect(http.post).toHaveBeenCalledWith('/api/v1/community/posts', newPost)
    })

    it('should throw error when data is invalid', async () => {
      // Arrange
      const invalidData = {
        type: 'text',
        content: '',
        images: [],
      }
      const error = new Error('Invalid data')
      vi.mocked(http.post).mockImplementation(mockErrorApiCall(error.message))

      // Act & Assert
      await expect(communityApi.createPost(invalidData)).rejects.toThrow('Invalid data')
    })
  })

  describe('updatePost', () => {
    it('should update post when data is valid', async () => {
      // Arrange
      const postId = 'post_123'
      const updateData = {
        content: '更新后的内容',
        topics: ['都市'],
      }
      const updatedPost = createMockPost(updateData)
      vi.mocked(http.put).mockImplementation(mockSuccessApiCall(updatedPost))

      // Act
      const result = await communityApi.updatePost(postId, updateData)

      // Assert
      expect(result).toEqual(updatedPost)
      expect(http.put).toHaveBeenCalledWith(`/api/v1/community/posts/${postId}`, updateData)
    })
  })

  describe('deletePost', () => {
    it('should delete post when API call succeeds', async () => {
      // Arrange
      const postId = 'post_123'
      const mockResponse = { success: true }
      vi.mocked(http.delete).mockImplementation(mockSuccessApiCall(mockResponse))

      // Act
      const result = await communityApi.deletePost(postId)

      // Assert
      expect(result).toEqual(mockResponse)
      expect(http.delete).toHaveBeenCalledWith(`/api/v1/community/posts/${postId}`)
    })
  })

  describe('likePost', () => {
    it('should like post when API call succeeds', async () => {
      // Arrange
      const postId = 'post_123'
      const mockResponse = { success: true, likeCount: 11 }
      vi.mocked(http.post).mockImplementation(mockSuccessApiCall(mockResponse))

      // Act
      const result = await communityApi.likePost(postId)

      // Assert
      expect(result).toEqual(mockResponse)
      expect(http.post).toHaveBeenCalledWith(`/api/v1/community/posts/${postId}/like`)
    })
  })

  describe('unlikePost', () => {
    it('should unlike post when API call succeeds', async () => {
      // Arrange
      const postId = 'post_123'
      const mockResponse = { success: true, likeCount: 9 }
      vi.mocked(http.delete).mockImplementation(mockSuccessApiCall(mockResponse))

      // Act
      const result = await communityApi.unlikePost(postId)

      // Assert
      expect(result).toEqual(mockResponse)
      expect(http.delete).toHaveBeenCalledWith(`/api/v1/community/posts/${postId}/like`)
    })
  })

  describe('bookmarkPost', () => {
    it('should bookmark post when API call succeeds', async () => {
      // Arrange
      const postId = 'post_123'
      const mockResponse = { success: true }
      vi.mocked(http.post).mockImplementation(mockSuccessApiCall(mockResponse))

      // Act
      const result = await communityApi.bookmarkPost(postId)

      // Assert
      expect(result).toEqual(mockResponse)
      expect(http.post).toHaveBeenCalledWith(`/api/v1/community/posts/${postId}/bookmark`)
    })
  })

  describe('getPostComments', () => {
    it('should return comments list when API call succeeds', async () => {
      // Arrange
      const postId = 'post_123'
      const mockData = {
        list: createMockComments(3),
        total: 3,
      }
      vi.mocked(http.get).mockImplementation(mockSuccessApiCall(mockData))

      // Act
      const result = await communityApi.getPostComments(postId, { page: 1, size: 10 })

      // Assert
      expect(result).toEqual(mockData)
      expect(http.get).toHaveBeenCalledWith(`/api/v1/community/posts/${postId}/comments`, {
        params: { page: 1, size: 10 },
      })
    })

    it('should return comments list without params', async () => {
      // Arrange
      const postId = 'post_123'
      const mockData = {
        list: createMockComments(5),
        total: 5,
      }
      vi.mocked(http.get).mockImplementation(mockSuccessApiCall(mockData))

      // Act
      const result = await communityApi.getPostComments(postId)

      // Assert
      expect(result).toEqual(mockData)
      expect(http.get).toHaveBeenCalledWith(`/api/v1/community/posts/${postId}/comments`, {
        params: undefined,
      })
    })
  })

  describe('createPostComment', () => {
    it('should create comment when data is valid', async () => {
      // Arrange
      const postId = 'post_123'
      const newComment = {
        content: '这是一个新评论',
        replyTo: 'comment_456',
      }
      const mockComment = createMockComment(newComment)
      vi.mocked(http.post).mockImplementation(mockSuccessApiCall(mockComment))

      // Act
      const result = await communityApi.createPostComment(postId, newComment)

      // Assert
      expect(result).toEqual(mockComment)
      expect(http.post).toHaveBeenCalledWith(
        `/api/v1/community/posts/${postId}/comments`,
        newComment,
      )
    })

    it('should create comment without replyTo', async () => {
      // Arrange
      const postId = 'post_123'
      const newComment = {
        content: '这是一个新评论',
      }
      const mockComment = createMockComment(newComment)
      vi.mocked(http.post).mockImplementation(mockSuccessApiCall(mockComment))

      // Act
      const result = await communityApi.createPostComment(postId, newComment)

      // Assert
      expect(result).toEqual(mockComment)
      expect(http.post).toHaveBeenCalledWith(
        `/api/v1/community/posts/${postId}/comments`,
        newComment,
      )
    })
  })

  describe('getTopics', () => {
    it('should return topics list when API call succeeds', async () => {
      // Arrange
      const mockData = {
        list: createMockTopics(3),
        total: 3,
      }
      vi.mocked(http.get).mockImplementation(mockSuccessApiCall(mockData))

      // Act
      const result = await communityApi.getTopics({ page: 1, size: 10 })

      // Assert
      expect(result).toEqual(mockData)
      expect(http.get).toHaveBeenCalledWith('/api/v1/community/topics', {
        params: { page: 1, size: 10 },
      })
    })

    it('should return topics list without params', async () => {
      // Arrange
      const mockData = {
        list: createMockTopics(5),
        total: 5,
      }
      vi.mocked(http.get).mockImplementation(mockSuccessApiCall(mockData))

      // Act
      const result = await communityApi.getTopics()

      // Assert
      expect(result).toEqual(mockData)
      expect(http.get).toHaveBeenCalledWith('/api/v1/community/topics', {
        params: undefined,
      })
    })
  })

  describe('followTopic', () => {
    it('should follow topic when API call succeeds', async () => {
      // Arrange
      const topicId = 'topic_123'
      const mockResponse = { success: true }
      vi.mocked(http.post).mockImplementation(mockSuccessApiCall(mockResponse))

      // Act
      const result = await communityApi.followTopic(topicId)

      // Assert
      expect(result).toEqual(mockResponse)
      expect(http.post).toHaveBeenCalledWith(`/api/v1/community/topics/${topicId}/follow`)
    })
  })

  describe('getTopicPosts', () => {
    it('should return topic posts when API call succeeds', async () => {
      // Arrange
      const topicId = 'topic_123'
      const mockData = {
        list: createMockPosts(3),
        total: 3,
      }
      vi.mocked(http.get).mockImplementation(mockSuccessApiCall(mockData))

      // Act
      const result = await communityApi.getTopicPosts(topicId, { page: 1, size: 10 })

      // Assert
      expect(result).toEqual(mockData)
      expect(http.get).toHaveBeenCalledWith(`/api/v1/community/topics/${topicId}/posts`, {
        params: { page: 1, size: 10 },
      })
    })

    it('should return topic posts without params', async () => {
      // Arrange
      const topicId = 'topic_123'
      const mockData = {
        list: createMockPosts(5),
        total: 5,
      }
      vi.mocked(http.get).mockImplementation(mockSuccessApiCall(mockData))

      // Act
      const result = await communityApi.getTopicPosts(topicId)

      // Assert
      expect(result).toEqual(mockData)
      expect(http.get).toHaveBeenCalledWith(`/api/v1/community/topics/${topicId}/posts`, {
        params: undefined,
      })
    })
  })
})
