<template>
  <div class="structure-stage-controls">
    <header class="structure-stage-controls__header">
      <div class="structure-stage-controls__header-main">
        <div class="structure-stage-controls__title-block">
          <h2>结构舞台</h2>
        </div>

        <div class="structure-stage-controls__actions">
          <button
            type="button"
            class="stage-secondary-action"
            :class="{ 'is-active': showAdvancedControls }"
            @click="emit('toggle-advanced')"
          >
            <QyIcon name="Filter" :size="14" />
            <span>{{ showAdvancedControls ? '收起高级' : '高级视图' }}</span>
          </button>
          <button
            type="button"
            class="refresh-action"
            :disabled="isOutlineLoading"
            @click="emit('refresh')"
          >
            <QyIcon :name="isOutlineLoading ? 'Loading' : 'Refresh'" :size="14" />
            <span>{{ isOutlineLoading ? '加载中' : '刷新' }}</span>
          </button>
        </div>
      </div>
    </header>

    <section
      v-if="showAdvancedControls"
      class="structure-stage-controls__advanced"
      data-testid="structure-stage-advanced"
    >
      <nav class="structure-stage-controls__tabs" aria-label="结构舞台视图切换">
        <div class="tabs-group">
          <button
            v-for="option in viewModeOptions"
            :key="option.value"
            type="button"
            class="stage-tab"
            :class="{ 'is-active': stageViewMode === option.value }"
            @click="emit('update:stage-view-mode', option.value)"
          >
            <QyIcon :name="option.icon" :size="14" class="stage-tab__icon" />
            <span class="stage-tab__label">{{ option.label }}</span>
          </button>
        </div>
      </nav>

      <header class="structure-stage-controls__toolbar">
        <div class="toolbar-left">
          <div class="structure-search">
            <QyIcon name="Search" :size="14" class="search-icon" />
            <input
              :value="filterText"
              type="text"
              class="structure-search__input"
              placeholder="搜索节点标题或描述"
              @input="emit('update:filter-text', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <div class="structure-filter-chips">
            <button
              v-for="option in primaryFilterOptions"
              :key="option.value"
              type="button"
              class="structure-filter-chip"
              :class="{ 'is-active': activeFilter === option.value }"
              @click="emit('update:active-filter', option.value)"
            >
              {{ option.label }}
            </button>
            <label v-if="secondaryFilterOptions.length" class="structure-filter-select-wrap">
              <span class="structure-filter-select__label">更多筛选</span>
              <select
                class="structure-filter-select"
                data-testid="structure-secondary-filter"
                :value="secondaryFilterValue"
                @change="emit('secondary-filter-change', ($event.target as HTMLSelectElement).value)"
              >
                <option value="">选择筛选</option>
                <option
                  v-for="option in secondaryFilterOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </label>
          </div>
        </div>

        <div class="toolbar-right">
          <div class="mini-metrics">
            <div class="mini-metric" title="主干节点数">
              <span>主干</span><strong>{{ rootNodeCount }}</strong>
            </div>
            <div class="mini-metric" title="结构总数">
              <span>总计</span><strong>{{ flattenedNodeCount }}</strong>
            </div>
            <div class="mini-metric" title="当前筛选数">
              <span>命中</span><strong>{{ filteredFlattenedNodeCount }}</strong>
            </div>
            <div class="mini-metric highlight" title="当前章节">
              <span>当前</span><strong>{{ currentChapterTitle || '未选择' }}</strong>
            </div>
          </div>
        </div>
      </header>
    </section>

    <section v-if="structureRefreshError" class="structure-stage-controls__error-card">
      <div>
        <p class="structure-stage-controls__error-eyebrow">Structure Sync</p>
        <h3>结构数据暂时未同步成功</h3>
        <p>{{ structureRefreshError }}</p>
      </div>
      <button
        type="button"
        class="refresh-action"
        :disabled="isOutlineLoading"
        @click="emit('refresh')"
      >
        重新加载
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import type { StageViewMode, StructureFilterMode } from './structureStage.types'

