<template>
  <footer
    class="reader-footer"
    :class="{ 'is-hidden': isFullscreen }"
    data-testid="reader-footer"
  >
    <div class="footer-progress" data-testid="reader-progress-bar">
      <span class="progress-text">{{ progressText }}</span>
      <el-slider v-model="localProgress" :show-tooltip="false" @change="handleProgressChange" />
    </div>
    <div class="footer-nav">
      <QyButton
        class="footer-nav-btn"
        variant="secondary"
        :disabled="!hasPreviousChapter"
        @click="$emit('previous')"
        data-testid="previous-chapter-btn"
      >
        上一章
      </QyButton>
      <QyButton class="footer-nav-btn" variant="secondary" @click="$emit('back-to-catalog')">
        返回目录
      </QyButton>
      <QyButton class="footer-nav-btn" variant="secondary" @click="$emit('go-home')">
        返回首页
      </QyButton>
      <QyButton
        class="footer-nav-btn"
        variant="secondary"
        :disabled="!hasNextChapter"
        @click="$emit('next')"
        data-testid="next-chapter-nav-btn"
      >
        下一章
      </QyButton>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { QyButton } from '@/design-system/components'

const props = defineProps<{
  isFullscreen: boolean
  hasPreviousChapter: boolean
  hasNextChapter: boolean
  progressText: string
  progress: number
}>()

const emit = defineEmits<{
  (e: 'previous'): void
  (e: 'next'): void
  (e: 'back-to-catalog'): void
  (e: 'go-home'): void
  (e: 'progress-change', value: number): void
}>()

const localProgress = computed({
  get: () => props.progress,
  set: (value) => emit('progress-change', value)
})

const handleProgressChange = (value: number) => {
  emit('progress-change', value)
}
</script>

<style scoped lang="scss">
.reader-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;

  &.is-hidden {
    transform: translateY(100%);
  }

  .footer-progress {
    margin-bottom: 16px;

    .progress-text {
      display: block;
      text-align: center;
      margin-bottom: 8px;
      font-size: 14px;
      color: #909399;
    }
  }

  .footer-nav {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
  }
}

:deep(.qy-slider__track) {
  height: 8px !important;
  max-height: 8px !important;
  overflow: hidden !important;
}

:deep(.qy-slider__fill) {
  height: 8px !important;
  max-height: 8px !important;
  border-radius: 9999px !important;
}

@media (max-width: 768px) {
  .reader-footer .footer-nav {
    flex-direction: column;

    .footer-nav-btn {
      width: 100%;
    }
  }
}
</style>
