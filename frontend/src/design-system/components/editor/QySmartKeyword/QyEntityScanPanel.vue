<template>
  <div class="entity-scan-panel">
    <header class="panel-header">
      <div class="header-content">
        <span class="header-icon">📝</span>
        <span class="header-title">发现新实体</span>
        <span v-if="entities.length > 0" class="entity-count">{{ entities.length }}</span>
      </div>
      <div v-if="entities.length > 0" class="header-actions">
        <button class="action-btn" @click="$emit('ignoreAll')">全部忽略</button>
      </div>
    </header>

    <div v-if="isScanning" class="scanning-indicator">
      <span class="spinner"></span>
      <span>扫描中...</span>
    </div>

    <div v-else-if="entities.length === 0" class="empty-state">
      <span class="empty-icon">✨</span>
      <p>暂未发现新实体</p>
      <p class="empty-hint">输入 @角色 试试</p>
    </div>

    <ul v-else class="entity-list">
      <li
        v-for="entity in entities"
        :key="entity.name"
        class="entity-item"
      >
        <div class="entity-info">
          <span class="entity-icon">{{ getTypeIcon(entity.type) }}</span>
          <div class="entity-details">
            <span class="entity-name">{{ entity.name }}</span>
            <span class="entity-context">{{ entity.firstAppearance.text }}</span>
          </div>
        </div>
        <div class="entity-actions">
          <button class="create-btn" @click="$emit('create', entity)">建档</button>
          <button class="ignore-btn" @click="$emit('ignore', entity)">忽略</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { KeywordType } from './extensions/SmartKeyword'

export interface ScannedEntity {
  name: string
  type: KeywordType
  firstAppearance: {
    paragraphIndex: number
    text: string
  }
}

const props = defineProps<{
  entities: ScannedEntity[]
  isScanning: boolean
}>()

defineEmits<{
  (e: 'create', entity: ScannedEntity): void
  (e: 'ignore', entity: ScannedEntity): void
  (e: 'ignoreAll'): void
}>()

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
.entity-scan-panel {
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 16px;
}

.header-title {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.entity-count {
  background: #3b82f6;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
}

.action-btn {
  font-size: 12px;
  color: #6b7280;
  background: transparent;
  border: none;
  cursor: pointer;
}

.action-btn:hover {
  color: #374151;
}

.scanning-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: #6b7280;
  font-size: 13px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  padding: 24px;
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  font-size: 24px;
  display: block;
  margin-bottom: 8px;
}

.empty-state p {
  margin: 0;
  font-size: 13px;
}

.empty-hint {
  margin-top: 4px !important;
  font-size: 12px !important;
  color: #9ca3af;
}

.entity-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 300px;
  overflow-y: auto;
}

.entity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s;
}

.entity-item:hover {
  background: #f9fafb;
}

.entity-info {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
}

.entity-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.entity-details {
  min-width: 0;
}

.entity-name {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #111827;
}

.entity-context {
  display: block;
  font-size: 11px;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}

.entity-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.create-btn,
.ignore-btn {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.create-btn {
  background: #3b82f6;
  color: white;
  border: none;
}

.create-btn:hover {
  background: #2563eb;
}

.ignore-btn {
  background: transparent;
  color: #9ca3af;
  border: 1px solid #e5e7eb;
}

.ignore-btn:hover {
  background: #f3f4f6;
  color: #6b7280;
}
</style>
