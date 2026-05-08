import type { Book as LegacyBook } from '@/types/bookstore'
import type { Book as ModuleBook } from '../types/book'
import type { BookStatus } from '../types/bookstore.types'

type AnyRecord = Record<string, any>

const LEGACY_STATUS_MAP: Record<string, BookStatus> = {
  serializing: 'ongoing',
  published: 'ongoing',
  ongoing: 'ongoing',
  completed: 'completed',
  paused: 'paused',
}

export function normalizeBookStatus(status?: string | null): BookStatus | undefined {
  if (!status) return undefined
  return LEGACY_STATUS_MAP[String(status)] || (status as BookStatus)
}

export function pickCategoryIds(input: AnyRecord): string[] {
  if (Array.isArray(input.categoryIds) && input.categoryIds.length > 0) {
    return input.categoryIds.map(String)
  }
  if (Array.isArray(input.category_ids) && input.category_ids.length > 0) {
    return input.category_ids.map(String)
  }
  if (input.categoryId) {
    return [String(input.categoryId)]
  }
  return []
}

export function normalizeBookContract<T extends AnyRecord>(input: T): T {
  const categoryIds = pickCategoryIds(input)
  const publishedAt = input.publishedAt ?? input.publishTime ?? input.published_at
  const updatedAt = input.updatedAt ?? input.updateTime ?? input.updated_at ?? input.lastUpdateAt

  // 确保 tags 字段存在且为数组
  const tags = Array.isArray(input.tags) ? input.tags : []

  return {
    ...input,
    status: normalizeBookStatus(input.status),
    categoryIds,
    categoryId: input.categoryId ?? categoryIds[0],
    tags,
    publishedAt,
    publishTime: input.publishTime ?? publishedAt,
    updatedAt,
    updateTime: input.updateTime ?? updatedAt,
    // 兼容 snake_case 字段名
    cover: input.cover ?? input.cover_url,
    coverUrl: input.coverUrl ?? input.cover_url ?? input.cover,
    introduction: input.introduction ?? input.description,
    description: input.description ?? input.introduction,
  }
}

export function normalizeBookList<T extends AnyRecord>(items: T[] | undefined | null): T[] {
  if (!Array.isArray(items)) return []
  return items.map(item => normalizeBookContract(item))
}

export function normalizeBookDetail<T extends AnyRecord>(item: T | undefined | null): T | null {
  if (!item || typeof item !== 'object') return null
  const normalized = normalizeBookContract(item)
  // 确保 BookDetail 特有的字段也被处理
  return {
    ...normalized,
    // 兼容 cover_url 和 cover 字段
    cover: item.cover ?? item.coverUrl ?? item.cover_url,
    coverUrl: item.coverUrl ?? item.cover_url ?? item.cover,
  } as T
}

export type CompatibleBook = LegacyBook & Partial<ModuleBook>
