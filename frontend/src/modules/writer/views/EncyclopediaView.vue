<template>
  <div class="assets-view" :class="{ 'assets-view--embedded': embedded }">
    <header v-if="!embedded" class="assets-view__header">
      <div>
        <p class="assets-view__eyebrow">Writer Workspace</p>
        <h2>资产总览</h2>
      </div>
      <p class="assets-view__header-copy">列表优先查看角色、地点、物件、组织与概念设定。</p>
    </header>

    <section class="assets-view__toolbar">
      <label class="assets-view__search">
        <QyIcon name="Search" :size="16" />
        <input v-model.trim="searchKeyword" type="search" placeholder="搜索资产名称、摘要或分类" />
      </label>
      <button type="button" class="assets-view__primary-action" @click="handleCreateAsset()">
        <QyIcon name="Plus" :size="14" />
        <span>添加资产</span>
      </button>
      <div class="assets-view__categories">
        <button
          v-for="category in categoryOptions"
          :key="category.id"
          type="button"
          class="assets-view__category-chip"
          :class="{ 'is-active': activeCategory === category.id }"
          @click="setActiveCategory(category.id)"
        >
          <span>{{ category.label }}</span>
          <strong>{{ category.count }}</strong>
        </button>
      </div>
    </section>

    <div class="assets-view__meta">
      <span>{{ currentCategoryMeta.title }}</span>
      <span>{{ filteredAssets.length }} 项</span>
      <span>{{ assetScopeHint }}</span>
    </div>

    <section class="assets-view__content" :class="{ 'has-detail': !!selectedAsset }">
      <div class="assets-view__list">
        <div v-if="loading" class="assets-view__empty assets-view__empty--loading">
          正在加载资产数据…
        </div>
        <div v-else-if="filteredAssets.length === 0" class="assets-view__empty">
          <div class="assets-view__empty-panel">
            <span>{{ currentCategoryMeta.title }}</span>
            <strong>{{ searchKeyword ? '没有匹配资产' : emptyMessage }}</strong>
            <p>
              {{
                searchKeyword
                  ? '换一个关键词，或直接新建全局资产。'
                  : '手动新增会进入全局资产；章节内 @ 提及会自动形成局部引用。'
              }}
            </p>
            <button type="button" class="assets-view__empty-action" @click="handleCreateAsset()">
              <QyIcon name="Plus" :size="13" />
              <span>添加{{ currentCategoryMeta.title.replace('总览', '') }}</span>
            </button>
          </div>
        </div>
        <div v-else class="assets-view__rows">
          <button
            v-for="asset in filteredAssets"
            :key="asset.id"
            type="button"
            class="asset-row"
            :class="{ 'is-selected': selectedAsset?.id === asset.id }"
            @click="selectAsset(asset)"
          >
            <div class="asset-row__main">
              <strong>{{ asset.name }}</strong>
              <span>{{ asset.typeLabel }}</span>
              <span v-if="asset.summary">{{ asset.summary }}</span>
            </div>
            <div class="asset-row__meta">
              <span v-if="asset.badge">{{ asset.badge }}</span>
              <span>{{ asset.latestChapterTitle || `${asset.chapterReferenceCount} 章` }}</span>
              <span>{{ asset.chapterReferenceCount }} 章</span>
              <span>{{ asset.volumeReferenceCount }} 卷</span>
              <span>{{ asset.linkedNodeCount }} 节点</span>
            </div>
          </button>
        </div>
      </div>

      <aside v-if="selectedAsset" class="assets-view__detail">
        <div class="assets-view__detail-header">
          <div>
            <p class="assets-view__detail-eyebrow">{{ selectedAsset.typeLabel }}</p>
            <h3>{{ selectedAsset.name }}</h3>
            <p class="assets-view__detail-summary">{{ selectedAsset.summary || '暂无摘要' }}</p>
          </div>
          <div class="assets-view__detail-actions">
            <button
              v-if="canMutateSelectedAsset"
              type="button"
              class="assets-view__detail-icon-btn"
              title="编辑资产"
              aria-label="编辑资产"
              @click="handleEditAsset"
            >
              <QyIcon name="Edit" :size="14" />
            </button>
            <button
              type="button"
              class="assets-view__detail-icon-btn"
              title="关系图谱"
              aria-label="关系图谱"
              @click="handleOpenGraph"
            >
              <QyIcon name="Share" :size="14" />
            </button>
            <button
              v-if="selectedAsset.latestChapterId"
              type="button"
              class="assets-view__detail-icon-btn"
              title="前往章节"
              aria-label="前往章节"
              @click="emit('jump-to-chapter', selectedAsset.latestChapterId)"
            >
              <QyIcon name="ArrowRight" :size="14" />
            </button>
            <button
              type="button"
              class="assets-view__detail-icon-btn"
              title="关闭详情"
              aria-label="关闭详情"
              @click="selectedAsset = null"
            >
              <QyIcon name="Close" :size="14" />
            </button>
            <button
              v-if="canMutateSelectedAsset"
              type="button"
              class="assets-view__detail-icon-btn is-danger"
              title="删除资产"
              aria-label="删除资产"
              @click="handleDeleteAsset"
            >
              <QyIcon name="Delete" :size="14" />
            </button>
          </div>
        </div>

        <dl v-if="selectedDetailFields.length" class="assets-view__detail-grid">
          <div v-for="field in selectedDetailFields" :key="field.label" class="assets-view__detail-row">
            <dt>{{ field.label }}</dt>
            <dd>{{ field.value }}</dd>
          </div>
        </dl>

        <section v-if="selectedStateFields.length" class="assets-view__detail-section">
          <h4>状态字段</h4>
          <div class="assets-view__state-list">
            <div v-for="field in selectedStateFields" :key="field.key" class="assets-view__state-item">
              <strong>{{ field.label }}</strong>
              <span>{{ field.value }}</span>
            </div>
          </div>
        </section>

        <section class="assets-view__detail-section">
          <h4>数据口径</h4>
          <p>{{ selectedDataHint }}</p>
        </section>
      </aside>
    </section>

    <AssetQuickEditorDialog
      v-model:visible="assetEditorVisible"
      :mode="assetEditorMode"
      :category="assetEditorCategory"
      allow-category-select
      :asset="assetEditorMode === 'edit' ? selectedAsset : null"
      :submitting="assetEditorSubmitting"
      @submit="handleAssetEditorSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import { message, messageBox } from '@/design-system/services'
