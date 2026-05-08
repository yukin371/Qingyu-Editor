import { computed, ref, watch } from 'vue'
import { useWriterStore } from '@/modules/writer/stores/writerStore'
import type { CharacterRelation, GraphNode, GraphLink } from '@/modules/writer/types/character'

// 视图范围类型
export type ScopeType = 'project' | 'volume' | 'chapter'

// 图谱视图过滤条件
export interface GraphViewFilter {
  scopeType: ScopeType
  scopeId?: string
  showOnly?: Set<string>
}

// 图谱视图状态
export interface GraphViewState {
  baseGraph: {
    nodes: GraphNode[]
    links: GraphLink[]
  }
  viewFilter: GraphViewFilter
  visibleNodes: GraphNode[]
  visibleLinks: GraphLink[]
}

export function useGraphViewFilter() {
  const writerStore = useWriterStore()

  // 当前视图过滤条件（可写）
  const viewFilter = ref<GraphViewFilter>({
    scopeType: 'project',
  })

  // 当前编辑的章节ID
  const currentChapterId = computed(() => writerStore.currentDocumentId)

  // 获取章节所属的卷
  const currentVolumeId = computed(() => {
    if (!currentChapterId.value) return undefined
    return findParentVolumeId(currentChapterId.value)
  })

  // 获取章节顺序映射（用于时序过滤）
  const chapterOrderMap = computed(() => {
    const chapters = writerStore.documentTree || []
    const map = new Map<string, number>()

    // 递归遍历文档树，为每个章节分配顺序号
    function traverse(nodes: any[], order: number = 0): number {
      for (const node of nodes) {
        map.set(node.id, ++order)
        if (node.children && node.children.length > 0) {
          order = traverse(node.children, order)
        }
      }
      return order
    }

    traverse(chapters)
    return map
  })

  // 监听章节切换，自动更新视图
  watch(currentChapterId, (newChapterId, oldChapterId) => {
    if (newChapterId === oldChapterId) return
    updateViewFilter(newChapterId)
  }, { immediate: true })

  // 更新视图过滤
  function updateViewFilter(chapterId: string | null | undefined) {
    if (!chapterId) {
      // 全局视图
      viewFilter.value = {
        scopeType: 'project',
      }
      return
    }

    // 获取当前章节所属的卷
    const volumeId = findParentVolumeId(chapterId)

    // 获取该卷和章节的登场角色列表
    const volumeCharacters = getDocumentCharacterIds(volumeId)
    const chapterCharacters = getDocumentCharacterIds(chapterId)

    // 合并去重
    const visibleCharacterIds = new Set([
      ...volumeCharacters,
      ...chapterCharacters,
    ])

    viewFilter.value = {
      scopeType: 'chapter',
      scopeId: chapterId,
      showOnly: visibleCharacterIds,
    }
  }

  // 查找父卷ID
  function findParentVolumeId(nodeId: string): string | undefined {
    const tree = writerStore.documentTree || []
    return findNodeParent(tree, nodeId)
  }

  function findNodeParent(nodes: any[], targetId: string, parentId?: string): string | undefined {
    for (const node of nodes) {
      if (node.id === targetId) {
        return parentId
      }
      if (node.children?.length) {
        const found = findNodeParent(node.children, targetId, node.id)
        if (found !== undefined) return found
      }
    }
    return undefined
  }

  // 获取大纲节点的登场角色ID列表
  function getDocumentCharacterIds(documentId?: string): string[] {
    if (!documentId) return []

    const doc = findDocument(writerStore.documentTree || [], documentId)
    if (!doc) return []

    // 优先使用 characterIds 字段
    if (doc.characterIds?.length) {
      return doc.characterIds
    }

    // 回退到 characterAppearances
    if (doc.characterAppearances?.length) {
      return doc.characterAppearances.map((a: any) => a.characterId)
    }

    return []
  }

  function findDocument(nodes: any[], id: string): any | null {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children?.length) {
        const found = findDocument(node.children, id)
        if (found) return found
      }
    }
    return null
  }

  // 判断关系在指定章节是否有效
  function isRelationValidAtChapter(
    relation: CharacterRelation,
    chapterId: string
  ): boolean {
    if (!relation.validFromChapterId && !relation.validUntilChapterId) {
      return true // 全局关系始终有效
    }

    const targetOrder = chapterOrderMap.value.get(chapterId)
    if (targetOrder === undefined) return false

    // 检查生效起始
    if (relation.validFromChapterId) {
      const fromOrder = chapterOrderMap.value.get(relation.validFromChapterId) || 1
      if (targetOrder < fromOrder) return false
    }

    // 检查失效章节
    if (relation.validUntilChapterId) {
      const toOrder = chapterOrderMap.value.get(relation.validUntilChapterId) || Infinity
      if (targetOrder >= toOrder) return false
    }

    return true
  }

  // 可见的节点
  const visibleNodes = computed(() => {
    const characters = writerStore.characters?.list || []
    const { showOnly } = viewFilter.value

    if (!showOnly || showOnly.size === 0) {
      return characters.map(char => toGraphNode(char))
    }

    return characters
      .filter(char => showOnly.has(char.id))
      .map(char => toGraphNode(char))
  })

  // 可见的链接
  const visibleLinks = computed(() => {
    const relations = writerStore.characters?.relations || []
    const { scopeType, scopeId } = viewFilter.value

    // 过滤：两端节点都可见
    const visibleNodeIds = new Set(visibleNodes.value.map(n => n.id))

    let filteredLinks = relations.filter(rel => {
      return visibleNodeIds.has(rel.fromId) && visibleNodeIds.has(rel.toId)
    })

    // 如果是章节视图，应用时序过滤
    if (scopeType === 'chapter' && scopeId) {
      filteredLinks = filteredLinks.filter(rel =>
        isRelationValidAtChapter(rel as CharacterRelation, scopeId)
      )
    }

    return filteredLinks.map(rel => toGraphLink(rel as CharacterRelation))
  })

  // 转换为图谱节点
  function toGraphNode(char: any): GraphNode {
    return {
      id: char.id,
      name: char.name,
      avatar: char.avatarUrl,
      importance: char.traits?.length || 0,
    }
  }

  // 转换为图谱链接
  function toGraphLink(rel: CharacterRelation): GraphLink {
    return {
      id: rel.id,
      source: rel.fromId,
      target: rel.toId,
      type: typeof rel.type === 'string' ? rel.type : '未定义',
      strength: rel.strength,
    }
  }

  // 手动设置视图类型
  function setViewType(type: ScopeType) {
    if (type === 'project') {
      viewFilter.value = { scopeType: 'project' }
    } else if (type === 'chapter' && currentChapterId.value) {
      updateViewFilter(currentChapterId.value)
    }
  }

  // 获取章节标题
  function getChapterTitle(chapterId: string): string {
    const doc = findDocument(writerStore.documentTree || [], chapterId)
    return doc?.title || doc?.name || '未命名'
  }

  return {
    viewFilter,
    visibleNodes,
    visibleLinks,
    currentChapterId,
    currentVolumeId,
    chapterOrderMap,
    isRelationValidAtChapter,
    updateViewFilter,
    setViewType,
    getChapterTitle,
    findParentVolumeId,
    getDocumentCharacterIds,
  }
}
