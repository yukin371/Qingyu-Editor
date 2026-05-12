<template>
  <div class="shortcut-settings" data-testid="shortcut-settings-panel">
    <!-- 头部 -->
    <div class="shortcut-settings__header">
      <div class="shortcut-settings__title">
        <span class="shortcut-settings__title-icon">&#9000;</span>
        <h2>快捷键设置</h2>
      </div>
      <QyButton
        variant="text"
        size="sm"
        class="shortcut-settings__reset-btn"
        @click="handleResetDefaults"
      >
        恢复默认
      </QyButton>
    </div>

    <div class="shortcut-settings__divider" />

    <!-- 搜索栏 -->
    <div class="shortcut-settings__search">
      <QyInput
        v-model="searchQuery"
        id="writer-shortcut-search"
        name="writer-shortcut-search"
        placeholder="搜索快捷键..."
        clearable
        size="sm"
        class="shortcut-settings__search-input"
      />
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="shortcut-settings__loading">
      <span>加载中...</span>
    </div>

    <!-- 快捷键列表 -->
    <div v-else class="shortcut-settings__list">
      <template v-for="category in filteredCategories" :key="category.name">
        <!-- 分类头部 -->
        <div class="shortcut-settings__category-header" @click="toggleCategory(category.name)">
          <span
            class="shortcut-settings__category-arrow"
            :class="{ 'is-expanded': expandedCategories.has(category.name) }"
          >
            &#9656;
          </span>
          <span class="shortcut-settings__category-name">{{ category.title }}</span>
          <span class="shortcut-settings__category-count">({{ category.shortcuts.length }})</span>
        </div>

        <!-- 快捷键行 -->
        <div
          v-show="expandedCategories.has(category.name)"
          class="shortcut-settings__category-body"
        >
          <div
            v-for="shortcut in category.shortcuts"
            :key="shortcut.id"
            class="shortcut-settings__row"
            :class="{
              'is-editing': editingId === shortcut.id,
              'has-conflict': hasConflict(shortcut.id),
              'is-system': isSystemKey(shortcut),
            }"
          >
            <!-- 描述 -->
            <span class="shortcut-settings__desc">{{ shortcut.description }}</span>

            <!-- 按键显示 -->
            <span class="shortcut-settings__keys">
              <template v-if="editingId === shortcut.id">
                <span class="shortcut-settings__keys-placeholder">请按下新的快捷键...</span>
              </template>
              <template v-else>
                <QyTag
                  v-for="key in shortcut.keys"
                  :key="key"
                  size="sm"
                  :class="isSystemKey(shortcut) ? 'shortcut-settings__key-tag is-system' : 'shortcut-settings__key-tag'"
                >
                  {{ key }}
                </QyTag>
              </template>
            </span>

            <!-- 冲突警告 -->
            <span
              v-if="hasConflict(shortcut.id)"
              class="shortcut-settings__conflict-icon"
              title="存在冲突"
            >
              &#9888;
            </span>

            <!-- 系统锁定标识 -->
            <span
              v-if="isSystemKey(shortcut)"
              class="shortcut-settings__lock-icon"
              title="系统键，不可修改"
            >
              &#128274;
            </span>

            <!-- 编辑按钮 -->
            <QyButton
              v-if="!isSystemKey(shortcut)"
              variant="text"
              size="sm"
              class="shortcut-settings__edit-btn"
              :disabled="editingId !== null && editingId !== shortcut.id"
              @click="startEditing(shortcut.id)"
            >
              {{ editingId === shortcut.id ? '取消' : '编辑' }}
            </QyButton>
          </div>
        </div>
      </template>

      <!-- 无搜索结果 -->
      <div v-if="filteredCategories.length === 0 && searchQuery" class="shortcut-settings__empty">
        未找到匹配的快捷键
      </div>
    </div>

    <!-- 冲突摘要 -->
    <div v-if="allConflicts.length > 0" class="shortcut-settings__conflict-summary">
      <span class="shortcut-settings__conflict-summary-icon">&#9888;</span>
      <span class="shortcut-settings__conflict-summary-text">
        <template v-for="(conflict, index) in allConflicts" :key="index">
          {{ conflict.action1.keys.join(' + ') }} 存在冲突：{{ conflict.action1.description }} /
          {{ conflict.action2.description }}
          <template v-if="index < allConflicts.length - 1">；</template>
        </template>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ShortcutSettingsPanel - 快捷键设置面板
 *
 * 允许用户查看和自定义键盘快捷键。
 * 通过 useShortcutConfig 组合式函数管理快捷键数据。
 */

