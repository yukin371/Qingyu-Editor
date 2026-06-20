<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import { useReviewStore } from '../../stores/reviewStore'
import ReviewReport from './ReviewReport.vue'

const reviewStore = useReviewStore()

function handleClose() {
  reviewStore.close()
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') handleClose()
}

// 抽屉打开时挂全局 ESC 监听；关闭时卸载。其他模态未同时打开时无冲突。
watch(
  () => reviewStore.isOpen,
  (isOpen) => {
    if (isOpen) window.addEventListener('keydown', handleKeydown)
    else window.removeEventListener('keydown', handleKeydown)
  },
)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <!-- 始终挂载，由 Transition 控制可见性，便于 enter/leave 动画 -->
    <Transition name="review-drawer">
      <div
        v-if="reviewStore.isOpen"
        class="review-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="审查报告"
      >
        <!-- 遮罩：点击关闭 -->
        <div class="review-drawer__backdrop" @click="handleClose"></div>

        <!-- 抽屉面板 -->
        <section class="review-drawer__panel">
          <button
            type="button"
            class="review-drawer__close"
            aria-label="关闭审查"
            @click="handleClose"
          >
            ✕
          </button>
          <ReviewReport />
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.review-drawer {
  position: fixed;
  inset: 0;
  z-index: 9999;
}

.review-drawer__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  cursor: pointer;
}

.review-drawer__panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 480px;
  max-width: 100vw;
  background: var(--editor-layer-panel, #ffffff);
  box-shadow: -8px 0 24px rgba(15, 23, 42, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.review-drawer__close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--editor-text-muted, #64748b);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: color-mix(in srgb, var(--editor-text-primary, #0f172a) 8%, transparent);
    color: var(--editor-text-primary, #0f172a);
  }

  &:focus-visible {
    outline: 2px solid var(--editor-accent, #2563eb);
    outline-offset: 2px;
  }
}

/* 进入：从右侧滑入；离开：向右滑出。backdrop 与 panel 各自动画。 */
.review-drawer-enter-active,
.review-drawer-leave-active {
  transition: opacity 0.25s ease;

  .review-drawer__backdrop {
    transition: opacity 0.25s ease;
  }

  .review-drawer__panel {
    transition: transform 0.25s ease;
  }
}

.review-drawer-enter-from,
.review-drawer-leave-to {
  opacity: 0;

  .review-drawer__backdrop {
    opacity: 0;
  }

  .review-drawer__panel {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .review-drawer-enter-active,
  .review-drawer-leave-active,
  .review-drawer-enter-active .review-drawer__backdrop,
  .review-drawer-leave-active .review-drawer__backdrop,
  .review-drawer-enter-active .review-drawer__panel,
  .review-drawer-leave-active .review-drawer__panel {
    transition: none;
  }
}

@media (max-width: 520px) {
  .review-drawer__panel {
    width: 100vw;
  }
}
</style>
