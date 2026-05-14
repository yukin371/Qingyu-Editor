<template>
  <div class="asset-detail-panel">
    <div v-if="asset" class="asset-detail-panel__body">
      <header class="asset-detail-panel__topbar">
        <div class="asset-detail-panel__title-wrap">
          <h3>{{ asset.name }}</h3>
          <span class="asset-detail-panel__type-chip">{{ asset.typeLabel }}</span>
        </div>
        <div class="asset-detail-panel__actions">
          <button type="button" class="asset-detail-panel__ghost" title="快速编辑" @click="$emit('edit')">
            <QyIcon name="Edit" :size="14" />
          </button>
          <button type="button" class="asset-detail-panel__ghost" title="关系图谱" @click="$emit('open-graph')">
            <QyIcon name="Share" :size="14" />
          </button>
          <button
            v-if="asset.latestChapterId"
            type="button"
            class="asset-detail-panel__ghost"
            title="前往章节"
            @click="$emit('jump-to-chapter', asset.latestChapterId)"
          >
            <QyIcon name="Position" :size="14" />
          </button>
          <button
            type="button"
            class="asset-detail-panel__ghost"
            title="展开全屏"
            @click="$emit('open-fullscreen')"
          >
            <QyIcon name="FullScreen" :size="14" />
          </button>
          <button type="button" class="asset-detail-panel__ghost is-danger" title="删除资产" @click="$emit('delete')">
            <QyIcon name="Delete" :size="14" />
          </button>
        </div>
      </header>

      <div class="asset-detail-panel__tabs" role="tablist" aria-label="资产详情标签">
        <button
          type="button"
          class="asset-detail-panel__tab"
          :class="{ 'is-active': activeTab === 'detail' }"
          @click="activeTab = 'detail'"
        >
          设定
        </button>
        <button
          type="button"
          class="asset-detail-panel__tab"
          :class="{ 'is-active': activeTab === 'chapters' }"
          @click="activeTab = 'chapters'"
        >
          提及章节
        </button>
      </div>

      <div v-if="activeTab === 'detail'" class="asset-detail-panel__content">
        <p v-if="asset.summary" class="asset-detail-panel__summary">{{ asset.summary }}</p>

        <dl v-if="detailFields.length" class="asset-detail-panel__grid">
          <div v-for="field in detailFields" :key="field.label" class="asset-detail-panel__row">
            <dt>{{ field.label }}</dt>
            <dd>{{ field.value }}</dd>
          </div>
        </dl>

        <section v-if="stateFields.length" class="asset-detail-panel__section">
          <h4>状态字段</h4>
          <div class="asset-detail-panel__state-list">
            <div v-for="field in stateFields" :key="field.key" class="asset-detail-panel__state-item">
              <strong>{{ field.label }}</strong>
              <span>{{ field.value }}</span>
            </div>
          </div>
        </section>
      </div>

      <div v-else class="asset-detail-panel__content">
        <section
          v-if="asset.latestChapterTitle || chapterReferenceText || volumeReferenceText"
          class="asset-detail-panel__chapter-block"
        >
          <p class="asset-detail-panel__chapter-label">最近提及</p>
          <strong>{{ asset.latestChapterTitle || '暂无最近章节' }}</strong>
          <p v-if="chapterReferenceMetaText" class="asset-detail-panel__chapter-meta">
            {{ chapterReferenceMetaText }}
          </p>
          <p v-if="linkedNodeCountText" class="asset-detail-panel__chapter-meta">
            {{ linkedNodeCountText }}
          </p>
          <button
            v-if="asset.latestChapterId"
            type="button"
            class="asset-detail-panel__chapter-action"
            @click="$emit('jump-to-chapter', asset.latestChapterId)"
          >
            打开该章节
          </button>
        </section>
        <section v-else class="asset-detail-panel__chapter-empty">
          <span>当前资产还没有章节引用记录。</span>
        </section>
      </div>

      <p v-if="dataHint" class="asset-detail-panel__footnote">{{ dataHint }}</p>
    </div>

    <div v-else class="asset-detail-panel__empty">
      <span>选择一个设定后在这里查看。</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
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
  background: #fff;
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

.asset-detail-panel__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eceff3;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #111827;
  }
}

.asset-detail-panel__title-wrap {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.asset-detail-panel__type-chip {
  color: #9ca3af;
  font-size: 11px;
  white-space: nowrap;
}

.asset-detail-panel__actions {
  display: inline-flex;
  gap: 6px;
}

.asset-detail-panel__ghost {
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  color: #6b7280;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: #f3f4f6;
    color: #111827;
  }
}

.asset-detail-panel__ghost.is-danger:hover {
  background: #fef2f2;
  color: #b91c1c;
}

.asset-detail-panel__tabs {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-height: 28px;
  border-bottom: 1px solid #eceff3;
}

.asset-detail-panel__tab {
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;

  &.is-active {
    color: #111827;
    font-weight: 600;
  }
}

.asset-detail-panel__content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.asset-detail-panel__summary {
  margin: 0;
  color: #4b5563;
  line-height: 1.6;
}

.asset-detail-panel__grid {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px 16px;
}

.asset-detail-panel__row {
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f2f5;

  dt {
    margin: 0 0 4px;
    color: #6b7280;
    font-size: 12px;
  }

  dd {
    margin: 0;
    color: #111827;
    line-height: 1.5;
  }
}

.asset-detail-panel__section h4 {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}

.asset-detail-panel__state-list {
  display: grid;
  gap: 8px;
}

.asset-detail-panel__state-item {
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f2f5;
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    color: #111827;
    font-size: 12px;
  }

  span {
    color: #4b5563;
    font-size: 12px;
  }
}

.asset-detail-panel__chapter-block,
.asset-detail-panel__chapter-empty {
  padding: 10px 0;
  border-bottom: 1px solid #f0f2f5;
}

.asset-detail-panel__chapter-label,
.asset-detail-panel__chapter-meta {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
}

.asset-detail-panel__chapter-action {
  margin-top: 8px;
  height: 28px;
  padding: 0 10px;
  border: 1px solid #d9dee6;
  border-radius: 4px;
  background: #fff;
  color: #374151;
  font-size: 12px;
  cursor: pointer;
}

.asset-detail-panel__footnote {
  margin: auto 0 0;
  color: #9ca3af;
  font-size: 11px;
  line-height: 1.5;
}

.asset-detail-panel__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 12px;
}
</style>
