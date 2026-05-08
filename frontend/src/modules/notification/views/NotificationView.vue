<template>
  <div class="notification-container">
    <Card>
      <template #title>
        <div class="header-content">
          <h3>通知中心</h3>
          <div class="header-actions">
            <!-- TODO: 替换为Qingyu组件 qy-dropdown -->
            <el-dropdown @command="handleFilterChange">
              <span class="filter-trigger">
                {{ currentFilterText }}
                <QyIcon name="ArrowDown"  />
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="all">全部通知</el-dropdown-item>
                  <el-dropdown-item command="unread">未读通知</el-dropdown-item>
                  <el-dropdown-item command="system">系统通知</el-dropdown-item>
                  <el-dropdown-item command="comment">评论通知</el-dropdown-item>
                  <el-dropdown-item command="like">点赞通知</el-dropdown-item>
                  <el-dropdown-item command="follow">关注通知</el-dropdown-item>
                  <el-dropdown-item command="message">私信通知</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <QyButton
              variant="primary"
              size="sm"
              @click="handleMarkAllRead"
              :disabled="unreadCount === 0"
            >
              全部已读
            </QyButton>
            <QyButton
              size="sm"
              @click="showSettingsDialog = true"
            >
              <QyIcon name="Setting"  />
            </QyButton>
          </div>
        </div>
      </template>

      <!-- 操作栏 -->
      <div class="toolbar" v-if="selectedIds.length > 0">
        <span class="selection-info">已选择 {{ selectedIds.length }} 条通知</span>
        <div class="toolbar-actions">
          <QyButton size="sm" @click="handleBatchMarkRead">
            标记已读
          </QyButton>
          <QyButton size="sm" variant="danger" @click="handleBatchDelete">
            删除
          </QyButton>
          <QyButton size="sm" @click="selectedIds = []">
            取消选择
          </QyButton>
        </div>
      </div>

      <!-- 通知列表 -->
      <div class="notification-list" v-loading="loading">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="[
            'notification-item',
            { 'notification-item--unread': notification.status === 'unread' },
            { 'notification-item--selected': selectedIds.includes(notification.id) }
          ]"
          @click="handleNotificationClick(notification)"
        >
          <!-- 多选框 -->
          <Checkbox
            :model-value="selectedIds.includes(notification.id)"
            @change="(val: boolean | string[]) => handleSelectChange(notification.id, typeof val === 'boolean' ? val : false)"
            @click.stop
          />

          <div class="notification-icon">
            <QyIcon
              :name="getNotificationIcon(notification.type)"
              :size="20"
              :color="getNotificationColor(notification.type)"
            />
          </div>

          <div class="notification-content">
            <div class="notification-title">
              <span :class="{ 'title-unread': notification.status === 'unread' }">
                {{ notification.title }}
              </span>
              <Tag
                v-if="notification.priority === 'high'"
                variant="danger"
                size="sm"
              >
                重要
              </Tag>
              <Tag
                v-else-if="notification.priority === 'urgent'"
                variant="danger"
                size="sm"
              >
                紧急
              </Tag>
            </div>
            <div class="notification-text">
              {{ notification.content }}
            </div>
            <div class="notification-meta">
              <span class="notification-time">{{ formatRelativeTime(notification.created_at) }}</span>
              <div class="notification-actions">
                <QyButton
                  v-if="notification.status === 'unread'"
                  variant="primary"
                  size="sm"
                  @click.stop="handleMarkAsRead(notification.id)"
                >
                  标记已读
                </QyButton>
                <QyButton
                  variant="danger"
                  size="sm"
                  @click.stop="handleDelete(notification.id)"
                >
                  删除
                </QyButton>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <Empty
          v-if="!loading && notifications.length === 0"
          :description="emptyText"
        >
          <template #action>
            <QyButton v-if="currentFilter !== 'all'" variant="primary" @click="handleFilterChange('all')">
              查看全部通知
            </QyButton>
          </template>
        </Empty>
      </div>

      <!-- 分页器 -->
      <QyPagination
        v-if="total > 0"
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        :layout="['total', 'prev', 'pager', 'next', 'jumper']"
        @current-change="loadNotifications"
        class="pagination"
      />
    </Card>

    <!-- 设置对话框 -->
    <QyModal
      v-model:visible="showSettingsDialog"
      title="通知设置"
      width="500px"
    >
      <!-- 通知设置表单 -->
      <QyForm v-model="preferences" label-width="100px">
        <h4>通知渠道</h4>
        <QyFormItem label="站内通知">
          <QySwitch v-model="preferences.channel_enabled.in_app" />
        </QyFormItem>
        <QyFormItem label="邮件通知">
          <QySwitch v-model="preferences.channel_enabled.email" />
        </QyFormItem>
        <QyFormItem label="短信通知">
          <QySwitch v-model="preferences.channel_enabled.sms" />
        </QyFormItem>
        <QyFormItem label="推送通知">
          <QySwitch v-model="preferences.channel_enabled.push" />
        </QyFormItem>

        <Divider />

        <h4>通知类型</h4>
        <QyFormItem label="系统通知">
          <QySwitch v-model="preferences.type_enabled.system" />
        </QyFormItem>
        <QyFormItem label="评论通知">
          <QySwitch v-model="preferences.type_enabled.comment" />
        </QyFormItem>
        <QyFormItem label="点赞通知">
          <QySwitch v-model="preferences.type_enabled.like" />
        </QyFormItem>
        <QyFormItem label="关注通知">
          <QySwitch v-model="preferences.type_enabled.follow" />
        </QyFormItem>
        <QyFormItem label="私信通知">
          <QySwitch v-model="preferences.type_enabled.message" />
        </QyFormItem>

        <Divider />

        <h4>免打扰时段</h4>
        <QyFormItem label="启用免打扰">
          <QySwitch v-model="quietHoursEnabled" />
        </QyFormItem>
        <QyFormItem label="开始时间" v-if="quietHoursEnabled">
          <!-- TODO: 替换为Qingyu组件 qy-time-picker -->
          <el-time-picker
            v-model="quietHoursStart"
            format="HH:mm"
            value-format="HH:mm"
          />
        </QyFormItem>
        <QyFormItem label="结束时间" v-if="quietHoursEnabled">
          <!-- TODO: 替换为Qingyu组件 qy-time-picker -->
          <el-time-picker
            v-model="quietHoursEnd"
            format="HH:mm"
            value-format="HH:mm"
          />
        </QyFormItem>
      </QyForm>

      <template #footer>
        <QyButton @click="showSettingsDialog = false">取消</QyButton>
        <QyButton variant="primary" @click="handleSaveSettings">
          保存
        </QyButton>
      </template>
    </QyModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message, messageBox } from '@/design-system/services'
