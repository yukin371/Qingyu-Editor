<template>
  <div class="character-story-line">
    <!-- Header -->
    <div class="story-line-header">
      <div class="header-title">
        <span class="title-text">故事线视图</span>
        <el-tag size="small" type="info" class="scope-tag">{{ scopeLabel }}</el-tag>
      </div>
      <div class="header-stats">
        <span class="stat-item">角色 {{ visibleCharacters.length }}</span>
        <span class="stat-divider">|</span>
        <span class="stat-item">关系 {{ relations.length }}</span>
      </div>
    </div>

    <!-- Content -->
    <el-scrollbar class="story-line-content">
      <!-- Loading state -->
      <div v-if="loading" class="story-line-loading">
        <el-icon class="loading-icon is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>

      <!-- Empty state -->
      <Empty
        v-else-if="filteredChapters.length === 0"
        description="暂无章节数据"
        size="md"
      />

      <!-- Chapter list -->
      <div v-else class="chapter-list">
        <div
          v-for="chapter in filteredChapters"
          :key="chapter.id"
          class="chapter-section"
        >
          <!-- Chapter header (collapsible) -->
          <div
            class="chapter-header"
            :class="{ 'is-collapsed': collapsedChapters.has(chapter.id) }"
            @click="toggleChapter(chapter.id)"
          >
            <span class="collapse-icon">{{ collapsedChapters.has(chapter.id) ? '&#9654;' : '&#9660;' }}</span>
            <span class="chapter-title" :title="chapter.title">{{ chapter.title }}</span>
            <div class="chapter-meta">
              <span v-if="chapter.wordCount" class="word-count">{{ formatWordCount(chapter.wordCount) }}</span>
              <el-tag
                v-if="chapter.status"
                size="small"
                :type="statusTagType(chapter.status)"
                class="status-tag"
              >
                {{ statusLabel(chapter.status) }}
              </el-tag>
            </div>
            <div class="chapter-badges">
              <span v-if="getChapterCharacters(chapter.id).length > 0" class="badge character-badge">
                {{ getChapterCharacters(chapter.id).length }} 角色
              </span>
              <span v-if="getChapterRelations(chapter.id).length > 0" class="badge relation-badge">
                {{ getChapterRelations(chapter.id).length }} 关系
              </span>
            </div>
          </div>

          <!-- Chapter content (collapsible body) -->
          <transition name="collapse">
            <div v-show="!collapsedChapters.has(chapter.id)" class="chapter-body">
              <!-- Character appearances -->
              <div
                v-if="getChapterCharacters(chapter.id).length > 0"
                class="appearances-section"
              >
                <div
                  v-for="charInfo in getChapterCharacters(chapter.id)"
                  :key="charInfo.character.id"
                  class="appearance-item"
                >
                  <span class="character-icon">&#128100;</span>
                  <span class="character-name">{{ charInfo.character.name }}</span>
                  <el-tag
                    v-if="charInfo.isFirstAppearance"
                    type="success"
                    size="small"
                    class="first-appearance-tag"
                  >
                    首次登场
                  </el-tag>
                </div>
              </div>

              <!-- Relation changes -->
              <div
                v-if="getChapterRelations(chapter.id).length > 0"
                class="relations-section"
              >
                <div
                  v-for="rel in getChapterRelations(chapter.id)"
                  :key="rel.relation.id"
                  class="relation-item"
                >
                  <span class="relation-icon">&#8599;</span>
                  <span class="relation-text">
                    {{ rel.fromName }}
                    <span class="relation-dash">--</span>
                    {{ rel.toName }}
                    <span class="relation-arrow">-&gt;</span>
                    <el-tag size="small" :type="getRelationTagType(rel.relation.type)" class="relation-type-tag">
                      {{ rel.relation.type }}
                    </el-tag>
                    <span class="relation-strength">({{ rel.relation.strength }})</span>
                  </span>
                </div>
              </div>

              <!-- No data hint for this chapter -->
              <div
                v-if="getChapterCharacters(chapter.id).length === 0 && getChapterRelations(chapter.id).length === 0"
                class="chapter-empty"
              >
                暂无角色登场和关系信息
              </div>
            </div>
          </transition>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import type { OutlineNode, Character, CharacterRelation } from '@/types/writer'
