import storage from '@/utils/storage'
import {
  DocumentStatus,
  DocumentType,
  type CreateDocumentRequest,
  type Document,
  type UpdateDocumentMetaRequest,
} from '../types/document'
import type {
  AutoSaveRequest,
  AutoSaveResponse,
  DocumentContentResponse,
  SaveStatusResponse,
  UpdateContentRequest,
} from '../types/editor'
import type {
  Character,
  CharacterGraph,
  CharacterRelation,
  CreateCharacterRequest,
  SaveRelationRequest,
  UpdateCharacterRequest,
} from '../types/character'
import { RelationType } from '../types/character'
import type {
  Location,
  LocationRelation,
  SaveLocationRelationRequest,
  SaveLocationRequest,
} from '../types/location'
import { LocationRelationType } from '../types/location'
import type { Concept, CreateConceptRequest, UpdateConceptRequest } from '../types/entity'
import type {
  SaveTimelineEventRequest,
  SaveTimelineRequest,
  Timeline,
  TimelineEvent,
} from '../types/timeline'
import { EventType } from '../types/timeline'
import type {
  CreateProjectRequest,
  ProjectDetailResponse,
  ProjectListResponse,
  ProjectSummary,
  UpdateProjectRequest,
} from '../api/project'
import type { EntityGraph, EntitySummary, StateValue } from '../api/entities'
import type { CreateOutlineRequest, OutlineTreeNode, UpdateOutlineRequest } from '../api/outline'
import { calculateWritingWordCount } from '../utils/wordCount'

type LocalProjectRecord = {
  id: string
  title: string
  summary: string
  coverUrl: string
  category: string
  tags: string[]
  status: string
  visibility: string
  createdAt: string
  updatedAt: string
}

type LocalDocumentRecord = Document
type LocalCharacterRecord = Character
type LocalCharacterRelationRecord = CharacterRelation
type LocalLocationRecord = Location
type LocalLocationRelationRecord = LocationRelation
type LocalConceptRecord = Concept
type LocalTimelineRecord = Timeline
type LocalTimelineEventRecord = TimelineEvent
type LocalGenericEntityRecord = {
  id: string
  projectId: string
  entityType: 'item' | 'organization'
  name: string
  alias?: string[]
  summary?: string
  createdAt: string
  updatedAt: string
}

type LocalDocumentContentRecord = {
  documentId: string
  content: string
  contentType: string
  version: number
  createdAt: string
  updatedAt: string
  lastSavedAt: string
}

type LocalWriterState = {
  projects: LocalProjectRecord[]
  documents: LocalDocumentRecord[]
  contents: Record<string, LocalDocumentContentRecord>
  characters: LocalCharacterRecord[]
  characterRelations: LocalCharacterRelationRecord[]
  locations: LocalLocationRecord[]
  locationRelations: LocalLocationRelationRecord[]
  concepts: LocalConceptRecord[]
  timelines: LocalTimelineRecord[]
  timelineEvents: LocalTimelineEventRecord[]
  genericEntities: LocalGenericEntityRecord[]
  entityStateFields: Record<string, Record<string, StateValue>>
}

