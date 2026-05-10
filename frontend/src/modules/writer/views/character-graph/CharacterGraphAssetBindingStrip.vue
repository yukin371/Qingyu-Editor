<template>
  <section class="asset-binding-strip" data-testid="asset-binding-strip">
    <article class="asset-binding-card">
      <div class="asset-binding-card__header">
        <div>
          <h4>已绑定资产</h4>
        </div>
        <div class="asset-binding-card__actions">
          <QyButton variant="text" size="sm" @click="$emit('toggle-bound-panel')">
            {{ showBoundAssetsPanel ? '收起' : '展开' }}
          </QyButton>
          <QyButton
            variant="text"
            size="sm"
            :disabled="scopeBindableCharactersCount === 0"
            @click="$emit('bind-existing-characters')"
          >
            绑定角色卡 {{ scopeBindableCharactersCount }}
          </QyButton>
        </div>
      </div>
      <div class="asset-binding-card__summary">
        <span>{{ currentScopeType === 'volume' ? '卷级出场池' : '当前章节可见角色池' }}</span>
        <span>已绑定 {{ boundScopeAssetRefs.length }}</span>
        <span>可补绑 {{ scopeBindableCharactersCount }}</span>
      </div>
      <div
        v-if="showBoundAssetsPanel && boundScopeAssetRefs.length > 0"
        class="asset-binding-chip-list"
      >
        <div
          v-for="asset in boundScopeAssetRefs"
          :key="asset.id"
          class="asset-binding-chip"
          :class="`is-${asset.assetType}`"
        >
          <div class="asset-binding-chip__meta">
            <span class="asset-binding-chip__type">{{ formatAssetType(asset.assetType) }}</span>
            <strong>{{ asset.assetName }}</strong>
            <span
              v-if="asset.scopeType === 'chapter' && currentScopeType === 'chapter'"
              class="asset-binding-chip__source"
            >
              {{ formatAssetSource(asset.source) }}
            </span>
            <span
              v-else-if="asset.scopeType === 'volume' && currentScopeType === 'chapter'"
              class="asset-binding-chip__source"
            >
              卷级继承
            </span>
          </div>
          <QyButton
            v-if="asset.scopeType === currentScopeType"
            variant="text"
            size="sm"
            @click="$emit('remove-bound-asset', asset)"
          >
            移除
          </QyButton>
        </div>
      </div>
      <div v-else-if="showBoundAssetsPanel" class="asset-binding-empty">
        当前{{ currentScopeType === 'volume' ? '卷' : '章节' }}还没有确认过资产，可先从正文候选中绑定。
      </div>
    </article>

    <article class="asset-binding-card">
      <div class="asset-binding-card__header">
        <div>
          <h4>{{ currentScopeType === 'volume' ? '卷候选资产' : '章节候选资产' }}</h4>
        </div>
        <div class="asset-binding-card__actions">
          <QyButton variant="text" size="sm" @click="$emit('toggle-candidate-panel')">
            {{ showCandidatePanel ? '收起' : '展开' }}
          </QyButton>
          <QyTag size="sm" :type="currentScopeType === 'volume' ? 'warning' : 'success'">
            {{ scopeAssetCandidates.length }}
          </QyTag>
          <QyButton
            variant="text"
            size="sm"
            :disabled="bindableScopeAssetCandidates.length === 0 || bindingAllCandidates"
            @click="$emit('bind-all-candidates')"
          >
            {{
              bindingAllCandidates
                ? '绑定中...'
                : `全部绑定已建档 ${bindableScopeAssetCandidates.length}`
            }}
          </QyButton>
        </div>
      </div>
      <div class="asset-binding-card__summary">
        <span>{{ currentScopeType === 'volume' ? '由章节确认资产自动汇总' : '从当前正文自动识别' }}</span>
        <span>可绑定 {{ bindableScopeAssetCandidates.length }}</span>
        <span>待建档 {{ unresolvedScopeAssetCandidates.length }}</span>
      </div>
      <div
        v-if="showCandidatePanel && scopeAssetCandidates.length > 0"
        class="asset-binding-chip-list"
      >
        <div
          v-for="candidate in scopeAssetCandidates"
          :key="candidate.key"
          class="asset-binding-chip"
          :class="`is-${candidate.assetType}`"
        >
          <div class="asset-binding-chip__meta">
            <span class="asset-binding-chip__type">{{ formatAssetType(candidate.assetType) }}</span>
            <strong>{{ candidate.assetName }}</strong>
            <span class="asset-binding-chip__source">{{ formatAssetSource(candidate.source) }}</span>
            <span v-if="candidate.unresolved" class="asset-binding-chip__status is-unresolved">
              待建档
            </span>
            <span v-else class="asset-binding-chip__status">已匹配</span>
            <span v-if="candidate.evidence" class="asset-binding-chip__evidence">
              命中：{{ candidate.evidence }}
            </span>
          </div>
          <QyButton
            variant="text"
            size="sm"
            :disabled="bindingAllCandidates"
            @click="
              candidate.unresolved
                ? $emit('create-and-bind-candidate', candidate)
                : $emit('bind-candidate', candidate)
            "
          >
            {{ candidate.unresolved ? '建档并绑定' : '绑定' }}
          </QyButton>
        </div>
      </div>
      <div v-else-if="showCandidatePanel" class="asset-binding-empty">
        {{
          currentScopeType === 'volume'
            ? '先在本卷章节里确认角色、地点、物件或概念资产，这里才会出现可提升的卷级候选。'
            : chapterCandidateHint
        }}
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { QyButton, QyTag } from '@/design-system/components'
import type { WriterAssetCandidate, WriterAssetRef } from '../../utils/writerAssetRefs'

