<template>
  <div class="asset-list-panel">
    <div class="asset-list-panel__toolbar">
      <label class="asset-list-panel__search">
        <QyIcon name="Search" :size="14" />
        <input
          id="writer-asset-search"
          name="writer-asset-search"
          :value="searchKeyword"
          type="search"
          placeholder="搜索设定"
          @input="$emit('update:search-keyword', ($event.target as HTMLInputElement).value)"
        />
      </label>
      <button
        type="button"
        class="asset-list-panel__create-btn"
        title="快速新建"
        @click="$emit('create-asset')"
      >
        <QyIcon name="Plus" :size="13" />
      </button>
      <button
        type="button"
        class="asset-list-panel__ai-btn"
        :disabled="!canExtractAssets || isExtractingAssets"
        :title="canExtractAssets ? '提取本章资产' : '需要章节正文'"
        @click="$emit('extract-assets')"
      >
        {{ isExtractingAssets ? '提取中' : '提取' }}
      </button>
    </div>

    <div class="asset-list-panel__scope-tabs" role="tablist" aria-label="资产范围">
      <button
        v-for="option in scopeOptions"
        :key="option.id"
        type="button"
        class="asset-list-panel__scope-tab"
        :class="{ 'is-active': scopeView === option.id }"
        @click="$emit('update:scope-view', option.id)"
      >
        {{ option.label }}
      </button>
    </div>

    <section
      v-if="isExtractingAssets || extractedAssetError || extractedAssetSummary || extractedCandidates.length"
      class="asset-list-panel__extractor"
    >
      <div class="asset-list-panel__extractor-header">
        <div class="asset-list-panel__extractor-title">AI 候选</div>
        <button
          v-if="selectedExtractedAssetCount > 0"
          type="button"
          class="asset-list-panel__extractor-apply"
          :disabled="isCreatingExtractedAssets"
          @click="$emit('create-selected-extracted-assets')"
        >
          {{ isCreatingExtractedAssets ? '创建中…' : `批量创建（${selectedExtractedAssetCount}）` }}
        </button>
      </div>
      <p v-if="extractedAssetSummary" class="asset-list-panel__extractor-summary">
        {{ extractedAssetSummary }}
      </p>
      <p v-if="extractedAssetError" class="asset-list-panel__extractor-error">
        {{ extractedAssetError }}
      </p>
      <div
        v-if="!isExtractingAssets && extractedCandidates.length === 0 && extractedAssetSummary"
        class="asset-list-panel__extractor-empty"
      >
        无新候选
      </div>
      <ul v-if="extractedCandidates.length" class="asset-list-panel__extractor-list">
        <li
          v-for="candidate in extractedCandidates"
          :key="candidate.id"
          class="asset-list-panel__extractor-item"
        >
          <label
            class="asset-list-panel__extractor-check"
            :class="{ 'is-disabled': candidate.status !== 'pending' }"
          >
            <input
              type="checkbox"
              :checked="candidate.selected"
              :disabled="candidate.status !== 'pending'"
              @change="
                $emit(
                  'toggle-extracted-asset',
                  candidate.id,
                  ($event.target as HTMLInputElement).checked,
                )
              "
            />
          </label>
          <div class="asset-list-panel__extractor-body">
            <div class="asset-list-panel__extractor-row">
              <strong>{{ candidate.name }}</strong>
              <span class="asset-list-panel__extractor-badge">{{ candidate.categoryLabel }}</span>
              <span class="asset-list-panel__extractor-state" :class="`is-${candidate.status}`">
                {{
                  candidate.status === 'created'
                    ? '已创建'
                    : candidate.status === 'exists'
                      ? '已存在'
                      : candidate.status === 'ignored'
                        ? '已忽略'
                        : candidate.status === 'creating'
                          ? '创建中'
                          : candidate.status === 'error'
                            ? '失败'
                            : '待创建'
                }}
              </span>
              <button
                v-if="isCandidateEditable(candidate)"
                type="button"
                class="asset-list-panel__extractor-edit"
                :aria-expanded="expandedCandidateId === candidate.id"
                :aria-label="`${expandedCandidateId === candidate.id ? '收起' : '展开'} ${candidate.name} 的编辑项`"
                @click="toggleCandidateDetail(candidate.id)"
              >
                {{ expandedCandidateId === candidate.id ? '收起' : '编辑' }}
              </button>
            </div>
            <div
              v-if="isCandidateEditable(candidate) && expandedCandidateId === candidate.id"
              class="asset-list-panel__extractor-form"
            >
              <input
                class="asset-list-panel__extractor-input"
                type="text"
                :value="candidate.name"
                placeholder="资产名称"
                @input="
                  $emit(
                    'update-extracted-asset-field',
                    candidate.id,
                    'name',
                    ($event.target as HTMLInputElement).value,
                  )
                "
              />
              <select
                class="asset-list-panel__extractor-select"
                :value="candidate.category"
                @change="
                  $emit(
                    'update-extracted-asset-field',
                    candidate.id,
                    'writerCategory',
                    ($event.target as HTMLSelectElement).value,
                  )
                "
              >
                <option
                  v-for="option in extractedCategoryOptions"
                  :key="option.id"
                  :value="option.id"
                >
                  {{ option.label }}
                </option>
              </select>
              <textarea
                class="asset-list-panel__extractor-textarea"
                :value="candidate.summary || ''"
                rows="2"
                placeholder="一句话摘要，可选"
                @input="
                  $emit(
                    'update-extracted-asset-field',
                    candidate.id,
                    'summary',
                    ($event.target as HTMLTextAreaElement).value,
                  )
                "
              ></textarea>
            </div>
            <p v-if="candidate.summary" class="asset-list-panel__extractor-copy">
              {{ candidate.summary }}
            </p>
            <p
              v-if="candidate.evidence && expandedCandidateId === candidate.id"
              class="asset-list-panel__extractor-evidence"
            >
              {{ candidate.evidence }}
            </p>
            <p v-if="candidate.errorMessage" class="asset-list-panel__extractor-error">
              {{ candidate.errorMessage }}
            </p>
          </div>
          <button
            v-if="isCandidateEditable(candidate)"
            type="button"
            class="asset-list-panel__extractor-dismiss"
            @click="$emit('dismiss-extracted-asset', candidate.id)"
          >
            忽略
          </button>
        </li>
      </ul>
    </section>

    <AssetListTree
      :loading="loading"
      :active-category="activeCategory"
      :category-options="categoryOptions"
      :empty-message="emptyMessage"
      :assets="assets"
      :selected-asset-id="selectedAssetId"
      :allow-category-create="scopeView === 'global'"
      @select-category="$emit('select-category', $event)"
      @select-asset="$emit('select-asset', $event)"
      @create-category-asset="$emit('create-asset', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import AssetListTree from '@/modules/writer/components/workspace/tool-right/AssetListTree.vue'
