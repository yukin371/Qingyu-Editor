import type { Meta, StoryObj } from '@storybook/vue3'
import Tooltip from './Tooltip.vue'

/**
 * Tooltip 组件 Storybook 故事
 *
 * 展示所有触发方式、位置选项和功能
 */

import { ref } from 'vue'

const meta = {
  title: 'Design System/Feedback/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  argTypes: {
    trigger: {
      control: 'select',
      options: ['hover', 'click', 'focus', 'manual'],
      description: '触发方式',
    },
    placement: {
      control: 'select',
      options: [
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
        'right-end',
      ],
      description: '显示位置',
    },
    effect: {
      control: 'select',
      options: ['dark', 'light'],
      description: '主题',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
    showArrow: {
      control: 'boolean',
      description: '是否显示箭头',
    },
    offset: {
      control: 'number',
      description: '偏移距离',
    },
    openDelay: {
      control: 'number',
      description: '显示延迟（毫秒）',
    },
    closeDelay: {
      control: 'number',
      description: '隐藏延迟（毫秒）',
    },
  },
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

// 默认故事
export const Default: Story = {
  args: {
    content: '这是一个提示信息',
    placement: 'bottom',
  },
  render: (args) => ({
    components: { Tooltip },
    setup() {
      return { args }
    },
    template: `
      <div class="p-8">
        <Tooltip v-bind="args">
          <button class="px-4 py-2 bg-secondary-500 text-white rounded hover:bg-secondary-600">
            鼠标悬停查看提示
          </button>
        </Tooltip>
      </div>
    `,
  }),
}

// 不同位置
export const Placements: Story = {
  render: () => ({
    components: { Tooltip },
    template: `
      <div class="p-16">
        <div class="grid grid-cols-3 gap-8 max-w-md mx-auto">
          <!-- Top -->
          <div class="col-start-2 flex justify-center">
            <Tooltip placement="top" content="Top 提示">
              <button class="px-4 py-2 bg-secondary-500 text-white rounded">Top</button>
            </Tooltip>
          </div>

          <!-- Left, Center, Right -->
          <div class="flex items-center justify-between">
            <div>
              <Tooltip placement="left" content="Left 提示">
                <button class="px-4 py-2 bg-secondary-500 text-white rounded">Left</button>
              </Tooltip>
            </div>
            <div class="text-gray-400 text-sm">触发位置</div>
            <div>
              <Tooltip placement="right" content="Right 提示">
                <button class="px-4 py-2 bg-secondary-500 text-white rounded">Right</button>
              </Tooltip>
            </div>
          </div>

          <!-- Bottom -->
          <div class="col-start-2 flex justify-center">
            <Tooltip placement="bottom" content="Bottom 提示">
              <button class="px-4 py-2 bg-secondary-500 text-white rounded">Bottom</button>
            </Tooltip>
          </div>
        </div>
      </div>
    `,
  }),
}

// 所有位置选项
export const AllPlacements: Story = {
  render: () => ({
    components: { Tooltip },
    template: `
      <div class="p-16">
        <div class="grid grid-cols-3 gap-4 max-w-lg mx-auto">
          <div class="text-center">
            <Tooltip placement="top-start" content="Top Start">
              <button class="px-3 py-1 bg-secondary-500 text-white text-sm rounded">Top Start</button>
            </Tooltip>
          </div>
          <div class="text-center">
            <Tooltip placement="top" content="Top">
              <button class="px-3 py-1 bg-secondary-500 text-white text-sm rounded">Top</button>
            </Tooltip>
          </div>
          <div class="text-center">
            <Tooltip placement="top-end" content="Top End">
              <button class="px-3 py-1 bg-secondary-500 text-white text-sm rounded">Top End</button>
            </Tooltip>
          </div>

          <div class="text-right">
            <Tooltip placement="left-start" content="Left Start">
              <button class="px-3 py-1 bg-secondary-500 text-white text-sm rounded">Left Start</button>
            </Tooltip>
          </div>
          <div class="text-center text-gray-400 text-xs">触发区域</div>
          <div class="text-left">
            <Tooltip placement="right-start" content="Right Start">
              <button class="px-3 py-1 bg-secondary-500 text-white text-sm rounded">Right Start</button>
            </Tooltip>
          </div>

          <div class="text-right">
            <Tooltip placement="left" content="Left">
              <button class="px-3 py-1 bg-secondary-500 text-white text-sm rounded">Left</button>
            </Tooltip>
          </div>
          <div></div>
          <div class="text-left">
            <Tooltip placement="right" content="Right">
              <button class="px-3 py-1 bg-secondary-500 text-white text-sm rounded">Right</button>
            </Tooltip>
          </div>

          <div class="text-right">
            <Tooltip placement="left-end" content="Left End">
              <button class="px-3 py-1 bg-secondary-500 text-white text-sm rounded">Left End</button>
            </Tooltip>
          </div>
          <div></div>
          <div class="text-left">
            <Tooltip placement="right-end" content="Right End">
              <button class="px-3 py-1 bg-secondary-500 text-white text-sm rounded">Right End</button>
            </Tooltip>
          </div>

          <div class="text-center">
            <Tooltip placement="bottom-start" content="Bottom Start">
              <button class="px-3 py-1 bg-secondary-500 text-white text-sm rounded">Bottom Start</button>
            </Tooltip>
          </div>
          <div class="text-center">
            <Tooltip placement="bottom" content="Bottom">
              <button class="px-3 py-1 bg-secondary-500 text-white text-sm rounded">Bottom</button>
            </Tooltip>
          </div>
          <div class="text-center">
            <Tooltip placement="bottom-end" content="Bottom End">
              <button class="px-3 py-1 bg-secondary-500 text-white text-sm rounded">Bottom End</button>
            </Tooltip>
          </div>
        </div>
      </div>
    `,
  }),
}

// 暗色主题
export const DarkTheme: Story = {
  render: () => ({
    components: { Tooltip },
    template: `
      <div class="bg-gray-900 p-16 min-h-screen">
        <h3 class="text-lg font-semibold text-white mb-8">暗色主题</h3>
        <div class="flex gap-8">
          <Tooltip effect="dark" content="暗色提示">
            <button class="px-4 py-2 bg-secondary-500 text-white rounded">Dark Tooltip</button>
          </Tooltip>
          <Tooltip effect="light" content="亮色提示">
            <button class="px-4 py-2 bg-green-500 text-white rounded">Light Tooltip</button>
          </Tooltip>
        </div>
      </div>
    `,
  }),
}

// 点击触发
export const ClickTrigger: Story = {
  render: () => ({
    components: { Tooltip },
    template: `
      <div class="p-8 space-y-4">
        <Tooltip trigger="click" content="点击触发的提示">
          <button class="px-4 py-2 bg-secondary-500 text-white rounded hover:bg-secondary-600">
            点击我
          </button>
        </Tooltip>

        <Tooltip trigger="click" placement="right" content="右侧显示的点击提示">
          <button class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
            点击显示在右侧
          </button>
        </Tooltip>
      </div>
    `,
  }),
}

// 焦点触发
export const FocusTrigger: Story = {
  render: () => ({
    components: { Tooltip },
    template: `
      <div class="p-8 space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">输入框获得焦点时显示提示</label>
          <Tooltip trigger="focus" placement="top" content="请输入您的用户名">
            <input
              type="text"
              placeholder="用户名"
              class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary-500"
            />
          </Tooltip>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">密码框</label>
          <Tooltip trigger="focus" placement="right" content="密码至少 8 位，包含字母和数字">
            <input
              type="password"
              placeholder="密码"
              class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary-500"
            />
          </Tooltip>
        </div>
      </div>
    `,
  }),
}

// 禁用状态
export const Disabled: Story = {
  render: () => ({
    components: { Tooltip },
    setup() {
      const disabled = ref(false)
      return { disabled }
    },
    template: `
      <div class="p-8 space-y-4">
        <div>
          <button
            @click="disabled = !disabled"
            class="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            {{ disabled ? '启用' : '禁用' }} Tooltip
          </button>
        </div>

        <Tooltip :disabled="disabled" content="这个提示可能被禁用">
          <button class="px-4 py-2 bg-secondary-500 text-white rounded hover:bg-secondary-600">
            鼠标悬停查看提示
          </button>
        </Tooltip>
      </div>
    `,
  }),
}

// 富文本内容
export const MoreContent: Story = {
  render: () => ({
    components: { Tooltip },
    template: `
      <div class="p-8 space-y-4">
        <Tooltip content="这是一段较长的提示文本，可以包含更多的信息和说明。">
          <button class="px-4 py-2 bg-secondary-500 text-white rounded">长文本提示</button>
        </Tooltip>

        <Tooltip
          content="支持多行文本提示。可以包含换行符和更详细的说明内容，帮助用户更好地理解。"
          placement="right"
          :offset="16"
        >
          <button class="px-4 py-2 bg-purple-500 text-white rounded">多行文本提示</button>
        </Tooltip>

        <Tooltip content="带有格式化内容的提示，比如重点内容可以特别标注。">
          <button class="px-4 py-2 bg-green-500 text-white rounded">格式化内容</button>
        </Tooltip>
      </div>
    `,
  }),
}

// 自定义内容
export const CustomContent: Story = {
  render: () => ({
    components: { Tooltip },
    template: `
      <div class="p-8 space-y-4">
        <Tooltip>
          <template #content>
            <div class="space-y-1">
              <div class="font-semibold">自定义标题</div>
              <div class="text-xs opacity-80">这是自定义的提示内容</div>
            </div>
          </template>
          <button class="px-4 py-2 bg-secondary-500 text-white rounded">自定义内容</button>
        </Tooltip>

        <Tooltip>
          <template #content>
            <div class="flex items-center gap-2">
              <span class="text-green-400">✓</span>
              <span>操作成功</span>
            </div>
          </template>
          <button class="px-4 py-2 bg-green-500 text-white rounded">带图标</button>
        </Tooltip>

        <Tooltip>
          <template #content>
            <div class="space-y-1">
              <div>快捷键提示</div>
              <div class="text-xs font-mono bg-gray-700 px-2 py-1 rounded">Ctrl + S</div>
            </div>
          </template>
          <button class="px-4 py-2 bg-purple-500 text-white rounded">快捷键提示</button>
        </Tooltip>
      </div>
    `,
  }),
}

// 延迟显示
export const Delayed: Story = {
  render: () => ({
    components: { Tooltip },
    template: `
      <div class="p-8 space-y-4">
        <div>
          <p class="text-sm text-gray-600 mb-2">延迟 500ms 显示</p>
          <Tooltip :open-delay="500" content="延迟 500ms 显示的提示">
            <button class="px-4 py-2 bg-secondary-500 text-white rounded">延迟显示</button>
          </Tooltip>
        </div>

        <div>
          <p class="text-sm text-gray-600 mb-2">延迟 300ms 显示，延迟 500ms 隐藏</p>
          <Tooltip :open-delay="300" :close-delay="500" content="延迟显示和隐藏">
            <button class="px-4 py-2 bg-purple-500 text-white rounded">双向延迟</button>
          </Tooltip>
        </div>
      </div>
    `,
  }),
}

// 无箭头
export const WithoutArrow: Story = {
  render: () => ({
    components: { Tooltip },
    template: `
      <div class="p-8 space-y-4">
        <Tooltip :show-arrow="false" content="不显示箭头的提示">
          <button class="px-4 py-2 bg-secondary-500 text-white rounded">无箭头提示</button>
        </Tooltip>

        <Tooltip :show-arrow="false" placement="right" content="右侧无箭头提示">
          <button class="px-4 py-2 bg-purple-500 text-white rounded">右侧无箭头</button>
        </Tooltip>
      </div>
    `,
  }),
}

// 不同偏移量
export const CustomOffset: Story = {
  render: () => ({
    components: { Tooltip },
    template: `
      <div class="p-16">
        <Tooltip placement="bottom" :offset="8" content="偏移 8px">
          <button class="px-4 py-2 bg-secondary-500 text-white rounded">8px</button>
        </Tooltip>

        <Tooltip placement="bottom" :offset="16" content="偏移 16px">
          <button class="px-4 py-2 bg-secondary-600 text-white rounded ml-4">16px</button>
        </Tooltip>

        <Tooltip placement="bottom" :offset="24" content="偏移 24px">
          <button class="px-4 py-2 bg-secondary-700 text-white rounded ml-4">24px</button>
        </Tooltip>
      </div>
    `,
  }),
}

// 实际应用场景
export const RealWorldUsage: Story = {
  render: () => ({
    components: { Tooltip },
    template: `
      <div class="p-8 space-y-8">
        <!-- 按钮提示 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">按钮操作提示</h3>
          <div class="flex gap-2">
            <Tooltip content="保存当前编辑的内容">
              <button class="p-2 bg-gray-100 rounded hover:bg-gray-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </Tooltip>

            <Tooltip content="编辑选中项">
              <button class="p-2 bg-gray-100 rounded hover:bg-gray-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </Tooltip>

            <Tooltip content="删除选中项">
              <button class="p-2 bg-gray-100 rounded hover:bg-gray-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </Tooltip>
          </div>
        </div>

        <!-- 表单字段提示 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">表单字段提示</h3>
          <div class="space-y-3 max-w-sm">
            <div>
              <label class="flex items-center gap-2 text-sm font-medium">
                用户名
                <Tooltip placement="right" content="用户名必须是唯一的，用于登录系统">
                  <svg class="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Tooltip>
              </label>
              <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded" placeholder="请输入用户名" />
            </div>

            <div>
              <label class="flex items-center gap-2 text-sm font-medium">
                密码
                <Tooltip placement="right" content="密码长度 8-20 位，必须包含字母和数字">
                  <svg class="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Tooltip>
              </label>
              <input type="password" class="w-full px-3 py-2 border border-gray-300 rounded" placeholder="请输入密码" />
            </div>
          </div>
        </div>

        <!-- 状态指示 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">状态指示</h3>
          <div class="flex gap-4">
            <Tooltip content="文件已同步">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                <span class="text-sm">已同步</span>
              </div>
            </Tooltip>

            <Tooltip content="文件正在同步中">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                <span class="text-sm">同步中</span>
              </div>
            </Tooltip>

            <Tooltip content="同步失败，点击重试">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-red-500 rounded-full"></span>
                <span class="text-sm">同步失败</span>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    `,
  }),
}

// 手动控制
export const ManualControl: Story = {
  render: () => ({
    components: { Tooltip },
    setup() {
      const visible = ref(false)
      return { visible }
    },
    template: `
      <div class="p-8 space-y-4">
        <div class="flex gap-2">
          <button
            @click="visible = true"
            class="px-4 py-2 bg-secondary-500 text-white rounded hover:bg-secondary-600"
          >
            显示
          </button>
          <button
            @click="visible = false"
            class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            隐藏
          </button>
          <button
            @click="visible = !visible"
            class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            切换
          </button>
        </div>

        <Tooltip trigger="manual" v-model="visible" content="手动控制的提示内容">
          <button class="px-4 py-2 bg-green-500 text-white rounded">
            Tooltip 状态: {{ visible ? '显示' : '隐藏' }}
          </button>
        </Tooltip>
      </div>
    `,
  }),
}