type LegacyWriterItemRecord = {
  id: string
  projectId: string
  name: string
  alias?: string[]
  summary?: string
  category?: string
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'writer_standalone_local_state'
const VALIDATION_SAMPLE_PROJECT_ID = 'local-validation-yunlan'

function nowIso(): string {
  return new Date().toISOString()
}

function createId(prefix: string): string {
  const randomPart = Math.random().toString(36).slice(2, 8)
  return `${prefix}-${Date.now()}-${randomPart}`
}

function createEmptyState(): LocalWriterState {
  return {
    projects: [],
    documents: [],
    contents: {},
    characters: [],
    characterRelations: [],
    locations: [],
    locationRelations: [],
    concepts: [],
    timelines: [],
    timelineEvents: [],
    genericEntities: [],
    entityStateFields: {},
  }
}

function buildTipTapTextContent(paragraphs: string[]): string {
  return JSON.stringify({
    type: 'doc',
    content: paragraphs.map((text) => ({
      type: 'paragraph',
      content: text ? [{ type: 'text', text }] : [],
    })),
  })
}

function createInitialState(): LocalWriterState {
  const state = createEmptyState()
  seedValidationSampleProject(state)
  return state
}

function shouldInjectValidationSample(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const params = new URLSearchParams(window.location.search)
  return params.get('validationSample') === 'true'
}

function seedValidationSampleProject(state: LocalWriterState): void {
  if (state.projects.some((project) => project.id === VALIDATION_SAMPLE_PROJECT_ID)) {
    return
  }

  const createdAt = '2026-05-25T09:00:00.000Z'
  const updatedAt = '2026-05-25T09:20:00.000Z'
  const projectId = VALIDATION_SAMPLE_PROJECT_ID
  const timelineId = 'local-validation-yunlan-timeline-main'
  const docIds = {
    volume: 'local-validation-yunlan-volume-1',
    chapter1: 'local-validation-yunlan-chapter-1',
    chapter2: 'local-validation-yunlan-chapter-2',
    chapter3: 'local-validation-yunlan-chapter-3',
    chapter4: 'local-validation-yunlan-chapter-4',
    chapter5: 'local-validation-yunlan-chapter-5',
    chapter6: 'local-validation-yunlan-chapter-6',
    chapter7: 'local-validation-yunlan-chapter-7',
    chapter8: 'local-validation-yunlan-chapter-8',
  }
  const characterIds = {
    shenYi: 'local-validation-yunlan-character-shen-yi',
    luoQin: 'local-validation-yunlan-character-luo-qin',
    yuZhao: 'local-validation-yunlan-character-yu-zhao',
    heMu: 'local-validation-yunlan-character-he-mu',
    meiYun: 'local-validation-yunlan-character-mei-yun',
    tangQue: 'local-validation-yunlan-character-tang-que',
    xiaoRong: 'local-validation-yunlan-character-xiao-rong',
    baiLin: 'local-validation-yunlan-character-bai-lin',
  }
  const locationIds = {
    harbor: 'local-validation-yunlan-location-harbor',
    market: 'local-validation-yunlan-location-market',
    tower: 'local-validation-yunlan-location-tower',
    archive: 'local-validation-yunlan-location-archive',
    seaGate: 'local-validation-yunlan-location-sea-gate',
    shrine: 'local-validation-yunlan-location-shrine',
  }
  const conceptIds = {
    tideLoop: 'local-validation-yunlan-concept-tide-loop',
    silentBellLaw: 'local-validation-yunlan-concept-silent-bell-law',
    memoryDebt: 'local-validation-yunlan-concept-memory-debt',
  }
  const itemIds = {
    bell: 'local-validation-yunlan-item-bell',
    redLedger: 'local-validation-yunlan-item-red-ledger',
    silverKey: 'local-validation-yunlan-item-silver-key',
    tideMap: 'local-validation-yunlan-item-tide-map',
  }
  const organizationIds = {
    tideOffice: 'local-validation-yunlan-organization-tide-office',
    bellGuild: 'local-validation-yunlan-organization-bell-guild',
  }

  state.projects.unshift({
    id: projectId,
    title: '云岚验证样本',
    summary: '用于验证写作台工具链的完整短篇样本，覆盖跨章节正文引用、资产、关系图谱、时间线、结构舞台和审查上下文。',
    coverUrl: '',
    category: '东方奇幻',
    tags: ['验证样本', '短篇', '工具链'],
    status: 'draft',
    visibility: 'private',
    createdAt,
    updatedAt,
  })

  state.documents.push(
    {
      id: docIds.volume,
      projectId,
      title: '第一卷 潮铃未响',
      type: DocumentType.VOLUME,
      level: 0,
      order: 0,
      status: DocumentStatus.WRITING,
      wordCount: 0,
      tags: ['主线'],
      notes: '验证卷：串联角色、地点、物件、组织和概念。',
      createdAt,
      updatedAt,
      children: [],
    },
    {
      id: docIds.chapter1,
      projectId,
      parentId: docIds.volume,
      title: '第一章 雨市来信',
      type: DocumentType.CHAPTER,
      level: 1,
      order: 0,
      status: DocumentStatus.WRITING,
      wordCount: 0,
      characterIds: [characterIds.shenYi, characterIds.luoQin],
      locationIds: [locationIds.market],
      timelineIds: [timelineId],
      plotThreads: ['潮铃被盗', '洛琴身份'],
      tags: ['开端', '线索'],
      notes: '沈奕在雨市发现第一封假信，洛琴第一次暴露听潮司线索。',
      createdAt,
      updatedAt,
      children: [],
    },
    {
      id: docIds.chapter2,
      projectId,
      parentId: docIds.volume,
      title: '第二章 钟楼回声',
      type: DocumentType.CHAPTER,
      level: 1,
      order: 1,
      status: DocumentStatus.WRITING,
      wordCount: 0,
      characterIds: [characterIds.shenYi, characterIds.yuZhao],
      locationIds: [locationIds.tower],
      timelineIds: [timelineId],
      plotThreads: ['潮声回路', '余照追捕'],
      tags: ['追逐', '世界观'],
      notes: '钟楼回声证明潮声回路正在重启。',
      createdAt,
      updatedAt,
      children: [],
    },
    {
      id: docIds.chapter3,
      projectId,
      parentId: docIds.volume,
      title: '第三章 听潮司的门',
      type: DocumentType.CHAPTER,
      level: 1,
      order: 2,
      status: DocumentStatus.WRITING,
      wordCount: 0,
      characterIds: [characterIds.luoQin, characterIds.heMu],
      locationIds: [locationIds.harbor],
      timelineIds: [timelineId],
      plotThreads: ['组织真相', '贺牧背叛'],
      tags: ['反转', '组织'],
      notes: '洛琴带沈奕进入听潮司，贺牧交出伪造案卷。',
      createdAt,
      updatedAt,
      children: [],
    },
    {
      id: docIds.chapter4,
      projectId,
      parentId: docIds.volume,
      title: '第四章 潮铃归位',
      type: DocumentType.CHAPTER,
      level: 1,
      order: 3,
      status: DocumentStatus.PLANNED,
      wordCount: 0,
      characterIds: [
        characterIds.shenYi,
        characterIds.luoQin,
        characterIds.yuZhao,
        characterIds.heMu,
      ],
      locationIds: [locationIds.harbor, locationIds.tower],
      timelineIds: [timelineId],
      plotThreads: ['终局选择', '关系结算'],
      tags: ['高潮', '收束'],
      notes: '最终章草案：潮铃归位，但沈奕必须决定是否公开听潮司的旧罪。',
      createdAt,
      updatedAt,
      children: [],
    },
    {
      id: docIds.chapter5,
      projectId,
      parentId: docIds.volume,
      title: '第五章 红账册',
      type: DocumentType.CHAPTER,
      level: 1,
      order: 4,
      status: DocumentStatus.WRITING,
      wordCount: 0,
      characterIds: [characterIds.shenYi, characterIds.meiYun, characterIds.tangQue],
      locationIds: [locationIds.archive],
      timelineIds: [timelineId],
      plotThreads: ['账册缺页', '钟匠会入场'],
      tags: ['调查', '证据'],
      notes: '梅云交出红账册，唐阙指出钟匠会也被卷入旧案。',
      createdAt,
      updatedAt,
      children: [],
    },
    {
      id: docIds.chapter6,
      projectId,
      parentId: docIds.volume,
      title: '第六章 海门断潮',
      type: DocumentType.CHAPTER,
      level: 1,
      order: 5,
      status: DocumentStatus.WRITING,
      wordCount: 0,
      characterIds: [characterIds.yuZhao, characterIds.xiaoRong, characterIds.baiLin],
      locationIds: [locationIds.seaGate],
      timelineIds: [timelineId],
      plotThreads: ['海门封锁', '白麟交易'],
      tags: ['行动', '追捕'],
      notes: '海门断潮后，萧蓉试图带走潮汐图，白麟提出交易。',
      createdAt,
      updatedAt,
      children: [],
    },
    {
      id: docIds.chapter7,
      projectId,
      parentId: docIds.volume,
      title: '第七章 无声钟律',
      type: DocumentType.CHAPTER,
      level: 1,
      order: 6,
      status: DocumentStatus.PLANNED,
      wordCount: 0,
      characterIds: [characterIds.luoQin, characterIds.meiYun, characterIds.heMu],
      locationIds: [locationIds.shrine],
      timelineIds: [timelineId],
      plotThreads: ['钟律真相', '记忆债'],
      tags: ['揭秘', '代价'],
      notes: '无声钟律解释为什么云港必须遗忘，也暴露贺牧真正的恐惧。',
      createdAt,
      updatedAt,
      children: [],
    },
    {
      id: docIds.chapter8,
      projectId,
      parentId: docIds.volume,
      title: '第八章 归潮之后',
      type: DocumentType.CHAPTER,
      level: 1,
      order: 7,
      status: DocumentStatus.PLANNED,
      wordCount: 0,
      characterIds: [
        characterIds.shenYi,
        characterIds.luoQin,
        characterIds.yuZhao,
        characterIds.meiYun,
        characterIds.tangQue,
        characterIds.baiLin,
      ],
      locationIds: [locationIds.harbor, locationIds.shrine],
      timelineIds: [timelineId],
      plotThreads: ['公开真相', '城市选择'],
      tags: ['结局', '余波'],
      notes: '归潮之后，每个角色都要为是否保留记忆投出自己的选择。',
      createdAt,
      updatedAt,
      children: [],
    },
  )

  const chapterParagraphs: Record<string, string[]> = {
    [docIds.chapter1]: [
      '@沈奕 把伞沿压低，穿过 #雨市 的灯棚。雨水敲在摊布上，像有人用指节反复试探一口沉默的钟。',
      '@洛琴 递来的信纸只写着一句话：“%青铜潮铃 今夜不会响。”沈奕抬头时，远处 @听潮司 的灯已经一盏盏熄灭。',
      '这一章用于验证正文资产引用：@沈奕、@洛琴、#雨市、%青铜潮铃、@听潮司、@潮声回路 都应进入候选或已建档资产上下文。',
    ],
    [docIds.chapter2]: [
      '#旧钟楼 的回声比脚步更早抵达。@余照 站在断梯上，手里的令牌被雨水洗得发亮。',
      '@沈奕 听见第二次钟鸣时，终于确认 @潮声回路 不是传说，而是一套会吞掉记忆的旧城机关。',
      '余照没有拔刀，只问：“如果潮铃回到原位，你愿意让整座云港记起那场叛乱吗？”',
    ],
    [docIds.chapter3]: [
      '#云港 的内港没有浪，只有被锁住的船。@洛琴 推开 @听潮司 的暗门，把一册被烧过边角的案卷放到桌上。',
      '@贺牧 说自己只是保管钥匙的人，可他袖口露出的印泥，和伪造信上的红痕一模一样。',
      '这一章给审查面板提供冲突：洛琴选择坦白，贺牧继续遮掩，沈奕必须判断谁在保护云港。',
    ],
    [docIds.chapter4]: [
      '%青铜潮铃 被放回 #旧钟楼 的梁心。钟声没有响，整座 #云港 却同时安静下来。',
      '@沈奕、@洛琴、@余照、@贺牧 站在同一扇门前。门后是 @听潮司 的旧罪，也是 @潮声回路 最后一次启动。',
      '待写收束：公开真相，或让城市继续遗忘。',
    ],
    [docIds.chapter5]: [
      '@梅云 在 #司库密室 点亮一盏蓝灯，灯下摊开的 %红账册 缺了整整七页。',
      '@唐阙 认出账册边角的火漆，那是 @钟匠会 封存禁钟图纸时才会使用的旧印。',
      '@沈奕 第一次意识到，偷走 %青铜潮铃 的人也许不是为了启动 @潮声回路，而是为了偿还 @记忆债。',
    ],
    [docIds.chapter6]: [
      '#海门闸 的潮水突然倒退，@萧蓉 抱着 %潮汐图 冲进雨幕，身后是 @余照 布下的捕网。',
      '@白麟 没有阻拦她，只把一枚 %银钥匙 放在闸门石缝里，说：“想进 #潮祠，就拿这个换真相。”',
      '这一章用于验证行动场景：地点切到 #海门闸，物件切到 %潮汐图 / %银钥匙，组织线索转向 @钟匠会。',
    ],
    [docIds.chapter7]: [
      '#潮祠 里没有钟，只有刻在墙上的 @无声钟律。@洛琴 念出第一行时，@贺牧 的脸色终于变了。',
      '@梅云 说每一次让城市遗忘，都会把代价记到某个人身上，这就是 @记忆债。',
      '本章给审查包提供设定压力：洛琴的坦白、贺牧的恐惧、梅云的证据需要同时成立。',
    ],
    [docIds.chapter8]: [
      '#云港 的晨雾散开后，@沈奕 把 %青铜潮铃 留在 #潮祠 门前，让所有人自己决定要不要听见钟声。',
      '@洛琴、@余照、@梅云、@唐阙 与 @白麟 站在不同的队列里，每个人都带着一笔未还清的 @记忆债。',
      '结局章用于验证多角色、多地点、多物件、多概念同时进入 AI handoff 和审查上下文。',
    ],
  }

  for (const document of state.documents.filter((item) => item.projectId === projectId)) {
    const content = buildTipTapTextContent(chapterParagraphs[document.id] || [])
    state.contents[document.id] = {
      documentId: document.id,
      content,
      contentType: 'tiptap_json',
      version: 1,
      createdAt,
      updatedAt,
      lastSavedAt: updatedAt,
    }
    document.wordCount = countWords(content)
  }

  state.characters.push(
    {
      id: characterIds.shenYi,
      projectId,
      name: '沈奕',
      alias: ['沈先生'],
      summary: '失忆的旧城修铃匠，能听见潮铃残响。',
      traits: ['克制', '敏锐', '怕欠人情'],
      background: '三年前从云港外海被救起，对听潮司旧案只有碎片记忆。',
      currentState: '正在追查潮铃被盗案',
      customStatus: { courage: 4, suspicion: 72 },
      createdAt,
      updatedAt,
    },
    {
      id: characterIds.luoQin,
      projectId,
      name: '洛琴',
      alias: ['洛掌柜'],
      summary: '雨市茶摊老板，实际是听潮司旧案的幸存记录员。',
      traits: ['沉着', '擅长试探', '保护欲强'],
      background: '掌握潮声回路的半份账册，不愿让沈奕重蹈覆辙。',
      currentState: '准备向沈奕坦白身份',
      customStatus: { trustValue: 58, secretPressure: 86 },
      createdAt,
      updatedAt,
    },
    {
      id: characterIds.yuZhao,
      projectId,
      name: '余照',
      alias: ['余捕头'],
      summary: '云港巡捕头，奉命追捕盗铃者，却怀疑命令本身有问题。',
      traits: ['守序', '强硬', '重证据'],
      background: '父亲死于听潮司旧案，一直寻找案卷缺页。',
      currentState: '与沈奕暂时结盟',
      customStatus: { trustValue: 41, anger: 67 },
      createdAt,
      updatedAt,
    },
    {
      id: characterIds.heMu,
      projectId,
      name: '贺牧',
      alias: ['贺司簿'],
      summary: '听潮司现任司簿，负责保管旧案卷宗。',
      traits: ['圆滑', '谨慎', '擅长改写记录'],
      background: '曾参与封存潮声回路，知道潮铃归位后的代价。',
      currentState: '试图把责任推给洛琴',
      customStatus: { disguiseStability: 35, guilt: 79 },
      createdAt,
      updatedAt,
    },
    {
      id: characterIds.meiYun,
      projectId,
      name: '梅云',
      alias: ['梅司库'],
      summary: '听潮司司库，暗中保留红账册和禁钟账目。',
      traits: ['谨慎', '记忆力惊人', '不轻信任何承诺'],
      background: '曾替贺牧整理旧案，后来发现账册被系统性篡改。',
      currentState: '决定把红账册交给沈奕',
      customStatus: { trustValue: 36, evidenceRisk: 91 },
      createdAt,
      updatedAt,
    },
    {
      id: characterIds.tangQue,
      projectId,
      name: '唐阙',
      alias: ['唐匠首'],
      summary: '钟匠会年轻匠首，熟悉潮铃结构与禁钟图纸。',
      traits: ['毒舌', '手稳', '重契约'],
      background: '父辈曾参与建造旧钟楼，因此被听潮司长期监视。',
      currentState: '用技术线索换取钟匠会脱罪机会',
      customStatus: { leverage: 64, loyalty: 52 },
      createdAt,
      updatedAt,
    },
    {
      id: characterIds.xiaoRong,
      projectId,
      name: '萧蓉',
      alias: ['蓉娘'],
      summary: '海门闸船娘，偷走潮汐图以阻止海门断潮。',
      traits: ['果断', '嘴硬', '熟悉水路'],
      background: '家族世代守闸，知道海门闸与潮声回路的暗线。',
      currentState: '带着潮汐图逃离海门闸',
      customStatus: { stamina: 71, fearValue: 28 },
      createdAt,
      updatedAt,
    },
    {
      id: characterIds.baiLin,
      projectId,
      name: '白麟',
      alias: ['白先生'],
      summary: '外来商人，借银钥匙介入潮祠交易。',
      traits: ['优雅', '危险', '总在雨停前离开'],
      background: '替外港商路寻找潮声回路的控制权。',
      currentState: '观察各方是否愿意用记忆换取安全',
      customStatus: { disguiseStability: 77, threat: 68 },
      createdAt,
      updatedAt,
    },
  )

  state.characterRelations.push(
    {
      id: 'local-validation-yunlan-relation-shen-luo',
      projectId,
      fromId: characterIds.shenYi,
      toId: characterIds.luoQin,
      type: RelationType.ALLY,
      strength: 74,
      notes: '互相隐瞒关键信息，但目标一致。',
      createdAt,
      updatedAt,
    },
    {
      id: 'local-validation-yunlan-relation-shen-yu',
      projectId,
      fromId: characterIds.shenYi,
      toId: characterIds.yuZhao,
      type: RelationType.FRIEND,
      strength: 46,
      notes: '从追捕关系转向临时合作。',
      createdAt,
      updatedAt,
    },
    {
      id: 'local-validation-yunlan-relation-luo-he',
      projectId,
      fromId: characterIds.luoQin,
      toId: characterIds.heMu,
      type: RelationType.ENEMY,
      strength: 88,
      notes: '洛琴知道贺牧改写过旧案卷宗。',
      createdAt,
      updatedAt,
    },
    {
      id: 'local-validation-yunlan-relation-mei-he',
      projectId,
      fromId: characterIds.meiYun,
      toId: characterIds.heMu,
      type: RelationType.ENEMY,
      strength: 63,
      notes: '梅云掌握贺牧篡改账册的证据。',
      createdAt,
      updatedAt,
    },
    {
      id: 'local-validation-yunlan-relation-tang-shen',
      projectId,
      fromId: characterIds.tangQue,
      toId: characterIds.shenYi,
      type: RelationType.ALLY,
      strength: 57,
      notes: '唐阙用潮铃结构知识帮助沈奕解读钟声。',
      createdAt,
      updatedAt,
    },
    {
      id: 'local-validation-yunlan-relation-yu-xiao',
      projectId,
      fromId: characterIds.yuZhao,
      toId: characterIds.xiaoRong,
      type: RelationType.OTHER,
      strength: 44,
      notes: '追捕与保护交织，余照怀疑萧蓉掌握真正路线。',
      createdAt,
      updatedAt,
    },
    {
      id: 'local-validation-yunlan-relation-bai-luo',
      projectId,
      fromId: characterIds.baiLin,
      toId: characterIds.luoQin,
      type: RelationType.ENEMY,
      strength: 69,
      notes: '白麟想买走听潮司旧案，洛琴拒绝交易。',
      createdAt,
      updatedAt,
    },
    {
      id: 'local-validation-yunlan-relation-bai-tang',
      projectId,
      fromId: characterIds.baiLin,
      toId: characterIds.tangQue,
      type: RelationType.OTHER,
      strength: 51,
      notes: '白麟曾资助钟匠会，却要求唐阙交出禁钟图纸。',
      createdAt,
      updatedAt,
    },
  )

  state.locations.push(
    {
      id: locationIds.harbor,
      projectId,
      name: '云港',
      description: '被潮声回路保护也囚禁的海港城。',
      climate: '长雨季，海雾厚重',
      culture: '居民相信钟声能替城市保存记忆',
      geography: '外港连海，内港藏着听潮司暗门',
      atmosphere: '潮湿、克制、像一封没有署名的旧信',
      createdAt,
      updatedAt,
      children: [],
    },
    {
      id: locationIds.market,
      projectId,
      parentId: locationIds.harbor,
      name: '雨市',
      description: '云港夜间集市，消息和赝品都从这里流通。',
      climate: '棚顶常年滴水',
      culture: '摊主用灯色区分消息真假',
      geography: '靠近内港旧闸',
      atmosphere: '拥挤、低声、每个人都像在等钟响',
      createdAt,
      updatedAt,
      children: [],
    },
    {
      id: locationIds.tower,
      projectId,
      parentId: locationIds.harbor,
      name: '旧钟楼',
      description: '安放青铜潮铃的废弃钟楼，潮声回路的核心节点。',
      climate: '高处风急，雨水倒灌',
      culture: '禁钟之后无人敢上楼',
      geography: '俯瞰云港内外两港',
      atmosphere: '空旷、回声很长',
      createdAt,
      updatedAt,
      children: [],
    },
    {
      id: locationIds.archive,
      projectId,
      parentId: locationIds.harbor,
      name: '司库密室',
      description: '听潮司地下账册室，保存红账册和禁钟旧档。',
      climate: '潮气重，纸页需要蓝灯烘干',
      culture: '只有司库能记住真正的书架顺序',
      geography: '位于听潮司暗门之后，连通旧钟楼底座',
      atmosphere: '低矮、压抑、像被封口的证词',
      createdAt,
      updatedAt,
      children: [],
    },
    {
      id: locationIds.seaGate,
      projectId,
      parentId: locationIds.harbor,
      name: '海门闸',
      description: '控制云港潮位的水闸，也是潮声回路的外港节点。',
      climate: '风浪强，潮雾会遮断视线',
      culture: '守闸人用绳结记录潮汐异常',
      geography: '外港入口，向西可绕到潮祠',
      atmosphere: '急促、危险、所有声音都被水吞掉',
      createdAt,
      updatedAt,
      children: [],
    },
    {
      id: locationIds.shrine,
      projectId,
      parentId: locationIds.harbor,
      name: '潮祠',
      description: '无声钟律刻在墙上的旧祠堂，供奉第一任守钟人。',
      climate: '晨雾不散，石墙常年返潮',
      culture: '只有归潮日才允许入内',
      geography: '海门闸后的悬石台，退潮时露出石阶',
      atmosphere: '庄重、空旷、像城市在屏住呼吸',
      createdAt,
      updatedAt,
      children: [],
    },
  )

  state.locationRelations.push(
    {
      id: 'local-validation-yunlan-location-relation-harbor-market',
      projectId,
      fromId: locationIds.harbor,
      toId: locationIds.market,
      type: LocationRelationType.CONTAINS,
      distance: '步行一刻钟',
      notes: '雨市是云港消息流入口。',
      createdAt,
      updatedAt,
    },
    {
      id: 'local-validation-yunlan-location-relation-market-tower',
      projectId,
      fromId: locationIds.market,
      toId: locationIds.tower,
      type: LocationRelationType.CONNECTED,
      distance: '穿过旧闸后约三条街',
      notes: '追逐路线从雨市通向旧钟楼。',
      createdAt,
      updatedAt,
    },
    {
      id: 'local-validation-yunlan-location-relation-tower-archive',
      projectId,
      fromId: locationIds.tower,
      toId: locationIds.archive,
      type: LocationRelationType.CONNECTED,
      distance: '地下暗梯相连',
      notes: '旧钟楼底座可进入司库密室。',
      createdAt,
      updatedAt,
    },
    {
      id: 'local-validation-yunlan-location-relation-harbor-sea-gate',
      projectId,
      fromId: locationIds.harbor,
      toId: locationIds.seaGate,
      type: LocationRelationType.ADJACENT,
      distance: '半个时辰水路',
      notes: '海门闸控制云港潮位。',
      createdAt,
      updatedAt,
    },
    {
      id: 'local-validation-yunlan-location-relation-sea-gate-shrine',
      projectId,
      fromId: locationIds.seaGate,
      toId: locationIds.shrine,
      type: LocationRelationType.CONNECTED,
      distance: '退潮后露出石阶',
      notes: '归潮日才能从海门闸进入潮祠。',
      createdAt,
      updatedAt,
    },
  )

  state.concepts.push(
    {
      id: conceptIds.tideLoop,
      projectId,
      name: '潮声回路',
      alias: ['记忆回路'],
      summary: '以钟声保存并遮蔽城市记忆的旧机关。',
      description: '潮声回路会在潮铃归位时重启，让云港居民重新记起被听潮司封存的叛乱。',
      category: '世界规则',
      relatedCharacters: [characterIds.shenYi, characterIds.luoQin],
      relatedLocations: [locationIds.harbor, locationIds.tower],
      relatedItems: [itemIds.bell],
      relatedConcepts: [conceptIds.silentBellLaw, conceptIds.memoryDebt],
      createdAt,
      updatedAt,
    },
    {
      id: conceptIds.silentBellLaw,
      projectId,
      name: '无声钟律',
      alias: ['禁钟律'],
      summary: '潮铃不响时仍能改写城市记忆的律法。',
      description: '无声钟律规定：如果城市选择遗忘，守钟人必须承担对应记忆债。',
      category: '规则',
      relatedCharacters: [characterIds.luoQin, characterIds.heMu, characterIds.meiYun],
      relatedLocations: [locationIds.shrine],
      relatedItems: [itemIds.redLedger],
      relatedConcepts: [conceptIds.tideLoop, conceptIds.memoryDebt],
      createdAt,
      updatedAt,
    },
    {
      id: conceptIds.memoryDebt,
      projectId,
      name: '记忆债',
      alias: ['忘债'],
      summary: '每一次集体遗忘都会转移到某个守钟人身上的代价。',
      description: '记忆债会导致承担者逐渐失去个人记忆，直到城市重新承认被隐藏的事实。',
      category: '代价',
      relatedCharacters: [characterIds.shenYi, characterIds.meiYun, characterIds.baiLin],
      relatedLocations: [locationIds.archive, locationIds.shrine],
      relatedItems: [itemIds.bell, itemIds.redLedger],
      relatedConcepts: [conceptIds.tideLoop, conceptIds.silentBellLaw],
      createdAt,
      updatedAt,
    },
  )

  state.genericEntities.push(
    {
      id: itemIds.bell,
      projectId,
      entityType: 'item',
      name: '青铜潮铃',
      alias: ['潮铃'],
      summary: '启动潮声回路的核心物件，失窃后引发全篇冲突。',
      createdAt,
      updatedAt,
    },
    {
      id: itemIds.redLedger,
      projectId,
      entityType: 'item',
      name: '红账册',
      alias: ['司库账册'],
      summary: '记录听潮司记忆债流转的账册，缺页指向真正的盗铃者。',
      createdAt,
      updatedAt,
    },
    {
      id: itemIds.silverKey,
      projectId,
      entityType: 'item',
      name: '银钥匙',
      alias: ['潮祠钥'],
      summary: '打开潮祠退潮石门的钥匙，由白麟交给萧蓉。',
      createdAt,
      updatedAt,
    },
    {
      id: itemIds.tideMap,
      projectId,
      entityType: 'item',
      name: '潮汐图',
      alias: ['海门图'],
      summary: '标注潮声回路外港节点的水路图。',
      createdAt,
      updatedAt,
    },
    {
      id: organizationIds.tideOffice,
      projectId,
      entityType: 'organization',
      name: '听潮司',
      alias: ['司署'],
      summary: '负责维护云港记忆秩序的旧机构，隐藏了三年前的叛乱真相。',
      createdAt,
      updatedAt,
    },
    {
      id: organizationIds.bellGuild,
      projectId,
      entityType: 'organization',
      name: '钟匠会',
      alias: ['匠会'],
      summary: '建造旧钟楼和潮铃的工匠组织，被听潮司长期监视。',
      createdAt,
      updatedAt,
    },
  )

  state.entityStateFields = {
    ...state.entityStateFields,
    [conceptIds.tideLoop]: {
      activation: { current: 'partial', description: '第二章确认回路已部分重启' },
      danger: { current: 8, min: 0, max: 10, description: '重启会让全城记忆回流' },
    },
    [conceptIds.silentBellLaw]: {
      revealed: { current: 'chapter-7', description: '第七章揭示律法全文' },
      loophole: { current: 'unconfirmed', description: '是否可由全城共同承担代价仍待确认' },
    },
    [conceptIds.memoryDebt]: {
      holder: { current: 'unknown', description: '账册缺页隐藏当前承担者' },
      pressure: { current: 82, min: 0, max: 100, unit: '%', description: '债务接近转移临界值' },
    },
    [itemIds.bell]: {
      owner: { current: 'unknown', description: '第一章失窃，第四章归位' },
      integrity: { current: 62, min: 0, max: 100, unit: '%', description: '钟体裂纹影响最终响铃' },
    },
    [itemIds.redLedger]: {
      missingPages: { current: 7, description: '缺页数量，也是记忆债关键证据' },
    },
    [itemIds.silverKey]: {
      holder: { current: '白麟', description: '第六章交给萧蓉' },
    },
    [itemIds.tideMap]: {
      route: { current: '海门闸 -> 潮祠', description: '标出退潮石阶' },
    },
    [organizationIds.tideOffice]: {
      exposure: { current: 'rising', description: '第三章开始暴露旧案' },
    },
    [organizationIds.bellGuild]: {
      suspicion: { current: 'medium', description: '第五章被红账册牵连' },
    },
  }

  state.timelines.push({
    id: timelineId,
    projectId,
    name: '主时间线',
    description: '验证样本主线：失窃、追查、坦白、归位。',
    startTime: { era: '云港历', year: 312, season: '雨季', description: '雨季第一夜' },
    endTime: { era: '云港历', year: 312, season: '雨季', description: '潮铃归位夜' },
    createdAt,
    updatedAt,
  })

  state.timelineEvents.push(
    {
      id: 'local-validation-yunlan-event-letter',
      projectId,
      timelineId,
      title: '雨市收到假信',
      description: '沈奕收到关于青铜潮铃的假信，洛琴第一次提供线索。',
      storyTime: { era: '云港历', year: 312, season: '雨季', description: '第一夜 子时前' },
      duration: '一炷香',
      impact: '建立潮铃失窃主冲突，并把沈奕与洛琴绑定到同一目标。',
      participants: [characterIds.shenYi, characterIds.luoQin],
      locationIds: [locationIds.market],
      chapterIds: [docIds.chapter1],
      eventType: EventType.PLOT,
      importance: 7,
      createdAt,
      updatedAt,
    },
    {
      id: 'local-validation-yunlan-event-tower',
      projectId,
      timelineId,
      title: '旧钟楼响起第二次回声',
      description: '余照截住沈奕，钟楼回声证明潮声回路已经被触发。',
      storyTime: { era: '云港历', year: 312, season: '雨季', description: '第一夜 子时' },
      duration: '半刻',
      impact: '把案件从普通盗窃升级为城市记忆危机。',
      participants: [characterIds.shenYi, characterIds.yuZhao],
      locationIds: [locationIds.tower],
      chapterIds: [docIds.chapter2],
      eventType: EventType.WORLD,
      importance: 8,
      createdAt,
      updatedAt,
    },
    {
      id: 'local-validation-yunlan-event-office',
      projectId,
      timelineId,
      title: '听潮司案卷暴露',
      description: '洛琴带沈奕进入听潮司，贺牧交出被改写的旧案卷。',
      storyTime: { era: '云港历', year: 312, season: '雨季', description: '第二夜 入夜' },
      duration: '一场对质',
      impact: '角色关系转向对立，终局选择被推到台前。',
      participants: [characterIds.shenYi, characterIds.luoQin, characterIds.heMu],
      locationIds: [locationIds.harbor],
      chapterIds: [docIds.chapter3],
      eventType: EventType.CHARACTER,
      importance: 9,
      createdAt,
      updatedAt,
    },
    {
      id: 'local-validation-yunlan-event-return',
      projectId,
      timelineId,
      title: '潮铃归位',
      description: '青铜潮铃回到旧钟楼，所有人必须决定是否让云港记起真相。',
      storyTime: { era: '云港历', year: 312, season: '雨季', description: '第三夜 黎明前' },
      duration: '待写高潮',
      impact: '短篇收束点，可验证未完成章节的计划态和审查提示。',
      participants: [
        characterIds.shenYi,
        characterIds.luoQin,
        characterIds.yuZhao,
        characterIds.heMu,
      ],
      locationIds: [locationIds.tower, locationIds.harbor],
      chapterIds: [docIds.chapter4],
      eventType: EventType.MILESTONE,
      importance: 10,
      createdAt,
      updatedAt,
    },
    {
      id: 'local-validation-yunlan-event-ledger',
      projectId,
      timelineId,
      title: '红账册缺页现身',
      description: '梅云交出红账册，唐阙确认钟匠会旧印，调查线扩展到工匠组织。',
      storyTime: { era: '云港历', year: 312, season: '雨季', description: '第三夜 子时后' },
      duration: '一场密谈',
      impact: '新增账册证据、钟匠会组织线和记忆债概念。',
      participants: [characterIds.shenYi, characterIds.meiYun, characterIds.tangQue],
      locationIds: [locationIds.archive],
      chapterIds: [docIds.chapter5],
      eventType: EventType.PLOT,
      importance: 8,
      createdAt,
      updatedAt,
    },
    {
      id: 'local-validation-yunlan-event-sea-gate',
      projectId,
      timelineId,
      title: '海门闸断潮',
      description: '萧蓉带走潮汐图，余照封锁海门闸，白麟用银钥匙提出交易。',
      storyTime: { era: '云港历', year: 312, season: '雨季', description: '第四夜 潮退前' },
      duration: '一段追逐',
      impact: '把地点推进到外港，并让潮祠入口首次可达。',
      participants: [characterIds.yuZhao, characterIds.xiaoRong, characterIds.baiLin],
      locationIds: [locationIds.seaGate],
      chapterIds: [docIds.chapter6],
      eventType: EventType.CHARACTER,
      importance: 8,
      createdAt,
      updatedAt,
    },
    {
      id: 'local-validation-yunlan-event-silent-law',
      projectId,
      timelineId,
      title: '无声钟律被读出',
      description: '洛琴、梅云和贺牧在潮祠确认无声钟律，记忆债真相浮出水面。',
      storyTime: { era: '云港历', year: 312, season: '雨季', description: '第四夜 黎明前' },
      duration: '半章揭秘',
      impact: '解释城市遗忘机制，并为结局选择提供明确代价。',
      participants: [characterIds.luoQin, characterIds.meiYun, characterIds.heMu],
      locationIds: [locationIds.shrine],
      chapterIds: [docIds.chapter7],
      eventType: EventType.WORLD,
      importance: 10,
      createdAt,
      updatedAt,
    },
    {
      id: 'local-validation-yunlan-event-after-tide',
      projectId,
      timelineId,
      title: '归潮之后的投票',
      description: '云港居民决定是否保留恢复的记忆，主要角色各自选择承担或拒绝记忆债。',
      storyTime: { era: '云港历', year: 312, season: '雨季', description: '第五日 清晨' },
      duration: '结局余波',
      impact: '收束角色关系、组织责任和城市选择。',
      participants: [
        characterIds.shenYi,
        characterIds.luoQin,
        characterIds.yuZhao,
        characterIds.meiYun,
        characterIds.tangQue,
        characterIds.baiLin,
      ],
      locationIds: [locationIds.harbor, locationIds.shrine],
      chapterIds: [docIds.chapter8],
      eventType: EventType.MILESTONE,
      importance: 9,
      createdAt,
      updatedAt,
    },
  )
}

function readState(): LocalWriterState {
  const saved = storage.get<LocalWriterState | null>(STORAGE_KEY, null)
  if (!saved) {
    return createInitialState()
  }

  const state = {
    projects: Array.isArray(saved.projects) ? saved.projects : [],
    documents: Array.isArray(saved.documents) ? saved.documents : [],
    contents:
      saved.contents && typeof saved.contents === 'object' && !Array.isArray(saved.contents)
        ? saved.contents
        : {},
    characters: Array.isArray(saved.characters) ? saved.characters : [],
    characterRelations: Array.isArray(saved.characterRelations) ? saved.characterRelations : [],
    locations: Array.isArray(saved.locations) ? saved.locations : [],
    locationRelations: Array.isArray(saved.locationRelations) ? saved.locationRelations : [],
    concepts: Array.isArray(saved.concepts) ? saved.concepts : [],
    timelines: Array.isArray(saved.timelines) ? saved.timelines : [],
    timelineEvents: Array.isArray(saved.timelineEvents) ? saved.timelineEvents : [],
    genericEntities: Array.isArray(saved.genericEntities) ? saved.genericEntities : [],
    entityStateFields:
      saved.entityStateFields &&
      typeof saved.entityStateFields === 'object' &&
      !Array.isArray(saved.entityStateFields)
        ? saved.entityStateFields
        : {},
  }

  if (shouldInjectValidationSample()) {
    seedValidationSampleProject(state)
  }

  return state
}

function writeState(state: LocalWriterState): LocalWriterState {
  storage.set(STORAGE_KEY, state)
  return state
}

function migrateLegacyWriterItemsForProject(
  state: LocalWriterState,
  projectId: string,
): LocalWriterState {
  if (!projectId) {
    return state
  }

  if (typeof localStorage === 'undefined' || !localStorage.getItem(`qingyu_writer_items:${projectId}`)) {
    return state
  }

  const existingIds = new Set(state.genericEntities.map((entity) => entity.id))
  let migrated = false

  for (const item of loadLegacyWriterItems(projectId)) {
    if (!item.id || !item.name?.trim() || existingIds.has(item.id)) {
      continue
    }

    state.genericEntities.push({
      id: item.id,
      projectId,
      entityType: item.category === 'organization' ? 'organization' : 'item',
      name: item.name.trim(),
      alias: normalizeStringArray(item.alias),
      summary: item.summary || '',
      createdAt: item.createdAt || nowIso(),
      updatedAt: item.updatedAt || nowIso(),
    })
    existingIds.add(item.id)
    migrated = true
  }

  if (migrated) {
    writeState(state)
  }

  return state
}

function loadLegacyWriterItems(projectId: string): LegacyWriterItemRecord[] {
  if (!projectId || typeof localStorage === 'undefined') {
    return []
  }

  try {
    const raw = localStorage.getItem(`qingyu_writer_items:${projectId}`)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as LegacyWriterItemRecord[]) : []
  } catch {
    return []
  }
}

