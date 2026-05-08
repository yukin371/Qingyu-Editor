import type { Meta, StoryObj } from '@storybook/vue3'
import Button from './Button.vue'

/**
 * Button 组件 Storybook 故事
 *
 * 展示所有变体、尺寸和状态
 */

const meta = {
  title: 'Design System/Base/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger', 'success', 'warning', 'gradient', 'text', 'outline', 'default'],
      description: '按钮变体',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: '按钮尺寸',
    },
    disabled: {
      control: 'boolean',
      description: '禁用状态',
    },
    loading: {
      control: 'boolean',
      description: '加载状态',
    },
    block: {
      control: 'boolean',
      description: '块级按钮',
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// 默认故事
export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: '<Button v-bind="args">Primary Button</Button>',
  }),
}

// 所有变体
export const AllVariants: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div class="flex flex-wrap gap-4 p-8">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="success">Success</Button>
        <Button variant="warning">Warning</Button>
        <Button variant="gradient">Gradient</Button>
        <Button variant="text">Text</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="default">Default</Button>
      </div>
    `,
  }),
}

// 所有尺寸
export const AllSizes: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div class="flex items-center gap-4 p-8">
        <Button size="xs">XS</Button>
        <Button size="sm">SM</Button>
        <Button size="md">MD</Button>
        <Button size="lg">LG</Button>
        <Button size="xl">XL</Button>
      </div>
    `,
  }),
}

// 状态
export const States: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div class="flex flex-wrap gap-4 p-8">
        <Button>Normal</Button>
        <Button :disabled="true">Disabled</Button>
        <Button :loading="true">Loading</Button>
      </div>
    `,
  }),
}

// 块级按钮
export const BlockButton: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div class="w-64 p-8 space-y-4">
        <Button :block="true">Block Button</Button>
        <Button variant="secondary" :block="true">Secondary Block</Button>
      </div>
    `,
  }),
}

// 带图标的按钮
export const WithIcon: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div class="flex flex-wrap gap-4 p-8">
        <Button>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add
        </Button>
        <Button variant="secondary">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload
        </Button>
        <Button variant="danger">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </Button>
      </div>
    `,
  }),
}

// 交互测试
export const Interactive: Story = {
  args: {
    variant: 'primary',
  },
  render: (args) => ({
    components: { Button },
    setup() {
      const handleClick = () => {
        alert('Button clicked!')
      }
      return { args, handleClick }
    },
    template: '<Button v-bind="args" @click="handleClick">Click Me</Button>',
  }),
}
