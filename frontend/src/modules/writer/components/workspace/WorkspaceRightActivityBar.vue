<template>
  <nav class="workspace-activity-bar" aria-label="右侧工具栏">
    <div
      v-for="group in toolGroups"
      :key="group.id"
      class="workspace-activity-bar__group"
      :class="`workspace-activity-bar__group--${group.id}`"
    >
      <button
        v-for="toolId in group.tools"
        :key="toolId"
        class="workspace-activity-bar__item"
        :class="{ active: activeTool === toolId && visible && !collapsed }"
        :title="getToolLabel(toolId)"
        :aria-label="getToolLabel(toolId)"
        type="button"
        @click="$emit('select-tool', toolId)"
      >
        <span class="workspace-activity-bar__glyph">
          <QyIcon :name="RIGHT_TOOL_CONFIG[toolId].icon" :size="16" />
        </span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import { RIGHT_TOOL_CONFIG, RIGHT_TOOL_GROUPS } from '@/modules/writer/config/workspacePanels'
import type { RightToolType } from '@/modules/writer/types/workspaceLayout'

defineProps<{
  collapsed: boolean
  visible: boolean
  activeTool: RightToolType
}>()

defineEmits<{
  (e: 'select-tool', toolId: RightToolType): void
}>()

const toolGroups = RIGHT_TOOL_GROUPS

function getToolLabel(toolId: RightToolType) {
  return RIGHT_TOOL_CONFIG[toolId].label
}
</script>

<style scoped lang="scss">
.workspace-activity-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 8px 0;
  width: 36px;
  min-width: 36px;
  background: var(--editor-layer-panel, #fff);
  border-left: 1px solid var(--editor-border, #e2e8f0);
  gap: 8px;

  &__group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  &__item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 27px;
    height: 27px;
    padding: 0;
    border-radius: 8px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--editor-actbar-icon, #475569);
    cursor: pointer;
    transition:
      background 160ms ease-out,
      color 160ms ease-out,
      border-color 160ms ease-out;

    &:hover {
      background: var(--editor-layer-soft, #f8fafc);
      color: var(--editor-text-primary, #0f172a);
      border-color: color-mix(in srgb, var(--editor-border, #cbd5e1) 72%, transparent);
    }

    &.active {
      background: color-mix(in srgb, var(--editor-accent, #0ea5e9) 7%, var(--editor-layer-panel, #fff));
      color: var(--editor-accent, #0284c7);
      border-color: color-mix(in srgb, var(--editor-accent, #0ea5e9) 14%, transparent);

      &::before {
        content: '';
        position: absolute;
        left: -4px;
        top: 6px;
        bottom: 6px;
        width: 1px;
        border-radius: 999px;
        background: currentColor;
      }
    }
  }

  &__glyph {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
