import type { BaseEntity, ID } from './core'

// ==========================================
// 枚举定义
// ==========================================

/**
 * 关系类型枚举
 * 对应后端 RelationType 常量
 */
export enum RelationType {
  FRIEND = '朋友',
  FAMILY = '家庭',
  ENEMY = '敌人',
  ROMANCE = '恋人',
  ALLY = '盟友',
  OTHER = '其他',
}

// 辅助数组：用于前端下拉选择框 (Select Options)
export const RELATION_TYPE_OPTIONS = [
  { label: '朋友', value: RelationType.FRIEND },
  { label: '家庭', value: RelationType.FAMILY },
  { label: '敌人', value: RelationType.ENEMY },
  { label: '恋人', value: RelationType.ROMANCE },
  { label: '盟友', value: RelationType.ALLY },
  { label: '其他', value: RelationType.OTHER },
]

// ==========================================
// 实体定义
// ==========================================

/**
 * 角色卡片
 * 对应后端 Character struct
 */
export interface Character extends BaseEntity {
  projectId: ID
  name: string
  alias?: string[] // omitempty implies optional
  summary?: string
  traits?: string[] // 性格标签
  background?: string
  avatarUrl?: string

  // AI 相关字段
  personalityPrompt?: string
  speechPattern?: string
  currentState?: string

  // 自定义状态（用于 Story Harness 结构化状态追踪）
  customStatus?: CharacterCustomStatus
}

/**
 * 角色自定义状态（Story Harness 用）
 * 用于结构化存储角色特定的状态字段
 */
export interface CharacterCustomStatus {
  // 基础属性（星级评分 1-5）
  combatPower?: number // 战力
  intelligence?: number // 智商
  charisma?: number // 话术/魅力

  // 亚伯 (Abel) 专属
  fearValue?: number // 内心恐惧值 (0-100)
  disguiseStability?: number // 伪装稳定度 (0-100)
  bonusBalance?: number // 奖金余额

  // 诺艾尔 (Noelle) 专属
  debt?: number // 债务总额
  satiety?: number // 饱腹度 (0-100)
  trustValue?: number // 对某人的信任值 (0-100)

  // 伊莎贝拉 (Isabella) 专属
  delusionIndex?: number // 妄想指数 (0-100)
  misunderstandingDepth?: number // 误解深度 (0-100)
  interceptorTriggers?: number // 拦截器触发次数

  // 通用扩展字段
  [key: string]: number | string | undefined
}

/**
 * 角色关系（边表）
 * 对应后端 CharacterRelation struct
 */
export interface CharacterRelation extends BaseEntity {
  projectId: ID
  fromId: ID
  toId: ID
  type: RelationType | string // 允许字符串以兼容未知类型
  strength: number // 0-100 强度
  notes?: string

  // 新增：时序控制字段
  validFromChapterId?: string // 关系生效的起始章节ID
  validUntilChapterId?: string // 关系失效的章节ID
}

// ==========================================
// 请求参数定义 (DTOs)
// ==========================================

/**
 * 创建角色请求
 */
export interface CreateCharacterRequest {
  projectId: ID
  name: string
  alias?: string[]
  summary?: string
  traits?: string[]
  background?: string
  avatarUrl?: string
  personalityPrompt?: string
  speechPattern?: string
  customStatus?: CharacterCustomStatus
}

/**
 * 更新角色请求
 */
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
  customStatus?: CharacterCustomStatus
}

/**
 * 创建/更新关系请求
 */
export interface SaveRelationRequest {
  fromId: ID
  toId: ID
  type: RelationType
  strength?: number
  notes?: string
}

/**
 * 角色关系图谱数据结构
 */
export interface CharacterGraph {
  characters: Character[] // 节点
  relations: CharacterRelation[] // 边
}

// ==========================================
// 章节图谱相关类型
// ==========================================

/**
 * 章节关系图谱
 * 记录某个章节创建的关系图谱
 */
export interface ChapterGraph {
  id: string
  projectId: string
  chapterId: string // 关联的文档ID
  chapterTitle?: string // 章节标题（方便显示）
  parentGraphId?: string // 继承的父图谱ID（全局图谱ID或章节图谱ID）
  createdAt: string
  updatedAt: string
}

