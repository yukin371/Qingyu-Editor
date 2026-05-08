import type { Meta, StoryObj } from '@storybook/vue3'
import Spinner from './Spinner.vue'

/**
 * Spinner 组件 Storybook 故事
 *
 * 展示所有类型、变体和功能
 */

import { ref } from 'vue'

const meta = {
  title: 'Design System/Feedback/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['default', 'dots', 'bars', 'wave'],
      description: 'Spinner 类型',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '尺寸',
    },
    color: {
      control: 'color',
      description: '自定义颜色',
    },
    strokeWidth: {
      control: 'number',
      description: '线条粗细（仅 default 类型）',
    },
    label: {
      control: 'text',
      description: '加载文字说明',
    },
  },
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

// 默认故事
export const Default: Story = {
  args: {
    type: 'default',
    size: 'md',
  },
  render: (args) => ({
    components: { Spinner },
    setup() {
      return { args }
    },
    template: '<Spinner v-bind="args" />',
  }),
}

// 不同类型
export const Types: Story = {
  render: () => ({
    components: { Spinner },
    template: `
      <div class="space-y-6 p-8">
        <div class="flex items-center gap-4">
          <Spinner type="default" />
          <span class="text-sm text-slate-600">Default (默认旋转)</span>
        </div>
        <div class="flex items-center gap-4">
          <Spinner type="dots" />
          <span class="text-sm text-slate-600">Dots (点动画)</span>
        </div>
        <div class="flex items-center gap-4">
          <Spinner type="bars" />
          <span class="text-sm text-slate-600">Bars (条形动画)</span>
        </div>
        <div class="flex items-center gap-4">
          <Spinner type="wave" />
          <span class="text-sm text-slate-600">Wave (波浪动画)</span>
        </div>
      </div>
    `,
  }),
}

// 不同尺寸
export const Sizes: Story = {
  render: () => ({
    components: { Spinner },
    template: `
      <div class="space-y-6 p-8">
        <div class="flex items-center gap-4">
          <Spinner size="sm" label="小尺寸" />
          <span class="text-sm text-slate-600">Small (sm)</span>
        </div>
        <div class="flex items-center gap-4">
          <Spinner size="md" label="中等尺寸" />
          <span class="text-sm text-slate-600">Medium (md)</span>
        </div>
        <div class="flex items-center gap-4">
          <Spinner size="lg" label="大尺寸" />
          <span class="text-sm text-slate-600">Large (lg)</span>
        </div>
      </div>
    `,
  }),
}

// 带文字说明
export const WithLabel: Story = {
  render: () => ({
    components: { Spinner },
    template: `
      <div class="space-y-4 p-8">
        <Spinner type="default" label="正在加载..." />
        <Spinner type="dots" label="请稍候" />
        <Spinner type="bars" label="处理中" />
        <Spinner type="wave" label="数据加载中..." />
      </div>
    `,
  }),
}

// 自定义颜色
export const CustomColor: Story = {
  render: () => ({
    components: { Spinner },
    template: `
      <div class="space-y-4 p-8">
        <div class="flex items-center gap-6">
          <Spinner color="#3b82f6" label="蓝色" />
          <Spinner color="#ef4444" label="红色" />
          <Spinner color="#10b981" label="绿色" />
          <Spinner color="#f59e0b" label="橙色" />
        </div>
        <div class="flex items-center gap-6">
          <Spinner color="#8b5cf6" label="紫色" />
          <Spinner color="#ec4899" label="粉色" />
          <Spinner color="#06b6d4" label="青色" />
          <Spinner color="#6366f1" label="靛蓝" />
        </div>
      </div>
    `,
  }),
}

// 内联显示
export const Inline: Story = {
  render: () => ({
    components: { Spinner },
    template: `
      <div class="p-8 space-y-4">
        <p class="text-slate-700">
          正在保存您的更改 <Spinner type="dots" size="sm" />
        </p>
        <p class="text-slate-700">
          文件上传中 <Spinner type="bars" size="sm" />
        </p>
        <p class="text-slate-700">
          数据同步中 <Spinner type="wave" size="sm" />
        </p>
        <button class="px-4 py-2 bg-secondary-500 text-white rounded hover:bg-secondary-600 disabled:opacity-50">
          <span class="flex items-center gap-2">
            <Spinner type="default" size="sm" color="white" />
            提交中...
          </span>
        </button>
      </div>
    `,
  }),
}

