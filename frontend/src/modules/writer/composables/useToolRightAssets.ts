import { computed, ref, type ComputedRef } from 'vue'
import { useToolRightAssetActions } from '@/modules/writer/composables/useToolRightAssetActions'
import {
  useWriterAssetCatalog,
  type WriterAssetScopeView,
} from '@/modules/writer/composables/useWriterAssetCatalog'
import type { EncyclopediaCategory, SidebarChapterSummary } from '@/modules/writer/composables/types'

interface UseToolRightAssetsOptions {
  projectId: ComputedRef<string>
  chapterId: ComputedRef<string>
  chapters: ComputedRef<SidebarChapterSummary[]>
}

export const useToolRightAssets = ({ projectId, chapterId, chapters }: UseToolRightAssetsOptions) => {
  const searchKeyword = ref('')
  const assetCategory = ref<EncyclopediaCategory>('characters')
  const assetScopeView = ref<WriterAssetScopeView>('global')
  const currentVolumeId = computed(
    () => chapters.value.find((chapter) => chapter.id === chapterId.value)?.parentId,
  )

  const catalog = useWriterAssetCatalog({
    projectId,
    chapters,
    activeCategory: assetCategory,
    searchKeyword,
    scopeView: assetScopeView,
    chapterId,
    volumeId: currentVolumeId,
  })

  const actions = useToolRightAssetActions({
    assetCategory,
    filteredAssets: catalog.filteredAssets,
    selectedAsset: catalog.selectedAsset,
    selectAsset: catalog.selectAsset,
    createAsset: catalog.createAsset,
    updateAsset: catalog.updateAsset,
    deleteAsset: catalog.deleteAsset,
    buildGraphFocusTarget: catalog.buildGraphFocusTarget,
    assetScopeView,
  })

  const handleAssetCategoryChange = (category: EncyclopediaCategory) => {
    assetCategory.value = category
  }

  const handleAssetScopeViewChange = (scopeView: WriterAssetScopeView) => {
    assetScopeView.value = scopeView
    catalog.selectAsset(null)
  }

  const handleAssetSearchKeywordChange = (value: string) => {
    searchKeyword.value = value
  }

  const assetListPanelProps = computed(() => ({
    loading: catalog.loading.value,
    searchKeyword: searchKeyword.value,
    activeCategory: assetCategory.value,
    categoryOptions: catalog.categoryOptions.value,
    emptyMessage: catalog.emptyMessage.value,
    assets: catalog.filteredAssets.value,
    selectedAssetId: catalog.selectedAsset.value?.id,
    scopeView: assetScopeView.value,
  }))

  const assetDetailPanelProps = computed(() => ({
    asset: catalog.selectedAsset.value,
    detailFields: catalog.selectedDetailFields.value,
    stateFields: catalog.selectedStateFields.value,
    dataHint: catalog.selectedDataHint.value,
  }))

  return {
    searchKeyword,
    assetCategory,
    assetScopeView,
    handleAssetCategoryChange,
    handleAssetScopeViewChange,
    handleAssetSearchKeywordChange,
    assetListPanelProps,
    assetDetailPanelProps,
    ...catalog,
    ...actions,
  }
}