function isRootParent(parentId?: string): boolean {
  return !parentId || parentId === '000000000000000000000000'
}

function extractPlainText(content: string): string {
  if (!content) {
    return ''
  }

  try {
    const parsed = JSON.parse(content) as { type?: string; text?: string; content?: unknown[] }
    const walk = (node: unknown): string => {
      if (!node || typeof node !== 'object') {
        return ''
      }
      const typed = node as { type?: string; text?: string; content?: unknown[] }
      if (typed.type === 'text') {
        return typed.text || ''
      }
      if (!Array.isArray(typed.content)) {
        return ''
      }
      return typed.content.map(walk).join('')
    }
    return walk(parsed)
  } catch {
    return content
  }
}

function countWords(content: string): number {
  return calculateWritingWordCount(extractPlainText(content))
}

function buildDefaultDocumentContent(): string {
  return JSON.stringify({
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [],
      },
    ],
  })
}

function normalizeStoredContent(contents: unknown[]): string {
  if (!Array.isArray(contents) || contents.length === 0) {
    return JSON.stringify({ type: 'doc', content: [] })
  }

  const paragraphBlocks = contents
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return ''
      }
      return typeof (item as { content?: unknown }).content === 'string'
        ? ((item as { content: string }).content || '')
        : ''
    })
    .filter((item) => item.length > 0)

  if (paragraphBlocks.length === 1) {
    const [singleBlock] = paragraphBlocks
    try {
      const parsed = JSON.parse(singleBlock) as { type?: string; content?: unknown[] }
      if (parsed.type === 'doc' && Array.isArray(parsed.content)) {
        return singleBlock
      }
    } catch {
      // treat as plain text block below
    }
  }

  if (paragraphBlocks.length > 0) {
    return paragraphBlocks.join('\n\n')
  }

  const firstItem = contents[0]
  return typeof firstItem === 'string'
    ? firstItem
    : JSON.stringify(firstItem ?? { type: 'doc', content: [] })
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