import { Empty } from '@/design-system/base'

// Extended relation type that includes chapter-bound fields not in barrel export
interface StoryLineRelation extends CharacterRelation {
  validFromChapterId?: string
  validUntilChapterId?: string
}

interface CharacterAppearanceInfo {
  character: Character
  isFirstAppearance: boolean
}

interface RelationDisplayInfo {
  relation: StoryLineRelation
  fromName: string
  toName: string
}

const props = withDefaults(
  defineProps<{
    outlineTree: OutlineNode[]
    characters: Character[]
    relations: CharacterRelation[]
    scopeType: 'global' | 'volume' | 'chapter'
    scopeId?: string
    loading?: boolean
  }>(),
  {
    scopeId: '',
    loading: false,
  },
)

const emit = defineEmits<{
  (e: 'chapterClick', chapter: OutlineNode): void
}>()

// Collapsed state for chapters
const collapsedChapters = ref<Set<string>>(new Set())

// Name lookups
const characterMap = computed(() => {
  const map = new Map<string, Character>()
  for (const char of props.characters) {
    map.set(char.id, char)
  }
  return map
})

const outlineNodeMap = computed(() => {
  const map = new Map<string, OutlineNode>()
  const walk = (nodes: OutlineNode[]) => {
    for (const node of nodes) {
      map.set(node.id, node)
      if (node.children?.length) {
        walk(node.children)
      }
    }
  }
  walk(props.outlineTree)
  return map
})

// Scope label for header display
const scopeLabel = computed(() => {
  if (props.scopeType === 'global') return '全部'
  if (props.scopeType === 'volume') {
    const node = outlineNodeMap.value.get(props.scopeId)
    return node ? `卷: ${node.title}` : '卷'
  }
  if (props.scopeType === 'chapter') {
    const node = outlineNodeMap.value.get(props.scopeId)
    return node ? `章: ${node.title}` : '章节'
  }
  return ''
})

// Flatten the outline tree into a list of chapters based on scope
const filteredChapters = computed<OutlineNode[]>(() => {
  const walk = (nodes: OutlineNode[]): OutlineNode[] => {
    const result: OutlineNode[] = []
    for (const node of nodes) {
      if (props.scopeType === 'global') {
        // Global: collect all leaf-level nodes (chapters/scenes) across the entire tree
        if (node.children?.length) {
          result.push(...walk(node.children))
        } else {
          result.push(node)
        }
      } else if (props.scopeType === 'volume') {
        // Show children of the selected volume
        if (node.id === props.scopeId && node.children?.length) {
          result.push(...node.children)
        } else if (node.children?.length) {
          // Recurse to find volume
          result.push(...walk(node.children))
        }
      } else if (props.scopeType === 'chapter') {
        // Show only the selected chapter
        if (node.id === props.scopeId) {
          result.push(node)
        } else if (node.children?.length) {
          result.push(...walk(node.children))
        }
      }
    }
    return result
  }
  return walk(props.outlineTree)
})

// Cast relations to extended type for chapter-bound fields
const storyLineRelations = computed<StoryLineRelation[]>(() => {
  return props.relations as StoryLineRelation[]
})

// Build the set of character IDs that appear in any relation
const charactersInRelations = computed(() => {
  const ids = new Set<string>()
  for (const rel of storyLineRelations.value) {
    ids.add(rel.fromId)
    ids.add(rel.toId)
  }
  return ids
})

// Characters that are visible (participate in at least one relation)
const visibleCharacters = computed(() => {
  return props.characters.filter((char) => charactersInRelations.value.has(char.id))
})