defineProps<{
  currentScopeType: 'volume' | 'chapter'
  showBoundAssetsPanel: boolean
  showCandidatePanel: boolean
  scopeBindableCharactersCount: number
  boundScopeAssetRefs: WriterAssetRef[]
  scopeAssetCandidates: WriterAssetCandidate[]
  bindableScopeAssetCandidates: WriterAssetCandidate[]
  unresolvedScopeAssetCandidates: WriterAssetCandidate[]
  bindingAllCandidates: boolean
  chapterCandidateHint: string
  formatAssetType: (assetType: WriterAssetRef['assetType']) => string
  formatAssetSource: (source: WriterAssetRef['source']) => string
}>()

defineEmits<{
  (e: 'toggle-bound-panel'): void
  (e: 'toggle-candidate-panel'): void
  (e: 'bind-existing-characters'): void
  (e: 'bind-all-candidates'): void
  (e: 'remove-bound-asset', asset: WriterAssetRef): void
  (e: 'create-and-bind-candidate', candidate: WriterAssetCandidate): void
  (e: 'bind-candidate', candidate: WriterAssetCandidate): void
}>()
</script>

<style scoped lang="scss">
.asset-binding-strip {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 8px;
}

.asset-binding-card {
  border: 1px solid var(--editor-border);
  border-radius: 12px;
  padding: 8px 10px;
  background: var(--editor-bg-elevated);
  box-shadow: none;
}

.asset-binding-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  h4 {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--editor-text-primary);
  }
}

.asset-binding-card__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 4px;
}

.asset-binding-card__summary {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;

  span {
    font-size: 11px;
    color: var(--editor-text-secondary);
    background: var(--editor-bg-surface);
    border-radius: 999px;
    padding: 3px 8px;
    line-height: 1.4;
  }
}

.asset-binding-chip-list {
  display: grid;
  gap: 6px;
  margin-top: 8px;
  max-height: 128px;
  overflow: auto;
}

.asset-binding-chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-radius: 10px;
  padding: 7px 9px;
  border: 1px solid var(--editor-border);
  background: var(--editor-bg-base);
}

.asset-binding-chip.is-character {
  border-left: 3px solid var(--editor-accent);
}

.asset-binding-chip.is-location {
  border-left: 3px solid #11a683;
}

.asset-binding-chip.is-item {
  border-left: 3px solid #cf7a28;
}

.asset-binding-chip.is-organization {
  border-left: 3px solid #7c3aed;
}

.asset-binding-chip.is-concept {
  border-left: 3px solid #2563eb;
}

.asset-binding-chip__meta {
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;

  strong {
    color: var(--editor-text-primary);
    font-size: 13px;
  }
}

.asset-binding-chip__type,
.asset-binding-chip__source {
  font-size: 11px;
  line-height: 1;
  color: var(--editor-text-secondary);
  background: var(--editor-bg-surface);
  border-radius: 999px;
  padding: 4px 7px;
}

.asset-binding-chip__status {
  font-size: 11px;
  line-height: 1;
  color: #1f6a43;
  background: #e8f7ef;
  border-radius: 999px;
  padding: 4px 7px;
}

.asset-binding-chip__status.is-unresolved {
  color: #9a5a15;
  background: #fff4df;
}

.asset-binding-chip__evidence {
  width: 100%;
  margin: 0;
  font-size: 11px;
  color: var(--editor-text-secondary);
}

.asset-binding-empty {
  margin-top: 8px;
  border-radius: 10px;
  padding: 10px;
  border: 1px dashed var(--editor-border);
  background: var(--editor-bg-elevated);
  color: var(--editor-text-secondary);
  font-size: 11px;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .asset-binding-strip {
    grid-template-columns: 1fr;
  }
}
</style>