import {
  QyIcon,
  QyButton,
  QyModal,
  QyPagination,
  QySwitch,
  QyForm,
  QyFormItem
} from '@/design-system/components'
import { Tag, Divider, Checkbox, Empty, Card } from '@/design-system/base'
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markMultipleAsRead,
  markAllAsRead,
  deleteNotification,
  deleteMultipleNotifications,
  getNotificationPreference,
  updateNotificationPreference,
  type Notification,
  type NotificationPreference,
  type NotificationType
} from '@/modules/notification/api'

const notifications = ref<Notification[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const currentFilter = ref<string>('all')
const selectedIds = ref<string[]>([])
const unreadCount = ref(0)

const showSettingsDialog = ref(false)
const preferences = ref<NotificationPreference>({
  user_id: '',
  channel_enabled: {
    in_app: true,
    email: false,
    sms: false,
    push: false
  },
  type_enabled: {
    system: true,
    comment: true,
    like: true,
    follow: true,
    message: true,
    achievement: true
  }
})

const quietHoursEnabled = ref(false)
const quietHoursStart = ref('22:00')
const quietHoursEnd = ref('08:00')

// 当前筛选器文本
const currentFilterText = computed(() => {
  const map: Record<string, string> = {
    all: '全部通知',
    unread: '未读通知',
    system: '系统通知',
    comment: '评论通知',
    like: '点赞通知',
    follow: '关注通知',
    message: '私信通知'
  }
  return map[currentFilter.value] || '全部通知'
})

// 空状态文本
const emptyText = computed(() => {
  const map: Record<string, string> = {
    all: '暂无通知',
    unread: '暂无未读通知',
    system: '暂无系统通知',
    comment: '暂无评论通知',
    like: '暂无点赞通知',
    follow: '暂无关注通知',
    message: '暂无私信通知'
  }
  return map[currentFilter.value] || '暂无通知'
})

// 获取通知列表
const loadNotifications = async (page = currentPage.value) => {
  loading.value = true
  try {
    const params: any = {
      page,
      page_size: pageSize.value
    }

    if (currentFilter.value !== 'all') {
      if (currentFilter.value === 'unread') {
        params.status = 'unread'
      } else {
        params.type = currentFilter.value
      }
    }

    const res = await getNotifications(params)
    notifications.value = res.items || []
    total.value = res.total || 0
    currentPage.value = page
  } catch (error) {
    message.error('获取通知列表失败')
  } finally {
    loading.value = false
  }
}

// 获取未读数量
const loadUnreadCount = async () => {
  try {
    const res = await getUnreadCount()
    unreadCount.value = res.count || 0
  } catch (error) {
    console.error('获取未读数量失败', error)
  }
}

// 筛选变更
const handleFilterChange = (filter: string) => {
  currentFilter.value = filter
  selectedIds.value = []
  currentPage.value = 1
  loadNotifications(1)
}

// 点击通知
const handleNotificationClick = (notification: Notification) => {
  if (notification.status === 'unread') {
    handleMarkAsRead(notification.id)
  }

  // 实现通知点击跳转逻辑
  const link = (notification as unknown as { link?: string }).link
  if (link) {
    // 如果通知包含link字段，直接跳转
    window.location.href = link
  } else if (notification.data) {
    // 根据通知类型和数据跳转到相应页面
    const { type, data } = notification

    switch (type) {
      case 'comment':
        // 评论通知：跳转到评论所在的书详情页
        if (data.book_id) {
          window.location.href = `/books/${data.book_id}#comment-${data.comment_id}`
        }
        break

      case 'like':
        // 点赞通知：跳转到被点赞的内容
        if (data.book_id) {
          window.location.href = `/books/${data.book_id}`
        } else if (data.comment_id) {
          window.location.href = `/books/${data.book_id}#comment-${data.comment_id}`
        }
        break

      case 'follow':
        // 关注通知：跳转到用户主页
        if (data.follower_id) {
          window.location.href = `/users/${data.follower_id}`
        }
        break

      case 'message':
        // 私信通知：跳转到消息详情页
        if (data.conversation_id) {
          window.location.href = `/messages/${data.conversation_id}`
        } else {
          window.location.href = '/messages'
        }
        break

      case 'system':
        // 系统通知：根据action类型跳转
        if (data.action === 'book_update' && data.book_id) {
          window.location.href = `/books/${data.book_id}`
        } else if (data.action === 'achievement' && data.achievement_id) {
          window.location.href = `/achievements/${data.achievement_id}`
        }
        break

      case 'achievement':
        // 成就通知：跳转到成就详情页
        if (data.achievement_id) {
          window.location.href = `/achievements/${data.achievement_id}`
        } else {
          window.location.href = '/achievements'
        }
        break

      default:
        // 默认不做跳转
        console.log('Unknown notification type:', type)
    }
  }
}

// 标记已读
const handleMarkAsRead = async (id: string) => {
  try {
    await markAsRead(id)
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.status = 'read'
      notification.read_at = new Date().toISOString()
    }
    loadUnreadCount()
  } catch (error) {
    message.error('标记失败')
  }
}

