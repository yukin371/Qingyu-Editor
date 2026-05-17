import { DocumentStatus, DocumentType, type Document } from '../types/document'
import {
  WRITER_SAMPLE_BOOK_ID,
  WRITER_SAMPLE_BOOK_TITLE,
  createWriterSampleReaderChapters,
  writerSampleBookMeta,
} from './yunlanWriterMock'
import type { OutlineNode } from '@/types/writer'

export interface WorkspaceProjectSummary {
  id: string
  title: string
  status: string
  wordCount: number
  chapterCount: number
  updatedAt: string
}

export interface WorkspaceChapterSummary {
  id: string
  projectId: string
  chapterNum: number
  title: string
  wordCount: number
  updatedAt: string
  status: 'draft' | 'published'
  nodeType?: 'directory' | 'chapter'
  sortOrder?: number
}

export interface WorkspaceSceneSummary {
  id: string
  title: string
  hook: string
  chapterIds: string[]
}

export interface WorkspaceMockProject {
  project: WorkspaceProjectSummary
  docs: Document[]
  chapters: WorkspaceChapterSummary[]
  scenes: WorkspaceSceneSummary[]
  contentByDocId: Record<string, string>
}

const now = Date.now()
const iso = (offsetMs: number) => new Date(now - offsetMs).toISOString()

const WRITER_YUNLAN_PROJECT_ID = 'project-yljs-1'

const readerChapters = createWriterSampleReaderChapters(3)

const createYunlanDocs = (projectId: string): Document[] => {
  const sceneId1 = `${projectId}-scene-1`
  const sceneId2 = `${projectId}-scene-2`
  const sceneDocs: Document[] = [
    {
      id: sceneId1,
      projectId,
      title: '目录一 雨夜入城（小高潮）',
      type: DocumentType.SCENE,
      level: 0,
      order: 1,
      status: DocumentStatus.WRITING,
      wordCount: 0,
      createdAt: iso(7 * 24 * 60 * 60 * 1000),
      updatedAt: iso(2 * 60 * 60 * 1000),
    },
    {
      id: sceneId2,
      projectId,
      title: '目录二 灯下问卷（推进）',
      type: DocumentType.SCENE,
      level: 0,
      order: 2,
      status: DocumentStatus.WRITING,
      wordCount: 0,
      createdAt: iso(5 * 24 * 60 * 60 * 1000),
      updatedAt: iso(40 * 60 * 1000),
    },
  ]

  const chapterDocs = readerChapters.map((chapter) => ({
    id: chapter.id,
    projectId,
    parentId: chapter.chapterNum < 3 ? sceneId1 : sceneId2,
    title: chapter.title,
    type: DocumentType.CHAPTER,
    level: 1,
    order: chapter.chapterNum,
    status: chapter.chapterNum < 3 ? DocumentStatus.COMPLETED : DocumentStatus.WRITING,
    wordCount: chapter.content.length,
    createdAt: iso((7 - chapter.chapterNum) * 24 * 60 * 60 * 1000),
    updatedAt: iso((4 - chapter.chapterNum) * 30 * 60 * 1000),
  }))

  return [...sceneDocs, ...chapterDocs]
}

const createYunlanScenes = (projectId: string): WorkspaceSceneSummary[] => [
  {
    id: `${projectId}-scene-1`,
    title: '目录一 雨夜入城（小高潮）',
    hook: '林砚入城并在听雨斋开始接触云岚城暗线。',
    chapterIds: readerChapters
      .filter((chapter) => chapter.chapterNum < 3)
      .map((chapter) => chapter.id),
  },
  {
    id: `${projectId}-scene-2`,
    title: '目录二 灯下问卷（推进）',
    hook: '线索转向书院深处，主角首次触碰更深谜团。',
    chapterIds: readerChapters
      .filter((chapter) => chapter.chapterNum >= 3)
      .map((chapter) => chapter.id),
  },
]

