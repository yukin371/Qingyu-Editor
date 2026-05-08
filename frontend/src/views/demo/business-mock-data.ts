/**
 * 业务模块 Mock 数据
 *
 * 用于在 ?test=true 模式下为业务页面提供模拟数据
 * 这些数据模拟真实的 API 响应，用于样式验证和功能测试
 */

// 导入图片配置
import {
  getBookCoverUrl,
  getUserAvatarUrl,
  BOOK_COVERS,
  USER_AVATARS,
  BANNER_IMAGES,
} from './mock-images'

// ==================== 类型定义 ====================

export interface Book {
  _id: string
  id: string
  title: string
  author: string
  authorId: string
  cover: string
  coverUrl: string
  categoryName: string
  categoryId: string
  status: 'serializing' | 'completed' | 'paused'
  rating: number
  ratingCount: number
  viewCount: number
  favoriteCount: number
  wordCount: number
  chapterCount: number
  description: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Chapter {
  id: string
  bookId: string
  title: string
  wordCount: number
  isVip: boolean
  price: number
  publishTime: string
}

export interface Comment {
  id: string
  userId: string
  user: {
    id: string
    username: string
    nickname: string
    avatar: string
    level: number
  }
  content: string
  rating: number
  likeCount: number
  replyCount: number
  createdAt: string
}

export interface Project {
  id: string
  projectId: string
  authorId: string
  title: string
  summary: string
  coverUrl: string
  status: 'draft' | 'serializing' | 'completed' | 'suspended'
  category: string
  tags: string[]
  visibility: 'public' | 'private'
  statistics: {
    totalWords: number
    chapterCount: number
    documentCount: number
    lastUpdateAt: string
  }
  createdAt: string
  updatedAt: string
}

export interface Post {
  id: string
  authorId: string
  author: {
    id: string
    username: string
    nickname: string
    avatar: string
  }
  title: string
  content: string
  tags: string[]
  likeCount: number
  commentCount: number
  viewCount: number
  createdAt: string
  updatedAt: string
}

// ==================== 书城模块数据 ====================

/**
 * 首页 Banner 数据
 */
export const homepageBanners = [
  {
    id: 'banner-1',
    title: '2024年度精选作品',
    subtitle: '发现最好的故事',
    image: BANNER_IMAGES.home.main,
    link: '/bookstore/browse?featured=true',
    order: 1,
  },
  {
    id: 'banner-2',
    title: '新人作家扶持计划',
    subtitle: '下一个大神就是你',
    image: BANNER_IMAGES.home.new,
    link: '/writer',
    order: 2,
  },
  {
    id: 'banner-3',
    title: '阅读挑战活动',
    subtitle: '完成任务赢好礼',
    image: BANNER_IMAGES.home.activity,
    link: '/reading-stats',
    order: 3,
  },
]

/**
 * 首页统计数据
 */
export const homepageStats = {
  totalBooks: 125680,
  ongoingBooks: 32850,
  totalAuthors: 15620,
  todayUpdate: 2850,
}

/**
 * 推荐书籍列表
 */
export const recommendedBooks: Book[] = [
  {
    _id: 'book-1',
    id: 'book-1',
    title: '星河骑士',
    author: '猫妖大人',
    authorId: 'author-1',
    cover: BOOK_COVERS.scifi['星河骑士'] || getBookCoverUrl('book-1', '科幻'),
    coverUrl: BOOK_COVERS.scifi['星河骑士'] || getBookCoverUrl('book-1', '科幻'),
    categoryName: '科幻',
    categoryId: 'cat-1',
    status: 'serializing',
    rating: 4.5,
    ratingCount: 12345,
    viewCount: 568900,
    favoriteCount: 12340,
    wordCount: 580000,
    chapterCount: 156,
    description:
      '在遥远的未来，人类已经征服了星辰大海。一位年轻的骑士，为了寻找失落的星际文明，踏上了一段惊心动魄的冒险旅程...',
    tags: ['科幻', '冒险', '热血', '机甲'],
    createdAt: '2023-06-15T10:00:00Z',
    updatedAt: '2024-02-08T15:30:00Z',
  },
  {
    _id: 'book-2',
    id: 'book-2',
    title: '青羽物语',
    author: '樱花飘落',
    authorId: 'author-2',
    cover: BOOK_COVERS.fantasy['青羽物语'] || getBookCoverUrl('book-2', '奇幻'),
    coverUrl: BOOK_COVERS.fantasy['青羽物语'] || getBookCoverUrl('book-2', '奇幻'),
    categoryName: '奇幻',
    categoryId: 'cat-2',
    status: 'completed',
    rating: 4.8,
    ratingCount: 23456,
    viewCount: 890120,
    favoriteCount: 34560,
    wordCount: 1200000,
    chapterCount: 365,
    description:
      '一个关于成长、友情和冒险的温馨故事。在青羽大陆上，每个孩子出生时都会获得一片羽毛，这片羽毛将指引他们找到自己的命运...',
    tags: ['奇幻', '治愈', '日常', '冒险'],
    createdAt: '2022-03-20T08:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
  },
  {
    _id: 'book-3',
    id: 'book-3',
    title: '剑道独尊',
    author: '墨客',
    authorId: 'author-3',
    cover: BOOK_COVERS.martial['剑道独尊'] || getBookCoverUrl('book-3', '武侠'),
    coverUrl: BOOK_COVERS.martial['剑道独尊'] || getBookCoverUrl('book-3', '武侠'),
    categoryName: '武侠',
    categoryId: 'cat-3',
    status: 'serializing',
    rating: 4.3,
    ratingCount: 8765,
    viewCount: 234500,
    favoriteCount: 8760,
    wordCount: 890000,
    chapterCount: 234,
    description:
      '一把上古神剑，一位落魄少年，一段传奇的冒险之旅。少年剑客林风，为了寻找父母的下落，踏入了波澜壮阔的江湖...',
    tags: ['武侠', '修炼', '热血', '江湖'],
    createdAt: '2023-08-10T14:00:00Z',
    updatedAt: '2024-02-09T10:20:00Z',
  },
  {
    _id: 'book-4',
    id: 'book-4',
    title: '甜点日记',
    author: '糖豆豆',
    authorId: 'author-4',
    cover: BOOK_COVERS.city['甜点日记'] || getBookCoverUrl('book-4', '都市'),
    coverUrl: BOOK_COVERS.city['甜点日记'] || getBookCoverUrl('book-4', '都市'),
    categoryName: '都市',
    categoryId: 'cat-4',
    status: 'serializing',
    rating: 4.6,
    ratingCount: 15678,
    viewCount: 456780,
    favoriteCount: 18900,
    wordCount: 350000,
    chapterCount: 89,
    description:
      '一家温馨的甜品店，一段甜蜜的爱情。都市白领林小雨在偶然的机会下，继承了一家老字号甜品店，从此开始了她全新的人生...',
    tags: ['都市', '甜宠', '美食', '爱情'],
    createdAt: '2023-11-05T16:00:00Z',
    updatedAt: '2024-02-08T18:45:00Z',
  },
]

/**
 * 榜单数据
 */
export const rankings = {
  realtime: recommendedBooks.slice(0, 5),
  weekly: recommendedBooks.slice(1, 6).reverse(),
  monthly: recommendedBooks.slice(0, 5).reverse(),
  newbie: [
    {
      _id: 'book-5',
      id: 'book-5',
      title: '深海秘境',
      author: '海洋之子',
      authorId: 'author-5',
      cover: 'https://picsum.photos/300/400?random=14',
      coverUrl: 'https://picsum.photos/300/400?random=14',
      categoryName: '冒险',
      categoryId: 'cat-5',
      status: 'serializing',
      rating: 4.2,
      ratingCount: 2345,
      viewCount: 67890,
      favoriteCount: 3450,
      wordCount: 670000,
      chapterCount: 78,
      description: '探索深海中的未知世界，发现远古文明的秘密...',
      tags: ['冒险', '探索', '神秘'],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-02-09T14:30:00Z',
    },
  ],
}

/**
 * 书籍章节列表
 */
export const bookChapters: Chapter[] = Array.from({ length: 50 }, (_, i) => ({
  id: `chapter-${i + 1}`,
  bookId: 'book-1',
  title: `第${i + 1}章 ${getChapterTitle(i)}`,
  wordCount: 3000 + Math.floor(Math.random() * 1000),
  isVip: i > 10,
  price: i > 10 ? 5 : 0,
  publishTime: new Date(Date.now() - (50 - i) * 24 * 60 * 60 * 1000).toISOString(),
}))

function getChapterTitle(index: number): string {
  const titles = [
    '初入江湖',
    '神秘剑客',
    '客栈风波',
    '深夜追击',
    '山洞奇遇',
    '秘籍出世',
    '第一剑',
    '险象环生',
    '绝处逢生',
    '再起波澜',
    '踏入京城',
    '公主招亲',
    '武试开始',
    '一鸣惊人',
    '决赛时刻',
    '真相大白',
    '新的征程',
    '江湖路远',
    '剑道大成',
    '宗师之境',
  ]
  return titles[index % titles.length]
}

// ==================== 创作中心数据 ====================

/**
 * 写作项目列表
 */
export const writerProjects: Project[] = [
  {
    id: 'project-yljs-1',
    projectId: 'project-yljs-1',
    authorId: 'user-current',
    title: '云岚纪事',
    summary: '仙侠长篇，当前已编辑 3 章。',
    coverUrl: BOOK_COVERS.martial['云岚纪事'] || getBookCoverUrl('project-yljs-1', '仙侠'),
    status: 'serializing',
    category: '仙侠',
    tags: ['仙侠', '成长', '冒险', '连载'],
    visibility: 'public',
    statistics: {
      totalWords: 9800,
      chapterCount: 3,
      documentCount: 3,
      lastUpdateAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'project-2',
    projectId: 'project-2',
    authorId: 'user-current',
    title: '赛博侦探社',
    summary: '在赛博朋克的世界里，一家不起眼的侦探社接手了一个改变世界的案件...',
    coverUrl: BOOK_COVERS.scifi['赛博侦探社'] || getBookCoverUrl('project-2', '科幻'),
    status: 'draft',
    category: '科幻',
    tags: ['赛博朋克', '悬疑', '侦探'],
    visibility: 'private',
    statistics: {
      totalWords: 45000,
      chapterCount: 8,
      documentCount: 15,
      lastUpdateAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: '2024-01-10T14:00:00Z',
    updatedAt: '2024-02-08T16:45:00Z',
  },
  {
    id: 'project-3',
    projectId: 'project-3',
    authorId: 'user-current',
    title: '古剑传说',
    summary: '一把上古神剑，一位落魄少年，一段传奇的冒险之旅。',
    coverUrl: BOOK_COVERS.martial['古剑传说'] || getBookCoverUrl('project-3', '武侠'),
    status: 'completed',
    category: '武侠',
    tags: ['武侠', '冒险', '热血'],
    visibility: 'public',
    statistics: {
      totalWords: 520000,
      chapterCount: 156,
      documentCount: 180,
      lastUpdateAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: '2023-02-20T09:00:00Z',
    updatedAt: '2023-12-01T11:30:00Z',
  },
]

// ==================== 社区模块数据 ====================

/**
 * 社区帖子列表
 */
export const communityPosts: Post[] = [
  {
    id: 'post-1',
    authorId: 'user-1',
    author: {
      id: 'user-1',
      username: 'alice_wonder',
      nickname: '爱丽丝',
      avatar: USER_AVATARS['alice_wonder'] || getUserAvatarUrl('alice'),
    },
    title: '求推荐好看的科幻小说喵~',
    content: '最近书荒了，有没有什么好看的科幻小说推荐呀？最好是那种有独特世界观的，谢谢大家！',
    tags: ['求书', '科幻'],
    likeCount: 56,
    commentCount: 23,
    viewCount: 890,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'post-2',
    authorId: 'user-2',
    author: {
      id: 'user-2',
      username: 'bob_builder',
      nickname: '鲍勃',
      avatar: USER_AVATARS['bob_builder'] || getUserAvatarUrl('bob'),
    },
    title: '分享一下我的写作心得',
    content: '写了三年小说，总结了一些经验，希望对新人作者有帮助。主要关于人物塑造和情节安排...',
    tags: ['写作', '经验分享'],
    likeCount: 234,
    commentCount: 89,
    viewCount: 3456,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'post-3',
    authorId: 'user-3',
    author: {
      id: 'user-3',
      username: 'charlie_chef',
      nickname: '查理大厨',
      avatar: USER_AVATARS['charlie_chef'] || getUserAvatarUrl('charlie'),
    },
    title: '【活动】2024春节创作大赛开始报名啦！',
    content:
      '青羽平台2024年春节创作大赛正式启动！参赛就有机会获得丰厚奖励，欢迎大家踊跃报名参与...',
    tags: ['活动', '创作大赛'],
    likeCount: 567,
    commentCount: 145,
    viewCount: 8900,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
]

// ==================== 用户中心数据 ====================

/**
 * 用户个人信息
 */
export const userProfile = {
  id: 'user-current',
  username: 'demo_user',
  nickname: '演示用户',
  avatar: USER_AVATARS['demo_user'] || getUserAvatarUrl('demo_user'),
  email: 'demo@example.com',
  level: 5,
  experience: 2580,
  registrationDate: '2023-01-15T10:00:00Z',
  bio: '热爱阅读和写作的文艺青年',
  location: '上海',
  website: 'https://example.com',
}

/**
 * 用户书架
 */
export const userBookshelf = [
  {
    id: 'shelf-1',
    bookId: 'book-1',
    book: recommendedBooks[0],
    lastReadChapterId: 'chapter-50',
    lastReadChapterTitle: '第五十章：星际跃迁',
    progress: 65.5,
    addTime: '2023-12-01T10:00:00Z',
    updateTime: '2024-02-08T15:30:00Z',
  },
  {
    id: 'shelf-2',
    bookId: 'book-2',
    book: recommendedBooks[1],
    lastReadChapterId: 'chapter-120',
    lastReadChapterTitle: '第一百二十章：新的开始',
    progress: 100,
    addTime: '2023-06-15T14:00:00Z',
    updateTime: '2024-01-15T12:00:00Z',
  },
]

/**
 * 用户钱包信息
 */
export const userWallet = {
  userId: 'user-current',
  balance: 18250, // 182.5元
  frozenBalance: 500, // 5元
  totalIncome: 15000, // 150元
  totalExpense: 85000, // 850元
}

// ==================== 管理员模块数据 ====================

/**
 * 管理员用户列表
 */
export const adminUsers = [
  {
    id: 'user-admin-1',
    username: 'testadmin001',
    nickname: '超级管理员',
    email: 'admin@qingyu.com',
    avatar: getUserAvatarUrl('admin1'),
    role: 'admin',
    status: 'active',
    createdAt: '2023-01-01T00:00:00Z',
    lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'user-001',
    username: 'testuser001',
    nickname: '普通读者',
    email: 'reader@qingyu.com',
    avatar: getUserAvatarUrl('user1'),
    role: 'reader',
    status: 'active',
    createdAt: '2023-06-15T10:00:00Z',
    lastLoginAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'user-002',
    username: 'testauthor001',
    nickname: '签约作者',
    email: 'author@qingyu.com',
    avatar: getUserAvatarUrl('author1'),
    role: 'author',
    status: 'active',
    createdAt: '2023-03-20T08:00:00Z',
    lastLoginAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'user-003',
    username: 'banned_user',
    nickname: '被封禁用户',
    email: 'banned@qingyu.com',
    avatar: getUserAvatarUrl('banned'),
    role: 'reader',
    status: 'banned',
    createdAt: '2023-04-10T12:00:00Z',
    lastLoginAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

/**
 * 审核任务列表
 */
export const auditTasks = [
  {
    id: 'audit-1',
    type: 'book',
    targetId: 'book-new-1',
    targetTitle: '新书发布申请',
    submitter: 'testauthor001',
    submitterId: 'user-002',
    status: 'pending',
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    content: '申请发布新书《玄幻世界》',
  },
  {
    id: 'audit-2',
    type: 'chapter',
    targetId: 'chapter-new-1',
    targetTitle: '章节审核',
    submitter: 'testauthor002',
    submitterId: 'user-005',
    status: 'pending',
    submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    content: '申请发布第50章',
  },
  {
    id: 'audit-3',
    type: 'withdraw',
    targetId: 'withdraw-1',
    targetTitle: '提现申请',
    submitter: 'author_pro',
    submitterId: 'user-006',
    status: 'approved',
    submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    reviewer: 'testadmin001',
    content: '提现金额：500元',
  },
]

/**
 * 系统配置
 */
export const systemConfig = {
  siteName: '青羽文学',
  siteDescription: '发现最好的故事',
  maintenance: false,
  registrationEnabled: true,
  emailVerificationRequired: true,
  maxUploadSize: 10485760,
  allowedFileTypes: ['jpg', 'png', 'gif', 'doc', 'docx', 'txt'],
  defaultUserRole: 'reader',
  vipPrice: 30,
  chapterPrice: 5,
}

// ==================== 财务模块数据 ====================

/**
 * 钱包详情
 */
export const walletDetail = {
  userId: 'user-current',
  balance: 18250,
  frozenBalance: 500,
  totalIncome: 150000,
  totalExpense: 85000,
  availableBalance: 17750,
  currency: 'CNY',
}

/**
 * 提现记录
 */
export const withdrawRecords = [
  {
    id: 'withdraw-1',
    userId: 'user-current',
    amount: 50000,
    status: 'completed',
    bankName: '工商银行',
    bankAccount: '****1234',
    appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'withdraw-2',
    userId: 'user-current',
    amount: 30000,
    status: 'pending',
    bankName: '建设银行',
    bankAccount: '****5678',
    appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
  },
  {
    id: 'withdraw-3',
    userId: 'user-current',
    amount: 20000,
    status: 'rejected',
    bankName: '招商银行',
    bankAccount: '****9012',
    appliedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
    rejectReason: '账户信息有误',
  },
]

/**
 * 收入统计
 */
export const incomeStats = {
  today: 1500,
  yesterday: 2300,
  thisWeek: 12500,
  thisMonth: 45000,
  lastMonth: 38000,
  total: 150000,
  chartData: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    income: Math.floor(Math.random() * 3000) + 500,
  })),
}

/**
 * 交易记录
 */
export const transactionRecords = [
  {
    id: 'txn-1',
    type: 'income',
    category: 'subscription',
    amount: 3000,
    description: 'VIP订阅收入',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'txn-2',
    type: 'income',
    category: 'chapter',
    amount: 1500,
    description: '章节付费收入',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'txn-3',
    type: 'expense',
    category: 'withdraw',
    amount: 50000,
    description: '提现到工商银行',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'txn-4',
    type: 'expense',
    category: 'purchase',
    amount: 500,
    description: '购买章节：第五章',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// ==================== 社交模块数据 ====================

/**
 * 关注列表
 */
export const followingList = [
  {
    id: 'follow-1',
    userId: 'user-current',
    targetId: 'user-002',
    target: {
      id: 'user-002',
      username: 'testauthor001',
      nickname: '签约作者',
      avatar: getUserAvatarUrl('author1'),
      bio: '专注玄幻小说创作',
      followerCount: 1250,
      isFollowing: true,
    },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'follow-2',
    userId: 'user-current',
    targetId: 'user-003',
    target: {
      id: 'user-003',
      username: 'alice_wonder',
      nickname: '爱丽丝',
      avatar: getUserAvatarUrl('alice'),
      bio: '热爱阅读的文艺青年',
      followerCount: 856,
      isFollowing: true,
    },
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

/**
 * 粉丝列表
 */
export const followersList = [
  {
    id: 'follower-1',
    userId: 'user-101',
    targetId: 'user-current',
    follower: {
      id: 'user-101',
      username: 'fan_001',
      nickname: '忠实粉丝',
      avatar: getUserAvatarUrl('fan1'),
      bio: '你的忠实读者',
      followerCount: 120,
      isFollowing: false,
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'follower-2',
    userId: 'user-102',
    targetId: 'user-current',
    follower: {
      id: 'user-102',
      username: 'reader_2024',
      nickname: '书虫',
      avatar: getUserAvatarUrl('reader1'),
      bio: '每天读一点',
      followerCount: 45,
      isFollowing: true,
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

/**
 * 私信列表
 */
export const messagesList = [
  {
    id: 'msg-1',
    fromUserId: 'user-002',
    toUserId: 'user-current',
    fromUser: {
      id: 'user-002',
      username: 'testauthor001',
      nickname: '签约作者',
      avatar: getUserAvatarUrl('author1'),
    },
    content: '感谢您的支持！新章节正在努力创作中~',
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-2',
    fromUserId: 'user-101',
    toUserId: 'user-current',
    fromUser: {
      id: 'user-101',
      username: 'fan_001',
      nickname: '忠实粉丝',
      avatar: getUserAvatarUrl('fan1'),
    },
    content: '期待您的下一部作品！',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

/**
 * 私信会话
 */
export const conversations = [
  {
    id: 'conv-1',
    targetUser: {
      id: 'user-002',
      username: 'testauthor001',
      nickname: '签约作者',
      avatar: getUserAvatarUrl('author1'),
    },
    lastMessage: '感谢您的支持！新章节正在努力创作中~',
    unreadCount: 1,
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'conv-2',
    targetUser: {
      id: 'user-101',
      username: 'fan_001',
      nickname: '忠实粉丝',
      avatar: getUserAvatarUrl('fan1'),
    },
    lastMessage: '期待您的下一部作品！',
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

/**
 * 通知列表
 */
export const notificationsList = [
  {
    id: 'notif-1',
    type: 'system',
    title: '系统维护通知',
    content: '系统将于今晚23:00-次日02:00进行维护升级',
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-2',
    type: 'social',
    title: '新增粉丝',
    content: '用户"忠实粉丝"关注了你',
    isRead: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-3',
    type: 'book',
    title: '书籍更新',
    content: '您关注的《星河骑士》更新了第157章',
    isRead: true,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-4',
    type: 'income',
    title: '收入到账',
    content: '您的作品收入+30.00元已到账',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
]

// ==================== 发现模块数据 ====================

/**
 * 发现页推荐
 */
export const discoveryContent = {
  featured: recommendedBooks.slice(0, 3),
  categories: [
    { id: 'cat-1', name: '玄幻', count: 12560, icon: '🌟' },
    { id: 'cat-2', name: '言情', count: 8950, icon: '💕' },
    { id: 'cat-3', name: '都市', count: 6780, icon: '🏙️' },
    { id: 'cat-4', name: '科幻', count: 4520, icon: '🚀' },
    { id: 'cat-5', name: '武侠', count: 3890, icon: '⚔️' },
    { id: 'cat-6', name: '悬疑', count: 2340, icon: '🔍' },
  ],
  topics: [
    { id: 'topic-1', title: '本周热门', books: recommendedBooks },
    { id: 'topic-2', title: '新人推荐', books: rankings.newbie },
    {
      id: 'topic-3',
      title: '完本精选',
      books: recommendedBooks.filter((b) => b.status === 'completed'),
    },
  ],
}

// ==================== 阅读统计模块数据 ====================

/**
 * 阅读统计
 */
export const readingStats = {
  totalReadingTime: 45600, // 分钟
  totalWords: 12500000,
  totalBooks: 89,
  totalChapters: 2340,
  dailyStats: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    readingTime: Math.floor(Math.random() * 180) + 30,
    chapters: Math.floor(Math.random() * 10) + 1,
    words: Math.floor(Math.random() * 50000) + 5000,
  })),
  weeklyStats: {
    monday: 120,
    tuesday: 95,
    wednesday: 150,
    thursday: 80,
    friday: 110,
    saturday: 200,
    sunday: 180,
  },
  preferences: {
    favoriteCategories: ['玄幻', '科幻', '都市'],
    readingPeakHours: [21, 22, 23],
    averageSessionDuration: 45,
  },
}

// ==================== 导出 ====================

export default {
  // 书城模块
  homepageBanners,
  homepageStats,
  recommendedBooks,
  rankings,
  bookChapters,

  // 创作中心
  writerProjects,

  // 社区模块
  communityPosts,

  // 用户中心
  userProfile,
  userBookshelf,
  userWallet,

  // 管理员模块
  adminUsers,
  auditTasks,
  systemConfig,

  // 财务模块
  walletDetail,
  withdrawRecords,
  incomeStats,
  transactionRecords,

  // 社交模块
  followingList,
  followersList,
  messagesList,
  conversations,
  notificationsList,

  // 发现模块
  discoveryContent,

  // 阅读统计模块
  readingStats,
}
