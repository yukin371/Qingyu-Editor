import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getDocumentTree } from '../api/document'
import type { DocumentStatus } from '../types/document'

/**
 * 章节状态类型
 */
export type ChapterStatus = 'draft' | 'writing' | 'completed'

/**
 * 章节节点类型
 * 用于章节树的展示和管理
 */
export interface ChapterNode {
  /** 章节ID */
  id: string
  /** 父节点ID（null为根节点） */
  parentId: string | null
  /** 项目ID */
  projectId: string
  /** 章节标题 */
  title: string
  /** 排序序号 */
  order: number
  /** 字数 */
  wordCount: number
  /** 状态 */
  status: ChapterStatus
  /** 子章节（前端组装） */
  children?: ChapterNode[]
}

/**
 * 文档树节点接口（API 返回格式）
 */
interface DocumentTreeNode {
  id?: string
  documentId?: string
  _id?: string
  title?: string
  order?: number
  wordCount?: number
  status?: DocumentStatus | string
  children?: DocumentTreeNode[]
}

/**
 * 章节管理 Store
 * 负责章节树的加载、展示和操作
 */
export const useChapterStore = defineStore('writer-chapter', () => {
  // ==================== State ====================

  /** 章节列表（扁平结构） */
  const chapters = ref<ChapterNode[]>([])

  /** 当前选中的章节ID */
  const currentChapterId = ref<string | null>(null)

  /** 加载状态 */
  const loading = ref(false)

  // ==================== Getters ====================

  /**
   * 当前选中的章节
   */
  const currentChapter = computed(() => {
    if (!currentChapterId.value) return null
    return chapters.value.find((c) => c.id === currentChapterId.value) || null
  })

  /**
   * 章节树（树形结构）
   * 将扁平列表组装为树形结构
   */
  const chapterTree = computed(() => {
    return buildChapterTree(chapters.value)
  })

  // ==================== Actions ====================

  /**
   * 设置当前选中章节
   */
  function setCurrentChapter(chapterId: string | null) {
    currentChapterId.value = chapterId
  }

  /**
   * 加载项目的章节列表
   * 从文档树API获取数据并转换为章节节点格式
   */
  async function loadChapters(projectId: string) {
    loading.value = true
    try {
      // 调用文档树API
      const treeData = await getDocumentTree(projectId)

      // 将文档树扁平化为章节列表
      const flattenTree = (
        nodes: DocumentTreeNode[],
        parentId: string | null = null,
      ): ChapterNode[] => {
        const result: ChapterNode[] = []
        for (const node of nodes) {
          const chapter: ChapterNode = {
            id: node.id || node.documentId || node._id || '',
            parentId,
            projectId,
            title: node.title || '未命名',
            order: node.order ?? 0,
            wordCount: node.wordCount ?? 0,
            status: mapDocumentStatusToChapterStatus(node.status),
          }
          result.push(chapter)

          // 递归处理子节点
          if (node.children && node.children.length > 0) {
            result.push(...flattenTree(node.children, chapter.id))
          }
        }
        return result
      }

      // 处理返回的数据结构
      const nodes = Array.isArray(treeData)
        ? treeData
        : (treeData as { tree?: DocumentTreeNode[] })?.tree || []
      chapters.value = flattenTree(nodes)
    } catch (error) {
      console.error('加载章节列表失败:', error)
      chapters.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * 添加章节
   */
  function addChapter(chapter: ChapterNode) {
    chapters.value.push(chapter)
  }

  /**
   * 更新章节
   */
  function updateChapter(chapterId: string, updates: Partial<ChapterNode>) {
    const index = chapters.value.findIndex((c) => c.id === chapterId)
    if (index !== -1) {
      chapters.value[index] = {
        ...chapters.value[index],
        ...updates,
      }
    }
  }

  /**
   * 删除章节
   */
  function deleteChapter(chapterId: string) {
    chapters.value = chapters.value.filter((c) => c.id !== chapterId)

    // 如果删除的是当前选中章节，清空选中状态
    if (currentChapterId.value === chapterId) {
      currentChapterId.value = null
    }
  }

  /**
   * 批量设置章节（用于初始化或重置）
   */
  function setChapters(newChapters: ChapterNode[]) {
    chapters.value = newChapters
  }

  /**
   * 重置状态
   */
  function reset() {
    chapters.value = []
    currentChapterId.value = null
    loading.value = false
  }

  // ==================== Helper Functions ====================

  /**
   * 将文档状态映射为章节状态
   */
  function mapDocumentStatusToChapterStatus(
    status: DocumentStatus | string | undefined,
  ): ChapterStatus {
    switch (status) {
      case 'completed':
        return 'completed'
      case 'writing':
        return 'writing'
      case 'planned':
      case 'draft':
      default:
        return 'draft'
    }
  }

  /**
   * 构建章节树
   * 将扁平列表转换为树形结构
   */
  function buildChapterTree(flatList: ChapterNode[]): ChapterNode[] {
    const map = new Map<string, ChapterNode>()
    const roots: ChapterNode[] = []

    // 先创建所有节点的映射
    for (const node of flatList) {
      map.set(node.id, { ...node, children: [] })
    }

    // 构建树形结构
    for (const node of flatList) {
      const currentNode = map.get(node.id)!
      if (node.parentId === null || !map.has(node.parentId)) {
        // 根节点
        roots.push(currentNode)
      } else {
        // 添加到父节点的 children
        const parent = map.get(node.parentId)
        if (parent) {
          if (!parent.children) {
            parent.children = []
          }
          parent.children.push(currentNode)
        }
      }
    }

    // 按 order 排序
    const sortByOrder = (a: ChapterNode, b: ChapterNode) => a.order - b.order
    const sortChildren = (nodes: ChapterNode[]) => {
      nodes.sort(sortByOrder)
      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
          sortChildren(node.children)
        }
      }
    }
    sortChildren(roots)

    return roots
  }

  return {
    // State
    chapters,
    currentChapterId,
    loading,

    // Getters
    currentChapter,
    chapterTree,

    // Actions
    setCurrentChapter,
    loadChapters,
    addChapter,
    updateChapter,
    deleteChapter,
    setChapters,
    reset,
  }
})
