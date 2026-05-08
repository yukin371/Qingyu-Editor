<template>
  <el-card class="project-card" :body-style="{ padding: '0px' }" shadow="hover" @click="$emit('click')">
    <!-- 1. 封面区域 -->
    <div class="card-cover">
      <el-image v-if="project.coverUrl" :src="project.coverUrl" fit="cover" class="cover-image" loading="lazy">
        <template #error>
          <div class="cover-placeholder error">
            <QyIcon name="Picture"  />
          </div>
        </template>
      </el-image>
      <!-- 无封面时的默认占位 -->
      <div v-else class="cover-placeholder" :style="placeholderStyle">
        <span class="placeholder-text">{{ project.title.charAt(0) }}</span>
      </div>

      <!-- 状态标签 (悬浮在封面左上角) -->
      <div class="status-badge">
        <el-tag :type="statusConfig.type" effect="dark" size="small" round>
          {{ statusConfig.text }}
        </el-tag>
      </div>
    </div>

    <div class="card-content">
      <!-- 2. 标题与简介 -->
      <div class="content-main">
        <h3 class="title" :title="project.title">{{ project.title }}</h3>
        <p class="desc" :title="project.summary">
          {{ project.summary || '暂无简介，点击开始创作...' }}
        </p>
      </div>

      <!-- 3. 数据统计 -->
      <div class="content-meta">
        <div class="meta-row">
          <el-tooltip content="总字数">
            <div class="meta-item">
              <QyIcon name="EditPen"  />
              <span>{{ formatNumber(project.statistics?.totalWords || 0) }}</span>
            </div>
          </el-tooltip>

          <el-tooltip content="章节数">
            <div class="meta-item">
              <QyIcon name="DocumentCopy"  />
              <span>{{ project.statistics?.chapterCount || 0 }} 章</span>
            </div>
          </el-tooltip>
        </div>

        <div class="meta-row time">
          <el-tooltip :content="`更新于 ${formatDate(project.updatedAt)}`">
            <span class="time-text">{{ formatRelativeTime(project.updatedAt) }} 更新</span>
          </el-tooltip>
        </div>
      </div>

      <el-divider class="card-divider" />

      <!-- 4. 底部操作栏 -->
      <div class="card-actions">
        <el-tooltip content="编辑书籍">
          <el-button link class="action-btn primary" @click.stop="$emit('edit', project)">
            <QyIcon name="Edit"  />
          </el-button>
        </el-tooltip>

        <el-tooltip content="数据统计">
          <el-button link class="action-btn" @click.stop="$emit('statistics', project)">
            <QyIcon name="DataLine"  />
          </el-button>
        </el-tooltip>

        <div class="spacer"></div>

        <el-tooltip content="删除项目">
          <el-button link class="action-btn danger" @click.stop="$emit('delete', project.id)">
            <QyIcon name="Delete"  />
          </el-button>
        </el-tooltip>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { QyIcon } from '@/design-system/components'
import type { Project } from '@/modules/writer/types/project'
import { ProjectStatus } from '@/modules/writer/types/project'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

// 初始化 dayjs
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

interface Props {
  project: Project
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: []
  edit: [project: Project]
  statistics: [project: Project]
  delete: [projectId: string]
}>()

// 状态配置映射
const statusConfig = computed(() => {
  const map: Record<string, { type: 'success' | 'warning' | 'info' | 'danger', text: string }> = {
    [ProjectStatus.DRAFT]: { type: 'info', text: '草稿' },
    [ProjectStatus.SERIALIZING]: { type: 'warning', text: '连载中' },
    [ProjectStatus.COMPLETED]: { type: 'success', text: '已完结' },
    [ProjectStatus.SUSPENDED]: { type: 'danger', text: '断更' },
    [ProjectStatus.ARCHIVED]: { type: 'info', text: '归档' }
  }
  return map[props.project.status] || { type: 'info', text: '未知' }
})

// 生成随机渐变背景色（基于标题哈希）
const placeholderStyle = computed(() => {
  const colors = [
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  ]
  const index = props.project.title.length % colors.length
  return { background: colors[index] }
})

// 工具函数
function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万字'
  }
  return num + ' 字'
}

function formatDate(dateStr: string): string {
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm')
}

function formatRelativeTime(dateStr: string): string {
  return dayjs(dateStr).fromNow()
}
</script>

<style scoped lang="scss">
.project-card {
  height: 100%;
  border: 1px solid var(--el-border-color-lighter);
  background-color: var(--el-bg-color);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
  border-radius: 8px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--el-box-shadow);

    .cover-image {
      transform: scale(1.05);
    }
  }
}

// 1. 封面区域
.card-cover {
  height: 140px;
  width: 100%;
  position: relative;
  overflow: hidden;
  background-color: var(--el-fill-color-light);

  .cover-image {
    width: 100%;
    height: 100%;
    transition: transform 0.5s ease;
  }

  .cover-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;

    &.error {
      background-color: var(--el-fill-color);
      color: var(--el-text-color-secondary);
      font-size: 24px;
    }

    .placeholder-text {
      font-size: 48px;
      font-weight: bold;
      opacity: 0.8;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }

  .status-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 2;
  }
}

// 2. 内容区域
.card-content {
  padding: 16px;
  display: flex;
  flex-direction: column;

  .content-main {
    margin-bottom: 12px;

    .title {
      margin: 0 0 6px;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .desc {
      margin: 0;
      font-size: 13px;
      color: var(--el-text-color-secondary);
      line-height: 1.5;
      height: 40px; // 限制两行高度
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .content-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: var(--el-text-color-placeholder);

    .meta-row {
      display: flex;
      gap: 12px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;

      .el-icon {
        font-size: 14px;
      }
    }

    .time-text {
      font-size: 12px;
    }
  }

  .card-divider {
    margin: 12px 0 8px;
    border-color: var(--el-border-color-lighter);
  }

  // 3. 操作区域
  .card-actions {
    display: flex;
    align-items: center;

    .spacer {
      flex: 1;
    }

    .action-btn {
      padding: 6px;
      height: 32px;
      width: 32px;
      margin-left: 4px;
      border-radius: 4px;
      font-size: 16px;
      color: var(--el-text-color-regular);
      transition: all 0.2s;

      &:hover {
        background-color: var(--el-fill-color);
      }

      &.primary:hover {
        color: var(--el-color-primary);
        background-color: var(--el-color-primary-light-9);
      }

      &.danger:hover {
        color: var(--el-color-danger);
        background-color: var(--el-color-danger-light-9);
      }
    }
  }
}
</style>
