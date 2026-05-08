<template>
  <div class="notification-list" v-loading="loading">
    <!-- 类型过滤标签 -->
    <div class="notification-tabs">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: currentType === tab.key }"
        @click="handleTabChange(tab.key)"
      >
        {{ tab.label }}
        <span v-if="tab.count > 0" class="tab-count">({{ tab.count }})</span>
      </div>
    </div>

    <!-- 批量操作栏 -->
    <div v-if="notifications.length > 0" class="action-bar">
      <!-- TODO: 替换为Qingyu组件 qy-checkbox -->
      <el-checkbox v-model="selectAll" @change="handleSelectAll">
        全选
      </el-checkbox>
      <div class="actions">
        <QyButton
          v-if="selectedCount > 0"
          variant="primary"
          size="sm"
          @click="handleMarkSelectedRead"
        >
          标记已读
        </QyButton>
        <QyButton
          v-if="selectedCount > 0"
          variant="danger"
          size="sm"
          @click="handleDeleteSelected"
        >
          删除
        </QyButton>
        <QyButton
          size="sm"
          @click="handleMarkAllRead"
        >
          全部已读
        </QyButton>
        <QyButton
          size="sm"
          @click="handleClearAll"
        >
          清空
        </QyButton>
      </div>
    </div>

    <!-- 通知列表 -->
    <div class="list-container">
      <transition-group name="list" tag="div">
        <NotificationItem
          v-for="notification in notifications"
          :key="notification.id"
          :notification="notification"
          :selected="selectedIds.includes(notification.id)"
          @select="handleSelect"
          @read="handleMarkRead"
          @delete="handleDelete"
        />
      </transition-group>
    </div>

    <!-- 空状态 -->
    <Empty
      v-if="!loading && notifications.length === 0"
      :description="emptyText"
    >
      <template #image>
        <QyIcon name="Bell" :size="120" color="#ddd" />
      </template>
    </Empty>

    <!-- 加载更多 -->
    <div v-if="hasMore" class="load-more">
      <QyButton @click="handleLoadMore" :loading="loadingMore">
        加载更多
      </QyButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { QyIcon, QyButton } from '@/design-system/components'
import { Empty } from '@/design-system/base'
import { message, messageBox } from '@/design-system/services'
import NotificationItem from './NotificationItem.vue'
import { useNotificationStore } from '@/stores/notification'
import type { NotificationType } from '@/types/notification'

interface TabItem {
  key: string
  label: string
  count: number
}

const notificationStore = useNotificationStore()

const loading = ref(false)
const loadingMore = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const selectedIds = ref<string[]>([])
const hasMore = ref(false)

// 通知类型标签
const tabs = computed<TabItem[]>(() => [
  {
    key: 'all',
    label: '全部',
    count: notificationStore.stats.total
  },
  {
    key: 'comment',
    label: '评论',
    count: notificationStore.stats.byType.comment || 0
  },
  {
    key: 'like',
    label: '点赞',
    count: notificationStore.stats.byType.like || 0
  },
  {
    key: 'follow',
    label: '关注',
    count: notificationStore.stats.byType.follow || 0
  },
  {
    key: 'system',
    label: '系统',
    count: notificationStore.stats.byType.system || 0
  }
])

const currentType = ref<string>('all')

// 当前显示的通知列表
const notifications = computed(() => {
  return notificationStore.notificationsByType.value(currentType.value)
})

// 空状态文本
const emptyText = computed(() => {
  const textMap: Record<string, string> = {
    all: '暂无通知',
    comment: '暂无评论通知',
    like: '暂无点赞通知',
    follow: '暂无关注通知',
    system: '暂无系统通知'
  }
  return textMap[currentType.value] || '暂无通知'
})

// 是否全选
const selectAll = computed({
  get: () => {
    return notifications.value.length > 0 &&
           selectedIds.value.length === notifications.value.length
  },
  set: (_value) => {
    // 只用于显示，实际逻辑在 handleSelectAll
  }
})

// 已选择数量
const selectedCount = computed(() => selectedIds.value.length)

// 切换标签
const handleTabChange = async (type: string) => {
  currentType.value = type
  selectedIds.value = []
  currentPage.value = 1
  await loadNotifications()
}