const createYunlanChapterSummary = (projectId: string): WorkspaceChapterSummary[] => {
  const sceneEntries: WorkspaceChapterSummary[] = [
    {
      id: `${projectId}-scene-1`,
      projectId,
      chapterNum: 0,
      title: '目录一 雨夜入城（小高潮）',
      wordCount: 0,
      updatedAt: iso(2 * 60 * 60 * 1000),
      status: 'published',
      nodeType: 'directory',
      sortOrder: 1,
    },
    {
      id: `${projectId}-scene-2`,
      projectId,
      chapterNum: 0,
      title: '目录二 灯下问卷（推进）',
      wordCount: 0,
      updatedAt: iso(40 * 60 * 1000),
      status: 'draft',
      nodeType: 'directory',
      sortOrder: 4,
    },
  ]

  const chapterEntries: WorkspaceChapterSummary[] = readerChapters.map((chapter) => ({
    id: chapter.id,
    projectId,
    chapterNum: chapter.chapterNum,
    title: chapter.title,
    wordCount: chapter.content.length,
    updatedAt: iso((4 - chapter.chapterNum) * 30 * 60 * 1000),
    status: chapter.chapterNum < 3 ? 'published' : 'draft',
    nodeType: 'chapter',
    sortOrder: chapter.chapterNum + 1,
  }))

  return [...sceneEntries, ...chapterEntries].sort(
    (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0),
  )
}

const createYunlanContentByDocId = (projectId: string): Record<string, string> => {
  const entries: Array<[string, string]> = [
    [
      `${projectId}-scene-1`,
      '# 目录一 雨夜入城（小高潮）\n\n这一目录聚焦主角初入云岚城，完成初次落脚并接触暗线人物，情绪节奏以压抑转安定为主。',
    ],
    [
      `${projectId}-scene-2`,
      '# 目录二 灯下问卷（推进）\n\n这一目录承接前文线索，把叙事重心推进到书院内部谜团，并埋入后续冲突触发点。',
    ],
    ...readerChapters.map((chapter): [string, string] => {
      if (chapter.id === 'ch-2') {
        return [
          chapter.id,
          `# ${chapter.title}

${chapter.content}

林砚离开听雨斋前，忽然意识到周先生并没有把所有话说完。他开始怀疑，这位看似平静的先生是否也在借自己试探云岚城里的暗流。

// @周德厚 对林砚起疑，暂不再公开交付关键情报。
// @林砚 状态转为怀疑与戒备。`,
        ]
      }

      return [chapter.id, `# ${chapter.title}\n\n${chapter.content}`]
    }),
  ]
  return Object.fromEntries(entries)
}

const buildYunlanMock = (projectId: string): WorkspaceMockProject => ({
  project: {
    id: projectId,
    title: WRITER_SAMPLE_BOOK_TITLE,
    status: 'writing',
    wordCount: writerSampleBookMeta.wordCount,
    chapterCount: 3,
    updatedAt: new Date(writerSampleBookMeta.lastUpdate.replace(' ', 'T')).toISOString(),
  },
  docs: createYunlanDocs(projectId),
  chapters: createYunlanChapterSummary(projectId),
  scenes: createYunlanScenes(projectId),
  contentByDocId: createYunlanContentByDocId(projectId),
})

const workspaceMockProjects: Record<string, WorkspaceMockProject> = {
  [WRITER_YUNLAN_PROJECT_ID]: buildYunlanMock(WRITER_YUNLAN_PROJECT_ID),
  [WRITER_SAMPLE_BOOK_ID]: buildYunlanMock(WRITER_SAMPLE_BOOK_ID),
}

const YUNLAN_PROJECT_ALIASES = new Set([WRITER_YUNLAN_PROJECT_ID, WRITER_SAMPLE_BOOK_ID])

export const getWorkspaceMockProject = (projectId?: string | null): WorkspaceMockProject | null => {
  if (!projectId) return null
  if (workspaceMockProjects[projectId]) return workspaceMockProjects[projectId]

  if (YUNLAN_PROJECT_ALIASES.has(projectId)) {
    return buildYunlanMock(projectId)
  }
  return null
}

