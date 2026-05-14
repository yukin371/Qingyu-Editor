<template>
  <div v-if="items.length > 0" class="tool-asset-summary-chips">
    <span v-for="item in items" :key="item.key" class="tool-asset-summary-chips__item">
      {{ item.label }} {{ item.count }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { WriterAssetSummaryItem } from '@/modules/writer/composables/useWriterAssetSummary'

withDefaults(
  defineProps<{
    items?: WriterAssetSummaryItem[]
  }>(),
  {
    items: () => [],
  },
)
</script>

<style scoped lang="scss">
.tool-asset-summary-chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.tool-asset-summary-chips__item {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  background: rgba(79, 121, 216, 0.08);
  border: 1px solid rgba(79, 121, 216, 0.14);
  color: var(--editor-text-secondary, #475569);
  font-size: 11px;
  font-weight: 700;
}
</style>