// 批量标记已读
const handleBatchMarkRead = async () => {
  try {
    await markMultipleAsRead(selectedIds.value)
    message.success(`已标记 ${selectedIds.value.length} 条通知为已读`)
    selectedIds.value = []
    loadNotifications(currentPage.value)
    loadUnreadCount()
  } catch (error) {
    message.error('批量标记失败')
  }
}

// 全部标记已读
const handleMarkAllRead = async () => {
  try {
    const res = await markAllAsRead()
    message.success(`已标记 ${res.count || 0} 条通知为已读`)
    loadNotifications(currentPage.value)
    loadUnreadCount()
  } catch (error) {
    message.error('操作失败')
  }
}

// 删除通知
const handleDelete = async (id: string) => {
  try {
    await deleteNotification(id)
    notifications.value = notifications.value.filter(n => n.id !== id)
    total.value--
    loadUnreadCount()
  } catch (error) {
    message.error('删除失败')
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await messageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 条通知吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })

    await deleteMultipleNotifications(selectedIds.value)
    message.success('删除成功')
    selectedIds.value = []
    loadNotifications(currentPage.value)
    loadUnreadCount()
  } catch (error: any) {
    if (error !== 'cancel') {
      message.error('删除失败')
    }
  }
}

// 选择变更
const handleSelectChange = (id: string, checked: boolean | string[]) => {
  const isChecked = Array.isArray(checked) ? checked.includes(id) : checked
  if (isChecked) {
    selectedIds.value.push(id)
  } else {
    const index = selectedIds.value.indexOf(id)
    if (index > -1) {
      selectedIds.value.splice(index, 1)
    }
  }
}

