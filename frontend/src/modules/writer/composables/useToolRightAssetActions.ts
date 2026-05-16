import { ref, type ComputedRef, type Ref } from 'vue'
import { message, messageBox } from '@/design-system/services'
import { useToolOverlay } from '@/modules/writer/composables/useToolOverlay'
import type { EncyclopediaCategory, GraphFocusTarget } from '@/modules/writer/composables/types'
import type {
  WriterAssetListItem,
  WriterAssetMutationInput,
  WriterAssetScopeView,
} from '@/modules/writer/composables/useWriterAssetCatalog'

interface UseToolRightAssetActionsOptions {
  assetCategory: Ref<EncyclopediaCategory>
  filteredAssets: ComputedRef<WriterAssetListItem[]>
  selectedAsset: Ref<WriterAssetListItem | null>
  selectAsset: (asset: WriterAssetListItem | null) => void
  createAsset: (payload: WriterAssetMutationInput) => Promise<unknown>
  updateAsset: (asset: WriterAssetListItem, payload: WriterAssetMutationInput) => Promise<unknown>
  deleteAsset: (asset: WriterAssetListItem) => Promise<void>
  buildGraphFocusTarget: (asset: WriterAssetListItem) => GraphFocusTarget
  assetScopeView?: Ref<WriterAssetScopeView>
}

export const useToolRightAssetActions = ({
  assetCategory,
  filteredAssets,
  selectedAsset,
  selectAsset,
  createAsset,
  updateAsset,
  deleteAsset,
  buildGraphFocusTarget,
  assetScopeView,
}: UseToolRightAssetActionsOptions) => {
  const toolOverlay = useToolOverlay()
  const assetEditorVisible = ref(false)
  const assetEditorMode = ref<'create' | 'edit'>('create')
  const assetEditorSubmitting = ref(false)
  const assetEditorCategory = ref<EncyclopediaCategory>(assetCategory.value)

  const handleAssetSelect = (assetId: string) => {
    const nextAsset = filteredAssets.value.find((asset) => asset.id === assetId) || null
    selectAsset(nextAsset)
  }

  const handleCreateAsset = (category?: EncyclopediaCategory) => {
    if (assetScopeView) {
      assetScopeView.value = 'global'
    }
    assetEditorCategory.value = category || assetCategory.value
    assetCategory.value = assetEditorCategory.value
    assetEditorMode.value = 'create'
    assetEditorVisible.value = true
  }

  const handleEditAsset = () => {
    if (!selectedAsset.value || selectedAsset.value.unresolved) return
    assetEditorCategory.value = selectedAsset.value.category
    assetEditorMode.value = 'edit'
    assetEditorVisible.value = true
  }

  const handleDeleteAsset = async () => {
    if (!selectedAsset.value || selectedAsset.value.unresolved) return
    const chapterImpact = selectedAsset.value.chapterReferenceCount
      ? `将影响 ${selectedAsset.value.chapterReferenceCount} 个章节引用`
      : '当前没有章节引用记录'
    const volumeImpact = selectedAsset.value.volumeReferenceCount
      ? `，涉及 ${selectedAsset.value.volumeReferenceCount} 个卷级投影`
      : ''
    try {
      await messageBox.confirm(
        `确定删除资产「${selectedAsset.value.name}」吗？${chapterImpact}${volumeImpact}。此操作不可恢复。`,
        '删除资产',
        {
          type: 'warning',
        },
      )
      await deleteAsset(selectedAsset.value)
      message.success('资产已删除')
    } catch {
      // 取消或失败都保持原状
    }
  }

  const handleAssetEditorSubmit = async (payload: WriterAssetMutationInput) => {
    assetEditorSubmitting.value = true
    try {
      if (assetEditorMode.value === 'edit' && selectedAsset.value) {
        await updateAsset(selectedAsset.value, payload)
        message.success('资产已更新')
      } else {
        if (assetScopeView) {
          assetScopeView.value = 'global'
        }
        await createAsset(payload)
        assetCategory.value = payload.category
        message.success('资产已创建')
      }
      assetEditorVisible.value = false
    } catch (error) {
      message.error((error as Error).message || '保存资产失败')
    } finally {
      assetEditorSubmitting.value = false
    }
  }

  const handleOpenAssetsFullscreen = () => {
    toolOverlay.openFromRightPanel('assets', {
      assetsCategory: assetCategory.value,
      assetId: selectedAsset.value?.id,
    })
  }

  const handleOpenAssetGraph = () => {
    if (!selectedAsset.value || selectedAsset.value.unresolved) return
    toolOverlay.openFromRightPanel('relations', {
      focusedAsset: buildGraphFocusTarget(selectedAsset.value),
    })
  }

  return {
    assetEditorVisible,
    assetEditorMode,
    assetEditorSubmitting,
    assetEditorCategory,
    handleAssetSelect,
    handleCreateAsset,
    handleEditAsset,
    handleDeleteAsset,
    handleAssetEditorSubmit,
    handleOpenAssetsFullscreen,
    handleOpenAssetGraph,
  }
}
