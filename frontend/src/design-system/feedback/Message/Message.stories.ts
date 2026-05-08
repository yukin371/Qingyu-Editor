// @ts-nocheck - Storybook file with flexible type assertions
import type { Meta, StoryObj } from '@storybook/vue3'
import Message from './Message.vue'
import { useMessage } from './useMessage'

/**
 * Message 组件 Storybook 故事
 *
 * 展示所有类型、状态和用法
 */

const meta = {
  title: 'Design System/Feedback/Message',
  component: Message,
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: 'text',
      description: '消息内容',
    },
    type: {
      control: 'select',
      options: ['success', 'info', 'warning', 'error'],
      description: '消息类型',
    },
    duration: {
      control: 'number',
      description: '显示时长（毫秒），0 表示不自动关闭',
    },
    showClose: {
      control: 'boolean',
      description: '是否显示关闭按钮',
    },
    center: {
      control: 'boolean',
      description: '文字是否居中',
    },
    dangerouslyUseHTMLString: {
      control: 'boolean',
      description: '是否将 message 属性作为 HTML 片段处理',
    },
    offset: {
      control: 'number',
      description: '距离顶部的偏移量',
    },
  },
} satisfies Meta<typeof Message>

export default meta
type Story = StoryObj<typeof meta>

// 默认故事
export const Default: Story = {
  args: {
    message: '这是一条消息提示',
    type: 'info',
    duration: 3000,
    showClose: false,
    center: false,
    dangerouslyUseHTMLString: false,
    offset: 20,
  },
  render: (args) => ({
    components: { Message },
    setup() {
      return { args }
    },
    template: `
      <div class="p-8">
        <Message v-bind="args" />
      </div>
    `,
  }),
}

// 四种类型
export const Types: Story = {
  render: () => ({
    components: { Message },
    setup() {
      const messages = [
        { type: 'success', message: '操作成功！' },
        { type: 'info', message: '这是一条信息提示' },
        { type: 'warning', message: '请注意，这是一个警告' },
        { type: 'error', message: '操作失败，请重试' },
      ]
      return { messages }
    },
    template: `
      <div class="p-8 space-y-4">
        <h3 class="text-lg font-semibold mb-4">消息类型</h3>
        <div v-for="(msg, index) in messages" :key="index" class="relative h-16">
          <Message
            :type="msg.type"
            :message="msg.message"
            :duration="0"
            :show-close="true"
            :offset="20 + index * 80"
          />
        </div>
      </div>
    `,
  }),
}

// 可关闭
export const Closable: Story = {
  render: () => ({
    components: { Message },
    template: `
      <div class="p-8">
        <h3 class="text-lg font-semibold mb-4">可关闭消息</h3>
        <div class="relative h-16">
          <Message
            type="info"
            message="这是一条可以关闭的消息"
            :duration="0"
            :show-close="true"
          />
        </div>
      </div>
    `,
  }),
}

// 自动关闭
export const AutoClose: Story = {
  render: () => ({
    components: { Message },
    setup() {
      const show = () => {
        console.log('Message will auto close after 3 seconds')
      }
      return { show }
    },
    template: `
      <div class="p-8">
        <h3 class="text-lg font-semibold mb-4">自动关闭（3秒）</h3>
        <p class="text-gray-600 mb-4">消息将在 3 秒后自动关闭</p>
        <button
          @click="show"
          class="px-4 py-2 bg-info-500 text-white rounded-md hover:bg-info-600"
        >
          显示消息
        </button>
        <div class="relative h-16 mt-4">
          <Message
            type="success"
            message="这条消息将在 3 秒后自动关闭"
            :duration="3000"
          />
        </div>
      </div>
    `,
  }),
}

