import { DocumentType } from '@/modules/writer/types/document'
import type { ChapterGraph } from '@/modules/writer/types/character'
import type { OutlineNode } from '@/types/writer'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'

// 已废弃：不再使用 chapter-binding tag，统一使用 documentId 字段
// const CHAPTER_BINDING_TAG_PREFIX = 'chapter-binding:'

export const STRUCTURE_STATUS_OPTIONS = [
  { value: 'planned', label: '草稿' },
  { value: 'writing', label: '写作中' },
  { value: 'completed', label: '已完成' },
] as const

export type StructureStatusValue = (typeof STRUCTURE_STATUS_OPTIONS)[number]['value']

export function mapLevelToDocumentType(level: number): DocumentType {
  if (level <= 1) return DocumentType.CHAPTER
  if (level === 2) return DocumentType.SECTION
  return DocumentType.SCENE
}

export function getStructureNodeStatusText(node: OutlineNode | null | undefined): string {
  if (node?.status === 'completed') return '已完成'
  if (node?.status === 'writing') return '写作中'
  if (node?.status === 'reviewing') return '审核中'
  return '草稿'
}

export function getStructureNodeLane(node: OutlineNode): 'draft' | 'writing' | 'completed' {
  if (node.status === 'completed') return 'completed'
  if (node.status === 'writing' || node.status === 'reviewing') return 'writing'
  return 'draft'
}

export function getStructureNodeBindingState(node: OutlineNode | null | undefined): {
  label: string
  tone: 'linked' | 'unlinked'
} {
  if (getBoundChapterId(node)) {
    return {
      label: '已绑定章节',
      tone: 'linked',
    }
  }

  return {
    label: '待绑定章节',
    tone: 'unlinked',
  }
}

export function getBoundChapterId(node: OutlineNode | null | undefined): string {
  return node?.documentId || ''
}

/**
 * @deprecated 已废弃：不再使用 chapter-binding tag
 * 绑定关系现在统一通过 documentId 字段管理
 * 此函数保留仅为向后兼容，返回空数组
 */
export function buildStructureNodeTags(
  _node: OutlineNode | null | undefined,
  _chapterId: string,
): string[] {
  // 不再构建 chapter-binding tags，统一使用 documentId 字段
  return []
}

export function findBoundChapter(
  node: OutlineNode | null | undefined,
  chapters: SidebarChapterSummary[],
): SidebarChapterSummary | null {
  const chapterId = getBoundChapterId(node)
  if (!chapterId) return null
  return chapters.find((chapter) => chapter.id === chapterId) || null
}

export function getBoundChapterLabel(
  node: OutlineNode | null | undefined,
  chapters: SidebarChapterSummary[],
): string {
  const chapter = findBoundChapter(node, chapters)
  return chapter?.title || ''
}

export function getBoundChapterGraph(
  node: OutlineNode | null | undefined,
  chapterGraphs: ChapterGraph[],
): ChapterGraph | null {
  const chapterId = getBoundChapterId(node)
  if (!chapterId) return null
  return chapterGraphs.find((graph) => graph.chapterId === chapterId) || null
}

export function hasBoundChapterGraph(
  node: OutlineNode | null | undefined,
  chapterGraphs: ChapterGraph[],
): boolean {
  return !!getBoundChapterGraph(node, chapterGraphs)
}

export function getStructureNodeGraphState(
  node: OutlineNode | null | undefined,
  chapterGraphs: ChapterGraph[],
): {
  label: string
  tone: 'ready' | 'inherit' | 'missing' | 'unbound'
} {
  const chapterId = getBoundChapterId(node)
  if (!chapterId) {
    return {
      label: '未绑定图谱',
      tone: 'unbound',
    }
  }

  const chapterGraph = chapterGraphs.find((graph) => graph.chapterId === chapterId)
  if (!chapterGraph) {
    return {
      label: '图谱未建',
      tone: 'missing',
    }
  }

  if (chapterGraph.parentGraphId) {
    return {
      label: '继承图谱',
      tone: 'inherit',
    }
  }

  return {
    label: '独立图谱',
    tone: 'ready',
  }
}

export function matchesStructureNodeGraphFilter(
  node: OutlineNode | null | undefined,
  chapterGraphs: ChapterGraph[],
  filter: 'ready' | 'inherit' | 'missing' | 'unbound' | 'graphed',
): boolean {
  const graphState = getStructureNodeGraphState(node, chapterGraphs)
  if (filter === 'graphed') {
    return graphState.tone === 'ready' || graphState.tone === 'inherit'
  }
  return graphState.tone === filter
}
