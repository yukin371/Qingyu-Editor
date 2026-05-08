// @ts-nocheck - Storybook stories with flexible component types
import type { Meta, StoryObj } from '@storybook/vue3'
import Drawer from './Drawer.vue'
import Button from '../../base/Button/Button.vue'

/**
 * Drawer 组件 Storybook 故事
 *
 * 展示所有方向、尺寸和交互方式
 */

import { ref } from 'vue'

const meta = {
  title: 'Design System/Other/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'boolean',
      description: '抽屉显示状态',
    },
    title: {
      control: 'text',
      description: '抽屉标题',
    },
    direction: {
      control: 'select',
      options: ['left', 'right', 'top', 'bottom'],
      description: '抽屉打开方向',
    },
    size: {
      control: 'text',
      description: '抽屉大小（数字或百分比）',
    },
    closable: {
      control: 'boolean',
      description: '是否可关闭',
    },
    showClose: {
      control: 'boolean',
      description: '是否显示关闭按钮',
    },
    modal: {
      control: 'boolean',
      description: '是否显示遮罩层',
    },
    closeOnClickModal: {
      control: 'boolean',
      description: '点击遮罩层是否关闭',
    },
    closeOnPressEscape: {
      control: 'boolean',
      description: '按 ESC 键是否关闭',
    },
    destroyOnClose: {
      control: 'boolean',
      description: '关闭时是否销毁内容',
    },
    rtl: {
      control: 'boolean',
      description: '是否为 RTL 布局',
    },
  },
} satisfies Meta<typeof Drawer>

export default meta
type Story = StoryObj<typeof meta>

// 1. Default - 基础抽屉
export const Default: Story = {
  args: {
    title: '基础抽屉',
    modelValue: false,
    direction: 'right',
    size: '30%',
  },
  render: (args) => ({
    components: { Drawer, Button },
    setup() {
      const { modelValue: initialVisible, ...restArgs } = args
      const visible = ref(initialVisible)

      return { args: restArgs, visible }
    },
    template: `
      <div>
        <Button @click="visible = true">打开抽屉</Button>
        <Drawer v-bind="args" v-model="visible">
          <p class="text-neutral-600 dark:text-neutral-400">
            这是一个基础抽屉示例。抽屉可以从屏幕边缘滑出，适合显示详情、表单或导航内容。
          </p>
        </Drawer>
      </div>
    `,
  }),
}

// 2. Positions - 不同位置
export const Positions: Story = {
  render: () => ({
    components: { Drawer, Button },
    setup() {
      const directions = ['left', 'right', 'top', 'bottom'] as const
      const drawers = ref(
        Object.fromEntries(directions.map(d => [d, false]))
      )

      return { directions, drawers }
    },
    template: `
      <div class="flex flex-wrap gap-4 p-8">
        <Button
          v-for="direction in directions"
          :key="direction"
          @click="drawers[direction] = true"
        >
          {{ direction.toUpperCase() }} 抽屉
        </Button>

        <Drawer
          v-for="direction in directions"
          :key="direction"
          :title="\`\${direction.toUpperCase()} 抽屉\`"
          :direction="direction"
          v-model="drawers[direction]"
        >
          <p class="text-neutral-600 dark:text-neutral-400">
            这是从 \{{ direction }} 方向滑出的抽屉。
          </p>
        </Drawer>
      </div>
    `,
  }),
}

// 3. NoHeader - 无标题
export const NoHeader: Story = {
  render: () => ({
    components: { Drawer, Button },
    setup() {
      const visible = ref(false)

      return { visible }
    },
    template: `
      <div class="p-8">
        <Button @click="visible = true">打开无标题抽屉</Button>
        <Drawer v-model="visible">
          <div class="space-y-4">
            <h3 class="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              自定义内容
            </h3>
            <p class="text-neutral-600 dark:text-neutral-400">
              这个抽屉没有标题，您可以在内容区域自定义任何内容。
            </p>
            <div class="flex gap-3">
              <Button variant="secondary" @click="visible = false">取消</Button>
              <Button @click="visible = false">确定</Button>
            </div>
          </div>
        </Drawer>
      </div>
    `,
  }),
}

