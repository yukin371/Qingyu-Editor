<template>
  <div class="asset-detail-panel">
    <div v-if="asset" class="asset-detail-panel__body">
      <AssetDetailHeader
        :asset="asset"
        @edit="$emit('edit')"
        @delete="$emit('delete')"
        @open-graph="$emit('open-graph')"
        @jump-to-chapter="$emit('jump-to-chapter', $event)"
        @open-fullscreen="$emit('open-fullscreen')"
      />

      <AssetDetailContent
        :asset="asset"
        :active-tab="activeTab"
        :detail-fields="detailFields"
        :state-fields="stateFields"
        @update:active-tab="activeTab = $event"
        @jump-to-chapter="$emit('jump-to-chapter', $event)"
      />

      <p v-if="dataHint" class="asset-detail-panel__footnote">{{ dataHint }}</p>
    </div>

    <div v-else class="asset-detail-panel__empty">
      <span>选择一个设定后在这里查看。</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import AssetDetailContent from '@/modules/writer/components/workspace/tool-right/AssetDetailContent.vue'
import AssetDetailHeader from '@/modules/writer/components/workspace/tool-right/AssetDetailHeader.vue'
import type {
  WriterAssetDetailField,
  WriterAssetListItem,
} from '@/modules/writer/composables/useWriterAssetCatalog'

const props = defineProps<{
  asset: WriterAssetListItem | null
  detailFields: WriterAssetDetailField[]
  stateFields: Array<{ key: string; label: string; value: string }>
  dataHint: string
}>()

defineEmits<{
  (e: 'edit'): void
  (e: 'delete'): void
  (e: 'open-graph'): void
  (e: 'jump-to-chapter', chapterId: string): void
  (e: 'open-fullscreen'): void
}>()

const activeTab = ref<'detail' | 'chapters'>('detail')

watch(
  () => props.asset?.id,
  () => {
    activeTab.value = 'detail'
  },
)
</script>

<style scoped lang="scss">
.asset-detail-panel {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--editor-layer-panel, var(--editor-bg-base, #fff));
}

.asset-detail-panel__body {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 14px;
  overflow: auto;
}

.asset-detail-panel__footnote {
  margin: auto 0 0;
  color: var(--editor-text-ghost, #9ca3af);
  font-size: 11px;
  line-height: 1.5;
}

.asset-detail-panel__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--editor-text-muted, #6b7280);
  font-size: 12px;
}
</style>
