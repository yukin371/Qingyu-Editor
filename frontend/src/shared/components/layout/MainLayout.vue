<template>
  <div class="main-layout">
    <!-- 顶部导航栏 (增加了 glass-effect 类) -->
    <el-header class="layout-header glass-effect">
      <div class="header-container">
        <!-- Logo 区域：增加设计感 -->
        <div class="header-logo" @click="goHome">
          <div class="logo-wrapper">
            <img src="/favicon.ico" alt="Logo" class="logo-icon" />
          </div>
          <div class="logo-text-group">
            <span class="logo-cn">青羽阅读</span>
            <span class="logo-en">QingYu Books</span>
          </div>
        </div>

        <!-- 导航菜单：自定义高级样式替代 el-menu -->
        <nav class="nav-links">
          <a
            v-for="item in menuItems"
            :key="item.path"
            :class="['nav-item', { active: activeMenu === item.path }]"
            @click="handleMenuSelect(item.path)"
          >
            {{ item.name }}
            <!-- 激活状态下的光点 -->
            <span class="active-dot" v-if="activeMenu === item.path"></span>
          </a>
        </nav>

        <!-- 右侧功能区 -->
        <div class="header-right">
          <!-- 搜索框：胶囊样式 -->
          <div class="search-wrapper" :class="{ focused: searchFocused }">
            <el-icon class="search-icon">
              <QyIcon name="Search" />
            </el-icon>
            <input
              id="main-search-input"
              name="search"
              v-model="searchKeyword"
              type="text"
              placeholder="探索未知的世界..."
              class="custom-search-input"
              @focus="searchFocused = true"
              @blur="searchFocused = false"
              @keyup.enter="handleSearch"
            />
          </div>

          <!-- 创作中心按钮 -->
          <el-button
            v-if="showUserControls"
            class="create-btn"
            round
            @click="router.push('/writer')"
          >
            <span class="create-icon-chip">
              <QyIcon name="EditPen" />
            </span>
            <span>创作</span>
          </el-button>

          <!-- 用户操作区 -->
          <div class="user-actions">
            <template v-if="isLoggedIn">
              <el-dropdown trigger="click" @command="handleUserCommand">
                <div class="user-info-premium">
                  <QyAvatar
                    size="sm"
                    :src="userAvatar"
                    :text="userDisplayName"
                    class="user-avatar"
                  />
                  <!-- 名字只在hover时显示或简化显示 -->
                </div>
                <template #dropdown>
                  <el-dropdown-menu class="premium-dropdown">
                    <!-- 保持原有下拉菜单项不变 -->
                    <el-dropdown-item command="profile"
                      ><QyIcon name="User" />个人中心</el-dropdown-item
                    >
                    <el-dropdown-item command="writer-home"
                      ><QyIcon name="EditPen" />创作工作台</el-dropdown-item
                    >
                    <el-dropdown-item command="shelf"
                      ><QyIcon name="Collection" />我的书架</el-dropdown-item
                    >
                    <el-dropdown-item command="history"
                      ><QyIcon name="Clock" />阅读历史</el-dropdown-item
                    >
                    <el-dropdown-item divided command="logout"
                      ><QyIcon name="SwitchButton" />退出登录</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
            <template v-else>
              <div class="auth-btns">
                <el-button class="login-btn" text @click="goToAuth('login')">登录</el-button>
                <el-button class="register-btn" type="primary" round @click="goToAuth('register')"
                  >注册</el-button
                >
              </div>
            </template>
          </div>

          <!-- 移动端菜单按钮 -->
          <div class="mobile-toggle" @click="drawerVisible = true">
            <el-icon :size="24">
              <Menu />
            </el-icon>
          </div>
        </div>
      </div>
    </el-header>

    <!-- 主内容区 -->
    <el-main class="layout-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </el-main>

    <!-- 底部 -->
    <el-footer v-if="showFooter" class="layout-footer">
      <div class="footer-container">
        <div class="footer-content">
          <div class="footer-section">
            <h4>关于我们</h4>
            <p>青羽阅读致力于提供最优质的阅读体验</p>
          </div>
          <div class="footer-section">
            <h4>快速链接</h4>
            <ul>
              <li><a href="/about">关于</a></li>
              <li><a href="/help">帮助</a></li>
              <li><a href="/feedback">反馈</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>联系我们</h4>
            <p>邮箱: contact@qingyu.com</p>
          </div>
        </div>
        <div class="footer-copyright">
          <p>&copy; 2025 青羽阅读. All rights reserved.</p>
        </div>
      </div>
    </el-footer>

    <!-- 移动端抽屉菜单 -->
    <el-drawer
      v-model="drawerVisible"
      title="导航"
      direction="rtl"
      size="280px"
      :modal="false"
      :append-to-body="true"
      :z-index="9999"
      class="mobile-navigation-drawer"
    >
      <el-menu :default-active="activeMenu" @select="handleMenuSelect">
        <el-menu-item index="/">
          <QyIcon name="HomeFilled" />
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/bookstore/browse">
          <QyIcon name="Reading" />
          <span>书库</span>
        </el-menu-item>
        <el-menu-item index="/bookstore/rankings">
          <QyIcon name="TrendCharts" />
          <span>榜单</span>
        </el-menu-item>
        <el-menu-item index="/discovery">
          <QyIcon name="ChatDotRound" />
          <span>广场</span>
        </el-menu-item>
        <el-menu-item v-if="isLoggedIn" index="/profile">
          <QyIcon name="User" />
          <span>个人中心</span>
        </el-menu-item>
      </el-menu>
    </el-drawer>

    <!-- 回到顶部 -->
    <BackTop :right="24" :bottom="24" shape="circle" size="medium" :visibility-height="300" />

    <!-- 快捷登录对话框 -->
    <el-dialog
      v-model="showQuickLogin"
      title="欢迎回来"
      width="400px"
      class="premium-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="quickLoginForm" :rules="quickLoginRules" ref="quickLoginFormRef">
        <el-form-item prop="username">
          <el-input
            v-model="quickLoginForm.username"
            placeholder="用户名或邮箱"
            size="large"
            clearable
            @keyup.enter="handleQuickLogin"
          >
            <template #prefix>
              <QyIcon name="User" />
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="quickLoginForm.password"
            type="password"
            placeholder="密码"
            size="large"
            show-password
            @keyup.enter="handleQuickLogin"
          >
            <template #prefix>
              <QyIcon name="Lock" />
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <div class="quick-login-footer">
            <el-checkbox v-model="quickLoginForm.rememberMe">记住我</el-checkbox>
            <el-link type="primary" @click="goToAuth('reset')">忘记密码？</el-link>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showQuickLogin = false">取消</el-button>
          <el-button type="primary" @click="handleQuickLogin" :loading="quickLoginLoading">
            登录
          </el-button>
        </div>
        <div class="register-hint">
          还没有账号？
          <el-link type="primary" @click="goToAuth('register')">立即注册</el-link>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { message, messageBox } from '@/design-system/services'
