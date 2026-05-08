<template>
  <div class="word-counter-container" :class="{ 'has-target': !!targetWordCount }">
    <!-- 主要统计区域 -->
    <el-popover placement="top" :width="280" trigger="hover" popper-class="word-count-popper" :show-arrow="false"
      :offset="12">
      <template #reference>
        <div class="counter-trigger">
          <!-- 核心指标：总字数 -->
          <div class="main-stat">
            <span class="label">字数</span>
            <span class="value">{{ formatCount(wordCount.total) }}</span>
          </div>

          <el-divider direction="vertical" class="stat-divider" />

          <!-- 次要指标：阅读时间 (新功能) -->
          <div class="sub-stat">
            <el-icon class="icon">
              <QyIcon name="Timer"  />
            </el-icon>
            <span class="value">{{ readingTime }}</span>
          </div>

          <!-- 进度环 (如果有目标) -->
          <div v-if="targetWordCount" class="mini-progress">
            <el-progress type="circle" :percentage="completionPercentage" :width="24" :stroke-width="3"
              :color="progressColor" :show-text="false" />
          </div>
        </div>
      </template>

      <!-- 悬浮详情面板 -->
      <div class="counter-details">
        <div class="detail-header">统计详情</div>

        <div class="detail-grid">
          <div class="grid-item">
            <span class="label">总字数</span>
            <span class="num">{{ wordCount.total }}</span>
          </div>
          <div class="grid-item">
            <span class="label">中文字符</span>
            <span class="num">{{ wordCount.chinese }}</span>
          </div>
          <div class="grid-item">
            <span class="label">英文单词</span>
            <span class="num">{{ wordCount.english }}</span>
          </div>
          <div class="grid-item">
            <span class="label">标点符号</span>
            <span class="num">{{ wordCount.punctuation }}</span>
          </div>
        </div>

        <!-- 目标进度详情 -->
        <template v-if="targetWordCount">
          <el-divider class="detail-divider" />
          <div class="target-info">
            <div class="target-row">
              <span>目标进度 ({{ completionPercentage }}%)</span>
              <span :style="{ color: progressColor }">
                {{ wordCount.total }} / {{ targetWordCount }}
              </span>
            </div>
            <el-progress :percentage="completionPercentage" :stroke-width="6" :color="progressColor" :show-text="false"
              class="target-bar" />
            <div class="target-remain">
              还需写作 <span class="highlight">{{ remainingWords }}</span> 字
            </div>
          </div>
        </template>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { QyIcon } from '@/design-system/components'
// 定义接口 (建议后续移至 types/editor.ts 复用)
export interface WordCountStats {
  total: number
  chinese: number
  english: number
  numbers: number
  punctuation: number
  whitespace: number
}

interface Props {
  wordCount?: WordCountStats
  targetWordCount?: number
  readingSpeed?: number // 新增：阅读速度（字/分钟）
}

const props = withDefaults(defineProps<Props>(), {
  wordCount: () => ({
    total: 0,
    chinese: 0,
    english: 0,
    numbers: 0,
    punctuation: 0,
    whitespace: 0
  }),
  targetWordCount: 0,
  readingSpeed: 400 // 默认成人阅读速度
})

// 计算完成百分比
const completionPercentage = computed(() => {
  if (!props.targetWordCount) return 0
  const pct = Math.round((props.wordCount.total / props.targetWordCount) * 100)
  return Math.min(100, pct)
})

// 计算剩余字数
const remainingWords = computed(() => {
  if (!props.targetWordCount) return 0
  return Math.max(0, props.targetWordCount - props.wordCount.total)
})

// 预估阅读时间
const readingTime = computed(() => {
  const minutes = Math.ceil(props.wordCount.total / props.readingSpeed)
  if (minutes < 60) {
    return `${minutes}分钟`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}小时${mins}分`
})

// 进度颜色逻辑
const progressColor = computed(() => {
  const p = completionPercentage.value
  if (p >= 100) return 'var(--el-color-success)'
  if (p >= 80) return 'var(--el-color-primary)'
  if (p >= 30) return 'var(--el-color-warning)'
  return 'var(--el-color-danger)'
})

// 数字格式化
function formatCount(count: number): string {
  if (count >= 100000) { // 10万以上才缩写，避免太频繁
    return `${(count / 10000).toFixed(1)}w`
  }
  if (count >= 10000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}
</script>

<style scoped lang="scss">
.word-counter-container {
  display: inline-flex;
  align-items: center;
  background-color: transparent; // 通常作为 footer 的一部分，背景透明

  .counter-trigger {
    display: flex;
    align-items: center;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;
    user-select: none;
    gap: 12px;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    .main-stat {
      display: flex;
      align-items: baseline;
      gap: 6px;

      .label {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }

      .value {
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        font-family: var(--el-font-family-monospace); // 等宽字体数字对齐更好
      }
    }

    .stat-divider {
      margin: 0;
      height: 12px;
      border-color: var(--el-border-color);
    }

    .sub-stat {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--el-text-color-secondary);
      font-size: 12px;

      .icon {
        font-size: 13px;
      }
    }

    .mini-progress {
      display: flex;
      align-items: center;
    }
  }
}

// Popover 内部样式
.counter-details {
  padding: 4px;

  .detail-header {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 12px;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;

    .grid-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 8px;
      background-color: var(--el-fill-color-lighter);
      border-radius: 4px;

      .label {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }

      .num {
        font-size: 16px;
        font-weight: 500;
        color: var(--el-text-color-primary);
      }
    }
  }

  .detail-divider {
    margin: 16px 0 12px;
  }

  .target-info {
    .target-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--el-text-color-regular);
      margin-bottom: 6px;
    }

    .target-bar {
      margin-bottom: 8px;
    }

    .target-remain {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      text-align: right;

      .highlight {
        color: var(--el-color-primary);
        font-weight: 500;
      }
    }
  }
}
</style>

<!-- 全局样式，用于调整 Element Plus Popover 的 padding -->
<style lang="scss">
.word-count-popper {
  // 让内部 padding 更紧凑一点，如果不喜欢可以去掉
  padding: 12px !important;
}
</style>
