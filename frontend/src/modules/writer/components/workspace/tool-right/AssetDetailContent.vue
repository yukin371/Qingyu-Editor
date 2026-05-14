<template>
  <div class="asset-detail-content">
    <div class="asset-detail-content__tabs" role="tablist" aria-label="资产详情标签">
      <button
        type="button"
        class="asset-detail-content__tab"
        :class="{ 'is-active': activeTab === 'detail' }"
        @click="$emit('update:active-tab', 'detail')"
      >
        设定
      </button>
      <button
        type="button"
        class="asset-detail-content__tab"
        :class="{ 'is-active': activeTab === 'chapters' }"
        @click="$emit('update:active-tab', 'chapters')"
      >
        提及章节
      </button>
    </div>

    <div v-if="activeTab === 'detail'" class="asset-detail-content__body">
      <p v-if="asset.summary" class="asset-detail-content__summary">{{ asset.summary }}</p>

      <dl v-if="detailFields.length" class="asset-detail-content__grid">
        <div v-for="field in detailFields" :key="field.label" class="asset-detail-content__row">
          <dt>{{ field.label }}</dt>
          <dd>{{ field.value }}</dd>
        </div>
      </dl>

      <section v-if="stateFields.length" class="asset-detail-content__section">
        <h4>状态字段</h4>
        <div class="asset-detail-content__state-list">
          <div v-for="field in stateFields" :key="field.key" class="asset-detail-content__state-item">
            <strong>{{ field.label }}</strong>
            <span>{{ field.value }}</span>
          </div>
        </div>
      </section>
    </div>

    <div v-else class="asset-detail-content__body">
      <section
        v-if="asset.latestChapterTitle || chapterReferenceText || volumeReferenceText"
        class="asset-detail-content__chapter-block"
      >
        <p class="asset-detail-content__chapter-label">最近提及</p>
        <strong>{{ asset.latestChapterTitle || '暂无最近章节' }}</strong>
        <p v-if="chapterReferenceMetaText" class="asset-detail-content__chapter-meta">
          {{ chapterReferenceMetaText }}
        </p>
        <p v-if="linkedNodeCountText" class="asset-detail-content__chapter-meta">
          {{ linkedNodeCountText }}
        </p>
        <button
          v-if="asset.latestChapterId"
          type="button"
          class="asset-detail-content__chapter-action"
          @click="$emit('jump-to-chapter', asset.latestChapterId)"
        >
          打开该章节
        </button>
      </section>
      <section v-else class="asset-detail-content__chapter-empty">
        <span>当前资产还没有章节引用记录。</span>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  WriterAssetDetailField,
  WriterAssetListItem,
} from '@/modules/writer/composables/useWriterAssetCatalog'

const props = defineProps<{
  asset: WriterAssetListItem
  activeTab: 'detail' | 'chapters'
  detailFields: WriterAssetDetailField[]
  stateFields: Array<{ key: string; label: string; value: string }>
}>()

defineEmits<{
  (e: 'update:active-tab', value: 'detail' | 'chapters'): void
  (e: 'jump-to-chapter', chapterId: string): void
}>()

const linkedNodeCountText = computed(() => {
  const field = props.detailFields.find((item) => item.label === '关联结构节点')
  return field ? `关联结构节点 ${field.value}` : ''
})

const chapterReferenceText = computed(() => {
  const field = props.detailFields.find((item) => item.label === '提及章节')
  return field?.value || ''
})

const volumeReferenceText = computed(() => {
  const field = props.detailFields.find((item) => item.label === '涉及卷')
  return field?.value || ''
})

const chapterReferenceMetaText = computed(() =>
  [chapterReferenceText.value, volumeReferenceText.value].filter(Boolean).join(' · '),
)
</script>

<style scoped lang="scss">
.asset-detail-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.asset-detail-content__tabs {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-height: 28px;
  border-bottom: 1px solid var(--editor-border, #eceff3);
}

.asset-detail-content__tab {
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--editor-text-muted, #6b7280);
  font-size: 12px;
  cursor: pointer;

  &.is-active {
    color: var(--editor-text-primary, #111827);
    font-weight: 600;
  }
}

.asset-detail-content__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.asset-detail-content__summary {
  margin: 0;
  color: var(--editor-text-secondary, #4b5563);
  line-height: 1.6;
}

.asset-detail-content__grid {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px 16px;
}

.asset-detail-content__row {
  padding-bottom: 8px;
  border-bottom: 1px solid var(--editor-border-light, #f0f2f5);

  dt {
    margin: 0 0 4px;
    color: var(--editor-text-muted, #6b7280);
    font-size: 12px;
  }

  dd {
    margin: 0;
    color: var(--editor-text-primary, #111827);
    line-height: 1.5;
  }
}

.asset-detail-content__section h4 {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--editor-text-primary, #111827);
}

.asset-detail-content__state-list {
  display: grid;
  gap: 8px;
}

.asset-detail-content__state-item {
  padding-bottom: 8px;
  border-bottom: 1px solid var(--editor-border-light, #f0f2f5);
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    color: var(--editor-text-primary, #111827);
    font-size: 12px;
  }

  span {
    color: var(--editor-text-secondary, #4b5563);
    font-size: 12px;
  }
}

.asset-detail-content__chapter-block,
.asset-detail-content__chapter-empty {
  padding: 10px 0;
  border-bottom: 1px solid var(--editor-border-light, #f0f2f5);
}

.asset-detail-content__chapter-label,
.asset-detail-content__chapter-meta {
  margin: 0;
  color: var(--editor-text-muted, #6b7280);
  font-size: 12px;
}

.asset-detail-content__chapter-action {
  margin-top: 8px;
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--editor-border, #d9dee6);
  border-radius: 4px;
  background: var(--editor-bg-base, #fff);
  color: var(--editor-text-secondary, #374151);
  font-size: 12px;
  cursor: pointer;
}
</style>