import type { FormInstance, FormRules } from 'element-plus'
import { QyIcon } from '@/design-system/components'
import QyAvatar from '@/design-system/components/basic/QyAvatar/QyAvatar.vue'
import { BackTop } from '@/design-system/other'
import { Menu } from '@element-plus/icons-vue'
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const searchKeyword = ref('')
const searchFocused = ref(false) // 新增：控制搜索框样式
const drawerVisible = ref(false)
const showFooter = computed(() => !route.meta.hideFooter)

// 菜单配置
const menuItems = [
  { name: '首页', path: '/bookstore' },
  { name: '书库', path: '/bookstore/browse' },
  { name: '榜单', path: '/bookstore/rankings' },
  { name: '广场', path: '/discovery' },
]

// 快捷登录相关
const showQuickLogin = ref(false)
const quickLoginLoading = ref(false)
const quickLoginFormRef = ref<FormInstance>()
const quickLoginForm = ref({
  username: '',
  password: '',
  rememberMe: false,
})

const quickLoginRules: FormRules = {
  username: [{ required: true, message: '请输入用户名或邮箱', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
}

// 用户信息
const isTestMode = computed(() => route.query.test === 'true')
const isLoggedIn = computed(() => authStore.isLoggedIn)
const showUserControls = computed(() => isLoggedIn.value)
const userAvatar = computed(() => {
  if (authStore.user?.avatar) return authStore.user.avatar
  return isTestMode.value ? '/images/avatars/avatar-demo.svg' : '/images/avatars/avatar-default.svg'
})
const userDisplayName = computed(() => {
  if (authStore.user?.nickname || authStore.user?.username) {
    return authStore.user?.nickname || authStore.user?.username || '用户'
  }
  return isTestMode.value ? '测试用户' : '用户'
})

// 当前激活的菜单
const activeMenu = computed(() => {
  const path = route.path
  if (path === '/' || path === '/bookstore') return '/bookstore'
  if (path === '/bookstore/browse' || path.startsWith('/bookstore/browse'))
    return '/bookstore/browse'
  if (path.startsWith('/bookstore/rankings')) return '/bookstore/rankings'
  if (path.startsWith('/discovery')) return '/discovery'
  return '/bookstore'
})

// 菜单选择处理
const handleMenuSelect = (index: string) => {
  router.push(index)
  drawerVisible.value = false
}

// 搜索处理
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    message.warning('请输入搜索关键词')
    return
  }
  router.push({
    path: '/bookstore/search',
    query: { q: searchKeyword.value },
  })
}