/**
 * 卷关系图谱
 * 记录某个卷创建的关系图谱
 */
export interface VolumeGraph {
  id: string
  projectId: string
  volumeId: string
  volumeTitle?: string
  parentGraphId?: string
  createdAt: string
  updatedAt: string
}

/**
 * 章节特有关系
 * 章节图谱中该章节特有的关系（不包括继承的关系）
 */
export interface ChapterRelation extends BaseEntity {
  graphId: string // 关联的章节图谱ID
  fromId: string // 源角色ID
  toId: string // 目标角色ID
  type: RelationType | string
  strength: number // 0-100
  notes?: string
}

/**
 * 卷特有关系
 * 卷图谱中该卷特有的关系（不包括继承的关系）
 */
export interface VolumeRelation extends BaseEntity {
  graphId: string
  fromId: string
  toId: string
  type: RelationType | string
  strength: number
  notes?: string
}

/**
 * 图谱节点（用于前端展示）
 */
export interface GraphNode {
  id: string
  name: string
  avatar?: string
  importance?: number
  isInherited?: boolean // 是否继承自父图谱
}

/**
 * 图谱关系（用于前端展示）
 */
export interface GraphLink {
  id?: string
  source: string | GraphNode
  target: string | GraphNode
  type: string
  strength: number
  isInherited?: boolean // 是否继承自父图谱
}

/**
 * 创建章节图谱请求
 */
export interface CreateChapterGraphRequest {
  chapterId: string
  parentGraphId?: string // 可选，继承的图谱ID
  inheritCharacterIds?: string[] // 如果继承，可指定只继承这些角色
}

/**
 * 图谱模式
 */
export type GraphMode = 'global' | 'chapter'

// ==========================================
// 项目设置相关类型
// ==========================================

/**
 * 关系时序变化事件
 * 对应后端 RelationTimelineEvent
 */
export interface RelationTimelineEvent {
  id?: string
  relationId: string
  chapterId: string
  chapterTitle: string
  oldType?: RelationType | string
  newType: RelationType | string
  oldStrength?: number
  newStrength: number
  notes: string
  createdAt: string
}

/**
 * 角色类型定义
 */
export interface CharacterRole {
  id: string
  projectId: string
  name: string // 如"主角"、"配角"
  color?: string // 显示颜色
  icon?: string // 图标
  order: number // 排序权重
  isDefault: boolean // 是否系统预设
  createdAt: string
  updatedAt: string
}

/**
 * 预设角色类型常量
 */
export const DEFAULT_CHARACTER_ROLES: Omit<
  CharacterRole,
  'id' | 'projectId' | 'createdAt' | 'updatedAt'
>[] = [
  {
    name: '主角',
    color: '#ff6b6b',
    icon: 'star',
    order: 1,
    isDefault: true,
  },
  {
    name: '配角',
    color: '#4ecdc4',
    icon: 'user',
    order: 2,
    isDefault: true,
  },
  {
    name: '龙套',
    color: '#95e1d3',
    icon: 'users',
    order: 3,
    isDefault: true,
  },
]

/**
 * 角色图谱项目设置
 * 对应后端 ProjectSettings 模型（角色图谱专用）
 * 重命名为 CharacterGraphSettings 以避免与 project.ts 中的 ProjectSettings 冲突
 */
export interface CharacterGraphSettings {
  id: string
  projectId: string
  characterRoles: CharacterRole[]
  createdAt: string
  updatedAt: string
}

// ==========================================
// 角色登场信息相关类型
// ==========================================

/**
 * 角色登场信息
 * 对应后端 CharacterAppearance
 */
export interface CharacterAppearance extends BaseEntity {
  documentId: string // 大纲节点ID
  characterId: string // 角色ID
  characterName: string // 冗余存储，方便查询
  roleId: string // 引用CharacterRole
  roleName: string // 冗余存储角色类型名称
  firstAppearance: boolean // 是否首次登场
  notes?: string // 如"第1卷男二号"
}
