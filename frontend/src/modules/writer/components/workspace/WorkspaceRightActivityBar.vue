<template>
  <nav class="workspace-activity-bar" aria-label="右侧工具栏">
    <button
      v-for="panelId in panelIds"
      :key="panelId"
      class="workspace-activity-bar__item"
      :class="{ active: activePanelId === panelId && !collapsed }"
      :title="getPanelTitle(panelId)"
      type="button"
      @click="handlePanelClick(panelId)"
    >
      <span class="workspace-activity-bar__glyph">
        <QyIcon :name="getPanelIcon(panelId)" :size="panelId === 'harness' ? 16 : 18" />
        <span
          v-if="panelId === 'harness'"
          class="workspace-activity-bar__mini-label"
        >
          H
        </span>
      </span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import type { WorkspacePanelId } from '@/modules/writer/types/workspaceLayout'
import { workspacePanelRegistryById } from '@/modules/writer/config/workspacePanels'

const props = defineProps<{
  collapsed: boolean
  activePanelId: WorkspacePanelId | null
  panelIds: WorkspacePanelId[]
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'select-panel', panelId: WorkspacePanelId): void
}>()

const PANEL_ICON_MAP: Record<WorkspacePanelId, string> = {
  chapters: 'Document',
  outline: 'Memo',
  ai: 'MagicStick',
  harness: 'DataAnalysis',
  status: 'Tickets',
  context: 'CollectionTag',
  assets: 'Collection',
  relations: 'Share',
  timeline: 'Clock',
  branches: 'Connection',
}

function handlePanelClick(panelId: WorkspacePanelId) {
  emit('select-panel', panelId)
  if (props.collapsed) {
    emit('toggle')
  }
}

function getPanelTitle(panelId: WorkspacePanelId) {
  return workspacePanelRegistryById[panelId]?.title || panelId
}

function getPanelIcon(panelId: WorkspacePanelId) {
  return PANEL_ICON_MAP[panelId] || 'Grid'
}
</script>

<style scoped lang="scss">
.workspace-activity-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
  width: 48px;
  min-width: 48px;
  background: linear-gradient(180deg, rgba(240, 249, 255, 0.98), rgba(224, 242, 254, 0.95));
  border-left: 1px solid var(--editor-border, #e2e8f0);
  gap: 6px;
  box-shadow: inset 1px 0 0 rgba(255, 255, 255, 0.85);

  &__item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 12px;
    border: 1px solid transparent;
    background: rgba(255, 255, 255, 0.42);
    color: var(--editor-actbar-icon, #475569);
    cursor: pointer;
    transition:
      background 160ms ease-out,
      color 160ms ease-out,
      transform 160ms ease-out,
      border-color 160ms ease-out,
      box-shadow 160ms ease-out;

    &:hover {
      background: rgba(255, 255, 255, 0.92);
      color: var(--editor-text-primary, #0f172a);
      border-color: rgba(148, 163, 184, 0.24);
    }

    &.active {
      transform: translateX(-1px);
      background:
        linear-gradient(180deg, rgba(14, 165, 233, 0.16), rgba(34, 211, 238, 0.12)),
        rgba(255, 255, 255, 0.96);
      color: #0284c7;
      border-color: rgba(14, 165, 233, 0.18);
      box-shadow: 0 8px 18px rgba(14, 165, 233, 0.18);
    }
  }
  &__glyph {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &__mini-label {
    position: absolute;
    right: -6px;
    bottom: -5px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 13px;
    height: 13px;
    padding: 0 3px;
    border-radius: 999px;
    background: linear-gradient(180deg, rgba(251, 191, 36, 0.98), rgba(245, 158, 11, 0.96));
    color: #fff7ed;
    font-size: 8px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: 0.02em;
    box-shadow:
      0 4px 10px rgba(180, 83, 9, 0.24),
      0 0 0 1.5px rgba(255, 255, 255, 0.92);
  }
}
</style>
