import { ref, computed } from 'vue'
import type { Document } from '../types/document'

/**
 * 文档选择状态管理Composable
 * 支持单选、多选、范围选择等功能
 */
export function useDocumentSelection() {
  // 选中的文档ID集合
  const selectedIds = ref<Set<string>>(new Set())

  // 最后选中的文档ID（用于范围选择）
  const lastSelectedId = ref<string | null>(null)

  /**
   * 判断文档是否被选中
   */
  const isSelected = (id: string): boolean => {
    return selectedIds.value.has(id)
  }

  /**
   * 选中的文档数量
   */
  const selectionCount = computed(() => selectedIds.value.size)

  /**
   * 选中的文档ID列表
   */
  const selectedDocuments = computed(() => {
    return Array.from(selectedIds.value)
  })

  /**
   * 是否有选中的文档
   */
  const hasSelection = computed(() => selectedIds.value.size > 0)

  /**
   * 单选/切换选择（Ctrl/Cmd + 点击）
   * @param id 文档ID
   * @param event 鼠标事件（可选）
   */
  function toggleSelection(id: string, event: MouseEvent | null = null): void {
    const isCtrlClick = event?.ctrlKey || event?.metaKey

    if (isCtrlClick) {
      // Ctrl/Cmd点击：切换选择状态
      if (selectedIds.value.has(id)) {
        selectedIds.value.delete(id)
      } else {
        selectedIds.value.add(id)
      }
    } else {
      // 普通点击：替换选择
      selectedIds.value.clear()
      selectedIds.value.add(id)
    }

    lastSelectedId.value = id
  }

  /**
   * 范围选择（Shift + 点击）
   * @param id 文档ID
   * @param documentList 扁平化的文档列表
   */
  function selectRange(id: string, documentList: Document[]): void {
    if (!lastSelectedId.value) {
      // 没有最后选中的文档，直接选中当前文档
      selectedIds.value.add(id)
      lastSelectedId.value = id
      return
    }

    // 找到lastSelected和当前id在列表中的位置
    const lastIndex = documentList.findIndex(d => d.id === lastSelectedId.value)
    const currentIndex = documentList.findIndex(d => d.id === id)

    if (lastIndex === -1 || currentIndex === -1) {
      // 找不到，当作普通单选处理
      selectedIds.value.clear()
      selectedIds.value.add(id)
      lastSelectedId.value = id
      return
    }

    // 选择范围内的所有文档
    selectedIds.value.clear()
    const start = Math.min(lastIndex, currentIndex)
    const end = Math.max(lastIndex, currentIndex)

    for (let i = start; i <= end; i++) {
      selectedIds.value.add(documentList[i].id)
    }

    lastSelectedId.value = id
  }

  /**
   * 全选
   * @param ids 要选中的文档ID列表
   */
  function selectAll(ids: string[]): void {
    selectedIds.value.clear()
    ids.forEach(id => selectedIds.value.add(id))
  }

  /**
   * 清除选择
   */
  function clearSelection(): void {
    selectedIds.value.clear()
    lastSelectedId.value = null
  }

  return {
    // 状态
    selectedIds,
    lastSelectedId,

    // 计算属性
    selectionCount,
    selectedDocuments,
    hasSelection,

    // 方法
    isSelected,
    toggleSelection,
    selectRange,
    selectAll,
    clearSelection
  }
}