import type { EncyclopediaCategory } from '@/modules/writer/composables/types'
import type {
  WriterAssetCategoryOption,
  WriterAssetListItem,
  WriterAssetScopeView,
} from '@/modules/writer/composables/useWriterAssetCatalog'

defineProps<{
  loading: boolean
  searchKeyword: string
  scopeView: WriterAssetScopeView
  activeCategory: EncyclopediaCategory
  categoryOptions: WriterAssetCategoryOption[]
  emptyMessage: string
  assets: WriterAssetListItem[]
  selectedAssetId?: string
  canExtractAssets: boolean
  isExtractingAssets: boolean
  isCreatingExtractedAssets: boolean
  extractedAssetSummary?: string
  extractedAssetError?: string
  selectedExtractedAssetCount: number
  extractedCandidates: Array<{
    id: string
    name: string
    category: EncyclopediaCategory
    categoryLabel: string
    summary?: string
    evidence?: string
    selected: boolean
    status: 'pending' | 'creating' | 'created' | 'exists' | 'ignored' | 'error'
    errorMessage?: string
  }>
}>()

const scopeOptions: Array<{ id: WriterAssetScopeView; label: string }> = [
  { id: 'chapter', label: '本章' },
  { id: 'volume', label: '本卷' },
  { id: 'global', label: '全局' },
]