function getProjectDocuments(state: LocalWriterState, projectId: string): LocalDocumentRecord[] {
  return state.documents
    .filter((document) => document.projectId === projectId)
    .sort((left, right) => {
      const orderDelta = Number(left.order || 0) - Number(right.order || 0)
      if (orderDelta !== 0) {
        return orderDelta
      }
      return left.createdAt.localeCompare(right.createdAt)
    })
}

function getProjectCharacters(state: LocalWriterState, projectId: string): LocalCharacterRecord[] {
  return state.characters
    .filter((character) => character.projectId === projectId)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
}

function getProjectCharacterRelations(
  state: LocalWriterState,
  projectId: string,
  characterId?: string,
): LocalCharacterRelationRecord[] {
  return state.characterRelations
    .filter((relation) => relation.projectId === projectId)
    .filter((relation) =>
      characterId ? relation.fromId === characterId || relation.toId === characterId : true,
    )
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
}

function getProjectLocations(state: LocalWriterState, projectId: string): LocalLocationRecord[] {
  return state.locations
    .filter((location) => location.projectId === projectId)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
}

function getProjectConcepts(state: LocalWriterState, projectId: string): LocalConceptRecord[] {
  return state.concepts
    .filter((concept) => concept.projectId === projectId)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
}

function getProjectLocationRelations(
  state: LocalWriterState,
  projectId: string,
  locationId?: string,
): LocalLocationRelationRecord[] {
  return state.locationRelations
    .filter((relation) => relation.projectId === projectId)
    .filter((relation) =>
      locationId ? relation.fromId === locationId || relation.toId === locationId : true,
    )
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
}

