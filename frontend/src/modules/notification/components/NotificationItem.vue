<template>
  <div
    class="notification-item"
    :class="{ unread: !notification.isRead, selected }"
    @click="handleClick"
  >
    <!-- TODO: 替换为Qingyu组件 qy-checkbox -->
    <el-checkbox
      v-if="showCheckbox"
      :model-value="selected"
      @change="handleSelectChange"
      @click.stop
    />

    <!-- 图标 -->
    <div class="notification-icon">
      <!-- el-icon用于动态组件，保留 -->
      <el-icon :size="20" :color="iconColor">
        <component :is="iconComponent" />
      </el-icon>
    </div>

    <!-- 内容 -->
    <div class="notification-content">
      <div class="notification-header">
        <span class="notification-title">{{ notification.title }}</span>
        <span class="notification-time">{{ timeAgo }}</span>
      </div>

      <div class="notification-text">{{ notification.content }}</div>

      <!-- 操作按钮 -->
      <div v-if="!notification.isRead" class="notification-actions">
        <QyButton variant="primary" size="sm" @click.stop="handleMarkRead">
          标为已读
        </QyButton>
        <QyButton size="sm" @click.stop="handleDelete">
          删除
        </QyButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, ChatDotRound, Star, User, Wallet, Trophy, Reading, Promotion } from '@element-plus/icons-vue'
import { QyButton } from '@/design-system/components'
import type { NotificationMessage, NotificationType } from '@/types/notification'
import { useNotificationStore } from '@/stores/notification'

interface Props {
  notification: NotificationMessage
  selected?: boolean
  showCheckbox?: boolean
}

interface Emits {
  (e: 'select', id: string, selected: boolean): void
  (e: 'read', id: string): void
  (e: 'delete', id: string): void
  (e: 'click', notification: NotificationMessage): void
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  showCheckbox: false
})

const emit = defineEmits<Emits>()
const router = useRouter()
const notificationStore = useNotificationStore()

// 图标组件映射
const iconMap: Record<NotificationType, any> = {
  system: Bell,
  comment: ChatDotRound,
  like: Star,
  follow: User,
  reward: Wallet,
  vip: Trophy,
  achievement: Trophy,
  book_update: Reading,
  mention: Promotion
}

// 颜色映射
const colorMap: Record<NotificationType, string> = {
  system: '#409eff',
  comment: '#67c23a',
  like: '#f56c6c',
  follow: '#e6a23c',
  reward: '#f56c6c',
  vip: '#f56c6c',
  achievement: '#e6a23c',
  book_update: '#409eff',
  mention: '#409eff'
}

const iconComponent = computed(() => {
  return iconMap[props.notification.type] || Bell
})

const iconColor = computed(() => {
  return colorMap[props.notification.type] || '#909399'
})

// 相对时间
const timeAgo = computed(() => {
  const now = Date.now()
  const time = new Date(props.notification.createdAt).getTime()
  const diff = now - time

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return new Date(props.notification.createdAt).toLocaleDateString()
})