// 4. CustomFooter - 自定义底部
export const CustomFooter: Story = {
  render: () => ({
    components: { Drawer, Button },
    setup() {
      const visible = ref(false)

      return { visible }
    },
    template: `
      <div class="p-8">
        <Button @click="visible = true">打开自定义底部抽屉</Button>
        <Drawer title="自定义底部" v-model="visible">
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">
            这个抽屉使用了自定义底部插槽。
          </p>

          <template #footer>
            <div class="flex items-center justify-between w-full">
              <span class="text-sm text-neutral-500 dark:text-neutral-400">
                提示：点击遮罩层也可以关闭
              </span>
              <div class="flex gap-3">
                <Button variant="secondary" @click="visible = false">取消</Button>
                <Button @click="visible = false">确定</Button>
              </div>
            </div>
          </template>
        </Drawer>
      </div>
    `,
  }),
}

// 5. Nested - 嵌套抽屉
export const Nested: Story = {
  render: () => ({
    components: { Drawer, Button },
    setup() {
      const visible1 = ref(false)
      const visible2 = ref(false)

      return { visible1, visible2 }
    },
    template: `
      <div class="p-8">
        <Button @click="visible1 = true">打开第一个抽屉</Button>

        <Drawer title="第一个抽屉" v-model="visible1">
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">
            这是第一个抽屉。
          </p>
          <Button @click="visible2 = true">打开第二个抽屉</Button>

          <Drawer title="第二个抽屉" v-model="visible2" size="25%">
            <p class="text-neutral-600 dark:text-neutral-400">
              这是嵌套的第二个抽屉。您可以创建多层嵌套抽屉。
            </p>
          </Drawer>
        </Drawer>
      </div>
    `,
  }),
}

// 6. NoModal - 无遮罩层
export const NoModal: Story = {
  render: () => ({
    components: { Drawer, Button },
    setup() {
      const visible = ref(false)

      return { visible }
    },
    template: `
      <div class="p-8">
        <div class="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          <p class="mb-4">这是背景内容，抽屉没有遮罩层</p>
          <Button @click="visible = true">打开无遮罩抽屉</Button>
        </div>
        <Drawer
          title="无遮罩层抽屉"
          :modal="false"
          v-model="visible"
        >
          <p class="text-neutral-600 dark:text-neutral-400">
            这个抽屉没有遮罩层，您可以看到背后的内容。
          </p>
        </Drawer>
      </div>
    `,
  }),
}

// 7. CustomSize - 自定义大小
export const CustomSize: Story = {
  render: () => ({
    components: { Drawer, Button },
    setup() {
      const sizes = [
        { label: '小 (20%)', value: '20%' },
        { label: '中 (30%)', value: '30%' },
        { label: '大 (50%)', value: '50%' },
        { label: '超大 (70%)', value: '70%' },
        { label: '固定 400px', value: 400 },
      ]
      const drawers = ref(
        Object.fromEntries(sizes.map((s, i) => [`size${i}`, false]))
      )

      return { sizes, drawers }
    },
    template: `
      <div class="flex flex-wrap gap-4 p-8">
        <Button
          v-for="(size, index) in sizes"
          :key="index"
          @click="drawers[\`size\${index}\`] = true"
        >
          {{ size.label }}
        </Button>

        <Drawer
          v-for="(size, index) in sizes"
          :key="index"
          :title="size.label"
          :size="size.value"
          v-model="drawers[\`size\${index}\`]"
        >
          <p class="text-neutral-600 dark:text-neutral-400">
            这是大小为 \{{ size.value }} 的抽屉。
          </p>
        </Drawer>
      </div>
    `,
  }),
}

