<template>
  <section class="structure-stage-view__branch-ribbon">
    <div class="structure-stage-view__branch-ribbon-header">
      <h3>分叉总览</h3>
    </div>

    <div v-if="branchSpotlights.length" class="structure-stage-view__branch-cards">
      <button
        v-for="branch in branchSpotlights"
        :key="branch.id"
        type="button"
        class="structure-branch-card"
        :class="{ 'is-selected': selectedNodeId === branch.id }"
        @click="emit('select-node', branch.node)"
      >
        <span class="structure-branch-card__level">L{{ branch.level }}</span>
        <strong class="structure-branch-card__title">{{ branch.title }}</strong>
        <span class="structure-branch-card__meta">
          <span>{{ branch.branchCount }} 条分叉</span>
          <span>上支 {{ branch.topCount }}</span>
          <span>下支 {{ branch.bottomCount }}</span>
        </span>
        <span class="structure-branch-card__chips">
          <span class="structure-branch-card__chip">{{ branch.bindingLabel }}</span>
          <span class="structure-branch-card__chip" :class="`is-${branch.graphTone}`">
            {{ branch.graphLabel }}
          </span>
          <span v-if="branch.assetLabel" class="structure-branch-card__chip">{{ branch.assetLabel }}</span>
        </span>
      </button>
    </div>
    <div v-else class="structure-stage-view__branch-empty">
      {{
        isOutlineLoading
          ? '正在编排主干与分叉摘要…'
          : '还没有主干节点，先创建主线后再展开分叉。'
      }}
    </div>
  </section>
</template>

<script setup lang="ts">
import type { OutlineNode } from '@/types/writer'
import type { BranchSpotlight } from './structureStage.types'

defineProps<{
  branchSpotlights: BranchSpotlight[]
  selectedNodeId: string
  isOutlineLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'select-node', node: OutlineNode): void
}>()
</script>

<style scoped lang="scss">
.structure-stage-view__branch-ribbon {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--editor-bg-base, #ffffff);
  border-radius: var(--editor-radius-lg, 8px);
  border: 1px solid var(--editor-border, #e2e8f0);
  overflow: hidden;
  padding: 24px;
}

.structure-stage-view__branch-ribbon-header {
  margin-bottom: 24px;
  flex-shrink: 0;
}

.structure-stage-view__branch-ribbon-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--editor-text-primary, #2e2b27);
}

.structure-stage-view__branch-cards {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  padding: 4px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--editor-accent, #8f3f2f) 16%, transparent);
    border-radius: 4px;
  }
}

.structure-branch-card {
  padding: 20px;
  border-radius: 18px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #8f3f2f) 36%, transparent);
  background: var(--editor-bg-base, white);
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
  cursor: pointer;
  transition: all 0.25s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 32px color-mix(in srgb, var(--editor-accent, #8f3f2f) 16%, transparent);
    border-color: var(--editor-border-focus, rgba(143, 63, 47, 0.2));
  }

  &.is-selected {
    background: color-mix(in srgb, var(--editor-accent-soft, rgba(143, 63, 47, 0.03)) 56%, transparent);
    border-color: var(--editor-accent, #8f3f2f);
    box-shadow: 0 8px 24px color-mix(in srgb, var(--editor-accent, #8f3f2f) 18%, transparent);
  }
}

.structure-branch-card__level {
  display: inline-flex;
  width: fit-content;
  padding: 4px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-info-100, #32536a) 36%, transparent);
  color: var(--color-info-700, #32536a);
  font-size: 11px;
  font-weight: 800;
}

.structure-branch-card__title {
  color: var(--editor-text-primary, #2b2926);
  font-size: 17px;
  font-weight: 700;
  line-height: 1.35;
}

.structure-branch-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  span {
    font-size: 12px;
    color: var(--editor-text-secondary, #6f6257);
    background: color-mix(in srgb, var(--editor-bg-surface, #f5efe7) 88%, transparent);
    border-radius: 999px;
    padding: 4px 10px;
  }
}

.structure-branch-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.structure-branch-card__chip {
  font-size: 11px;
  color: var(--editor-text-secondary, #65574d);
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #755d43) 28%, transparent);
  background: color-mix(in srgb, var(--editor-bg-base, #fffbf7) 88%, transparent);
  padding: 4px 10px;
}

.structure-branch-card__chip.is-ready {
  color: var(--color-success-700, #1f6a43);
  background: color-mix(in srgb, var(--color-success-50, #eaf7ef) 92%, transparent);
  border-color: color-mix(in srgb, var(--color-success-700, #1f6a43) 18%, transparent);
}

.structure-branch-card__chip.is-inherit {
  color: var(--color-info-700, #32536a);
  background: color-mix(in srgb, var(--color-info-50, #eaf1f6) 92%, transparent);
  border-color: color-mix(in srgb, var(--color-info-700, #32536a) 18%, transparent);
}

.structure-branch-card__chip.is-missing {
  color: var(--color-warning-800, #8f3f2f);
  background: color-mix(in srgb, var(--color-warning-50, #fff2e7) 92%, transparent);
  border-color: color-mix(in srgb, var(--color-warning-700, #8f3f2f) 18%, transparent);
}

.structure-stage-view__branch-empty {
  border-radius: 18px;
  border: 2px dashed color-mix(in srgb, var(--editor-border, #8f3f2f) 42%, transparent);
  background: color-mix(in srgb, var(--editor-bg-surface, #fffbf7) 60%, transparent);
  padding: 32px;
  color: var(--editor-text-muted, #8a7e74);
  font-size: 15px;
  text-align: center;
}
</style>
