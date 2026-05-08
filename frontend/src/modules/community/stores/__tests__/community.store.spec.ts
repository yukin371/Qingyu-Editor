/**
 * Community Store测试
 */

import { createPinia, setActivePinia } from 'pinia'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCommunityStore } from '../community.store'
import {
  createMockPost,
  createMockPosts,
  createMockComment,
  createMockComments,
  createMockTopics,
} from '../../../../tests/fixtures'
import { mockSuccessApiCall, mockErrorApiCall } from '@/tests/utils/api-mock'

// Mock core/http to avoid actual HTTP calls and errorHandler issues
vi.mock('@/core/http', () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}))

// Mock API - 必须在import之前
const mockGetPosts = vi.fn()
const mockGetPostDetail = vi.fn()
const mockGetPostComments = vi.fn()
const mockCreatePost = vi.fn()
const mockCreatePostComment = vi.fn()
const mockLikePost = vi.fn()
const mockUnlikePost = vi.fn()
const mockBookmarkPost = vi.fn()
const mockGetTopics = vi.fn()
const mockFollowTopic = vi.fn()
const mockGetTopicPosts = vi.fn()

// Mock design-system services
vi.mock('@/design-system/services', () => ({
  message: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    show: vi.fn(),
  },
  notification: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    show: vi.fn(),
  },
  messageBox: {
    alert: vi.fn(),
    confirm: vi.fn(),
    prompt: vi.fn(),
  },
}))

vi.mock('../../api', () => ({
  getPosts: (...args: any[]) => mockGetPosts(...args),
  getPostDetail: (...args: any[]) => mockGetPostDetail(...args),
  getPostComments: (...args: any[]) => mockGetPostComments(...args),
  createPost: (...args: any[]) => mockCreatePost(...args),
  createPostComment: (...args: any[]) => mockCreatePostComment(...args),
  likePost: (...args: any[]) => mockLikePost(...args),
  unlikePost: (...args: any[]) => mockUnlikePost(...args),
  bookmarkPost: (...args: any[]) => mockBookmarkPost(...args),
  getTopics: (...args: any[]) => mockGetTopics(...args),
  followTopic: (...args: any[]) => mockFollowTopic(...args),
  getTopicPosts: (...args: any[]) => mockGetTopicPosts(...args),
}))

import * as _communityApi from '../../api'

// 导出API函数供测试使用 (保持import但标记为未使用)
void _communityApi