function getProjectTimelines(state: LocalWriterState, projectId: string): LocalTimelineRecord[] {
  return state.timelines
    .filter((timeline) => timeline.projectId === projectId)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
}

function getTimelineEvents(state: LocalWriterState, timelineId: string): LocalTimelineEventRecord[] {
  return state.timelineEvents
    .filter((event) => event.timelineId === timelineId)
    .sort((left, right) => {
      const leftTime = JSON.stringify(left.storyTime || {})
      const rightTime = JSON.stringify(right.storyTime || {})
      return leftTime.localeCompare(rightTime) || left.createdAt.localeCompare(right.createdAt)
    })
}

function enrichProjectSummary(
  project: LocalProjectRecord,
  documents: LocalDocumentRecord[],
): ProjectSummary {
  const chapterCount = documents.filter((document) => document.type === DocumentType.CHAPTER).length
  const totalWords = documents.reduce((sum, document) => sum + Number(document.wordCount || 0), 0)

  return {
    id: project.id,
    title: project.title,
    summary: project.summary,
    coverUrl: project.coverUrl,
    category: project.category,
    tags: project.tags,
    status: project.status,
    visibility: project.visibility,
    chapterCount,
    totalWords,
    wordCount: totalWords,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    lastUpdateTime: project.updatedAt,
  }
}

function buildProjectDetail(
  state: LocalWriterState,
  project: LocalProjectRecord,
): ProjectDetailResponse {
  const documents = getProjectDocuments(state, project.id)
  const characters = getProjectCharacters(state, project.id)
  const locations = getProjectLocations(state, project.id)
  const timelines = getProjectTimelines(state, project.id)
  const summary = enrichProjectSummary(project, documents)

  return {
    id: project.id,
    title: project.title,
    description: project.summary,
    coverImage: project.coverUrl,
    genre: project.category,
    tags: project.tags,
    status: project.status,
    visibility: project.visibility,
    totalWords: summary.totalWords || 0,
    chapterCount: summary.chapterCount || 0,
    lastUpdateTime: project.updatedAt,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    documents: documents.map((document) => ({
      id: document.id,
      title: document.title,
      type: document.type,
      wordCount: document.wordCount,
      lastEditAt: document.updatedAt || project.updatedAt,
      status: String(document.status || DocumentStatus.WRITING),
      sortOrder: Number(document.order || 0),
    })),
    characters,
    locations,
    timeline: timelines.flatMap((timeline) => getTimelineEvents(state, timeline.id)),
  }
}

function cloneDocument(document: LocalDocumentRecord): LocalDocumentRecord {
  return {
    ...document,
    children: Array.isArray(document.children) ? document.children.map(cloneDocument) : undefined,
  }
}

function cloneLocation(location: LocalLocationRecord): LocalLocationRecord {
  return {
    ...location,
    children: Array.isArray(location.children) ? location.children.map(cloneLocation) : undefined,
  }
}

function buildDocumentTree(documents: LocalDocumentRecord[]): LocalDocumentRecord[] {
  const nodes: LocalDocumentRecord[] = documents.map((document) => ({
    ...cloneDocument(document),
    children: [] as LocalDocumentRecord[],
  }))
  const nodeMap = new Map(nodes.map((document) => [document.id, document]))
  const roots: LocalDocumentRecord[] = []

  for (const node of nodes) {
    const parentId = node.parentId
    if (!parentId || !nodeMap.has(parentId)) {
      roots.push(node)
      continue
    }

    nodeMap.get(parentId)?.children?.push(node)
  }

  const sortTree = (items: LocalDocumentRecord[]) => {
    items.sort((left, right) => Number(left.order || 0) - Number(right.order || 0))
    for (const item of items) {
      if (item.children?.length) {
        sortTree(item.children)
      }
    }
  }

  sortTree(roots)
  return roots
}

function buildLocationTree(locations: LocalLocationRecord[]): LocalLocationRecord[] {
  const nodes = locations.map((location) => ({
    ...cloneLocation(location),
    children: [] as LocalLocationRecord[],
  }))
  const nodeMap = new Map(nodes.map((location) => [location.id, location]))
  const roots: LocalLocationRecord[] = []

  for (const node of nodes) {
    const parentId = node.parentId
    if (!parentId || !nodeMap.has(parentId)) {
      roots.push(node)
      continue
    }

    nodeMap.get(parentId)?.children?.push(node)
  }

  const sortTree = (items: LocalLocationRecord[]) => {
    items.sort((left, right) => left.createdAt.localeCompare(right.createdAt))
    for (const item of items) {
      if (item.children?.length) {
        sortTree(item.children)
      }
    }
  }

  sortTree(roots)
  return roots
}

function buildContentResponse(
  state: LocalWriterState,
  documentId: string,
): DocumentContentResponse {
  const contentRecord = state.contents[documentId]
  const content = contentRecord?.content || ''
  const plainText = extractPlainText(content)
  const charCount = plainText.length

  return {
    id: `content-${documentId}`,
    documentId,
    content,
    contentType: (contentRecord?.contentType as any) || 'tiptap_json',
    wordCount: countWords(content),
    charCount,
    version: Number(contentRecord?.version || 1),
    lastSavedAt: contentRecord?.lastSavedAt || nowIso(),
    lastEditedBy: 'standalone-local',
    updatedAt: contentRecord?.updatedAt || nowIso(),
    createdAt: contentRecord?.createdAt || nowIso(),
  }
}

function touchProject(state: LocalWriterState, projectId: string): void {
  const project = state.projects.find((item) => item.id === projectId)
  if (project) {
    project.updatedAt = nowIso()
  }
}

function scrubDeletedEntityRefs(state: LocalWriterState, key: 'characterIds' | 'locationIds', entityId: string) {
  for (const document of state.documents) {
    const existing = Array.isArray(document[key]) ? document[key] : []
    if (existing.includes(entityId)) {
      document[key] = existing.filter((item) => item !== entityId) as never
      document.updatedAt = nowIso()
    }
  }
}

function removeDocumentRecursively(state: LocalWriterState, documentId: string): void {
  const children = state.documents.filter((document) => document.parentId === documentId)
  for (const child of children) {
    removeDocumentRecursively(state, child.id)
  }

  state.documents = state.documents.filter((document) => document.id !== documentId)
  delete state.contents[documentId]
}

function getDocumentOrThrow(state: LocalWriterState, documentId: string): LocalDocumentRecord {
  const document = state.documents.find((item) => item.id === documentId)
  if (!document) {
    throw new Error(`文档不存在: ${documentId}`)
  }
  return document
}

function getCharacterOrThrow(state: LocalWriterState, characterId: string): LocalCharacterRecord {
  const character = state.characters.find((item) => item.id === characterId)
  if (!character) {
    throw new Error(`角色不存在: ${characterId}`)
  }
  return character
}

function getLocationOrThrow(state: LocalWriterState, locationId: string): LocalLocationRecord {
  const location = state.locations.find((item) => item.id === locationId)
  if (!location) {
    throw new Error(`地点不存在: ${locationId}`)
  }
  return location
}

function getConceptOrThrow(state: LocalWriterState, conceptId: string): LocalConceptRecord {
  const concept = state.concepts.find((item) => item.id === conceptId)
  if (!concept) {
    throw new Error(`概念不存在: ${conceptId}`)
  }
  return concept
}

function getTimelineOrThrow(state: LocalWriterState, timelineId: string): LocalTimelineRecord {
  const timeline = state.timelines.find((item) => item.id === timelineId)
  if (!timeline) {
    throw new Error(`时间线不存在: ${timelineId}`)
  }
  return timeline
}

function getTimelineEventOrThrow(
  state: LocalWriterState,
  eventId: string,
): LocalTimelineEventRecord {
  const event = state.timelineEvents.find((item) => item.id === eventId)
  if (!event) {
    throw new Error(`时间线事件不存在: ${eventId}`)
  }
  return event
}

function getEntityStateFields(
  state: LocalWriterState,
  entityId: string,
): Record<string, StateValue> | undefined {
  return state.entityStateFields[entityId]
}

function removeLocationRecursively(state: LocalWriterState, locationId: string): string[] {
  const children = state.locations.filter((location) => location.parentId === locationId)
  const removedIds = [locationId]
  for (const child of children) {
    removedIds.push(...removeLocationRecursively(state, child.id))
  }

  state.locations = state.locations.filter((location) => location.id !== locationId)
  state.locationRelations = state.locationRelations.filter(
    (relation) => relation.fromId !== locationId && relation.toId !== locationId,
  )
  return removedIds
}

function ensureProjectDefaultTimeline(
  state: LocalWriterState,
  projectId: string,
): LocalTimelineRecord {
  const existing = getProjectTimelines(state, projectId)[0]
  if (existing) {
    return existing
  }

  const createdAt = nowIso()
  const timeline: LocalTimelineRecord = {
    id: createId('local-timeline'),
    projectId,
    name: '主时间线',
    description: '',
    createdAt,
    updatedAt: createdAt,
  }
  state.timelines.push(timeline)
  touchProject(state, projectId)
  writeState(state)
  return timeline
}

function mapConceptToEntitySummary(
  state: LocalWriterState,
  concept: LocalConceptRecord,
): EntitySummary {
  return {
    id: concept.id,
    name: concept.name,
    entityType: 'concept',
    summary: concept.summary || concept.description || '',
    stateFields: getEntityStateFields(state, concept.id),
  }
}

