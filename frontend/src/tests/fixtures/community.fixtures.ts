/**
 * Community模块测试fixtures
 * 提供community模块的mock数据
 */

import { nanoid } from 'nanoid'

/**
 * 帖子mock数据
 */
export const mockPost = {
  id: 'post_1234567890',
  authorId: 'user_1234567890',
  authorName: '测试用户',
  authorAvatar: 'https://example.com/avatar.jpg',
  title: '测试帖子标题',
  content: '这是帖子的内容',
  images: ['https://example.com/image1.jpg'],
  topicId: 'topic_1234567890',
  topicName: '玄幻小说讨论',
  likesCount: 10,
  commentsCount: 5,
  sharesCount: 2,
  viewsCount: 100,
  isLiked: false,
  isPinned: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

/**
 * 创建帖子mock数据
 * @param overrides 覆盖字段
 */
export const createMockPost = (overrides: Partial<typeof mockPost> = {}) => {
  return {
    ...mockPost,
    id: nanoid(),
    authorId: nanoid(),
    topicId: nanoid(),
    ...overrides,
  }
}

/**
 * 帖子列表mock数据
 */
export const mockPosts = [
  createMockPost({ title: '帖子1' }),
  createMockPost({ title: '帖子2' }),
  createMockPost({ title: '帖子3' }),
]

/**
 * 创建帖子列表mock数据
 * @param count 帖子数量
 */
export const createMockPosts = (count: number = 10): typeof mockPosts => {
  return Array.from({ length: count }, (_, index) =>
    createMockPost({
      title: `帖子${index + 1}`,
      content: `这是第${index + 1}个帖子的内容`,
    })
  )
}

/**
 * 帖子创建参数mock数据
 */
export const mockPostCreateParams = {
  title: '新帖子',
  content: '这是新帖子的内容',
  images: [],
  topicId: 'topic_1234567890',
}

/**
 * 帖子更新参数mock数据
 */
export const mockPostUpdateParams = {
  title: '更新后的帖子标题',
  content: '更新后的帖子内容',
  images: ['https://example.com/new-image.jpg'],
}

/**
 * 评论mock数据
 */
export const mockComment = {
  id: 'comment_1234567890',
  postId: 'post_1234567890',
  authorId: 'user_1234567890',
  authorName: '测试用户',
  authorAvatar: 'https://example.com/avatar.jpg',
  content: '这是评论内容',
  parentId: null,
  replyToId: null,
  replyToName: null,
  likesCount: 5,
  isLiked: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

/**
 * 创建评论mock数据
 * @param overrides 覆盖字段
 */
export const createMockComment = (overrides: Partial<typeof mockComment> = {}) => {
  return {
    ...mockComment,
    id: nanoid(),
    postId: nanoid(),
    authorId: nanoid(),
    ...overrides,
  }
}

/**
 * 评论列表mock数据
 */
export const mockComments = [
  createMockComment({ content: '评论1' }),
  createMockComment({ content: '评论2' }),
  createMockComment({ content: '评论3' }),
]

/**
 * 创建评论列表mock数据
 * @param count 评论数量
 */
export const createMockComments = (count: number = 10): typeof mockComments => {
  return Array.from({ length: count }, (_, index) =>
    createMockComment({
      content: `评论${index + 1}`,
    })
  )
}

/**
 * 评论创建参数mock数据
 */
export const mockCommentCreateParams = {
  content: '这是新评论',
  parentId: null,
  replyToId: null,
}

/**
 * 话题mock数据
 */
export const mockTopic = {
  id: 'topic_1234567890',
  name: '玄幻小说讨论',
  description: '讨论各种玄幻小说',
  coverImage: 'https://example.com/topic-cover.jpg',
  postsCount: 100,
  followersCount: 200,
  isFollowed: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

/**
 * 创建话题mock数据
 * @param overrides 覆盖字段
 */
export const createMockTopic = (overrides: Partial<typeof mockTopic> = {}) => {
  return {
    ...mockTopic,
    id: nanoid(),
    ...overrides,
  }
}

/**
 * 话题列表mock数据
 */
export const mockTopics = [
  createMockTopic({ name: '玄幻小说讨论' }),
  createMockTopic({ name: '仙侠小说推荐' }),
  createMockTopic({ name: '都市小说交流' }),
]

/**
 * 创建话题列表mock数据
 * @param count 话题数量
 */
export const createMockTopics = (count: number = 10): typeof mockTopics => {
  return Array.from({ length: count }, (_, index) =>
    createMockTopic({
      name: `话题${index + 1}`,
      postsCount: index * 10 + 1,
    })
  )
}

/**
 * 帖子筛选参数mock数据
 */
export const mockPostFilterParams = {
  keyword: '玄幻',
  topicId: 'topic_1234567890',
  sortBy: 'latest',
  sortOrder: 'desc',
}

/**
 * 社区统计mock数据
 */
export const mockCommunityStats = {
  totalPosts: 1000,
  totalTopics: 50,
  myPosts: 10,
  myComments: 20,
  followedTopics: 5,
}
