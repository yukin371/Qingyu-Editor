import { computed } from 'vue'
import { useWriterStore } from '@/modules/writer/stores/writerStore'
import type { CharacterRelation } from '@/modules/writer/types/character'

// 时序快照
export interface TimelineSnapshot {
  relationId: string
  chapterId: string
  chapterTitle: string
  type: string
  strength: number
  isCurrent: boolean
  futureChange?: {
    chapterId: string
    chapterTitle: string
    newType: string
    newStrength: number
  }
}

// 关系类型（兼容 store 中的结构）
interface RelationWithTimeline extends CharacterRelation {
  validFromChapterId?: string
  validUntilChapterId?: string
}

export function useRelationTimeline() {
  const writerStore = useWriterStore()

  // 获取章节顺序映射
  const chapterOrderMap = computed(() => {
    const tree = writerStore.documentTree || []
    const map = new Map<string, number>()

    function traverse(nodes: any[], order: number = 0): number {
      for (const node of nodes) {
        map.set(node.id, ++order)
        if (node.children?.length) {
          order = traverse(node.children, order)
        }
      }
      return order
    }

    traverse(tree)
    return map
  })

  // 获取章节标题映射
  const chapterTitleMap = computed(() => {
    const tree = writerStore.documentTree || []
    const map = new Map<string, string>()

    function traverse(nodes: any[]) {
      nodes.forEach(node => {
        map.set(node.id, node.title || node.name || '未命名')
        if (node.children?.length) {
          traverse(node.children)
        }
      })
    }

    traverse(tree)
    return map
  })

  // 获取某章节有效的关系
  function getRelationsForChapter(chapterId: string): RelationWithTimeline[] {
    const allRelations = (writerStore.characters?.relations || []) as RelationWithTimeline[]
    const targetOrder = chapterOrderMap.value.get(chapterId)
    if (targetOrder === undefined) return []

    return allRelations.filter(rel => isValidAtChapter(rel, targetOrder))
  }

  // 判断关系在某章节是否有效
  function isValidAtChapter(
    relation: RelationWithTimeline,
    chapterOrder: number
  ): boolean {
    // 如果没有设置生效章节，默认从第1章开始
    const fromOrder = relation.validFromChapterId
      ? (chapterOrderMap.value.get(relation.validFromChapterId) || 1)
      : 1

    // 如果没有设置失效章节，默认持续到故事结束
    const toOrder = relation.validUntilChapterId
      ? (chapterOrderMap.value.get(relation.validUntilChapterId) || Infinity)
      : Infinity

    return chapterOrder >= fromOrder && chapterOrder < toOrder
  }

  // 获取某关系在某章节的快照
  function getRelationSnapshotAtChapter(
    relationId: string,
    chapterId: string
  ): TimelineSnapshot | null {
    const allRelations = (writerStore.characters?.relations || []) as RelationWithTimeline[]
    const relation = allRelations.find(r => r.id === relationId)
    if (!relation) return null

    const targetOrder = chapterOrderMap.value.get(chapterId)
    if (targetOrder === undefined) return null

    const chapterTitle = chapterTitleMap.value.get(chapterId) || '未命名'

    // 获取未来的变化
    const futureChange = getNextTimelineEvent(relation, targetOrder)

    return {
      relationId: relation.id,
      chapterId,
      chapterTitle,
      type: typeof relation.type === 'string' ? relation.type : '未定义',
      strength: relation.strength,
      isCurrent: isValidAtChapter(relation, targetOrder),
      futureChange,
    }
  }

  // 获取关系在指定章节顺序之后的下一次变化
  function getNextTimelineEvent(
    _relation: RelationWithTimeline,
    _currentOrder: number
  ): TimelineSnapshot['futureChange'] | undefined {
    // 需要从后端获取 timeline events
    // 这里先返回 undefined，后续实现
    return undefined
  }

  // 获取关系的完整时序历史
  function getRelationTimeline(relationId: string): TimelineSnapshot[] {
    const allRelations = (writerStore.characters?.relations || []) as RelationWithTimeline[]
    const relation = allRelations.find(r => r.id === relationId)
    if (!relation) return []

    const snapshots: TimelineSnapshot[] = []
    const titles = chapterTitleMap.value

    // 当前章节之前的关系版本
    if (relation.validFromChapterId) {
      const fromOrder = chapterOrderMap.value.get(relation.validFromChapterId)
      if (fromOrder !== undefined) {
        snapshots.push({
          relationId,
          chapterId: relation.validFromChapterId,
          chapterTitle: titles.get(relation.validFromChapterId) || '未命名',
          type: typeof relation.type === 'string' ? relation.type : '未定义',
          strength: relation.strength,
          isCurrent: false,
        })
      }
    }

    return snapshots
  }

  return {
    chapterOrderMap,
    chapterTitleMap,
    getRelationsForChapter,
    isValidAtChapter,
    getRelationSnapshotAtChapter,
    getRelationTimeline,
  }
}
