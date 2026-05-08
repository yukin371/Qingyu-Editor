<template>
  <div v-if="visible" :class="['loading-container', fullscreen ? 'fullscreen' : 'inline']">
    <div class="loading-content">
      <el-icon v-if="!skeleton" class="loading-icon" :size="size">
        <Loading />
      </el-icon>
      <p v-if="text && !skeleton" class="loading-text">{{ text }}</p>

      <!-- 骨架屏模式 -->
      <div v-if="skeleton" class="skeleton-container">
        <el-skeleton :rows="skeletonRows" animated />
      </div>
    </div>
    <div v-if="fullscreen" class="loading-mask"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { QyIcon } from '@/design-system/components'
const props = defineProps({
  // 是否显示
  visible: {
    type: Boolean,
    default: true
  },
  // 是否全屏
  fullscreen: {
    type: Boolean,
    default: false
  },
  // 加载提示文本
  text: {
    type: String,
    default: '加载中...'
  },
  // 图标大小
  size: {
    type: Number,
    default: 40
  },
  // 是否使用骨架屏
  skeleton: {
    type: Boolean,
    default: false
  },
  // 骨架屏行数
  skeletonRows: {
    type: Number,
    default: 5
  }
})
</script>

<style scoped>
.loading-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
}

.loading-container.inline {
  width: 100%;
  min-height: 200px;
}

.loading-content {
  position: relative;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.loading-icon {
  animation: rotate 1.5s linear infinite;
  color: #409eff;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.skeleton-container {
  width: 100%;
  min-width: 300px;
  padding: 20px;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .loading-content {
    background: rgba(30, 30, 30, 0.95);
  }

  .loading-text {
    color: #e0e0e0;
  }
}
</style>