// 8. DestroyOnClose - 销毁内容
export const DestroyOnClose: Story = {
  render: () => ({
    components: { Drawer, Button },
    setup() {
      const visible = ref(false)
      const counter = ref(0)

      return { visible, counter }
    },
    template: `
      <div class="p-8">
        <Button @click="visible = true">打开带销毁的抽屉</Button>
        <Drawer
          title="销毁内容示例"
          :destroy-on-close="true"
          v-model="visible"
        >
          <div class="space-y-4">
            <p class="text-neutral-600 dark:text-neutral-400">
              这个抽屉在关闭时会销毁内容，重新打开时组件会重新初始化。
            </p>
            <div class="p-4 bg-neutral-100 dark:bg-neutral-700 rounded">
              <p class="text-sm">计数器：{{ counter }}</p>
              <Button @click="counter++" class="mt-2">增加计数</Button>
            </div>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              关闭抽屉后再打开，计数器会重置为 0
            </p>
          </div>
        </Drawer>
      </div>
    `,
  }),
}

// 9. BeforeClose - 关闭前回调
export const BeforeClose: Story = {
  render: () => ({
    components: { Drawer, Button },
    setup() {
      const visible = ref(false)
      const loading = ref(false)
      const hasChanges = ref(true)

      const beforeClose = async () => {
        if (!hasChanges.value) {
          return true
        }

        loading.value = true
        // 模拟异步操作
        await new Promise(resolve => setTimeout(resolve, 500))
        loading.value = false

        // 可以在这里添加保存逻辑或提示用户
        const confirmed = confirm('您有未保存的更改，确定要关闭吗？')
        return confirmed
      }

      return { visible, loading, beforeClose, hasChanges }
    },
    template: `
      <div class="p-8">
        <div class="mb-4">
          <label class="flex items-center gap-2">
            <input
              type="checkbox"
              v-model="hasChanges"
              class="rounded border-neutral-300"
            />
            <span class="text-sm text-neutral-600 dark:text-neutral-400">
              模拟有未保存的更改
            </span>
          </label>
        </div>
        <Button @click="visible = true">打开带验证的抽屉</Button>
        <Drawer
          title="关闭前验证"
          :before-close="beforeClose"
          v-model="visible"
        >
          <div class="space-y-4">
            <p class="text-neutral-600 dark:text-neutral-400">
              尝试关闭这个抽屉时会触发验证操作。
            </p>
            <p v-if="hasChanges" class="text-amber-600 dark:text-amber-400 text-sm">
              当前有未保存的更改
            </p>
            <p v-if="loading" class="text-primary-600 dark:text-primary-400 text-sm">
              正在验证...
            </p>
          </div>
        </Drawer>
      </div>
    `,
  }),
}

// 10. RTL - 从右到左布局
export const RTL: Story = {
  render: () => ({
    components: { Drawer, Button },
    setup() {
      const visible = ref(false)

      return { visible }
    },
    template: `
      <div class="p-8" dir="rtl">
        <Button @click="visible = true">打开 RTL 抽屉</Button>
        <Drawer
          title="RTL 抽屉"
          :rtl="true"
          v-model="visible"
        >
          <div class="space-y-4">
            <p class="text-neutral-600 dark:text-neutral-400" dir="rtl">
              这是一个支持 RTL（从右到左）布局的抽屉。
            </p>
            <p class="text-neutral-600 dark:text-neutral-400" dir="rtl">
              在 RTL 模式下，right 方向的抽屉会从左侧滑出。
            </p>
            <div class="flex gap-3" dir="rtl">
              <Button variant="secondary" @click="visible = false">إلغاء</Button>
              <Button @click="visible = false">موافق</Button>
            </div>
          </div>
        </Drawer>
      </div>
    `,
  }),
}

// 11. FormDrawer - 表单抽屉
export const FormDrawer: Story = {
  render: () => ({
    components: { Drawer, Button },
    setup() {
      const visible = ref(false)
      const formData = ref({
        name: '',
        email: '',
        role: '',
      })

      const handleSubmit = () => {
        alert('表单提交：' + JSON.stringify(formData.value, null, 2))
        visible.value = false
      }

      const resetForm = () => {
        formData.value = { name: '', email: '', role: '' }
      }

      return { visible, formData, handleSubmit, resetForm }
    },
    template: `
      <div class="p-8">
        <Button @click="visible = true">打开表单抽屉</Button>
        <Drawer title="用户信息" v-model="visible" size="40%" @open="resetForm">
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                姓名
              </label>
              <input
                v-model="formData.name"
                type="text"
                class="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-100"
                placeholder="请输入姓名"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                邮箱
              </label>
              <input
                v-model="formData.email"
                type="email"
                class="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-100"
                placeholder="请输入邮箱"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                角色
              </label>
              <select
                v-model="formData.role"
                class="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-100"
              >
                <option value="">请选择角色</option>
                <option value="admin">管理员</option>
                <option value="user">普通用户</option>
                <option value="guest">访客</option>
              </select>
            </div>
          </form>

          <template #footer>
            <div class="flex justify-end gap-3">
              <Button variant="secondary" @click="visible = false">取消</Button>
              <Button type="submit" @click="handleSubmit">提交</Button>
            </div>
          </template>
        </Drawer>
      </div>
    `,
  }),
}