// 根据通知类型和data字段获取跳转路由
const getNotificationRoute = () => {
  const { type, data } = props.notification

  // 检查data是否存在
  if (!data) return null

  try {
    switch (type) {
      case 'comment':
        // 评论通知 → 跳转到评论详情
        if (data.commentId) {
          return {
            name: 'comment-detail',
            params: { commentId: data.commentId }
          }
        }
        // 如果没有commentId但有bookId，跳转到书籍详情
        if (data.bookId) {
          return {
            name: 'book-detail',
            params: { id: data.bookId }
          }
        }
        break

      case 'like':
        // 点赞通知 → 跳转到书籍详情或章节
        if (data.bookId) {
          return {
            name: 'book-detail',
            params: { id: data.bookId }
          }
        }
        if (data.chapterId) {
          return {
            name: 'reader',
            params: { chapterId: data.chapterId }
          }
        }
        break

      case 'follow':
        // 关注通知 → 跳转到用户主页或读者主页
        if (data.relatedUserId || data.userId) {
          const userId = data.relatedUserId || data.userId
          return {
            name: 'user-profile',
            params: { userId }
          }
        }
        break

      case 'mention':
        // @提醒 → 跳转到评论详情或书籍详情
        if (data.commentId) {
          return {
            name: 'comment-detail',
            params: { commentId: data.commentId }
          }
        }
        if (data.bookId) {
          return {
            name: 'book-detail',
            params: { id: data.bookId }
          }
        }
        if (data.chapterId) {
          return {
            name: 'reader',
            params: { chapterId: data.chapterId }
          }
        }
        break

      case 'book_update':
        // 书籍更新 → 跳转到书籍详情
        if (data.bookId || data.relatedId) {
          const bookId = data.bookId || data.relatedId
          return {
            name: 'book-detail',
            params: { id: bookId }
          }
        }
        break

      case 'reward':
        // 打赏通知 → 跳转到书籍详情
        if (data.bookId) {
          return {
            name: 'book-detail',
            params: { id: data.bookId }
          }
        }
        // 或者跳转到钱包
        return {
          name: 'wallet'
        }

      case 'vip':
        // VIP相关 → 跳转到钱包
        return {
          name: 'wallet'
        }

      case 'achievement':
        // 成就解锁 → 跳转到个人中心或钱包
        if (data.achievementId) {
          // 如果有成就ID，可以跳转到成就详情（如果存在成就详情页）
          return {
            name: 'profile'
          }
        }
        return {
          name: 'profile'
        }

      case 'system':
        // 系统通知 → 根据relatedType判断
        if (data.relatedType === 'book' && data.relatedId) {
          return {
            name: 'book-detail',
            params: { id: data.relatedId }
          }
        }
        if (data.relatedType === 'chapter' && data.chapterId) {
          return {
            name: 'reader',
            params: { chapterId: data.chapterId }
          }
        }
        if (data.relatedType === 'user' && data.relatedUserId) {
          return {
            name: 'user-profile',
            params: { userId: data.relatedUserId }
          }
        }
        // 默认跳转到个人中心
        return {
          name: 'profile'
        }

      default:
        return null
    }
  } catch (error) {
    console.error('[NotificationItem] 获取跳转路由失败:', error)
    return null
  }
}

// 点击通知
const handleClick = async () => {
  emit('click', props.notification)

  // 如果未读，标记为已读
  if (!props.notification.isRead) {
    try {
      await notificationStore.markAsRead(props.notification.id)
      emit('read', props.notification.id)
    } catch (error) {
      console.error('[NotificationItem] 标记已读失败:', error)
      // 即使标记失败，也继续跳转
    }
  }

  // 获取跳转路由
  const route = getNotificationRoute()

  if (route) {
    try {
      await router.push(route)
    } catch (error) {
      // 如果路由跳转失败（可能是路由不存在或权限问题），给出提示
      console.error('[NotificationItem] 路由跳转失败:', error)
      // 可以添加一个用户提示，例如使用ElMessage
    }
  } else {
    console.warn('[NotificationItem] 无法确定跳转路由:', props.notification)
    // 如果没有可跳转的路由，可以添加一个用户提示
  }
}

// 选择状态变化
const handleSelectChange = (checked: boolean) => {
  emit('select', props.notification.id, checked)
}

// 标记已读
const handleMarkRead = () => {
  emit('read', props.notification.id)
}

// 删除
const handleDelete = () => {
  emit('delete', props.notification.id)
}
</script>

<style scoped lang="scss">
.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s;
  gap: 12px;

  &:hover {
    background: #f5f7fa;
  }

  &:last-child {
    border-bottom: none;
  }

  &.unread {
    background: #ecf5ff;

    &:hover {
      background: #d9ecff;
    }

    .notification-title {
      font-weight: 600;
    }
  }

  &.selected {
    background: #fef0f0;
  }
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 50%;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  gap: 12px;
}

.notification-title {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  flex-shrink: 0;
}

.notification-time {
  font-size: 12px;
  color: #909399;
  flex-shrink: 0;
}

.notification-text {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8px;
}

.notification-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

// 响应式
@media (max-width: 768px) {
  .notification-item {
    padding: 12px;

    .notification-icon {
      width: 36px;
      height: 36px;
    }
  }

  .notification-title {
    font-size: 13px;
  }

  .notification-text {
    font-size: 12px;
  }

  .notification-actions {
    flex-wrap: wrap;
  }
}
</style>
