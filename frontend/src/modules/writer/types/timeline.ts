import type { BaseEntity, ID } from './core'

// ==========================================
// 1. 基础值对象 (Value Objects)
// ==========================================

/**
 * 故事时间
 * 对应后端 StoryTime struct
 * 所有字段均为 omitempty，因此在前端为可选
 */
export interface StoryTime {
  year?: number
  month?: number
  day?: number
  hour?: number
  minute?: number
  era?: string // 纪元 (如: "新历", "上古")
  season?: string // 季节
  description?: string // 自定义描述 (如: "那一天的黄昏")
}

// ==========================================
// 2. 枚举定义 (Enums)
// ==========================================

/**
 * 事件类型
 * 对应后端 EventType const
 */
export enum EventType {
  PLOT = 'plot', // 情节事件
  CHARACTER = 'character', // 角色事件
  WORLD = 'world', // 世界事件
  BACKGROUND = 'background', // 背景事件
  MILESTONE = 'milestone', // 里程碑
}

/**
 * UI 辅助选项列表
 * 用于 Select 组件
 */
export const EVENT_TYPE_OPTIONS = [
  { label: '情节事件', value: EventType.PLOT, color: '#409EFF' }, // Blue
  { label: '角色事件', value: EventType.CHARACTER, color: '#67C23A' }, // Green
  { label: '世界事件', value: EventType.WORLD, color: '#E6A23C' }, // Orange
  { label: '背景事件', value: EventType.BACKGROUND, color: '#909399' }, // Gray
  { label: '里程碑', value: EventType.MILESTONE, color: '#F56C6C' }, // Red
]

// ==========================================
// 3. 实体定义 (Entities)
// ==========================================

/**
 * 时间线 (容器)
 * 对应后端 Timeline struct
 */
export interface Timeline extends BaseEntity {
  projectId: ID
  name: string
  description?: string
  startTime?: StoryTime
  endTime?: StoryTime
}

/**
 * 时间线事件 (具体节点)
 * 对应后端 TimelineEvent struct
 */
export interface TimelineEvent extends BaseEntity {
  projectId: ID
  timelineId: ID
  title: string
  description?: string
  storyTime?: StoryTime
  duration?: string // 持续时间描述
  impact?: string // 影响
  participants?: ID[] // 关联角色 ID 列表
  locationIds?: ID[] // 关联地点 ID 列表
  chapterIds?: ID[] // 关联章节 ID 列表
  eventType: EventType
  importance: number // 1-10
}

// ==========================================
// 4. DTOs (请求参数)
// ==========================================

/**
 * 创建/更新时间线请求
 */
export interface SaveTimelineRequest {
  projectId: ID
  name: string
  description?: string
  startTime?: StoryTime
  endTime?: StoryTime
}

/**
 * 创建/更新事件请求
 */
export interface SaveTimelineEventRequest {
  timelineId: ID
  title: string
  description?: string
  storyTime?: StoryTime
  duration?: string
  impact?: string
  participants?: ID[]
  locationIds?: ID[]
  chapterIds?: ID[]
  eventType: EventType
  importance?: number
}

// ==========================================
// 5. 前端辅助逻辑
// ==========================================

/**
 * 格式化故事时间字符串 (逻辑移植自后端 GetTimeString)
 * 用于在列表中展示友好的时间
 */
export function formatStoryTime(st?: StoryTime): string {
  if (!st) return ''

  // 如果有自定义描述，优先显示描述
  if (st.description) {
    return st.description
  }

  let timeStr = ''

  if (st.era) {
    timeStr += `${st.era} `
  }

  // 仅当数值存在时才拼接
  if (st.year !== undefined) timeStr += `${st.year}年`
  if (st.month !== undefined) timeStr += `${st.month}月`
  if (st.day !== undefined) timeStr += `${st.day}日`

  // 精确时间
  if (st.hour !== undefined) {
    const min = st.minute !== undefined ? st.minute.toString().padStart(2, '0') : '00'
    timeStr += ` ${st.hour}:${min}`
  }

  if (st.season) {
    timeStr += ` ${st.season}`
  }

  return timeStr.trim()
}
