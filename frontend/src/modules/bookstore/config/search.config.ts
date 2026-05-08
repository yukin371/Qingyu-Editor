/**
 * 搜索功能配置常量
 */
export const SEARCH_CONFIG = {
  // 缓存配置
  CACHE_SIZE: 100,
  DISPLAY_STEP: 20,

  // 搜索配置
  MAX_TAGS: 5,
  DEBOUNCE_MS: 500,
  URL_DEBOUNCE_MS: 300,

  // 默认值
  DEFAULT_SORT_BY: 'popularity',
  DEFAULT_SORT_ORDER: 'desc' as const,

  // 虚拟滚动
  VIRTUAL_LIST_ITEM_HEIGHT: 280,
  KEEPS_COUNT: 30,
  BUFFER_SIZE: 3,

  // UI
  TAG_DISPLAY_LIMIT: 12,
  GRID_MIN_WIDTH: 400,
} as const
