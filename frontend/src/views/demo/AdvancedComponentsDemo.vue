<template>
  <div
    class="min-h-screen bg-gradient-to-br from-[var(--gradient-from)] via-white to-[var(--gradient-to)] py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1
          class="text-4xl font-bold bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] bg-clip-text text-transparent mb-4"
        >
          Qingyu Advanced Components
        </h1>
        <p class="text-slate-600 text-lg">Phase 3: Advanced Components Demo</p>
        <div class="mt-4 flex justify-center">
          <ThemeSwitcher />
        </div>
      </div>

      <!-- QyModal Section -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">QyModal 模态框</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Basic Modal -->
          <QyCard>
            <template #title>
              <h3 class="text-xl font-bold text-slate-800">基础模态框</h3>
            </template>
            <p class="text-slate-600 mb-4">使用 v-model 控制显示状态，支持 ESC 键关闭。</p>
            <QyButton @click="modalVisible = true">打开基础模态框</QyButton>
          </QyCard>

          <!-- Custom Footer Modal -->
          <QyCard>
            <template #title>
              <h3 class="text-xl font-bold text-slate-800">自定义底部</h3>
            </template>
            <p class="text-slate-600 mb-4">使用 footer 插槽自定义底部按钮。</p>
            <QyButton @click="modalCustom = true">打开自定义模态框</QyButton>
          </QyCard>

          <!-- Custom Header Modal -->
          <QyCard>
            <template #title>
              <h3 class="text-xl font-bold text-slate-800">自定义标题</h3>
            </template>
            <p class="text-slate-600 mb-4">使用 header 插槽自定义标题区域。</p>
            <QyButton @click="modalHeader = true">打开自定义标题模态框</QyButton>
          </QyCard>

          <!-- Non-closable Modal -->
          <QyCard>
            <template #title>
              <h3 class="text-xl font-bold text-slate-800">不可关闭模态框</h3>
            </template>
            <p class="text-slate-600 mb-4">设置 :closable="false" 和 :maskClosable="false"。</p>
            <QyButton @click="modalNonClosable = true">打开不可关闭模态框</QyButton>
          </QyCard>

          <!-- Different Widths -->
          <QyCard class="md:col-span-2">
            <template #title>
              <h3 class="text-xl font-bold text-slate-800">不同宽度</h3>
            </template>
            <p class="text-slate-600 mb-4">通过 width 属性设置模态框宽度。</p>
            <div class="flex flex-wrap gap-4">
              <QyButton size="sm" @click="openModalWithWidth('sm')">小 (400px)</QyButton>
              <QyButton size="md" @click="openModalWithWidth('md')">中 (500px)</QyButton>
              <QyButton size="lg" @click="openModalWithWidth('lg')">大 (600px)</QyButton>
            </div>
          </QyCard>
        </div>

        <!-- Modal Demos -->
        <QyModal v-model:visible="modalVisible" title="基础模态框">
          <p class="text-slate-600">
            这是一个基础的模态框示例。您可以点击关闭按钮、按 ESC 键或点击遮罩层来关闭它。
          </p>
        </QyModal>

        <QyModal v-model:visible="modalCustom" title="自定义底部">
          <p class="text-slate-600 mb-4">这个模态框展示了如何使用自定义的底部插槽。</p>
          <p class="text-slate-600">您可以在底部添加任意按钮和操作。</p>
          <template #footer>
            <QyButton variant="ghost" @click="modalCustom = false">取消</QyButton>
            <QyButton variant="secondary">保存草稿</QyButton>
            <QyButton @click="modalCustom = false">确认提交</QyButton>
          </template>
        </QyModal>

        <QyModal v-model:visible="modalHeader">
          <template #header>
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary-500)] rounded-lg flex items-center justify-center"
              >
                <svg
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-bold text-slate-800">自定义标题</h2>
                <p class="text-sm text-slate-500">这是一个带有自定义标题的模态框</p>
              </div>
            </div>
          </template>
          <p class="text-slate-600">使用 header 插槽可以完全自定义标题区域的样式和内容。</p>
        </QyModal>

        <QyModal
          v-model:visible="modalNonClosable"
          :closable="false"
          :maskClosable="false"
          title="不可关闭模态框"
        >
          <p class="text-slate-600 mb-4">这个模态框不可通过常规方式关闭。</p>
          <p class="text-slate-600">适用于需要用户必须完成某个操作的场景。</p>
          <div class="mt-6 flex justify-end">
            <QyButton @click="modalNonClosable = false">我已完成操作</QyButton>
          </div>
        </QyModal>

        <QyModal v-model:visible="modalWidthVisible" :width="modalWidthValue" title="不同宽度示例">
          <p class="text-slate-600">
            当前模态框宽度:
            <span class="font-semibold text-[var(--color-primary-600)]">{{ modalWidthValue }}</span>
          </p>
        </QyModal>
      </section>

      <!-- QyLoading Section -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">QyLoading 加载动画</h2>
        <QyCard>
          <div class="space-y-8">
            <!-- Sizes -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">不同尺寸</h3>
              <div class="flex items-center justify-center gap-12 py-6 bg-slate-50 rounded-xl">
                <div class="text-center">
                  <QyLoading size="sm" />
                  <p class="mt-2 text-sm text-slate-600">Small</p>
                </div>
                <div class="text-center">
                  <QyLoading size="md" />
                  <p class="mt-2 text-sm text-slate-600">Medium</p>
                </div>
                <div class="text-center">
                  <QyLoading size="lg" />
                  <p class="mt-2 text-sm text-slate-600">Large</p>
                </div>
              </div>
            </div>

            <!-- Colors -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">不同颜色</h3>
              <div class="flex items-center justify-center gap-12 py-6 bg-slate-50 rounded-xl">
                <div class="text-center">
                  <QyLoading color="cyan" />
                  <p class="mt-2 text-sm text-slate-600">Cyan</p>
                </div>
                <div class="text-center">
                  <QyLoading color="blue" />
                  <p class="mt-2 text-sm text-slate-600">Blue</p>
                </div>
                <div class="text-center">
                  <div class="w-20 h-20 bg-slate-800 rounded-xl flex items-center justify-center">
                    <QyLoading color="white" />
                  </div>
                  <p class="mt-2 text-sm text-slate-600">White (Dark)</p>
                </div>
              </div>
            </div>

            <!-- With Text -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">带文字说明</h3>
              <div class="flex items-center justify-center gap-12 py-6 bg-slate-50 rounded-xl">
                <div class="text-center">
                  <QyLoading text="加载中..." size="sm" />
                </div>
                <div class="text-center">
                  <QyLoading text="正在处理您的请求..." size="md" />
                </div>
                <div class="text-center">
                  <QyLoading text="请稍候，这可能需要几秒钟..." size="lg" />
                </div>
              </div>
            </div>

            <!-- Fullscreen Demo -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">全屏加载</h3>
              <div class="flex items-center justify-center py-6">
                <QyButton @click="showFullscreenLoading"> 显示全屏加载 (3秒后自动关闭) </QyButton>
              </div>
              <QyLoading v-if="loadingFullscreen" fullscreen text="加载中，请稍候..." />
            </div>

            <!-- Inline vs Fullscreen Comparison -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">内联 vs 全屏</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <QyCard class="bg-slate-50">
                  <div class="flex flex-col items-center justify-center py-8">
                    <QyLoading text="内联加载" />
                    <p class="mt-4 text-sm text-slate-500">嵌入在内容中</p>
                  </div>
                </QyCard>
                <QyCard class="bg-slate-50">
                  <div class="flex flex-col items-center justify-center py-8">
                    <QyButton @click="triggerFullscreenLoading2"> 触发全屏加载 </QyButton>
                    <p class="mt-4 text-sm text-slate-500">覆盖整个视口</p>
                  </div>
                </QyCard>
              </div>
              <QyLoading v-if="loadingFullscreen2" fullscreen text="全屏加载示例..." />
            </div>
          </div>
        </QyCard>
      </section>

      <!-- QyEmpty Section -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">QyEmpty 空状态</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Basic Empty -->
          <QyCard>
            <template #title>
              <h3 class="text-xl font-bold text-slate-800">基础空状态</h3>
            </template>
            <QyEmpty />
          </QyCard>

          <!-- Custom Icon -->
          <QyCard>
            <template #title>
              <h3 class="text-xl font-bold text-slate-800">自定义图标</h3>
            </template>
            <QyEmpty :icon="emptyIcon" title="暂无通知" description="您还没有收到任何通知消息" />
          </QyCard>

          <!-- Custom Title & Description -->
          <QyCard>
            <template #title>
              <h3 class="text-xl font-bold text-slate-800">自定义标题和描述</h3>
            </template>
            <QyEmpty title="搜索结果为空" description="没有找到匹配的内容，请尝试其他关键词" />
          </QyCard>

          <!-- With Action Button -->
          <QyCard>
            <template #title>
              <h3 class="text-xl font-bold text-slate-800">带操作按钮</h3>
            </template>
            <QyEmpty
              title="购物车为空"
              description="快去挑选您喜欢的商品吧"
              action-text="开始购物"
              @action="handleEmptyAction"
            />
          </QyCard>

          <!-- Different Scenarios -->
          <QyCard class="md:col-span-2">
            <template #title>
              <h3 class="text-xl font-bold text-slate-800">使用场景</h3>
            </template>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- No Data -->
              <div class="bg-slate-50 rounded-xl p-6">
                <p class="text-sm font-medium text-slate-700 mb-4">无数据</p>
                <QyEmpty :icon="documentIcon" title="暂无数据" description="还没有任何数据" />
              </div>

              <!-- No Search Results -->
              <div class="bg-slate-50 rounded-xl p-6">
                <p class="text-sm font-medium text-slate-700 mb-4">无搜索结果</p>
                <QyEmpty
                  :icon="searchIcon"
                  title="未找到结果"
                  description="尝试使用其他关键词搜索"
                  action-text="清除搜索"
                  @action="handleClearSearch"
                />
              </div>

              <!-- No Notifications -->
              <div class="bg-slate-50 rounded-xl p-6">
                <p class="text-sm font-medium text-slate-700 mb-4">无通知</p>
                <QyEmpty :icon="bellIcon" title="暂无通知" description="您没有新的通知消息" />
              </div>
            </div>
          </QyCard>
        </div>
      </section>

      <!-- QyForm Section -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">QyForm 表单</h2>
        <div class="space-y-6">
          <!-- Basic Form -->
          <QyCard>
            <template #title>
              <h3 class="text-xl font-bold text-slate-800">基础表单</h3>
            </template>
            <QyForm v-model="formData" :rules="formRules" @validate="handleFormValidate">
              <QyFormItem prop="name" label="姓名" required>
                <QyInput v-model="formData.name" type="text" placeholder="请输入姓名" />
              </QyFormItem>

              <QyFormItem prop="email" label="邮箱" required>
                <QyInput v-model="formData.email" type="text" placeholder="请输入邮箱" />
              </QyFormItem>

              <QyFormItem prop="password" label="密码" required>
                <QyInput v-model="formData.password" type="text" placeholder="请输入密码" />
              </QyFormItem>

              <QyFormItem>
                <div class="flex gap-3">
                  <QyButton type="submit" @click="handleSubmit">提交</QyButton>
                  <QyButton variant="secondary" @click="handleReset">重置</QyButton>
                </div>
              </QyFormItem>
            </QyForm>
            <div
              v-if="formSubmitted"
              class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <p class="text-sm text-green-700">表单提交成功！数据已记录到控制台。</p>
            </div>
          </QyCard>

          <!-- Label Positions -->
          <QyCard>
            <template #title>
              <h3 class="text-xl font-bold text-slate-800">标签位置</h3>
            </template>
            <div class="space-y-6">
              <!-- Top Label -->
              <div>
                <p class="text-sm font-medium text-slate-700 mb-3">顶部标签 (默认)</p>
                <QyForm label-position="top" :model-value="{ username: '' }">
                  <QyFormItem label="用户名">
                    <QyInput type="text" placeholder="请输入用户名" />
                  </QyFormItem>
                </QyForm>
              </div>

              <!-- Left Label -->
              <div>
                <p class="text-sm font-medium text-slate-700 mb-3">左侧标签</p>
                <QyForm label-position="left" label-width="100px" :model-value="{ email: '' }">
                  <QyFormItem label="邮箱地址">
                    <QyInput type="text" placeholder="请输入邮箱" />
                  </QyFormItem>
                </QyForm>
              </div>

              <!-- Right Label -->
              <div>
                <p class="text-sm font-medium text-slate-700 mb-3">右侧标签</p>
                <QyForm label-position="right" label-width="100px" :model-value="{ phone: '' }">
                  <QyFormItem label="手机号码">
                    <QyInput type="text" placeholder="请输入手机号" />
                  </QyFormItem>
                </QyForm>
              </div>
            </div>
          </QyCard>

          <!-- Validation States -->
          <QyCard>
            <template #title>
              <h3 class="text-xl font-bold text-slate-800">验证状态</h3>
            </template>
            <QyForm v-model="validationForm" :rules="validationRules">
              <QyFormItem prop="username" label="用户名" required>
                <QyInput v-model="validationForm.username" type="text" placeholder="至少2个字符" />
              </QyFormItem>

              <QyFormItem prop="email" label="邮箱" required>
                <QyInput
                  v-model="validationForm.email"
                  type="text"
                  placeholder="example@domain.com"
                />
              </QyFormItem>

              <QyFormItem prop="age" label="年龄">
                <QyInput v-model="validationForm.age" type="text" placeholder="18-120之间" />
              </QyFormItem>

              <QyFormItem prop="website" label="个人网站">
                <QyInput
                  v-model="validationForm.website"
                  type="text"
                  placeholder="https://example.com"
                />
              </QyFormItem>

              <QyFormItem>
                <QyButton @click="validateForm">验证表单</QyButton>
              </QyFormItem>
            </QyForm>
            <div
              v-if="validationResult"
              class="mt-4 p-4"
              :class="
                validationResult.valid
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              "
            >
              <p
                class="text-sm"
                :class="validationResult.valid ? 'text-green-700' : 'text-red-700'"
              >
                {{ validationResult.message }}
              </p>
            </div>
          </QyCard>

          <!-- Custom Validation -->
          <QyCard>
            <template #title>
              <h3 class="text-xl font-bold text-slate-800">自定义验证规则</h3>
            </template>
            <p class="text-slate-600 mb-4">使用自定义 validator 函数进行复杂验证。</p>
            <QyForm v-model="customForm" :rules="customRules">
              <QyFormItem prop="password" label="密码" required>
                <QyInput
                  v-model="customForm.password"
                  type="text"
                  placeholder="至少8个字符，包含字母和数字"
                />
              </QyFormItem>

              <QyFormItem prop="confirmPassword" label="确认密码" required>
                <QyInput
                  v-model="customForm.confirmPassword"
                  type="text"
                  placeholder="再次输入密码"
                />
              </QyFormItem>

              <QyFormItem>
                <QyButton @click="validateCustomForm">验证密码</QyButton>
              </QyFormItem>
            </QyForm>
          </QyCard>
        </div>
      </section>

      <!-- Component Combinations -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">组件组合示例</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Modal with Form -->
          <QyCard>
            <template #title>
              <h3 class="text-xl font-bold text-slate-800">模态框 + 表单</h3>
            </template>
            <p class="text-slate-600 mb-4">点击按钮打开包含表单的模态框。</p>
            <QyButton @click="modalWithForm = true">打开注册表单</QyButton>
          </QyCard>

          <!-- Empty State with Action -->
          <QyCard>
            <template #title>
              <h3 class="text-xl font-bold text-slate-800">空状态 + 加载动画</h3>
            </template>
            <p class="text-slate-600 mb-4">切换空状态和加载状态。</p>
            <div class="flex gap-3">
              <QyButton @click="showEmptyState = true">显示空状态</QyButton>
              <QyButton @click="triggerLoadingDemo"> 模拟加载 </QyButton>
            </div>
          </QyCard>
        </div>
      </section>

      <!-- Footer -->
      <footer class="text-center text-slate-500 text-sm py-8 border-t border-slate-200">
        <p>Qingyu Design System - Phase 3 Advanced Components</p>
        <p class="mt-1">Built with Vue 3 + TypeScript + Tailwind CSS</p>
      </footer>
    </div>

    <!-- Modal with Form -->
    <QyModal v-model:visible="modalWithForm" title="用户注册" width="600px">
      <QyForm v-model="registerForm" :rules="registerRules">
        <QyFormItem prop="username" label="用户名" required>
          <QyInput v-model="registerForm.username" type="text" placeholder="请输入用户名" />
        </QyFormItem>

        <QyFormItem prop="email" label="邮箱" required>
          <QyInput v-model="registerForm.email" type="text" placeholder="请输入邮箱" />
        </QyFormItem>

        <QyFormItem prop="password" label="密码" required>
          <QyInput v-model="registerForm.password" type="text" placeholder="请输入密码" />
        </QyFormItem>
      </QyForm>
      <template #footer>
        <QyButton variant="ghost" @click="modalWithForm = false">取消</QyButton>
        <QyButton :loading="registerLoading" @click="handleRegister">注册</QyButton>
      </template>
    </QyModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  QyModal,
  QyLoading,
  QyEmpty,
  QyForm,
  QyFormItem,
  QyButton,
  QyInput,
  QyCard,
} from '@/design-system/components'
import { ThemeSwitcher } from '@/design-system/other'