// 全屏加载
export const FullScreen: Story = {
  render: () => ({
    components: { Spinner },
    template: `
      <div class="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
        <div class="text-center">
          <Spinner type="default" size="lg" label="正在加载..." />
        </div>
      </div>
    `,
  }),
}

// 按钮内加载
export const InsideButton: Story = {
  render: () => ({
    components: { Spinner },
    setup() {
      const buttons = ref([
        { text: '加载中', loading: true, variant: 'primary' },
        { text: '提交中', loading: true, variant: 'success' },
        { text: '处理中', loading: true, variant: 'warning' },
        { text: '删除中', loading: true, variant: 'danger' },
      ])

      const variantClasses = {
        primary: 'bg-secondary-500 hover:bg-secondary-600',
        success: 'bg-green-500 hover:bg-green-600',
        warning: 'bg-orange-500 hover:bg-orange-600',
        danger: 'bg-red-500 hover:bg-red-600',
      }

      return { buttons, variantClasses }
    },
    template: `
      <div class="p-8 space-y-4">
        <div class="flex items-center gap-4">
          <button
            v-for="btn in buttons"
            :key="btn.text"
            :class="[
              'px-4 py-2 text-white rounded disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-2',
              variantClasses[btn.variant]
            ]"
            disabled
          >
            <Spinner size="sm" color="white" />
            {{ btn.text }}
          </button>
        </div>
        <div class="flex items-center gap-4">
          <button class="px-4 py-2 bg-slate-100 text-slate-700 rounded flex items-center gap-2">
            <Spinner type="dots" size="sm" />
            等待中
          </button>
          <button class="px-4 py-2 bg-slate-100 text-slate-700 rounded flex items-center gap-2">
            <Spinner type="bars" size="sm" />
            处理中
          </button>
          <button class="px-4 py-2 bg-slate-100 text-slate-700 rounded flex items-center gap-2">
            <Spinner type="wave" size="sm" />
            上传中
          </button>
        </div>
      </div>
    `,
  }),
}

// 不同线条粗细
export const StrokeWidth: Story = {
  render: () => ({
    components: { Spinner },
    template: `
      <div class="space-y-4 p-8">
        <div class="flex items-center gap-4">
          <Spinner :stroke-width="2" label="线条粗细 2" />
          <span class="text-sm text-slate-600">stroke-width: 2</span>
        </div>
        <div class="flex items-center gap-4">
          <Spinner :stroke-width="3" label="线条粗细 3 (默认)" />
          <span class="text-sm text-slate-600">stroke-width: 3</span>
        </div>
        <div class="flex items-center gap-4">
          <Spinner :stroke-width="4" label="线条粗细 4" />
          <span class="text-sm text-slate-600">stroke-width: 4</span>
        </div>
        <div class="flex items-center gap-4">
          <Spinner :stroke-width="6" label="线条粗细 6" />
          <span class="text-sm text-slate-600">stroke-width: 6</span>
        </div>
      </div>
    `,
  }),
}

// 自定义插槽内容
export const CustomSlot: Story = {
  render: () => ({
    components: { Spinner },
    template: `
      <div class="space-y-4 p-8">
        <Spinner type="default">
          <template #default>
            <span class="text-secondary-600 font-semibold">自定义加载文字</span>
          </template>
        </Spinner>
        <Spinner type="dots">
          <span class="text-green-600">请稍候片刻...</span>
        </Spinner>
        <Spinner type="bars">
          <div class="flex items-center gap-2">
            <span>正在处理</span>
            <span class="text-xs text-slate-500">(预计 30 秒)</span>
          </div>
        </Spinner>
        <Spinner type="wave">
          <div class="flex items-center gap-2">
            <span>数据加载中</span>
            <button class="text-xs text-secondary-500 hover:underline">取消</button>
          </div>
        </Spinner>
      </div>
    `,
  }),
}

