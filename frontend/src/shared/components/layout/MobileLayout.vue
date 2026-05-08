<template>
  <div class="mobile-layout" :class="{ 'safe-area': hasSafeArea }">
    <!-- iOS安全区域 - 顶部 -->
    <div v-if="hasSafeArea" class="mobile-safe-area-top"></div>

    <!-- 顶部状态栏（可选） -->
    <div v-if="showStatusBar" class="mobile-status-bar">
      <slot name="status-bar">
        <span class="status-bar-time">{{ currentTime }}</span>
      </slot>
    </div>

    <!-- 主内容区 -->
    <div class="mobile-content" :class="{ 'with-tab-bar': showTabBar }">
      <router-view v-slot="{ Component, route }">
        <transition :name="getTransition(route)" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </div>

    <!-- 底部导航栏 -->
    <transition name="slide-up">
      <div v-if="showTabBar" class="mobile-tab-bar">
        <div
          v-for="tab in tabs"
          :key="tab.path"
          class="tab-item"
          :class="{ active: isActive(tab.path) }"
          @click="navigate(tab.path)"
        >
          <el-icon :size="24">
            <component :is="tab.icon" />
          </el-icon>
          <span class="tab-label">{{ tab.label }}</span>

          <!-- 角标 -->
          <div v-if="tab.badge" class="tab-badge">
            {{ tab.badge > 99 ? '99+' : tab.badge }}
          </div>

          <!-- 红点 -->
          <div v-if="tab.dot" class="tab-dot"></div>
        </div>
      </div>
    </transition>

    <!-- iOS安全区域 - 底部 -->
    <div v-if="hasSafeArea && showTabBar" class="mobile-safe-area-bottom"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { HomeFilled, Reading, ChatDotRound, Collection, User } from '@element-plus/icons-vue'

interface TabItem {
  path: string
  label: string
  icon: any
  badge?: number
  dot?: boolean
}

const route = useRoute()
const router = useRouter()

// 安全区域检测
const hasSafeArea = ref(false)
const showStatusBar = ref(false)
const currentTime = ref('')

// 底部导航栏配置
const tabs = ref<TabItem[]>([
  { path: '/bookstore', label: '首页', icon: HomeFilled },
  { path: '/bookstore/books', label: '书库', icon: Reading },
  { path: '/community', label: '社区', icon: ChatDotRound },
  { path: '/reading/bookshelf', label: '书架', icon: Collection },
  { path: '/account/profile', label: '我的', icon: User }
])

// 是否显示底部导航栏
const showTabBar = computed(() => {
  // 在登录页、注册页等页面不显示
  const hidePaths = ['/login', '/register', '/auth', '/404', '/writer/editor', '/writer/project']
  return !hidePaths.some(path => route.path.startsWith(path)) &&
         route.meta.showTabBar !== false
})

// 检测是否激活
const isActive = (path: string) => {
  return route.path.startsWith(path)
}

// 导航跳转
const navigate = (path: string) => {
  if (route.path !== path) {
    router.push(path)
  }
}

// 获取页面转场动画
const getTransition = (currentRoute: any) => {
  return currentRoute.meta.transition || 'slide-fade'
}

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

// 检测安全区域
const checkSafeArea = () => {
  // 检测是否为 iOS 设备
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

  // 检测是否有刘海屏
  const hasNotch = window.CSS?.supports?.('padding-top', 'env(safe-area-inset-top)')

  hasSafeArea.value = isIOS && hasNotch
}

// 更新通知角标（从 Pinia store 获取）
const updateNotificationBadge = () => {
  // 这里可以从 notification store 获取未读消息数
  // const notificationStore = useNotificationStore()
  // const messageTab = tabs.value.find(t => t.path === '/messages')
  // if (messageTab) {
  //   messageTab.badge = notificationStore.unreadCount || undefined
  // }
}

onMounted(() => {
  checkSafeArea()
  updateTime()
  updateNotificationBadge()

  // 每分钟更新时间
  const timer = setInterval(updateTime, 60000)

  onUnmounted(() => {
    clearInterval(timer)
  })
})

// 监听路由变化，更新角标
watch(() => route.path, () => {
  updateNotificationBadge()
})
</script>

<style scoped lang="scss">
.mobile-layout {
  min-height: 100vh;
  background: #f5f5f5;
  position: relative;

  &.safe-area {
    padding-top: env(safe-area-inset-top);
  }
}

.mobile-safe-area-top {
  height: env(safe-area-inset-top);
  background: #fff;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
}

.mobile-status-bar {
  height: 44px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 600;

  .status-bar-time {
    color: #333;
  }
}

.mobile-content {
  min-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;

  &.with-tab-bar {
    padding-bottom: 56px + env(safe-area-inset-bottom);
  }
}

// 底部导航栏
.mobile-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid #eee;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  position: relative;
  padding: 8px 0;
  cursor: pointer;
  transition: color 0.3s;

  &:active {
    opacity: 0.7;
  }

  &.active {
    color: var(--el-color-primary, #409eff);
  }

  .tab-label {
    font-size: 11px;
    margin-top: 2px;
    line-height: 1.2;
  }

  .tab-badge {
    position: absolute;
    top: 4px;
    right: 25%;
    background: #f56c6c;
    color: #fff;
    font-size: 10px;
    padding: 0 5px;
    border-radius: 10px;
    min-width: 16px;
    height: 16px;
    line-height: 16px;
    text-align: center;
    font-weight: 500;
  }

  .tab-dot {
    position: absolute;
    top: 6px;
    right: 30%;
    width: 8px;
    height: 8px;
    background: #f56c6c;
    border-radius: 50%;
  }
}

.mobile-safe-area-bottom {
  height: env(safe-area-inset-bottom);
  background: #fff;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

// 页面转场动画
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

// 响应式：桌面端隐藏移动端布局
@media (min-width: 768px) {
  .mobile-layout {
    display: none;
  }
}
</style>
