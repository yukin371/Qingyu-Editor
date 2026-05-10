<template>
  <div class="graph-toolbar">
    <div class="view-mode-tabs" data-testid="view-mode-tabs">
      <button
        class="view-mode-tab"
        :class="{ 'is-active': viewMode === 'graph' }"
        @click="$emit('update:viewMode', 'graph')"
      >
        <QyIcon name="Connection" :size="16" />
        图谱
      </button>
      <button
        class="view-mode-tab"
        :class="{ 'is-active': viewMode === 'storyline' }"
        @click="$emit('update:viewMode', 'storyline')"
      >
        <QyIcon name="Document" :size="16" />
        故事线
      </button>
    </div>

    <div v-if="showEntityScopeTabs" class="entity-scope-tabs" data-testid="entity-scope-tabs">
      <button
        class="entity-scope-tab"
        :class="{ 'is-active': entityScopeTab === 'all' }"
        @click="$emit('update:entityScopeTab', 'all')"
      >
        全部
      </button>
      <button
        class="entity-scope-tab"
        :class="{ 'is-active': entityScopeTab === 'volume' }"
        @click="$emit('update:entityScopeTab', 'volume')"
      >
        卷级
      </button>
      <button
        class="entity-scope-tab"
        :class="{ 'is-active': entityScopeTab === 'chapter' }"
        @click="$emit('update:entityScopeTab', 'chapter')"
      >
        章节级
      </button>
    </div>

    <div v-if="showLegend" class="entity-legend">
      <span class="entity-legend-item">
        <span class="legend-dot is-appeared"></span>
        已登场
      </span>
      <span class="entity-legend-item">
        <span class="legend-dot is-unappeared"></span>
        未登场
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QyIcon } from '@/design-system/components'

defineProps<{
  viewMode: 'graph' | 'storyline'
  entityScopeTab: 'all' | 'volume' | 'chapter'
  showEntityScopeTabs: boolean
  showLegend: boolean
}>()

defineEmits<{
  (e: 'update:viewMode', value: 'graph' | 'storyline'): void
  (e: 'update:entityScopeTab', value: 'all' | 'volume' | 'chapter'): void
}>()
</script>

<style scoped lang="scss">
.graph-toolbar {
  display: flex;
  flex-direction: column;
}

.view-mode-tabs {
  display: flex;
  gap: 2px;
  padding: 6px;
  background: var(--editor-bg-surface, #f3f4f6);
  border-radius: 8px;
  margin: 8px 8px 0 8px;
  align-self: flex-start;
}

.view-mode-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--editor-text-secondary, #4b5563);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.view-mode-tab:hover {
  color: var(--editor-accent, #2563eb);
  background: rgba(64, 158, 255, 0.08);
}

.view-mode-tab.is-active {
  background: var(--editor-bg-base, #ffffff);
  color: var(--editor-accent, #2563eb);
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.entity-scope-tabs {
  display: flex;
  gap: 2px;
  padding: 4px;
  background: var(--editor-bg-surface, #f3f4f6);
  border-radius: 6px;
  margin: 8px 8px 0 8px;
  align-self: flex-start;
}

.entity-scope-tab {
  padding: 4px 12px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--editor-text-secondary, #4b5563);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: var(--editor-accent, #2563eb);
    background: rgba(64, 158, 255, 0.06);
  }

  &.is-active {
    background: var(--editor-bg-base, #ffffff);
    color: var(--editor-accent, #2563eb);
    font-weight: 500;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  }
}

.entity-legend {
  display: flex;
  gap: 14px;
  margin: 6px 8px 0 8px;
  align-self: flex-start;
}

.entity-legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--editor-text-muted, #6b7280);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;

  &.is-appeared {
    background: #5b8cff;
  }

  &.is-unappeared {
    background: #c4c8d4;
    border: 1px dashed #a0a4b0;
  }
}
</style>
