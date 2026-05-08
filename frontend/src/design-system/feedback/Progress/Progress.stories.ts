import type { Meta, StoryObj } from '@storybook/vue3'
import Progress from './Progress.vue'

/**
 * Progress 组件 Storybook 故事
 *
 * 展示所有类型、变体和功能
 */

import { ref } from 'vue'

const meta = {
  title: 'Design System/Feedback/Progress',
  component: Progress,
  tags: ['autodocs'],
  argTypes: {
    percentage: {
      control: 'number',
      description: '百分比（0-100）',
    },
    type: {
      control: 'select',
      options: ['line', 'circle', 'dashboard'],
      description: 'Progress 类型',
    },
    strokeWidth: {
      control: 'number',
      description: '线条粗细',
    },
    status: {
      control: 'select',
      options: ['success', 'exception', 'warning', 'active'],
      description: '状态',
    },
    color: {
      control: 'color',
      description: '进度条颜色',
    },
    striped: {
      control: 'boolean',
      description: '是否显示条纹动画',
    },
    flow: {
      control: 'boolean',
      description: '是否为流动动画',
    },
    textInside: {
      control: 'boolean',
      description: '文字是否在进度条内部',
    },
    showText: {
      control: 'boolean',
      description: '是否显示百分比文字',
    },
    width: {
      control: 'number',
      description: '容器宽度（circle/dashboard）',
    },
  },
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

// 默认故事
export const Default: Story = {
  args: {
    percentage: 50,
    type: 'line',
  },
  render: (args) => ({
    components: { Progress },
    setup() {
      return { args }
    },
    template: '<Progress v-bind="args" />',
  }),
}

// 不同百分比
export const Percentages: Story = {
  render: () => ({
    components: { Progress },
    template: `
      <div class="space-y-6 p-8 w-full max-w-2xl">
        <Progress :percentage="0" />
        <Progress :percentage="25" />
        <Progress :percentage="50" />
        <Progress :percentage="75" />
        <Progress :percentage="100" />
      </div>
    `,
  }),
}

// 不同状态
export const Status: Story = {
  render: () => ({
    components: { Progress },
    template: `
      <div class="space-y-6 p-8 w-full max-w-2xl">
        <Progress :percentage="80" status="success" />
        <Progress :percentage="60" status="exception" />
        <Progress :percentage="40" status="warning" />
        <Progress :percentage="30" status="active" />
      </div>
    `,
  }),
}

// 条纹动画
export const Striped: Story = {
  render: () => ({
    components: { Progress },
    template: `
      <div class="space-y-6 p-8 w-full max-w-2xl">
        <div>
          <h3 class="mb-2 text-sm font-medium">静态条纹</h3>
          <Progress :percentage="50" :striped="true" />
        </div>
        <div>
          <h3 class="mb-2 text-sm font-medium">流动条纹</h3>
          <Progress :percentage="50" :striped="true" :flow="true" />
        </div>
        <div>
          <h3 class="mb-2 text-sm font-medium">不同百分比的流动条纹</h3>
          <Progress :percentage="30" :striped="true" :flow="true" />
          <Progress :percentage="60" :striped="true" :flow="true" />
          <Progress :percentage="90" :striped="true" :flow="true" />
        </div>
      </div>
    `,
  }),
}

// 文字内部显示
export const TextInside: Story = {
  render: () => ({
    components: { Progress },
    template: `
      <div class="space-y-6 p-8 w-full max-w-2xl">
        <Progress :percentage="30" :text-inside="true" />
        <Progress :percentage="50" :text-inside="true" />
        <Progress :percentage="70" :text-inside="true" />
        <Progress :percentage="100" status="success" :text-inside="true" />
      </div>
    `,
  }),
}

// 圆形进度条
export const Circle: Story = {
  render: () => ({
    components: { Progress },
    template: `
      <div class="space-y-8 p-8">
        <div class="flex gap-8 items-end">
          <Progress type="circle" :percentage="0" />
          <Progress type="circle" :percentage="25" />
          <Progress type="circle" :percentage="50" />
          <Progress type="circle" :percentage="75" />
          <Progress type="circle" :percentage="100" />
        </div>
      </div>
    `,
  }),
}

// 仪表盘
export const Dashboard: Story = {
  render: () => ({
    components: { Progress },
    template: `
      <div class="space-y-8 p-8">
        <div class="flex gap-8 items-end">
          <Progress type="dashboard" :percentage="0" />
          <Progress type="dashboard" :percentage="25" />
          <Progress type="dashboard" :percentage="50" />
          <Progress type="dashboard" :percentage="75" />
          <Progress type="dashboard" :percentage="100" />
        </div>
      </div>
    `,
  }),
}

// 自定义颜色
export const CustomColor: Story = {
  render: () => ({
    components: { Progress },
    template: `
      <div class="space-y-6 p-8 w-full max-w-2xl">
        <div>
          <h3 class="mb-2 text-sm font-medium">单一颜色</h3>
          <Progress :percentage="60" color="#8b5cf6" />
        </div>
        <div>
          <h3 class="mb-2 text-sm font-medium">渐变颜色</h3>
          <Progress :percentage="60" :color="['#ec4899', '#8b5cf6', '#3b82f6']" />
        </div>
        <div>
          <h3 class="mb-2 text-sm font-medium">函数颜色</h3>
          <Progress :percentage="60" :color="(percentage) => percentage > 50 ? '#10b981' : '#f59e0b'" />
        </div>
      </div>
    `,
  }),
}

// 动态变化
export const Dynamic: Story = {
  render: () => ({
    components: { Progress },
    setup() {
      const percentage = ref(0)

      const increase = () => {
        percentage.value = Math.min(100, percentage.value + 10)
      }

      const decrease = () => {
        percentage.value = Math.max(0, percentage.value - 10)
      }

      return { percentage, increase, decrease }
    },
    template: `
      <div class="space-y-6 p-8 w-full max-w-2xl">
        <div class="flex gap-4">
          <button
            @click="decrease"
            class="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300 transition-colors"
          >
            -10%
          </button>
          <button
            @click="increase"
            class="px-4 py-2 bg-secondary-500 text-white rounded hover:bg-secondary-600 transition-colors"
          >
            +10%
          </button>
        </div>
        <Progress :percentage="percentage" />
        <div class="flex gap-8 items-end">
          <Progress type="circle" :percentage="percentage" />
          <Progress type="dashboard" :percentage="percentage" />
        </div>
      </div>
    `,
  }),
}

// 无文字
export const NoText: Story = {
  render: () => ({
    components: { Progress },
    template: `
      <div class="space-y-6 p-8 w-full max-w-2xl">
        <div>
          <h3 class="mb-2 text-sm font-medium">线性进度条（无文字）</h3>
          <Progress :percentage="50" :show-text="false" />
        </div>
        <div>
          <h3 class="mb-2 text-sm font-medium">圆形进度条（无文字）</h3>
          <Progress type="circle" :percentage="50" :show-text="false" />
        </div>
        <div>
          <h3 class="mb-2 text-sm font-medium">仪表盘（无文字）</h3>
          <Progress type="dashboard" :percentage="50" :show-text="false" />
        </div>
      </div>
    `,
  }),
}

// 不同尺寸
export const Sizes: Story = {
  render: () => ({
    components: { Progress },
    template: `
      <div class="space-y-8 p-8">
        <div>
          <h3 class="mb-4 text-sm font-medium">圆形进度条不同尺寸</h3>
          <div class="flex gap-8 items-end">
            <Progress type="circle" :percentage="75" :width="80" />
            <Progress type="circle" :percentage="75" :width="120" />
            <Progress type="circle" :percentage="75" :width="160" />
          </div>
        </div>
        <div>
          <h3 class="mb-4 text-sm font-medium">仪表盘不同尺寸</h3>
          <div class="flex gap-8 items-end">
            <Progress type="dashboard" :percentage="75" :width="80" />
            <Progress type="dashboard" :percentage="75" :width="120" />
            <Progress type="dashboard" :percentage="75" :width="160" />
          </div>
        </div>
      </div>
    `,
  }),
}

// 自定义文字格式
export const CustomFormat: Story = {
  render: () => ({
    components: { Progress },
    setup() {
      const format = (percentage: number) => {
        return `${percentage} / 100`
      }

      return { format }
    },
    template: `
      <div class="space-y-6 p-8 w-full max-w-2xl">
        <Progress :percentage="60" :format="format" />
        <Progress type="circle" :percentage="75" :format="format" />
        <Progress type="dashboard" :percentage="90" :format="format" />
      </div>
    `,
  }),
}

// 不同线条粗细
export const StrokeWidth: Story = {
  render: () => ({
    components: { Progress },
    template: `
      <div class="space-y-6 p-8 w-full max-w-2xl">
        <Progress :percentage="50" :stroke-width="4" />
        <Progress :percentage="50" :stroke-width="8" />
        <Progress :percentage="50" :stroke-width="12" />
        <Progress :percentage="50" :stroke-width="16" />
      </div>
    `,
  }),
}

// 实际应用场景
export const RealWorldUsage: Story = {
  render: () => ({
    components: { Progress },
    setup() {
      const uploadProgress = ref(45)
      const downloadProgress = ref(72)
      const processingProgress = ref(88)

      return {
        uploadProgress,
        downloadProgress,
        processingProgress,
      }
    },
    template: `
      <div class="space-y-8 p-8 w-full max-w-2xl">
        <!-- 文件上传 -->
        <div>
          <div class="flex justify-between mb-2">
            <span class="text-sm font-medium">上传文件</span>
            <span class="text-sm text-slate-500">{{ uploadProgress }}%</span>
          </div>
          <Progress :percentage="uploadProgress" status="active" :striped="true" :flow="true" />
        </div>

        <!-- 文件下载 -->
        <div>
          <div class="flex justify-between mb-2">
            <span class="text-sm font-medium">下载文件</span>
            <span class="text-sm text-slate-500">{{ downloadProgress }}%</span>
          </div>
          <Progress :percentage="downloadProgress" color="#10b981" />
        </div>

        <!-- 数据处理 -->
        <div>
          <div class="flex justify-between mb-2">
            <span class="text-sm font-medium">数据处理</span>
            <span class="text-sm text-slate-500">{{ processingProgress }}%</span>
          </div>
          <Progress :percentage="processingProgress" status="success" />
        </div>

        <!-- 存储空间 -->
        <div>
          <div class="flex justify-between mb-2">
            <span class="text-sm font-medium">存储空间</span>
            <span class="text-sm text-slate-500">85%</span>
          </div>
          <Progress :percentage="85" status="warning" />
        </div>

        <!-- CPU 使用率 -->
        <div>
          <div class="flex justify-between mb-2">
            <span class="text-sm font-medium">CPU 使用率</span>
            <span class="text-sm text-slate-500">92%</span>
          </div>
          <Progress :percentage="92" status="exception" />
        </div>
      </div>
    `,
  }),
}

// 仪表盘不同起始位置
export const DashboardPositions: Story = {
  render: () => ({
    components: { Progress },
    template: `
      <div class="space-y-8 p-8">
        <div class="flex gap-8 items-end">
          <div class="text-center">
            <Progress type="dashboard" :percentage="75" gap-position="top" />
            <p class="mt-2 text-sm">Top</p>
          </div>
          <div class="text-center">
            <Progress type="dashboard" :percentage="75" gap-position="bottom" />
            <p class="mt-2 text-sm">Bottom</p>
          </div>
          <div class="text-center">
            <Progress type="dashboard" :percentage="75" gap-position="left" />
            <p class="mt-2 text-sm">Left</p>
          </div>
          <div class="text-center">
            <Progress type="dashboard" :percentage="75" gap-position="right" />
            <p class="mt-2 text-sm">Right</p>
          </div>
        </div>
      </div>
    `,
  }),
}

// 组合示例
export const Combinations: Story = {
  render: () => ({
    components: { Progress },
    template: `
      <div class="space-y-8 p-8">
        <!-- 线性进度条组合 -->
        <div>
          <h3 class="mb-4 text-lg font-semibold">线性进度条</h3>
          <div class="space-y-4 w-full max-w-2xl">
            <Progress :percentage="25" />
            <Progress :percentage="50" status="success" :striped="true" />
            <Progress :percentage="75" :text-inside="true" />
            <Progress :percentage="100" status="exception" />
          </div>
        </div>

        <!-- 圆形进度条组合 -->
        <div>
          <h3 class="mb-4 text-lg font-semibold">圆形进度条</h3>
          <div class="flex gap-8">
            <Progress type="circle" :percentage="25" />
            <Progress type="circle" :percentage="50" status="success" />
            <Progress type="circle" :percentage="75" color="#8b5cf6" />
            <Progress type="circle" :percentage="100" status="exception" />
          </div>
        </div>

        <!-- 仪表盘组合 -->
        <div>
          <h3 class="mb-4 text-lg font-semibold">仪表盘</h3>
          <div class="flex gap-8">
            <Progress type="dashboard" :percentage="25" />
            <Progress type="dashboard" :percentage="50" status="success" />
            <Progress type="dashboard" :percentage="75" color="#8b5cf6" />
            <Progress type="dashboard" :percentage="100" status="warning" />
          </div>
        </div>
      </div>
    `,
  }),
}