function updateSiblingOrder(
  state: LocalWriterState,
  projectId: string,
  parentId: string | undefined,
  movedId?: string,
  preferredOrder?: number,
): void {
  const siblings = state.documents
    .filter(
      (document) =>
        document.projectId === projectId &&
        (document.parentId || undefined) === (parentId || undefined),
    )
    .sort((left, right) => Number(left.order || 0) - Number(right.order || 0))

  if (movedId) {
    const movedIndex = siblings.findIndex((item) => item.id === movedId)
    if (movedIndex >= 0) {
      const [moved] = siblings.splice(movedIndex, 1)
      const nextIndex =
        typeof preferredOrder === 'number' && preferredOrder >= 0
          ? Math.min(preferredOrder, siblings.length)
          : siblings.length
      siblings.splice(nextIndex, 0, moved)
    }
  }

  siblings.forEach((document, index) => {
    document.order = index
  })
}

function resolveNextDocumentOrder(
  state: LocalWriterState,
  projectId: string,
  parentId: string | undefined,
): number {
  const siblingOrders = state.documents
    .filter(
      (document) =>
        document.projectId === projectId &&
        (document.parentId || undefined) === (parentId || undefined),
    )
    .map((document) => Number(document.order || 0))
    .filter((order) => Number.isFinite(order))

  if (siblingOrders.length === 0) {
    return 0
  }

  return Math.max(...siblingOrders) + 1
}

async function listProjects(): Promise<ProjectListResponse> {
  const state = readState()
  const projects = state.projects.map((project) =>
    enrichProjectSummary(project, getProjectDocuments(state, project.id)),
  )

  return {
    projects,
    total: projects.length,
    page: 1,
    size: projects.length,
    pageSize: projects.length,
  }
}

async function createProject(data: CreateProjectRequest): Promise<ProjectDetailResponse> {
  const state = readState()
  const createdAt = nowIso()
  const project: LocalProjectRecord = {
    id: createId('local-project'),
    title: data.title?.trim() || '未命名项目',
    summary: data.summary || data.description || '',
    coverUrl: data.coverUrl || data.coverImage || '',
    category: data.category || data.genre || '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    status: 'draft',
    visibility: data.visibility || 'private',
    createdAt,
    updatedAt: createdAt,
  }

  state.projects.unshift(project)
  writeState(state)
  return buildProjectDetail(state, project)
}

async function getProject(projectId: string): Promise<ProjectDetailResponse> {
  const state = readState()
  const project = state.projects.find((item) => item.id === projectId)
  if (!project) {
    throw new Error(`项目不存在: ${projectId}`)
  }
  return buildProjectDetail(state, project)
}

async function updateProject(projectId: string, data: UpdateProjectRequest): Promise<void> {
  const state = readState()
  const project = state.projects.find((item) => item.id === projectId)
  if (!project) {
    throw new Error(`项目不存在: ${projectId}`)
  }

  project.title = data.title?.trim() || project.title
  project.summary = data.description ?? project.summary
  project.coverUrl = data.coverImage ?? project.coverUrl
  project.category = data.genre ?? project.category
  project.tags = Array.isArray(data.tags) ? data.tags : project.tags
  project.status = data.status || project.status
  project.visibility = data.visibility || project.visibility
  project.updatedAt = nowIso()
  writeState(state)
}

async function deleteProject(projectId: string): Promise<void> {
  const state = readState()
  state.projects = state.projects.filter((project) => project.id !== projectId)
  const projectDocumentIds = state.documents
    .filter((document) => document.projectId === projectId)
    .map((document) => document.id)
  state.documents = state.documents.filter((document) => document.projectId !== projectId)
  for (const documentId of projectDocumentIds) {
    delete state.contents[documentId]
  }
  writeState(state)
}

async function listDocuments(projectId: string): Promise<{ documents: Document[]; total: number }> {
  const state = readState()
  const documents = getProjectDocuments(state, projectId).map(cloneDocument)
  return {
    documents,
    total: documents.length,
  }
}

async function getDocumentTree(projectId: string): Promise<Document[]> {
  const state = readState()
  return buildDocumentTree(getProjectDocuments(state, projectId))
}

async function getDocument(documentId: string): Promise<Document> {
  const state = readState()
  return cloneDocument(getDocumentOrThrow(state, documentId))
}

async function createDocument(projectId: string, data: CreateDocumentRequest): Promise<Document> {
  const state = readState()
  const createdAt = nowIso()
  const parentId = isRootParent(data.parentId) ? undefined : data.parentId
  const order =
    typeof data.order === 'number' && Number.isFinite(data.order)
      ? data.order
      : resolveNextDocumentOrder(state, projectId, parentId)
  const document: LocalDocumentRecord = {
    id: createId('local-doc'),
    documentId: undefined,
    projectId,
    parentId,
    title: data.title?.trim() || '未命名文档',
    type: data.type,
    level: parentId ? 1 : 0,
    order,
    status: DocumentStatus.WRITING,
    wordCount: 0,
    createdAt,
    updatedAt: createdAt,
    children: [],
  }

  state.documents.push(document)
  state.contents[document.id] = {
    documentId: document.id,
    content: buildDefaultDocumentContent(),
    contentType: 'tiptap_json',
    version: 1,
    createdAt,
    updatedAt: createdAt,
    lastSavedAt: createdAt,
  }
  updateSiblingOrder(state, projectId, document.parentId, document.id, document.order)
  touchProject(state, projectId)
  writeState(state)
  return cloneDocument(document)
}

async function updateDocument(documentId: string, data: UpdateDocumentMetaRequest): Promise<void> {
  const state = readState()
  const document = getDocumentOrThrow(state, documentId)

  if (data.title?.trim()) {
    document.title = data.title.trim()
  }
  if (data.status) {
    document.status = data.status
  }
  if (Array.isArray(data.characterIds)) {
    document.characterIds = data.characterIds
  }
  if (Array.isArray(data.locationIds)) {
    document.locationIds = data.locationIds
  }
  if (Array.isArray(data.timelineIds)) {
    document.timelineIds = data.timelineIds
  }
  if (Array.isArray(data.tags)) {
    document.tags = data.tags
  }
  if (typeof data.notes === 'string') {
    document.notes = data.notes
  }
  if (Array.isArray(data.plotThreads)) {
    document.plotThreads = data.plotThreads
  }

  document.updatedAt = nowIso()

  touchProject(state, document.projectId)
  writeState(state)
}

async function deleteDocument(documentId: string): Promise<void> {
  const state = readState()
  const document = getDocumentOrThrow(state, documentId)
  removeDocumentRecursively(state, documentId)
  updateSiblingOrder(state, document.projectId, document.parentId)
  touchProject(state, document.projectId)
  writeState(state)
}

async function moveDocument(
  documentId: string,
  data: { parentId?: string; order?: number },
): Promise<{ code: number; message: string }> {
  const state = readState()
  const document = getDocumentOrThrow(state, documentId)
  const previousParentId = document.parentId
  document.parentId = isRootParent(data.parentId) ? undefined : data.parentId
  document.level = document.parentId ? 1 : 0
  document.updatedAt = nowIso()

  updateSiblingOrder(state, document.projectId, previousParentId)
  updateSiblingOrder(state, document.projectId, document.parentId, documentId, data.order)
  touchProject(state, document.projectId)
  writeState(state)
  return { code: 200, message: 'ok' }
}

async function getContent(documentId: string): Promise<DocumentContentResponse> {
  const state = readState()
  getDocumentOrThrow(state, documentId)
  return buildContentResponse(state, documentId)
}

async function updateContent(documentId: string, data: UpdateContentRequest): Promise<void> {
  const state = readState()
  const document = getDocumentOrThrow(state, documentId)
  const existing = state.contents[documentId]
  const updatedAt = nowIso()
  const nextVersion = Math.max(Number(existing?.version || 0) + 1, Number(data.version || 0) + 1)

  state.contents[documentId] = {
    documentId,
    content: data.content || '',
    contentType: 'tiptap_json',
    version: nextVersion,
    createdAt: existing?.createdAt || updatedAt,
    updatedAt,
    lastSavedAt: updatedAt,
  }
  document.wordCount = countWords(data.content || '')
  document.updatedAt = updatedAt
  touchProject(state, document.projectId)
  writeState(state)
}

async function autoSave(documentId: string, data: AutoSaveRequest): Promise<AutoSaveResponse> {
  await updateContent(documentId, data)
  const saved = await getContent(documentId)
  return {
    version: saved.version,
    lastSavedAt: saved.lastSavedAt,
    status: 'success',
  }
}

async function getSaveStatus(documentId: string): Promise<SaveStatusResponse> {
  const content = await getContent(documentId)
  return {
    isSaved: true,
    lastSavedAt: content.lastSavedAt,
    version: content.version,
    lastEditedBy: 'standalone-local',
  }
}

async function getContents(documentId: string): Promise<{ contents: Array<Record<string, unknown>> }> {
  const content = await getContent(documentId)
  return {
    contents: [
      {
        paragraphId: `p-${documentId}`,
        order: 1,
        content: content.content,
        contentType: content.contentType,
        version: content.version,
        updatedAt: content.updatedAt,
      },
    ],
  }
}

async function replaceContents(documentId: string, contents: unknown[]): Promise<void> {
  await updateContent(documentId, {
    documentId,
    content: normalizeStoredContent(contents),
    version: 1,
  })
}

async function reindexContents(_documentId?: string): Promise<void> {
  return
}

async function listCharacters(projectId: string): Promise<Character[]> {
  const state = readState()
  return getProjectCharacters(state, projectId).map((character) => ({ ...character }))
}

async function getCharacter(characterId: string): Promise<Character> {
  const state = readState()
  return { ...getCharacterOrThrow(state, characterId) }
}

async function createCharacter(
  projectId: string,
  data: CreateCharacterRequest,
): Promise<Character> {
  const state = readState()
  const createdAt = nowIso()
  const character: LocalCharacterRecord = {
    id: createId('local-character'),
    projectId,
    name: data.name.trim(),
    alias: normalizeStringArray(data.alias),
    summary: data.summary || '',
    traits: normalizeStringArray(data.traits),
    background: data.background || '',
    avatarUrl: data.avatarUrl || '',
    personalityPrompt: data.personalityPrompt || '',
    speechPattern: data.speechPattern || '',
    currentState: '',
    customStatus: data.customStatus,
    createdAt,
    updatedAt: createdAt,
  }

  state.characters.push(character)
  touchProject(state, projectId)
  writeState(state)
  return { ...character }
}

async function updateCharacter(
  characterId: string,
  data: UpdateCharacterRequest,
): Promise<Character> {
  const state = readState()
  const character = getCharacterOrThrow(state, characterId)

  if (typeof data.name === 'string' && data.name.trim()) {
    character.name = data.name.trim()
  }
  if (Array.isArray(data.alias)) {
    character.alias = normalizeStringArray(data.alias)
  }
  if (typeof data.summary === 'string') {
    character.summary = data.summary
  }
  if (Array.isArray(data.traits)) {
    character.traits = normalizeStringArray(data.traits)
  }
  if (typeof data.background === 'string') {
    character.background = data.background
  }
  if (typeof data.avatarUrl === 'string') {
    character.avatarUrl = data.avatarUrl
  }
  if (typeof data.personalityPrompt === 'string') {
    character.personalityPrompt = data.personalityPrompt
  }
  if (typeof data.speechPattern === 'string') {
    character.speechPattern = data.speechPattern
  }
  if (typeof data.currentState === 'string') {
    character.currentState = data.currentState
  }
  if (data.customStatus) {
    character.customStatus = data.customStatus
  }

  character.updatedAt = nowIso()
  touchProject(state, character.projectId)
  writeState(state)
  return { ...character }
}