// Build a map: chapterId -> Set of character IDs appearing in that chapter
const chapterCharacterMap = computed(() => {
  const map = new Map<string, Set<string>>()

  for (const rel of storyLineRelations.value) {
    if (!rel.validFromChapterId) continue

    const chapterId = rel.validFromChapterId
    if (!outlineNodeMap.value.has(chapterId)) continue

    if (!map.has(chapterId)) {
      map.set(chapterId, new Set<string>())
    }
    map.get(chapterId)!.add(rel.fromId)
    map.get(chapterId)!.add(rel.toId)
  }

  // Also propagate character presence forward: if a character appears in
  // chapter N, they should appear in all subsequent chapters until the relation
  // is terminated (validUntilChapterId).
  const sortedChapters = [...filteredChapters.value].sort((a, b) => a.order - b.order)

  for (let i = 0; i < sortedChapters.length; i++) {
    const currentId = sortedChapters[i].id
    if (map.has(currentId)) {
      // Propagate forward to later chapters
      for (let j = i + 1; j < sortedChapters.length; j++) {
        const laterId = sortedChapters[j].id
        if (!map.has(laterId)) {
          map.set(laterId, new Set<string>())
        }

        for (const charId of map.get(currentId)!) {
          // Check if any relation ending this character's presence has this later chapter as endpoint
          const hasTermination = storyLineRelations.value.some(
            (r) =>
              (r.fromId === charId || r.toId === charId) &&
              r.validUntilChapterId === laterId,
          )
          if (!hasTermination) {
            map.get(laterId)!.add(charId)
          }
        }
      }
    }
  }

  return map
})

// Build a map: chapterId -> list of relation display info
const chapterRelationMap = computed(() => {
  const map = new Map<string, RelationDisplayInfo[]>()

  for (const rel of storyLineRelations.value) {
    if (!rel.validFromChapterId) continue
    const chapterId = rel.validFromChapterId
    if (!outlineNodeMap.value.has(chapterId)) continue

    const fromChar = characterMap.value.get(rel.fromId)
    const toChar = characterMap.value.get(rel.toId)

    if (!map.has(chapterId)) {
      map.set(chapterId, [])
    }
    map.get(chapterId)!.push({
      relation: rel,
      fromName: fromChar?.name || '未知',
      toName: toChar?.name || '未知',
    })
  }

  return map
})

// Determine the first appearance chapter for each character
const firstAppearanceMap = computed(() => {
  const map = new Map<string, string>() // characterId -> chapterId

  for (const [chapterId, charIds] of chapterCharacterMap.value) {
    const chapter = outlineNodeMap.value.get(chapterId)
    if (!chapter) continue

    for (const charId of charIds) {
      if (!map.has(charId)) {
        map.set(charId, chapterId)
      } else {
        // Keep the one with lower order (earlier chapter)
        const existingChapter = outlineNodeMap.value.get(map.get(charId)!)
        if (existingChapter && chapter.order < existingChapter.order) {
          map.set(charId, chapterId)
        }
      }
    }
  }

  return map
})

// Get character appearances for a specific chapter
function getChapterCharacters(chapterId: string): CharacterAppearanceInfo[] {
  const charIds = chapterCharacterMap.value.get(chapterId)
  if (!charIds || charIds.size === 0) return []

  const result: CharacterAppearanceInfo[] = []
  for (const charId of charIds) {
    const character = characterMap.value.get(charId)
    if (!character) continue

    result.push({
      character,
      isFirstAppearance: firstAppearanceMap.value.get(charId) === chapterId,
    })
  }

  // Sort by name
  result.sort((a, b) => a.character.name.localeCompare(b.character.name, 'zh-CN'))
  return result
}

// Get relation changes for a specific chapter
function getChapterRelations(chapterId: string): RelationDisplayInfo[] {
  return chapterRelationMap.value.get(chapterId) || []
}

// Toggle chapter collapse
function toggleChapter(chapterId: string) {
  if (collapsedChapters.value.has(chapterId)) {
    collapsedChapters.value.delete(chapterId)
  } else {
    collapsedChapters.value.add(chapterId)
  }
  // Trigger reactivity
  collapsedChapters.value = new Set(collapsedChapters.value)
}