// 回到首页
const goHome = () => {
  router.push('/bookstore')
}

// 跳转认证页面
const goToAuth = (mode: 'login' | 'register' | 'reset' = 'login') => {
  showQuickLogin.value = false
  router.push({ path: '/auth', query: { mode } })
}

// 快捷登录处理
const handleQuickLogin = async () => {
  if (!quickLoginFormRef.value) return

  await quickLoginFormRef.value.validate(async (valid) => {
    if (valid) {
      quickLoginLoading.value = true
      try {
        await authStore.login({
          username: quickLoginForm.value.username,
          password: quickLoginForm.value.password,
        })

        message.success('登录成功')
        showQuickLogin.value = false

        // 重置表单
        quickLoginForm.value = {
          username: '',
          password: '',
          rememberMe: false,
        }
      } catch (error: any) {
        message.error(error.message || '登录失败')
      } finally {
        quickLoginLoading.value = false
      }
    }
  })
}

// 用户菜单命令处理
const handleUserCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/account/profile')
      break
    case 'writer-home':
      router.push('/writer')
      break
    case 'shelf':
      router.push('/reading/bookshelf')
      break
    case 'history':
      router.push('/reading/history')
      break
    case 'logout':
      if (!authStore.isLoggedIn && isTestMode.value) {
        message.success('测试模式下已退出模拟登录')
        router.push({
          path: '/auth',
          query: { ...(route.query as Record<string, any>), mode: 'login' },
        })
        return
      }
      try {
        await messageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        })
        await authStore.logout()
        message.success('已退出登录')
        // 跳转到登录页
        router.push('/login')
      } catch (error) {
        // 用户取消或登出失败
        if (error !== 'cancel') {
          console.error('退出登录失败:', error)
          message.error('退出登录失败，请稍后重试')
        }
      }
      break
  }
}
</script>

<style scoped lang="scss">
.layout-main {
  flex: 1;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 20px 40px;
  /* 根据需要调整间距 */
  box-sizing: border-box;
}

/* --- Header 核心样式 --- */
.layout-header {
  padding: 0;
  height: 70px;
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;

  /* 毛玻璃特效 */
  &.glass-effect {
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.04);
  }

  .header-container {
    max-width: 1440px;
    /* 更宽的视域 */
    margin: 0 auto;
    height: 100%;
    padding: 0 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    /* 两端对齐 */
  }
}

/* --- Logo 样式 --- */
.header-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;

  .logo-icon {
    width: 36px;
    height: 36px;
    transition: transform 0.5s ease;
  }

  &:hover .logo-icon {
    transform: rotate(15deg);
  }

  .logo-text-group {
    display: flex;
    flex-direction: column;
    line-height: 1;

    .logo-cn {
      font-size: 22px;
      font-weight: 800;
      /* 加粗 */
      background: linear-gradient(45deg, #2c3e50, #409eff);
      /* 渐变文字 */
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      letter-spacing: 1px;
    }

    .logo-en {
      font-size: 12px;
      color: #909399;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-top: 3px;
    }
  }
}

/* --- 导航链接样式 --- */
.nav-links {
  display: flex;
  align-items: center;
  gap: 40px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  /* 居中显示 */

  .nav-item {
    font-size: 16px;
    color: var(--text-secondary);
    font-weight: 500;
    cursor: pointer;
    position: relative;
    transition: color 0.3s ease;
    padding: 8px 0;

    &:hover {
      color: var(--primary-color);
    }

    &.active {
      color: #2c3e50;
      font-weight: 600;
    }

    /* 激活状态的小圆点 */
    .active-dot {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 4px;
      background-color: var(--primary-color);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--primary-color);
    }
  }
}

/* --- 右侧功能区 --- */
.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* 搜索框高级样式 */
.search-wrapper {
  display: flex;
  align-items: center;
  background: #f0f2f5;
  border-radius: 20px;
  /* 全圆角 */
  padding: 0 16px;
  height: 36px;
  width: 200px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  border: 1px solid transparent;

  &.focused {
    width: 300px;
    /* 聚焦时变宽 */
    background: #fff;
    border-color: var(--primary-color);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  }

  .search-icon {
    font-size: 16px;
    color: #909399;
    margin-right: 8px;
  }

  .custom-search-input {
    border: none;
    background: transparent;
    outline: none;
    width: 100%;
    font-size: 14px;
    color: #333;

    &::placeholder {
      color: #a8abb2;
    }
  }
}

