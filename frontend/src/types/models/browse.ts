export interface BrowseFilters {
  q: string
  categoryId: string
  year: string
  status: string
  tags: string[]
  sortBy: string
  page: number
  pageSize: number
  tagMode: 'and' | 'or'
}