// Format word count display
function formatWordCount(count: number): string {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万字`
  }
  return `${count}字`
}

// Status tag type mapping
function statusTagType(status: string): 'info' | 'success' | 'warning' | 'danger' {
  const map: Record<string, 'info' | 'success' | 'warning' | 'danger'> = {
    draft: 'info',
    writing: 'warning',
    completed: 'success',
    reviewing: 'info',
  }
  return map[status] || 'info'
}

// Status label mapping
function statusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: '草稿',
    writing: '写作中',
    completed: '已完成',
    reviewing: '审核中',
  }
  return map[status] || status
}

// Relation tag type for coloring
function getRelationTagType(type: string): 'success' | 'info' | 'warning' | 'danger' {
  const typeMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
    '朋友': 'success',
    '家庭': 'info',
    '恋人': 'danger',
    '盟友': 'success',
    '敌人': 'warning',
    '其他': 'info',
  }
  return typeMap[type] || 'info'
}
</script>

<style scoped>
.character-story-line {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f9fafb;
}

/* Header */
.story-line-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-text {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.scope-tag {
  font-size: 11px;
}

.header-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-item {
  font-size: 12px;
  color: #909399;
}

.stat-divider {
  color: #dcdfe6;
}

/* Content */
.story-line-content {
  flex: 1;
  padding: 12px;
}

/* Loading */
.story-line-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #909399;
  gap: 12px;
}

.loading-icon {
  font-size: 24px;
}

/* Chapter list */
.chapter-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Chapter section */
.chapter-section {
  background: #ffffff;
  border: 1px solid #e6ebf5;
  border-radius: 8px;
  overflow: hidden;
}

/* Chapter header */
.chapter-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
  flex-wrap: wrap;
}

.chapter-header:hover {
  background-color: #f5f7fa;
}

.chapter-header.is-collapsed {
  border-bottom: none;
}

.collapse-icon {
  font-size: 10px;
  color: #909399;
  flex-shrink: 0;
  width: 14px;
  text-align: center;
}

.chapter-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chapter-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.word-count {
  font-size: 11px;
  color: #909399;
  background: #f1f4fa;
  border-radius: 999px;
  padding: 2px 8px;
}

.status-tag {
  font-size: 11px;
}

.chapter-badges {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  line-height: 1.4;
}

.character-badge {
  color: #3f6fe8;
  background: #eef2ff;
}

.relation-badge {
  color: #11a683;
  background: #e8f7ef;
}

/* Chapter body */
.chapter-body {
  padding: 6px 14px 12px 36px;
  border-top: 1px solid #f0f2f5;
}

/* Appearances section */
.appearances-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.appearances-section:not(:last-child) {
  margin-bottom: 10px;
}

.appearance-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
}

.character-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.character-name {
  font-size: 13px;
  color: #303133;
}

.first-appearance-tag {
  font-size: 11px;
}

/* Relations section */
.relations-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.relation-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 4px 0;
}

.relation-icon {
  font-size: 14px;
  flex-shrink: 0;
  color: #909399;
  margin-top: 1px;
}

.relation-text {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}

.relation-dash {
  margin: 0 4px;
  color: #c0c4cc;
}

.relation-arrow {
  margin: 0 2px;
  color: #c0c4cc;
}

.relation-type-tag {
  font-size: 11px;
  margin: 0 2px;
}

.relation-strength {
  font-size: 12px;
  color: #909399;
  margin-left: 2px;
}

/* Chapter empty hint */
.chapter-empty {
  padding: 12px 0;
  font-size: 12px;
  color: #c0c4cc;
  text-align: center;
}

/* Collapse transition */
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 500px;
}

/* Responsive */
@media (max-width: 768px) {
  .story-line-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .chapter-header {
    padding: 8px 10px;
  }

  .chapter-body {
    padding-left: 28px;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .character-story-line {
    background: #0d0d0d;
  }

  .story-line-header {
    background: #1a1a1a;
    border-bottom-color: #2d2d2d;
  }

  .title-text {
    color: #e5e5e5;
  }

  .stat-item {
    color: #909399;
  }

  .chapter-section {
    background: #1a1a1a;
    border-color: #2d2d2d;
  }

  .chapter-header:hover {
    background-color: #222222;
  }

  .chapter-title {
    color: #e5e5e5;
  }

  .word-count {
    color: #909399;
    background: #2d2d2d;
  }

  .chapter-body {
    border-top-color: #2d2d2d;
  }

  .character-name {
    color: #e5e5e5;
  }

  .relation-text {
    color: #c0c4cc;
  }

  .collapse-icon {
    color: #606266;
  }

  .chapter-empty {
    color: #4b5563;
  }
}
</style>