const extractedCategoryOptions: Array<{ id: EncyclopediaCategory; label: string }> = [
  { id: 'characters', label: '角色' },
  { id: 'locations', label: '地点' },
  { id: 'items', label: '物件' },
  { id: 'organizations', label: '组织' },
  { id: 'concepts', label: '概念' },
]

const expandedCandidateId = ref<string | null>(null)

function isCandidateEditable(candidate: {
  status: 'pending' | 'creating' | 'created' | 'exists' | 'ignored' | 'error'
}) {
  return candidate.status === 'pending' || candidate.status === 'error'
}

function toggleCandidateDetail(candidateId: string) {
  expandedCandidateId.value = expandedCandidateId.value === candidateId ? null : candidateId
}

defineEmits<{
  (e: 'update:search-keyword', value: string): void
  (e: 'update:scope-view', value: WriterAssetScopeView): void
  (e: 'select-category', category: EncyclopediaCategory): void
  (e: 'select-asset', assetId: string): void
  (e: 'create-asset', category?: EncyclopediaCategory): void
  (e: 'extract-assets'): void
  (e: 'toggle-extracted-asset', candidateId: string, selected: boolean): void
  (
    e: 'update-extracted-asset-field',
    candidateId: string,
    field: 'name' | 'summary' | 'writerCategory',
    value: string,
  ): void
  (e: 'dismiss-extracted-asset', candidateId: string): void
  (e: 'create-selected-extracted-assets'): void
}>()
</script>