// 12. Scrollable - 可滚动内容
export const Scrollable: Story = {
  render: () => ({
    components: { Drawer, Button },
    setup() {
      const visible = ref(false)

      return { visible }
    },
    template: `
      <div class="p-8">
        <Button @click="visible = true">打开可滚动抽屉</Button>
        <Drawer title="可滚动内容" v-model="visible">
          <div class="space-y-4">
            <p v-for="i in 30" :key="i" class="text-neutral-600 dark:text-neutral-400">
              这是第 {{ i }} 段内容。当内容超出抽屉高度时，会自动显示滚动条。
            </p>
          </div>
        </Drawer>
      </div>
    `,
  }),
}

// 13. NoCloseButton - 无关闭按钮
export const NoCloseButton: Story = {
  render: () => ({
    components: { Drawer, Button },
    setup() {
      const visible = ref(false)

      return { visible }
    },
    template: `
      <div class="p-8">
        <Button @click="visible = true">打开无关闭按钮抽屉</Button>
        <Drawer
          title="无关闭按钮"
          :show-close="false"
          v-model="visible"
        >
          <p class="text-neutral-600 dark:text-neutral-400">
            这个抽屉没有右上角的关闭按钮，用户只能通过底部按钮、点击遮罩层或按 ESC 键关闭。
          </p>
          <template #footer>
            <div class="flex justify-end gap-3">
              <Button variant="secondary" @click="visible = false">取消</Button>
              <Button @click="visible = false">确定</Button>
            </div>
          </template>
        </Drawer>
      </div>
    `,
  }),
}

// 14. CustomHeader - 自定义头部
export const CustomHeader: Story = {
  render: () => ({
    components: { Drawer, Button },
    setup() {
      const visible = ref(false)

      return { visible }
    },
    template: `
      <div class="p-8">
        <Button @click="visible = true">打开自定义头部抽屉</Button>
        <Drawer v-model="visible">
          <template #header>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">自定义头部</h3>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">带有图标和描述</p>
              </div>
            </div>
          </template>
          <p class="text-neutral-600 dark:text-neutral-400">
            这个抽屉使用了自定义头部插槽。
          </p>
        </Drawer>
      </div>
    `,
  }),
}

// 15. TopBottomDrawer - 上下方向抽屉
export const TopBottomDrawer: Story = {
  render: () => ({
    components: { Drawer, Button },
    setup() {
      const topVisible = ref(false)
      const bottomVisible = ref(false)

      return { topVisible, bottomVisible }
    },
    template: `
      <div class="p-8">
        <div class="flex gap-4">
          <Button @click="topVisible = true">从顶部打开</Button>
          <Button @click="bottomVisible = true">从底部打开</Button>
        </div>

        <Drawer
          title="顶部抽屉"
          direction="top"
          :size="'40%'"
          v-model="topVisible"
        >
          <p class="text-neutral-600 dark:text-neutral-400">
            这是从顶部滑出的抽屉，适合显示通知或简要信息。
          </p>
        </Drawer>

        <Drawer
          title="底部抽屉"
          direction="bottom"
          :size="'40%'"
          v-model="bottomVisible"
        >
          <p class="text-neutral-600 dark:text-neutral-400">
            这是从底部滑出的抽屉，在移动设备上很常见。
          </p>
        </Drawer>
      </div>
    `,
  }),
}
