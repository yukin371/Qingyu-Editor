/**
 * useLegacyEncyclopediaView - 旧百科 deep-link 兼容解析
 *
 * 当前独立编辑器不再让百科接管主编辑区；
 * 这里只保留旧 query 的子视图解析，供 ProjectWorkspace
 * 把历史 encyclopedia deep-link 转成 overlay 工具打开。
 */
import { computed, type ComputedRef } from 'vue'
import { useRoute } from 'vue-router'
import type { EncyclopediaSubView, EncyclopediaCategory } from './types'

// 重新导出类型以保持向后兼容
export type { EncyclopediaSubView, EncyclopediaCategory }

/** useLegacyEncyclopediaView 返回值 */
export interface UseLegacyEncyclopediaViewReturn {
  encyclopediaSubView: ComputedRef<EncyclopediaSubView>
}

/**
 * 旧百科 deep-link 兼容解析
 *
 * @returns 兼容态子视图
 */
export function useLegacyEncyclopediaView(): UseLegacyEncyclopediaViewReturn {
  const route = useRoute()

  /** 百科子视图 */
  const encyclopediaSubView = computed<EncyclopediaSubView>(() => {
    const raw = String(route.query.encyclopediaView || route.query.worldView || '').toLowerCase()
    if (['structure', 'outline', 'board'].includes(raw)) return 'structure'
    if (['encyclopedia', 'cards', 'list'].includes(raw)) return 'encyclopedia'
    if (['relations', 'relation', 'graph', 'relationship'].includes(raw)) return 'relations'
    if (['timeline', 'timelines'].includes(raw)) return 'timeline'
    if (['branch', 'branches', 'outline'].includes(raw)) return 'branches'
    return 'encyclopedia'
  })

  return {
    encyclopediaSubView,
  }
}
