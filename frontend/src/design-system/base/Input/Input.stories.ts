import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import Input from './Input.vue'

/**
 * Input 组件 Storybook 故事
 *
 * 展示所有变体、尺寸和状态
 */

const meta = {
  title: 'Design System/Base/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'password', 'number', 'email', 'tel', 'url', 'search'],
      description: '输入框类型',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '输入框尺寸',
    },
    placeholder: {
      control: 'text',
      description: '占位文本',
    },
    disabled: {
      control: 'boolean',
      description: '禁用状态',
    },
    readonly: {
      control: 'boolean',
      description: '只读状态',
    },
    clearable: {
      control: 'boolean',
      description: '可清空',
    },
    showPassword: {
      control: 'boolean',
      description: '显示密码切换',
    },
    maxlength: {
      control: 'number',
      description: '最大长度',
    },
    modelValue: {
      control: 'text',
      description: '绑定值',
    },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

// 基本用法
export const Default: Story = {
  args: {
    placeholder: '请输入...',
    size: 'md',
  },
  render: (args) => ({
    components: { Input },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: '<Input v-model="value" v-bind="args" />',
  }),
}

// 不同尺寸
export const Sizes: Story = {
  render: () => ({
    components: { Input },
    setup() {
      const sm = ref('')
      const md = ref('')
      const lg = ref('')
      return { sm, md, lg }
    },
    template: `
      <div class="flex flex-col gap-4">
        <Input v-model="sm" size="sm" placeholder="Small (sm)" />
        <Input v-model="md" size="md" placeholder="Medium (md)" />
        <Input v-model="lg" size="lg" placeholder="Large (lg)" />
      </div>
    `,
  }),
}

// 禁用状态
export const Disabled: Story = {
  render: () => ({
    components: { Input },
    setup() {
      const value = ref('禁用文本')
      return { value }
    },
    template: '<Input v-model="value" disabled placeholder="禁用状态" />',
  }),
}

// 只读状态
export const Readonly: Story = {
  render: () => ({
    components: { Input },
    setup() {
      const value = ref('只读文本')
      return { value }
    },
    template: '<Input v-model="value" readonly placeholder="只读状态" />',
  }),
}

// 密码输入框
export const Password: Story = {
  render: () => ({
    components: { Input },
    setup() {
      const value = ref('')
      return { value }
    },
    template: '<Input v-model="value" type="password" show-password placeholder="请输入密码" />',
  }),
}

// 可清空
export const Clearable: Story = {
  render: () => ({
    components: { Input },
    setup() {
      const value = ref('可清空的内容')
      return { value }
    },
    template: '<Input v-model="value" clearable placeholder="可清空" />',
  }),
}

// 带前缀
export const WithPrefix: Story = {
  render: () => ({
    components: { Input },
    setup() {
      const value = ref('')
      return { value }
    },
    template: `
      <Input v-model="value" placeholder="搜索...">
        <template #prefix>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
          </svg>
        </template>
      </Input>
    `,
  }),
}

// 带后缀
export const WithSuffix: Story = {
  render: () => ({
    components: { Input },
    setup() {
      const value = ref('')
      return { value }
    },
    template: `
      <Input v-model="value" placeholder="请输入金额">
        <template #suffix>
          <span class="text-slate-500">¥</span>
        </template>
      </Input>
    `,
  }),
}

// 带字数统计
export const WithCount: Story = {
  render: () => ({
    components: { Input },
    setup() {
      const value = ref('')
      return { value }
    },
    template: '<Input v-model="value" :maxlength="100" show-count placeholder="最多100字" />',
  }),
}

// 搜索框
export const Search: Story = {
  render: () => ({
    components: { Input },
    setup() {
      const value = ref('')
      return { value }
    },
    template: `
      <Input v-model="value" type="search" placeholder="搜索书名、作者..." size="lg">
        <template #prefix>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
          </svg>
        </template>
      </Input>
    `,
  }),
}
