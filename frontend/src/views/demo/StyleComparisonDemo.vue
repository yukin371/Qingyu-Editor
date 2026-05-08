<script setup lang="ts">
/**
 * Apple vs Material Design 风格对比 Demo
 *
 * 目的：让主人直观对比两种设计风格，决定组件系统方向
 * 重点展示：弹窗、下拉栏、按钮（解决 Element Plus 实际痛点）
 */
import { ref, onMounted, onUnmounted } from 'vue'

// ==================== 弹窗状态 ====================
const appleDialogOpen = ref(false)
const materialDialogOpen = ref(false)

// ==================== 下拉栏状态 ====================
const appleDropdownOpen = ref(false)
const materialDropdownOpen = ref(false)
const appleSelected = ref('请选择分类')
const materialSelected = ref('请选择分类')
const appleDropdownRef = ref<HTMLElement | null>(null)
const materialDropdownRef = ref<HTMLElement | null>(null)

const dropdownOptions = [
  { label: '玄幻小说', value: 'fantasy' },
  { label: '都市言情', value: 'romance' },
  { label: '历史军事', value: 'history' },
  { label: '科幻未来', value: 'scifi' },
  { label: '悬疑推理', value: 'mystery' },
]

// ==================== Toast 状态 ====================
const appleToast = ref({ show: false, message: '' })
const materialToast = ref({ show: false, message: '' })

function showAppleToast(msg: string) {
  appleToast.value = { show: true, message: msg }
  setTimeout(() => {
    appleToast.value.show = false
  }, 2500)
}
function showMaterialToast(msg: string) {
  materialToast.value = { show: true, message: msg }
  setTimeout(() => {
    materialToast.value.show = false
  }, 2500)
}

// ==================== 点击外部关闭下拉栏 ====================
function handleClickOutside(e: MouseEvent) {
  if (appleDropdownRef.value && !appleDropdownRef.value.contains(e.target as Node)) {
    appleDropdownOpen.value = false
  }
  if (materialDropdownRef.value && !materialDropdownRef.value.contains(e.target as Node)) {
    materialDropdownOpen.value = false
  }
}
onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

