<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-4">
          青羽组件库演示
        </h1>
        <p class="text-slate-600 text-lg">基于 Tailwind v4 和 CVA 的 Vue 3 组件库</p>
        <div class="mt-4 flex justify-center gap-2">
          <Tag variant="primary">Vue 3</Tag>
          <Tag variant="success">TypeScript</Tag>
          <Tag variant="info">Tailwind v4</Tag>
          <Tag variant="warning">CVA</Tag>
        </div>
      </div>

      <!-- Quick Navigation -->
      <nav class="sticky top-0 z-10 mb-8 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-100 p-4">
        <div class="flex flex-wrap gap-2 justify-center">
          <button
            v-for="section in sections"
            :key="section.id"
            @click="scrollToSection(section.id)"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-primary-50 hover:text-primary-600"
            :class="{ 'bg-primary-100 text-primary-700': activeSection === section.id }"
          >
            {{ section.name }}
          </button>
        </div>
      </nav>

      <!-- Basic Components -->
      <section id="basic" class="mb-16 scroll-mt-24">
        <h2 class="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
          <span class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </span>
          基础组件
        </h2>

        <!-- QyButton -->
        <QyCard class="mb-6">
          <template #title>
            <h3 class="text-xl font-bold text-slate-800">QyButton 按钮</h3>
          </template>
          <div class="space-y-6">
            <div>
              <p class="text-sm text-slate-600 mb-3 font-medium">变体样式</p>
              <div class="flex flex-wrap gap-3">
                <QyButton variant="primary">Primary</QyButton>
                <QyButton variant="secondary">Secondary</QyButton>
                <QyButton variant="ghost">Ghost</QyButton>
                <QyButton variant="text">Text</QyButton>
                <QyButton variant="danger">Danger</QyButton>
                <QyButton variant="outline">Outline</QyButton>
              </div>
            </div>
            <div>
              <p class="text-sm text-slate-600 mb-3 font-medium">尺寸大小</p>
              <div class="flex flex-wrap items-center gap-3">
                <QyButton size="xs">XS</QyButton>
                <QyButton size="sm">SM</QyButton>
                <QyButton size="md">MD</QyButton>
                <QyButton size="lg">LG</QyButton>
                <QyButton size="xl">XL</QyButton>
              </div>
            </div>
            <div>
              <p class="text-sm text-slate-600 mb-3 font-medium">状态</p>
              <div class="flex flex-wrap gap-3">
                <QyButton loading>Loading</QyButton>
                <QyButton disabled>Disabled</QyButton>
              </div>
            </div>
          </div>
        </QyCard>

        <!-- QyInput -->
        <QyCard class="mb-6">
          <template #title>
            <h3 class="text-xl font-bold text-slate-800">QyInput 输入框</h3>
          </template>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            <div>
              <p class="text-sm text-slate-600 mb-2 font-medium">默认输入框</p>
              <QyInput placeholder="请输入内容" />
            </div>
            <div>
              <p class="text-sm text-slate-600 mb-2 font-medium">禁用状态</p>
              <QyInput placeholder="禁用状态" disabled />
            </div>
            <div>
              <p class="text-sm text-slate-600 mb-2 font-medium">错误状态</p>
              <QyInput placeholder="错误状态" error="输入内容有误" />
            </div>
            <div>
              <p class="text-sm text-slate-600 mb-2 font-medium">带前缀图标</p>
              <QyInput placeholder="搜索..." />
            </div>
          </div>
        </QyCard>

        <!-- QyCard -->
        <QyCard class="mb-6">
          <template #title>
            <h3 class="text-xl font-bold text-slate-800">QyCard 卡片</h3>
          </template>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QyCard shadow="always">
              <div class="p-4">
                <h4 class="font-semibold text-slate-900 mb-2">默认卡片</h4>
                <p class="text-slate-600 text-sm">默认样式的卡片组件</p>
              </div>
            </QyCard>
            <QyCard variant="glass" shadow="always">
              <div class="p-4">
                <h4 class="font-semibold text-slate-900 mb-2">玻璃卡片</h4>
                <p class="text-slate-600 text-sm">玻璃拟态效果</p>
              </div>
            </QyCard>
            <QyCard variant="outlined" shadow="always">
              <div class="p-4">
                <h4 class="font-semibold text-slate-900 mb-2">轮廓卡片</h4>
                <p class="text-slate-600 text-sm">带边框轮廓</p>
              </div>
            </QyCard>
          </div>
        </QyCard>

        <!-- QyCheckbox, QyRadio, QySwitch -->
        <QyCard class="mb-6">
          <template #title>
            <h3 class="text-xl font-bold text-slate-800">表单控件</h3>
          </template>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p class="text-sm text-slate-600 mb-3 font-medium">复选框</p>
              <div class="space-y-2">
                <QyCheckbox v-model="checkboxValues.a">选项 A</QyCheckbox>
                <QyCheckbox v-model="checkboxValues.b">选项 B</QyCheckbox>
                <QyCheckbox :model-value="false" disabled>禁用选项</QyCheckbox>
              </div>
            </div>
            <div>
              <p class="text-sm text-slate-600 mb-3 font-medium">单选框</p>
              <QyRadioGroup v-model="radioValue">
                <div class="space-y-2">
                  <QyRadio value="option1">选项 1</QyRadio>
                  <QyRadio value="option2">选项 2</QyRadio>
                  <QyRadio value="option3">选项 3</QyRadio>
                </div>
              </QyRadioGroup>
            </div>
            <div>
              <p class="text-sm text-slate-600 mb-3 font-medium">开关</p>
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <QySwitch v-model="switchValues.a" />
                  <span class="text-sm">开关 A</span>
                </div>
                <div class="flex items-center gap-2">
                  <QySwitch v-model="switchValues.b" />
                  <span class="text-sm">开关 B</span>
                </div>
                <div class="flex items-center gap-2">
                  <QySwitch :model-value="false" disabled />
                  <span class="text-sm text-slate-400">禁用</span>
                </div>
              </div>
            </div>
          </div>
        </QyCard>

        <!-- QySlider, QyRate -->
        <QyCard class="mb-6">
          <template #title>
            <h3 class="text-xl font-bold text-slate-800">滑动与评分</h3>
          </template>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
            <div>
              <p class="text-sm text-slate-600 mb-3 font-medium">滑块 (当前值: {{ sliderValue }})</p>
              <QySlider v-model="sliderValue" :min="0" :max="100" />
            </div>
            <div>
              <p class="text-sm text-slate-600 mb-3 font-medium">评分 (当前值: {{ rateValue }})</p>
              <QyRate v-model="rateValue" :max="5" />
            </div>
          </div>
        </QyCard>

        <!-- QySelect, QyTextarea -->
        <QyCard class="mb-6">
          <template #title>
            <h3 class="text-xl font-bold text-slate-800">选择与文本域</h3>
          </template>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            <div>
              <p class="text-sm text-slate-600 mb-2 font-medium">下拉选择</p>
              <QySelect
                v-model="selectValue"
                :options="selectOptions"
                placeholder="请选择"
              />
            </div>
            <div>
              <p class="text-sm text-slate-600 mb-2 font-medium">文本域</p>
              <QyTextarea
                v-model="textareaValue"
                placeholder="请输入内容"
                :rows="3"
              />
            </div>
          </div>
        </QyCard>

        <!-- QyAvatar, QyBadge, QyTag -->
        <QyCard class="mb-6">
          <template #title>
            <h3 class="text-xl font-bold text-slate-800">头像、徽章与标签</h3>
          </template>
          <div class="space-y-6">
            <div>
              <p class="text-sm text-slate-600 mb-3 font-medium">头像</p>
              <div class="flex gap-4 items-center">
                <QyAvatar type="text" text="小" size="sm" />
                <QyAvatar type="text" text="中" size="md" />
                <QyAvatar type="text" text="大" size="lg" />
              </div>
            </div>
            <div>
              <p class="text-sm text-slate-600 mb-3 font-medium">徽章</p>
              <div class="flex gap-4 items-center flex-wrap">
                <div class="relative inline-block">
                  <QyButton size="sm">消息</QyButton>
                  <div class="absolute -top-2 -right-2">
                    <QyBadge type="number" :value="5" color="primary" />
                  </div>
                </div>
                <div class="relative inline-block">
                  <QyButton size="sm">通知</QyButton>
                  <div class="absolute -top-2 -right-2">
                    <QyBadge type="number" :value="99" color="danger" />
                  </div>
                </div>
                <QyBadge type="text" text="NEW" color="success" />
                <QyBadge type="text" text="HOT" color="danger" />
                <QyBadge type="dot" color="info" />
              </div>
            </div>
            <div>
              <p class="text-sm text-slate-600 mb-3 font-medium">标签</p>
              <div class="flex gap-2 flex-wrap">
                <Tag variant="primary">主要</Tag>
                <Tag variant="success">成功</Tag>
                <Tag variant="warning">警告</Tag>
                <Tag variant="danger">危险</Tag>
                <Tag variant="info">信息</Tag>
              </div>
            </div>
          </div>
        </QyCard>
      </section>

      <!-- Feedback Components -->
      <section id="feedback" class="mb-16 scroll-mt-24">
        <h2 class="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
          <span class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          反馈组件
        </h2>

        <!-- QyTooltip -->
        <QyCard class="mb-6">
          <template #title>
            <h3 class="text-xl font-bold text-slate-800">QyTooltip 工具提示</h3>
          </template>
          <div class="grid grid-cols-4 md:grid-cols-6 gap-3 max-w-lg">
            <QyTooltip v-for="placement in tooltipPlacements.slice(0, 12)" :key="placement" :placement="placement" :content="placement">
              <QyButton variant="outline" size="sm">{{ placement }}</QyButton>
            </QyTooltip>
          </div>
        </QyCard>

        <!-- QyAlert -->
        <QyCard class="mb-6">
          <template #title>
            <h3 class="text-xl font-bold text-slate-800">QyAlert 警告提示</h3>
          </template>
          <div class="space-y-4 max-w-2xl">
            <QyAlert type="success" title="成功" description="操作已成功完成！" />
            <QyAlert type="warning" title="警告" description="请注意，此操作可能会影响其他功能。" />
            <QyAlert type="error" title="错误" description="操作失败，请重试。" />
            <QyAlert type="info" title="提示" description="这是一条普通提示信息。" />
          </div>
        </QyCard>

        <!-- QyDrawer -->
        <QyCard class="mb-6">
          <template #title>
            <h3 class="text-xl font-bold text-slate-800">QyDrawer 抽屉</h3>
          </template>
          <div class="flex flex-wrap gap-3">
            <QyButton @click="openDrawer('rtl')">从右侧打开</QyButton>
            <QyButton @click="openDrawer('ltr')">从左侧打开</QyButton>
            <QyButton @click="openDrawer('ttb')">从顶部打开</QyButton>
            <QyButton @click="openDrawer('btt')">从底部打开</QyButton>
          </div>

          <QyDrawer v-model="drawerVisible" :direction="drawerPlacement" title="抽屉标题">
            <p class="text-slate-600">这是抽屉内容，可以从 {{ drawerPlacement }} 方向打开。</p>
          </QyDrawer>
        </QyCard>

        <!-- Message -->
        <QyCard class="mb-6">
          <template #title>
            <h3 class="text-xl font-bold text-slate-800">Message 消息提示</h3>
          </template>
          <div class="flex flex-wrap gap-3">
            <QyButton @click="showMessage('success')">成功消息</QyButton>
            <QyButton @click="showMessage('warning')">警告消息</QyButton>
            <QyButton @click="showMessage('error')">错误消息</QyButton>
            <QyButton @click="showMessage('info')">信息消息</QyButton>
          </div>
        </QyCard>
      </section>

      <!-- Business Components -->
      <section id="business" class="mb-16 scroll-mt-24">
        <h2 class="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
          <span class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </span>
          业务组件
        </h2>

        <!-- QyBookCard -->
        <QyCard class="mb-6">
          <template #title>
            <h3 class="text-xl font-bold text-slate-800">QyBookCard 书籍卡片</h3>
          </template>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QyBookCard
              title="青羽传说"
              author="张三"
              cover="https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop"
              description="一部奇幻冒险小说，讲述少年在青羽大陆的冒险故事。"
              :tags="['奇幻', '冒险']"
              status="reading"
              :rating="4.5"
            />
            <QyBookCard
              title="星际漫游"
              author="李四"
              cover="https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=400&fit=crop"
              description="科幻小说，描述人类在宇宙中的探索之旅。"
              :tags="['科幻', '太空']"
              status="completed"
              :rating="4.8"
            />
          </div>
        </QyCard>

        <!-- QyUserCard -->
        <QyCard class="mb-6">
          <template #title>
            <h3 class="text-xl font-bold text-slate-800">QyUserCard 用户卡片</h3>
          </template>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
            <QyUserCard
              username="青羽创作者"
              avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              bio="热爱写作，专注于奇幻小说创作"
              :level="5"
              :followerCount="1250"
              :followingCount="86"
            />
            <QyUserCard
              username="读者小王"
              avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka"
              bio="热爱阅读的书虫"
              :level="3"
              :followerCount="56"
              :followingCount="234"
            />
          </div>
        </QyCard>
      </section>

      <!-- Navigation Components -->
      <section id="navigation" class="mb-16 scroll-mt-24">
        <h2 class="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
          <span class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </span>
          导航组件
        </h2>

        <QyCard class="mb-6">
          <template #title>
            <h3 class="text-xl font-bold text-slate-800">导航组件</h3>
          </template>
          <div class="space-y-6">
            <div>
              <p class="text-sm text-slate-600 mb-3 font-medium">顶部导航</p>
              <div class="bg-slate-50 rounded-lg p-4">
                <QyTopNav
                  :items="navItems"
                  v-model:active-key="activeNavKey"
                />
              </div>
            </div>
            <div>
              <p class="text-sm text-slate-600 mb-3 font-medium">底部标签栏</p>
              <div class="bg-slate-50 rounded-lg p-4">
                <QyTabBar
                  :tabs="tabItems"
                  v-model="activeTabKey"
                />
              </div>
            </div>
          </div>
        </QyCard>
      </section>

      <!-- Advanced Components -->
      <section id="advanced" class="mb-16 scroll-mt-24">
        <h2 class="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
          <span class="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </span>
          高级组件
        </h2>

        <QyCard class="mb-6">
          <template #title>
            <h3 class="text-xl font-bold text-slate-800">模态框与加载</h3>
          </template>
          <div class="flex flex-wrap gap-3">
            <QyButton @click="modalVisible = true">打开模态框</QyButton>
            <QyButton @click="loadingVisible = true">显示加载</QyButton>
          </div>

          <QyModal v-model:visible="modalVisible" title="模态框标题">
            <p class="text-slate-600 mb-4">这是模态框内容区域。</p>
            <div class="flex justify-end gap-2">
              <QyButton variant="ghost" @click="modalVisible = false">取消</QyButton>
              <QyButton @click="modalVisible = false">确定</QyButton>
            </div>
          </QyModal>

          <QyLoading v-model:visible="loadingVisible" />
        </QyCard>

        <QyCard class="mb-6">
          <template #title>
            <h3 class="text-xl font-bold text-slate-800">空状态</h3>
          </template>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QyEmpty
              title="暂无数据"
              description="当前没有找到相关内容"
            >
              <QyButton @click="handleRefresh">刷新</QyButton>
            </QyEmpty>
            <QyEmpty
              title="搜索无结果"
              description="试试其他关键词"
            >
              <QyButton variant="outline" @click="handleReset">重置搜索</QyButton>
            </QyEmpty>
          </div>
        </QyCard>
      </section>

      <!-- Footer -->
      <footer class="text-center py-8 border-t border-slate-200">
        <p class="text-slate-500">青羽组件库 © 2024 | 基于 Vue 3 + Tailwind CSS v4 构建</p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  QyButton,
  QyInput,
  QyCard,
  QyCheckbox,
  QyRadio,
  QyRadioGroup,
  QySwitch,
  QySlider,
  QyRate,
  QySelect,
  QyTextarea,
  QyAvatar,
  QyBadge,
  QyTooltip,
  QyAlert,
  QyDrawer,
  QyBookCard,
  QyUserCard,
  QyTopNav,
  QyTabBar,
  QyModal,
  QyLoading,
  QyEmpty
} from '@/design-system/components'
import { Tag } from '@/design-system/base'
import message from '@/design-system/feedback/Message/useMessage'

