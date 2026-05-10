/**
 * 统一 Mock 数据管理器
 *
 * 职责：
 * 1. 集中管理所有模块的 Mock 数据
 * 2. 根据请求 URL 返回对应的 Mock 数据
 * 3. 只在测试模式（?test=true）时使用
 * 4. 普通业务模式使用真实 API
 */

import { getWorkspaceMockProject } from '@/modules/writer/mock/workspaceMock'

function getBookCoverUrl(seed: string, category = 'writer'): string {
  return `https://picsum.photos/seed/${encodeURIComponent(`${category}-${seed}`)}/320/440`
}

// ==================== 类型定义 ====================

// ==================== 内存状态管理（用于数据联动） ====================

/**
 * 已发布章节
 */
interface PublishedChapter {
  _id: string
  chapterNumber: number
  title: string
  wordCount: number
  isFree: boolean
  price: number
  publishTime: string
  stats: { views: number }
}

/**
 * Mock 内存状态
 * 当前只服务 writer 工作区与读者侧演示数据的基础联动
 */
interface MockState {
  bookChapters: Map<string, PublishedChapter[]>
  writerCharacters: Map<string, Array<Record<string, any>>>
  writerCharacterRelations: Map<string, Array<Record<string, any>>>
  writerLocations: Map<string, Array<Record<string, any>>>
  writerDocumentContents: Map<
    string,
    { projectId: string; documentId: string; content: string; updatedAt: string }
  >
  storyHarnessBatches: Map<string, Record<string, any>>
  storyHarnessChangeRequests: Map<string, Array<Record<string, any>>>
}

const buildWriterDocumentContentKey = (projectId: string, documentId: string) =>
  `${projectId}:${documentId}`

const buildStoryHarnessStateKey = (projectId: string, chapterId: string) =>
  `${projectId}:${chapterId}`

function createSeedWriterCharacters(projectId: string) {
  const now = new Date().toISOString()
  return [
    {
      id: `${projectId}-char-linyi`,
      projectId,
      name: '林逸',
      alias: ['小逸'],
      summary: '云岚宗外门出身的主角，正处于破境前夜。',
      traits: ['克制', '坚韧'],
      background: '自幼在云岚宗长大，对宗门与秘境都怀有强烈执念。',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `${projectId}-char-suwan`,
      projectId,
      name: '苏晚晴',
      alias: ['晚晴'],
      summary: '负责接引新弟子的内门师姐，与主角早期互动密集。',
      traits: ['冷静', '谨慎'],
      background: '内门重点培养弟子，熟悉宗门规矩与山门布局。',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `${projectId}-char-guchangfeng`,
      projectId,
      name: '顾长风',
      alias: ['顾师兄'],
      summary: '内门锋芒最盛的年轻弟子之一，是主角的重要竞争对手。',
      traits: ['强势', '骄傲'],
      background: '出身世家，在宗门里拥有稳固的人脉与资源。',
      createdAt: now,
      updatedAt: now,
    },
  ]
}

function createSeedWriterCharacterRelations(projectId: string) {
  const now = new Date().toISOString()
  return [
    {
      id: `${projectId}-rel-1`,
      projectId,
      fromId: `${projectId}-char-linyi`,
      toId: `${projectId}-char-suwan`,
      type: '盟友',
      strength: 78,
      notes: '苏晚晴在入门阶段多次给予林逸指点。',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `${projectId}-rel-2`,
      projectId,
      fromId: `${projectId}-char-linyi`,
      toId: `${projectId}-char-guchangfeng`,
      type: '敌人',
      strength: 66,
      notes: '两人在资源争夺与晋升考核中逐步对立。',
      createdAt: now,
      updatedAt: now,
    },
  ]
}

