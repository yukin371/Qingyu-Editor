<template>
  <div class="notification-bell" @click="goToNotifications">
    <!-- el-icon用于动态组件，保留 -->
    <el-icon :size="24" :class="{ 'has-notification': hasUnread }">
      <QyIcon name="Bell"  />
    </el-icon>

    <!-- 未读数量角标 -->
    <transition name="bounce">
      <div v-if="displayCount" class="notification-badge">
        {{ displayCount }}
      </div>
    </transition>

    <!-- 红点（当数量很大时显示） -->
    <transition name="fade">
      <div v-if="hasUnread && !displayCount" class="notification-dot"></div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { QyIcon } from '@/design-system/components'
import { useNotificationStore } from '@/stores/notification'

const router = useRouter()
const notificationStore = useNotificationStore()

// 未读数量
const unreadCount = computed(() => notificationStore.unreadCount)

// 是否有未读消息
const hasUnread = computed(() => unreadCount.value > 0)

// 显示的数量（超过99显示99+）
const displayCount = computed(() => {
  if (unreadCount.value > 0 && unreadCount.value <= 99) {
    return unreadCount.value
  }
  return null
})

// 跳转到通知中心
const goToNotifications = () => {
  router.push('/notifications')
}
</script>

<style scoped lang="scss">
.notification-bell {
  position: relative;
  cursor: pointer;
  padding: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  /* Element Plus样式引用（el-icon用于动态组件） */
  .el-icon {
    transition: all 0.3s;
    color: #606266;

    &.has-notification {
      color: var(--el-color-primary);
      animation: ring 0.5s ease-in-out;
    }
  }

  &:hover {
    .el-icon {
      transform: scale(1.1);
    }
  }

  &:active {
    .el-icon {
      transform: scale(0.95);
    }
  }
}

.notification-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #f56c6c;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  min-width: 18px;
  height: 18px;
  line-height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(245, 108, 108, 0.3);
}

.notification-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background: #f56c6c;
  border-radius: 50%;
  box-shadow: 0 0 0 2px #fff;
}

// 动画
@keyframes ring {
  0%, 100% { transform: rotate(0deg); }
  10%, 30% { transform: rotate(-10deg); }
  20%, 40% { transform: rotate(10deg); }
}

.bounce-enter-active {
  animation: bounce-in 0.3s;
}

.bounce-leave-active {
  animation: bounce-in 0.3s reverse;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