import { computed, onMounted, onUnmounted, ref } from 'vue'
import { message, messageBox } from '@/design-system/services'
import { QyButton, QyInput, QyTag } from '@/design-system/components'
import { useShortcutConfig } from '../../composables/useShortcutConfig'
import { WORKSPACE_SYSTEM_SHORTCUT_IDS } from '../../composables/workspaceShortcutActions'

// ============================================
// 类型定义
// ============================================

interface Shortcut {
  id: string
  keys: string[]
  description: string
  category: string
  isCustom?: boolean
}

interface ShortcutCategory {
  name: string
  title: string
  shortcuts: Shortcut[]
}

// ============================================
// 组合式函数
// ============================================

const {
  shortcuts,
  loading,
  setShortcut,
  detectConflict,
  resetToDefaults,
  getAllConflicts,
  getShortcutsByCategory,
  formatKeys,
} = useShortcutConfig()

// ============================================
// 响应式状态
// ============================================

/** 搜索关键词 */
const searchQuery = ref('')

/** 当前正在编辑的快捷键 ID */
const editingId = ref<string | null>(null)

/** 展开的分类集合 */
const expandedCategories = ref<Set<string>>(new Set())

/** 编辑超时定时器 */
let editTimeout: ReturnType<typeof setTimeout> | null = null

/** 系统级 action 集合 - 这些动作不允许用户修改 */
const SYSTEM_SHORTCUT_IDS = new Set<string>(WORKSPACE_SYSTEM_SHORTCUT_IDS)

// ============================================
// 计算属性
// ============================================

/** 所有分类数据 */
const categories = computed<ShortcutCategory[]>(() => {
  return getShortcutsByCategory()
})

/** 根据搜索关键词过滤的分类 */
const filteredCategories = computed<ShortcutCategory[]>(() => {
  if (!searchQuery.value.trim()) {
    return categories.value
  }

  const query = searchQuery.value.toLowerCase().trim()

  return categories.value
    .map((cat) => ({
      ...cat,
      shortcuts: cat.shortcuts.filter((s) => {
        const safeKeys = s.keys ?? []
        const descMatch = s.description.toLowerCase().includes(query)
        const keysMatch = safeKeys.some((k) => k.toLowerCase().includes(query))
        const comboMatch = safeKeys.join('+').toLowerCase().includes(query)
        return descMatch || keysMatch || comboMatch
      }),
    }))
    .filter((cat) => cat.shortcuts.length > 0)
})

/** 所有冲突列表 */
const allConflicts = computed(() => {
  return getAllConflicts()
})

// ============================================
// 方法
// ============================================

/** 判断是否为系统键 */
function isSystemKey(shortcut: Shortcut): boolean {
  return SYSTEM_SHORTCUT_IDS.has(shortcut.id)
}

/** 检查某个快捷键是否存在冲突 */
function hasConflict(shortcutId: string): boolean {
  if (!shortcuts.value[shortcutId]) return false
  const keys = shortcuts.value[shortcutId].keys
  return detectConflict(shortcutId, keys) !== null
}

/** 切换分类展开/折叠 */
function toggleCategory(categoryName: string): void {
  if (expandedCategories.value.has(categoryName)) {
    expandedCategories.value.delete(categoryName)
  } else {
    expandedCategories.value.add(categoryName)
  }
}

/** 开始编辑快捷键 */
function startEditing(shortcutId: string): void {
  // 如果已在编辑同一个快捷键，则取消编辑
  if (editingId.value === shortcutId) {
    cancelEditing()
    return
  }

  // 取消之前的编辑
  cancelEditing()

  editingId.value = shortcutId

  // 5 秒超时自动取消
  editTimeout = setTimeout(() => {
    cancelEditing()
    message.info('快捷键录制超时，已自动取消')
  }, 5000)
}