// 不自动关闭
export const NoAutoClose: Story = {
  render: () => ({
    components: { Message },
    template: `
      <div class="p-8">
        <h3 class="text-lg font-semibold mb-4">不自动关闭</h3>
        <p class="text-gray-600 mb-4">设置 duration 为 0 可以禁用自动关闭</p>
        <div class="relative h-16">
          <Message
            type="info"
            message="这条消息不会自动关闭，请点击关闭按钮"
            :duration="0"
            :show-close="true"
          />
        </div>
      </div>
    `,
  }),
}

// 居中显示
export const Centered: Story = {
  render: () => ({
    components: { Message },
    template: `
      <div class="p-8">
        <h3 class="text-lg font-semibold mb-4">居中显示</h3>
        <div class="relative h-16">
          <Message
            type="success"
            message="这是一条居中的消息"
            :duration="0"
            :show-close="true"
            :center="true"
          />
        </div>
      </div>
    `,
  }),
}

// HTML 内容
export const UseHTML: Story = {
  render: () => ({
    components: { Message },
    template: `
      <div class="p-8">
        <h3 class="text-lg font-semibold mb-4">HTML 内容</h3>
        <p class="text-gray-600 mb-4">注意：使用 HTML 内容时请确保内容安全，避免 XSS 攻击</p>
        <div class="relative h-16">
          <Message
            type="info"
            message="这是一条包含 <strong>加粗文本</strong> 和 <em>斜体文本</em> 的消息"
            :duration="0"
            :show-close="true"
            :dangerously-use-h-t-m-l-string="true"
          />
        </div>
      </div>
    `,
  }),
}

// 多条消息
export const Multiple: Story = {
  render: () => ({
    components: { Message },
    setup() {
      const messages = [
        { type: 'success', message: '操作 1 成功' },
        { type: 'info', message: '操作 2 完成' },
        { type: 'warning', message: '操作 3 有警告' },
        { type: 'error', message: '操作 4 失败' },
      ]
      return { messages }
    },
    template: `
      <div class="p-8">
        <h3 class="text-lg font-semibold mb-4">多条消息</h3>
        <p class="text-gray-600 mb-4">多条消息会自动堆叠显示</p>
        <div v-for="(msg, index) in messages" :key="index" class="relative h-16">
          <Message
            :type="msg.type"
            :message="msg.message"
            :duration="0"
            :show-close="true"
            :offset="20 + index * 80"
          />
        </div>
      </div>
    `,
  }),
}

// 全局调用
export const GlobalCall: Story = {
  render: () => ({
    setup() {
      const message = useMessage()

      const showSuccess = () => {
        message.success('操作成功！')
      }

      const showInfo = () => {
        message.info('这是一条信息')
      }

      const showWarning = () => {
        message.warning('请注意！')
      }

      const showError = () => {
        message.error('操作失败！')
      }

      return { showSuccess, showInfo, showWarning, showError }
    },
    template: `
      <div class="p-8 space-y-4">
        <h3 class="text-lg font-semibold mb-4">全局调用</h3>
        <p class="text-gray-600 mb-4">使用 useMessage Hook 进行全局调用</p>
        <div class="flex flex-wrap gap-3">
          <button
            @click="showSuccess"
            class="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
          >
            Success
          </button>
          <button
            @click="showInfo"
            class="px-4 py-2 bg-info-500 text-white rounded-md hover:bg-info-600"
          >
            Info
          </button>
          <button
            @click="showWarning"
            class="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
          >
            Warning
          </button>
          <button
            @click="showError"
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Error
          </button>
        </div>
      </div>
    `,
  }),
}

// 自定义偏移
export const CustomOffset: Story = {
  render: () => ({
    components: { Message },
    template: `
      <div class="p-8">
        <h3 class="text-lg font-semibold mb-4">自定义偏移</h3>
        <p class="text-gray-600 mb-4">设置 offset 属性可以自定义消息距离顶部的偏移量</p>
        <div class="relative h-16">
          <Message
            type="info"
            message="这条消息距离顶部 100px"
            :duration="0"
            :show-close="true"
            :offset="100"
          />
        </div>
      </div>
    `,
  }),
}