defineProps<{
  currentChapterTitle: string
  selectedNodeTitle: string
  defaultStageActionText: string
  selectedNodeAssetCount: number
  showAdvancedControls: boolean
  isOutlineLoading: boolean
  structureRefreshError: string
  stageViewMode: StageViewMode
  viewModeOptions: Array<{ value: StageViewMode; label: string; icon: string }>
  filterText: string
  primaryFilterOptions: Array<{ value: StructureFilterMode; label: string }>
  activeFilter: StructureFilterMode
  secondaryFilterOptions: Array<{ value: StructureFilterMode; label: string }>
  secondaryFilterValue: StructureFilterMode | ''
  rootNodeCount: number
  flattenedNodeCount: number
  filteredFlattenedNodeCount: number
}>()

const emit = defineEmits<{
  (e: 'toggle-advanced'): void
  (e: 'refresh'): void
  (e: 'update:stage-view-mode', value: StageViewMode): void
  (e: 'update:filter-text', value: string): void
  (e: 'update:active-filter', value: StructureFilterMode): void
  (e: 'secondary-filter-change', value: string): void
}>()
</script>

<style scoped lang="scss">
.structure-stage-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.structure-stage-controls__header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 2px;
}

.structure-stage-controls__header-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.structure-stage-controls__title-block {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;

  h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: var(--editor-text-primary, #0f172a);
    white-space: nowrap;
  }
}

