<template>
  <header class="asset-detail-header">
    <div class="asset-detail-header__title-wrap">
      <h3>{{ asset.name }}</h3>
      <span class="asset-detail-header__type-chip">{{ asset.typeLabel }}</span>
    </div>
    <div class="asset-detail-header__actions">
      <button type="button" class="asset-detail-header__ghost" title="快速编辑" @click="$emit('edit')">
        <QyIcon name="Edit" :size="14" />
      </button>
      <button
        type="button"
        class="asset-detail-header__ghost"
        title="关系图谱"
        @click="$emit('open-graph')"
      >
        <QyIcon name="Share" :size="14" />
      </button>
      <button
        v-if="asset.latestChapterId"
        type="button"
        class="asset-detail-header__ghost"
        title="前往章节"
        @click="$emit('jump-to-chapter', asset.latestChapterId)"
      >
        <QyIcon name="Position" :size="14" />
      </button>
      <button
        type="button"
        class="asset-detail-header__ghost"
        title="展开全屏"
        @click="$emit('open-fullscreen')"
      >
        <QyIcon name="FullScreen" :size="14" />
      </button>
      <button
        type="button"
        class="asset-detail-header__ghost is-danger"
        title="删除资产"
        @click="$emit('delete')"
      >
        <QyIcon name="Delete" :size="14" />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import type { WriterAssetListItem } from '@/modules/writer/composables/useWriterAssetCatalog'

defineProps<{
  asset: WriterAssetListItem
}>()

defineEmits<{
  (e: 'edit'): void
  (e: 'delete'): void
  (e: 'open-graph'): void
  (e: 'jump-to-chapter', chapterId: string): void
  (e: 'open-fullscreen'): void
}>()
</script>

<style scoped lang="scss">
.asset-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--editor-border, #eceff3);

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--editor-text-primary, #111827);
  }
}

.asset-detail-header__title-wrap {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.asset-detail-header__type-chip {
  color: var(--editor-text-ghost, #9ca3af);
  font-size: 11px;
  white-space: nowrap;
}

.asset-detail-header__actions {
  display: inline-flex;
  gap: 6px;
}

.asset-detail-header__ghost {
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  color: var(--editor-text-muted, #6b7280);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: var(--editor-bg-elevated, #f3f4f6);
    color: var(--editor-text-primary, #111827);
  }
}

.asset-detail-header__ghost.is-danger:hover {
  background: var(--color-danger-50, #fef2f2);
  color: var(--color-danger-700, #b91c1c);
}
</style>