/* --- Footer 底部优化样式 --- */
.layout-footer {
  background-color: #23272e;
  /* 深色背景，沉稳 */
  color: #909399;
  padding: 0 !important;
  /*以此覆盖 Element 的默认 padding */
  height: auto !important;
  /* 覆盖 Element 默认的 60px 高度限制 */
  margin-top: auto;
  /* 双重保险让 footer 沉底 */
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 24px 20px;
  /* 上左右下 */
}

.footer-content {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 40px;
  padding-bottom: 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-section {
  flex: 1;
  min-width: 200px;

  h4 {
    color: #fff;
    font-size: 18px;
    margin-bottom: 24px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  p {
    font-size: 14px;
    line-height: 1.8;
    color: #909399;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      margin-bottom: 12px;

      a {
        color: #909399;
        text-decoration: none;
        font-size: 14px;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;

        &:hover {
          color: var(--primary-color);
          transform: translateX(5px);
          /* hover 时轻微右移 */
        }
      }
    }
  }
}

.footer-copyright {
  padding-top: 20px;
  text-align: center;
  font-size: 13px;
  color: #606266;

  p {
    margin: 0;
  }
}

/* --- 移动端 Footer 适配 --- */
@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 30px;
    text-align: center;
  }

  .footer-section {
    h4 {
      margin-bottom: 16px;
    }

    ul li a:hover {
      transform: none;
      /* 移动端取消位移效果 */
    }
  }

  .layout-main {
    padding: 16px;
    /* 移动端减小内边距 */
  }
}

/* 创作按钮 */
.create-btn {
  background: linear-gradient(135deg, #409eff 0%, #2b7de9 100%);
  border: none;
  color: #fff;
  font-weight: 600;
  padding: 0 24px;
  height: 42px;
  font-size: 15px;
  border-radius: 999px;
  gap: 8px;
  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.28);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 24px rgba(64, 158, 255, 0.34);
    filter: saturate(1.05);
  }
}

.create-icon-chip {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.24);
}

/* 用户头像区 */
.user-info-premium {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  padding: 0;
  border-radius: 50%;
  border: 2px solid rgba(64, 158, 255, 0.25);
  box-sizing: border-box;
  box-shadow: 0 2px 10px rgba(64, 158, 255, 0.18);
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    border-color: var(--primary-color);
    transform: translateY(-1px);
  }
}

.user-avatar {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  flex: 0 0 38px;
}

.auth-btns {
  display: flex;
  align-items: center;
  gap: 12px;

  .login-btn {
    color: #606266;

    &:hover {
      color: var(--primary-color);
    }
  }

  .register-btn {
    padding: 8px 24px;
  }
}

.mobile-toggle {
  display: none;
  cursor: pointer;
  color: #606266;
}

/* --- 响应式调整 --- */
@media (max-width: 1024px) {
  .nav-links {
    display: none;
    /* 平板以下隐藏中间导航 */
  }

  .header-right {
    margin-left: auto;

    .search-wrapper {
      display: none;
      /* 空间不足时隐藏搜索框，或者只显示图标 */
    }
  }

  .mobile-toggle {
    display: block;
    margin-left: 16px;
  }
}

/* 页面过渡动画：淡入+上滑 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

<style>
/* 修复 Element Plus 抽屉定位问题 */
.mobile-navigation-drawer {
  position: fixed !important;
}

.mobile-navigation-drawer .el-drawer__body {
  overflow-y: auto;
}

/* 强制覆盖所有可能的定位问题 */
:deep(.el-drawer) {
  position: fixed !important;
  top: 0 !important;
  bottom: 0 !important;
}

:deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-drawer.rtl) {
  z-index: 9999 !important;
}
</style>

<style>
/* 全局覆盖 Element Plus 下拉菜单样式，使其更高级 */
.premium-dropdown {
  border-radius: 12px !important;
  padding: 8px !important;
  border: none !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1) !important;
}

.el-dropdown-menu__item {
  border-radius: 8px;
  margin-bottom: 2px;
}

.el-dropdown-menu__item:hover {
  background-color: #f0f7ff !important;
  color: #409eff !important;
}

/* 覆盖 Dialog 样式 */
.premium-dialog {
  border-radius: 16px !important;
  overflow: hidden;
}
</style>