describe('useCommunityStore', () => {
  beforeEach(() => {
    // 创建新的pinia实例
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should initialize with correct default state', () => {
      // Act
      const store = useCommunityStore()

      // Assert
      expect(store.posts).toEqual([])
      expect(store.currentPost).toBeNull()
      expect(store.comments).toEqual([])
      expect(store.topics).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.total).toBe(0)
    })

    it('should compute hasPosts correctly', () => {
      // Arrange
      const store = useCommunityStore()

      // Assert
      expect(store.hasPosts).toBe(false)

      // Act
      ;(store as any).posts = createMockPosts(3)

      // Assert
      expect(store.hasPosts).toBe(true)
    })
  })

  describe('fetchPosts', () => {
    it('should fetch posts successfully', async () => {
      // Arrange
      const mockData = {
        list: createMockPosts(3),
        total: 3,
        page: 1,
        size: 10,
      }
      mockGetPosts.mockImplementation(mockSuccessApiCall(mockData))
      const store = useCommunityStore()

      // Act
      await store.fetchPosts({ page: 1, size: 10 })

      // Assert
      expect(store.loading).toBe(false)
      expect(store.posts).toEqual(mockData.list)
      expect(store.total).toBe(mockData.total)
      expect(store.error).toBeNull()
      expect(mockGetPosts).toHaveBeenCalledWith({ page: 1, size: 10 })
    })

    it('should handle fetch posts error', async () => {
      // Arrange
      const error = new Error('Network error')
      mockGetPosts.mockImplementation(mockErrorApiCall(error.message))
      const store = useCommunityStore()

      // Act
      await store.fetchPosts()

      // Assert
      expect(store.loading).toBe(false)
      expect(store.error).toBeInstanceOf(Error)
      expect(store.error?.message).toBe(error.message)
      expect(store.posts).toEqual([])
    })

    it('should set loading to true during fetch', async () => {
      // Arrange
      const mockData = {
        list: createMockPosts(3),
        total: 3,
        page: 1,
        size: 10,
      }
      mockGetPosts.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockData), 100)
          }),
      )
      const store = useCommunityStore()

      // Act
      const fetchPromise = store.fetchPosts()

      // Assert: loading should be true during fetch
      expect(store.loading).toBe(true)

      // Wait for completion
      await fetchPromise

      // Assert: loading should be false after fetch
      expect(store.loading).toBe(false)
    })
  })

  describe('fetchPostDetail', () => {
    it('should fetch post detail successfully', async () => {
      // Arrange
      const mockPost = createMockPost()
      mockGetPostDetail.mockImplementation(mockSuccessApiCall(mockPost))
      const store = useCommunityStore()

      // Act
      await store.fetchPostDetail(mockPost.id)

      // Assert
      expect(store.loading).toBe(false)
      expect(store.currentPost).toEqual(mockPost)
      expect(store.error).toBeNull()
      expect(mockGetPostDetail).toHaveBeenCalledWith(mockPost.id)
    })

    it('should handle fetch post detail error', async () => {
      // Arrange
      const error = new Error('Post not found')
      mockGetPostDetail.mockImplementation(mockErrorApiCall(error.message))
      const store = useCommunityStore()

      // Act
      await store.fetchPostDetail('invalid-id')

      // Assert
      expect(store.loading).toBe(false)
      expect(store.error).toBeInstanceOf(Error)
      expect(store.error?.message).toBe(error.message)
      expect(store.currentPost).toBeNull()
    })
  })

  describe('fetchComments', () => {
    it('should fetch comments successfully', async () => {
      // Arrange
      const postId = 'post_123'
      const mockData = {
        list: createMockComments(3),
        total: 3,
      }
      mockGetPostComments.mockImplementation(mockSuccessApiCall(mockData))
      const store = useCommunityStore()

      // Act
      await store.fetchComments(postId)

      // Assert
      expect(store.comments).toEqual(mockData.list)
      expect(mockGetPostComments).toHaveBeenCalledWith(postId)
    })

    it('should handle fetch comments error silently', async () => {
      // Arrange
      const postId = 'post_123'
      mockGetPostComments.mockImplementation(mockErrorApiCall('Error'))
      const store = useCommunityStore()

      // Act - 应该不会抛出错误
      await store.fetchComments(postId)

      // Assert
      expect(store.comments).toEqual([])
    })
  })

  describe('createPost', () => {
    it('should create post successfully', async () => {
      // Arrange
      const newPost = {
        type: 'text',
        content: '这是一个新动态',
        topics: ['玄幻'],
      }
      const mockPost = createMockPost(newPost)
      mockCreatePost.mockImplementation(mockSuccessApiCall(mockPost))
      const store = useCommunityStore()

      // Act
      const result = await store.createPost(newPost)

      // Assert
      expect(result).toEqual(mockPost)
      expect(store.posts[0]).toEqual(mockPost)
      expect(store.loading).toBe(false)
      expect(mockCreatePost).toHaveBeenCalledWith(newPost)
    })

    it('should handle create post error', async () => {
      // Arrange
      const newPost = {
        type: 'text',
        content: '这是一个新动态',
      }
      const error = new Error('Create failed')
      mockCreatePost.mockImplementation(mockErrorApiCall(error.message))
      const store = useCommunityStore()

      // Act & Assert
      await expect(store.createPost(newPost)).rejects.toThrow('Create failed')
      expect(store.loading).toBe(false)
    })
  })

  describe('createComment', () => {
    it('should create comment successfully', async () => {
      // Arrange
      const postId = 'post_123'
      const content = '这是一个新评论'
      const mockComment = createMockComment({ content })
      mockCreatePostComment.mockImplementation(mockSuccessApiCall(mockComment))
      const store = useCommunityStore()
      ;(store as any).currentPost = createMockPost({ id: postId, commentCount: 5 } as any)

      // Act
      const result = await store.createComment(postId, content)

      // Assert
      expect(result).toEqual(mockComment)
      expect(store.comments[0]).toEqual(mockComment)
      expect((store.currentPost as any)?.commentCount).toBe(6)
      expect(mockCreatePostComment).toHaveBeenCalledWith(postId, {
        content,
        replyTo: undefined,
      })
    })

    it('should create comment with replyTo', async () => {
      // Arrange
      const postId = 'post_123'
      const content = '这是一个回复'
      const replyTo = 'comment_456'
      const mockComment = createMockComment({ content, replyToId: replyTo } as any)
      mockCreatePostComment.mockImplementation(mockSuccessApiCall(mockComment))
      const store = useCommunityStore()

      // Act
      const result = await store.createComment(postId, content, replyTo)

      // Assert
      expect(result).toEqual(mockComment)
      expect(mockCreatePostComment).toHaveBeenCalledWith(postId, {
        content,
        replyTo,
      })
    })

    it('should handle create comment error', async () => {
      // Arrange
      const postId = 'post_123'
      const content = '这是一个新评论'
      const error = new Error('Create failed')
      mockCreatePostComment.mockImplementation(mockErrorApiCall(error.message))
      const store = useCommunityStore()

      // Act & Assert
      await expect(store.createComment(postId, content)).rejects.toThrow('Create failed')
    })
  })

  describe('toggleLike', () => {
    it('should like post when not liked', async () => {
      // Arrange
      const mockPost = createMockPost({
        id: 'post_123',
        isLiked: false,
        likeCount: 10,
      } as any)
      const mockResponse = { success: true, likeCount: 11 }
      mockLikePost.mockImplementation(mockSuccessApiCall(mockResponse))
      const store = useCommunityStore()
      ;(store as any).posts = [mockPost]

      // Act
      await store.toggleLike('post_123')

      // Assert
      expect((store.posts[0] as any).isLiked).toBe(true)
      expect((store.posts[0] as any).likeCount).toBe(11)
      expect(mockLikePost).toHaveBeenCalledWith('post_123')
    })

    it('should unlike post when liked', async () => {
      // Arrange
      const mockPost = createMockPost({
        id: 'post_123',
        isLiked: true,
        likeCount: 10,
      } as any)
      const mockResponse = { success: true, likeCount: 9 }
      mockUnlikePost.mockImplementation(mockSuccessApiCall(mockResponse))
      const store = useCommunityStore()
      ;(store as any).posts = [mockPost]

      // Act
      await store.toggleLike('post_123')

      // Assert
      expect((store.posts[0] as any).isLiked).toBe(false)
      expect((store.posts[0] as any).likeCount).toBe(9)
      expect(mockUnlikePost).toHaveBeenCalledWith('post_123')
    })

    it('should handle toggle like error silently', async () => {
      // Arrange
      const mockPost = createMockPost({
        id: 'post_123',
        isLiked: false,
      })
      mockLikePost.mockImplementation(mockErrorApiCall('Error'))
      const store = useCommunityStore()
      ;(store as any).posts = [mockPost]

      // Act - 应该不会抛出错误
      await store.toggleLike('post_123')

      // Assert
      expect((store.posts[0] as any).isLiked).toBe(false)
    })

    it('should work with currentPost', async () => {
      // Arrange
      const mockPost = createMockPost({
        id: 'post_123',
        isLiked: false,
        likeCount: 10,
      } as any)
      const mockResponse = { success: true, likeCount: 11 }
      mockLikePost.mockImplementation(mockSuccessApiCall(mockResponse))
      const store = useCommunityStore()
      ;(store as any).currentPost = mockPost

      // Act
      await store.toggleLike('post_123')

      // Assert
      expect((store.currentPost as any)?.isLiked).toBe(true)
      expect((store.currentPost as any)?.likeCount).toBe(11)
    })
  })

  describe('fetchTopics', () => {
    it('should fetch topics successfully', async () => {
      // Arrange
      const mockData = {
        list: createMockTopics(3),
        total: 3,
      }
      mockGetTopics.mockImplementation(mockSuccessApiCall(mockData))
      const store = useCommunityStore()

      // Act
      await store.fetchTopics()

      // Assert
      expect(store.topics).toEqual(mockData.list)
      expect(mockGetTopics).toHaveBeenCalledWith()
    })

    it('should handle fetch topics error silently', async () => {
      // Arrange
      mockGetTopics.mockImplementation(mockErrorApiCall('Error'))
      const store = useCommunityStore()

      // Act - 应该不会抛出错误
      await store.fetchTopics()

      // Assert
      expect(store.topics).toEqual([])
    })
  })

  describe('fetchTopicPosts', () => {
    it('should fetch topic posts successfully', async () => {
      // Arrange
      const topicId = 'topic_123'
      const mockData = {
        list: createMockPosts(3),
        total: 3,
      }
      mockGetTopicPosts.mockImplementation(mockSuccessApiCall(mockData))
      const store = useCommunityStore()

      // Act
      await store.fetchTopicPosts(topicId)

      // Assert
      expect(store.posts).toEqual(mockData.list)
      expect(store.loading).toBe(false)
      expect(mockGetTopicPosts).toHaveBeenCalledWith(topicId)
    })

    it('should handle fetch topic posts error silently', async () => {
      // Arrange
      const topicId = 'topic_123'
      mockGetTopicPosts.mockImplementation(mockErrorApiCall('Error'))
      const store = useCommunityStore()

      // Act - 应该不会抛出错误
      await store.fetchTopicPosts(topicId)

      // Assert
      expect(store.loading).toBe(false)
    })
  })
})