export const createMockOutlineTree = (
  projectId: string = WRITER_YUNLAN_PROJECT_ID,
): OutlineNode[] => {
  const mockProject = getWorkspaceMockProject(projectId) ?? buildYunlanMock(projectId)
  const nowIso = iso(30 * 60 * 1000)

  const chapterMap = new Map(
    mockProject.chapters
      .filter((chapter) => chapter.nodeType === 'chapter')
      .map((chapter) => [chapter.id, chapter]),
  )

  const directoryNodes: OutlineNode[] = mockProject.scenes.map((scene, sceneIndex) => ({
    id: scene.id,
    projectId,
    title: scene.title,
    description: scene.hook,
    order: sceneIndex,
    level: 2,
    parentId: `${projectId}-outline-root`,
    wordCount: scene.chapterIds.reduce(
      (sum, chapterId) => sum + (chapterMap.get(chapterId)?.wordCount || 0),
      0,
    ),
    status: 'writing',
    type: 'volume',
    createdAt: nowIso,
    updatedAt: nowIso,
    children: scene.chapterIds
      .map((chapterId, chapterIndex) => {
        const chapter = chapterMap.get(chapterId)
        if (!chapter) return null
        return {
          id: `outline-${chapter.id}`,
          projectId,
          documentId: chapter.id,
          title: chapter.title,
          description: `映射章节：${chapter.title}`,
          order: chapterIndex,
          level: 3,
          parentId: scene.id,
          wordCount: chapter.wordCount,
          status: chapter.status === 'published' ? 'completed' : 'writing',
          type: 'chapter',
          createdAt: chapter.updatedAt,
          updatedAt: chapter.updatedAt,
          children: [],
          tags: [],
        } as OutlineNode
      })
      .filter(Boolean) as OutlineNode[],
  }))

  return [
    {
      id: `${projectId}-outline-root`,
      projectId,
      title: mockProject.project.title,
      description: 'Mock 工作区主线结构',
      order: 0,
      level: 1,
      wordCount: mockProject.project.wordCount,
      status: 'writing',
      type: 'volume',
      createdAt: nowIso,
      updatedAt: nowIso,
      children: directoryNodes,
    } as OutlineNode,
  ]
}

export const createInteractiveBranchDemoTree = (
  projectId: string = `${WRITER_YUNLAN_PROJECT_ID}-interactive-demo`,
): OutlineNode[] => {
  const createdAt = iso(20 * 60 * 1000)
  const updatedAt = iso(10 * 60 * 1000)

  const makeNode = (
    id: string,
    title: string,
    description: string,
    order: number,
    level: number,
    parentId?: string,
    children: OutlineNode[] = [],
    extras: Partial<OutlineNode> = {},
  ): OutlineNode => ({
    id,
    projectId,
    title,
    description,
    order,
    level,
    parentId,
    status: 'writing',
    type: level <= 2 ? 'volume' : 'chapter',
    wordCount: 0,
    createdAt,
    updatedAt,
    children,
    ...extras,
  })

  const rescueEnding = makeNode(
    `${projectId}-ending-rescue`,
    '祠堂结盟',
    '救人后获得同盟，路线暂时并回主线。',
    0,
    5,
    `${projectId}-branch-rescue`,
  )

  const keyEnding = makeNode(
    `${projectId}-ending-key`,
    '黑市脱身',
    '先取钥匙后遭遇追兵，暂时以独行方式脱身。',
    0,
    5,
    `${projectId}-branch-key`,
  )

  const mergeNode = makeNode(
    `${projectId}-merge`,
    '城门再会（汇合）',
    '两条路线在城门外重新汇合，为下一卷共用主线。',
    2,
    4,
    `${projectId}-choice`,
  )

  const rescueBranch = makeNode(
    `${projectId}-branch-rescue`,
    '先救人',
    '主角暴露位置，但换来线人信任。',
    0,
    4,
    `${projectId}-choice`,
    [rescueEnding],
  )

  const keyBranch = makeNode(
    `${projectId}-branch-key`,
    '先取钥匙',
    '主角保住任务物，但错失第一时间救援。',
    1,
    4,
    `${projectId}-choice`,
    [keyEnding],
  )

  const choiceNode = makeNode(
    `${projectId}-choice`,
    '雨夜抉择',
    '钥匙与伤者只能先保一个，决定后续关系与资源。',
    1,
    3,
    `${projectId}-volume-1`,
    [rescueBranch, keyBranch, mergeNode],
  )

  const openingNode = makeNode(
    `${projectId}-opening`,
    '雨夜入城',
    '主角带着钥匙进入北门，第一次遭遇追兵。',
    0,
    3,
    `${projectId}-volume-1`,
  )

  const endingVolume = makeNode(
    `${projectId}-volume-2`,
    '第二卷 暗线回收',
    '承接第一卷不同抉择的代价与回收。',
    1,
    2,
    `${projectId}-root`,
    [
      makeNode(
        `${projectId}-volume-2-opening`,
        '回到主线',
        '无论前序选择如何，这里进入共用主线推进。',
        0,
        3,
        `${projectId}-volume-2`,
      ),
    ],
  )

  const firstVolume = makeNode(
    `${projectId}-volume-1`,
    '第一卷 北门雨夜',
    '展示一个完整的选择分岔示例。',
    0,
    2,
    `${projectId}-root`,
    [openingNode, choiceNode],
  )

  return [
    makeNode(
      `${projectId}-root`,
      '互动分支示例',
      '只读示例数据，用于预览选择、分支、汇合与结局的表达方式。',
      0,
      1,
      undefined,
      [firstVolume, endingVolume],
      { type: 'volume', wordCount: 0 },
    ),
  ]
}

