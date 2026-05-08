// Writer 模块类型定义

// ===== 角色相关 =====

export interface Character {
  id: string
  projectId: string
  name: string
  alias?: string[]
  summary?: string
  traits?: string[] // 性格标签
  background?: string
  avatarUrl?: string
  // AI 相关字段
  personalityPrompt?: string // 角色性格提示
  speechPattern?: string // 角色语音模式
  currentState?: string // 角色当前状态
  createdAt: string
  updatedAt: string
}

export type RelationType = '朋友' | '家庭' | '敌人' | '恋人' | '盟友' | '其他'

export interface CharacterRelation {
  id: string
  projectId: string
  fromId: string
  toId: string
  type: RelationType
  strength: number // 0-100 强度
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CharacterGraph {
  characters: Character[]
  relations: CharacterRelation[]
}

// ===== 地点相关 =====

export interface Location {
  id: string
  projectId: string
  name: string
  description?: string
  climate?: string
  culture?: string
  geography?: string
  atmosphere?: string
  parentId?: string // 父级地点ID，支持层级结构
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export type LocationRelationType = 'adjacent' | 'contains' | 'near' | 'far' | 'connected'

export interface LocationRelation {
  id: string
  projectId: string
  fromId: string
  toId: string
  type: LocationRelationType
  distance?: string // 距离描述
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface LocationTree {
  id: string
  name: string
  children?: LocationTree[]
  location: Location
}

// ===== 时间线相关 =====

export interface StoryTime {
  year?: number
  month?: number
  day?: number
  hour?: number
  minute?: number
  era?: string
  season?: string
  description?: string
}

export interface Timeline {
  id: string
  projectId: string
  name: string
  description?: string
  startTime?: StoryTime
  endTime?: StoryTime
  createdAt: string
  updatedAt: string
}

export type EventType = 'plot' | 'character' | 'world' | 'background' | 'milestone'

export interface TimelineEvent {
  id: string
  projectId: string
  timelineId: string
  title: string
  description?: string
  storyTime?: StoryTime
  duration?: string // 事件持续时间描述
  impact?: string // 事件影响
  participants?: string[] // 参与角色ID
  locationIds?: string[] // 相关地点ID
  chapterIds?: string[] // 相关章节ID
  eventType: EventType
  importance: number // 重要性等级 1-10
  createdAt: string
  updatedAt: string
}

export interface TimelineEventNode {
  id: string
  title: string
  storyTime: string
  eventType: EventType
  importance: number
  characters: string[]
}

export interface EventConnection {
  fromEventId: string
  toEventId: string
  type: 'sequential' | 'causal' | 'parallel'
}

export interface TimelineVisualization {
  events: TimelineEventNode[]
  connections: EventConnection[]
}

// ===== 大纲相关 =====

export interface OutlineNode {
  id: string
  projectId: string
  documentId?: string
  title: string
  description?: string
  order: number
  level: number // 层级：1-章节，2-小节，3-段落
  parentId?: string
  children?: OutlineNode[]
  content?: string
  wordCount?: number
  status?: 'draft' | 'writing' | 'completed' | 'reviewing'
  type?: string // 节点类型：volume, plot, idea, draft, setting, chapter 等
  createdAt: string
  updatedAt: string
}

export interface MindMapNode {
  id: string
  topic: string
  direction?: 'left' | 'right'
  expanded?: boolean
  children?: MindMapNode[]
  style?: {
    background?: string
    color?: string
    fontSize?: string
  }
}

// ===== API 请求/响应类型 =====

// 角色相关请求
export interface CreateCharacterRequest {
  name: string
  alias?: string[]
  summary?: string
  traits?: string[]
  background?: string
  avatarUrl?: string
  personalityPrompt?: string
  speechPattern?: string
  currentState?: string
}

export interface UpdateCharacterRequest {
  name?: string
  alias?: string[]
  summary?: string
  traits?: string[]
  background?: string
  avatarUrl?: string
  personalityPrompt?: string
  speechPattern?: string
  currentState?: string
}

export interface CreateCharacterRelationRequest {
  fromId: string
  toId: string
  type: RelationType
  strength: number
  notes?: string
}

// 地点相关请求
export interface CreateLocationRequest {
  name: string
  description?: string
  climate?: string
  culture?: string
  geography?: string
  atmosphere?: string
  parentId?: string
  imageUrl?: string
}

export interface UpdateLocationRequest {
  name?: string
  description?: string
  climate?: string
  culture?: string
  geography?: string
  atmosphere?: string
  parentId?: string
  imageUrl?: string
}

export interface CreateLocationRelationRequest {
  fromId: string
  toId: string
  type: LocationRelationType
  distance?: string
  notes?: string
}

// 时间线相关请求
export interface CreateTimelineRequest {
  name: string
  description?: string
  startTime?: StoryTime
  endTime?: StoryTime
}

export interface CreateTimelineEventRequest {
  timelineId: string
  title: string
  description?: string
  eventType: EventType
  importance: number
  participants?: string[]
  locationIds?: string[]
  chapterIds?: string[]
  storyTime?: StoryTime
  duration?: string
  impact?: string
}

export interface UpdateTimelineEventRequest {
  title?: string
  description?: string
  eventType?: EventType
  importance?: number
  participants?: string[]
  locationIds?: string[]
  chapterIds?: string[]
  storyTime?: StoryTime
  duration?: string
  impact?: string
}

// 大纲相关请求
export interface CreateOutlineNodeRequest {
  documentId?: string
  title: string
  description?: string
  order: number
  level: number
  parentId?: string
  content?: string
}

export interface UpdateOutlineNodeRequest {
  title?: string
  description?: string
  order?: number
  level?: number
  parentId?: string
  content?: string
  status?: 'draft' | 'writing' | 'completed' | 'reviewing'
}











