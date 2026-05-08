<template>
  <el-header class="reader-header" :class="{ 'is-hidden': isFullscreen }" data-testid="reader-header">
    <div class="reader-nav-bar">
      <QyButton
        class="nav-btn"
        variant="secondary"
        :disabled="!hasPreviousChapter"
        @click="$emit('previous')"
      >
        上一章
      </QyButton>
      <div class="nav-center">
        <QyButton class="nav-btn" variant="secondary" @click="$emit('back-to-catalog')">
          返回目录
        </QyButton>
        <QyButton class="nav-btn" variant="secondary" @click="$emit('go-home')">
          返回首页
        </QyButton>
        <QyButton class="nav-btn" variant="secondary" @click="$emit('toggle-settings')" data-testid="reader-settings-btn">
          阅读设置
        </QyButton>
      </div>
      <QyButton
        class="nav-btn"
        variant="secondary"
        :disabled="!hasNextChapter"
        @click="$emit('next')"
      >
        下一章
      </QyButton>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import { QyButton } from '@/design-system/components'

defineProps<{
  isFullscreen: boolean
  hasPreviousChapter: boolean
  hasNextChapter: boolean
}>()

defineEmits<{
  (e: 'previous'): void
  (e: 'next'): void
  (e: 'back-to-catalog'): void
  (e: 'go-home'): void
  (e: 'toggle-settings'): void
}>()
</script>

<style scoped lang="scss">
.reader-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  min-height: 68px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: #f8fafc;
  transition: transform 0.3s;

  &.is-hidden {
    transform: translateY(-100%);
  }
}

.reader-nav-bar {
  width: min(980px, 100%);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
}

.nav-center {
  display: inline-flex;
  gap: 10px;
  justify-content: center;
}

.reader-nav-bar > .nav-btn:first-child {
  justify-self: start;
}

.reader-nav-bar > .nav-btn:last-child {
  justify-self: end;
}

@media (max-width: 768px) {
  .reader-nav-bar {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .reader-nav-bar > .nav-btn:first-child,
  .reader-nav-bar > .nav-btn:last-child {
    justify-self: stretch;
  }

  .nav-center {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
}
</style>