async function deleteCharacter(characterId: string): Promise<void> {
  const state = readState()
  const character = getCharacterOrThrow(state, characterId)
  state.characters = state.characters.filter((item) => item.id !== characterId)
  state.characterRelations = state.characterRelations.filter(
    (relation) => relation.fromId !== characterId && relation.toId !== characterId,
  )
  scrubDeletedEntityRefs(state, 'characterIds', characterId)
  touchProject(state, character.projectId)
  writeState(state)
}

async function listCharacterRelations(
  projectId: string,
  characterId?: string,
): Promise<CharacterRelation[]> {
  const state = readState()
  return getProjectCharacterRelations(state, projectId, characterId).map((relation) => ({
    ...relation,
  }))
}

async function createCharacterRelation(
  projectId: string,
  data: SaveRelationRequest,
): Promise<CharacterRelation> {
  const state = readState()
  getCharacterOrThrow(state, data.fromId)
  getCharacterOrThrow(state, data.toId)

  const createdAt = nowIso()
  const relation: LocalCharacterRelationRecord = {
    id: createId('local-character-relation'),
    projectId,
    fromId: data.fromId,
    toId: data.toId,
    type: data.type,
    strength: Number(data.strength ?? 50),
    notes: data.notes || '',
    createdAt,
    updatedAt: createdAt,
  }

  state.characterRelations.push(relation)
  touchProject(state, projectId)
  writeState(state)
  return { ...relation }
}

async function deleteCharacterRelation(relationId: string): Promise<void> {
  const state = readState()
  const relation = state.characterRelations.find((item) => item.id === relationId)
  if (!relation) {
    throw new Error(`角色关系不存在: ${relationId}`)
  }

  state.characterRelations = state.characterRelations.filter((item) => item.id !== relationId)
  touchProject(state, relation.projectId)
  writeState(state)
}

async function getCharacterGraph(projectId: string): Promise<CharacterGraph> {
  const state = readState()
  return {
    characters: getProjectCharacters(state, projectId).map((character) => ({ ...character })),
    relations: getProjectCharacterRelations(state, projectId).map((relation) => ({ ...relation })),
  }
}

async function listLocations(projectId: string): Promise<Location[]> {
  const state = readState()
  return getProjectLocations(state, projectId).map((location) => ({ ...location }))
}

async function getLocationTree(projectId: string): Promise<Location[]> {
  const state = readState()
  return buildLocationTree(getProjectLocations(state, projectId))
}

async function getLocation(locationId: string): Promise<Location> {
  const state = readState()
  return { ...getLocationOrThrow(state, locationId) }
}

async function createLocation(projectId: string, data: SaveLocationRequest): Promise<Location> {
  const state = readState()
  const createdAt = nowIso()
  const location: LocalLocationRecord = {
    id: createId('local-location'),
    projectId,
    name: data.name.trim(),
    description: data.description || '',
    climate: data.climate || '',
    culture: data.culture || '',
    geography: data.geography || '',
    atmosphere: data.atmosphere || '',
    parentId: data.parentId || undefined,
    imageUrl: data.imageUrl || '',
    createdAt,
    updatedAt: createdAt,
  }

  state.locations.push(location)
  touchProject(state, projectId)
  writeState(state)
  return { ...location }
}

async function updateLocation(locationId: string, data: SaveLocationRequest): Promise<Location> {
  const state = readState()
  const location = getLocationOrThrow(state, locationId)

  if (typeof data.name === 'string' && data.name.trim()) {
    location.name = data.name.trim()
  }
  if (typeof data.description === 'string') {
    location.description = data.description
  }
  if (typeof data.climate === 'string') {
    location.climate = data.climate
  }
  if (typeof data.culture === 'string') {
    location.culture = data.culture
  }
  if (typeof data.geography === 'string') {
    location.geography = data.geography
  }
  if (typeof data.atmosphere === 'string') {
    location.atmosphere = data.atmosphere
  }
  if (typeof data.imageUrl === 'string') {
    location.imageUrl = data.imageUrl
  }
  if ('parentId' in data) {
    location.parentId = data.parentId || undefined
  }

  location.updatedAt = nowIso()
  touchProject(state, location.projectId)
  writeState(state)
  return { ...location }
}

async function deleteLocation(locationId: string): Promise<void> {
  const state = readState()
  const location = getLocationOrThrow(state, locationId)
  const removedIds = removeLocationRecursively(state, locationId)
  for (const removedId of removedIds) {
    scrubDeletedEntityRefs(state, 'locationIds', removedId)
  }
  touchProject(state, location.projectId)
  writeState(state)
}

async function listLocationRelations(
  projectId: string,
  locationId?: string,
): Promise<LocationRelation[]> {
  const state = readState()
  return getProjectLocationRelations(state, projectId, locationId).map((relation) => ({
    ...relation,
  }))
}

async function createLocationRelation(
  projectId: string,
  data: SaveLocationRelationRequest,
): Promise<LocationRelation> {
  const state = readState()
  getLocationOrThrow(state, data.fromId)
  getLocationOrThrow(state, data.toId)

  const createdAt = nowIso()
  const relation: LocalLocationRelationRecord = {
    id: createId('local-location-relation'),
    projectId,
    fromId: data.fromId,
    toId: data.toId,
    type: data.type,
    distance: data.distance || '',
    notes: data.notes || '',
    createdAt,
    updatedAt: createdAt,
  }

  state.locationRelations.push(relation)
  touchProject(state, projectId)
  writeState(state)
  return { ...relation }
}

async function deleteLocationRelation(relationId: string): Promise<void> {
  const state = readState()
  const relation = state.locationRelations.find((item) => item.id === relationId)
  if (!relation) {
    throw new Error(`地点关系不存在: ${relationId}`)
  }

  state.locationRelations = state.locationRelations.filter((item) => item.id !== relationId)
  touchProject(state, relation.projectId)
  writeState(state)
}

async function listConcepts(projectId: string): Promise<Concept[]> {
  const state = readState()
  return getProjectConcepts(state, projectId).map((concept) => ({ ...concept }))
}

async function getConcept(conceptId: string): Promise<Concept> {
  const state = readState()
  return { ...getConceptOrThrow(state, conceptId) }
}

async function createConcept(projectId: string, data: CreateConceptRequest): Promise<Concept> {
  const state = readState()
  const createdAt = nowIso()
  const concept: LocalConceptRecord = {
    id: createId('local-concept'),
    projectId,
    name: data.name.trim(),
    alias: normalizeStringArray(data.alias),
    summary: data.summary || '',
    description: data.description || '',
    category: data.category || '',
    relatedConcepts: [],
    relatedCharacters: [],
    relatedLocations: [],
    relatedItems: [],
    createdAt,
    updatedAt: createdAt,
  }

  state.concepts.push(concept)
  touchProject(state, projectId)
  writeState(state)
  return { ...concept }
}

async function updateConcept(conceptId: string, data: UpdateConceptRequest): Promise<Concept> {
  const state = readState()
  const concept = getConceptOrThrow(state, conceptId)

  if (typeof data.name === 'string' && data.name.trim()) {
    concept.name = data.name.trim()
  }
  if (Array.isArray(data.alias)) {
    concept.alias = normalizeStringArray(data.alias)
  }
  if (typeof data.summary === 'string') {
    concept.summary = data.summary
  }
  if (typeof data.description === 'string') {
    concept.description = data.description
  }
  if (typeof data.category === 'string') {
    concept.category = data.category
  }
  if (Array.isArray(data.relatedConcepts)) {
    concept.relatedConcepts = data.relatedConcepts
  }
  if (Array.isArray(data.relatedCharacters)) {
    concept.relatedCharacters = data.relatedCharacters
  }
  if (Array.isArray(data.relatedLocations)) {
    concept.relatedLocations = data.relatedLocations
  }
  if (Array.isArray(data.relatedItems)) {
    concept.relatedItems = data.relatedItems
  }

  concept.updatedAt = nowIso()
  touchProject(state, concept.projectId)
  writeState(state)
  return { ...concept }
}

async function deleteConcept(conceptId: string): Promise<void> {
  const state = readState()
  const concept = getConceptOrThrow(state, conceptId)
  state.concepts = state.concepts.filter((item) => item.id !== conceptId)
  delete state.entityStateFields[conceptId]
  touchProject(state, concept.projectId)
  writeState(state)
}

async function listTimelines(projectId: string): Promise<Timeline[]> {
  const state = readState()
  ensureProjectDefaultTimeline(state, projectId)
  const nextState = readState()
  return getProjectTimelines(nextState, projectId).map((timeline) => ({ ...timeline }))
}

async function createTimeline(projectId: string, data: SaveTimelineRequest): Promise<Timeline> {
  const state = readState()
  const createdAt = nowIso()
  const timeline: LocalTimelineRecord = {
    id: createId('local-timeline'),
    projectId,
    name: data.name.trim(),
    description: data.description || '',
    startTime: data.startTime,
    endTime: data.endTime,
    createdAt,
    updatedAt: createdAt,
  }

  state.timelines.push(timeline)
  touchProject(state, projectId)
  writeState(state)
  return { ...timeline }
}

async function getTimeline(timelineId: string): Promise<Timeline> {
  const state = readState()
  return { ...getTimelineOrThrow(state, timelineId) }
}

async function deleteTimeline(timelineId: string): Promise<void> {
  const state = readState()
  const timeline = getTimelineOrThrow(state, timelineId)
  state.timelines = state.timelines.filter((item) => item.id !== timelineId)
  state.timelineEvents = state.timelineEvents.filter((item) => item.timelineId !== timelineId)
  touchProject(state, timeline.projectId)
  writeState(state)
}

async function getTimelineVisualization(timelineId: string): Promise<{ events: TimelineEvent[]; links: [] }> {
  const state = readState()
  return {
    events: getTimelineEvents(state, timelineId).map((event) => ({ ...event })),
    links: [],
  }
}

async function listTimelineEvents(timelineId: string): Promise<TimelineEvent[]> {
  const state = readState()
  return getTimelineEvents(state, timelineId).map((event) => ({ ...event }))
}

async function createTimelineEvent(
  timelineId: string,
  projectId: string,
  data: SaveTimelineEventRequest,
): Promise<TimelineEvent> {
  const state = readState()
  getTimelineOrThrow(state, timelineId)
  const createdAt = nowIso()
  const event: LocalTimelineEventRecord = {
    id: createId('local-timeline-event'),
    projectId,
    timelineId,
    title: data.title.trim(),
    description: data.description || '',
    storyTime: data.storyTime,
    duration: data.duration || '',
    impact: data.impact || '',
    participants: Array.isArray(data.participants) ? data.participants : [],
    locationIds: Array.isArray(data.locationIds) ? data.locationIds : [],
    chapterIds: Array.isArray(data.chapterIds) ? data.chapterIds : [],
    eventType: data.eventType,
    importance: Number(data.importance ?? 5),
    createdAt,
    updatedAt: createdAt,
  }

  state.timelineEvents.push(event)
  const timeline = getTimelineOrThrow(state, timelineId)
  timeline.updatedAt = createdAt
  touchProject(state, projectId)
  writeState(state)
  return { ...event }
}