function createSeedWriterLocations(projectId: string) {
  return [
    {
      id: `${projectId}-loc-sect`,
      projectId,
      name: '云岚宗',
      description: '主角最早修行的宗门，也是早期关系展开的核心空间。',
      climate: '山地云雾',
      culture: '宗门修行',
      geography: '群峰环绕',
      atmosphere: '清峻肃穆',
      parentId: '',
      imageUrl: '',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `${projectId}-loc-peak`,
      projectId,
      name: '云岚峰',
      description: '宗门主峰，重要对话和突破节点多发生于此。',
      climate: '高山寒雾',
      culture: '核心传承',
      geography: '主峰绝壁',
      atmosphere: '肃静庄严',
      parentId: `${projectId}-loc-sect`,
      imageUrl: '',
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `${projectId}-loc-market`,
      projectId,
      name: '青云坊市',
      description: '弟子往来频繁的交易坊市，可作为宗门外部事件节点。',
      climate: '平原温润',
      culture: '商贸往来',
      geography: '山门外围',
      atmosphere: '热闹喧杂',
      parentId: '',
      imageUrl: '',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]
}

function ensureWriterCharacters(projectId: string) {
  if (!mockState.writerCharacters.has(projectId)) {
    mockState.writerCharacters.set(projectId, createSeedWriterCharacters(projectId))
  }
  return mockState.writerCharacters.get(projectId) || []
}

function ensureWriterCharacterRelations(projectId: string) {
  if (!mockState.writerCharacterRelations.has(projectId)) {
    mockState.writerCharacterRelations.set(projectId, createSeedWriterCharacterRelations(projectId))
  }
  return mockState.writerCharacterRelations.get(projectId) || []
}

function ensureWriterLocations(projectId: string) {
  if (!mockState.writerLocations.has(projectId)) {
    mockState.writerLocations.set(projectId, createSeedWriterLocations(projectId))
  }
  return mockState.writerLocations.get(projectId) || []
}

function getWorkspaceMockDocumentMeta(projectId: string, documentId: string) {
  const mockProject = getWorkspaceMockProject(projectId)
  if (!mockProject) {
    return null
  }

  const doc = mockProject.docs.find((item) => item.id === documentId)
  if (doc) {
    return {
      title: doc.title,
      updatedAt: doc.updatedAt || new Date().toISOString(),
    }
  }

  const chapter = mockProject.chapters.find((item) => item.id === documentId)
  if (chapter) {
    return {
      title: chapter.title,
      updatedAt: chapter.updatedAt,
    }
  }

  return null
}

function ensureWriterDocumentContent(projectId: string, documentId: string) {
  const key = buildWriterDocumentContentKey(projectId, documentId)
  if (!mockState.writerDocumentContents.has(key)) {
    const mockProject = getWorkspaceMockProject(projectId)
    const seedContent = mockProject?.contentByDocId?.[documentId] || ''
    mockState.writerDocumentContents.set(key, {
      projectId,
      documentId,
      content: seedContent,
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    mockState.writerDocumentContents.get(key) || {
      projectId,
      documentId,
      content: '',
      updatedAt: new Date().toISOString(),
    }
  )
}

function updateWriterDocumentContent(projectId: string, documentId: string, content: string) {
  const nextRecord = {
    projectId,
    documentId,
    content,
    updatedAt: new Date().toISOString(),
  }
  mockState.writerDocumentContents.set(
    buildWriterDocumentContentKey(projectId, documentId),
    nextRecord,
  )
  return nextRecord
}

function buildParagraphContents(documentId: string, content: string, updatedAt: string) {
  const blocks = content
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean)

  const normalizedBlocks = blocks.length > 0 ? blocks : ['']

  return normalizedBlocks.map((block, index) => ({
    paragraphId: `${documentId}-p-${index + 1}`,
    order: index + 1,
    content: block,
    contentType: 'markdown',
    version: 1,
    updatedAt,
  }))
}

function getStoryHarnessChangeRequests(projectId: string, chapterId: string) {
  return (
    mockState.storyHarnessChangeRequests.get(buildStoryHarnessStateKey(projectId, chapterId)) || []
  )
}

function setStoryHarnessChangeRequests(
  projectId: string,
  chapterId: string,
  changeRequests: Array<Record<string, any>>,
) {
  mockState.storyHarnessChangeRequests.set(
    buildStoryHarnessStateKey(projectId, chapterId),
    changeRequests,
  )
  return changeRequests
}

function getStoryHarnessBatch(projectId: string, chapterId: string) {
  return mockState.storyHarnessBatches.get(buildStoryHarnessStateKey(projectId, chapterId)) || null
}

function setStoryHarnessBatch(projectId: string, chapterId: string, batch: Record<string, any>) {
  mockState.storyHarnessBatches.set(buildStoryHarnessStateKey(projectId, chapterId), batch)
  return batch
}

function buildMockStoryHarnessChangeRequests(_projectId: string, chapterId: string) {
  const now = new Date().toISOString()
  const batchId = `mock-trigger:${chapterId}:${Date.now()}`

  return {
    batchId,
    items: [
      {
        id: `${chapterId}-cr-state-1`,
        batchId,
        chapterId,
        category: 'state',
        priority: 'high',
        status: 'pending',
        title: '正文指令建议：同步周德厚对林砚的戒备',
        description: '正文备注已经明确角色态度变化，建议把周德厚的对外信息策略调整为更克制。',
        suggestedChange: {
          entityType: 'character',
          entityName: '周德厚',
          field: 'current_state',
        },
        evidence: [
          {
            documentId: chapterId,
            paragraphIdx: 4,
            quoteText: '// @周德厚 对林砚起疑，暂不再公开交付关键情报。',
          },
        ],
        source: 'mock_story_harness',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `${chapterId}-cr-relation-1`,
        batchId,
        chapterId,
        category: 'relation',
        priority: 'medium',
        status: 'pending',
        title: '关系建议：提升林砚与周德厚之间的试探张力',
        description: '当前章节已经形成明显的相互试探，建议补一条关系侧正式建议，便于后续承接。',
        suggestedChange: {
          entityType: 'relation',
          fromName: '林砚',
          toName: '周德厚',
          type: '试探',
        },
        evidence: [
          {
            documentId: chapterId,
            paragraphIdx: 3,
            quoteText: '林砚离开听雨斋前，忽然意识到周先生并没有把所有话说完。',
          },
        ],
        source: 'mock_story_harness',
        createdAt: now,
        updatedAt: now,
      },
    ],
  }
}

function buildStoryHarnessContext(projectId: string, chapterId: string) {
  const pendingCount = getStoryHarnessChangeRequests(projectId, chapterId).filter(
    (item) => item.status === 'pending',
  ).length

  return {
    characters: [
      {
        id: `${projectId}-char-linyi`,
        name: '林砚',
        alias: ['林公子'],
        traits: ['沉稳', '敏锐'],
        currentState: '对周德厚的言外之意产生警惕',
        shortDescription: '云岚城暗线中的观察者，开始主动辨别他人试探。',
      },
      {
        id: `${projectId}-char-zhoudehou`,
        name: '周德厚',
        alias: ['周先生'],
        traits: ['克制', '老练'],
        currentState: '对林砚起疑，暂缓继续公开交付关键情报',
        shortDescription: '听雨斋里掌握线索的关键人物，当前进入审慎观察阶段。',
      },
    ],
    relations: [
      {
        id: `${projectId}-rel-linyan-zhoudehou`,
        fromId: `${projectId}-char-linyi`,
        toId: `${projectId}-char-zhoudehou`,
        fromName: '林砚',
        toName: '周德厚',
        type: '试探',
        strength: 72,
        notes: '双方都意识到对方并未交底，关系从单向求助转为相互试探。',
      },
    ],
    pendingCRs: pendingCount,
  }
}

function parseMockBody(data: unknown) {
  if (!data) return {}
  if (typeof data === 'string') {
    try {
      return JSON.parse(data)
    } catch {
      return {}
    }
  }
  if (typeof data === 'object') {
    return data as Record<string, any>
  }
  return {}
}

// 初始化内存状态
const mockState: MockState = {
  bookChapters: new Map([
    // 云岚纪事的初始章节（读者端可见）
    [
      'project-yljs-1',
      [
        {
          _id: 'chapter-yljs-1',
          chapterNumber: 1,
          title: '第一章：云岚初遇',
          wordCount: 3200,
          isFree: true,
          price: 0,
          publishTime: '2024-01-15T08:00:00Z',
          stats: { views: 1520 },
        },
        {
          _id: 'chapter-yljs-2',
          chapterNumber: 2,
          title: '第二章：入门修行',
          wordCount: 2800,
          isFree: true,
          price: 0,
          publishTime: '2024-01-18T08:00:00Z',
          stats: { views: 1230 },
        },
        {
          _id: 'chapter-yljs-3',
          chapterNumber: 3,
          title: '第三章：突破筑基',
          wordCount: 3500,
          isFree: true,
          price: 0,
          publishTime: '2024-01-22T08:00:00Z',
          stats: { views: 980 },
        },
      ],
    ],
  ]),
  writerCharacters: new Map([['project-yljs-1', createSeedWriterCharacters('project-yljs-1')]]),
  writerCharacterRelations: new Map([
    ['project-yljs-1', createSeedWriterCharacterRelations('project-yljs-1')],
  ]),
  writerLocations: new Map([['project-yljs-1', createSeedWriterLocations('project-yljs-1')]]),
  writerDocumentContents: new Map(),
  storyHarnessBatches: new Map(),
  storyHarnessChangeRequests: new Map(),
}

/**
 * 重置 Mock 状态（用于测试）
 */
export function resetMockState(): void {
  mockState.bookChapters = new Map([
    [
      'project-yljs-1',
      [
        {
          _id: 'chapter-yljs-1',
          chapterNumber: 1,
          title: '第一章：云岚初遇',
          wordCount: 3200,
          isFree: true,
          price: 0,
          publishTime: '2024-01-15T08:00:00Z',
          stats: { views: 1520 },
        },
        {
          _id: 'chapter-yljs-2',
          chapterNumber: 2,
          title: '第二章：入门修行',
          wordCount: 2800,
          isFree: true,
          price: 0,
          publishTime: '2024-01-18T08:00:00Z',
          stats: { views: 1230 },
        },
        {
          _id: 'chapter-yljs-3',
          chapterNumber: 3,
          title: '第三章：突破筑基',
          wordCount: 3500,
          isFree: true,
          price: 0,
          publishTime: '2024-01-22T08:00:00Z',
          stats: { views: 980 },
        },
      ],
    ],
  ])
  mockState.writerCharacters = new Map([
    ['project-yljs-1', createSeedWriterCharacters('project-yljs-1')],
  ])
  mockState.writerCharacterRelations = new Map([
    ['project-yljs-1', createSeedWriterCharacterRelations('project-yljs-1')],
  ])
  mockState.writerLocations = new Map([
    ['project-yljs-1', createSeedWriterLocations('project-yljs-1')],
  ])
  mockState.writerDocumentContents = new Map()
  mockState.storyHarnessBatches = new Map()
  mockState.storyHarnessChangeRequests = new Map()
}

/**
 * 获取当前 Mock 状态（用于调试）
 */
export function getMockState(): Readonly<MockState> {
  return mockState
}

export interface MockResponse {
  code: number
  message: string
  data: any
  timestamp?: number
}

interface MockRequestOptions {
  method?: string
  params?: Record<string, any>
  data?: unknown
}

// ==================== 工具函数 ====================

let forcedTestMode = false

/**
 * 检测当前是否处于测试模式
 */
export function isInTestMode(): boolean {
  if (forcedTestMode) return true
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('test') === 'true'
}

export function setForcedTestMode(enabled: boolean): void {
  forcedTestMode = enabled
}

/**
 * 模拟网络延迟
 */
function mockDelay(): Promise<void> {
  const delay = 100 + Math.random() * 200
  return new Promise((resolve) => setTimeout(resolve, delay))
}

/**
 * 创建标准 Mock 响应
 */
function createMockResponse(data: any, code = 200, message = 'success'): MockResponse {
  return {
    code,
    message,
    data,
    timestamp: Date.now(),
  }
}

const MOCK_CATEGORY_TREE = [
  {
    _id: 'cat-1',
    name: '科幻',
    slug: 'scifi',
    children: [
      { _id: 'cat-1-1', name: '星际科幻', slug: 'interstellar' },
      { _id: 'cat-1-2', name: '时空穿梭', slug: 'time-travel' },
    ],
  },
  {
    _id: 'cat-2',
    name: '奇幻',
    slug: 'fantasy',
    children: [
      { _id: 'cat-2-1', name: '东方玄幻', slug: 'eastern' },
      { _id: 'cat-2-2', name: '西方奇幻', slug: 'western' },
    ],
  },
  {
    _id: 'cat-3',
    name: '都市',
    slug: 'city',
    children: [
      { _id: 'cat-3-1', name: '都市生活', slug: 'life' },
      { _id: 'cat-3-2', name: '都市异能', slug: 'ability' },
    ],
  },
  {
    _id: 'cat-4',
    name: '仙侠',
    slug: 'xianxia',
    children: [
      { _id: 'cat-4-1', name: '古典仙侠', slug: 'classic' },
      { _id: 'cat-4-2', name: '现代修真', slug: 'modern' },
    ],
  },
  {
    _id: 'cat-5',
    name: '游戏',
    slug: 'game',
    children: [
      { _id: 'cat-5-1', name: '虚拟网游', slug: 'online' },
      { _id: 'cat-5-2', name: '游戏异界', slug: 'isekai' },
    ],
  },
] as const

type MockLeafCategory = {
  _id: string
  name: string
  slug: string
}

const MOCK_LEAF_CATEGORIES: MockLeafCategory[] = MOCK_CATEGORY_TREE.flatMap(
  (item) => item.children as readonly MockLeafCategory[],
)
const MOCK_BOOK_POOL_SIZE = 360
const MOCK_TAG_POOL = [
  '热血',
  '玄幻',
  '修仙',
  '都市',
  '科幻',
  '冒险',
  '机甲',
  '悬疑',
  '言情',
  '治愈',
]

const CATEGORY_TAG_MAP: Record<string, string[]> = {
  'cat-1-1': ['科幻', '机甲', '冒险'],
  'cat-1-2': ['科幻', '悬疑', '冒险'],
  'cat-2-1': ['玄幻', '热血', '冒险'],
  'cat-2-2': ['玄幻', '言情', '冒险'],
  'cat-3-1': ['都市', '治愈', '言情'],
  'cat-3-2': ['都市', '热血', '悬疑'],
  'cat-4-1': ['修仙', '玄幻', '热血'],
  'cat-4-2': ['修仙', '都市', '悬疑'],
  'cat-5-1': ['冒险', '热血', '都市'],
  'cat-5-2': ['冒险', '玄幻', '科幻'],
}

const CATEGORY_TITLE_CORES: Record<string, string[]> = {
  'cat-1-1': [
    '星河骑士',
    '深空余烬',
    '银河哨兵',
    '天穹舰队',
    '零号跃迁',
    '黑域灯塔',
    '环轨遗民',
    '远星守望',
  ],
  'cat-1-2': [
    '逆时旅者',
    '钟摆尽头',
    '昨日回声',
    '时间褶皱',
    '裂隙档案',
    '平行归途',
    '未来备忘录',
    '因果边界',
  ],
  'cat-2-1': [
    '剑道独尊',
    '苍穹道印',
    '龙渊战歌',
    '九天神纹',
    '万象天书',
    '太古星宫',
    '灵墟剑主',
    '云荒圣域',
  ],
  'cat-2-2': [
    '龙血誓约',
    '银月王庭',
    '风暴巫歌',
    '黎明远征',
    '圣辉边境',
    '黑森林秘闻',
    '群岛法典',
    '王城余火',
  ],
  'cat-3-1': [
    '甜点日记',
    '雨巷旧梦',
    '烟火人间',
    '清晨地铁线',
    '微光咖啡馆',
    '日落便利店',
    '城市折页',
    '慢热心事',
  ],
  'cat-3-2': [
    '赛博侦探社',
    '都市仙尊',
    '夜行异闻录',
    '霓虹档案局',
    '零度共振',
    '超感回路',
    '异能法则',
    '城市暗面',
  ],
  'cat-4-1': [
    '青羽物语',
    '昆仑问道',
    '太乙山河',
    '剑开天门',
    '浮生道卷',
    '长生碑录',
    '灵霄古道',
    '青冥仙图',
  ],
  'cat-4-2': [
    '现代修真录',
    '灵气复苏后',
    '校园炼气士',
    '都市问道录',
    '地铁飞剑客',
    '公司有剑仙',
    '晨会御剑术',
    '高楼渡劫记',
  ],
  'cat-5-1': [
    '网游之神级牧师',
    '虚拟王座',
    '全服公告后',
    '神域开荒团',
    '终极副本线',
    '新手村传奇',
    '战术指挥官',
    '排行榜风云',
  ],
  'cat-5-2': [
    '异界龙骑',
    '开局降临异界',
    '游戏异世录',
    '存档重启后',
    '王都任务簿',
    '勇者补完计划',
    '地下城边疆',
    '传送门彼岸',
  ],
}

const TITLE_SUFFIXES = [
  '黎明协议',
  '边境迷航',
  '灰烬纪元',
  '冰海坐标',
  '沉默法则',
  '终局序章',
  '回响之城',
  '裂隙之外',
  '最后一站',
  '雾港来信',
  '逆光远征',
  '失落航道',
  '风暴前夜',
  '白夜备忘',
  '群星见证',
]

function buildMockBookTitle(index: number, categoryId: string): string {
  const categoryIndex = index % MOCK_LEAF_CATEGORIES.length
  const round = Math.floor(index / MOCK_LEAF_CATEGORIES.length)
  const cores = CATEGORY_TITLE_CORES[categoryId] || ['未知书名']
  const core = cores[round % cores.length]
  const suffix = TITLE_SUFFIXES[(round * 3 + categoryIndex) % TITLE_SUFFIXES.length]

  return `${core}·${suffix}`
}

// ==================== 书城模块 Mock 数据 ====================

/**
 * 首页数据 Mock
 */
function getHomepageData(): MockResponse {
  return createMockResponse({
    stats: {
      totalBooks: 125680,
      ongoingBooks: 32850,
      totalAuthors: 15620,
      todayUpdate: 2850,
    },
    banners: [
      {
        id: 'banner-1',
        title: '2024年度精选作品',
        subtitle: '发现最好的故事',
        image: '/images/banners/banner-1.svg',
        link: '/bookstore/browse?featured=true',
        order: 1,
      },
      {
        id: 'banner-2',
        title: '新人作家扶持计划',
        subtitle: '下一个大神就是你',
        image: '/images/banners/banner-2.svg',
        link: '/writer',
        order: 2,
      },
      {
        id: 'banner-3',
        title: '阅读挑战活动',
        subtitle: '完成任务赢好礼',
        image: '/images/banners/banner-3.svg',
        link: '/reading-stats',
        order: 3,
      },
    ],
    rankings: {
      realtime: generateRankingBooks('realtime'),
      weekly: generateRankingBooks('weekly'),
      monthly: generateRankingBooks('monthly'),
      newbie: generateRankingBooks('newbie'),
    },
    recommendedBooks: generateRecommendedBooks(8),
    featuredBooks: generateFeaturedBooks(5),
    categories: generateCategories(),
  })
}

/**
 * 公告数据 Mock
 */
function getAnnouncements(): MockResponse {
  return createMockResponse([
    {
      id: 'announce-1',
      content: '青羽书城全新升级，欢迎体验沉浸式阅读！',
      type: 'info',
      priority: 'high',
      createdAt: new Date().toISOString(),
    },
  ])
}

// ==================== 书籍数据生成器 ====================

function generateBook(
  index: number,
  _type: 'recommended' | 'featured' | 'ranking' = 'recommended',
) {
  const statuses = ['serializing', 'completed', 'paused']
  const authors = ['猫妖大人', '樱花飘落', '墨客', '糖豆豆', '龙傲天', '时光旅人']
  const category = MOCK_LEAF_CATEGORIES[index % MOCK_LEAF_CATEGORIES.length]
  const title = buildMockBookTitle(index, category._id)
  const categoryTags = CATEGORY_TAG_MAP[category._id] || ['冒险', '热血', '科幻']
  const baseTag = categoryTags[index % categoryTags.length]
  const secondaryTag = categoryTags[(index + 1) % categoryTags.length]
  const extraTag = MOCK_TAG_POOL[index % MOCK_TAG_POOL.length]

  return {
    _id: `book-${index + 1}`,
    id: `book-${index + 1}`,
    title,
    author: authors[index % authors.length],
    authorId: `author-${index + 1}`,
    cover: getBookCoverUrl(`book-${index + 1}`, category.name),
    coverUrl: getBookCoverUrl(`book-${index + 1}`, category.name),
    categoryName: category.name,
    categoryId: category._id,
    status: statuses[index % statuses.length],
    rating: 4 + Math.random(),
    ratingCount: Math.floor(Math.random() * 20000) + 1000,
    viewCount: Math.floor(Math.random() * 500000) + 10000,
    favoriteCount: Math.floor(Math.random() * 10000) + 500,
    wordCount: Math.floor(Math.random() * 1000000) + 50000,
    chapterCount: Math.floor(Math.random() * 300) + 20,
    description: `这是一本关于${title}的精彩故事，讲述了主人公在${category.name}世界中的冒险经历...`,
    tags: [baseTag, secondaryTag, extraTag].filter((tag, idx, arr) => arr.indexOf(tag) === idx),
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }
}

function generateRecommendedBooks(count: number) {
  return Array.from({ length: count }, (_, i) => generateBook(i, 'recommended'))
}

function generateFeaturedBooks(count: number) {
  return Array.from({ length: count }, (_, i) => generateBook(i + 10, 'featured'))
}

function generateRankingBooks(type: string) {
  const books = generateRecommendedBooks(10)
  return books.map((book, index) => ({
    ...book,
    rank: index + 1,
    rankingType: type,
    trend: Math.floor(Math.random() * 100) - 50,
  }))
}

function generateCategories() {
  return JSON.parse(JSON.stringify(MOCK_CATEGORY_TREE))
}

function filterAndPaginateBooks(
  source: ReturnType<typeof generateRecommendedBooks>,
  params: Record<string, any>,
  parsedUrl: URL,
) {
  const q = String(params.q || params.keyword || parsedUrl.searchParams.get('q') || '')
    .trim()
    .toLowerCase()
  const categoryId = String(
    params.categoryId ||
      params.category ||
      parsedUrl.searchParams.get('categoryId') ||
      parsedUrl.searchParams.get('category') ||
      '',
  ).trim()
  const status = String(params.status || parsedUrl.searchParams.get('status') || '').trim()
  const rawTags = params.tags || parsedUrl.searchParams.get('tags') || []
  const tags = Array.isArray(rawTags)
    ? rawTags.map(String)
    : String(rawTags)
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
  const page = Number(params.page || parsedUrl.searchParams.get('page') || 1)
  const size = Number(
    params.size ||
      params.pageSize ||
      parsedUrl.searchParams.get('size') ||
      parsedUrl.searchParams.get('pageSize') ||
      12,
  )

  const filteredBooks = source.filter((book) => {
    const keywordMatched =
      !q ||
      book.title.toLowerCase().includes(q) ||
      String(book.author || '')
        .toLowerCase()
        .includes(q)
    const categoryMatched =
      !categoryId || book.categoryId === categoryId || book.categoryId.startsWith(`${categoryId}-`)
    const statusMatched = !status || book.status === status
    const tagsMatched = tags.length === 0 || tags.every((tag) => book.tags.includes(tag))
    return keywordMatched && categoryMatched && statusMatched && tagsMatched
  })

  const start = Math.max(0, (page - 1) * size)
  const list = filteredBooks.slice(start, start + size)

  return {
    list,
    total: filteredBooks.length,
    page,
    size,
    hasNext: start + size < filteredBooks.length,
  }
}

// ==================== 创作中心 Mock 数据 ====================

function getWriterProjects(): MockResponse {
  const yunlanProject = {
    id: 'project-yljs-1',
    projectId: 'project-yljs-1',
    title: '云岚纪事',
    summary: '仙侠长篇，当前已编辑 3 章。',
    coverImage: getBookCoverUrl('project-yljs-1', '仙侠'),
    coverUrl: getBookCoverUrl('project-yljs-1', '仙侠'),
    status: 'serializing',
    category: '仙侠',
    tags: ['仙侠', '成长', '冒险'],
    totalWords: 9800,
    chapterCount: 3,
    lastUpdateTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    statistics: {
      totalWords: 9800,
      chapterCount: 3,
      lastUpdateAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
  }

  return createMockResponse({
    projects: [yunlanProject],
    list: [yunlanProject],
    total: 1,
  })
}

function getWriterProjectDetail(projectId: string): MockResponse {
  const projectsPayload = getWriterProjects().data as Record<string, any>
  const list = Array.isArray(projectsPayload.list)
    ? projectsPayload.list
    : Array.isArray(projectsPayload.projects)
      ? projectsPayload.projects
      : []
  const matched = list.find((item) => item.id === projectId || item.projectId === projectId) ||
    list[0] || {
      id: projectId,
      projectId,
      title: '未命名项目',
    }

  return createMockResponse(matched)
}

function getWriterProjectDocuments(projectId: string): MockResponse {
  const chapters = mockState.bookChapters.get(projectId) || []
  const documents = chapters.map((chapter, index) => ({
    id: chapter._id,
    documentId: chapter._id,
    projectId,
    parentId: `${projectId}-volume-1`,
    title: chapter.title,
    type: 'chapter',
    level: 1,
    order: chapter.chapterNumber || index + 1,
    status: 'completed',
    wordCount: chapter.wordCount,
    createdAt: chapter.publishTime,
    updatedAt: chapter.publishTime,
  }))

  return createMockResponse({
    documents,
    list: documents,
    total: documents.length,
  })
}

function getWriterProjectDocumentTree(projectId: string): MockResponse {
  const chapters = mockState.bookChapters.get(projectId) || []
  const rootNode = {
    id: `${projectId}-volume-1`,
    documentId: `${projectId}-volume-1`,
    projectId,
    parentId: '',
    title: '正文卷',
    type: 'volume',
    level: 0,
    order: 1,
    status: 'writing',
    wordCount: chapters.reduce((sum, chapter) => sum + (chapter.wordCount || 0), 0),
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    children: chapters.map((chapter, index) => ({
      id: chapter._id,
      documentId: chapter._id,
      projectId,
      parentId: `${projectId}-volume-1`,
      title: chapter.title,
      type: 'chapter',
      level: 1,
      order: chapter.chapterNumber || index + 1,
      status: 'completed',
      wordCount: chapter.wordCount,
      createdAt: chapter.publishTime,
      updatedAt: chapter.publishTime,
    })),
  }

  return createMockResponse([rootNode])
}

function getWriterProjectLocations(projectId: string): MockResponse {
  return createMockResponse(ensureWriterLocations(projectId))
}

function getWriterProjectCharacters(projectId: string): MockResponse {
  return createMockResponse(ensureWriterCharacters(projectId))
}

function getWriterProjectCharacterRelations(projectId: string): MockResponse {
  return createMockResponse(ensureWriterCharacterRelations(projectId))
}

function getWriterProjectLocationTree(projectId: string): MockResponse {
  const locations = getWriterProjectLocations(projectId).data as Array<Record<string, any>>
  const rootLocations = locations
    .filter((location) => !location.parentId)
    .map((location) => ({
      ...location,
      children: locations.filter((child) => child.parentId === location.id),
    }))

  return createMockResponse(rootLocations)
}

function getWriterProjectLocationRelations(projectId: string): MockResponse {
  return createMockResponse([
    {
      id: `${projectId}-loc-rel-1`,
      projectId,
      fromId: `${projectId}-loc-sect`,
      toId: `${projectId}-loc-market`,
      type: 'connected',
      distance: '半日路程',
      notes: '宗门弟子常往返于宗门与坊市之间',
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ])
}

function getWriterRevenueStats(): MockResponse {
  return createMockResponse({
    totalRevenue: 12580.5,
    todayRevenue: 235.8,
    availableBalance: 8650.3,
    totalWithdrawn: 3930.2,
  })
}

// ==================== 用户中心 Mock 数据 ====================

function getUserProfile(): MockResponse {
  return createMockResponse({
    _id: 'user-current',
    nickname: '测试用户',
    avatar: '/images/avatars/avatar-demo.svg',
    bio: '这是测试模式下的模拟用户',
    stats: {
      bookCount: 2,
      followerCount: 128,
      followingCount: 56,
      wordCount: 1000000,
    },
  })
}

// ==================== 社区模块 Mock 数据 ====================

// 随机用户名池
const MOCK_POST_USERS = [
  { id: 'user-1', username: '星河漫步', nickname: '星河漫步', level: 12 },
  { id: 'user-2', username: '书虫小窝', nickname: '书虫小窝', level: 8 },
  { id: 'user-3', username: '墨染年华', nickname: '墨染年华', level: 15 },
  { id: 'user-4', username: '云端读者', nickname: '云端读者', level: 6 },
  { id: 'user-5', username: '夜空守望', nickname: '夜空守望', level: 20 },
  { id: 'user-6', username: '时光旅人', nickname: '时光旅人', level: 10 },
  { id: 'user-7', username: '清风徐来', nickname: '清风徐来', level: 5 },
  { id: 'user-8', username: '烟雨江南', nickname: '烟雨江南', level: 18 },
]

// 动态内容池
const MOCK_POST_CONTENTS = [
  {
    type: 'text',
    content: '今天看了一本非常精彩的仙侠小说，剧情紧凑，人物塑造也很到位！强烈推荐给大家~',
    topics: ['仙侠', '推荐'],
  },
  {
    type: 'text',
    content: '有人喜欢看都市异能类的书吗？最近书荒了，求推荐几本好看的！',
    topics: ['求推荐', '都市'],
  },
  {
    type: 'book_recommendation',
    content: '《星辰大海》这本书真的太赞了！讲述了人类探索宇宙的壮阔历程，看得我热血沸腾！',
    topics: ['科幻', '推荐'],
    book: {
      bookId: 'book-101',
      title: '星辰大海',
      cover: '/images/covers/book-101.jpg',
      author: '银河漫步',
    },
  },
  {
    type: 'reading_progress',
    content: '终于追完了一本追了三个月的小说！从筑基到飞升，经历了太多太多。感谢作者一路陪伴~',
    topics: ['读书感悟'],
    readingProgress: {
      bookId: 'book-202',
      chapterId: 'ch-202',
      chapterTitle: '第520章 大结局',
      progress: 100,
    },
  },
  {
    type: 'text',
    content: '周末宅家看书，一口气看了五章停不下来！这种感觉太美妙了，有没有人懂？',
    topics: ['日常', '阅读'],
  },
  {
    type: 'image',
    content: '分享一下最近入手的新书，封面设计太美了！已经迫不及待想要开始阅读了~',
    topics: ['晒书'],
    images: [
      'https://picsum.photos/seed/book1/400/300',
      'https://picsum.photos/seed/book2/400/300',
    ],
  },
  {
    type: 'text',
    content: '修仙小说的套路是不是都差不多啊？退婚、升级、打脸，看多了有点审美疲劳了...',
    topics: ['吐槽', '修仙'],
  },
  {
    type: 'book_recommendation',
    content:
      '给大家安利一本冷门好书《雾隐都市》，悬疑氛围营造得特别好，晚上看有点害怕但又停不下来！',
    topics: ['悬疑', '推荐'],
    book: {
      bookId: 'book-303',
      title: '雾隐都市',
      cover: '/images/covers/book-303.jpg',
      author: '暗夜行者',
    },
  },
  {
    type: 'text',
    content: '今天在书城发现了一本神作！作者文笔太厉害了，寥寥几笔就把人物写活了。',
    topics: ['惊喜', '推荐'],
  },
  {
    type: 'reading_progress',
    content: '追更《逆天改命》已经一年了，见证了主角从零开始一步步成长为强者，太励志了！',
    topics: ['追更', '热血'],
    readingProgress: {
      bookId: 'book-404',
      chapterId: 'ch-404',
      chapterTitle: '第1000章 巅峰之战',
      progress: 85,
    },
  },
]

function generateMockPosts(count: number) {
  const posts = []
  const now = Date.now()

  for (let i = 0; i < count; i++) {
    const user = MOCK_POST_USERS[i % MOCK_POST_USERS.length]
    const postData = MOCK_POST_CONTENTS[i % MOCK_POST_CONTENTS.length]
    const hoursAgo = Math.floor(Math.random() * 72) // 0-72小时前
    const likes = Math.floor(Math.random() * 200) + 10
    const comments = Math.floor(Math.random() * 50) + 1

    posts.push({
      id: `post-${i + 1}`,
      userId: user.id,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: `https://picsum.photos/seed/${user.id}/100/100`,
        level: user.level,
      },
      type: postData.type,
      content: postData.content,
      images: postData.images,
      book: postData.book,
      readingProgress: postData.readingProgress,
      topics: postData.topics,
      likeCount: likes,
      commentCount: comments,
      shareCount: Math.floor(Math.random() * 20),
      isLiked: Math.random() > 0.7,
      isBookmarked: Math.random() > 0.8,
      createdAt: new Date(now - hoursAgo * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - hoursAgo * 60 * 60 * 1000).toISOString(),
    })
  }

  return posts
}

function getCommunityPosts(): MockResponse {
  const posts = generateMockPosts(15)
  return createMockResponse({
    list: posts,
    total: 15,
    page: 1,
    size: 15,
  })
}

// ==================== Mock 数据路由 ====================

/**
 * 根据 URL 获取对应的 Mock 数据
 */
export async function getMockDataForRequest(
  url: string | undefined,
  options: MockRequestOptions = {},
): Promise<MockResponse> {
  if (!url) return createMockResponse({})

  console.log('[MockDataManager] 获取 Mock 数据:', url)
  const method = (options.method || 'get').toUpperCase()
  const body = parseMockBody(options.data)
  const parsedUrl = new URL(url, 'http://mock.local')

  // ==================== 书城模块 ====================

  // 首页数据
  if (url.includes('/bookstore/homepage') || url === '/api/v1/bookstore') {
    return getHomepageData()
  }

  // 公告
  if (url.includes('/announcements')) {
    return getAnnouncements()
  }

  // 榜单
  if (url.includes('/bookstore/rankings/')) {
    const rankingType = url.split('/bookstore/rankings/')[1]?.split('?')[0]
    const normalizedType = ['realtime', 'weekly', 'monthly', 'newbie'].includes(rankingType)
      ? rankingType
      : 'realtime'
    return createMockResponse(generateRankingBooks(normalizedType))
  }

  // 书籍列表
  if (url.includes('/bookstore/books/recommended')) {
    const parsedUrl = new URL(url, window.location.origin)
    const params = options.params || {}
    const page = Number(params.page || parsedUrl.searchParams.get('page') || 1)
    const size = Number(params.size || parsedUrl.searchParams.get('size') || 12)
    const allBooks = generateRecommendedBooks(MOCK_BOOK_POOL_SIZE)
    const start = Math.max(0, (page - 1) * size)
    const list = allBooks.slice(start, start + size)
    return createMockResponse({
      list,
      total: allBooks.length,
      pagination: {
        page,
        pageSize: size,
        total: allBooks.length,
        has_next: start + size < allBooks.length,
      },
    })
  }

  if (url.includes('/bookstore/books/featured')) {
    const parsedUrl = new URL(url, window.location.origin)
    const params = options.params || {}
    const page = Number(params.page || parsedUrl.searchParams.get('page') || 1)
    const size = Number(params.size || parsedUrl.searchParams.get('size') || 12)
    const allBooks = generateFeaturedBooks(80)
    const start = Math.max(0, (page - 1) * size)
    const list = allBooks.slice(start, start + size)
    return createMockResponse({
      list,
      total: allBooks.length,
      pagination: {
        page,
        pageSize: size,
        total: allBooks.length,
        has_next: start + size < allBooks.length,
      },
    })
  }

  if (url.includes('/bookstore/books/search')) {
    const parsedUrl = new URL(url, window.location.origin)
    const params = options.params || {}
    const allBooks = generateRecommendedBooks(MOCK_BOOK_POOL_SIZE)
    const result = filterAndPaginateBooks(allBooks, params, parsedUrl)

    return createMockResponse({
      books: result.list,
      total: result.total,
      page: result.page,
      size: result.size,
      pagination: {
        page: result.page,
        pageSize: result.size,
        total: result.total,
        has_next: result.hasNext,
      },
    })
  }

  if (url.includes('/bookstore/books') && !url.includes('/books/')) {
    const parsedUrl = new URL(url, window.location.origin)
    const params = options.params || {}
    const allBooks = generateRecommendedBooks(MOCK_BOOK_POOL_SIZE)
    const result = filterAndPaginateBooks(allBooks, params, parsedUrl)

    return createMockResponse({
      list: result.list,
      total: result.total,
      pagination: {
        page: result.page,
        pageSize: result.size,
        total: result.total,
        has_next: result.hasNext,
      },
    })
  }

  // 书籍详情
  if (url.match(/\/bookstore\/books\/[^/]+(\/detail)?$/)) {
    return createMockResponse(generateBook(0))
  }

  // 章节列表
  if (url.includes('/chapters') && url.includes('/books/')) {
    return createMockResponse({
      list: Array.from({ length: 50 }, (_, i) => ({
        _id: `chapter-${i + 1}`,
        chapterNumber: i + 1,
        title: `第${i + 1}章`,
        wordCount: Math.floor(Math.random() * 2000) + 1500,
        isFree: i < 10,
        price: i >= 10 ? Math.floor(Math.random() * 10) + 5 : 0,
        publishTime: new Date(Date.now() - (50 - i) * 24 * 60 * 60 * 1000).toISOString(),
      })),
      total: 50,
    })
  }

  // 分类树
  if (url.includes('/categories/tree')) {
    return createMockResponse(generateCategories())
  }

  // 标签列表
  if (url.includes('/bookstore/tags') && !url.includes('/books/tags')) {
    const allBooks = generateRecommendedBooks(MOCK_BOOK_POOL_SIZE)
    const tagCounter = new Map<string, number>()

    for (const book of allBooks) {
      for (const tag of book.tags || []) {
        tagCounter.set(tag, (tagCounter.get(tag) || 0) + 1)
      }
    }

    const tagList = Array.from(tagCounter.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], idx) => ({
        _id: `tag-${idx + 1}`,
        name,
        count,
      }))

    return createMockResponse(tagList)
  }

  // 年份列表
  if (url.includes('/books/years')) {
    const currentYear = new Date().getFullYear()
    return createMockResponse(Array.from({ length: 10 }, (_, i) => (currentYear - i).toString()))
  }

  // ==================== 创作中心 ====================

  if (/\/api\/v1\/writer\/documents\/[^/]+\/contents(\?.*)?$/.test(url)) {
    const documentId = url.match(/\/api\/v1\/writer\/documents\/([^/]+)\/contents/)?.[1] || ''
    const projectId = String(options.params?.projectId || body.projectId || 'project-yljs-1')

    if (method === 'PUT') {
      const nextContents = Array.isArray(body.contents) ? body.contents : []
      const mergedContent = nextContents
        .map((item: Record<string, any>) => (typeof item?.content === 'string' ? item.content : ''))
        .join('\n\n')
      const updated = updateWriterDocumentContent(projectId, documentId, mergedContent)
      const normalizedContents = buildParagraphContents(
        documentId,
        updated.content,
        updated.updatedAt,
      )

      return createMockResponse({
        documentId,
        total: normalizedContents.length,
        wordCount: updated.content.replace(/\s/g, '').length,
        updatedAt: updated.updatedAt,
      })
    }

    const record = ensureWriterDocumentContent(projectId, documentId)
    const contents = buildParagraphContents(documentId, record.content, record.updatedAt)

    return createMockResponse({
      documentId,
      contents,
      total: contents.length,
      wordCount: record.content.replace(/\s/g, '').length,
      updatedAt: record.updatedAt,
    })
  }

  if (
    /\/writer\/project\/[^/]+\/documents\/[^/]+\/story-harness\/batches\/latest(\?.*)?$/.test(url)
  ) {
    const match = url.match(
      /\/writer\/project\/([^/]+)\/documents\/([^/]+)\/story-harness\/batches\/latest/,
    )
    const projectId = match?.[1] || 'project-yljs-1'
    const chapterId = match?.[2] || ''
    return createMockResponse(getStoryHarnessBatch(projectId, chapterId))
  }

  if (/\/writer\/project\/[^/]+\/documents\/[^/]+\/story-harness\/batches(\?.*)?$/.test(url)) {
    const match = url.match(
      /\/writer\/project\/([^/]+)\/documents\/([^/]+)\/story-harness\/batches/,
    )
    const projectId = match?.[1] || 'project-yljs-1'
    const chapterId = match?.[2] || ''
    const chapterMeta = getWorkspaceMockDocumentMeta(projectId, chapterId)
    const committedAt = Date.now()
    const batch = {
      batchId: `story-harness:${chapterId}:${committedAt}`,
      projectId,
      chapterId,
      chapterTitle: body.chapterTitle || chapterMeta?.title || '未命名章节',
      committedAt,
      source: 'remote',
      changeRequests: Array.isArray(body.changeRequests) ? body.changeRequests : [],
    }

    return createMockResponse(setStoryHarnessBatch(projectId, chapterId, batch))
  }

  if (/\/writer\/projects\/[^/]+\/chapters\/[^/]+\/context(\?.*)?$/.test(url)) {
    const match = url.match(/\/writer\/projects\/([^/]+)\/chapters\/([^/]+)\/context/)
    const projectId = match?.[1] || 'project-yljs-1'
    const chapterId = match?.[2] || ''
    return createMockResponse(buildStoryHarnessContext(projectId, chapterId))
  }

  if (/\/writer\/projects\/[^/]+\/chapters\/[^/]+\/trigger-index(\?.*)?$/.test(url)) {
    const match = url.match(/\/writer\/projects\/([^/]+)\/chapters\/([^/]+)\/trigger-index/)
    const projectId = match?.[1] || 'project-yljs-1'
    const chapterId = match?.[2] || ''
    const { batchId, items } = buildMockStoryHarnessChangeRequests(projectId, chapterId)
    setStoryHarnessChangeRequests(projectId, chapterId, items)

    return createMockResponse({
      batchId,
      generated: items.length,
      pending: items.filter((item) => item.status === 'pending').length,
      deduplicated: 0,
      source: 'mock_ai',
    })
  }

  if (/\/writer\/projects\/[^/]+\/chapters\/[^/]+\/change-requests(\?.*)?$/.test(url)) {
    const match = url.match(/\/writer\/projects\/([^/]+)\/chapters\/([^/]+)\/change-requests/)
    const projectId = match?.[1] || 'project-yljs-1'
    const chapterId = match?.[2] || ''
    const requestedStatus = parsedUrl.searchParams.get('status')
    const items = getStoryHarnessChangeRequests(projectId, chapterId).filter(
      (item: Record<string, any>) => (requestedStatus ? item.status === requestedStatus : true),
    )

    return createMockResponse({
      items,
      total: items.length,
    })
  }

  if (/\/writer\/change-requests\/[^/]+\/status(\?.*)?$/.test(url)) {
    const requestId = url.match(/\/writer\/change-requests\/([^/]+)\/status/)?.[1] || ''
    const nextStatus = body.status || 'pending'

    for (const [key, items] of mockState.storyHarnessChangeRequests.entries()) {
      const index = items.findIndex((item) => item.id === requestId)
      if (index === -1) {
        continue
      }

      const nextItems = [...items]
      nextItems[index] = {
        ...nextItems[index],
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      }
      mockState.storyHarnessChangeRequests.set(key, nextItems)
      return createMockResponse(null)
    }

    return createMockResponse(null)
  }

  if (/\/writer\/projects\/[^/]+\/chapters\/[^/]+\/rebuild-projection(\?.*)?$/.test(url)) {
    const match = url.match(/\/writer\/projects\/([^/]+)\/chapters\/([^/]+)\/rebuild-projection/)
    const projectId = match?.[1] || 'project-yljs-1'
    const chapterId = match?.[2] || ''
    const items = getStoryHarnessChangeRequests(projectId, chapterId)

    return createMockResponse({
      projectId,
      chapterId,
      replayedCount: items.length,
      lastRequestId: items[0]?.id,
    })
  }

  // 写作项目文档树（单数 project 路由）
  if (/\/writer\/project\/[^/]+\/documents\/tree(\?.*)?$/.test(url)) {
    const projectId = url.match(/\/writer\/project\/([^/]+)\/documents\/tree/)?.[1]
    return getWriterProjectDocumentTree(projectId || 'project-yljs-1')
  }

  // 写作项目文档列表（单数 project 路由）
  if (/\/writer\/project\/[^/]+\/documents(\?.*)?$/.test(url)) {
    const projectId = url.match(/\/writer\/project\/([^/]+)\/documents/)?.[1]
    return getWriterProjectDocuments(projectId || 'project-yljs-1')
  }

  if (/\/writer\/projects\/[^/]+\/characters\/graph(\?.*)?$/.test(url)) {
    const projectId =
      url.match(/\/writer\/projects\/([^/]+)\/characters\/graph/)?.[1] || 'project-yljs-1'
    return createMockResponse({
      characters: ensureWriterCharacters(projectId),
      relations: ensureWriterCharacterRelations(projectId),
    })
  }

  if (/\/writer\/projects\/[^/]+\/characters\/relations(\?.*)?$/.test(url)) {
    const projectId =
      url.match(/\/writer\/projects\/([^/]+)\/characters\/relations/)?.[1] || 'project-yljs-1'
    return getWriterProjectCharacterRelations(projectId)
  }

  if (/\/writer\/projects\/[^/]+\/characters(\?.*)?$/.test(url)) {
    const projectId = url.match(/\/writer\/projects\/([^/]+)\/characters/)?.[1] || 'project-yljs-1'

    if (method === 'POST') {
      const list = ensureWriterCharacters(projectId)
      const now = new Date().toISOString()
      const created = {
        id: `${projectId}-char-${Date.now()}`,
        projectId,
        name: body.name || `新角色${list.length + 1}`,
        alias: Array.isArray(body.alias) ? body.alias : [],
        summary: body.summary || '',
        traits: Array.isArray(body.traits) ? body.traits : [],
        background: body.background || '',
        avatarUrl: body.avatarUrl || '',
        personalityPrompt: body.personalityPrompt || '',
        speechPattern: body.speechPattern || '',
        createdAt: now,
        updatedAt: now,
      }
      mockState.writerCharacters.set(projectId, [...list, created])
      return createMockResponse(created)
    }

    return getWriterProjectCharacters(projectId)
  }

  if (url.includes('/characters/relations')) {
    const relationId = url.match(/\/characters\/relations\/([^/?]+)/)?.[1]
    const projectId = options.params?.projectId || body.projectId || 'project-yljs-1'
    const list = ensureWriterCharacterRelations(projectId)

    if (method === 'POST') {
      const now = new Date().toISOString()
      const created = {
        id: `${projectId}-rel-${Date.now()}`,
        projectId,
        fromId: body.fromId,
        toId: body.toId,
        type: body.type || '其他',
        strength: Number(body.strength ?? 50),
        notes: body.notes || '',
        createdAt: now,
        updatedAt: now,
      }
      mockState.writerCharacterRelations.set(projectId, [...list, created])
      return createMockResponse(created)
    }

    if (method === 'DELETE' && relationId) {
      mockState.writerCharacterRelations.set(
        projectId,
        list.filter((item) => item.id !== relationId),
      )
      return createMockResponse(null)
    }
  }

  // 写作项目地点关系
  if (/\/writer\/projects\/[^/]+\/locations\/relations(\?.*)?$/.test(url)) {
    const projectId = url.match(/\/writer\/projects\/([^/]+)\/locations\/relations/)?.[1]
    return getWriterProjectLocationRelations(projectId || 'project-yljs-1')
  }

  // 写作项目地点树
  if (/\/writer\/projects\/[^/]+\/locations\/tree(\?.*)?$/.test(url)) {
    const projectId = url.match(/\/writer\/projects\/([^/]+)\/locations\/tree/)?.[1]
    return getWriterProjectLocationTree(projectId || 'project-yljs-1')
  }

  // 写作项目地点列表
  if (/\/writer\/projects\/[^/]+\/locations(\?.*)?$/.test(url)) {
    const projectId = url.match(/\/writer\/projects\/([^/]+)\/locations/)?.[1] || 'project-yljs-1'

    if (method === 'POST') {
      const list = ensureWriterLocations(projectId)
      const now = new Date().toISOString()
      const created = {
        id: `${projectId}-loc-${Date.now()}`,
        projectId,
        name: body.name || `新地点${list.length + 1}`,
        description: body.description || '',
        climate: body.climate || '',
        culture: body.culture || '',
        geography: body.geography || '',
        atmosphere: body.atmosphere || '',
        parentId: body.parentId || '',
        imageUrl: body.imageUrl || '',
        createdAt: now,
        updatedAt: now,
      }
      mockState.writerLocations.set(projectId, [...list, created])
      return createMockResponse(created)
    }

    return getWriterProjectLocations(projectId)
  }

  if (url.includes('/api/v1/writer/stats/today')) {
    const todayWords = 1680
    return createMockResponse({
      todayWords,
      words: todayWords,
      writingMinutes: 54,
      updatedChapters: 1,
      date: new Date().toISOString().split('T')[0],
    })
  }

  if (/\/writer\/projects\/[^/]+(\?.*)?$/.test(url)) {
    const projectId = url.match(/\/writer\/projects\/([^/?]+)/)?.[1] || 'project-yljs-1'
    return getWriterProjectDetail(projectId)
  }

  // 写作项目列表
  if (url.includes('/writer/projects')) {
    return getWriterProjects()
  }

  // 今日写作统计
  if (url.includes('/writer/stats/today')) {
    return createMockResponse({
      todayWords: 5029,
      words: 5029,
      weekTotal: 16840,
      monthTotal: 48210,
      writingMinutes: 96,
      updatedChapters: 1,
      date: new Date().toISOString().split('T')[0],
    })
  }

  // 收入统计
  if (url.includes('/writer/revenue/stats')) {
    return getWriterRevenueStats()
  }

  // 收入趋势
  if (url.includes('/writer/revenue/trend')) {
    const days = 30
    return createMockResponse(
      Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString(),
        revenue: Math.floor(Math.random() * 500) + 100,
      })),
    )
  }

  // 收入来源
  if (url.includes('/writer/revenue/sources')) {
    return createMockResponse([
      { type: 'subscription', label: '订阅收入', amount: 8580 },
      { type: 'tip', label: '打赏收入', amount: 2850 },
      { type: 'ad', label: '广告收入', amount: 1150 },
    ])
  }

  // 章节收入排行
  if (url.includes('/revenue/chapters')) {
    return createMockResponse({
      list: Array.from({ length: 10 }, (_, i) => ({
        id: `chapter-revenue-${i + 1}`,
        chapterTitle: `第${i + 1}章`,
        views: Math.floor(Math.random() * 10000) + 1000,
        revenue: Math.floor(Math.random() * 500) + 100,
      })),
      total: 10,
    })
  }

  // ==================== 用户中心 ====================

  // 用户信息
  if (url.includes('/user/profile') || url === '/api/v1/user') {
    return getUserProfile()
  }

  // ==================== 社区模块 ====================

  // 帖子列表
  if (url.includes('/community/posts') || url === '/api/v1/community') {
    return getCommunityPosts()
  }

  // ==================== 钱包模块 ====================

  // 钱包余额
  if (url.includes('/wallet') && !url.includes('withdraw')) {
    return createMockResponse({
      balance: 8650.3,
      totalRevenue: 12580.5,
      totalWithdrawn: 3930.2,
    })
  }

  // 提现记录
  if (url.includes('/withdraw-requests')) {
    return createMockResponse({
      list: [
        {
          id: 'withdraw-1',
          amount: 1000,
          status: 'completed',
          method: 'alipay',
          createdAt: '2024-01-20T10:30:00Z',
          processedAt: '2024-01-21T14:20:00Z',
          remark: '提现成功',
        },
        {
          id: 'withdraw-2',
          amount: 2000,
          status: 'pending',
          method: 'wechat',
          createdAt: '2024-01-25T09:15:00Z',
          processedAt: null,
          remark: '处理中',
        },
      ],
      total: 2,
    })
  }

  // 获取书籍章节列表（读者端）- 使用内存状态
  if (url.includes('/bookstore/books/') && url.includes('/chapters')) {
    const bookId = url.match(/\/bookstore\/books\/([^/]+)\/chapters/)?.[1]

    // 先检查内存状态中是否有该书籍的章节
    if (bookId && mockState.bookChapters.has(bookId)) {
      const chapters = mockState.bookChapters.get(bookId) || []
      console.log(`[Mock联动] 读者端获取章节列表: 书籍 ${bookId}, 共 ${chapters.length} 章`)
      return createMockResponse({
        list: chapters,
        total: chapters.length,
      })
    }

    // 默认章节列表
    return createMockResponse({
      list: Array.from({ length: 50 }, (_, i) => ({
        _id: `chapter-${i + 1}`,
        chapterNumber: i + 1,
        title: `第${i + 1}章`,
        wordCount: Math.floor(Math.random() * 2000) + 1500,
        isFree: i < 10,
        price: i >= 10 ? Math.floor(Math.random() * 10) + 5 : 0,
        publishTime: new Date(Date.now() - (50 - i) * 24 * 60 * 60 * 1000).toISOString(),
      })),
      total: 50,
    })
  }

  // ==================== 默认响应 ====================

  console.warn('[MockDataManager] 未匹配的 URL:', url)
  return createMockResponse({})
}

/**
 * 处理 Mock 数据请求（供 HTTP Service 调用）
 */
export async function handleMockRequest(url: string | undefined, options: MockRequestOptions = {}) {
  await mockDelay()
  return await getMockDataForRequest(url, options)
}

/**
 * Mock 数据管理器配置
 */
export const mockDataManagerConfig = {
  // 是否启用 Mock 数据（自动检测 URL 参数）
  enabled: isInTestMode(),

  // 是否记录所有 Mock 请求
  logRequests: true,

  // 模拟延迟范围（毫秒）
  minDelay: 100,
  maxDelay: 300,
}
