<template>
  <div class="asset-list-panel">
    <label class="asset-list-panel__search">
      <QyIcon name="Search" :size="14" />
      <input
        :value="searchKeyword"
        type="search"
        placeholder="搜索设定"
        @input="$emit('update:search-keyword', ($event.target as HTMLInputElement).value)"
      />
    </label>

    <div class="asset-list-panel__tree">
      <section
        v-for="category in categoryOptions"
        :key="category.id"
        class="asset-list-panel__group"
        :class="{ 'is-active': activeCategory === category.id }"
      >
        <button
          type="button"
          class="asset-list-panel__folder"
          :class="{ 'is-active': activeCategory === category.id }"
          @click="$emit('select-category', category.id)"
        >
          <span class="asset-list-panel__folder-name">{{ category.label }}</span>
          <span class="asset-list-panel__folder-count">{{ category.count }}</span>
        </button>

        <div v-if="activeCategory === category.id" class="asset-list-panel__group-body">
          <div v-if="loading" class="asset-list-panel__empty">正在加载设定…</div>
          <div v-else-if="assets.length === 0" class="asset-list-panel__empty">{{ emptyMessage }}</div>
          <div v-else class="asset-list-panel__items">
            <button
              v-for="asset in assets"
              :key="asset.id"
              type="button"
              class="asset-list-panel__item"
              :class="{ 'is-active': selectedAssetId === asset.id }"
              @click="$emit('select-asset', asset.id)"
            >
              <div class="asset-list-panel__item-main">
                <strong class="asset-list-panel__item-name">{{ asset.name }}</strong>
                <span class="asset-list-panel__item-type">{{ asset.typeLabel }}</span>
              </div>
              <span v-if="asset.badge" class="asset-list-panel__item-badge">{{ asset.badge }}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
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
}>()
</script>

<style scoped lang="scss">
.asset-list-panel {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 10px 0 0;
  background: #fff;
}

.asset-list-panel__search {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 30px;
  margin: 0 10px 10px;
  padding: 0 10px;
  border: 1px solid #d9dee6;
  border-radius: 4px;
  background: #f8fafc;
  color: #6b7280;

  input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    color: #111827;
    font-size: 13px;
  }
}

.asset-list-panel__tree {
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: 0 6px 10px;
}

.asset-list-panel__group + .asset-list-panel__group {
  margin-top: 2px;
}

.asset-list-panel__folder {
  width: 100%;
  min-width: 0;
  min-height: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 0 8px;
  border: none;
  background: transparent;
  color: #374151;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;

  &:hover,
  &.is-active {
    color: #111827;
    background: #f5f7fb;
  }
}

.asset-list-panel__folder-count {
  color: #9ca3af;
  font-size: 11px;
  font-weight: 500;
}

.asset-list-panel__group-body {
  padding: 4px 0 6px 10px;
  border-left: 1px solid #eceff3;
  margin-left: 10px;
}

.asset-list-panel__empty {
  padding: 10px 8px;
  color: #6b7280;
  font-size: 12px;
}

.asset-list-panel__items {
  display: flex;
  flex-direction: column;
}

.asset-list-panel__item {
  min-height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 0 8px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #111827;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: #f5f7fb;
  }

  &.is-active {
    background: #eaf2ff;
    color: #1d4ed8;
  }
}

.asset-list-panel__item-main {
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.asset-list-panel__item-name {
  min-width: 0;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.asset-list-panel__item-type,
.asset-list-panel__item-badge {
  color: #9ca3af;
  font-size: 11px;
  white-space: nowrap;
}
</style>
