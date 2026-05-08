/**
 * useWorkspaceState - 工作区核心状态管理 Composable
 *
 * 从 ProjectWorkspace.vue 提取的核心状态管理逻辑，包括：
 * - 项目/文档 ID 绑定 (computed get/set)
 * - 显示名称、标题等计算属性
 * - 统计数据 (章节数、目录节点数)
 * - 工具标签、保存状态等 UI 状态
 */
import { computed, unref, type ComputedRef, type WritableComputedRef } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from '@/modules/writer/stores/projectStore'
import { useDocumentStore } from '@/modules/writer/stores/documentStore'
import { useEditorStore, type ActiveTool } from '@/modules/writer/stores/editorStore'
import { DocumentType, type Document } from '@/modules/writer/types/document'
import type { SidebarProjectSummary, SidebarChapterSummary, MockProjectData } from './types'

// 重新导出类型以保持向后兼容
export type { SidebarProjectSummary, SidebarChapterSummary, MockProjectData }

// =======================
// Types
// =======================

/** useWorkspaceState 参数 */
export interface UseWorkspaceStateOptions {
  /** props 中的 projectId */
  projectIdProp?: string
  /** 是否为测试模式 */
  isTestMode: ComputedRef<boolean>
  /** Mock 项目数据 */
  mockProject: ComputedRef<MockProjectData | null>
}

/** useWorkspaceState 返回值 */
export interface UseWorkspaceStateReturn {
  // 核心绑定 (可写 computed)
  currentProjectId: WritableComputedRef<string>
  currentChapterId: WritableComputedRef<string>
  // 显示属性
  projectDisplayName: ComputedRef<string>
  currentChapterTitle: ComputedRef<string>
  // 统计
  chapterCount: ComputedRef<number>
  directoryCount: ComputedRef<number>
  // UI 状态
  activeToolLabel: ComputedRef<string>
  saveStatusLabel: ComputedRef<string>
  // 编辑器内容绑定 (可写 computed)
  tipTapContent: WritableComputedRef<string>
  // 数据源
  projects: ComputedRef<SidebarProjectSummary[]>
  flatChapters: ComputedRef<SidebarChapterSummary[]>
  availableDocMap: ComputedRef<Map<string, Document>>
}

// =======================
// Composable
// =======================

/**
 * 工作区核心状态管理
 *
 * @param options 配置选项
 * @returns 状态和方法
 */