// 导航配置
const sections = [
  { id: 'basic', name: '基础组件' },
  { id: 'feedback', name: '反馈组件' },
  { id: 'business', name: '业务组件' },
  { id: 'navigation', name: '导航组件' },
  { id: 'advanced', name: '高级组件' }
]

const activeSection = ref('basic')

const scrollToSection = (id: string) => {
  activeSection.value = id
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

// 表单控件状态
const checkboxValues = ref({ a: false, b: true })
const radioValue = ref('option1')
const switchValues = ref({ a: true, b: false })
const sliderValue = ref(50)
const rateValue = ref(4)
const selectValue = ref('')
const textareaValue = ref('')

const selectOptions = [
  { label: '选项一', value: 'option1' },
  { label: '选项二', value: 'option2' },
  { label: '选项三', value: 'option3' }
]

// Tooltip 配置
const tooltipPlacements: readonly (
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'
)[] = [
  'top',
  'top-start',
  'top-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'left-start',
  'left-end',
  'right',
  'right-start',
  'right-end'
]

// Drawer 配置
const drawerVisible = ref(false)
const drawerPlacement = ref<'rtl' | 'ltr' | 'ttb' | 'btt'>('rtl')

const openDrawer = (placement: 'rtl' | 'ltr' | 'ttb' | 'btt') => {
  drawerPlacement.value = placement
  drawerVisible.value = true
}

// Message 示例
const showMessage = (type: 'success' | 'warning' | 'error' | 'info') => {
  const messages = {
    success: '操作成功！',
    warning: '请注意！',
    error: '操作失败！',
    info: '提示信息'
  }
  message.show({
    type,
    message: messages[type]
  })
}

// 导航状态
const activeNavKey = ref('home')
const activeTabKey = ref('home')

const navItems = [
  { key: 'home', label: '首页', icon: 'home' },
  { key: 'books', label: '书城', icon: 'book' },
  { key: 'community', label: '社区', icon: 'users' },
  { key: 'profile', label: '我的', icon: 'user' }
]

const tabItems = [
  { key: 'home', label: '首页', icon: 'home' },
  { key: 'discover', label: '发现', icon: 'compass' },
  { key: 'create', label: '创作', icon: 'edit' },
  { key: 'profile', label: '我的', icon: 'user' }
]

// 模态框状态
const modalVisible = ref(false)
const loadingVisible = ref(false)

// 空状态操作
const handleRefresh = () => {
  message.info('正在刷新...')
}

const handleReset = () => {
  message.info('已重置')
}
</script>