/** 取消编辑 */
function cancelEditing(): void {
  editingId.value = null
  if (editTimeout) {
    clearTimeout(editTimeout)
    editTimeout = null
  }
}

/** 处理键盘事件 - 捕获新的快捷键 */
function handleKeyDown(event: KeyboardEvent): void {
  if (editingId.value === null) return

  // Escape 取消编辑
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    cancelEditing()
    return
  }

  // 忽略单独的修饰键
  const modifierKeys = new Set(['Control', 'Shift', 'Alt', 'Meta'])
  if (modifierKeys.has(event.key)) {
    return
  }

  event.preventDefault()
  event.stopPropagation()

  // 构建按键组合
  const keys: string[] = []
  if (event.ctrlKey || event.metaKey) keys.push('Ctrl')
  if (event.shiftKey) keys.push('Shift')
  if (event.altKey) keys.push('Alt')

  // 格式化主键名
  const keyName = formatKey(event.key)
  keys.push(keyName)

  // 应用新的快捷键
  const success = setShortcut(editingId.value, keys)

  if (success) {
    // 检查冲突
    const conflict = detectConflict(editingId.value, keys)
    if (conflict) {
      message.warning(`快捷键 ${formatKeys(keys)} 与「${conflict.description}」存在冲突`)
    } else {
      message.success('快捷键已更新')
    }
  } else {
    message.error('快捷键设置失败')
  }

  // 退出编辑模式
  cancelEditing()
}

/** 格式化按键名称 */
function formatKey(key: string): string {
  const keyMap: Record<string, string> = {
    ' ': 'Space',
    ArrowUp: 'Up',
    ArrowDown: 'Down',
    ArrowLeft: 'Left',
    ArrowRight: 'Right',
    Delete: 'Del',
    Backspace: 'Backspace',
    Enter: 'Enter',
    Insert: 'Ins',
    Home: 'Home',
    End: 'End',
    PageUp: 'PageUp',
    PageDown: 'PageDown',
  }
  return keyMap[key] || (key.length === 1 ? key.toUpperCase() : key)
}

