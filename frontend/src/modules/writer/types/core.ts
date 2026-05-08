export type ID = string
export type ISODate = string // ISO 8601 string

// 基础实体接口
export interface BaseEntity {
  id: ID
  createdAt: ISODate
  updatedAt: ISODate
  deletedAt?: ISODate // 可选，对应后端 *time.Time
}