export function useWorkspaceState(options: UseWorkspaceStateOptions): UseWorkspaceStateReturn {
  const { projectIdProp, isTestMode, mockProject } = options

  const route = useRoute()
  const projectStore = useProjectStore()
  const documentStore = useDocumentStore()
  const editorStore = useEditorStore()

  // =======================
  // 数据源计算
  // =======================

  /** 从 store 获取的文档列表 */
  const docsFromStore = computed(() => {
    return (documentStore.flatDocs || []) as Document[]
  })

  /** 可用文档映射 (合并 store 和 mock 数据) */
  const availableDocMap = computed(() => {
    const map = new Map<string, Document>()
    for (const doc of docsFromStore.value) {
      map.set(doc.id, doc)
    }
    for (const doc of mockProject.value?.docs || []) {
      if (!map.has(doc.id)) {
        map.set(doc.id, doc)
      }
    }
    return map
  })

  // =======================
  // 核心绑定
  // =======================

  /** 当前项目 ID (双向绑定) */
  const currentProjectId = computed({
    get: () => projectIdProp || projectStore.currentProjectId || (route.params.projectId as string),
    set: (id) => {
      if (id) {
        projectStore.loadDetail(id)
        documentStore.loadTree(id)
      }
    },
  })

  /** 当前章节 ID (双向绑定) */
  const currentChapterId = computed({
    get: () => (route.query.chapterId as string) || documentStore.currentDocMeta?.id || '',
    set: async (id) => {
      if (!id) return
      const selectedDoc = availableDocMap.value.get(id)
      if (selectedDoc) {
        await documentStore.selectDocument(selectedDoc)
      }
      await editorStore.loadDocument(id)
    },
  })

  // =======================
  // 项目列表
  // =======================

  /** 供 Sidebar 使用的项目列表 */
  const projects = computed<SidebarProjectSummary[]>(() => {
    const normalized = (projectStore.projects || []).map((p: Record<string, unknown>) => ({
      id: p.id as string,
      title: p.title as string,
      status: (p.status as string) || 'writing',
      wordCount: Number(p.wordCount ?? p.totalWords ?? 0),
      chapterCount: Number(p.chapterCount ?? 0),
      updatedAt:
        (p.updatedAt as string) || (p.lastUpdateTime as string) || new Date().toISOString(),
    }))

    const mock = mockProject.value?.project
    if (mock && !normalized.some((p) => p.id === mock.id)) {
      normalized.unshift(mock)
    }

    return normalized
  })

  // =======================
  // 章节数据
  // =======================

  /** 用于构建树的文档列表 */
  const docsForTree = computed<Document[]>(() => {
    const docs = [...docsFromStore.value]
    if (!isTestMode.value || !mockProject.value?.docs?.length) return docs
    const seen = new Set(docs.map((doc) => doc.id))
    for (const doc of mockProject.value.docs) {
      if (!seen.has(doc.id)) {
        docs.push(doc)
      }
    }
    return docs
  })

  /** 从文档列表转换的章节摘要 */
  const chaptersFromDocs = computed<SidebarChapterSummary[]>(() => {
    const docs = docsForTree.value

    // LexoRank 字符串比较函数
    const compareByOrderKey = (a: Document, b: Document) => {
      const keyA = a.orderKey || ''
      const keyB = b.orderKey || ''
      // LexoRank 是字符串，直接按字典序比较
      if (keyA < keyB) return -1
      if (keyA > keyB) return 1
      // 如果 orderKey 相同，回退到 order 字段
      return (a.order || 0) - (b.order || 0)
    }

    // 按文档类型分类
    const sceneDocs = docs
      .filter((doc) => doc.type === DocumentType.SCENE || doc.type === DocumentType.VOLUME)
      .sort(compareByOrderKey)

    const chapterDocs = docs
      .filter((doc) => doc.type === DocumentType.CHAPTER)
      .sort(compareByOrderKey)

    // 无目录结构时直接返回章节列表
    if (sceneDocs.length === 0) {
      return chapterDocs.map((doc, index) => ({
        id: doc.id,
        projectId: doc.projectId,
        chapterNum: index + 1,
        title: doc.title,
        wordCount: Number(doc.wordCount || 0),
        updatedAt: doc.updatedAt || new Date().toISOString(),
        status: doc.status === 'completed' ? 'published' : 'draft',
        nodeType: 'chapter' as const,
        sortOrder: index + 1,
        orderKey: doc.orderKey,
      }))
    }

    // 构建带目录的章节列表
    const list: SidebarChapterSummary[] = []
    let runningIndex = 1

    // 辅助函数：检查 parentId 是否为空（根级别）
    const isRootLevel = (parentId: string | undefined) =>
      !parentId || parentId === '000000000000000000000000'

    // 计算基于 orderKey 的排序索引（用于 sortOrder）
    let dirIndex = 0
    const dirOrderMap = new Map<string, number>()
    for (const scene of sceneDocs) {
      dirOrderMap.set(scene.id, dirIndex++)
    }

    for (const scene of sceneDocs) {
      const dirSortOrder = (dirOrderMap.get(scene.id) || 0) * 1000

      // 添加目录节点
      list.push({
        id: scene.id,
        projectId: scene.projectId,
        parentId: scene.parentId,
        chapterNum: 0,
        title: scene.title,
        wordCount: 0,
        updatedAt: scene.updatedAt || new Date().toISOString(),
        status: scene.status === 'completed' ? 'published' : 'draft',
        nodeType: 'directory' as const,
        sortOrder: dirSortOrder,
        orderKey: scene.orderKey,
      })

      // 添加目录下的章节（已在 chapterDocs 中按 orderKey 排序）
      const children = chapterDocs.filter((chapter) => chapter.parentId === scene.id)

      for (const chapter of children) {
        list.push({
          id: chapter.id,
          projectId: chapter.projectId,
          parentId: chapter.parentId,
          chapterNum: runningIndex++,
          title: chapter.title,
          wordCount: Number(chapter.wordCount || 0),
          updatedAt: chapter.updatedAt || new Date().toISOString(),
          status: chapter.status === 'completed' ? 'published' : 'draft',
          nodeType: 'chapter' as const,
          sortOrder: dirSortOrder + runningIndex,
          orderKey: chapter.orderKey,
        })
      }
    }

    // 添加根级别的章节（不属于任何目录的章节）
    const rootChapters = chapterDocs.filter((chapter) => isRootLevel(chapter.parentId))

    for (const chapter of rootChapters) {
      list.push({
        id: chapter.id,
        projectId: chapter.projectId,
        parentId: chapter.parentId,
        chapterNum: runningIndex++,
        title: chapter.title,
        wordCount: Number(chapter.wordCount || 0),
        updatedAt: chapter.updatedAt || new Date().toISOString(),
        status: chapter.status === 'completed' ? 'published' : 'draft',
        nodeType: 'chapter' as const,
        sortOrder: 100000 + runningIndex, // 根级别章节放在最后
        orderKey: chapter.orderKey,
      })
    }

    return list
  })

  /** 扁平化章节列表 (用于侧边栏) */
  const flatChapters = computed(() => {
    if (chaptersFromDocs.value.length > 0) return chaptersFromDocs.value
    return mockProject.value?.chapters || []
  })

  // =======================
  // 显示属性
  // =======================

  /** 项目显示名称 */
  const projectDisplayName = computed(() => {
    return (
      mockProject.value?.project?.title ||
      (projectStore.currentProject as { title?: string } | null)?.title ||
      projects.value.find((item) => item.id === currentProjectId.value)?.title ||
      '未命名项目'
    )
  })

  /** 当前章节标题 */
  const currentChapterTitle = computed(() => {
    const target = flatChapters.value.find((item) => item.id === currentChapterId.value)
    return target?.title || '未选择章节'
  })

  // =======================
  // 统计
  // =======================

  /** 章节总数 */
  const chapterCount = computed(() => {
    return flatChapters.value.filter((item) => item.nodeType !== 'directory').length
  })

  /** 目录节点数 */
  const directoryCount = computed(() => {
    return flatChapters.value.filter((item) => item.nodeType === 'directory').length
  })

  // =======================
  // UI 状态
  // =======================

  /** 当前工具标签 */
  const activeToolLabel = computed(() => {
    const currentTool = unref(editorStore.activeTool) as ActiveTool
    const labels: Record<ActiveTool, string> = {
      chapters: '章节模式',
      writing: '写作模式',
      immersive: '沉浸模式',
      ai: 'AI助手',
      encyclopedia: '设定百科',
    }
    return labels[currentTool] || '工作台'
  })

  /** 保存状态标签 */
  const saveStatusLabel = computed(() => editorStore.saveStatusText || '系统就绪')

  // =======================
  // 编辑器内容绑定
  // =======================

  /** TipTap 编辑器内容 (双向绑定) */
  const tipTapContent = computed({
    get: () => editorStore.editorContent || editorStore.content,
    set: (val: string) => {
      editorStore.editorContent = val
      // 保持旧内容链路兼容：写作统计/AI 上下文仍可读取 content
      editorStore.setContent(val)
    },
  })

  return {
    // 核心绑定
    currentProjectId,
    currentChapterId,
    // 显示属性
    projectDisplayName,
    currentChapterTitle,
    // 统计
    chapterCount,
    directoryCount,
    // UI 状态
    activeToolLabel,
    saveStatusLabel,
    // 编辑器内容绑定
    tipTapContent,
    // 数据源
    projects,
    flatChapters,
    availableDocMap,
  }
}
