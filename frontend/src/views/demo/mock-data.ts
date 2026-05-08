/**
 * Mock 数据文件
 * 用于 TypeScript 修复验证 Demo
 */

import type { Comment, ParagraphComment, ParagraphCommentSummary, ShelfBook } from '../../types/reader'
import type { ReviewItem } from '@/modules/admin/types/admin.types'
import type { Transaction, WalletBalance } from '@/modules/user/types/user.types'
import type { Project } from '@/modules/writer/types/project'
import { ProjectStatus, Visibility } from '@/modules/writer/types/project'

// ==================== Reader 模块数据 ====================

/**
 * 评论 Mock 数据
 */
export const comments: Comment[] = [
  {
    id: 'comment-001',
    bookId: 'book-001',
    chapterId: 'chapter-001',
    userId: 'user-001',
    user: {
      id: 'user-001',
      username: 'alice_wonder',
      nickname: '爱丽丝',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
      level: 5
    },
    content: '这一章写得真好，特别是对话部分，非常生动！期待下一章喵~',
    rating: 5,
    likeCount: 42,
    isLiked: true,
    replyCount: 3,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    replies: [
      {
        id: 'comment-002',
        bookId: 'book-001',
        chapterId: 'chapter-001',
        userId: 'user-002',
        user: {
          id: 'user-002',
          username: 'bob_builder',
          nickname: '鲍勃',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
          level: 3
        },
        content: '同意！作者大大加油！',
        likeCount: 8,
        isLiked: false,
        replyCount: 0,
        createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'comment-003',
    bookId: 'book-001',
    chapterId: 'chapter-001',
    userId: 'user-003',
    user: {
      id: 'user-003',
      username: 'charlie_chef',
      nickname: '查理大厨',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
      level: 8
    },
    content: '剧情发展太快了，希望能慢一点，多描写一些细节。',
    rating: 4,
    likeCount: 15,
    isLiked: false,
    replyCount: 1,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'comment-004',
    bookId: 'book-001',
    chapterId: 'chapter-002',
    userId: 'user-004',
    user: {
      id: 'user-004',
      username: 'diana_dancer',
      nickname: '戴安娜',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana',
      level: 2
    },
    content: '这个反转太精彩了！完全没有猜到！',
    likeCount: 28,
    isLiked: true,
    replyCount: 5,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'comment-005',
    bookId: 'book-002',
    userId: 'user-005',
    user: {
      id: 'user-005',
      username: 'evan_engineer',
      nickname: '埃文工程师',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Evan',
      level: 6
    },
    content: '这本书的世界观设定很有意思，希望能展开更多背景设定。',
    rating: 5,
    likeCount: 56,
    isLiked: false,
    replyCount: 8,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'comment-006',
    bookId: 'book-002',
    userId: 'user-006',
    user: {
      id: 'user-006',
      username: 'fiona_artist',
      nickname: '菲菲画家',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fiona',
      level: 4
    },
    content: '人物塑造很成功，每个角色都有鲜明的个性。',
    likeCount: 33,
    isLiked: true,
    replyCount: 2,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'comment-007',
    bookId: 'book-003',
    chapterId: 'chapter-001',
    userId: 'user-007',
    user: {
      id: 'user-007',
      username: 'george_gamer',
      nickname: '乔治玩家',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=George',
      level: 7
    },
    content: '看完这一章，感觉心情很复杂，作者大大太会写感情戏了！',
    rating: 5,
    likeCount: 71,
    isLiked: false,
    replyCount: 12,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'comment-008',
    bookId: 'book-003',
    userId: 'user-008',
    user: {
      id: 'user-008',
      username: 'hanna_hiker',
      nickname: '汉娜徒步者',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hanna',
      level: 1
    },
    content: '新人报到！刚发现这本书，正在追更，好看！',
    likeCount: 12,
    isLiked: true,
    replyCount: 3,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  }
]

/**
 * 书架 Mock 数据
 */
export const bookshelf: ShelfBook[] = [
  {
    id: 'shelf-001',
    userId: 'user-current',
    bookId: 'book-001',
    book: {
      id: 'book-001',
      title: '星河骑士',
      author: '猫妖大人',
      cover: '',
      categoryName: '科幻',
      status: 'serializing',
      wordCount: 580000,
      rating: 4.5,
      viewCount: 10000,
      description: '在遥远的未来，人类已经征服了星辰大海...'
    },
    lastReadChapterId: 'chapter-050',
    lastReadChapterTitle: '第五十章：星际跃迁',
    progress: 65.5,
    addTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updateTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'shelf-002',
    userId: 'user-current',
    bookId: 'book-002',
    book: {
      id: 'book-002',
      title: '青羽物语',
      author: '樱花飘落',
      cover: '',
      categoryName: '奇幻',
      status: 'completed',
      wordCount: 1200000,
      rating: 4.8,
      viewCount: 25000,
      description: '一个关于成长、友情和冒险的故事...'
    },
    lastReadChapterId: 'chapter-120',
    lastReadChapterTitle: '第一百二十章：新的开始',
    progress: 100,
    addTime: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updateTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'shelf-003',
    userId: 'user-current',
    bookId: 'book-003',
    book: {
      id: 'book-003',
      title: '剑道独尊',
      author: '墨客',
      cover: '',
      categoryName: '武侠',
      status: 'serializing',
      wordCount: 890000,
      rating: 4.3,
      viewCount: 15000,
      description: '少年剑客的成长之路...'
    },
    lastReadChapterId: 'chapter-088',
    lastReadChapterTitle: '第八十八章：突破',
    progress: 42.8,
    addTime: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updateTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'shelf-004',
    userId: 'user-current',
    bookId: 'book-004',
    book: {
      id: 'book-004',
      title: '甜点日记',
      author: '糖豆豆',
      cover: '',
      categoryName: '都市',
      status: 'serializing',
      wordCount: 350000,
      rating: 4.6,
      viewCount: 8000,
      description: '一家温馨的甜品店，一段甜蜜的爱情...'
    },
    lastReadChapterId: 'chapter-035',
    lastReadChapterTitle: '第三十五章：新品发布',
    progress: 78.2,
    addTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updateTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'shelf-005',
    userId: 'user-current',
    bookId: 'book-005',
    book: {
      id: 'book-005',
      title: '深海秘境',
      author: '海洋之子',
      cover: '',
      categoryName: '冒险',
      status: 'serializing',
      wordCount: 670000,
      rating: 4.2,
      viewCount: 12000,
      description: '探索深海中的未知世界...'
    },
    lastReadChapterId: 'chapter-055',
    lastReadChapterTitle: '第五十五章：海底古城',
    progress: 23.5,
    addTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updateTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'shelf-006',
    userId: 'user-current',
    bookId: 'book-006',
    book: {
      id: 'book-006',
      title: '时光旅行者',
      author: '时间领主',
      cover: '',
      categoryName: '科幻',
      status: 'serializing',
      wordCount: 450000,
      rating: 4.4,
      viewCount: 9500,
      description: '穿越时空的冒险故事...'
    },
    lastReadChapterId: 'chapter-022',
    lastReadChapterTitle: '第二十二章：古代文明',
    progress: 12.0,
    addTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updateTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  }
]

/**
 * 段落评论 Mock 数据
 */
export const paragraphComments: ParagraphComment[] = [
  {
    id: 'para-comment-001',
    paragraphId: 'para-001',
    chapterId: 'chapter-001',
    paragraphIndex: 15,
    userId: 'user-001',
    username: 'alice_wonder',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    content: '这段描写太感人了！',
    emoji: '😭',
    likes: 24,
    likedByMe: true,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    id: 'para-comment-002',
    paragraphId: 'para-002',
    chapterId: 'chapter-001',
    paragraphIndex: 28,
    userId: 'user-002',
    username: 'bob_builder',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    emoji: '😂',
    likes: 18,
    likedByMe: false,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
  },
  {
    id: 'para-comment-003',
    paragraphId: 'para-003',
    chapterId: 'chapter-002',
    paragraphIndex: 8,
    userId: 'user-003',
    username: 'charlie_chef',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
    content: '这个伏笔埋得好！',
    emoji: '👍',
    likes: 31,
    likedByMe: true,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  }
]

/**
 * 段落评论摘要 Mock 数据
 */
export const paragraphCommentSummaries: ParagraphCommentSummary[] = [
  {
    paragraphId: 'para-001',
    commentCount: 12,
    latestComment: {
      content: '这段描写太感人了！',
      username: '爱丽丝',
      time: new Date(Date.now() - 10 * 60 * 1000).toISOString()
    }
  },
  {
    paragraphId: 'para-002',
    commentCount: 8,
    latestComment: {
      content: '哈哈笑死我了',
      username: '鲍勃',
      time: new Date(Date.now() - 25 * 60 * 1000).toISOString()
    }
  },
  {
    paragraphId: 'para-003',
    commentCount: 5
  }
]

// ==================== Admin 模块数据 ====================

/**
 * 待审核内容 Mock 数据
 */
export const pendingReviews: ReviewItem[] = [
  {
    id: 'review-001',
    type: 'book',
    contentId: 'book-new-001',
    title: '星际战甲',
    authorId: 'author-001',
    authorName: '星空漫步者',
    content: '在未来的星际时代，人类与外星种族的战争已经持续了百年...',
    status: 'pending',
    submitTime: Math.floor(Date.now() / 1000) - 2 * 60 * 60
  },
  {
    id: 'review-002',
    type: 'chapter',
    contentId: 'chapter-new-001',
    title: '第一百二十章：最终决战',
    authorId: 'author-002',
    authorName: '剑客小李',
    status: 'pending',
    submitTime: Math.floor(Date.now() / 1000) - 4 * 60 * 60
  },
  {
    id: 'review-003',
    type: 'comment',
    contentId: 'comment-report-001',
    title: '举报评论 #45231',
    authorId: 'user-001',
    authorName: '正义路人',
    content: '该评论包含不当言论，违反社区规范',
    status: 'pending',
    submitTime: Math.floor(Date.now() / 1000) - 6 * 60 * 60
  },
  {
    id: 'review-004',
    type: 'book',
    contentId: 'book-new-002',
    title: '魔法学院日记',
    authorId: 'author-003',
    authorName: '魔法师小美',
    content: '讲述一个普通女孩进入魔法学院后的成长故事...',
    status: 'pending',
    submitTime: Math.floor(Date.now() / 1000) - 8 * 60 * 60
  },
  {
    id: 'review-005',
    type: 'chapter',
    contentId: 'chapter-new-002',
    title: '第五十五章：真相大白',
    authorId: 'author-004',
    authorName: '悬疑大师',
    status: 'pending',
    submitTime: Math.floor(Date.now() / 1000) - 12 * 60 * 60
  },
  {
    id: 'review-006',
    type: 'book',
    contentId: 'book-new-003',
    title: '赛博朋克2077：边缘行者',
    authorId: 'author-005',
    authorName: '夜之城客',
    content: '在夜之城的边缘，一群边缘行者为了生存而战斗...',
    status: 'pending',
    submitTime: Math.floor(Date.now() / 1000) - 24 * 60 * 60
  },
  {
    id: 'review-007',
    type: 'comment',
    contentId: 'comment-report-002',
    title: '举报评论 #89562',
    authorId: 'user-002',
    authorName: '热心读者',
    content: '该评论涉嫌剧透，请处理',
    status: 'pending',
    submitTime: Math.floor(Date.now() / 1000) - 36 * 60 * 60
  },
  {
    id: 'review-008',
    type: 'chapter',
    contentId: 'chapter-new-003',
    title: '第八章：初遇',
    authorId: 'author-006',
    authorName: '浪漫诗人',
    status: 'pending',
    submitTime: Math.floor(Date.now() / 1000) - 48 * 60 * 60
  }
]

// ==================== User 模块数据 ====================

/**
 * 交易记录 Mock 数据
 */
export const transactions: Transaction[] = [
  {
    id: 'tx-001',
    userId: 'user-current',
    type: 'recharge',
    amount: 10000, // 100元
    balance: 10500,
    status: 'completed',
    description: '账户充值',
    createTime: Math.floor(Date.now() / 1000) - 10 * 60,
    completeTime: Math.floor(Date.now() / 1000) - 8 * 60
  },
  {
    id: 'tx-002',
    userId: 'user-current',
    type: 'purchase',
    amount: 300, // 3元
    balance: 10200,
    status: 'completed',
    description: '购买章节：星河骑士 第五十一章',
    createTime: Math.floor(Date.now() / 1000) - 30 * 60
  },
  {
    id: 'tx-003',
    userId: 'user-current',
    type: 'reward',
    amount: 500, // 5元
    balance: 9700,
    status: 'completed',
    description: '打赏：星河骑士',
    relatedId: 'book-001',
    createTime: Math.floor(Date.now() / 1000) - 2 * 60 * 60
  },
  {
    id: 'tx-004',
    userId: 'user-current',
    type: 'purchase',
    amount: 200, // 2元
    balance: 9500,
    status: 'completed',
    description: '购买章节：青羽物语 第一百一十章',
    createTime: Math.floor(Date.now() / 1000) - 5 * 60 * 60
  },
  {
    id: 'tx-005',
    userId: 'user-current',
    type: 'income',
    amount: 1500, // 15元
    balance: 9700,
    status: 'completed',
    description: '打赏收入',
    createTime: Math.floor(Date.now() / 1000) - 24 * 60 * 60
  },
  {
    id: 'tx-006',
    userId: 'user-current',
    type: 'recharge',
    amount: 5000, // 50元
    balance: 8200,
    status: 'completed',
    description: '账户充值',
    createTime: Math.floor(Date.now() / 1000) - 48 * 60 * 60,
    completeTime: Math.floor(Date.now() / 1000) - 47 * 60 * 60
  },
  {
    id: 'tx-007',
    userId: 'user-current',
    type: 'purchase',
    amount: 800, // 8元
    balance: 7400,
    status: 'completed',
    description: '购买章节：剑道独尊 完本卷',
    createTime: Math.floor(Date.now() / 1000) - 72 * 60 * 60
  },
  {
    id: 'tx-008',
    userId: 'user-current',
    type: 'reward',
    amount: 1000, // 10元
    balance: 6400,
    status: 'completed',
    description: '打赏：剑道独尊',
    relatedId: 'book-003',
    createTime: Math.floor(Date.now() / 1000) - 96 * 60 * 60
  },
  {
    id: 'tx-009',
    userId: 'user-current',
    type: 'withdraw',
    amount: 5000, // 50元
    balance: 11400,
    status: 'completed',
    description: '提现到支付宝',
    createTime: Math.floor(Date.now() / 1000) - 120 * 60 * 60,
    completeTime: Math.floor(Date.now() / 1000) - 115 * 60 * 60
  },
  {
    id: 'tx-010',
    userId: 'user-current',
    type: 'income',
    amount: 2500, // 25元
    balance: 6400,
    status: 'completed',
    description: '章节订阅收入',
    createTime: Math.floor(Date.now() / 1000) - 144 * 60 * 60
  },
  {
    id: 'tx-011',
    userId: 'user-current',
    type: 'purchase',
    amount: 150, // 1.5元
    balance: 6250,
    status: 'completed',
    description: '购买章节：甜点日记 第三十六章',
    createTime: Math.floor(Date.now() / 1000) - 168 * 60 * 60
  },
  {
    id: 'tx-012',
    userId: 'user-current',
    type: 'recharge',
    amount: 20000, // 200元
    balance: 18250,
    status: 'completed',
    description: '账户充值',
    createTime: Math.floor(Date.now() / 1000) - 192 * 60 * 60,
    completeTime: Math.floor(Date.now() / 1000) - 191 * 60 * 60
  }
]

/**
 * 钱包余额 Mock 数据
 */
export const wallet: WalletBalance = {
  userId: 'user-current',
  balance: 18250, // 182.5元
  frozenBalance: 500, // 5元
  totalIncome: 15000, // 150元
  totalExpense: 85000 // 850元
}

// ==================== Writer 模块数据 ====================

/**
 * 写作项目 Mock 数据
 */
export const projects: Project[] = [
  {
    id: 'project-001',
    authorId: 'user-current',
    projectId: 'project-001',
    title: '异界猫娘日常',
    summary: '讲述一只猫娘在异世界的日常生活，轻松、治愈、又带着一点点冒险的故事。',
    coverUrl: '',
    status: ProjectStatus.SERIALIZING,
    category: '奇幻',
    tags: ['猫娘', '日常', '治愈', '轻小说'],
    visibility: Visibility.PUBLIC,
    statistics: {
      totalWords: 158000,
      chapterCount: 42,
      documentCount: 50,
      lastUpdateAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    settings: {
      autoBackup: true,
      backupInterval: 300,
      wordCountGoal: 200000
    },
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    publishedAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'project-002',
    authorId: 'user-current',
    projectId: 'project-002',
    title: '赛博侦探社',
    summary: '在赛博朋克的世界里，一家不起眼的侦探社接手了一个改变世界的案件...',
    coverUrl: '',
    status: ProjectStatus.DRAFT,
    category: '科幻',
    tags: ['赛博朋克', '悬疑', '侦探'],
    visibility: Visibility.PRIVATE,
    statistics: {
      totalWords: 45000,
      chapterCount: 8,
      documentCount: 15,
      lastUpdateAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    settings: {
      autoBackup: true,
      backupInterval: 600
    },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'project-003',
    authorId: 'user-current',
    projectId: 'project-003',
    title: '古剑传说',
    summary: '一把上古神剑，一位落魄少年，一段传奇的冒险之旅。',
    coverUrl: '',
    status: ProjectStatus.COMPLETED,
    category: '武侠',
    tags: ['武侠', '冒险', '热血'],
    visibility: Visibility.PUBLIC,
    statistics: {
      totalWords: 520000,
      chapterCount: 156,
      documentCount: 180,
      lastUpdateAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
    },
    settings: {
      autoBackup: false,
      backupInterval: 0,
      wordCountGoal: 500000
    },
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt: new Date(Date.now() - 350 * 24 * 60 * 60 * 1000).toISOString()
  }
]

/**
 * 角色数据 Mock
 */
export const characters = [
  { id: 'char-001', name: '小雪', role: '主角' },
  { id: 'char-002', name: '喵呜', role: '主角' },
  { id: 'char-003', name: '艾莉丝', role: '配角' },
  { id: 'char-004', name: '店主婆婆', role: 'NPC' },
  { id: 'char-005', name: '暗影', role: '反派' }
]

/**
 * 大纲节点 Mock 数据
 */
export const outlineNodes = [
  {
    id: 'outline-001',
    title: '第一卷：初来乍到',
    level: 1,
    wordCount: 50000,
    status: 'completed' as const
  },
  {
    id: 'outline-002',
    title: '第一章：穿越了？',
    level: 2,
    wordCount: 3200,
    status: 'completed' as const
  },
  {
    id: 'outline-003',
    title: '第二章：猫耳和尾巴',
    level: 2,
    wordCount: 2800,
    status: 'completed' as const
  },
  {
    id: 'outline-004',
    title: '第三章：魔法学院',
    level: 2,
    wordCount: 3500,
    status: 'completed' as const
  },
  {
    id: 'outline-005',
    title: '第二卷：学院生活',
    level: 1,
    wordCount: 80000,
    status: 'in-progress' as const
  },
  {
    id: 'outline-006',
    title: '第十章：初次战斗',
    level: 2,
    wordCount: 4200,
    status: 'completed' as const
  },
  {
    id: 'outline-007',
    title: '第十一章：新的朋友',
    level: 2,
    wordCount: 3800,
    status: 'in-progress' as const
  },
  {
    id: 'outline-008',
    title: '第三卷：冒险开始',
    level: 1,
    wordCount: 0,
    status: 'in-progress' as const
  }
]

// ==================== 统一导出 ====================

export default {
  comments,
  bookshelf,
  paragraphComments,
  paragraphCommentSummaries,
  pendingReviews,
  transactions,
  wallet,
  projects,
  characters,
  outlineNodes
}