import AssetQuickEditorDialog from '@/modules/writer/components/workspace/tool-right/AssetQuickEditorDialog.vue'
import type { EncyclopediaCategory, GraphFocusTarget } from '@/modules/writer/composables/types'
import type { ToolType } from '@/modules/writer/composables/useToolOverlay'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import {
  useWriterAssetCatalog,
  type WriterAssetMutationInput,
} from '@/modules/writer/composables/useWriterAssetCatalog'

interface Props {
  embedded?: boolean
  projectId?: string
  activeCategory?: EncyclopediaCategory
  selectedAssetId?: string
  chapters?: SidebarChapterSummary[]
}

const props = withDefaults(defineProps<Props>(), {
  embedded: false,
  projectId: '',
  activeCategory: 'characters',
})

const emit = defineEmits<{
  'update:activeCategory': [value: EncyclopediaCategory]
  'switch-tool': [tool: ToolType]
  'focus-graph-asset': [target: GraphFocusTarget]
  'jump-to-chapter': [chapterId: string]
}>()

const searchKeyword = ref('')
const activeCategory = ref<EncyclopediaCategory>(props.activeCategory)
const {
  loading,
  categoryOptions,
  currentCategoryMeta,
  filteredAssets,
  emptyMessage,
  assetScopeHint,
  selectedAsset,
  selectedDetailFields,
  selectedStateFields,
  selectedDataHint,
  selectAsset,
  ensureSelectedAsset,
  buildGraphFocusTarget,
  createAsset,
  updateAsset,
  deleteAsset,
} = useWriterAssetCatalog({
  projectId: computed(() => props.projectId || ''),
  chapters: computed(() => props.chapters || []),
  activeCategory,
  searchKeyword,
})
const assetEditorVisible = ref(false)
const assetEditorMode = ref<'create' | 'edit'>('create')
const assetEditorSubmitting = ref(false)
const assetEditorCategory = ref<EncyclopediaCategory>(activeCategory.value)

const canMutateSelectedAsset = computed(
  () => Boolean(selectedAsset.value) && !selectedAsset.value?.unresolved,
)

const handleOpenGraph = () => {
  if (!selectedAsset.value) return
  emit('focus-graph-asset', buildGraphFocusTarget(selectedAsset.value))
  emit('switch-tool', 'relations')
}

const setActiveCategory = (category: EncyclopediaCategory) => {
  activeCategory.value = category
  emit('update:activeCategory', category)
}

const handleCreateAsset = (category: EncyclopediaCategory = activeCategory.value) => {
  assetEditorCategory.value = category
  activeCategory.value = category
  emit('update:activeCategory', category)
  assetEditorMode.value = 'create'
  assetEditorVisible.value = true
}