<style scoped lang="scss">
.asset-list-panel {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 6px 0 0;
  background: var(--editor-layer-panel, var(--editor-bg-base, #fff));
}

.asset-list-panel__toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 7px 6px;
}

.asset-list-panel__search {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 26px;
  flex: 1;
  padding: 0 7px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #d9dee6) 72%, transparent);
  border-radius: 7px;
  background: color-mix(in srgb, var(--editor-bg-surface, #f8fafc) 84%, transparent);
  color: var(--editor-text-muted, #6b7280);

  input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    color: var(--editor-text-primary, #111827);
    font-size: 11px;
  }
}

.asset-list-panel__create-btn {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 1px solid color-mix(in srgb, var(--editor-border, #d9dee6) 72%, transparent);
  border-radius: 7px;
  background: var(--editor-layer-panel, var(--editor-bg-base, #fff));
  color: var(--editor-text-secondary, #374151);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: var(--editor-bg-surface, #f8fafc);
    color: var(--editor-text-primary, #111827);
  }
}

.asset-list-panel__ai-btn {
  flex-shrink: 0;
  height: 26px;
  padding: 0 8px;
  border: 1px solid color-mix(in srgb, var(--editor-accent, #1d4ed8) 24%, transparent);
  border-radius: 7px;
  background: color-mix(in srgb, var(--editor-accent, #1d4ed8) 7%, var(--editor-bg-base, #fff));
  color: var(--editor-accent, #1d4ed8);
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: color-mix(in srgb, var(--editor-accent, #1d4ed8) 16%, var(--editor-bg-base, #fff));
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}

.asset-list-panel__scope-tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2px;
  margin: 0 7px 5px;
  padding: 2px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #d9dee6) 72%, transparent);
  border-radius: 7px;
  background: color-mix(in srgb, var(--editor-bg-surface, #f8fafc) 84%, transparent);
}

.asset-list-panel__scope-tab {
  height: 22px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--editor-text-muted, #6b7280);
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    color: var(--editor-text-primary, #111827);
  }

  &.is-active {
    background: var(--editor-layer-panel, var(--editor-bg-base, #fff));
    color: var(--editor-accent, #1d4ed8);
    box-shadow: 0 1px 2px color-mix(in srgb, var(--editor-shadow, #0f172a) 12%, transparent);
  }
}

.asset-list-panel__extractor {
  margin: 0 7px 5px;
  padding: 5px 6px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #d9dee6) 68%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--editor-bg-surface, #f8fafc) 74%, white);
}

.asset-list-panel__extractor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.asset-list-panel__extractor-title {
  font-size: 10px;
  font-weight: 700;
  color: var(--editor-text-primary, #111827);
}

.asset-list-panel__extractor-apply {
  height: 21px;
  padding: 0 7px;
  border: none;
  border-radius: 999px;
  background: var(--editor-accent, #1d4ed8);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}

.asset-list-panel__extractor-summary,
.asset-list-panel__extractor-empty,
.asset-list-panel__extractor-error {
  margin: 4px 0 0;
  font-size: 10px;
  line-height: 1.45;
}

.asset-list-panel__extractor-summary,
.asset-list-panel__extractor-empty {
  color: var(--editor-text-muted, #6b7280);
}

.asset-list-panel__extractor-error {
  color: #b42318;
}

.asset-list-panel__extractor-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 5px 0 0;
  padding: 0;
  list-style: none;
}

.asset-list-panel__extractor-item {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) auto;
  gap: 5px;
  align-items: start;
  padding: 5px 6px;
  border-radius: 7px;
  background: var(--editor-layer-panel, var(--editor-bg-base, #fff));
}

.asset-list-panel__extractor-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding-top: 2px;

  &.is-disabled {
    opacity: 0.6;
  }
}

.asset-list-panel__extractor-check input {
  margin: 0;
}

.asset-list-panel__extractor-body {
  min-width: 0;
}

.asset-list-panel__extractor-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  color: var(--editor-text-primary, #111827);
  font-size: 11px;
}

.asset-list-panel__extractor-edit {
  margin-left: auto;
  border: none;
  background: transparent;
  color: var(--editor-text-muted, #6b7280);
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
}

.asset-list-panel__extractor-badge {
  padding: 0 5px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--editor-accent, #1d4ed8) 10%, transparent);
  color: var(--editor-accent, #1d4ed8);
  font-size: 10px;
  font-weight: 600;
}

.asset-list-panel__extractor-state {
  font-size: 10px;
  color: var(--editor-text-muted, #6b7280);

  &.is-created {
    color: #027a48;
  }

  &.is-exists {
    color: #1d4ed8;
  }

  &.is-error {
    color: #b42318;
  }
}

.asset-list-panel__extractor-copy,
.asset-list-panel__extractor-evidence {
  margin: 3px 0 0;
  color: var(--editor-text-secondary, #374151);
  font-size: 10px;
  line-height: 1.4;
}

.asset-list-panel__extractor-evidence {
  color: var(--editor-text-muted, #6b7280);
}

.asset-list-panel__extractor-form {
  display: grid;
  gap: 4px;
  margin-top: 4px;
}

.asset-list-panel__extractor-input,
.asset-list-panel__extractor-select,
.asset-list-panel__extractor-textarea {
  width: 100%;
  border: 1px solid var(--editor-border, #d9dee6);
  border-radius: 6px;
  background: var(--editor-bg-base, #fff);
  color: var(--editor-text-primary, #111827);
  font-size: 10px;
  line-height: 1.4;
}

.asset-list-panel__extractor-input,
.asset-list-panel__extractor-select {
  height: 26px;
  padding: 0 7px;
}

.asset-list-panel__extractor-textarea {
  min-height: 48px;
  padding: 6px;
  resize: vertical;
}

.asset-list-panel__extractor-dismiss {
  border: none;
  background: transparent;
  color: var(--editor-text-muted, #6b7280);
  font-size: 10px;
  cursor: pointer;
}
</style>
