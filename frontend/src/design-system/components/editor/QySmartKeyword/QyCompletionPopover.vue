<template>
  <Teleport to="body">
    <Transition name="completion-fade">
      <div
        v-if="visible"
        class="qy-completion-popover"
        :style="popoverStyle"
      >
        <div class="completion-header">
          <span class="completion-icon">@</span>
          <span class="completion-title">实体补全</span>
          <span class="completion-count">{{ items.length }} 个结果</span>
        </div>

        <!-- 无匹配时显示创建入口 -->
        <div v-if="items.length === 0 && query" class="completion-empty">
          <span class="empty-icon">✨</span>
          <p>未找到「{{ query }}」</p>
          <button class="create-btn-inline" @click="$emit('create', query)">
            创建新实体「{{ query }}」
          </button>
        </div>

        <ul v-else class="completion-list">
          <li
            v-for="(item, index) in items"
            :key="item.id || item.name"
            class="completion-item"
            :class="{
              'is-active': index === activeIndex,
              [`type-${item.type}`]: true
            }"
            @click="handleSelect(item)"
            @mouseenter="$emit('update:activeIndex', index)"
          >
            <span class="item-icon">{{ getTypeIcon(item.type) }}</span>
            <span class="item-name">{{ item.name }}</span>
            <span class="item-type">{{ getTypeLabel(item.type) }}</span>
          </li>

          <!-- 列表底部创建入口 -->
          <li
            v-if="showCreateAction"
            class="completion-item completion-item--create"
            :class="{ 'is-active': activeIndex === items.length }"
            @click="$emit('create', query || '')"
            @mouseenter="$emit('update:activeIndex', items.length)"
          >
            <span class="item-icon">➕</span>
            <span class="item-name">{{ createActionLabel }}</span>
          </li>
        </ul>

        <div v-if="showCreateHint" class="completion-footer">
          <span class="create-hint">
            未找到？
            <button type="button" class="create-btn" @click.stop="$emit('create', query || '')">
              {{ createButtonLabel }}
            </button>
          </span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { shouldShowCompletionCreateAction } from './completionCreateOption'
import type { KeywordInfo, KeywordType } from './extensions/SmartKeyword'

const props = defineProps<{
  visible: boolean
  x: number
  y: number
  items: KeywordInfo[]
  activeIndex: number
  query?: string
}>()

const emit = defineEmits<{
  (e: 'select', item: KeywordInfo): void
  (e: 'create', query: string): void
  (e: 'update:activeIndex', index: number): void
}>()

const popoverStyle = computed(() => ({
  left: `${props.x}px`,
  top: `${props.y}px`,
}))

const showCreateAction = computed(() =>
  shouldShowCompletionCreateAction(props.query || '', props.items),
)

const showCreateHint = computed(() => showCreateAction.value)

const createActionLabel = computed(() =>
  props.query?.trim() ? `创建「${props.query}」` : '新建实体',
)

const createButtonLabel = computed(() => (props.query?.trim() ? '创建新实体' : '新建实体'))

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

function getTypeLabel(type: KeywordType): string {
  const labels: Record<KeywordType, string> = {
    character: '角色',
    location: '地点',
    item: '物品',
    concept: '概念',
    organization: '组织',
  }
  return labels[type] || '实体'
}

function handleSelect(item: KeywordInfo) {
  emit('select', item)
}
</script>

<style scoped>
.qy-completion-popover {
  position: fixed;
  z-index: 3900;
  width: 280px;
  max-height: 320px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.completion-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.completion-icon {
  font-size: 14px;
  color: #3b82f6;
}

.completion-title {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.completion-count {
  margin-left: auto;
  font-size: 11px;
  color: #9ca3af;
}

.completion-list {
  list-style: none;
  margin: 0;
  padding: 4px 0;
  max-height: 220px;
  overflow-y: auto;
}

.completion-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.15s ease;
}

.completion-item:hover,
.completion-item.is-active {
  background: #f3f4f6;
}

.completion-item.type-character {
  border-left-color: #3b82f6;
}

.completion-item.type-location {
  border-left-color: #10b981;
}

.completion-item.type-item {
  border-left-color: #f59e0b;
}

.completion-item.type-organization {
  border-left-color: #0f766e;
}

.completion-item.is-active.type-character {
  background: #eff6ff;
}

.completion-item.is-active.type-location {
  background: #ecfdf5;
}

.completion-item.is-active.type-item {
  background: #fffbeb;
}

.completion-item.is-active.type-organization {
  background: #ecfeff;
}

.item-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.item-name {
  flex: 1;
  font-size: 13px;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-type {
  font-size: 10px;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
}

.completion-footer {
  padding: 8px 12px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.create-hint {
  font-size: 12px;
  color: #6b7280;
}

.create-btn {
  background: transparent;
  border: none;
  color: #3b82f6;
  font-size: 12px;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
}

.create-btn:hover {
  text-decoration: underline;
}

.completion-empty {
  padding: 16px;
  text-align: center;
  color: #94a3b8;
}

.completion-empty .empty-icon {
  font-size: 24px;
  display: block;
  margin-bottom: 8px;
}

.completion-empty p {
  margin: 0;
  font-size: 13px;
}

.completion-empty .create-btn-inline {
  margin-top: 8px;
  padding: 6px 14px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.completion-empty .create-btn-inline:hover {
  background: #2563eb;
}

.completion-item--create {
  border-left-color: #3b82f6 !important;
  color: #3b82f6;
  cursor: pointer;
}

.completion-item--create:hover {
  background: #eff6ff;
}

/* 过渡动画 */
.completion-fade-enter-active,
.completion-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.completion-fade-enter-from,
.completion-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