const handleEditAsset = () => {
  if (!canMutateSelectedAsset.value || !selectedAsset.value) return
  assetEditorCategory.value = selectedAsset.value.category
  assetEditorMode.value = 'edit'
  assetEditorVisible.value = true
}

const handleDeleteAsset = async () => {
  if (!canMutateSelectedAsset.value || !selectedAsset.value) return
  const asset = selectedAsset.value
  const chapterImpact = asset.chapterReferenceCount
    ? `将影响 ${asset.chapterReferenceCount} 个章节引用`
    : '当前没有章节引用记录'
  const volumeImpact = asset.volumeReferenceCount ? `，涉及 ${asset.volumeReferenceCount} 个卷级投影` : ''

  try {
    await messageBox.confirm(
      `确定删除资产「${asset.name}」吗？${chapterImpact}${volumeImpact}。此操作不可恢复。`,
      '删除资产',
      { type: 'warning' },
    )
  } catch {
    return
  }

  try {
    await deleteAsset(asset)
    message.success('资产已删除')
  } catch (error) {
    message.error((error as Error).message || '删除资产失败')
  }
}

const handleAssetEditorSubmit = async (payload: WriterAssetMutationInput) => {
  assetEditorSubmitting.value = true
  try {
    if (assetEditorMode.value === 'edit' && selectedAsset.value) {
      await updateAsset(selectedAsset.value, payload)
      message.success('资产已更新')
    } else {
      await createAsset(payload)
      activeCategory.value = payload.category
      emit('update:activeCategory', payload.category)
      message.success('资产已创建')
    }
    assetEditorVisible.value = false
  } catch (error) {
    message.error((error as Error).message || '保存资产失败')
  } finally {
    assetEditorSubmitting.value = false
  }
}

watch(
  () => props.activeCategory,
  (value) => {
    activeCategory.value = value
  },
  { immediate: true },
)