// ============================================
// Mock Data: 时间线事件
// ============================================

import type { Timeline, TimelineEvent, EventType } from '@/modules/writer/types/timeline'
import type { Character, CharacterRelation, CharacterGraph } from '@/modules/writer/types/character'
import type { EntityType } from '@/modules/writer/types/entity'

const WRITER_PROJECT_ID = WRITER_YUNLAN_PROJECT_ID

/**
 * 生成模拟时间线事件
 */
export const createMockTimelines = (projectId: string = WRITER_PROJECT_ID): Timeline[] => [
  {
    id: 'tl-1',
    projectId,
    name: '第一卷主线时间线',
    description: '聚焦林砚进入云岚城后的主线推进与关键转折。',
    order: 0,
    createdAt: iso(14 * 24 * 60 * 60 * 1000),
    updatedAt: iso(2 * 60 * 60 * 1000),
  } as Timeline,
]

export const createMockTimelineEvents = (
  projectId: string = WRITER_PROJECT_ID,
): TimelineEvent[] => {
  const now = Date.now()
  const iso = (offsetDays: number, hour = 12) =>
    new Date(now - offsetDays * 24 * 60 * 60 * 1000 + hour * 60 * 60 * 1000).toISOString()

  return [
    {
      id: 'evt-1',
      projectId,
      timelineId: 'tl-1',
      title: '林砚入城',
      description: '主角林砚在雨夜从北门进入云岚城，身无分文，携一封旧书信。',
      storyTime: { year: 2024, month: 5, day: 12, hour: 21, season: '初夏雨夜', era: '新历' },
      duration: '约两小时',
      impact: '开启主线叙事，引入云岚城世界观',
      participants: ['char-1'],
      locationIds: ['loc-1'],
      chapterIds: [readerChapters[0]?.id],
      eventType: 'plot' as EventType,
      importance: 9,
      createdAt: iso(30),
      updatedAt: iso(5),
    },
    {
      id: 'evt-2',
      projectId,
      timelineId: 'tl-1',
      title: '听雨斋初见',
      description: '林砚在听雨斋茶馆偶遇老者周先生，收到关于云岚城暗线的第一份情报。',
      storyTime: { year: 2024, month: 5, day: 13, hour: 10, description: '翌日清晨', era: '新历' },
      duration: '约半小时',
      impact: '埋下云岚城暗线伏笔，周先生成为关键线索人物',
      participants: ['char-1', 'char-2'],
      locationIds: ['loc-2'],
      chapterIds: [readerChapters[1]?.id],
      eventType: 'character' as EventType,
      importance: 7,
      createdAt: iso(28),
      updatedAt: iso(3),
    },
    {
      id: 'evt-3',
      projectId,
      timelineId: 'tl-1',
      title: '云澜书院入学',
      description: '林砚化名入学云澜书院，开始接触书院深处的秘密。',
      storyTime: { year: 2024, month: 5, day: 20, description: '入学当日', era: '新历' },
      duration: '全天',
      impact: '开启书院线，引入多条支线伏笔',
      participants: ['char-1', 'char-3'],
      locationIds: ['loc-3'],
      chapterIds: [readerChapters[2]?.id],
      eventType: 'plot' as EventType,
      importance: 8,
      createdAt: iso(25),
      updatedAt: iso(2),
    },
    {
      id: 'evt-4',
      projectId,
      timelineId: 'tl-1',
      title: '第一次暗号接触',
      description: '林砚收到神秘纸条，相约子时在城北旧宅相见。',
      storyTime: { year: 2024, month: 6, day: 3, hour: 23, description: '子夜', era: '新历' },
      duration: '一小时',
      impact: '触发暗线剧情，正式卷入云岚城阴谋',
      participants: ['char-1', 'char-4'],
      locationIds: ['loc-4'],
      chapterIds: [],
      eventType: 'milestone' as EventType,
      importance: 10,
      createdAt: iso(20),
      updatedAt: iso(1),
    },
    {
      id: 'evt-5',
      projectId,
      timelineId: 'tl-1',
      title: '发现地下密室',
      description: '在旧宅地下发现被封存的文献，记录着云岚城百年前的秘密。',
      storyTime: { year: 2024, month: 6, day: 4, hour: 1, description: '深夜', era: '新历' },
      duration: '约三小时',
      impact: '世界观核心谜团开始揭露，文献成为关键道具',
      participants: ['char-1', 'char-4'],
      locationIds: ['loc-4', 'loc-5'],
      chapterIds: [],
      eventType: 'world' as EventType,
      importance: 9,
      createdAt: iso(18),
      updatedAt: iso(1),
    },
    {
      id: 'evt-6',
      projectId,
      timelineId: 'tl-1',
      title: '林砚身世之谜',
      description: '文献中提及的姓氏与林砚家族族谱吻合，暗示其与云岚城的深层渊源。',
      storyTime: { year: 2024, month: 6, day: 4, hour: 3, description: '黎明前', era: '新历' },
      duration: '核心剧情揭示',
      impact: '主角身世线与云岚城线交汇，情节重大转折',
      participants: ['char-1'],
      locationIds: ['loc-4'],
      chapterIds: [],
      eventType: 'milestone' as EventType,
      importance: 10,
      createdAt: iso(15),
      updatedAt: iso(1),
    },
  ]
}