async function getTimelineEvent(eventId: string): Promise<TimelineEvent> {
  const state = readState()
  return { ...getTimelineEventOrThrow(state, eventId) }
}

async function updateTimelineEvent(
  eventId: string,
  projectId: string,
  data: SaveTimelineEventRequest,
): Promise<TimelineEvent> {
  const state = readState()
  const event = getTimelineEventOrThrow(state, eventId)

  if (typeof data.title === 'string' && data.title.trim()) {
    event.title = data.title.trim()
  }
  if (typeof data.description === 'string') {
    event.description = data.description
  }
  if (data.storyTime) {
    event.storyTime = data.storyTime
  }
  if (typeof data.duration === 'string') {
    event.duration = data.duration
  }
  if (typeof data.impact === 'string') {
    event.impact = data.impact
  }
  if (Array.isArray(data.participants)) {
    event.participants = data.participants
  }
  if (Array.isArray(data.locationIds)) {
    event.locationIds = data.locationIds
  }
  if (Array.isArray(data.chapterIds)) {
    event.chapterIds = data.chapterIds
  }
  event.eventType = data.eventType
  event.importance = Number(data.importance ?? event.importance)
  event.updatedAt = nowIso()

  const timeline = getTimelineOrThrow(state, event.timelineId)
  timeline.updatedAt = event.updatedAt
  touchProject(state, projectId)
  writeState(state)
  return { ...event }
}

async function deleteTimelineEvent(eventId: string, projectId: string): Promise<void> {
  const state = readState()
  const event = getTimelineEventOrThrow(state, eventId)
  state.timelineEvents = state.timelineEvents.filter((item) => item.id !== eventId)
  const timeline = getTimelineOrThrow(state, event.timelineId)
  timeline.updatedAt = nowIso()
  touchProject(state, projectId)
  writeState(state)
}

function buildLocalEntitySummaryList(
  state: LocalWriterState,
  projectId: string,
  entityType?: EntitySummary['entityType'],
): EntitySummary[] {
  const characterSummaries = getProjectCharacters(state, projectId).map((character) => ({
    id: character.id,
    name: character.name,
    entityType: 'character' as const,
    summary: character.summary || '',
    stateFields: getEntityStateFields(state, character.id),
  }))
  const locationSummaries = getProjectLocations(state, projectId).map((location) => ({
    id: location.id,
    name: location.name,
    entityType: 'location' as const,
    summary: location.description || '',
    stateFields: getEntityStateFields(state, location.id),
  }))
  const conceptSummaries = getProjectConcepts(state, projectId).map((concept) =>
    mapConceptToEntitySummary(state, concept),
  )
  const genericEntitySummaries = state.genericEntities
    .filter((entity) => entity.projectId === projectId)
    .map((item) => ({
      id: item.id,
      name: item.name,
      entityType: item.entityType,
      alias: item.alias || [],
      summary: item.summary || '',
      stateFields: getEntityStateFields(state, item.id),
    }))

  const all = [
    ...characterSummaries,
    ...locationSummaries,
    ...genericEntitySummaries,
    ...conceptSummaries,
  ]
  return entityType ? all.filter((entity) => entity.entityType === entityType) : all
}

async function createLocalEntity(payload: {
  projectId: string
  type: 'item' | 'organization'
  name: string
  alias?: string[]
  summary?: string
}): Promise<EntitySummary> {
  const state = migrateLegacyWriterItemsForProject(readState(), payload.projectId)
  const createdAt = nowIso()
  const entity: LocalGenericEntityRecord = {
    id: createId(`local-${payload.type}`),
    projectId: payload.projectId,
    entityType: payload.type,
    name: payload.name.trim(),
    alias: normalizeStringArray(payload.alias),
    summary: payload.summary || '',
    createdAt,
    updatedAt: createdAt,
  }
  state.genericEntities.push(entity)
  touchProject(state, payload.projectId)
  writeState(state)

  return {
    id: entity.id,
    name: entity.name,
    entityType: payload.type,
    alias: entity.alias || [],
    summary: entity.summary || '',
    stateFields: getEntityStateFields(state, entity.id),
  }
}

async function updateLocalEntity(payload: {
  entityId: string
  projectId: string
  name: string
  alias?: string[]
  summary?: string
}): Promise<EntitySummary> {
  const state = migrateLegacyWriterItemsForProject(readState(), payload.projectId)
  const entity = state.genericEntities.find(
    (item) => item.id === payload.entityId && item.projectId === payload.projectId,
  )

  if (!entity) {
    throw new Error('未找到要更新的本地资产')
  }

  entity.name = payload.name.trim()
  entity.alias = normalizeStringArray(payload.alias)
  entity.summary = payload.summary || ''
  entity.updatedAt = nowIso()
  touchProject(state, payload.projectId)
  writeState(state)

  return {
    id: entity.id,
    name: entity.name,
    entityType: entity.entityType,
    alias: entity.alias || [],
    summary: entity.summary || '',
    stateFields: getEntityStateFields(state, entity.id),
  }
}

async function deleteLocalEntity(entityId: string, projectId: string): Promise<void> {
  const state = migrateLegacyWriterItemsForProject(readState(), projectId)
  state.genericEntities = state.genericEntities.filter((entity) => entity.id !== entityId)
  delete state.entityStateFields[entityId]
  touchProject(state, projectId)
  writeState(state)
}

async function listLocalEntities(
  projectId: string,
  entityType?: EntitySummary['entityType'],
): Promise<EntitySummary[]> {
  const state = migrateLegacyWriterItemsForProject(readState(), projectId)
  return buildLocalEntitySummaryList(state, projectId, entityType)
}

async function getLocalEntityGraph(projectId: string): Promise<EntityGraph> {
  const state = migrateLegacyWriterItemsForProject(readState(), projectId)
  const nodes = buildLocalEntitySummaryList(state, projectId)
  const edges = [
    ...getProjectCharacterRelations(state, projectId).map((relation) => ({
      fromId: relation.fromId,
      toId: relation.toId,
      fromType: 'character' as const,
      toType: 'character' as const,
      type: relation.type,
      strength: relation.strength,
      notes: relation.notes,
    })),
    ...getProjectLocationRelations(state, projectId).map((relation) => ({
      fromId: relation.fromId,
      toId: relation.toId,
      fromType: 'location' as const,
      toType: 'location' as const,
      type: relation.type,
      notes: relation.notes,
    })),
  ]

  return { nodes, edges }
}

async function updateLocalEntityStateFields(
  entityId: string,
  stateFields: Record<string, StateValue>,
): Promise<void> {
  const state = readState()
  state.entityStateFields[entityId] = stateFields
  writeState(state)
}

function mapDocumentToOutlineNode(document: Document): OutlineTreeNode {
  return {
    id: document.id,
    projectId: document.projectId,
    documentId: document.id,
    title: document.title,
    description: document.notes || '',
    order: Number(document.order || 0),
    level: Number(document.level || 0),
    parentId: document.parentId || undefined,
    wordCount: Number(document.wordCount || 0),
    status: (document.status as any) || 'draft',
    type: document.type,
    children: Array.isArray(document.children)
      ? document.children.map((child) => mapDocumentToOutlineNode(child))
      : [],
  }
}

async function getOutlineTree(projectId: string): Promise<OutlineTreeNode[]> {
  const tree = await getDocumentTree(projectId)
  return tree.map((document) => mapDocumentToOutlineNode(document))
}

async function createOutline(projectId: string, data: CreateOutlineRequest): Promise<OutlineTreeNode> {
  if (!data.parentId) {
    const created = await createDocument(projectId, {
      projectId,
      title: data.title,
      type: DocumentType.VOLUME,
      order: data.order,
    })
    return mapDocumentToOutlineNode(created)
  }

  if (data.documentId) {
    await moveDocument(data.documentId, {
      parentId: data.parentId,
      order: data.order,
    })
    if (data.title?.trim()) {
      await updateDocument(data.documentId, { title: data.title })
    }
    return mapDocumentToOutlineNode(await getDocument(data.documentId))
  }

  const created = await createDocument(projectId, {
    projectId,
    parentId: data.parentId,
    title: data.title,
    type: DocumentType.CHAPTER,
    order: data.order,
  })
  return mapDocumentToOutlineNode(created)
}

async function updateOutline(
  outlineId: string,
  _projectId: string,
  data: UpdateOutlineRequest,
): Promise<OutlineTreeNode> {
  if (typeof data.parentId === 'string' || typeof data.order === 'number') {
    await moveDocument(outlineId, {
      parentId: data.parentId,
      order: data.order,
    })
  }

  if (typeof data.title === 'string') {
    await updateDocument(outlineId, { title: data.title })
  }

  return mapDocumentToOutlineNode(await getDocument(outlineId))
}

async function deleteOutline(outlineId: string): Promise<void> {
  await deleteDocument(outlineId)
}

export const standaloneLocalBridge = {
  character: {
    list: listCharacters,
    get: getCharacter,
    create: createCharacter,
    update: updateCharacter,
    delete: deleteCharacter,
    listRelations: listCharacterRelations,
    createRelation: createCharacterRelation,
    deleteRelation: deleteCharacterRelation,
    getGraph: getCharacterGraph,
  },
  concept: {
    list: listConcepts,
    get: getConcept,
    create: createConcept,
    update: updateConcept,
    delete: deleteConcept,
  },
  entity: {
    create: createLocalEntity,
    update: updateLocalEntity,
    list: listLocalEntities,
    getGraph: getLocalEntityGraph,
    updateStateFields: updateLocalEntityStateFields,
    delete: deleteLocalEntity,
  },
  project: {
    list: listProjects,
    create: createProject,
    get: getProject,
    update: updateProject,
    delete: deleteProject,
  },
  document: {
    list: listDocuments,
    getTree: getDocumentTree,
    get: getDocument,
    create: createDocument,
    update: updateDocument,
    delete: deleteDocument,
    move: moveDocument,
  },
  editor: {
    getContent,
    updateContent,
    autoSave,
    getSaveStatus,
    getContents,
    replaceContents,
    reindexContents,
  },
  outline: {
    getTree: getOutlineTree,
    create: createOutline,
    update: updateOutline,
    delete: deleteOutline,
  },
  location: {
    list: listLocations,
    getTree: getLocationTree,
    get: getLocation,
    create: createLocation,
    update: updateLocation,
    delete: deleteLocation,
    listRelations: listLocationRelations,
    createRelation: createLocationRelation,
    deleteRelation: deleteLocationRelation,
  },
  timeline: {
    create: createTimeline,
    list: listTimelines,
    get: getTimeline,
    delete: deleteTimeline,
    getVisualization: getTimelineVisualization,
    createEvent: createTimelineEvent,
    listEvents: listTimelineEvents,
    getEvent: getTimelineEvent,
    updateEvent: updateTimelineEvent,
    deleteEvent: deleteTimelineEvent,
  },
}
