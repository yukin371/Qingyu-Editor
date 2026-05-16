import { computed, ref, type ComputedRef } from 'vue'
import { useToolRightAssetActions } from '@/modules/writer/composables/useToolRightAssetActions'
import { useWriterAssetCatalog } from '@/modules/writer/composables/useWriterAssetCatalog'
import type { EncyclopediaCategory, SidebarChapterSummary } from '@/modules/writer/composables/types'

interface UseToolRightAssetsOptions {
  projectId: ComputedRef<string>
  chapters: ComputedRef<SidebarChapterSummary[]>
}

export const useToolRightAssets = ({ projectId, chapters }: UseToolRightAssetsOptions) => {
  const searchKeyword = ref('')
  const assetCategory = ref<EncyclopediaCategory>('characters')

  const catalog = useWriterAssetCatalog({
    projectId,
    chapters,
    activeCategory: assetCategory,
    searchKeyword,
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
  })

  const handleAssetCategoryChange = (category: EncyclopediaCategory) => {
    assetCategory.value = category
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
    handleAssetCategoryChange,
    handleAssetSearchKeywordChange,
    assetListPanelProps,
    assetDetailPanelProps,
    ...catalog,
    ...actions,
  }
}