/**
 * 生成模拟角色关系图谱
 */
export const createMockCharacterGraph = (): CharacterGraph => {
  const characters: Character[] = [
    {
      id: 'char-1',
      projectId: WRITER_PROJECT_ID,
      name: '林砚',
      alias: ['砚', '林公子'],
      summary: '云岚城外乡书生，为寻父入城，表面温润，内藏锋芒。性格沉稳，擅长观察与推理。',
      traits: ['沉稳', '洞察力强', '外表柔弱', '内心坚韧'],
      background: '出身云岚城外林家村，父亲是游方郎中，十年前失踪。',
      avatarUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=linyan',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'char-2',
      projectId: WRITER_PROJECT_ID,
      name: '周德厚',
      alias: ['周先生', '德厚先生'],
      summary: '听雨斋茶馆老板，真实身份不明，似乎知晓云岚城百年前旧事。',
      traits: ['睿智', '神秘', '亦正亦邪', '爱茶如命'],
      background: '十年前突然出现在云岚城，开设听雨斋。身份成谜，疑似与消失的旧氏族有关。',
      avatarUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=zhou',
      createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'char-3',
      projectId: WRITER_PROJECT_ID,
      name: '沈青萝',
      alias: ['青萝', '沈姑娘'],
      summary: '云澜书院女学生，林砚同窗，书院山长之女，性格直爽，心思细腻。',
      traits: ['直爽', '聪慧', '正义感强', '表面大大咧咧'],
      background: '书院山长沈鸿独女，自幼在书院长大，对父亲隐藏的秘密有所察觉。',
      avatarUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=shen',
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'char-4',
      projectId: WRITER_PROJECT_ID,
      name: '夜行人',
      alias: ['神秘人', '蒙面者'],
      summary: '每逢子时出现的神秘人物，向林砚传递关键情报，动机不明。',
      traits: ['神秘', '敏捷', '善于伪装', '目的不明'],
      background: '身份不明，疑似与消失的云氏旧族有关，一直在暗中保护云岚城。',
      avatarUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=night',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'char-5',
      projectId: WRITER_PROJECT_ID,
      name: '沈鸿',
      alias: ['沈山长', '沈院长'],
      summary: '云澜书院山长，沈青萝之父，表面是博学鸿儒，暗中掌控云岚城地下情报网。',
      traits: ['威严', '深沉', '城府极深', '慈父'],
      background: '三十年前以不明来历入主书院，逐渐将书院发展为云岚城情报中枢。',
      avatarUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=shenhong',
      createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  const relations: CharacterRelation[] = [
    {
      id: 'rel-1',
      projectId: WRITER_PROJECT_ID,
      fromId: 'char-1',
      toId: 'char-2',
      type: '盟友' as any,
      strength: 65,
      notes: '周先生主动接触林砚，提供情报支持',
      createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'rel-2',
      projectId: WRITER_PROJECT_ID,
      fromId: 'char-1',
      toId: 'char-3',
      type: '朋友' as any,
      strength: 80,
      notes: '书院同窗，日久生情，但双方尚未明言',
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'rel-3',
      projectId: WRITER_PROJECT_ID,
      fromId: 'char-1',
      toId: 'char-4',
      type: '其他' as any,
      strength: 50,
      notes: '夜行人主动联系林砚，但目的不明，需保持警惕',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'rel-4',
      projectId: WRITER_PROJECT_ID,
      fromId: 'char-3',
      toId: 'char-5',
      type: '家庭' as any,
      strength: 95,
      notes: '父女关系，但沈青萝逐渐发现父亲的秘密',
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'rel-5',
      projectId: WRITER_PROJECT_ID,
      fromId: 'char-2',
      toId: 'char-5',
      type: '敌人' as any,
      strength: 70,
      notes: '周德厚与沈鸿表面交好，实则暗中对立',
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'rel-6',
      projectId: WRITER_PROJECT_ID,
      fromId: 'char-4',
      toId: 'char-5',
      type: '敌人' as any,
      strength: 85,
      notes: '夜行人似乎在对抗沈鸿主导的势力',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'rel-7',
      projectId: WRITER_PROJECT_ID,
      fromId: 'char-1',
      toId: 'char-5',
      type: '其他' as any,
      strength: 30,
      notes: '林砚入学后逐渐引起沈鸿注意，两人暗中博弈',
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  return { characters, relations }
}

/**
 * 生成模拟百科实体
 */
export interface MockEncyclopediaEntities {
  characters: Character[]
  locations: Array<{
    id: string
    projectId: string
    name: string
    alias?: string[]
    summary?: string
    description?: string
    type: EntityType
    createdAt: string
    updatedAt: string
  }>
  items: Array<{
    id: string
    projectId: string
    name: string
    alias?: string[]
    summary?: string
    description?: string
    type: EntityType
    createdAt: string
    updatedAt: string
  }>
  concepts: Array<{
    id: string
    projectId: string
    name: string
    alias?: string[]
    summary?: string
    description?: string
    category?: string
    type: EntityType
    createdAt: string
    updatedAt: string
  }>
}

export const createMockEncyclopediaEntities = (): MockEncyclopediaEntities => {
  const baseTime = (daysAgo: number) =>
    new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()

  const locations = [
    {
      id: 'loc-1',
      projectId: WRITER_PROJECT_ID,
      name: '云岚城',
      alias: ['云城'],
      summary: '故事发生的主舞台，一座表面繁华、实则暗流涌动的江南古城。',
      description:
        '云岚城始建于三百年前，地处江南要冲，商贾云集。城中有云澜书院、听雨斋茶馆等重要地点。地下有历代挖掘的密道系统，连接城中各处。',
      type: 'location' as EntityType,
      createdAt: baseTime(30),
      updatedAt: baseTime(2),
    },
    {
      id: 'loc-2',
      projectId: WRITER_PROJECT_ID,
      name: '听雨斋',
      alias: ['听雨茶馆'],
      summary: '云岚城北街的茶馆，周德厚所开，是城中消息最灵通的地方。',
      description:
        '北街老店，招牌已褪色。内部陈设简朴但雅致，常有城中老人在此品茶闲聊。周德厚在此收集并传递情报。',
      type: 'location' as EntityType,
      createdAt: baseTime(28),
      updatedAt: baseTime(3),
    },
    {
      id: 'loc-3',
      projectId: WRITER_PROJECT_ID,
      name: '云澜书院',
      alias: ['书院'],
      summary: '云岚城最高学府，山长沈鸿实际掌控，暗中经营情报网。',
      description:
        '城西丘陵之上，环境清幽。书院藏书楼地下三层封存有云氏旧族的文献档案。沈鸿以教书为掩护，实际上在寻找某种力量。',
      type: 'location' as EntityType,
      createdAt: baseTime(25),
      updatedAt: baseTime(2),
    },
    {
      id: 'loc-4',
      projectId: WRITER_PROJECT_ID,
      name: '城北旧宅',
      alias: ['废弃宅院'],
      summary: '云氏旧族故居，已废弃数十年，地下藏有密室。',
      description:
        '位于城北荒僻处，宅院已半塌。周德厚指引林砚至此，宅中密室藏有云氏旧族封印的文献。',
      type: 'location' as EntityType,
      createdAt: baseTime(20),
      updatedAt: baseTime(1),
    },
    {
      id: 'loc-5',
      projectId: WRITER_PROJECT_ID,
      name: '地下密室',
      alias: ['云氏密库'],
      summary: '旧宅地下密室，保存着云氏旧族的珍贵文献与遗物。',
      description:
        '入口在旧宅正厅佛龛之后，需特殊方式开启。室内干燥，保存完好。藏有云氏族谱、失传的医方及一卷密文。',
      type: 'location' as EntityType,
      createdAt: baseTime(18),
      updatedAt: baseTime(1),
    },
  ]

  const items = [
    {
      id: 'item-1',
      projectId: WRITER_PROJECT_ID,
      name: '古旧医方',
      alias: ['林氏医方'],
      summary: '林父遗留的医方，上载数种失传医术，林砚此行的真正目的。',
      description:
        '一张泛黄古方，记录十二种医方。其中一种与云氏旧族的消失有直接关联，被沈鸿追寻多年。',
      type: 'item' as EntityType,
      createdAt: baseTime(30),
      updatedAt: baseTime(10),
    },
    {
      id: 'item-2',
      projectId: WRITER_PROJECT_ID,
      name: '云氏密文',
      alias: ['密卷'],
      summary: '地下密室中发现的密文，记载云氏旧族消失的真相。',
      description:
        '一卷用特殊墨水书写的帛书，需用特定方法才能显现全部内容。目前只解读出部分，涉及云氏旧族被灭门的内幕。',
      type: 'item' as EntityType,
      createdAt: baseTime(18),
      updatedAt: baseTime(1),
    },
    {
      id: 'item-3',
      projectId: WRITER_PROJECT_ID,
      name: '子时纸条',
      alias: ['神秘纸条'],
      summary: '夜行人留给林砚的纸条，约在城北旧宅相见。',
      description:
        '一张普通信纸，字迹工整，内容仅有一行字和一枚特殊印章。印章图案与云氏族徽极为相似。',
      type: 'item' as EntityType,
      createdAt: baseTime(20),
      updatedAt: baseTime(1),
    },
  ]

  const concepts = [
    {
      id: 'concept-1',
      projectId: WRITER_PROJECT_ID,
      name: '云氏旧族',
      alias: ['云氏', '旧族'],
      summary: '三百年前云岚城的实际掌控者，一夜之间全族消失，留下无数谜团。',
      description:
        '云氏为云岚城原住民，曾掌控城中经济与文化命脉。族中有多支旁系，每支掌握不同秘密。一百年前全族在一夜之间消失，只留下少量遗物和密文。',
      category: '势力',
      type: 'concept' as EntityType,
      createdAt: baseTime(28),
      updatedAt: baseTime(2),
    },
    {
      id: 'concept-2',
      projectId: WRITER_PROJECT_ID,
      name: '云岚暗线',
      alias: ['城中暗涌'],
      summary: '云岚城表面繁华下潜藏的政治、经济、文化的暗流。',
      description:
        '由多股势力在暗中角力：沈鸿的书院系、周德厚的神秘组织、夜行人的反书院势力，以及尚未露面的朝廷暗探。',
      category: '世界观',
      type: 'concept' as EntityType,
      createdAt: baseTime(25),
      updatedAt: baseTime(3),
    },
    {
      id: 'concept-3',
      projectId: WRITER_PROJECT_ID,
      name: '失传医术',
      alias: ['古医方', '云氏医典'],
      summary: '云氏旧族掌握的数种失传医术，可治不治之症。',
      description:
        '云氏族中医术最高者所创，共十二方。其中一方与"移魂续命"有关，正是沈鸿追寻的目标，也是云氏灭族的真正原因。',
      category: '特殊能力',
      type: 'concept' as EntityType,
      createdAt: baseTime(18),
      updatedAt: baseTime(1),
    },
  ]

  return {
    characters: createMockCharacterGraph().characters,
    locations,
    items,
    concepts,
  }
}

export const MOCK_TIMELINES = createMockTimelines()
export const MOCK_TIMELINE_EVENTS = createMockTimelineEvents()
export const MOCK_CHARACTER_GRAPH = createMockCharacterGraph()
export const MOCK_ENTITIES = createMockEncyclopediaEntities()
