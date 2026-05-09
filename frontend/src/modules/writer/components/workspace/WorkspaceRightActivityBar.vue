<template>
  <nav class="workspace-activity-bar" aria-label="右侧工具栏">
    <button
      v-for="toolId in toolOrder"
      :key="toolId"
      class="workspace-activity-bar__item"
      :class="{ active: activeTool === toolId && visible && !collapsed }"
      :title="getToolLabel(toolId)"
      type="button"
      @click="$emit('select-tool', toolId)"
    >
      <span class="workspace-activity-bar__glyph">
        <QyIcon :name="RIGHT_TOOL_CONFIG[toolId].icon" :size="18" />
      </span>
      <span class="workspace-activity-bar__label">{{ getToolLabel(toolId) }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import { RIGHT_TOOL_CONFIG, RIGHT_TOOL_ORDER } from '@/modules/writer/config/workspacePanels'
import type { RightToolType } from '@/modules/writer/types/workspaceLayout'

defineProps<{
  collapsed: boolean
  visible: boolean
  activeTool: RightToolType
}>()

defineEmits<{
  (e: 'select-tool', toolId: RightToolType): void
}>()

const toolOrder = RIGHT_TOOL_ORDER

function getToolLabel(toolId: RightToolType) {
  return RIGHT_TOOL_CONFIG[toolId].label
}
</script>

<style scoped lang="scss">
.workspace-activity-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0 12px;
  width: 56px;
  min-width: 56px;
  background: linear-gradient(180deg, rgba(250, 252, 255, 0.98), rgba(244, 247, 251, 0.98));
  border-left: 1px solid var(--editor-border, #e2e8f0);
  gap: 6px;
  box-shadow: inset 1px 0 0 rgba(255, 255, 255, 0.85);

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    width: 44px;
    min-height: 48px;
    padding: 6px 0;
    border-radius: 12px;
    border: 1px solid transparent;
    background: rgba(255, 255, 255, 0.56);
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
        linear-gradient(180deg, rgba(37, 99, 235, 0.12), rgba(59, 130, 246, 0.08)),
        rgba(255, 255, 255, 0.98);
      color: #0284c7;
      border-color: rgba(59, 130, 246, 0.18);
      box-shadow: 0 8px 18px rgba(59, 130, 246, 0.14);
    }
  }

  &__glyph {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &__label {
    font-size: 10px;
    line-height: 1;
    font-weight: 600;
    letter-spacing: 0.02em;
  }
}
</style>
