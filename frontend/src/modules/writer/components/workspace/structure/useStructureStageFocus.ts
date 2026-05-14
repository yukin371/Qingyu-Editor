import { computed, type ComputedRef, type Ref } from 'vue'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import type { WriterAssetSummary } from '@/modules/writer/utils/writerAssetRefs'
import type { OutlineNode } from '@/types/writer'
import { findBoundChapter, getBoundChapterId } from './structureNodeTypes'

interface UseStructureStageFocusOptions {
  selectedNodeId: Ref<string>
  filteredFlattenedNodes: ComputedRef<OutlineNode[]>
  chapterOptions: ComputedRef<SidebarChapterSummary[]>
  currentChapterTitle: Ref<string>
  assetSummaryByChapterId: ComputedRef<Record<string, WriterAssetSummary>>
}

export function useStructureStageFocus(options: UseStructureStageFocusOptions) {
  const selectedNode = computed(
    () =>
      options.filteredFlattenedNodes.value.find(
        (node) => node.id === options.selectedNodeId.value,
      ) || null,
  )

  const boundChapter = computed(() =>
    findBoundChapter(selectedNode.value, options.chapterOptions.value),
  )

  const selectedNodeAssetCount = computed(() => {
    const chapterId = getBoundChapterId(selectedNode.value)
    if (!chapterId) return 0
    return options.assetSummaryByChapterId.value[chapterId]?.total || 0
  })

  const defaultStagePrimaryHint = computed(() => {
    if (boundChapter.value) {
      return `已绑定「${boundChapter.value.title}」，可以直接进入正文继续写。`
    }
    if (selectedNode.value && options.currentChapterTitle.value) {
      return `当前工作章节是「${options.currentChapterTitle.value}」，可直接把它绑定到这个节点。`
    }
    if (selectedNode.value) {
      return '先确定这个节点落到哪一章，再进入正文会更顺。'
    }
    return '先从左侧大纲树或下方队列选择一个节点。'
  })

  const defaultStageActionText = computed(() => {
    if (boundChapter.value) {
      return '进入已绑定章节继续写'
    }
    if (selectedNode.value && options.currentChapterTitle.value) {
      return '绑定当前章节'
    }
    if (selectedNode.value) {
      return '补章节绑定'
    }
    return '先选节点'
  })

  return {
    selectedNode,
    boundChapter,
    selectedNodeAssetCount,
    defaultStagePrimaryHint,
    defaultStageActionText,
  }
}