// Icons for Empty states
const emptyIcon =
  '<svg class="w-full h-full text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>'

const documentIcon =
  '<svg class="w-full h-full text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>'

const searchIcon =
  '<svg class="w-full h-full text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>'

const bellIcon =
  '<svg class="w-full h-full text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>'

// QyModal state
const modalVisible = ref(false)
const modalCustom = ref(false)
const modalHeader = ref(false)
const modalNonClosable = ref(false)
const modalWidthVisible = ref(false)
const modalWidthValue = ref('500px')
const modalWithForm = ref(false)

// Width mapping
const widthMap: Record<'sm' | 'md' | 'lg', string> = { sm: '400px', md: '500px', lg: '600px' }
// QyLoading state
const loadingFullscreen = ref(false)
const loadingFullscreen2 = ref(false)
const loadingDemo = ref(false)

const showFullscreenLoading = () => {
  loadingFullscreen.value = true
  window.setTimeout(() => {
    loadingFullscreen.value = false
  }, 3000)
}

const triggerFullscreenLoading2 = () => {
  loadingFullscreen2.value = true
  window.setTimeout(() => {
    loadingFullscreen2.value = false
  }, 3000)
}

const triggerLoadingDemo = () => {
  showEmptyState.value = false
  loadingDemo.value = true
  window.setTimeout(() => {
    loadingDemo.value = false
  }, 2000)
}

