import { message, messageBox } from '@/design-system/services'
import { DocumentStatus } from '@/modules/writer/types/document'
import type { OutlineNode } from '@/types/writer'
import type { ComputedRef, Ref } from 'vue'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import type { StructureStatusValue } from './structureNodeTypes'
import type { StructureNodeFormValue } from './StructureNodeEditorDialog.vue'
import { mapLevelToDocumentType } from './structureNodeTypes'

type TreeDropPosition = 'before' | 'after'

export interface WriterStoreLike {
  error?: string | null
  loadOutlineTree: (projectId: string) => Promise<void>
  updateOutlineNode: (nodeId: string, projectId: string, payload: Record<string, unknown>) => Promise<void>
  createOutlineNode: (projectId: string, payload: Record<string, unknown>) => Promise<void>
  deleteOutlineNode: (nodeId: string, projectId: string) => Promise<void>
  moveOutlineNode: (
    nodeId: string,
    projectId: string,
    payload: { parentId?: string; order?: number },
  ) => Promise<void>
  setCurrentOutlineNode: (node: OutlineNode | null) => void
}

interface UseStructureStageActionsOptions {
  writerStore: WriterStoreLike
  effectiveProjectId: ComputedRef<string>
  currentChapterId: Ref<string>
  chapterOptions: ComputedRef<SidebarChapterSummary[]>
  rootNodes: ComputedRef<OutlineNode[]>
  flattenedNodes: ComputedRef<OutlineNode[]>
  filteredRootNodes: ComputedRef<OutlineNode[]>
  selectedNodeId: Ref<string>
  selectedNode: ComputedRef<OutlineNode | null>
  draftBindingChapterId: Ref<string>
  structureRefreshError: Ref<string>
  editorVisible: Ref<boolean>
  editorSubmitting: Ref<boolean>
  editorMode: Ref<'create-root' | 'create-child' | 'edit'>
  editorForm: Ref<StructureNodeFormValue>
  reloadWriterAssetRefs: () => void
  loadBlueprint: () => Promise<void>
  selectNode: (node: OutlineNode) => void
  expandRootNodes: () => void
}

