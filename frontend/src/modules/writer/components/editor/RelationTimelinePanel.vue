<template>
  <div class="relation-timeline-panel">
    <header class="panel-header">
      <h4>{{ fromName }} 与 {{ toName }} 的关系</h4>
      <button class="close-btn" @click="$emit('close')">×</button>
    </header>

    <div class="panel-body">
      <!-- 当前关系状态 -->
      <div class="current-state">
        <div class="state-row">
          <span class="state-label">当前关系</span>
          <span class="state-value type-badge" :style="{ background: getTypeColor(currentSnapshot?.type) }">
            {{ currentSnapshot?.type || '未定义' }}
          </span>
        </div>
        <div class="state-row">
          <span class="state-label">强度</span>
          <div class="strength-bar">
            <div class="strength-fill" :style="{ width: `${currentSnapshot?.strength || 0}%` }"></div>
          </div>
          <span class="strength-value">{{ currentSnapshot?.strength || 0 }}%</span>
        </div>
        <div class="state-row">
          <span class="state-label">生效章节</span>
          <span class="state-value">{{ currentSnapshot?.chapterTitle || '全局生效' }}</span>
        </div>
      </div>

      <!-- 时序历史 -->
      <div v-if="timelineEvents && timelineEvents.length > 0" class="timeline-history">
        <h5>📖 时序历史</h5>
        <ul class="timeline-list">
          <li
            v-for="(event, index) in timelineEvents"
            :key="index"
            class="timeline-item"
            :class="{ 'is-current': event.isCurrent }"
          >
            <div class="timeline-marker">
              <span class="marker-dot"></span>
              <span v-if="index < timelineEvents.length - 1" class="marker-line"></span>
            </div>
            <div class="timeline-content">
              <div class="timeline-chapter">{{ event.chapterTitle }}</div>
              <div class="timeline-change">
                <span v-if="event.type" class="change-old">{{ event.type }}</span>
                <span v-if="event.type" class="change-arrow">→</span>
                <span class="change-new">{{ event.type || '未定义' }}</span>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- 未来变化提示 -->
      <div v-if="futureChange" class="future-change">
        <span class="future-icon">⚠️</span>
        <span class="future-text">
          将在「{{ futureChange.chapterTitle }}」变为 {{ futureChange.newType }}
        </span>
      </div>

      <!-- 操作按钮 -->
      <div class="panel-actions">
        <button class="action-btn" @click="$emit('edit')">编辑当前关系</button>
        <button class="action-btn secondary" @click="$emit('create-change')">在此章创建新变化</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TimelineSnapshot } from '@/modules/writer/composables/useRelationTimeline'

const props = defineProps<{
  relationId: string
  fromName: string
  toName: string
  currentSnapshot?: TimelineSnapshot
  timelineEvents?: TimelineSnapshot[]
  futureChange?: TimelineSnapshot['futureChange']
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'edit'): void
  (e: 'create-change'): void
}>()

function getTypeColor(type?: string): string {
  const colors: Record<string, string> = {
    '朋友': '#7c9885',
    '恋人': '#c9a962',
    '家人': '#c9a962',
    '敌人': '#a85d5d',
    '盟友': '#6b8e9f',
  }
  return colors[type || ''] || '#8b7355'
}
</script>

<style scoped>
.relation-timeline-panel {
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

.panel-header h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.close-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
  border-radius: 4px;
  color: #6b7280;
}

.close-btn:hover {
  background: #f3f4f6;
}

.panel-body {
  padding: 14px;
}

.current-state {
  margin-bottom: 16px;
}

.state-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.state-label {
  font-size: 12px;
  color: #6b7280;
  width: 60px;
}

.state-value {
  font-size: 13px;
  color: #111827;
}

.type-badge {
  padding: 2px 8px;
  border-radius: 4px;
  color: white;
  font-size: 12px;
}

.strength-bar {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  transition: width 0.3s;
}

.strength-value {
  font-size: 12px;
  color: #6b7280;
  width: 36px;
  text-align: right;
}

.timeline-history {
  margin-bottom: 16px;
}

.timeline-history h5 {
  margin: 0 0 10px;
  font-size: 12px;
  color: #374151;
}

.timeline-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.timeline-item {
  display: flex;
  gap: 10px;
  padding-bottom: 12px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 16px;
}

.marker-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d1d5db;
  flex-shrink: 0;
}

.timeline-item.is-current .marker-dot {
  background: #3b82f6;
}

.marker-line {
  width: 2px;
  flex: 1;
  background: #e5e7eb;
  margin-top: 4px;
}

.timeline-content {
  flex: 1;
}

.timeline-chapter {
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 2px;
}

.timeline-change {
  font-size: 13px;
  color: #374151;
}

.change-old {
  text-decoration: line-through;
  color: #9ca3af;
}

.change-arrow {
  margin: 0 4px;
  color: #9ca3af;
}

.change-new {
  font-weight: 500;
}

.future-change {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: #fef3c7;
  border-radius: 6px;
  margin-bottom: 16px;
}

.future-icon {
  font-size: 14px;
}

.future-text {
  font-size: 12px;
  color: #92400e;
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  padding: 8px 12px;
  font-size: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: #3b82f6;
  color: white;
  border: none;
}

.action-btn:hover {
  background: #2563eb;
}

.action-btn.secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.action-btn.secondary:hover {
  background: #f9fafb;
}
</style>