/** 恢复默认快捷键 */
async function handleResetDefaults(): Promise<void> {
  try {
    await messageBox.confirm(
      '确定要恢复所有快捷键为默认设置吗？自定义的快捷键将被覆盖。',
      '恢复默认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
    await resetToDefaults()
    message.success('已恢复默认快捷键')
  } catch {
    // 用户取消操作，不做处理
  }
}

// ============================================
// 生命周期
// ============================================

onMounted(() => {
  // 默认展开所有分类
  for (const cat of categories.value) {
    expandedCategories.value.add(cat.name)
  }
  // 监听全局键盘事件
  document.addEventListener('keydown', handleKeyDown, true)
})

onUnmounted(() => {
  cancelEditing()
  document.removeEventListener('keydown', handleKeyDown, true)
})
</script>

<style scoped>
/* ============================================
   快捷键设置面板样式
   ============================================ */

.shortcut-settings {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--color-bg-primary, #1e1e1e);
  color: var(--color-text-primary, #cccccc);
  font-size: 13px;
  line-height: 1.5;
}

/* 头部 */
.shortcut-settings__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 12px;
  flex-shrink: 0;
}

.shortcut-settings__title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.shortcut-settings__title-icon {
  font-size: 18px;
  color: var(--color-text-secondary, #858585);
}

.shortcut-settings__title h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary, #cccccc);
}

.shortcut-settings__reset-btn {
  color: var(--color-text-secondary, #858585);
  font-size: 12px;
}

.shortcut-settings__reset-btn:hover {
  color: var(--color-text-primary, #cccccc);
}

/* 分割线 */
.shortcut-settings__divider {
  height: 1px;
  background-color: var(--color-border, #3c3c3c);
  margin: 0 20px;
  flex-shrink: 0;
}

/* 搜索栏 */
.shortcut-settings__search {
  padding: 12px 20px;
  flex-shrink: 0;
}

.shortcut-settings__search-input {
  width: 100%;
}

/* 加载状态 */
.shortcut-settings__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--color-text-secondary, #858585);
}

/* 快捷键列表 */
.shortcut-settings__list {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px;
}

.shortcut-settings__list::-webkit-scrollbar {
  width: 6px;
}

.shortcut-settings__list::-webkit-scrollbar-track {
  background: transparent;
}

.shortcut-settings__list::-webkit-scrollbar-thumb {
  background: var(--color-scrollbar-thumb, #424242);
  border-radius: 3px;
}

.shortcut-settings__list::-webkit-scrollbar-thumb:hover {
  background: var(--color-scrollbar-thumb-hover, #4f4f4f);
}

/* 分类头部 */
.shortcut-settings__category-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 0;
  cursor: pointer;
  user-select: none;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary, #858585);
}

.shortcut-settings__category-header:hover {
  color: var(--color-text-primary, #cccccc);
}

.shortcut-settings__category-arrow {
  display: inline-block;
  font-size: 10px;
  transition: transform 0.15s ease;
  flex-shrink: 0;
  width: 12px;
  text-align: center;
}

.shortcut-settings__category-arrow.is-expanded {
  transform: rotate(90deg);
}

.shortcut-settings__category-name {
  flex: 1;
}

.shortcut-settings__category-count {
  color: var(--color-text-tertiary, #5a5a5a);
  font-weight: 400;
}

/* 分类内容 */
.shortcut-settings__category-body {
  padding-bottom: 4px;
}

/* 快捷键行 */
.shortcut-settings__row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 8px;
  border-radius: 4px;
  transition: background-color 0.1s ease;
}

.shortcut-settings__row:hover {
  background-color: var(--color-bg-hover, #2a2d2e);
}

.shortcut-settings__row.is-editing {
  background-color: var(--color-bg-active, #37373d);
  outline: 1px solid var(--color-border-focus, #007fd4);
}

.shortcut-settings__row.has-conflict:not(.is-editing) {
  background-color: rgba(255, 165, 0, 0.06);
}

.shortcut-settings__row.is-system {
  opacity: 0.7;
}

/* 描述文字 */
.shortcut-settings__desc {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text-primary, #cccccc);
}

/* 按键标签区域 */
.shortcut-settings__keys {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.shortcut-settings__key-tag {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 11px;
  background-color: var(--color-bg-tertiary, #2d2d2d);
  border: 1px solid var(--color-border, #3c3c3c);
  color: var(--color-text-primary, #cccccc);
  border-radius: 3px;
  padding: 1px 6px;
  line-height: 1.4;
}

.shortcut-settings__key-tag.is-system {
  color: var(--color-text-tertiary, #5a5a5a);
  border-color: var(--color-border, #3c3c3c);
}

/* 编辑模式占位文字 */
.shortcut-settings__keys-placeholder {
  font-size: 12px;
  color: var(--color-text-secondary, #858585);
  font-style: italic;
  animation: shortcut-pulse 1.2s ease-in-out infinite;
}

@keyframes shortcut-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 冲突警告图标 */
.shortcut-settings__conflict-icon {
  flex-shrink: 0;
  color: #e6a23c;
  font-size: 14px;
  cursor: help;
}

/* 系统锁定图标 */
.shortcut-settings__lock-icon {
  flex-shrink: 0;
  color: var(--color-text-tertiary, #5a5a5a);
  font-size: 12px;
  cursor: help;
}

/* 编辑按钮 */
.shortcut-settings__edit-btn {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--color-text-secondary, #858585);
  padding: 2px 6px;
}

.shortcut-settings__edit-btn:hover {
  color: var(--color-text-primary, #cccccc);
}

/* 空状态 */
.shortcut-settings__empty {
  padding: 32px 20px;
  text-align: center;
  color: var(--color-text-tertiary, #5a5a5a);
  font-size: 13px;
}

/* 冲突摘要 */
.shortcut-settings__conflict-summary {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 20px;
  border-top: 1px solid var(--color-border, #3c3c3c);
  background-color: rgba(255, 165, 0, 0.08);
  flex-shrink: 0;
  font-size: 12px;
  line-height: 1.6;
}

.shortcut-settings__conflict-summary-icon {
  color: #e6a23c;
  flex-shrink: 0;
  margin-top: 1px;
}

.shortcut-settings__conflict-summary-text {
  color: var(--color-text-secondary, #858585);
}
</style>