export function useStructureStageActions(options: UseStructureStageActionsOptions) {
  const getNodeSiblingContext = (node: OutlineNode | null | undefined) => {
    if (!node) {
      return { siblings: [] as OutlineNode[], index: -1 }
    }

    const siblings = node.parentId
      ? options.flattenedNodes.value.find((item) => item.id === node.parentId)?.children || []
      : options.rootNodes.value
    const orderedSiblings = [...siblings].sort(
      (left, right) => (left.order ?? 0) - (right.order ?? 0),
    )

    return {
      siblings: orderedSiblings,
      index: orderedSiblings.findIndex((item) => item.id === node.id),
    }
  }

  const canMoveNodeUp = (node: OutlineNode): boolean => getNodeSiblingContext(node).index > 0

  const canMoveNodeDown = (node: OutlineNode): boolean => {
    const { siblings, index } = getNodeSiblingContext(node)
    return index >= 0 && index < siblings.length - 1
  }

  const openCreateChildForNode = (node: OutlineNode) => {
    options.selectNode(node)
    options.editorMode.value = 'create-child'
    options.editorForm.value = {
      title: '',
      level: Math.min((node.level || 1) + 1, 3),
      status: 'planned',
      description: '',
    }
    options.editorVisible.value = true
  }

  const openEditNode = (node: OutlineNode) => {
    options.selectNode(node)
    options.editorMode.value = 'edit'
    options.editorForm.value = {
      title: node.title || '',
      level: node.level || 1,
      status: node.status === 'completed' || node.status === 'writing' ? node.status : 'planned',
      description: node.description || '',
    }
    options.editorVisible.value = true
  }

  const handleRefresh = async () => {
    if (!options.effectiveProjectId.value) return
    options.structureRefreshError.value = ''
    try {
      await options.writerStore.loadOutlineTree(options.effectiveProjectId.value)
      options.reloadWriterAssetRefs()
      await options.loadBlueprint()
      options.expandRootNodes()
      if (!options.selectedNodeId.value && options.filteredRootNodes.value.length > 0) {
        options.selectNode(options.filteredRootNodes.value[0])
      }
    } catch (error) {
      const fallbackMessage =
        error instanceof Error
          ? error.message
          : options.writerStore.error || '结构数据加载失败，请稍后重试'
      options.structureRefreshError.value = fallbackMessage
      message.error(fallbackMessage)
    }
  }

  const moveNode = async (node: OutlineNode, direction: 'up' | 'down') => {
    if (!options.effectiveProjectId.value) return

    const { siblings, index } = getNodeSiblingContext(node)
    if (index < 0) return

    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= siblings.length) return

    const targetNode = siblings[targetIndex]
    if (!targetNode) return

    await options.writerStore.moveOutlineNode(node.id, options.effectiveProjectId.value, {
      parentId: node.parentId,
      order: targetNode.order,
    })

    options.selectNode(node)
    await handleRefresh()
    message.success(direction === 'up' ? '结构节点已上移' : '结构节点已下移')
  }

  const reorderNodeToSiblingPosition = async (
    node: OutlineNode,
    targetNode: OutlineNode,
    position: TreeDropPosition,
  ) => {
    if (!options.effectiveProjectId.value || node.id === targetNode.id) return
    if ((node.parentId || '') !== (targetNode.parentId || '')) return

    const siblingContext = getNodeSiblingContext(targetNode)
    const remainingSiblings = siblingContext.siblings.filter((item) => item.id !== node.id)
    const targetIndex = remainingSiblings.findIndex((item) => item.id === targetNode.id)
    if (targetIndex < 0) return

    const destinationIndex = position === 'before' ? targetIndex : targetIndex + 1

    await options.writerStore.moveOutlineNode(node.id, options.effectiveProjectId.value, {
      parentId: node.parentId,
      order: destinationIndex,
    })

    await handleRefresh()
    const refreshedNode = options.flattenedNodes.value.find((item) => item.id === node.id)
    if (refreshedNode) {
      options.selectNode(refreshedNode)
    }
    message.success(position === 'before' ? '结构节点已拖拽到目标前' : '结构节点已拖拽到目标后')
  }

  const moveNodeUp = async (node: OutlineNode) => moveNode(node, 'up')
  const moveNodeDown = async (node: OutlineNode) => moveNode(node, 'down')

  const handleTreeReorder = async (payload: {
    draggedNodeId: string
    targetNodeId: string
    position: TreeDropPosition
  }) => {
    const draggedNode = options.flattenedNodes.value.find((node) => node.id === payload.draggedNodeId)
    const targetNode = options.flattenedNodes.value.find((node) => node.id === payload.targetNodeId)
    if (!draggedNode || !targetNode) return

    await reorderNodeToSiblingPosition(draggedNode, targetNode, payload.position)
  }

  const bindChapterForNode = async (node: OutlineNode, chapterId: string) => {
    if (!options.effectiveProjectId.value) return

    const nodeWithType = node as OutlineNode & { type?: string }
    if (nodeWithType.type && nodeWithType.type !== 'volume') {
      message.warning('只有卷级别的大纲节点才能绑定章节')
      return
    }

    await options.writerStore.updateOutlineNode(node.id, options.effectiveProjectId.value, {
      title: node.title,
      status:
        node.status === 'completed' || node.status === 'writing'
          ? node.status
          : DocumentStatus.PLANNED,
      notes: (node as OutlineNode & { notes?: string }).notes,
      tags: [],
      documentId: chapterId,
    })

    options.selectNode(node)
    options.draftBindingChapterId.value = chapterId
    await handleRefresh()
    const chapter = options.chapterOptions.value.find((item) => item.id === chapterId)
    message.success(chapter ? `已绑定到章节「${chapter.title}」` : '章节绑定已更新')
  }

  const bindNodeToChapter = async (chapterId: string) => {
    if (!options.selectedNode.value) return
    await bindChapterForNode(options.selectedNode.value, chapterId)
  }

  const unbindChapterForNode = async (node: OutlineNode) => {
    if (!options.effectiveProjectId.value) return

    await options.writerStore.updateOutlineNode(node.id, options.effectiveProjectId.value, {
      title: node.title,
      status:
        node.status === 'completed' || node.status === 'writing'
          ? node.status
          : DocumentStatus.PLANNED,
      notes: (node as OutlineNode & { notes?: string }).notes,
      tags: [],
      documentId: '',
    })

    options.selectNode(node)
    options.draftBindingChapterId.value = ''
    await handleRefresh()
    message.success('章节绑定已解除')
  }

  const unbindNodeFromChapter = async () => {
    if (!options.selectedNode.value || !options.effectiveProjectId.value) return
    await unbindChapterForNode(options.selectedNode.value)
  }

  const bindCurrentChapterForNode = async (node: OutlineNode) => {
    if (!options.currentChapterId.value) return

    const nodeWithType = node as OutlineNode & { type?: string }
    if (nodeWithType.type && nodeWithType.type !== 'volume') {
      message.warning('只有卷级别的大纲节点才能绑定章节')
      return
    }

    await bindChapterForNode(node, options.currentChapterId.value)
  }

  const updateNodeStatus = async (node: OutlineNode, status: StructureStatusValue) => {
    if (!options.effectiveProjectId.value) return
    if ((node.status || 'planned') === status) return

    await options.writerStore.updateOutlineNode(node.id, options.effectiveProjectId.value, {
      title: node.title,
      status: status === 'planned' ? DocumentStatus.PLANNED : status,
      notes: (node as OutlineNode & { notes?: string }).notes,
      tags: (node as OutlineNode & { tags?: string[] }).tags,
    })

    options.selectNode(node)
    await handleRefresh()
    message.success(
      `结构节点已切换为「${status === 'planned' ? '草稿' : status === 'writing' ? '写作中' : '已完成'}」`,
    )
  }

  const submitNodeEditor = async (value: StructureNodeFormValue) => {
    if (!options.effectiveProjectId.value) {
      message.warning('当前没有可用项目')
      return
    }
    if (!value.title) {
      message.warning('请输入节点标题')
      return
    }

    options.editorSubmitting.value = true
    try {
      if (options.editorMode.value === 'edit' && options.selectedNode.value) {
        await options.writerStore.updateOutlineNode(
          options.selectedNode.value.id,
          options.effectiveProjectId.value,
          {
            title: value.title,
            status: value.status === 'planned' ? DocumentStatus.PLANNED : value.status,
            notes: value.description,
          },
        )
        message.success('结构节点已更新')
      } else {
        await options.writerStore.createOutlineNode(options.effectiveProjectId.value, {
          parentId:
            options.editorMode.value === 'create-child' ? options.selectedNode.value?.id : undefined,
          title: value.title,
          type: mapLevelToDocumentType(value.level),
          order: options.flattenedNodes.value.length,
        })
        message.success(options.editorMode.value === 'create-child' ? '子节点已创建' : '主干节点已创建')
      }

      options.editorVisible.value = false
      await handleRefresh()
    } finally {
      options.editorSubmitting.value = false
    }
  }

  const handleCanvasEditNode = async (node: OutlineNode) => {
    if (!options.effectiveProjectId.value) return
    openEditNode(node)
  }

  const handleCanvasDeleteNode = async (node: OutlineNode) => {
    if (!options.effectiveProjectId.value) return
    await messageBox.confirm(`确定删除结构节点"${node.title}"吗？`, '删除节点', {
      type: 'warning',
    })
    await options.writerStore.deleteOutlineNode(node.id, options.effectiveProjectId.value)
    if (options.selectedNodeId.value === node.id) {
      options.selectedNodeId.value = ''
      options.draftBindingChapterId.value = ''
    }
    message.success('结构节点已删除')
  }

  return {
    canMoveNodeUp,
    canMoveNodeDown,
    openCreateChildForNode,
    openEditNode,
    handleRefresh,
    moveNodeUp,
    moveNodeDown,
    handleTreeReorder,
    bindNodeToChapter,
    unbindNodeFromChapter,
    unbindChapterForNode,
    bindChapterForNode,
    bindCurrentChapterForNode,
    updateNodeStatus,
    submitNodeEditor,
    handleCanvasEditNode,
    handleCanvasDeleteNode,
  }
}
