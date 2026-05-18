<template>
  <div class="asset-detail-panel">
    <div v-if="asset" class="asset-detail-panel__body">
      <AssetDetailHeader
        :asset="asset"
        :can-mutate="canMutateAsset"
        :can-open-graph="canOpenGraph"
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
    </div>

    <div v-else class="asset-detail-panel__empty">
      <span>设定详情</span>
      <strong>选择左侧资产</strong>
      <p>这里会显示摘要、引用章节和编辑入口。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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
const canMutateAsset = computed(() => Boolean(props.asset && !props.asset.unresolved))
const canOpenGraph = computed(() => Boolean(props.asset && !props.asset.unresolved))

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

.asset-detail-panel__empty {
  flex: 1;
  display: grid;
  align-content: center;
  justify-content: center;
  gap: 6px;
  padding: 20px;
  text-align: center;
  color: var(--editor-text-muted, #6b7280);
  font-size: 12px;

  span {
    color: var(--editor-text-ghost, #9ca3af);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  strong {
    color: var(--editor-text-primary, #111827);
    font-size: 14px;
  }

  p {
    margin: 0;
    line-height: 1.6;
  }
}
</style>
