<template>
  <Teleport to="body">
    <Transition name="context-menu">
      <div
        v-if="visible"
        ref="menuRef"
        class="outline-context-menu"
        :style="{ left: `${position.x}px`, top: `${position.y}px` }"
        @click="handleMenuClick"
      >
        <div class="context-menu__group">
          <button
            type="button"
            class="context-menu__item context-menu__item--primary"
            :disabled="!canCreateChild"
            @click="emit('createChild')"
          >
            <QyIcon name="Plus" :size="14" />
            <span>新增子节点</span>
          </button>
          <button
            type="button"
            class="context-menu__item"
            :disabled="!canMoveUp"
            @click="emit('moveUp')"
          >
            <QyIcon name="ArrowUp" :size="14" />
            <span>上移</span>
          </button>
          <button
            type="button"
            class="context-menu__item"
            :disabled="!canMoveDown"
            @click="emit('moveDown')"
          >
            <QyIcon name="ArrowDown" :size="14" />
            <span>下移</span>
          </button>
        </div>

        <div class="context-menu__divider"></div>

        <!-- 转为章节菜单 -->
        <div
          v-if="canConvertToChapter && volumeNodes.length > 0"
          class="context-menu__group context-menu__group--submenu"
          @mouseenter="showSubmenu = true"
          @mouseleave="showSubmenu = false"
        >
          <button
            type="button"
            class="context-menu__item context-menu__item--submenu"
            :disabled="volumeNodes.length === 0"
          >
            <QyIcon name="FileText" :size="14" />
            <span>转为章节</span>
            <QyIcon name="ChevronRight" :size="12" class="submenu-arrow" />
          </button>
          <!-- 子菜单：卷列表 -->
          <Transition name="submenu">
            <div v-if="showSubmenu && volumeNodes.length > 0" class="context-menu__submenu">
              <button
                v-for="volume in volumeNodes"
                :key="volume.id"
                type="button"
                class="context-menu__item context-menu__item--submenu-item"
                @click="handleConvertToChapter(volume)"
              >
                <span class="volume-icon">📁</span>
                <span class="volume-title">{{ volume.title }}</span>
              </button>
            </div>
          </Transition>
        </div>

        <div class="context-menu__divider"></div>

        <div class="context-menu__group">
          <button
            type="button"
            class="context-menu__item"
            @click="emit('edit')"
          >
            <QyIcon name="Edit" :size="14" />
            <span>编辑</span>
          </button>
          <button
            type="button"
            class="context-menu__item context-menu__item--danger"
            @click="emit('delete')"
          >
            <QyIcon name="Delete" :size="14" />
            <span>删除</span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import type { OutlineNode } from '@/types/writer'

// =======================
// Props 定义
// =======================
const props = defineProps<{
  visible: boolean
  canCreateChild: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  volumeNodes?: OutlineNode[] // 所有卷级别节点
  canConvertToChapter?: boolean // 是否可以转为章节（非 volume 类型节点）
}>()

// =======================
// Emits 定义
// =======================
const emit = defineEmits<{
  (e: 'createChild'): void
  (e: 'moveUp'): void
  (e: 'moveDown'): void
  (e: 'edit'): void
  (e: 'delete'): void
  (e: 'close'): void
  (e: 'convertToChapter', volumeNode: OutlineNode): void
}>()

// =======================
// 状态
// =======================
const menuRef = ref<HTMLElement | null>(null)
const position = ref({ x: 0, y: 0 })
const showSubmenu = ref(false)

// 默认为空数组
const volumeNodes = computed(() => props.volumeNodes || [])

// =======================
// 菜单位置计算
// =======================
function adjustPosition() {
  if (!menuRef.value) return

  const rect = menuRef.value.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  // 防止菜单超出右边界
  if (position.value.x + rect.width > viewportWidth) {
    position.value.x = viewportWidth - rect.width - 8
  }

  // 防止菜单超出底部边界
  if (position.value.y + rect.height > viewportHeight) {
    position.value.y = viewportHeight - rect.height - 8
  }
}

// =======================
// 显示菜单
// =======================
function show(x: number, y: number) {
  position.value = { x, y }
  showSubmenu.value = false
  nextTick(() => {
    adjustPosition()
  })
}

// =======================
// 事件处理
// =======================
function handleMenuClick() {
  emit('close')
}

function handleClickOutside(event: MouseEvent) {
  if (!menuRef.value) return
  if (!props.visible) return

  const target = event.target as Node
  if (!menuRef.value.contains(target)) {
    emit('close')
  }
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.visible) {
    emit('close')
  }
}

// 转为章节处理
function handleConvertToChapter(volumeNode: OutlineNode) {
  emit('convertToChapter', volumeNode)
  emit('close')
}

// =======================
// 生命周期
// =======================
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})

// =======================
// 暴露方法
// =======================
defineExpose({
  show,
})
</script>

<style scoped lang="scss">
.outline-context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 160px;
  background: var(--editor-bg-base, #ffffff);
  border: 1px solid var(--editor-border, #e2e8f0);
  border-radius: var(--editor-radius-lg, 8px);
  box-shadow: var(--editor-shadow-lg, 0 10px 25px rgba(0, 0, 0, 0.15));
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.context-menu__group {
  display: flex;
  flex-direction: column;
  gap: 2px;

  &--submenu {
    position: relative;
  }
}

.context-menu__divider {
  height: 1px;
  background: var(--editor-border, #e2e8f0);
  margin: 4px 0;
}

.context-menu__item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  border-radius: var(--editor-radius-md, 6px);
  background: transparent;
  color: var(--editor-text-primary, #0f172a);
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 120ms ease-out;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: var(--editor-bg-elevated, #f1f5f9);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &--primary {
    color: var(--editor-accent, #06b6d4);
    font-weight: 600;
  }

  &--danger {
    color: #ef4444;

    &:hover:not(:disabled) {
      background: #fef2f2;
    }
  }

  &--submenu {
    justify-content: flex-start;

    .submenu-arrow {
      margin-left: auto;
      opacity: 0.5;
    }
  }

  &--submenu-item {
    padding-left: 20px;

    .volume-icon {
      font-size: 12px;
    }

    .volume-title {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &:hover:not(:disabled) {
      background: var(--editor-bg-elevated, #f1f5f9);
    }
  }

  span {
    flex: 1;
  }
}

// 子菜单
.context-menu__submenu {
  position: absolute;
  left: 100%;
  top: 0;
  min-width: 160px;
  background: var(--editor-bg-base, #ffffff);
  border: 1px solid var(--editor-border, #e2e8f0);
  border-radius: var(--editor-radius-lg, 8px);
  box-shadow: var(--editor-shadow-lg, 0 10px 25px rgba(0, 0, 0, 0.15));
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 10000;
  margin-left: 4px;
}

// 过渡动画
.context-menu-enter-active,
.context-menu-leave-active {
  transition: opacity 150ms ease-out, transform 150ms ease-out;
}

.context-menu-enter-from,
.context-menu-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

// 子菜单过渡动画
.submenu-enter-active,
.submenu-leave-active {
  transition: opacity 100ms ease-out, transform 100ms ease-out;
}

.submenu-enter-from,
.submenu-leave-to {
  opacity: 0;
  transform: translateX(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .context-menu-enter-active,
  .context-menu-leave-active,
  .context-menu__item {
    transition: none;
  }
}
</style>
