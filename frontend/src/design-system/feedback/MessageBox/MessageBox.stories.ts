import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import MessageBox from './MessageBox.vue'

/**
 * MessageBox 组件 Storybook 故事
 *
 * 消息确认对话框组件，支持 alert/confirm/prompt 三种类型
 */

const meta = {
  title: 'Design System/Feedback/MessageBox',
  component: MessageBox,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['alert', 'confirm', 'prompt'],
      description: 'MessageBox 类型',
    },
    title: {
      control: 'text',
      description: '对话框标题',
    },
    message: {
      control: 'text',
      description: '对话框内容',
    },
    showIcon: {
      control: 'boolean',
      description: '是否显示图标',
    },
    center: {
      control: 'boolean',
      description: '是否居中显示',
    },
    showClose: {
      control: 'boolean',
      description: '是否显示关闭按钮',
    },
    showCancelButton: {
      control: 'boolean',
      description: '是否显示取消按钮',
    },
  },
} satisfies Meta<typeof MessageBox>

export default meta
type Story = StoryObj<typeof meta>

// Alert 类型
export const Alert: Story = {
  args: {
    type: 'alert',
    title: '提示',
    message: '这是一条警告信息，请注意查看。',
    showIcon: true,
    showClose: true,
    center: false,
    closeOnClickModal: false,
    closeOnPressEscape: true,
  },
  render: (args) => ({
    components: { MessageBox },
    setup() {
      const visible = ref(true)
      return { args, visible }
    },
    template: '<MessageBox v-bind="args" v-model:visible="visible" />',
  }),
}

// Confirm 类型
export const Confirm: Story = {
  args: {
    type: 'confirm',
    title: '确认操作',
    message: '确定要删除这个项目吗？此操作不可撤销。',
    showIcon: true,
    showCancelButton: true,
    showClose: true,
    center: false,
    closeOnClickModal: false,
    closeOnPressEscape: true,
  },
  render: (args) => ({
    components: { MessageBox },
    setup() {
      const visible = ref(true)
      return { args, visible }
    },
    template: '<MessageBox v-bind="args" v-model:visible="visible" />',
  }),
}

// Prompt 类型（带输入框）
export const Prompt: Story = {
  args: {
    type: 'prompt',
    title: '输入',
    message: '请输入您的昵称：',
    showIcon: true,
    showCancelButton: true,
    inputPlaceholder: '请输入昵称',
    showClose: true,
    center: false,
    closeOnClickModal: false,
    closeOnPressEscape: true,
  },
  render: (args) => ({
    components: { MessageBox },
    setup() {
      const visible = ref(true)
      return { args, visible }
    },
    template: '<MessageBox v-bind="args" v-model:visible="visible" />',
  }),
}

// 无图标版本
export const WithoutIcon: Story = {
  args: {
    type: 'confirm',
    title: '确认操作',
    message: '确定要继续吗？',
    showIcon: false,
    showCancelButton: true,
    showClose: true,
    center: false,
    closeOnClickModal: false,
    closeOnPressEscape: true,
  },
  render: (args) => ({
    components: { MessageBox },
    setup() {
      const visible = ref(true)
      return { args, visible }
    },
    template: '<MessageBox v-bind="args" v-model:visible="visible" />',
  }),
}

// 居中显示
export const Centered: Story = {
  args: {
    type: 'confirm',
    title: '确认操作',
    message: '这是一条居中显示的消息。',
    showIcon: true,
    center: true,
    showCancelButton: true,
    showClose: true,
    closeOnClickModal: false,
    closeOnPressEscape: true,
  },
  render: (args) => ({
    components: { MessageBox },
    setup() {
      const visible = ref(true)
      return { args, visible }
    },
    template: '<MessageBox v-bind="args" v-model:visible="visible" />',
  }),
}

// 自定义按钮文本
export const CustomButtonText: Story = {
  args: {
    type: 'confirm',
    title: '确认删除',
    message: '确定要删除选中的 3 个项目吗？',
    showIcon: true,
    confirmButtonText: '删除',
    cancelButtonText: '保留',
    showCancelButton: true,
    showClose: true,
    center: false,
    closeOnClickModal: false,
    closeOnPressEscape: true,
  },
  render: (args) => ({
    components: { MessageBox },
    setup() {
      const visible = ref(true)
      return { args, visible }
    },
    template: '<MessageBox v-bind="args" v-model:visible="visible" />',
  }),
}