// 实际应用场景
export const RealWorldUsage: Story = {
  render: () => ({
    components: { Spinner },
    template: `
      <div class="p-8 space-y-8">
        <!-- 表单提交 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">表单提交</h3>
          <div class="border rounded-lg p-4 bg-slate-50">
            <div class="space-y-3">
              <div class="h-4 bg-slate-200 rounded animate-pulse"></div>
              <div class="h-4 bg-slate-200 rounded w-2/3 animate-pulse"></div>
              <div class="flex justify-end mt-4">
                <button class="px-4 py-2 bg-secondary-500 text-white rounded flex items-center gap-2">
                  <Spinner size="sm" color="white" />
                  提交中...
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 数据表格加载 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">数据表格</h3>
          <div class="border rounded-lg overflow-hidden">
            <div class="bg-slate-50 p-4 flex items-center justify-center h-48">
              <div class="text-center">
                <Spinner type="bars" size="lg" label="加载数据中..." />
              </div>
            </div>
          </div>
        </div>

        <!-- 页面初始加载 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">页面加载</h3>
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-center py-8">
              <Spinner type="wave" size="lg" label="应用初始化中..." />
            </div>
          </div>
        </div>

        <!-- 文件上传 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">文件上传</h3>
          <div class="border-2 border-dashed border-slate-300 rounded-lg p-8">
            <div class="text-center">
              <Spinner type="dots" label="正在上传文件..." />
              <p class="text-sm text-slate-500 mt-2">请勿关闭浏览器</p>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

// 暗色主题
export const DarkTheme: Story = {
  render: () => ({
    components: { Spinner },
    template: `
      <div class="bg-slate-900 p-8 space-y-6">
        <h3 class="text-lg font-semibold text-white mb-4">暗色主题</h3>
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <Spinner type="default" color="white" label="默认类型" />
            <span class="text-sm text-slate-400">Default</span>
          </div>
          <div class="flex items-center gap-4">
            <Spinner type="dots" color="#60a5fa" label="点动画" />
            <span class="text-sm text-slate-400">Dots</span>
          </div>
          <div class="flex items-center gap-4">
            <Spinner type="bars" color="#34d399" label="条形动画" />
            <span class="text-sm text-slate-400">Bars</span>
          </div>
          <div class="flex items-center gap-4">
            <Spinner type="wave" color="#f472b6" label="波浪动画" />
            <span class="text-sm text-slate-400">Wave</span>
          </div>
        </div>
      </div>
    `,
  }),
}

// 所有尺寸和类型组合
export const AllCombinations: Story = {
  render: () => ({
    components: { Spinner },
    template: `
      <div class="p-8">
        <h3 class="text-lg font-semibold mb-6">所有尺寸和类型组合</h3>
        <div class="grid grid-cols-4 gap-6">
          <!-- Default -->
          <div>
            <h4 class="text-sm font-medium text-slate-600 mb-3">Default</h4>
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <Spinner type="default" size="sm" />
                <span class="text-xs text-slate-500">sm</span>
              </div>
              <div class="flex items-center gap-2">
                <Spinner type="default" size="md" />
                <span class="text-xs text-slate-500">md</span>
              </div>
              <div class="flex items-center gap-2">
                <Spinner type="default" size="lg" />
                <span class="text-xs text-slate-500">lg</span>
              </div>
            </div>
          </div>

          <!-- Dots -->
          <div>
            <h4 class="text-sm font-medium text-slate-600 mb-3">Dots</h4>
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <Spinner type="dots" size="sm" />
                <span class="text-xs text-slate-500">sm</span>
              </div>
              <div class="flex items-center gap-2">
                <Spinner type="dots" size="md" />
                <span class="text-xs text-slate-500">md</span>
              </div>
              <div class="flex items-center gap-2">
                <Spinner type="dots" size="lg" />
                <span class="text-xs text-slate-500">lg</span>
              </div>
            </div>
          </div>

          <!-- Bars -->
          <div>
            <h4 class="text-sm font-medium text-slate-600 mb-3">Bars</h4>
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <Spinner type="bars" size="sm" />
                <span class="text-xs text-slate-500">sm</span>
              </div>
              <div class="flex items-center gap-2">
                <Spinner type="bars" size="md" />
                <span class="text-xs text-slate-500">md</span>
              </div>
              <div class="flex items-center gap-2">
                <Spinner type="bars" size="lg" />
                <span class="text-xs text-slate-500">lg</span>
              </div>
            </div>
          </div>

          <!-- Wave -->
          <div>
            <h4 class="text-sm font-medium text-slate-600 mb-3">Wave</h4>
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <Spinner type="wave" size="sm" />
                <span class="text-xs text-slate-500">sm</span>
              </div>
              <div class="flex items-center gap-2">
                <Spinner type="wave" size="md" />
                <span class="text-xs text-slate-500">md</span>
              </div>
              <div class="flex items-center gap-2">
                <Spinner type="wave" size="lg" />
                <span class="text-xs text-slate-500">lg</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}
