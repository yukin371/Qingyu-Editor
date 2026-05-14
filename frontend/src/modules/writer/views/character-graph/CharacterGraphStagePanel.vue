<template>
  <div class="graph-stage-panel">
    <div
      v-if="title"
      class="graph-stage-panel__header"
      :class="{ 'is-global': tone === 'global' }"
      :data-testid="headerTestId"
    >
      <span class="graph-stage-panel__title">{{ title }}</span>
      <QyTag v-if="tagText" size="sm" :type="tagType" class="graph-stage-panel__tag">
        {{ tagText }}
      </QyTag>
    </div>
    <div
      v-if="bannerText"
      class="graph-stage-panel__banner"
      data-testid="graph-focus-banner"
      :class="{ 'is-missing': bannerMissing }"
    >
      <span>{{ bannerText }}</span>
    </div>
    <div class="graph-stage-panel__body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { QyTag } from '@/design-system/components'

withDefaults(
  defineProps<{
    title?: string
    tagText?: string
    tagType?: 'info' | 'success' | 'warning' | 'danger'
    tone?: 'default' | 'global'
    bannerText?: string
    bannerMissing?: boolean
    headerTestId?: string
  }>(),
  {
    title: '',
    tagText: '',
    tagType: 'info',
    tone: 'default',
    bannerText: '',
    bannerMissing: false,
    headerTestId: undefined,
  },
)
</script>

<style scoped lang="scss">
.graph-stage-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.graph-stage-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: var(--editor-bg-surface, #f3f4f6);
  border-bottom: 1px solid var(--editor-border, #d1d5db);

  &.is-global {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
}

.graph-stage-panel__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--editor-text-primary, #111827);
}

.graph-stage-panel__header.is-global .graph-stage-panel__title {
  color: var(--editor-text-inverse, #ffffff);
}

.graph-stage-panel__tag {
  :deep(.qy-tag) {
    white-space: nowrap;
  }
}

.graph-stage-panel__header.is-global .graph-stage-panel__tag {
  :deep(.qy-tag) {
    background: color-mix(in srgb, var(--editor-text-inverse, #ffffff) 20%, transparent);
    border-color: rgba(255, 255, 255, 0.3);
    color: var(--editor-text-inverse, #ffffff);
  }
}

.graph-stage-panel__banner {
  margin: 12px 16px 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(14, 116, 144, 0.08);
  border: 1px solid rgba(14, 116, 144, 0.14);
  color: var(--editor-text-secondary, #4b5563);
  font-size: 12px;

  &.is-missing {
    background: rgba(217, 119, 6, 0.08);
    border-color: rgba(217, 119, 6, 0.16);
    color: #92400e;
  }
}

.graph-stage-panel__body {
  flex: 1;
  min-height: 0;
}
</style>
