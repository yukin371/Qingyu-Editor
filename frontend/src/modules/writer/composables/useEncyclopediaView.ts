/**
 * useEncyclopediaView - 百科视图状态管理 Composable
 *
 * 从 ProjectWorkspace.vue 提取的百科视图相关逻辑，包括：
 * - 百科子视图状态 (relations, structure, encyclopedia, timeline, branches)
 * - 百科分类状态 (characters, locations, items, organizations, concepts)
 * - 侧边栏标题和提示计算
 * - 分类设置方法
 * - 事件订阅（图谱同步）
 */
import { computed, onMounted, onUnmounted, type ComputedRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { entityEventBus } from '../events/entityEvents'
import type { EncyclopediaSubView, EncyclopediaCategory } from './types'

// 重新导出类型以保持向后兼容
export type { EncyclopediaSubView, EncyclopediaCategory }

// =======================
// Types
// =======================

/** useEncyclopediaView 参数 */
export interface UseEncyclopediaViewOptions {
  /** 当前激活的工具 */
  activeTool: ComputedRef<string>
}

/** useEncyclopediaView 返回值 */
export interface UseEncyclopediaViewReturn {
  // 状态
  isEncyclopediaTool: ComputedRef<boolean>
  encyclopediaSubView: ComputedRef<EncyclopediaSubView>
  encyclopediaCategory: ComputedRef<EncyclopediaCategory>
  // 计算属性
  worldSidebarTitle: ComputedRef<string>
  worldSidebarHint: ComputedRef<string>
  // 方法
  setEncyclopediaCategory: (category: EncyclopediaCategory) => Promise<void>
  // 事件相关
  notifyGraphViewChanged: (viewType: 'project' | 'chapter', scopeId?: string) => void
}

// =======================
// Composable
// =======================

/**
 * 百科视图状态管理
 *
 * @param options 配置选项
 * @returns 状态和方法
 */
export function useEncyclopediaView(
  options: UseEncyclopediaViewOptions,
): UseEncyclopediaViewReturn {
  const { activeTool } = options
  const route = useRoute()
  const router = useRouter()

  // =======================
  // 事件订阅
  // =======================
  const unsubscribers: Array<() => void> = []

  onMounted(() => {
    // 订阅关系创建事件，刷新图谱
    unsubscribers.push(
      entityEventBus.on('relation:created', () => {
        // 通知图谱刷新 - 具体实现依赖于图谱组件的刷新机制
        console.debug('[EncyclopediaView] 关系创建事件，刷新图谱')
      }),
    )

    // 订阅关系时序变化事件
    unsubscribers.push(
      entityEventBus.on('relation:timeline-changed', () => {
        console.debug('[EncyclopediaView] 关系时序变化事件')
      }),
    )

    // 订阅图谱视图变化事件
    unsubscribers.push(
      entityEventBus.on('graph:view-changed', ((event: any) => {
        console.debug('[EncyclopediaView] 图谱视图变化:', event.payload)
      }) as any),
    )
  })

  onUnmounted(() => {
    unsubscribers.forEach((unsub) => unsub())
    unsubscribers.length = 0
  })

  // =======================
  // 计算属性
  // =======================

  /** 是否为百科工具 */
  const isEncyclopediaTool = computed(() => activeTool.value === 'encyclopedia')

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

  /** 百科分类 */
  const encyclopediaCategory = computed<EncyclopediaCategory>(() => {
    const raw = String(route.query.worldCategory || '').toLowerCase()
    if (raw === 'items') return 'items'
    if (raw === 'organizations') return 'organizations'
    if (raw === 'concepts') return 'concepts'
    return raw === 'locations' ? 'locations' : 'characters'
  })

  /** 百科侧边栏标题 */
  const worldSidebarTitle = computed(() => {
    if (encyclopediaSubView.value === 'relations') return '关系图谱工具'
    if (encyclopediaSubView.value === 'structure') return '结构舞台工具'
    if (encyclopediaSubView.value === 'timeline') return '时间线工具'
    if (encyclopediaSubView.value === 'branches') return '分支工具'
    return '设定百科工具'
  })

  /** 百科侧边栏提示 */
  const worldSidebarHint = computed(() => {
    if (encyclopediaSubView.value === 'relations')
      return '当前视图聚焦角色关系，选择角色即可查看关系链路与强度。'
    if (encyclopediaSubView.value === 'structure')
      return '当前视图聚焦大纲、鱼骨与节拍结构，可直接调整节点与章节绑定。'
    if (encyclopediaSubView.value === 'timeline')
      return '当前视图聚焦事件推进，切换时间线并校准事件顺序。'
    if (encyclopediaSubView.value === 'branches')
      return '当前视图聚焦主支线结构，建议从根节点逐层推进。'
    return '在左侧选择角色、地点、物件、组织或概念分类以切换资产列表。'
  })

  // =======================
  // 方法
  // =======================

  /** 设置百科分类 */
  const setEncyclopediaCategory = async (category: EncyclopediaCategory) => {
    await router.replace({
      query: { ...route.query, worldCategory: category },
    })
  }

  /** 通知图谱视图已切换 */
  function notifyGraphViewChanged(viewType: 'project' | 'chapter', scopeId?: string) {
    entityEventBus.emit('graph:view-changed', { viewType, scopeId })
  }

  return {
    isEncyclopediaTool,
    encyclopediaSubView,
    encyclopediaCategory,
    worldSidebarTitle,
    worldSidebarHint,
    setEncyclopediaCategory,
    notifyGraphViewChanged,
  }
}
