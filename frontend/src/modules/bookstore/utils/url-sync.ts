import type { BrowseFilters } from '@/types/models/browse'

/**
 * 将filters对象转换为URL query对象
 */
export function filtersToQuery(filters: BrowseFilters): Record<string, string | string[]> {
  const query: Record<string, string | string[]> = {}
  
  if (filters.q) query.q = filters.q
  if (filters.categoryId) query.categoryId = filters.categoryId
  if (filters.year) query.year = filters.year
  if (filters.status) query.status = filters.status
  if (filters.tags.length > 0) query.tags = filters.tags
  if (filters.sortBy !== 'updateTime') query.sortBy = filters.sortBy
  if (filters.page !== 1) query.page = String(filters.page)
  if (filters.pageSize !== 24) query.pageSize = String(filters.pageSize)
  if (filters.tagMode !== 'and') query.tagMode = filters.tagMode
  
  return query
}

/**
 * 将URL query对象转换为filters对象
 */
export function queryToFilters(query: Record<string, string | string[]>): Partial<BrowseFilters> {
  const filters: Partial<BrowseFilters> = {}
  
  if (query.q) filters.q = String(query.q)
  if (query.categoryId) filters.categoryId = String(query.categoryId)
  if (query.year) filters.year = String(query.year)
  if (query.status) filters.status = String(query.status)
  if (query.tags) {
    filters.tags = Array.isArray(query.tags) ? query.tags : [String(query.tags)]
  }
  if (query.sortBy) filters.sortBy = String(query.sortBy)
  if (query.page) filters.page = parseInt(String(query.page), 10)
  if (query.pageSize) filters.pageSize = parseInt(String(query.pageSize), 10)
  if (query.tagMode) filters.tagMode = query.tagMode as 'and' | 'or'
  
  return filters
}