.structure-stage-controls__summary {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 6px;
  min-width: 0;

  span {
    display: inline-flex;
    align-items: center;
    min-height: 22px;
    padding: 0 8px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--editor-bg-surface, #f8fafc) 88%, transparent);
    border: 1px solid color-mix(in srgb, var(--editor-border, #94a3b8) 28%, transparent);
    color: var(--editor-text-muted, #64748b);
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
  }
}

.structure-stage-controls__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.stage-secondary-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--editor-border, #e2e8f0);
  border-radius: 999px;
  background: var(--editor-layer-panel, var(--editor-bg-base, #fff));
  color: var(--editor-text-secondary, #334155);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 120ms ease-out;

  &:hover {
    border-color: color-mix(in srgb, var(--editor-border-focus, #32536a) 44%, transparent);
    color: var(--editor-text-primary, #0f172a);
  }

  &.is-active {
    border-color: color-mix(in srgb, var(--editor-accent, #06b6d4) 36%, transparent);
    background: color-mix(in srgb, var(--editor-accent-soft, #ecfeff) 72%, transparent);
    color: var(--editor-accent, #06b6d4);
  }
}

.refresh-action {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #8f3f2f) 44%, transparent);
  background: var(--editor-layer-panel, var(--editor-bg-base, white));
  color: var(--editor-text-secondary, #5f4e40);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: var(--editor-layer-soft, var(--editor-bg-surface, #fffcf9));
    border-color: var(--editor-border-focus, #8f3f2f);
    color: var(--editor-accent, #8f3f2f);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px color-mix(in srgb, var(--editor-accent, #8f3f2f) 12%, transparent);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.structure-stage-controls__advanced {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.structure-stage-controls__tabs {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--editor-bg-surface, #f8fafc);
  border-radius: var(--editor-radius-lg, 8px);
  border: 1px solid var(--editor-border, #e2e8f0);
  margin: 0 4px;
}

.tabs-group {
  display: flex;
  gap: 2px;
  background: var(--editor-bg-elevated, #f1f5f9);
  padding: 4px;
  border-radius: var(--editor-radius-md, 6px);
  border: 1px solid var(--editor-border, #e2e8f0);
}

.stage-tab {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 20px;
  border-radius: var(--editor-radius-md, 6px);
  border: 1px solid transparent;
  background: transparent;
  color: var(--editor-text-muted, #64748b);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;

  .stage-tab__icon {
    opacity: 0.5;
    transition: all 0.25s;
    filter: grayscale(1);
    color: currentColor;
  }

  &:hover {
    color: var(--editor-text-secondary, #334155);
    background: var(--editor-bg-elevated, #f1f5f9);

    .stage-tab__icon {
      opacity: 0.8;
      filter: grayscale(0);
      transform: scale(1.1);
    }
  }

  &.is-active {
    background: var(--editor-layer-panel, var(--editor-bg-base, #ffffff));
    color: var(--editor-accent, #06b6d4);
    border-color: var(--editor-accent-soft-border, #a5f3fc);

    .stage-tab__icon {
      opacity: 1;
      filter: grayscale(0);
    }

    .stage-tab__label {
      font-weight: 700;
    }
  }
}

.structure-stage-controls__toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  gap: 16px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.toolbar-right {
  flex-shrink: 0;
}

.structure-search {
  position: relative;
  width: 260px;

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--editor-text-ghost, #a39589);
  }

  .structure-search__input {
    width: 100%;
    height: 36px;
    padding: 0 12px 0 38px;
    border-radius: 12px;
    border: 1px solid color-mix(in srgb, var(--editor-border, #8f3f2f) 42%, transparent);
    background: color-mix(in srgb, var(--editor-layer-panel, var(--editor-bg-base, #fff)) 88%, transparent);
    color: var(--editor-text-primary, #0f172a);
    font-size: 13px;
    outline: none;
    transition: all 0.2s;

    &:focus {
      background: var(--editor-bg-elevated, var(--editor-bg-base, white));
      border-color: var(--editor-border-focus, #8f3f2f);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--editor-accent, #8f3f2f) 12%, transparent);
    }
  }
}

.structure-filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.structure-filter-chip {
  padding: 6px 14px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: color-mix(in srgb, var(--editor-bg-elevated, #8f3f2f) 36%, transparent);
  color: var(--editor-text-secondary, #746b64);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: color-mix(in srgb, var(--editor-accent-soft, #8f3f2f) 42%, transparent);
  }

  &.is-active {
    background: var(--editor-accent-soft, rgba(143, 63, 47, 0.1));
    color: var(--editor-accent, #8f3f2f);
    border-color: var(--editor-accent-soft-border, rgba(143, 63, 47, 0.2));
  }
}

.structure-filter-select-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #8f3f2f) 42%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, var(--editor-bg-base, #fff)) 92%, transparent);
}

.structure-filter-select__label {
  font-size: 11px;
  font-weight: 700;
  color: var(--editor-text-muted, #8a7e74);
  text-transform: uppercase;
}

.structure-filter-select {
  border: none;
  background: transparent;
  color: var(--editor-text-secondary, #5f4e40);
  font-size: 12px;
  font-weight: 600;
  outline: none;
  cursor: pointer;
}

.mini-metrics {
  display: flex;
  gap: 20px;
  background: color-mix(in srgb, var(--editor-layer-glass, var(--editor-bg-base, #fff)) 92%, transparent);
  padding: 6px 16px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #8f3f2f) 32%, transparent);
}

.mini-metric {
  display: flex;
  flex-direction: column;
  line-height: 1.3;

  span {
    font-size: 10px;
    color: var(--editor-text-ghost, #a39589);
    font-weight: 700;
    text-transform: uppercase;
  }

  strong {
    font-size: 14px;
    color: var(--editor-text-primary, #4e443c);
    font-weight: 700;
  }

  &.highlight strong {
    color: var(--editor-accent, #8f3f2f);
  }
}

.structure-stage-controls__error-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border-radius: var(--editor-radius-lg, 8px);
  border: 1px solid color-mix(in srgb, var(--color-warning-700, #8f3f2f) 22%, transparent);
  background: color-mix(
    in srgb,
    var(--editor-layer-accent, var(--editor-accent-soft, #fff2e7)) 68%,
    transparent
  );

  h3,
  p {
    margin: 0;
  }

  h3 {
    margin-bottom: 6px;
    font-size: 14px;
    font-weight: 700;
    color: var(--editor-text-primary, #0f172a);
  }

  p:last-child {
    color: var(--editor-text-secondary, #5f4e40);
    font-size: 13px;
    line-height: 1.5;
  }
}

.structure-stage-controls__error-eyebrow {
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--editor-accent, #8f3f2f);
}

@media (max-width: 1024px) {
  .structure-stage-controls__header-main {
    flex-direction: column;
    align-items: stretch;
  }

  .structure-stage-controls__title-block {
    flex-direction: column;
    align-items: flex-start;
  }

  .structure-stage-controls__actions {
    flex-wrap: wrap;
  }

  .structure-stage-controls__tabs {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .tabs-group {
    justify-content: center;
  }
}
</style>