function selectAppleOption(opt: { label: string; value: string }) {
  appleSelected.value = opt.label
  appleDropdownOpen.value = false
}
function selectMaterialOption(opt: { label: string; value: string }) {
  materialSelected.value = opt.label
  materialDropdownOpen.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-6 md:p-10">
    <!-- 标题 -->
    <div class="max-w-7xl mx-auto mb-10">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">组件风格对比</h1>
      <p class="text-gray-500 text-lg">
        Apple (iOS/macOS) vs Material Design 3 (Android) — 解决 Element Plus 弹窗与下拉栏痛点
      </p>
    </div>

    <!-- ==================== 1. 弹窗对比 ==================== -->
    <section class="max-w-7xl mx-auto mb-12">
      <h2 class="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <span
          class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold"
          >1</span
        >
        弹窗 Dialog
      </h2>
      <p class="text-gray-500 mb-6">Element Plus 痛点：定位偏移、小屏幕布局异常、动画生硬</p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Apple 弹窗 -->
        <div class="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800 mb-1">Apple 风格</h3>
          <p class="text-sm text-gray-400 mb-5">毛玻璃背景、大圆角卡片、居中弹出、柔和阴影</p>

          <button
            class="rounded-xl bg-blue-500 px-5 py-2.5 text-white font-medium text-sm hover:bg-blue-600 active:bg-blue-700 transition-colors duration-150"
            @click="appleDialogOpen = true"
          >
            打开 Apple 弹窗
          </button>

          <!-- Apple Dialog -->
          <Teleport to="body">
            <Transition
              enter-active-class="transition-opacity duration-300 ease-out"
              enter-from-class="opacity-0"
              leave-active-class="transition-opacity duration-200 ease-in"
              leave-to-class="opacity-0"
            >
              <div
                v-if="appleDialogOpen"
                class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                @click.self="appleDialogOpen = false"
              >
                <!-- Backdrop -->
                <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" />

                <!-- Card -->
                <div
                  class="relative w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.25)] overflow-hidden animate-[apple-in_0.3s_ease-out]"
                  @click.stop
                >
                  <!-- Header -->
                  <div class="px-6 pt-6 pb-2">
                    <h3 class="text-lg font-semibold text-gray-900">确认删除</h3>
                  </div>

                  <!-- Body -->
                  <div class="px-6 pb-2">
                    <p class="text-sm text-gray-500 leading-relaxed">
                      你确定要删除《星辰变》这本书吗？此操作不可撤销，所有章节和评论都将被永久删除。
                    </p>
                  </div>

                  <!-- Footer — Apple 风格：按钮横排，主按钮在右 -->
                  <div class="flex items-center justify-end gap-3 px-6 py-4">
                    <button
                      class="rounded-xl px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors duration-150"
                      @click="appleDialogOpen = false"
                    >
                      取消
                    </button>
                    <button
                      class="rounded-xl bg-red-500 px-5 py-2 text-sm font-medium text-white hover:bg-red-600 active:bg-red-700 transition-colors duration-150"
                      @click="appleDialogOpen = false; showAppleToast('已删除')"
                      "
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </Transition>
          </Teleport>

          <!-- Apple Toast -->
          <Teleport to="body">
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 translate-y-4"
              leave-active-class="transition-all duration-200 ease-in"
              leave-to-class="opacity-0 -translate-y-2"
            >
              <div
                v-if="appleToast.show"
                class="fixed top-8 left-1/2 -translate-x-1/2 z-[10000] bg-gray-900/80 backdrop-blur-md text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg"
              >
                {{ appleToast.message }}
              </div>
            </Transition>
          </Teleport>
        </div>

        <!-- Material 弹窗 -->
        <div class="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800 mb-1">Material Design 3</h3>
          <p class="text-sm text-gray-400 mb-5">扁平卡片、Surface 色调、状态层反馈、清晰的层次</p>

          <button
            class="rounded-full bg-indigo-600 px-6 py-2.5 text-white font-medium text-sm hover:shadow-md hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-200"
            @click="materialDialogOpen = true"
          >
            打开 Material 弹窗
          </button>

          <!-- Material Dialog -->
          <Teleport to="body">
            <Transition
              enter-active-class="transition-opacity duration-250 ease-out"
              enter-from-class="opacity-0"
              leave-active-class="transition-opacity duration-150 ease-in"
              leave-to-class="opacity-0"
            >
              <div
                v-if="materialDialogOpen"
                class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                @click.self="materialDialogOpen = false"
              >
                <!-- Scrim -->
                <div class="absolute inset-0 bg-black/40" />

                <!-- Surface -->
                <div
                  class="relative w-full max-w-md bg-white rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.15)] overflow-hidden"
                  @click.stop
                >
                  <!-- Header -->
                  <div class="px-6 pt-6 pb-2">
                    <h3 class="text-xl font-medium text-gray-900">确认删除</h3>
                  </div>

                  <!-- Body -->
                  <div class="px-6 pb-4">
                    <p class="text-sm text-gray-600 leading-relaxed">
                      你确定要删除《星辰变》这本书吗？此操作不可撤销，所有章节和评论都将被永久删除。
                    </p>
                  </div>

                  <!-- Footer — Material 风格：文字按钮 + 填充按钮 -->
                  <div class="flex items-center justify-end gap-2 px-6 pb-6">
                    <button
                      class="rounded-full px-5 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 transition-colors duration-150"
                      @click="materialDialogOpen = false"
                    >
                      取消
                    </button>
                    <button
                      class="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:shadow-md hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-200"
                      @click="materialDialogOpen = false; showMaterialToast('已删除')"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </Transition>
          </Teleport>

          <!-- Material Snackbar -->
          <Teleport to="body">
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 translate-y-4"
              leave-active-class="transition-all duration-200 ease-in"
              leave-to-class="opacity-0 translate-y-2"
            >
              <div
                v-if="materialToast.show"
                class="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10000] bg-gray-900 text-white text-sm font-medium px-6 py-3 rounded-lg shadow-lg"
              >
                {{ materialToast.message }}
              </div>
            </Transition>
          </Teleport>
        </div>
      </div>
    </section>

    <!-- ==================== 2. 下拉栏对比 ==================== -->
    <section class="max-w-7xl mx-auto mb-12">
      <h2 class="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <span
          class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold"
          >2</span
        >
        下拉栏 Select
      </h2>
      <p class="text-gray-500 mb-6">
        Element Plus 痛点：默认文字无背景、指示箭头与文字不在一行、点击后出现浅蓝色矩形框
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Apple 下拉栏 -->
        <div class="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800 mb-1">Apple 风格</h3>
          <p class="text-sm text-gray-400 mb-5">圆角胶囊按钮触发、浮动菜单、选中高亮、无蓝色边框</p>

          <div ref="appleDropdownRef" class="relative w-64">
            <!-- Trigger — 模拟 macOS/iOS 选择器 -->
            <button
              class="w-full flex items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              :class="{
                'ring-2 ring-blue-500/20 border-blue-400 bg-blue-50/30': appleDropdownOpen,
              }"
              @click="appleDropdownOpen = !appleDropdownOpen"
            >
              <span :class="appleSelected === '请选择分类' ? 'text-gray-400' : 'text-gray-800'">
                {{ appleSelected }}
              </span>
              <!-- 自定义箭头，与文字同行 -->
              <svg
                class="w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0"
                :class="{ 'rotate-180': appleDropdownOpen }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown menu -->
            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-1 scale-95"
              leave-active-class="transition-all duration-150 ease-in"
              leave-to-class="opacity-0 -translate-y-1 scale-95"
            >
              <div
                v-if="appleDropdownOpen"
                class="absolute z-50 top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 py-1.5 overflow-hidden"
              >
                <button
                  v-for="opt in dropdownOptions"
                  :key="opt.value"
                  class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors duration-100 text-left"
                  @click="selectAppleOption(opt)"
                >
                  <span>{{ opt.label }}</span>
                  <!-- 选中标记 -->
                  <svg
                    v-if="appleSelected === opt.label"
                    class="w-4 h-4 text-blue-500 ml-auto shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Material 下拉栏 -->
        <div class="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800 mb-1">Material Design 3</h3>
          <p class="text-sm text-gray-400 mb-5">Outlined Field、浮动标签、涟漪反馈、清晰容器</p>

          <div ref="materialDropdownRef" class="relative w-64">
            <!-- Trigger — Material Outlined TextField -->
            <button
              class="w-full flex items-center justify-between gap-2 rounded-lg border-2 px-4 py-3 text-sm text-gray-700 transition-all duration-200 text-left focus:outline-none"
              :class="
                materialDropdownOpen
                  ? 'border-indigo-500 bg-white pt-5'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              "
              @click="materialDropdownOpen = !materialDropdownOpen"
            >
              <!-- Material 浮动标签 -->
              <span
                class="absolute left-3 transition-all duration-200 pointer-events-none"
                :class="
                  materialDropdownOpen || materialSelected !== '请选择分类'
                    ? '-top-2.5 text-xs text-indigo-600 bg-white px-1'
                    : 'top-3 text-sm text-gray-500'
                "
              >
                分类
              </span>
              <span :class="materialSelected === '请选择分类' ? 'text-gray-400' : 'text-gray-800'">
                {{ materialSelected === '请选择分类' ? '' : materialSelected }}
              </span>
              <!-- Material 三角箭头 -->
              <svg
                class="w-5 h-5 text-gray-500 transition-transform duration-200 shrink-0"
                :class="{ 'rotate-180': materialDropdownOpen }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Material Menu -->
            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-2 scale-95"
              leave-active-class="transition-all duration-150 ease-in"
              leave-to-class="opacity-0 -translate-y-2 scale-95"
            >
              <div
                v-if="materialDropdownOpen"
                class="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 py-1 overflow-hidden"
              >
                <button
                  v-for="opt in dropdownOptions"
                  :key="opt.value"
                  class="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 active:bg-indigo-100 transition-colors duration-100 text-left"
                  :class="{
                    'bg-indigo-50 text-indigo-700 font-medium': materialSelected === opt.label,
                  }"
                  @click="selectMaterialOption(opt)"
                >
                  <span>{{ opt.label }}</span>
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- Element Plus 问题复现 -->
      <div class="mt-8 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Element Plus 下拉栏常见问题示意</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div class="rounded-xl border border-red-100 bg-red-50/50 p-4">
            <div class="font-medium text-red-700 mb-1">问题 1：文字无背景</div>
            <p class="text-red-600/80 text-xs">下拉后默认文字与背景色接近，可读性差</p>
            <div class="mt-3 rounded-lg border bg-white p-2">
              <div class="flex items-center justify-between text-gray-400 text-xs">
                <span>请选择分类</span>
                <span>▼</span>
              </div>
              <div class="mt-1 border-t pt-1">
                <div class="text-xs py-1 px-1 text-gray-500">玄幻小说</div>
                <div class="text-xs py-1 px-1 text-gray-500">都市言情</div>
              </div>
            </div>
          </div>
          <div class="rounded-xl border border-red-100 bg-red-50/50 p-4">
            <div class="font-medium text-red-700 mb-1">问题 2：箭头与文字不对齐</div>
            <p class="text-red-600/80 text-xs">指示箭头与文字不在同一基线</p>
            <div class="mt-3 rounded-lg border bg-white p-2">
              <div class="flex items-start justify-between text-xs text-gray-500">
                <span class="leading-5">请选择分类</span>
                <span class="text-[10px] mt-0.5">▼</span>
              </div>
            </div>
          </div>
          <div class="rounded-xl border border-red-100 bg-red-50/50 p-4">
            <div class="font-medium text-red-700 mb-1">问题 3：蓝色矩形框</div>
            <p class="text-red-600/80 text-xs">点击后出现浅蓝色矩形选中框，视觉突兀</p>
            <div class="mt-3 rounded-lg border bg-white p-2">
              <div class="bg-blue-100 border-2 border-blue-400 px-2 py-1 text-xs text-gray-500">
                请选择分类 ▼
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== 3. 按钮对比 ==================== -->
    <section class="max-w-7xl mx-auto mb-12">
      <h2 class="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <span
          class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold"
          >3</span
        >
        按钮 Button
      </h2>
      <p class="text-gray-500 mb-6">对比：渐变按钮（当前） vs 纯色按钮（Apple / Material）</p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- 旧渐变按钮 -->
        <div class="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800 mb-1">旧渐变按钮</h3>
          <p class="text-sm text-gray-400 mb-5">当前项目使用的 cyan-blue 渐变风格</p>
          <div class="flex flex-wrap gap-3">
            <button
              class="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all"
            >
              主按钮
            </button>
            <button
              class="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all"
            >
              成功
            </button>
            <button
              class="bg-gradient-to-r from-red-400 to-rose-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all"
            >
              危险
            </button>
          </div>
        </div>

        <!-- Apple 纯色按钮 -->
        <div class="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800 mb-1">Apple 纯色按钮</h3>
          <p class="text-sm text-gray-400 mb-5">扁平纯色、柔和阴影、圆角矩形</p>
          <div class="flex flex-wrap gap-3">
            <button
              class="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150"
            >
              主按钮
            </button>
            <button
              class="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150"
            >
              成功
            </button>
            <button
              class="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150"
            >
              危险
            </button>
          </div>
        </div>

        <!-- Material 纯色按钮 -->
        <div class="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800 mb-1">Material 纯色按钮</h3>
          <p class="text-sm text-gray-400 mb-5">圆角药丸、elevation 阴影、涟漪反馈感</p>
          <div class="flex flex-wrap gap-3">
            <button
              class="bg-indigo-600 hover:bg-indigo-700 hover:shadow-md active:bg-indigo-800 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
            >
              主按钮
            </button>
            <button
              class="bg-emerald-600 hover:bg-emerald-700 hover:shadow-md active:bg-emerald-800 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
            >
              成功
            </button>
            <button
              class="bg-red-600 hover:bg-red-700 hover:shadow-md active:bg-red-800 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
            >
              危险
            </button>
          </div>
        </div>
      </div>

      <!-- 按钮状态对比 -->
      <div class="mt-6 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <h3 class="text-base font-semibold text-gray-800 mb-4">按钮状态对比</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p class="text-sm text-gray-500 mb-3">Apple 按钮状态</p>
            <div class="flex flex-wrap gap-3">
              <button class="bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium">
                Default
              </button>
              <button class="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium">
                Hover
              </button>
              <button class="bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium">
                Active
              </button>
              <button
                class="bg-blue-500/50 text-white/50 px-5 py-2.5 rounded-xl text-sm font-medium cursor-not-allowed"
              >
                Disabled
              </button>
              <button
                class="bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium inline-flex items-center gap-2"
              >
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Loading
              </button>
            </div>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-3">Material 按钮状态</p>
            <div class="flex flex-wrap gap-3">
              <button class="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-medium">
                Default
              </button>
              <button
                class="bg-indigo-700 text-white px-6 py-2.5 rounded-full text-sm font-medium shadow-md"
              >
                Hover
              </button>
              <button class="bg-indigo-800 text-white px-6 py-2.5 rounded-full text-sm font-medium">
                Active
              </button>
              <button
                class="bg-indigo-600/50 text-white/50 px-6 py-2.5 rounded-full text-sm font-medium cursor-not-allowed"
              >
                Disabled
              </button>
              <button
                class="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-medium inline-flex items-center gap-2"
              >
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Loading
              </button>
            </div>
          </div>
        </div>

        <!-- Ghost / Secondary 按钮对比 -->
        <div class="mt-6 pt-6 border-t border-gray-100">
          <p class="text-sm text-gray-500 mb-3">Ghost / Secondary 按钮</p>
          <div class="flex flex-wrap gap-3">
            <button
              class="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150"
            >
              Apple Secondary
            </button>
            <button
              class="bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150"
            >
              Apple Ghost
            </button>
            <button
              class="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-700 px-6 py-2.5 rounded-full text-sm font-medium transition-colors duration-150"
            >
              Material Filled Tonal
            </button>
            <button
              class="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 px-6 py-2.5 rounded-full text-sm font-medium transition-colors duration-150"
            >
              Material Outlined
            </button>
            <button
              class="bg-transparent hover:bg-indigo-50 active:bg-indigo-100 text-indigo-600 px-6 py-2.5 rounded-full text-sm font-medium transition-colors duration-150"
            >
              Material Text
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== 4. 更多弹窗场景 ==================== -->
    <section class="max-w-7xl mx-auto mb-12">
      <h2 class="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <span
          class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold"
          >4</span
        >
        更多弹窗场景
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Apple 确认弹窗 (小尺寸) -->
        <div class="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 class="text-base font-semibold text-gray-800 mb-3">Apple 确认弹窗 — macOS 风格</h3>
          <p class="text-sm text-gray-400 mb-4">紧凑居中、图标+文字、按钮横排</p>
          <div class="relative inline-block">
            <!-- 静态展示，模拟 macOS 对话框 -->
            <div
              class="w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] overflow-hidden border border-gray-100"
            >
              <div class="flex flex-col items-center px-6 pt-6 pb-2 text-center">
                <div
                  class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3"
                >
                  <svg
                    class="w-6 h-6 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 9v2m0 4h.01M12 3l9.5 16.5H2.5L12 3z"
                    />
                  </svg>
                </div>
                <h4 class="text-sm font-semibold text-gray-900 mb-1">无法保存修改</h4>
                <p class="text-xs text-gray-500">网络连接已断开，请检查网络后重试。</p>
              </div>
              <div class="flex border-t border-gray-100">
                <button
                  class="flex-1 py-2.5 text-sm font-medium text-blue-500 hover:bg-blue-50 active:bg-blue-100 transition-colors border-r border-gray-100"
                >
                  取消
                </button>
                <button
                  class="flex-1 py-2.5 text-sm font-semibold text-blue-500 hover:bg-blue-50 active:bg-blue-100 transition-colors"
                >
                  重试
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Material 底部抽屉 (移动端友好) -->
        <div class="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 class="text-base font-semibold text-gray-800 mb-3">
            Material Bottom Sheet — 移动端友好
          </h3>
          <p class="text-sm text-gray-400 mb-4">从底部滑出、拖拽关闭、适合移动端操作</p>
          <div class="relative">
            <!-- 静态展示 -->
            <div
              class="w-72 bg-white rounded-t-[28px] shadow-[0_-4px_20px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100"
            >
              <!-- Handle -->
              <div class="flex justify-center pt-3 pb-2">
                <div class="w-10 h-1 rounded-full bg-gray-300" />
              </div>
              <div class="px-5 pb-2">
                <h4 class="text-base font-medium text-gray-900 mb-1">选择操作</h4>
              </div>
              <div class="px-2 pb-4 space-y-0.5">
                <button
                  class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 text-left"
                >
                  <svg
                    class="w-5 h-5 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                    />
                  </svg>
                  编辑章节
                </button>
                <button
                  class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 text-left"
                >
                  <svg
                    class="w-5 h-5 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  发布章节
                </button>
                <button
                  class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 text-left"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                  删除章节
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== 总结对比表 ==================== -->
    <section class="max-w-7xl mx-auto mb-12">
      <div class="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">风格特性对比总结</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="py-3 px-4 text-left font-medium text-gray-500">特性</th>
                <th class="py-3 px-4 text-left font-medium text-gray-500">Apple 风格</th>
                <th class="py-3 px-4 text-left font-medium text-gray-500">Material Design 3</th>
              </tr>
            </thead>
            <tbody class="text-gray-700">
              <tr class="border-b border-gray-100">
                <td class="py-3 px-4 font-medium">圆角</td>
                <td class="py-3 px-4">大圆角 (12-16px)、柔和</td>
                <td class="py-3 px-4">超大圆角 (28px)、药丸形状</td>
              </tr>
              <tr class="border-b border-gray-100">
                <td class="py-3 px-4 font-medium">阴影</td>
                <td class="py-3 px-4">柔和投影、毛玻璃模糊</td>
                <td class="py-3 px-4">层级阴影 (elevation)、无模糊</td>
              </tr>
              <tr class="border-b border-gray-100">
                <td class="py-3 px-4 font-medium">按钮</td>
                <td class="py-3 px-4">纯色填充、圆角矩形、简洁</td>
                <td class="py-3 px-4">药丸形、阴影提升感、多种变体</td>
              </tr>
              <tr class="border-b border-gray-100">
                <td class="py-3 px-4 font-medium">弹窗</td>
                <td class="py-3 px-4">毛玻璃遮罩、卡片弹出</td>
                <td class="py-3 px-4">纯色遮罩、Surface 卡片</td>
              </tr>
              <tr class="border-b border-gray-100">
                <td class="py-3 px-4 font-medium">下拉栏</td>
                <td class="py-3 px-4">圆角触发器、浮动菜单</td>
                <td class="py-3 px-4">Outlined 边框、浮动标签</td>
              </tr>
              <tr class="border-b border-gray-100">
                <td class="py-3 px-4 font-medium">动画</td>
                <td class="py-3 px-4">弹性缩放、spring 效果</td>
                <td class="py-3 px-4">emphasized 缓动、涟漪</td>
              </tr>
              <tr>
                <td class="py-3 px-4 font-medium">移动端</td>
                <td class="py-3 px-4">原生 iOS 感、自然</td>
                <td class="py-3 px-4">原生 Android 感、Bottom Sheet</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@keyframes apple-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