// 获取通知图标
const getNotificationIcon = (type: NotificationType) => {
  const map: Record<string, string> = {
    system: 'Bell',
    comment: 'ChatDotRound',
    like: 'Star',
    follow: 'User',
    message: 'ChatDotRound',
    achievement: 'Trophy'
  }
  return map[type] || 'Bell'
}

// 获取通知颜色
const getNotificationColor = (type: NotificationType) => {
  const map: Record<string, string> = {
    system: '#409eff',
    comment: '#67c23a',
    like: '#e6a23c',
    follow: '#f56c6c',
    message: '#909399',
    achievement: '#ffd666'
  }
  return map[type] || '#409eff'
}

// 格式化相对时间
const formatRelativeTime = (date: string) => {
  const now = new Date()
  const target = new Date(date)
  const diff = now.getTime() - target.getTime()

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`
  } else {
    return target.toLocaleDateString('zh-CN')
  }
}

// 加载偏好设置
const loadPreferences = async () => {
  try {
    const res = await getNotificationPreference()
    preferences.value = res

    if (res.quiet_hours_start && res.quiet_hours_end) {
      quietHoursEnabled.value = true
      quietHoursStart.value = res.quiet_hours_start
      quietHoursEnd.value = res.quiet_hours_end
    }
  } catch (error) {
    console.error('获取通知设置失败', error)
  }
}

// 保存设置
const handleSaveSettings = async () => {
  try {
    const data: any = {
      channel_enabled: preferences.value.channel_enabled,
      type_enabled: preferences.value.type_enabled
    }

    if (quietHoursEnabled.value) {
      data.quiet_hours_start = quietHoursStart.value
      data.quiet_hours_end = quietHoursEnd.value
    }

    await updateNotificationPreference(data)
    message.success('设置保存成功')
    showSettingsDialog.value = false
  } catch (error) {
    message.error('保存失败')
  }
}

onMounted(() => {
  loadNotifications()
  loadUnreadCount()
  loadPreferences()
})
</script>

<style scoped lang="scss">
.notification-container {
  padding: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  .header-actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .filter-trigger {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border-radius: 4px;
    transition: background 0.2s;

    &:hover {
      background: var(--el-fill-color-light);
    }
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin-bottom: 16px;
  background: var(--el-fill-color-light);
  border-radius: 4px;

  .selection-info {
    color: var(--el-text-color-regular);
    font-size: 14px;
  }

  .toolbar-actions {
    display: flex;
    gap: 8px;
  }
}

.notification-list {
  min-height: 400px;

  .notification-item {
    display: flex;
    padding: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: var(--el-fill-color-light);
    }

    &--unread {
      background: var(--el-fill-color-extra-light);
    }

    &--selected {
      background: var(--el-color-primary-light-9);
    }

    .qy-checkbox {
      margin-right: 12px;
    }

    .notification-icon {
      margin-right: 16px;
      flex-shrink: 0;
    }

    .notification-content {
      flex: 1;
      min-width: 0;

      .notification-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;

        .title-unread {
          font-weight: 600;
        }
      }

      .notification-text {
        color: var(--el-text-color-regular);
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 8px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .notification-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .notification-time {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }

        .notification-actions {
          display: flex;
          gap: 8px;
        }
      }
    }
  }
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

// 设置对话框
h4 {
  margin: 0 0 16px;
  font-size: 14px;
  font-weight: 600;
}

.qy-divider {
  margin: 16px 0;
}
</style>
