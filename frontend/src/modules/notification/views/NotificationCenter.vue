<template>
  <div class="notification-center">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>消息中心</h1>
        <div class="header-actions">
          <div class="connection-status" :class="connectionStatusClass">
            <QyIcon :name="connectionStatusIcon"  />
            <span>{{ connectionStatusText }}</span>
          </div>
        </div>
      </div>

      <!-- 通知内容 -->
      <NotificationList />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { QyIcon } from '@/design-system/components'
import NotificationList from '../components/NotificationList.vue'
import { useNotificationStore } from '@/stores/notification'

const notificationStore = useNotificationStore()

// 连接状态
const connectionStatus = computed(() => {
  return {
    connected: notificationStore.isConnected,
    mode: notificationStore.connectionMode
  }
})

const connectionStatusClass = computed(() => {
  if (!connectionStatus.value.connected) {
    return 'disconnected'
  }
  return connectionStatus.value.mode
})

const connectionStatusIcon = computed(() => {
  if (!connectionStatus.value.connected) {
    return 'Warning'
  }
  return connectionStatus.value.mode === 'websocket' ? 'CircleCheck' : 'Loading'
})

const connectionStatusText = computed(() => {
  if (!connectionStatus.value.connected) {
    return '未连接'
  }
  return connectionStatus.value.mode === 'websocket' ? '实时消息' : '轮询模式'
})

onMounted(async () => {
  // 初始化通知系统
  await notificationStore.initialize()
})

onUnmounted(() => {
  // 不在这里断开连接，因为其他页面可能也需要通知
})
</script>

<style scoped lang="scss">
.notification-center {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px 0 40px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  h1 {
    font-size: 24px;
    font-weight: 700;
    color: #303133;
    margin: 0;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .connection-status {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;

    &.websocket {
      background: #f0f9ff;
      color: #409eff;
    }

    &.polling {
      background: #fef0f0;
      color: #f56c6c;
    }

    &.disconnected {
      background: #fff3e0;
      color: #e6a23c;
    }

    /* Element Plus样式引用（el-icon用于动态组件） */
    .el-icon {
      font-size: 16px;
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 16px;

    h1 {
      font-size: 20px;
    }
  }
}
</style>
