<template>
  <div class="asset-list-tree">
    <section
      v-for="category in categoryOptions"
      :key="category.id"
      class="asset-list-tree__group"
      :class="{ 'is-active': activeCategory === category.id }"
    >
      <button
        type="button"
        class="asset-list-tree__folder"
        :class="{ 'is-active': activeCategory === category.id }"
        @click="$emit('select-category', category.id)"
      >
        <span class="asset-list-tree__folder-name">{{ category.label }}</span>
        <span class="asset-list-tree__folder-count">{{ category.count }}</span>
      </button>

      <div v-if="activeCategory === category.id" class="asset-list-tree__group-body">
        <div v-if="loading" class="asset-list-tree__empty">正在加载设定…</div>
        <div v-else-if="assets.length === 0" class="asset-list-tree__empty">{{ emptyMessage }}</div>
        <div v-else class="asset-list-tree__items">
          <button
            v-for="asset in assets"
            :key="asset.id"
            type="button"
            class="asset-list-tree__item"
            :class="{
              'is-active': selectedAssetId === asset.id,
              'is-unresolved': asset.unresolved,
            }"
            @click="$emit('select-asset', asset.id)"
          >
            <div class="asset-list-tree__item-main">
              <strong class="asset-list-tree__item-name">{{ asset.name }}</strong>
              <span class="asset-list-tree__item-type">{{ asset.typeLabel }}</span>
            </div>
            <span v-if="asset.unresolved" class="asset-list-tree__item-badge is-warning">待确认</span>
            <span v-else-if="asset.referenceSource" class="asset-list-tree__item-badge">
              {{ asset.referenceSource }}
            </span>
            <span v-else-if="asset.badge" class="asset-list-tree__item-badge">{{ asset.badge }}</span>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { EncyclopediaCategory } from '@/modules/writer/composables/types'
import type {
  WriterAssetCategoryOption,
  WriterAssetListItem,
} from '@/modules/writer/composables/useWriterAssetCatalog'

defineProps<{
  loading: boolean
  activeCategory: EncyclopediaCategory
  categoryOptions: WriterAssetCategoryOption[]
  emptyMessage: string
  assets: WriterAssetListItem[]
  selectedAssetId?: string
}>()

defineEmits<{
  (e: 'select-category', category: EncyclopediaCategory): void
  (e: 'select-asset', assetId: string): void
}>()
</script>

<style scoped lang="scss">
.asset-list-tree {
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: 0 6px 10px;
}

.asset-list-tree__group + .asset-list-tree__group {
  margin-top: 2px;
}

.asset-list-tree__folder {
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
  color: var(--editor-text-secondary, #374151);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;

  &:hover,
  &.is-active {
    color: var(--editor-text-primary, #111827);
    background: var(--editor-bg-elevated, #f5f7fb);
  }
}

.asset-list-tree__folder-count {
  color: var(--editor-text-ghost, #9ca3af);
  font-size: 11px;
  font-weight: 500;
}

.asset-list-tree__group-body {
  padding: 4px 0 6px 10px;
  border-left: 1px solid var(--editor-border, #eceff3);
  margin-left: 10px;
}

.asset-list-tree__empty {
  padding: 10px 8px;
  color: var(--editor-text-muted, #6b7280);
  font-size: 12px;
}

.asset-list-tree__items {
  display: flex;
  flex-direction: column;
}

.asset-list-tree__item {
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
  color: var(--editor-text-primary, #111827);
  text-align: left;
  cursor: pointer;

  &:hover {
    background: var(--editor-bg-elevated, #f5f7fb);
  }

  &.is-active {
    background: var(--editor-accent-soft, #eaf2ff);
    color: var(--editor-accent, #1d4ed8);
  }
}

.asset-list-tree__item-main {
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.asset-list-tree__item-name {
  min-width: 0;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.asset-list-tree__item-type,
.asset-list-tree__item-badge {
  color: var(--editor-text-ghost, #9ca3af);
  font-size: 11px;
  white-space: nowrap;
}

.asset-list-tree__item.is-unresolved {
  color: var(--editor-text-secondary, #374151);
}

.asset-list-tree__item-badge.is-warning {
  color: var(--color-warning-700, #a16207);
}
</style>
