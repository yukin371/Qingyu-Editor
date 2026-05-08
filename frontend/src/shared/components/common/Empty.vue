<template>
  <div class="empty-container" :data-type="type">
    <div class="empty-content">
      <!-- 图标 -->
      <div class="empty-icon" :style="{ fontSize: `${iconSize}px` }" v-html="iconSvg"></div>

      <!-- 标题 -->
      <h3 class="empty-title">{{ displayTitle }}</h3>

      <!-- 描述 -->
      <p v-if="displayDescription" class="empty-description">{{ displayDescription }}</p>

      <!-- 操作按钮 -->
      <div v-if="showAction" class="empty-action">
        <QyButton variant="primary" @click="handleAction">
          {{ actionText }}
        </QyButton>
      </div>

      <!-- 自定义插槽 -->
      <div v-if="$slots.default" class="empty-slot">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import QyButton from '@/design-system/components/basic/QyButton/QyButton.vue'

const props = defineProps({
  // 空状态类型
  type: {
    type: String,
    default: 'default', // default, search, data, folder, error
    validator: (value) => ['default', 'search', 'data', 'folder', 'error'].includes(value)
  },
  // 标题
  title: {
    type: String,
    default: ''
  },
  // 描述
  description: {
    type: String,
    default: ''
  },
  // 图标大小
  iconSize: {
    type: Number,
    default: 80
  },
  // 是否显示操作按钮
  showAction: {
    type: Boolean,
    default: false
  },
  // 操作按钮文本
  actionText: {
    type: String,
    default: '返回首页'
  }
})

const emit = defineEmits(['action'])

// SVG 图标
const iconSvg = computed(() => {
  const iconMap = {
    default: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/></svg>',
    search: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
    data: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>',
    folder: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/></svg>',
    error: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>'
  }
  return iconMap[props.type] || iconMap.default
})

// 默认标题
const displayTitle = computed(() => {
  if (props.title) return props.title

  const titleMap = {
    default: '暂无内容',
    search: '没有找到相关内容',
    data: '暂无数据',
    folder: '文件夹为空',
    error: '出错了'
  }
  return titleMap[props.type] || '暂无内容'
})

// 默认描述
const displayDescription = computed(() => {
  if (props.description) return props.description

  const descMap = {
    default: '',
    search: '换个关键词试试吧',
    data: '暂时还没有数据哦',
    folder: '还没有上传任何文件',
    error: '请稍后再试'
  }
  return descMap[props.type] || ''
})

// 处理操作按钮点击
const handleAction = () => {
  emit('action')
}
</script>

<style scoped>
.empty-container {
  width: 100%;
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  color: #c0c4cc;
  margin-bottom: 24px;
  transition: color 0.3s;
}

.empty-title {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 500;
  color: #303133;
}

.empty-description {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #909399;
  line-height: 1.6;
}

.empty-action {
  margin-bottom: 16px;
}

.empty-slot {
  width: 100%;
  margin-top: 16px;
}

/* 不同类型的图标颜色 */
.empty-container[data-type="search"] .empty-icon {
  color: #909399;
}

.empty-container[data-type="error"] .empty-icon {
  color: #f56c6c;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .empty-icon {
    color: #606266;
  }

  .empty-title {
    color: #e0e0e0;
  }

  .empty-description {
    color: #909399;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .empty-icon {
    font-size: 60px !important;
  }

  .empty-title {
    font-size: 16px;
  }

  .empty-description {
    font-size: 13px;
  }
}
</style>







