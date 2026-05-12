<template>
  <nav class="tool-sidebar">
    <div
      v-for="group in toolGroups"
      :key="group.id"
      class="tool-group"
      :class="`tool-group--${group.id}`"
    >
      <div class="tool-group__label">{{ group.label }}</div>
      <div class="tool-list">
        <button
          v-for="tool in group.tools"
          :key="tool.id"
          class="tool-item"
          :class="{ 'is-active': activeTool === tool.id, 'is-primary': group.id === 'primary' }"
          :title="tool.name"
          @click="handleToolClick(tool.id)"
        >
          <span class="tool-icon">
            <QyIcon :name="tool.icon" :size="22" />
          </span>
          <span class="tool-name">{{ tool.name }}</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import { OVERLAY_TOOL_GROUPS } from '@/modules/writer/config/workspacePanels'
import type { ToolType } from '@/modules/writer/composables/useToolOverlay'

interface Props {
  activeTool: ToolType
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'toolChange', toolId: ToolType): void
}>()

const toolGroups = OVERLAY_TOOL_GROUPS

function handleToolClick(toolId: ToolType) {
  emit('toolChange', toolId)
}
</script>

<style scoped lang="scss">
.tool-sidebar {
  width: 64px;
  background: var(--editor-bg-surface);
  border-right: 1px solid var(--editor-border);
  display: flex;
  flex-direction: column;
  padding: 12px 0;
  flex-shrink: 0;
  gap: 10px;

  .tool-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .tool-group__label {
    padding: 0 12px;
    color: var(--editor-text-muted);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-align: center;
  }

  .tool-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 0 8px;
  }

  .tool-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 10px 6px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--editor-text-muted);
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;

    .tool-icon {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .tool-name {
      font-size: 10px;
      font-weight: 500;
      text-align: center;
      line-height: 1.2;
    }

    &:hover {
      background: var(--editor-bg-elevated);
      color: var(--editor-text-primary);

      .tool-icon {
        background: var(--editor-bg-elevated);
      }
    }

    &.is-active {
      background: var(--editor-accent-soft);
      color: var(--editor-accent);

      .tool-icon {
        background: var(--editor-accent-soft);
      }
    }

    &.is-primary:not(.is-active) {
      color: var(--editor-text-secondary);

      .tool-icon {
        background: rgba(236, 254, 255, 0.48);
      }
    }
  }
}
</style>
