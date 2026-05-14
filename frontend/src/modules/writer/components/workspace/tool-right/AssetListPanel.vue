<template>
  <div class="asset-list-panel">
    <div class="asset-list-panel__toolbar">
      <label class="asset-list-panel__search">
        <QyIcon name="Search" :size="14" />
        <input
          id="writer-asset-search"
          name="writer-asset-search"
          :value="searchKeyword"
          type="search"
          placeholder="搜索设定"
          @input="$emit('update:search-keyword', ($event.target as HTMLInputElement).value)"
        />
      </label>
      <button
        type="button"
        class="asset-list-panel__create-btn"
        title="快速新建"
        @click="$emit('create-asset')"
      >
        新建
      </button>
    </div>

    <AssetListTree
      :loading="loading"
      :active-category="activeCategory"
      :category-options="categoryOptions"
      :empty-message="emptyMessage"
      :assets="assets"
      :selected-asset-id="selectedAssetId"
      @select-category="$emit('select-category', $event)"
      @select-asset="$emit('select-asset', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import AssetListTree from '@/modules/writer/components/workspace/tool-right/AssetListTree.vue'
import type { EncyclopediaCategory } from '@/modules/writer/composables/types'
import type {
  WriterAssetCategoryOption,
  WriterAssetListItem,
} from '@/modules/writer/composables/useWriterAssetCatalog'

defineProps<{
  loading: boolean
  searchKeyword: string
  activeCategory: EncyclopediaCategory
  categoryOptions: WriterAssetCategoryOption[]
  emptyMessage: string
  assets: WriterAssetListItem[]
  selectedAssetId?: string
}>()

defineEmits<{
  (e: 'update:search-keyword', value: string): void
  (e: 'select-category', category: EncyclopediaCategory): void
  (e: 'select-asset', assetId: string): void
  (e: 'create-asset'): void
}>()
</script>

<style scoped lang="scss">
.asset-list-panel {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 10px 0 0;
  background: var(--editor-layer-panel, var(--editor-bg-base, #fff));
}

.asset-list-panel__toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 10px 10px;
}

.asset-list-panel__search {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 30px;
  flex: 1;
  padding: 0 10px;
  border: 1px solid var(--editor-border, #d9dee6);
  border-radius: 4px;
  background: var(--editor-bg-surface, #f8fafc);
  color: var(--editor-text-muted, #6b7280);

  input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    color: var(--editor-text-primary, #111827);
    font-size: 13px;
  }
}

.asset-list-panel__create-btn {
  height: 30px;
  padding: 0 10px;
  border: 1px solid var(--editor-border, #d9dee6);
  border-radius: 4px;
  background: var(--editor-layer-panel, var(--editor-bg-base, #fff));
  color: var(--editor-text-secondary, #374151);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: var(--editor-bg-surface, #f8fafc);
    color: var(--editor-text-primary, #111827);
  }
}

</style>