// QyEmpty handlers
const handleEmptyAction = () => {
  alert('开始购物按钮被点击！')
}

const handleClearSearch = () => {
  alert('清除搜索按钮被点击！')
}

// QyForm - Basic Form
const formData = ref({
  name: '',
  email: '',
  password: '',
})

const formRules = {
  name: [
    { required: true, message: '姓名不能为空' },
    { min: 2, message: '姓名至少2个字符' },
  ],
  email: [
    { required: true, message: '邮箱不能为空' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' },
  ],
  password: [
    { required: true, message: '密码不能为空' },
    { min: 6, message: '密码至少6个字符' },
  ],
}

const formSubmitted = ref(false)

const handleSubmit = () => {
  console.log('Form submitted:', formData.value)
  formSubmitted.value = true
  window.setTimeout(() => {
    formSubmitted.value = false
  }, 3000)
}

const handleReset = () => {
  formData.value = {
    name: '',
    email: '',
    password: '',
  }
}

const handleFormValidate = (isValid: boolean) => {
  console.log('Form validation:', isValid)
}

// QyForm - Validation Form
const validationForm = ref({
  username: '',
  email: '',
  age: '',
  website: '',
})

const validationRules = {
  username: [
    { required: true, message: '用户名不能为空' },
    { min: 2, message: '用户名至少2个字符' },
  ],
  email: [
    { required: true, message: '邮箱不能为空' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' },
  ],
  age: [
    { pattern: /^\d+$/, message: '年龄必须是数字' },
    {
      validator: (_rule: any, value: string) => {
        const age = parseInt(value)
        if (value && (age < 18 || age > 120)) {
          return '年龄必须在18-120之间'
        }
        return true
      },
    },
  ],
  website: [{ pattern: /^https?:\/\/.+/, message: '请输入有效的网址（以http://或https://开头）' }],
} as Record<string, any>

const validationResult = ref<{ valid: boolean; message: string } | null>(null)

const validateForm = () => {
  // Simulate validation
  let isValid = true
  const messages: string[] = []

  if (!validationForm.value.username || validationForm.value.username.length < 2) {
    isValid = false
    messages.push('用户名验证失败')
  }

  if (
    !validationForm.value.email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(validationForm.value.email)
  ) {
    isValid = false
    messages.push('邮箱验证失败')
  }

  if (isValid) {
    validationResult.value = { valid: true, message: '表单验证通过！所有字段都有效。' }
  } else {
    validationResult.value = { valid: false, message: `验证失败：${messages.join('，')}` }
  }

  window.setTimeout(() => {
    validationResult.value = null
  }, 3000)
}

// QyForm - Custom Validation Form
const customForm = ref({
  password: '',
  confirmPassword: '',
})

const customRules = {
  password: [
    { required: true, message: '密码不能为空' },
    { min: 8, message: '密码至少8个字符' },
    {
      validator: (_rule: any, value: string) => {
        if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) {
          return '密码必须包含字母和数字'
        }
        return true
      },
    },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码' },
    {
      validator: (_rule: any, value: string) => {
        if (value !== customForm.value.password) {
          return '两次输入的密码不一致'
        }
        return true
      },
    },
  ],
} as Record<string, any>

const validateCustomForm = () => {
  alert('密码验证：\n' + JSON.stringify(customForm.value, null, 2))
}

// Register Form (Modal)
const registerForm = ref({
  username: '',
  email: '',
  password: '',
})

const registerRules = {
  username: [
    { required: true, message: '用户名不能为空' },
    { min: 3, message: '用户名至少3个字符' },
  ],
  email: [
    { required: true, message: '邮箱不能为空' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' },
  ],
  password: [
    { required: true, message: '密码不能为空' },
    { min: 6, message: '密码至少6个字符' },
  ],
}

const registerLoading = ref(false)

const handleRegister = () => {
  registerLoading.value = true
  window.setTimeout(() => {
    registerLoading.value = false
    modalWithForm.value = false
    alert('注册成功！')
  }, 2000)
}

// Empty state demo
const showEmptyState = ref(true)

// Handle modal width button clicks properly
const openModalWithWidth = (size: 'sm' | 'md' | 'lg') => {
  modalWidthValue.value = widthMap[size]
  modalWidthVisible.value = true
}
</script>
