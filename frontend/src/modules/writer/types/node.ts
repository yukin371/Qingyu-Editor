import type { BaseEntity, ID } from './core'

export enum NodeType {
  OUTLINE = 'outline',
  TIMELINE = 'timeline',
  LOCATION = 'location',
}

export interface Node extends BaseEntity {
  projectId: ID
  documentId?: ID // 别名，指向id字段
  parentId?: ID
  name: string
  type: NodeType | string
  relativePath?: string
  order: number
  level: number
  description?: string

  // 对应 Go map[string]interface{}
  metadata?: Record<string, any>

  // 前端辅助字段
  children?: Node[]
}

export interface CreateNodeRequest {
  projectId: ID
  parentId?: ID
  name: string
  type: NodeType
  description?: string
  metadata?: Record<string, any>
}
