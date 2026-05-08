<template>
  <div class="entity-trace-panel">
    <!-- Header -->
    <div class="trace-header">
      <span class="trace-header__icon">&#128214;</span>
      <span class="trace-header__title">故事线追溯</span>
      <el-tag size="small" type="info" class="trace-header__tag">{{ entityLabel }}</el-tag>
    </div>

    <div class="trace-divider"></div>

    <!-- Non-character entity types: no trace data yet -->
    <div v-if="entityType !== 'character'" class="trace-empty">
      <p class="trace-empty__text">{{ emptyMessage }}</p>
    </div>

    <!-- Character entity type: show appearances and relations -->
    <template v-else>
      <!-- Appearances Section -->
      <div class="trace-section">
        <h4 class="trace-section__title">
          登场记录
          <el-tag size="small" type="primary" round>{{ appearances.length }}</el-tag>
        </h4>

        <div v-if="appearances.length === 0" class="trace-empty">
          <p class="trace-empty__text">暂无登场记录，该角色尚未在章节中建立关系</p>
        </div>

        <div v-else class="trace-tree">
          <div
            v-for="(item, index) in appearances"
            :key="item.outlineNodeId"
            class="trace-tree__item"
          >
            <span class="trace-tree__line">{{ treeLineChar(index, appearances.length) }}</span>
            <div class="trace-tree__content">
              <span class="trace-tree__title">{{ item.outlineNodeTitle }}</span>
              <div class="trace-tree__meta">
                <el-tag v-if="item.isFirst" size="small" type="warning" class="trace-tree__badge">
                  &#11088; 首次登场
                </el-tag>
                <span class="trace-tree__relation-count">{{ item.relationCount }}段关系</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Relation Changes Section -->
      <div v-if="relationChanges.length > 0" class="trace-section">
        <h4 class="trace-section__title">
          关系变化
          <el-tag size="small" type="success" round>{{ relationChanges.length }}</el-tag>
        </h4>

        <div class="trace-tree">
          <div
            v-for="(item, index) in relationChanges"
            :key="`${item.chapterId}-${item.otherCharacterId}`"
            class="trace-tree__item"
          >
            <span class="trace-tree__line">{{ treeLineChar(index, relationChanges.length) }}</span>
            <div class="trace-tree__content">
              <span class="trace-tree__title">{{ item.chapterTitle }}：与{{ item.otherCharacterName }}建立{{ item.relationType }}关系</span>
              <div class="trace-tree__meta">
                <span class="trace-tree__strength">强度: {{ item.strength }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
/**
 * EntityTracePanel - 实体故事线追溯面板
 *
 * 嵌入在 EncyclopediaView 的详情区域中，
 * 展示实体（角色/地点/物品/概念）在故事各章节中的出场和关系变化。
 *
 * 当前仅支持角色类型的追溯（基于 CharacterRelation 数据），
 * 其他实体类型暂显示空状态提示。
 */

import { computed } from 'vue'
import type { OutlineNode } from '@/types/writer'
import type { CharacterRelation } from '@/modules/writer/types/character'

// ============================================
// Types
// ============================================

type EntityType = 'character' | 'location' | 'item' | 'concept'

interface TraceAppearance {
  outlineNodeId: string
  outlineNodeTitle: string
  order: number
  isFirst: boolean
  relationCount: number
}

interface RelationChange {
  chapterId: string
  chapterTitle: string
  otherCharacterId: string
  otherCharacterName: string
  relationType: string
  strength: number
}

// ============================================
// Props
// ============================================

const props = defineProps<{
  entityId: string
  entityName: string
  entityType: EntityType
  outlineTree: OutlineNode[]
  relations: (CharacterRelation | { id: string; fromId: string; toId: string; type: string; strength: number; validFromChapterId?: string; validUntilChapterId?: string; notes?: string })[]
  allCharacters: { id: string; name: string }[]
}>()

// ============================================
// Computed
// ============================================

/** Build a flat map of outline nodes keyed by id */
const outlineNodeMap = computed(() => {
  const map = new Map<string, OutlineNode>()

  function flatten(nodes: OutlineNode[]) {
    for (const node of nodes) {
      map.set(node.id, node)
      if (node.children && node.children.length > 0) {
        flatten(node.children)
      }
    }
  }

  flatten(props.outlineTree)
  return map
})

/** Build a lookup map for character names */
const characterNameMap = computed(() => {
  const map = new Map<string, string>()
  for (const char of props.allCharacters) {
    map.set(char.id, char.name)
  }
  return map
})

/** Filter relations involving this entity (only relevant for character type) */
const entityRelations = computed(() => {
  if (props.entityType !== 'character') return []
  return props.relations.filter(
    (r) => r.fromId === props.entityId || r.toId === props.entityId,
  )
})

/**
 * Derive appearance records from relations.
 * Each unique validFromChapterId becomes an appearance entry.
 */
const appearances = computed<TraceAppearance[]>(() => {
  const rels = entityRelations.value
  if (rels.length === 0) return []

  // Group by validFromChapterId
  const chapterGroups = new Map<string, typeof props.relations[number][]>()

  for (const rel of rels) {
    const chapterId = rel.validFromChapterId
    if (!chapterId) continue

    const group = chapterGroups.get(chapterId) || []
    group.push(rel)
    chapterGroups.set(chapterId, group)
  }

  // Build appearance entries sorted by outline node order
  const entries: TraceAppearance[] = []

  for (const [chapterId, groupRels] of chapterGroups) {
    const node = outlineNodeMap.value.get(chapterId)
    if (!node) continue

    entries.push({
      outlineNodeId: chapterId,
      outlineNodeTitle: node.title,
      order: node.order,
      isFirst: false, // will be set below
      relationCount: groupRels.length,
    })
  }

  // Sort by order
  entries.sort((a, b) => a.order - b.order)

  // Mark the first entry as first appearance
  if (entries.length > 0) {
    entries[0].isFirst = true
  }

  return entries
})

/**
 * Derive relation changes grouped by chapter.
 * Shows which other characters the entity has relations with and when.
 */
const relationChanges = computed<RelationChange[]>(() => {
  const rels = entityRelations.value
  if (rels.length === 0) return []

  const changes: RelationChange[] = []

  for (const rel of rels) {
    const chapterId = rel.validFromChapterId
    if (!chapterId) continue

    const node = outlineNodeMap.value.get(chapterId)
    if (!node) continue

    // Determine the other character
    const otherId = rel.fromId === props.entityId ? rel.toId : rel.fromId
    const otherName = characterNameMap.value.get(otherId) || '未知角色'

    changes.push({
      chapterId,
      chapterTitle: node.title,
      otherCharacterId: otherId,
      otherCharacterName: otherName,
      relationType: rel.type,
      strength: rel.strength,
    })
  }

  // Sort by chapter order
  changes.sort((a, b) => {
    const nodeA = outlineNodeMap.value.get(a.chapterId)
    const nodeB = outlineNodeMap.value.get(b.chapterId)
    return (nodeA?.order ?? 0) - (nodeB?.order ?? 0)
  })

  return changes
})

/** Entity type display label */
const entityLabel = computed(() => {
  const labels: Record<EntityType, string> = {
    character: '角色',
    location: '地点',
    item: '物品',
    concept: '概念',
  }
  return labels[props.entityType] || props.entityType
})

/** Empty state message for non-character types */
const emptyMessage = computed(() => {
  const messages: Record<EntityType, string> = {
    location: '暂无追溯数据，地点的章节关联功能尚未开放',
    item: '暂无追溯数据，物品的章节关联功能尚未开放',
    concept: '暂无追溯数据，概念的章节关联功能尚未开放',
    character: '暂无追溯数据',
  }
  return messages[props.entityType] || '暂无追溯数据'
})

// ============================================
// Helpers
// ============================================

/**
 * Return tree-line character for visual indentation.
 * Last item uses the corner (└─), others use the tee (├─).
 */
function treeLineChar(index: number, total: number): string {
  return index === total - 1 ? '└─' : '├─'
}
</script>

<style scoped>
.entity-trace-panel {
  padding: 12px 16px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text-primary, #cccccc);
}

.trace-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.trace-header__icon {
  font-size: 16px;
}

.trace-header__title {
  font-weight: 600;
  font-size: 14px;
}

.trace-header__tag {
  margin-left: auto;
}

.trace-divider {
  height: 1px;
  background: var(--color-border, #3c3c3c);
  margin: 10px 0;
}

.trace-section {
  margin-bottom: 14px;
}

.trace-section:last-child {
  margin-bottom: 0;
}

.trace-section__title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary, #858585);
}

.trace-empty {
  padding: 12px 0;
}

.trace-empty__text {
  margin: 0;
  color: var(--color-text-tertiary, #6a6a6a);
  font-size: 12px;
}

.trace-tree {
  /* container for tree items */
}

.trace-tree__item {
  display: flex;
  align-items: flex-start;
  padding: 4px 0;
}

.trace-tree__line {
  flex-shrink: 0;
  width: 32px;
  color: var(--color-text-tertiary, #6a6a6a);
  font-family: monospace;
  font-size: 13px;
  user-select: none;
  line-height: 1.8;
}

.trace-tree__content {
  flex: 1;
  min-width: 0;
}

.trace-tree__title {
  display: block;
  font-size: 13px;
  color: var(--color-text-primary, #cccccc);
  word-break: break-all;
}

.trace-tree__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

.trace-tree__badge {
  flex-shrink: 0;
}

.trace-tree__relation-count,
.trace-tree__strength {
  font-size: 12px;
  color: var(--color-text-tertiary, #6a6a6a);
}
</style>
