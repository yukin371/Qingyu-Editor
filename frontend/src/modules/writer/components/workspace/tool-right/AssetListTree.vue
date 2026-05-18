<template>
  <div class="asset-list-tree">
    <section
      v-for="category in categoryOptions"
      :key="category.id"
      class="asset-list-tree__group"
      :class="{ 'is-active': activeCategory === category.id }"
    >
      <div
        class="asset-list-tree__folder"
        :class="{ 'is-active': activeCategory === category.id }"
      >
        <button
          type="button"
          class="asset-list-tree__folder-main"
          @click="$emit('select-category', category.id)"
        >
          <span class="asset-list-tree__folder-name">{{ category.label }}</span>
          <span class="asset-list-tree__folder-count">{{ category.count }}</span>
        </button>
        <button
          v-if="allowCategoryCreate"
          type="button"
          class="asset-list-tree__folder-create"
          :title="`新建${category.label}`"
          :aria-label="`新建${category.label}`"
          @click.stop="$emit('create-category-asset', category.id)"
        >
          +
        </button>
      </div>

      <div v-if="activeCategory === category.id" class="asset-list-tree__group-body">
        <div v-if="loading" class="asset-list-tree__empty">正在加载设定…</div>
        <div v-else-if="assets.length === 0" class="asset-list-tree__empty">
          <span>{{ emptyMessage }}</span>
          <button
            v-if="allowCategoryCreate"
            type="button"
            @click.stop="$emit('create-category-asset', category.id)"
          >
            新建{{ category.label }}
          </button>
        </div>
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
  allowCategoryCreate?: boolean
}>()

defineEmits<{
  (e: 'select-category', category: EncyclopediaCategory): void
  (e: 'select-asset', assetId: string): void
  (e: 'create-category-asset', category: EncyclopediaCategory): void
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
  gap: 6px;
  border: none;
  background: transparent;
  color: var(--editor-text-secondary, #374151);
  font-size: 12px;
  font-weight: 600;
  text-align: left;

  &:hover,
  &.is-active {
    color: var(--editor-text-primary, #111827);
    background: var(--editor-bg-elevated, #f5f7fb);
  }
}

.asset-list-tree__folder-main {
  min-width: 0;
  flex: 1;
  min-height: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 0 8px;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.asset-list-tree__folder-create {
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
  border: 1px solid transparent;
  border-radius: 5px;
  background: transparent;
  color: var(--editor-text-muted, #6b7280);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;

  &:hover {
    border-color: var(--editor-border, #d9dee6);
    background: var(--editor-accent-soft, #eaf2ff);
    color: var(--editor-accent, #1d4ed8);
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
  margin: 4px 0;
  padding: 10px 8px;
  border: 1px dashed var(--editor-border, #eceff3);
  border-radius: 8px;
  background: color-mix(in srgb, var(--editor-layer-soft, #f8fafc) 72%, transparent);
  color: var(--editor-text-muted, #6b7280);
  font-size: 12px;
  display: grid;
  gap: 8px;
}

.asset-list-tree__empty button {
  width: fit-content;
  min-height: 26px;
  padding: 0 8px;
  border: 1px solid color-mix(in srgb, var(--editor-accent, #1d4ed8) 24%, transparent);
  border-radius: 6px;
  background: color-mix(in srgb, var(--editor-accent-soft, #eaf2ff) 66%, transparent);
  color: var(--editor-accent, #1d4ed8);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
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