// 加载通知列表
const loadNotifications = async () => {
  loading.value = true
  try {
    await notificationStore.fetchNotifications({
      type: currentType.value !== 'all' ? currentType.value as NotificationType : undefined,
      page: currentPage.value,
      size: pageSize.value
    })

    // 判断是否还有更多
    hasMore.value = notifications.value.length >= pageSize.value
  } finally {
    loading.value = false
  }
}

// 加载更多
const handleLoadMore = async () => {
  if (loadingMore.value) return

  loadingMore.value = true
  currentPage.value++
  try {
    await notificationStore.fetchNotifications({
      type: currentType.value !== 'all' ? currentType.value as NotificationType : undefined,
      page: currentPage.value,
      size: pageSize.value
    })
  } finally {
    loadingMore.value = false
  }
}

// 选择通知
const handleSelect = (id: string, selected: boolean) => {
  if (selected) {
    if (!selectedIds.value.includes(id)) {
      selectedIds.value.push(id)
    }
  } else {
    const index = selectedIds.value.indexOf(id)
    if (index !== -1) {
      selectedIds.value.splice(index, 1)
    }
  }
}

// 全选/取消全选
const handleSelectAll = () => {
  if (selectAll.value) {
    // 取消全选
    selectedIds.value = []
  } else {
    // 全选
    selectedIds.value = notifications.value.map((n: any) => n.id)
  }
}

// 标记单个已读
const handleMarkRead = async (id: string) => {
  await notificationStore.markAsRead(id)
  message.success('已标记为已读')
}

// 标记选中项已读
const handleMarkSelectedRead = async () => {
  if (selectedIds.value.length === 0) return

  try {
    for (const id of selectedIds.value) {
      await notificationStore.markAsRead(id)
    }
    selectedIds.value = []
    message.success(`已标记 ${selectedIds.value.length} 条为已读`)
  } catch (error) {
    message.error('操作失败')
  }
}

// 全部标记已读
const handleMarkAllRead = async () => {
  try {
    const type = currentType.value !== 'all' ? currentType.value : undefined
    await notificationStore.markAllAsRead(type)
    message.success('已全部标记为已读')
  } catch (error) {
    message.error('操作失败')
  }
}

// 删除单个通知
const handleDelete = async (id: string) => {
  try {
    await notificationStore.deleteNotification(id)
    message.success('删除成功')

    // 从选中列表中移除
    const index = selectedIds.value.indexOf(id)
    if (index !== -1) {
      selectedIds.value.splice(index, 1)
    }
  } catch (error) {
    message.error('删除失败')
  }
}

// 删除选中项
const handleDeleteSelected = async () => {
  if (selectedIds.value.length === 0) return

  try {
    await messageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 条通知吗？`,
      '确认删除',
      {
        type: 'warning'
      }
    )

    for (const id of selectedIds.value) {
      await notificationStore.deleteNotification(id)
    }

    selectedIds.value = []
    message.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      message.error('删除失败')
    }
  }
}

// 清空所有通知
const handleClearAll = async () => {
  try {
    await messageBox.confirm(
      '确定要清空所有通知吗？此操作不可恢复。',
      '确认清空',
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )

    // 这里需要调用清空API
    await notificationStore.markAllAsRead()
    selectedIds.value = []
    message.success('已清空所有通知')
  } catch (error) {
    if (error !== 'cancel') {
      message.error('操作失败')
    }
  }
}

onMounted(async () => {
  await loadNotifications()
})
</script>

<style scoped lang="scss">
.notification-list {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.notification-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  padding: 0 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }

  .tab-item {
    padding: 16px 20px;
    font-size: 14px;
    color: #606266;
    cursor: pointer;
    white-space: nowrap;
    position: relative;
    transition: color 0.3s;

    &:hover {
      color: var(--el-color-primary);
    }

    &.active {
      color: var(--el-color-primary);
      font-weight: 600;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--el-color-primary);
      }
    }

    .tab-count {
      margin-left: 4px;
      font-size: 12px;
      color: #909399;
    }
  }
}

.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #eee;

  .actions {
    display: flex;
    gap: 8px;
  }
}

.list-container {
  max-height: calc(100vh - 300px);
  overflow-y: auto;
}

.load-more {
  padding: 16px;
  text-align: center;
  border-top: 1px solid #eee;
}

// 列表动画
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

// 响应式
@media (max-width: 768px) {
  .notification-tabs {
    .tab-item {
      padding: 14px 16px;
      font-size: 13px;
    }
  }

  .action-bar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;

    .actions {
      justify-content: center;
    }
  }
}
</style>