watch(
  [() => props.selectedAssetId, filteredAssets],
  ([assetId]) => {
    if (assetId) {
      ensureSelectedAsset(assetId)
    } else if (!filteredAssets.value.length) {
      selectAsset(null)
    }
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.assets-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--editor-layer-panel, var(--editor-bg-base, #ffffff));
  color: var(--editor-text-primary, #111827);
}

.assets-view__header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  padding: 16px 20px 8px;
  border-bottom: 1px solid var(--editor-border-light, #eceff3);
}

.assets-view__eyebrow,
.assets-view__detail-eyebrow {
  margin: 0 0 4px;
  color: var(--editor-text-ghost, #9ca3af);
  font-size: 11px;
  text-transform: uppercase;
}

.assets-view__header h2,
.assets-view__detail-header h3 {
  margin: 0;
}

.assets-view__header-copy,
.assets-view__detail-summary {
  margin: 0;
  color: var(--editor-text-muted, #6b7280);
  line-height: 1.5;
}

.assets-view__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px 20px 10px;
}

.assets-view__search {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: min(320px, 100%);
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--editor-border, #d9dee6);
  border-radius: 4px;
  background: var(--editor-layer-strong, #f8fafc);
  color: var(--editor-text-muted, #6b7280);

  input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    color: var(--editor-text-primary, #111827);
    font-size: 13px;
  }
}

.assets-view__categories {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.assets-view__primary-action {
  height: 32px;
  padding: 0 12px;
  border: 1px solid color-mix(in srgb, var(--editor-accent, #1d4ed8) 34%, transparent);
  border-radius: 4px;
  background: var(--editor-accent, #1d4ed8);
  color: var(--editor-accent-contrast, #ffffff);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 13px;

  &:hover {
    background: color-mix(in srgb, var(--editor-accent, #1d4ed8) 88%, var(--editor-text-primary, #111827));
  }
}

.assets-view__category-chip {
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--editor-border, #d9dee6);
  border-radius: 4px;
  background: var(--editor-layer-panel, #ffffff);
  color: var(--editor-text-secondary, #4b5563);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;

  strong {
    color: var(--editor-text-ghost, #9ca3af);
    font-size: 11px;
  }

  &.is-active {
    background: color-mix(in srgb, var(--editor-accent-soft, #eef4ff) 84%, transparent);
    border-color: color-mix(in srgb, var(--editor-accent, #1d4ed8) 28%, transparent);
    color: var(--editor-accent, #1d4ed8);
  }
}

.assets-view__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 0 20px 12px;
  color: var(--editor-text-muted, #6b7280);
  font-size: 12px;
}

.assets-view__content {
  min-height: 0;
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
}

.assets-view__content.has-detail {
  grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.9fr);
}

.assets-view__list {
  min-height: 0;
  overflow: auto;
  border-top: 1px solid var(--editor-border-light, #eceff3);
}

.assets-view__rows {
  display: flex;
  flex-direction: column;
}

.asset-row {
  width: 100%;
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 20px;
  border: none;
  border-bottom: 1px solid var(--editor-border-light, #f0f2f5);
  background: transparent;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: var(--editor-layer-soft, #f8fafc);
  }

  &.is-selected {
    background: color-mix(in srgb, var(--editor-accent-soft, #eaf2ff) 82%, transparent);
  }
}

.asset-row__main,
.asset-row__meta {
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.asset-row__main strong {
  font-size: 13px;
  font-weight: 600;
  color: var(--editor-text-primary, #111827);
}

.asset-row__main span,
.asset-row__meta span {
  color: var(--editor-text-muted, #6b7280);
  font-size: 12px;
  white-space: nowrap;
}

.asset-row__main span:last-child {
  overflow: hidden;
  text-overflow: ellipsis;
}

.assets-view__empty {
  min-height: 220px;
  display: grid;
  place-items: center;
  padding: 24px 20px;
  color: var(--editor-text-muted, #6b7280);
  font-size: 12px;
}

.assets-view__empty--loading {
  place-items: start;
  min-height: auto;
  padding: 18px 20px;
}

.assets-view__empty-panel {
  width: min(420px, 100%);
  display: grid;
  gap: 8px;
  padding: 18px;
  border: 1px dashed color-mix(in srgb, var(--editor-border, #d9dee6) 86%, var(--editor-accent, #1d4ed8));
  border-radius: 12px;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--editor-accent-soft, #eaf2ff) 30%, transparent), transparent 46%),
    color-mix(in srgb, var(--editor-layer-panel, #ffffff) 92%, transparent);

  > span {
    width: fit-content;
    padding: 3px 8px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--editor-accent-soft, #eaf2ff) 76%, transparent);
    color: var(--editor-accent, #1d4ed8);
    font-size: 11px;
    font-weight: 700;
  }

  strong {
    color: var(--editor-text-primary, #111827);
    font-size: 14px;
  }

  p {
    margin: 0;
    color: var(--editor-text-muted, #6b7280);
    line-height: 1.7;
  }
}

.assets-view__empty-action {
  width: fit-content;
  min-height: 30px;
  margin-top: 4px;
  padding: 0 10px;
  border: 1px solid color-mix(in srgb, var(--editor-accent, #1d4ed8) 26%, transparent);
  border-radius: 6px;
  background: var(--editor-accent, #1d4ed8);
  color: var(--editor-accent-contrast, #ffffff);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.assets-view__detail {
  min-height: 0;
  overflow: auto;
  border-top: 1px solid var(--editor-border-light, #eceff3);
  border-left: 1px solid var(--editor-border-light, #eceff3);
  padding: 14px 18px;
}

.assets-view__detail-header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--editor-border-light, #eceff3);
}

.assets-view__detail-actions {
  display: inline-flex;
  gap: 8px;
}

.assets-view__detail-icon-btn {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--editor-border, #d9dee6);
  border-radius: 4px;
  background: var(--editor-layer-panel, #ffffff);
  color: var(--editor-text-secondary, #374151);
  cursor: pointer;

  &:hover {
    background: var(--editor-layer-soft, #f8fafc);
    color: var(--editor-text-primary, #111827);
  }

  &.is-danger:hover {
    background: var(--color-danger-50, #fef2f2);
    color: var(--color-danger-700, #b91c1c);
  }
}

.assets-view__detail-grid {
  margin: 12px 0 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px 16px;
}

.assets-view__detail-row,
.assets-view__state-item {
  padding-bottom: 8px;
  border-bottom: 1px solid var(--editor-border-light, #f0f2f5);
}

.assets-view__detail-row dt {
  margin: 0 0 4px;
  color: var(--editor-text-muted, #6b7280);
  font-size: 12px;
}

.assets-view__detail-row dd {
  margin: 0;
  color: var(--editor-text-primary, #111827);
  line-height: 1.5;
}

.assets-view__detail-section {
  margin-top: 14px;

  h4 {
    margin: 0 0 8px;
    font-size: 13px;
    color: var(--editor-text-primary, #111827);
  }

  p {
    margin: 0;
    color: var(--editor-text-muted, #6b7280);
    line-height: 1.6;
  }
}

.assets-view__state-list {
  display: grid;
  gap: 8px;
}

.assets-view__state-item {
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
</style>
