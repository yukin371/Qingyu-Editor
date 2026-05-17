<template>
  <div class="workspace-panel-body">
    <div class="workspace-panel-list">
      <div class="workspace-panel-row">
        <span class="workspace-panel-card__label">项目</span>
        <strong>{{ projectDisplayName || '未命名项目' }}</strong>
      </div>
      <div class="workspace-panel-row">
        <span class="workspace-panel-card__label">章节</span>
        <strong>{{ chapterTitle || '未选择章节' }}</strong>
      </div>
      <div class="workspace-panel-row">
        <span class="workspace-panel-card__label">场景</span>
        <strong>{{ scopeLabel || '未定位场景' }}</strong>
      </div>
      <div class="workspace-panel-row">
        <span class="workspace-panel-card__label">活跃实体</span>
        <strong>{{ activeEntityCount }}</strong>
      </div>
    </div>
    <div v-if="activeEntityPreview.length" class="workspace-panel-entity-list">
      <span v-for="entity in activeEntityPreview" :key="entity.key" class="workspace-panel-entity-chip">
        <span class="workspace-panel-entity-type">{{ entity.typeLabel }}</span>
        <strong>{{ entity.name }}</strong>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ActiveEntitySummary } from '@/modules/writer/composables/useWorkflowContext'

const props = withDefaults(
  defineProps<{
    projectDisplayName?: string
    chapterTitle?: string
    scopeLabel?: string
    activeEntities?: ActiveEntitySummary[]
  }>(),
  {
    projectDisplayName: '',
    chapterTitle: '',
    scopeLabel: '',
    activeEntities: () => [],
  },
)

const ACTIVE_ENTITY_TYPE_LABELS: Record<string, string> = {
  character: '角色',
  item: '物品',
  location: '地点',
  concept: '概念',
  organization: '组织',
  foreshadowing: '伏笔',
}

const activeEntityPreview = computed(() =>
  props.activeEntities.slice(0, 8).map((entity) => ({
    ...entity,
    key: `${entity.type}:${entity.id || entity.name}`,
    typeLabel: ACTIVE_ENTITY_TYPE_LABELS[entity.type] || entity.type,
  })),
)
const activeEntityCount = computed(() => props.activeEntities.length)
</script>

<style scoped lang="scss">
.workspace-panel-body {
  display: grid;
  gap: 12px;
  min-height: 0;
}

.workspace-panel-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0;
  border-top: 1px solid var(--editor-border, #e2e8f0);
  border-left: 1px solid var(--editor-border, #e2e8f0);
}

.workspace-panel-row {
  min-width: 0;
  display: grid;
  gap: 4px;
  padding: 9px 12px;
  border-right: 1px solid var(--editor-border, #e2e8f0);
  border-bottom: 1px solid var(--editor-border, #e2e8f0);
}

.workspace-panel-card__label {
  font-size: 11px;
  color: var(--editor-text-ghost, #94a3b8);
}

.workspace-panel-card strong {
  font-size: 13px;
  color: var(--editor-text-primary, #0f172a);
}

.workspace-panel-entity-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.workspace-panel-entity-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--editor-layer-soft, rgba(248, 251, 255, 0.95)) 95%, transparent);
  border: 1px solid color-mix(in srgb, var(--editor-border, rgba(148, 163, 184, 0.14)) 42%, transparent);
  font-size: 12px;
  color: var(--editor-text-secondary, #334155);
}

.workspace-panel-entity-type {
  color: var(--editor-accent, #06b6d4);
  font-weight: 700;
}

@media (max-width: 1024px) {
  .workspace-panel-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
