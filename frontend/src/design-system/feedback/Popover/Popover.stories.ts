import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import Popover from './Popover.vue'

/**
 * Popover 组件 Storybook 故事
 *
 * 展示所有触发方式、位置选项和功能
 */

const meta = {
  title: 'Design System/Feedback/Popover',
  component: Popover,
  tags: ['autodocs'],
  argTypes: {
    trigger: {
      control: 'select',
      options: ['click', 'hover', 'focus', 'manual'],
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
      description: '出现位置',
    },
    width: {
      control: 'text',
      description: '宽度',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
    content: {
      control: 'text',
      description: '内容',
    },
    offset: {
      control: 'number',
      description: '偏移量',
    },
    showArrow: {
      control: 'boolean',
      description: '是否显示箭头',
    },
    openDelay: {
      control: 'number',
      description: '延迟显示时间（毫秒）',
    },
    closeDelay: {
      control: 'number',
      description: '延迟关闭时间（毫秒）',
    },
    closeOnClickOutside: {
      control: 'boolean',
      description: '是否在点击外部时关闭',
    },
  },
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

// 默认故事
export const Default: Story = {
  args: {
    trigger: 'click',
    content: '这是一段内容',
  },
  render: (args) => ({
    components: { Popover },
    setup() {
      return { args }
    },
    template: `
      <div class="p-20">
        <Popover v-bind="args">
          <button class="px-4 py-2 bg-secondary-500 text-white rounded hover:bg-secondary-600">
            点击我
          </button>
        </Popover>
      </div>
    `,
  }),
}

// 基础用法
export const Basic: Story = {
  render: () => ({
    components: { Popover },
    template: `
      <div class="p-20 space-x-4">
        <Popover content="这是一段内容">
          <button class="px-4 py-2 bg-secondary-500 text-white rounded hover:bg-secondary-600">
            点击触发
          </button>
        </Popover>

        <Popover content="悬停显示" trigger="hover">
          <button class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            悬停触发
          </button>
        </Popover>

        <Popover content="聚焦显示" trigger="focus">
          <button class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
            聚焦触发
          </button>
        </Popover>
      </div>
    `,
  }),
}

// 不同位置
export const Placements: Story = {
  render: () => ({
    components: { Popover },
    template: `
      <div class="p-40">
        <div class="grid grid-cols-3 gap-8">
          <!-- Top positions -->
          <div class="space-y-4">
            <h3 class="text-center font-semibold mb-4">顶部位置</h3>
            <div class="flex justify-center gap-4">
              <Popover placement="top-start" content="Top Start">
                <button class="px-3 py-1 bg-slate-200 rounded">Top Start</button>
              </Popover>
              <Popover placement="top" content="Top">
                <button class="px-3 py-1 bg-slate-200 rounded">Top</button>
              </Popover>
              <Popover placement="top-end" content="Top End">
                <button class="px-3 py-1 bg-slate-200 rounded">Top End</button>
              </Popover>
            </div>
          </div>

          <!-- Left/Right positions -->
          <div class="space-y-4">
            <h3 class="text-center font-semibold mb-4">左右位置</h3>
            <div class="flex justify-center gap-4">
              <Popover placement="left-start" content="Left Start">
                <button class="px-3 py-1 bg-slate-200 rounded">Left Start</button>
              </Popover>
              <Popover placement="right-start" content="Right Start">
                <button class="px-3 py-1 bg-slate-200 rounded">Right Start</button>
              </Popover>
            </div>
            <div class="flex justify-center gap-4">
              <Popover placement="left" content="Left">
                <button class="px-3 py-1 bg-slate-200 rounded">Left</button>
              </Popover>
              <Popover placement="right" content="Right">
                <button class="px-3 py-1 bg-slate-200 rounded">Right</button>
              </Popover>
            </div>
            <div class="flex justify-center gap-4">
              <Popover placement="left-end" content="Left End">
                <button class="px-3 py-1 bg-slate-200 rounded">Left End</button>
              </Popover>
              <Popover placement="right-end" content="Right End">
                <button class="px-3 py-1 bg-slate-200 rounded">Right End</button>
              </Popover>
            </div>
          </div>

          <!-- Bottom positions -->
          <div class="space-y-4">
            <h3 class="text-center font-semibold mb-4">底部位置</h3>
            <div class="flex justify-center gap-4">
              <Popover placement="bottom-start" content="Bottom Start">
                <button class="px-3 py-1 bg-slate-200 rounded">Bottom Start</button>
              </Popover>
              <Popover placement="bottom" content="Bottom">
                <button class="px-3 py-1 bg-slate-200 rounded">Bottom</button>
              </Popover>
              <Popover placement="bottom-end" content="Bottom End">
                <button class="px-3 py-1 bg-slate-200 rounded">Bottom End</button>
              </Popover>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

// 嵌套信息
export const NestedContent: Story = {
  render: () => ({
    components: { Popover },
    template: `
      <div class="p-20 space-x-4">
        <Popover>
          <template #content>
            <div class="space-y-2">
              <h4 class="font-semibold">标题</h4>
              <p class="text-sm text-slate-600">这是一段详细描述内容，可以包含更多信息。</p>
              <div class="flex gap-2 mt-2">
                <button class="px-3 py-1 bg-secondary-500 text-white text-sm rounded hover:bg-secondary-600">
                  确认
                </button>
                <button class="px-3 py-1 bg-slate-200 text-sm rounded hover:bg-slate-300">
                  取消
                </button>
              </div>
            </div>
          </template>
          <button class="px-4 py-2 bg-secondary-500 text-white rounded hover:bg-secondary-600">
            复杂内容
          </button>
        </Popover>

        <Popover>
          <template #content>
            <div class="space-y-2">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p class="font-semibold">用户信息</p>
                  <p class="text-sm text-slate-500">user@example.com</p>
                </div>
              </div>
            </div>
          </template>
          <button class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            用户卡片
          </button>
        </Popover>
      </div>
    `,
  }),
}

// 嵌套操作
export const WithActions: Story = {
  render: () => ({
    components: { Popover },
    template: `
      <div class="p-20 space-x-4">
        <Popover>
          <template #content>
            <div class="space-y-2">
              <p class="text-sm">确定要删除此项目吗？</p>
              <div class="flex justify-end gap-2">
                <button class="px-3 py-1 text-sm text-slate-600 hover:text-slate-800">
                  取消
                </button>
                <button class="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">
                  删除
                </button>
              </div>
            </div>
          </template>
          <button class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            删除操作
          </button>
        </Popover>

        <Popover>
          <template #content>
            <ul class="space-y-2">
              <li>
                <button class="w-full text-left px-2 py-1 hover:bg-slate-100 rounded flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  编辑
                </button>
              </li>
              <li>
                <button class="w-full text-left px-2 py-1 hover:bg-slate-100 rounded flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  复制
                </button>
              </li>
              <li>
                <button class="w-full text-left px-2 py-1 hover:bg-slate-100 rounded flex items-center gap-2 text-red-600">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  删除
                </button>
              </li>
            </ul>
          </template>
          <button class="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-800">
            更多操作
          </button>
        </Popover>
      </div>
    `,
  }),
}

// 自定义宽度
export const CustomWidth: Story = {
  render: () => ({
    components: { Popover },
    template: `
      <div class="p-20 space-x-4">
        <Popover content="这是一段内容" :width="200">
          <button class="px-4 py-2 bg-secondary-500 text-white rounded hover:bg-secondary-600">
            200px 宽度
          </button>
        </Popover>

        <Popover content="这是一段较长的内容，会自动适应宽度" :width="300">
          <button class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            300px 宽度
          </button>
        </Popover>

        <Popover content="这是一段内容" :width="400">
          <button class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
            400px 宽度
          </button>
        </Popover>
      </div>
    `,
  }),
}

// 延迟显示
export const WithDelay: Story = {
  render: () => ({
    components: { Popover },
    template: `
      <div class="p-20 space-x-4">
        <Popover trigger="hover" content="延迟 500ms 显示" :open-delay="500">
          <button class="px-4 py-2 bg-secondary-500 text-white rounded hover:bg-secondary-600">
            延迟显示 500ms
          </button>
        </Popover>

        <Popover trigger="hover" content="延迟 300ms 关闭" :close-delay="300">
          <button class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            延迟关闭 300ms
          </button>
        </Popover>

        <Popover trigger="hover" content="延迟显示 1000ms，关闭 500ms" :open-delay="1000" :close-delay="500">
          <button class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
            双向延迟
          </button>
        </Popover>
      </div>
    `,
  }),
}

// 禁用状态
export const Disabled: Story = {
  render: () => ({
    components: { Popover },
    template: `
      <div class="p-20 space-x-4">
        <Popover content="这个按钮被禁用了" :disabled="true">
          <button class="px-4 py-2 bg-slate-400 text-white rounded cursor-not-allowed">
            禁用的 Popover
          </button>
        </Popover>

        <Popover content="正常状态">
          <button class="px-4 py-2 bg-secondary-500 text-white rounded hover:bg-secondary-600">
            正常的 Popover
          </button>
        </Popover>
      </div>
    `,
  }),
}

// 无箭头
export const WithoutArrow: Story = {
  render: () => ({
    components: { Popover },
    template: `
      <div class="p-20 space-x-4">
        <Popover content="没有箭头的 Popover" :show-arrow="false">
          <button class="px-4 py-2 bg-secondary-500 text-white rounded hover:bg-secondary-600">
            无箭头
          </button>
        </Popover>

        <Popover content="有箭头的 Popover" :show-arrow="true">
          <button class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            有箭头
          </button>
        </Popover>
      </div>
    `,
  }),
}

// 事件触发
export const WithEvents: Story = {
  render: () => ({
    components: { Popover },
    setup() {
      const events = ref<string[]>([])

      const handleBeforeEnter = () => {
        events.value.push('beforeEnter: 显示前')
      }

      const handleAfterEnter = () => {
        events.value.push('afterEnter: 显示后')
      }

      const handleBeforeLeave = () => {
        events.value.push('beforeLeave: 隐藏前')
      }

      const handleAfterLeave = () => {
        events.value.push('afterLeave: 隐藏后')
      }

      return { events, handleBeforeEnter, handleAfterEnter, handleBeforeLeave, handleAfterLeave }
    },
    template: `
      <div class="p-20">
        <div class="space-x-4 mb-4">
          <Popover
            content="测试事件"
            @before-enter="handleBeforeEnter"
            @after-enter="handleAfterEnter"
            @before-leave="handleBeforeLeave"
            @after-leave="handleAfterLeave"
          >
            <button class="px-4 py-2 bg-secondary-500 text-white rounded hover:bg-secondary-600">
              点击测试事件
            </button>
          </Popover>
        </div>

        <div class="bg-slate-100 p-4 rounded">
          <h4 class="font-semibold mb-2">事件日志:</h4>
          <div class="space-y-1 max-h-60 overflow-y-auto">
            <div v-for="(event, index) in events" :key="index" class="text-sm text-slate-600">
              {{ event }}
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

// 嵌套卡片
export const CardContent: Story = {
  render: () => ({
    components: { Popover },
    template: `
      <div class="p-20">
        <Popover>
          <template #content>
            <div class="w-64">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"></div>
                <div>
                  <h4 class="font-semibold">John Doe</h4>
                  <p class="text-sm text-slate-500">产品经理</p>
                </div>
              </div>
              <div class="space-y-2 text-sm text-slate-600 mb-3">
                <p class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  john.doe@example.com
                </p>
                <p class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +1 234 567 890
                </p>
              </div>
              <div class="flex gap-2">
                <button class="flex-1 px-3 py-1.5 bg-secondary-500 text-white text-sm rounded hover:bg-secondary-600">
                  发消息
                </button>
                <button class="flex-1 px-3 py-1.5 bg-slate-200 text-sm rounded hover:bg-slate-300">
                  查看资料
                </button>
              </div>
            </div>
          </template>
          <button class="px-4 py-2 bg-secondary-500 text-white rounded hover:bg-secondary-600">
            用户卡片
          </button>
        </Popover>
      </div>
    `,
  }),
}

// 列表菜单
export const ListMenu: Story = {
  render: () => ({
    components: { Popover },
    template: `
      <div class="p-20 space-x-4">
        <Popover :show-arrow="false">
          <template #content>
            <div class="min-w-[160px]">
              <div class="px-3 py-2 text-sm font-semibold text-slate-500 border-b">
                账户
              </div>
              <ul class="py-1">
                <li>
                  <a href="#" class="block px-3 py-2 text-sm hover:bg-slate-100">个人资料</a>
                </li>
                <li>
                  <a href="#" class="block px-3 py-2 text-sm hover:bg-slate-100">账户设置</a>
                </li>
                <li>
                  <a href="#" class="block px-3 py-2 text-sm hover:bg-slate-100">退出登录</a>
                </li>
              </ul>
            </div>
          </template>
          <button class="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-800">
            账户菜单
          </button>
        </Popover>

        <Popover :show-arrow="false" placement="bottom-end">
          <template #content>
            <div class="min-w-[200px]">
              <div class="px-3 py-2 text-sm font-semibold text-slate-500 border-b">
                通知
              </div>
              <ul class="py-1">
                <li>
                  <a href="#" class="block px-3 py-2 text-sm hover:bg-slate-100 flex items-center justify-between">
                    <span>消息通知</span>
                    <span class="w-2 h-2 bg-red-500 rounded-full"></span>
                  </a>
                </li>
                <li>
                  <a href="#" class="block px-3 py-2 text-sm hover:bg-slate-100">系统通知</a>
                </li>
                <li>
                  <a href="#" class="block px-3 py-2 text-sm hover:bg-slate-100">全部标为已读</a>
                </li>
              </ul>
            </div>
          </template>
          <button class="px-4 py-2 bg-secondary-500 text-white rounded hover:bg-secondary-600">
            通知菜单
          </button>
        </Popover>
      </div>
    `,
  }),
}

// 深色模式支持
export const DarkMode: Story = {
  render: () => ({
    components: { Popover },
    template: `
      <div class="p-20 bg-slate-900">
        <div class="space-x-4">
          <Popover content="深色模式下的 Popover">
            <button class="px-4 py-2 bg-secondary-600 text-white rounded hover:bg-secondary-700">
              深色模式
            </button>
          </Popover>

          <Popover>
            <template #content>
              <div class="space-y-2">
                <h4 class="font-semibold text-white">深色标题</h4>
                <p class="text-sm text-slate-300">深色模式下的内容文本</p>
                <button class="px-3 py-1 bg-secondary-600 text-white text-sm rounded hover:bg-secondary-700">
                  操作按钮
                </button>
              </div>
            </template>
            <button class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              深色复杂内容
            </button>
          </Popover>
        </div>
      </div>
    `,
  }),
}

// 实际应用场景
export const RealWorldUsage: Story = {
  render: () => ({
    components: { Popover },
    setup() {
      const handleEdit = () => console.log('编辑')
      const handleCopy = () => console.log('复制')
      const handleDelete = () => console.log('删除')

      return { handleEdit, handleCopy, handleDelete }
    },
    template: `
      <div class="p-10 space-y-8">
        <!-- 表格操作 -->
        <div>
          <h3 class="text-lg font-semibold mb-4">表格行操作</h3>
          <table class="w-full border-collapse">
            <thead>
              <tr class="border-b">
                <th class="px-4 py-2 text-left">名称</th>
                <th class="px-4 py-2 text-left">状态</th>
                <th class="px-4 py-2 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b">
                <td class="px-4 py-2">项目 A</td>
                <td class="px-4 py-2"><span class="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">进行中</span></td>
                <td class="px-4 py-2">
                  <Popover :show-arrow="false">
                    <template #content>
                      <ul class="min-w-[120px] py-1">
                        <li><button @click="handleEdit" class="w-full text-left px-3 py-2 text-sm hover:bg-slate-100">编辑</button></li>
                        <li><button @click="handleCopy" class="w-full text-left px-3 py-2 text-sm hover:bg-slate-100">复制</button></li>
                        <li><button @click="handleDelete" class="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 text-red-600">删除</button></li>
                      </ul>
                    </template>
                    <button class="px-2 py-1 hover:bg-slate-100 rounded">•••</button>
                  </Popover>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 帮助提示 -->
        <div>
          <h3 class="text-lg font-semibold mb-4">帮助提示</h3>
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2">
              用户名
              <Popover placement="top" trigger="hover" :open-delay="300">
                <template #content>
                  <div class="max-w-xs">
                    <p class="text-sm">用户名是您在系统中的唯一标识，长度为 4-20 个字符。</p>
                  </div>
                </template>
                <svg class="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Popover>
            </label>
          </div>
        </div>

        <!-- 确认操作 -->
        <div>
          <h3 class="text-lg font-semibold mb-4">确认操作</h3>
          <div class="flex gap-4">
            <Popover>
              <template #content>
                <div class="w-48">
                  <p class="text-sm mb-3">确定要删除此文件吗？此操作无法撤销。</p>
                  <div class="flex justify-end gap-2">
                    <button class="px-3 py-1 text-sm text-slate-600 hover:text-slate-800">取消</button>
                    <button class="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">删除</button>
                  </div>
                </div>
              </template>
              <button class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                删除文件
              </button>
            </Popover>

            <Popover>
              <template #content>
                <div class="w-48">
                  <p class="text-sm mb-3">确定要发送邮件吗？</p>
                  <div class="flex justify-end gap-2">
                    <button class="px-3 py-1 text-sm text-slate-600 hover:text-slate-800">取消</button>
                    <button class="px-3 py-1 text-sm bg-secondary-500 text-white rounded hover:bg-secondary-600">发送</button>
                  </div>
                </div>
              </template>
              <button class="px-4 py-2 bg-secondary-500 text-white rounded hover:bg-secondary-600">
                发送邮件
              </button>
            </Popover>
          </div>
        </div>

        <!-- 图片预览 -->
        <div>
          <h3 class="text-lg font-semibold mb-4">图片预览</h3>
          <Popover placement="right">
            <template #content>
              <img src="https://via.placeholder.com/200x150" alt="Preview" class="rounded" />
            </template>
            <button class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
              查看大图
            </button>
          </Popover>
        </div>
      </div>
    `,
  }),
}
