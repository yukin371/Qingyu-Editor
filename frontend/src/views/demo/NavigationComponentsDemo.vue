<script setup lang="ts">
import { ref } from 'vue'
import { QyTopNav, QyBottomDock, QyTabBar } from '@/design-system/components'
import type { QyTopNavLink, QyBottomDockItem, QyTabBarTab } from '@/design-system/components'

// QyTopNav data
const topNavLinks = ref<QyTopNavLink[]>([
  { label: '首页', path: '/', active: true },
  { label: '书架', path: '/bookshelf' },
  { label: '发现', path: '/discover' },
  { label: '我的', path: '/profile' }
])

const avatarUrl = ref('https://api.dicebear.com/7.x/avataaars/svg?seed=Felix')

// QyBottomDock data
const bottomDockItems = ref<QyBottomDockItem[]>([
  {
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>',
    label: '首页',
    active: true
  },
  {
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>',
    label: '书架'
  },
  {
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3" /></svg>',
    label: '发现',
    highlight: true
  },
  {
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>',
    label: '我的',
    badge: 3
  }
])

const bottomDockPosition = ref<'bottom' | 'floating'>('floating')

// QyTabBar data
const tabBarActiveTab = ref('home')

const tabBarTabs = ref<QyTabBarTab[]>([
  {
    key: 'home',
    label: '首页',
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>'
  },
  {
    key: 'books',
    label: '书籍',
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>',
    badge: 5
  },
  {
    key: 'discover',
    label: '发现',
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3" /></svg>'
  },
  {
    key: 'profile',
    label: '我的',
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>'
  }
])

const tabBarPosition = ref<'bottom' | 'top'>('bottom')

// Event handlers
const handleTopNavLinkClick = (link: QyTopNavLink) => {
  console.log('TopNav link clicked:', link)
  // Update active state
  topNavLinks.value.forEach(l => l.active = l.path === link.path)
}

const handleTopNavAvatarClick = () => {
  console.log('TopNav avatar clicked')
}

const handleBottomDockItemClick = (item: QyBottomDockItem, index: number) => {
  console.log('BottomDock item clicked:', item, index)
  // Update active state
  bottomDockItems.value.forEach(i => i.active = false)
  bottomDockItems.value[index].active = true
}

