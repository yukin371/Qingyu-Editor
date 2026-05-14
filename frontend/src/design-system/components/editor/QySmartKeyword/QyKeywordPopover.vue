<template>
  <div v-if="visible && keyword" class="qy-keyword-popover" :style="popoverStyle">
    <!-- 头部: 类型图标 + 名称 + 类型标签 -->
    <div class="popover-header">
      <span class="popover-type-icon">{{ getTypeIcon(keyword.type) }}</span>
      <span class="popover-name">{{ keyword.name }}</span>
      <span class="popover-type-badge">{{ keywordTypeLabel }}</span>
    </div>

    <!-- 简介 -->
    <p v-if="keyword.summary" class="popover-summary">{{ keyword.summary }}</p>
    <p v-else class="popover-summary popover-summary--empty">暂无简介</p>

    <!-- 关系列表（新增） -->
    <div v-if="displayRelations.length > 0" class="popover-relations">
      <p class="popover-section-title">关系</p>
      <ul class="relation-list">
        <li v-for="(rel, idx) in displayRelations" :key="idx" class="relation-item">
          <span class="relation-name">{{ rel.targetName }}</span>
          <span class="relation-type">{{ rel.type }}</span>
        </li>
      </ul>
    </div>

    <!-- 操作按钮 -->
    <div class="popover-actions">
      <button class="popover-btn popover-btn--primary" @click="emit('jump', keyword!)">编辑设定</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KeywordInfo, KeywordType } from './extensions/SmartKeyword'

interface RelationInfo {
  targetName: string
  type: string
  strength: number
}

const props = withDefaults(defineProps<{
  visible: boolean
  x: number
  y: number
  keyword: KeywordInfo | null
  relations?: RelationInfo[]
}>(), {
  relations: () => [],
})

const emit = defineEmits<{
  (e: 'jump', keyword: KeywordInfo): void
}>()

const popoverStyle = computed(() => ({
  left: `${props.x}px`,
  top: `${props.y}px`,
}))

const keywordTypeLabel = computed(() => {
  const labels: Record<string, string> = {
    character: '角色',
    location: '地点',
    item: '物品',
    concept: '概念',
    organization: '组织',
  }
  return labels[props.keyword?.type || ''] || '未知类型'
})

const displayRelations = computed(() => props.relations?.slice(0, 5) || [])

function getTypeIcon(type: KeywordType): string {
  const icons: Record<KeywordType, string> = {
    character: '👤',
    location: '📍',
    item: '🎁',
    concept: '💡',
    organization: '🏛️',
  }
  return icons[type] || '📝'
}
</script>

<style scoped>
.qy-keyword-popover {
  position: fixed;
  z-index: 4000;
  width: 280px;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
}

.popover-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.popover-type-icon {
  font-size: 18px;
}

.popover-name {
  font-weight: 700;
  font-size: 15px;
}

.popover-type-badge {
  color: #409eff;
  font-size: 11px;
  background: rgba(64, 158, 255, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
}

.popover-summary {
  color: #606266;
  font-size: 13px;
  margin: 0 0 10px;
}

.popover-summary--empty {
  color: #c0c4cc;
  font-style: italic;
}

.popover-relations {
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
  margin-bottom: 8px;
}

.popover-section-title {
  font-size: 12px;
  color: #909399;
  margin: 0 0 6px;
}

.relation-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.relation-item {
  display: flex;
  justify-content: space-between;
  padding: 3px 0;
  font-size: 13px;
}

.relation-name {
  color: #303133;
}

.relation-type {
  color: #409eff;
  font-size: 12px;
}

.popover-actions {
  display: flex;
  gap: 6px;
  margin-top: 10px;
}

.popover-btn {
  flex: 1;
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  background: white;
  font-size: 12px;
  border-radius: 4px;
  cursor: pointer;
  color: #606266;
}

.popover-btn--primary {
  background: #409eff;
  border-color: #409eff;
  color: white;
}
</style>