const handleTabBarChange = (tab: QyTabBarTab, index: number) => {
  console.log('TabBar changed to:', tab, index)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-safe">
    <!-- Main Content -->
    <main class="pt-24 px-4 max-w-7xl mx-auto space-y-12">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-4xl font-bold text-slate-800 mb-4">
          Qingyu <span class="text-transparent bg-clip-text bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)]">Navigation</span> Components
        </h1>
        <p class="text-slate-600 text-lg">青羽风格导航组件展示</p>
      </div>

      <!-- QyTopNav Section -->
      <section class="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">QyTopNav - 顶部导航栏</h2>
        <div class="space-y-4">
          <p class="text-slate-600">顶部导航栏，支持响应式设计和自定义插槽。</p>

          <!-- Demo -->
          <div class="rounded-2xl overflow-hidden border border-white/50">
            <QyTopNav
              :links="topNavLinks"
              :avatar-url="avatarUrl"
              @link-click="handleTopNavLinkClick"
              @avatar-click="handleTopNavAvatarClick"
            />
          </div>

          <!-- Features -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div class="bg-white/40 rounded-xl p-4">
              <h3 class="font-semibold text-slate-800 mb-2">特性</h3>
              <ul class="text-sm text-slate-600 space-y-1">
                <li>✓ 响应式设计（移动端/桌面端）</li>
                <li>✓ 玻璃拟态效果</li>
                <li>✓ 自定义插槽支持</li>
                <li>✓ 固定/非固定定位</li>
              </ul>
            </div>
            <div class="bg-white/40 rounded-xl p-4">
              <h3 class="font-semibold text-slate-800 mb-2">Props</h3>
              <ul class="text-sm text-slate-600 space-y-1">
                <li>• logo: Logo文字或URL</li>
                <li>• links: 导航链接数组</li>
                <li>• avatarUrl: 头像URL</li>
                <li>• fixed: 固定定位</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- QyBottomDock Section -->
      <section class="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">QyBottomDock - 底部Dock导航</h2>
        <div class="space-y-4">
          <p class="text-slate-600">底部Dock导航，移动端全宽，桌面端浮动圆形Dock。</p>

          <!-- Position Toggle -->
          <div class="flex items-center gap-4 mb-4">
            <label class="text-sm font-medium text-slate-700">位置模式:</label>
            <button
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                bottomDockPosition === 'floating'
                  ? 'bg-[var(--color-primary-600)] text-white'
                  : 'bg-white/50 text-slate-600 hover:bg-white'
              ]"
              @click="bottomDockPosition = 'floating'"
            >
              浮动
            </button>
            <button
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                bottomDockPosition === 'bottom'
                  ? 'bg-[var(--color-primary-600)] text-white'
                  : 'bg-white/50 text-slate-600 hover:bg-white'
              ]"
              @click="bottomDockPosition = 'bottom'"
            >
              底部
            </button>
          </div>

          <!-- Demo -->
          <div class="h-32 rounded-2xl bg-gradient-to-br from-[var(--gradient-from)] to-[var(--gradient-to)] flex items-center justify-center relative">
            <QyBottomDock
              :items="bottomDockItems"
              :position="bottomDockPosition"
              @item-click="handleBottomDockItemClick"
            />
          </div>

          <!-- Features -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div class="bg-white/40 rounded-xl p-4">
              <h3 class="font-semibold text-slate-800 mb-2">特性</h3>
              <ul class="text-sm text-slate-600 space-y-1">
                <li>✓ 响应式Dock设计</li>
                <li>✓ 突出主操作按钮</li>
                <li>✓ 徽章支持</li>
                <li>✓ 悬停动画效果</li>
              </ul>
            </div>
            <div class="bg-white/40 rounded-xl p-4">
              <h3 class="font-semibold text-slate-800 mb-2">Props</h3>
              <ul class="text-sm text-slate-600 space-y-1">
                <li>• items: Dock项数组</li>
                <li>• position: 位置模式</li>
                <li>• showLabels: 显示标签</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- QyTabBar Section -->
      <section class="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">QyTabBar - 标签栏</h2>
        <div class="space-y-4">
          <p class="text-slate-600">标签栏组件，支持v-model双向绑定和徽章显示。</p>

          <!-- Position Toggle -->
          <div class="flex items-center gap-4 mb-4">
            <label class="text-sm font-medium text-slate-700">位置:</label>
            <button
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                tabBarPosition === 'bottom'
                  ? 'bg-[var(--color-primary-600)] text-white'
                  : 'bg-white/50 text-slate-600 hover:bg-white'
              ]"
              @click="tabBarPosition = 'bottom'"
            >
              底部
            </button>
            <button
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                tabBarPosition === 'top'
                  ? 'bg-[var(--color-primary-600)] text-white'
                  : 'bg-white/50 text-slate-600 hover:bg-white'
              ]"
              @click="tabBarPosition = 'top'"
            >
              顶部
            </button>
          </div>

          <!-- Demo -->
          <div class="h-32 rounded-2xl bg-gradient-to-br from-[var(--gradient-from)] to-[var(--gradient-to)] flex items-center justify-center relative">
            <QyTabBar
              v-model="tabBarActiveTab"
              :tabs="tabBarTabs"
              :position="tabBarPosition"
              @tab-change="handleTabBarChange"
            />
          </div>

          <!-- Active Tab Display -->
          <div class="bg-white/40 rounded-xl p-4">
            <p class="text-sm text-slate-600">
              当前激活: <span class="font-semibold text-[var(--color-primary-600)]">{{ tabBarActiveTab }}</span>
            </p>
          </div>

          <!-- Features -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div class="bg-white/40 rounded-xl p-4">
              <h3 class="font-semibold text-slate-800 mb-2">特性</h3>
              <ul class="text-sm text-slate-600 space-y-1">
                <li>✓ v-model双向绑定</li>
                <li>✓ 徽章支持</li>
                <li>✓ 顶部/底部位置</li>
                <li>✓ 平滑切换动画</li>
              </ul>
            </div>
            <div class="bg-white/40 rounded-xl p-4">
              <h3 class="font-semibold text-slate-800 mb-2">Props</h3>
              <ul class="text-sm text-slate-600 space-y-1">
                <li>• tabs: 标签数组</li>
                <li>• modelValue: 激活标签</li>
                <li>• position: 位置</li>
                <li>• showIcons/showLabels: 显示控制</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Component Comparison -->
      <section class="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">组件对比</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200">
                <th class="text-left py-3 px-4 font-semibold text-slate-800">特性</th>
                <th class="text-center py-3 px-4 font-semibold text-slate-800">QyTopNav</th>
                <th class="text-center py-3 px-4 font-semibold text-slate-800">QyBottomDock</th>
                <th class="text-center py-3 px-4 font-semibold text-slate-800">QyTabBar</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-slate-100">
                <td class="py-3 px-4 text-slate-600">固定定位</td>
                <td class="text-center py-3 px-4">✓</td>
                <td class="text-center py-3 px-4">✓</td>
                <td class="text-center py-3 px-4">✓</td>
              </tr>
              <tr class="border-b border-slate-100">
                <td class="py-3 px-4 text-slate-600">响应式设计</td>
                <td class="text-center py-3 px-4">✓</td>
                <td class="text-center py-3 px-4">✓</td>
                <td class="text-center py-3 px-4">✓</td>
              </tr>
              <tr class="border-b border-slate-100">
                <td class="py-3 px-4 text-slate-600">徽章支持</td>
                <td class="text-center py-3 px-4">-</td>
                <td class="text-center py-3 px-4">✓</td>
                <td class="text-center py-3 px-4">✓</td>
              </tr>
              <tr class="border-b border-slate-100">
                <td class="py-3 px-4 text-slate-600">v-model</td>
                <td class="text-center py-3 px-4">-</td>
                <td class="text-center py-3 px-4">-</td>
                <td class="text-center py-3 px-4">✓</td>
              </tr>
              <tr class="border-b border-slate-100">
                <td class="py-3 px-4 text-slate-600">突出按钮</td>
                <td class="text-center py-3 px-4">-</td>
                <td class="text-center py-3 px-4">✓</td>
                <td class="text-center py-3 px-4">-</td>
              </tr>
              <tr>
                <td class="py-3 px-4 text-slate-600">插槽支持</td>
                <td class="text-center py-3 px-4">✓</td>
                <td class="text-center py-3 px-4">-</td>
                <td class="text-center py-3 px-4">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Usage Example -->
      <section class="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">使用示例</h2>
        <div class="bg-slate-900 rounded-2xl p-6 overflow-x-auto">
          <pre class="text-sm text-slate-300"><code>&lt;template&gt;
  &lt;div&gt;
    &lt;!-- Top Navigation --&gt;
    &lt;QyTopNav
      :links="links"
      :avatar-url="avatarUrl"
      @link-click="handleLinkClick"
    /&gt;

    &lt;!-- Bottom Dock --&gt;
    &lt;QyBottomDock
      :items="dockItems"
      @item-click="handleDockClick"
    /&gt;

    &lt;!-- Tab Bar --&gt;
    &lt;QyTabBar
      v-model="activeTab"
      :tabs="tabs"
      @tab-change="handleTabChange"
    /&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
import { ref } from 'vue'
import { QyTopNav, QyBottomDock, QyTabBar } from '@/design-system/components'

const links = ref([
  { label: '首页', path: '/', active: true },
  { label: '书架', path: '/bookshelf' }
])

const dockItems = ref([
  { icon: '...', label: '首页', active: true },
  { icon: '...', label: '发现', highlight: true }
])

const activeTab = ref('home')
const tabs = ref([
  { key: 'home', label: '首页', icon: '...' },
  { key: 'books', label: '书籍', icon: '...', badge: 5 }
])
&lt;/script&gt;</code></pre>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="mt-16 py-8 text-center text-slate-500 text-sm">
      <p>Qingyu Design System - Navigation Components</p>
      <p class="mt-2">青羽风格组件库 - Phase 2</p>
    </footer>
  </div>
</template>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
</style>
