import type { Meta, StoryObj } from '@storybook/vue3'
import Card from './Card.vue'

/**
 * Card 组件 Storybook 故事
 *
 * 展示所有变体、插槽和状态
 */

const meta = {
  title: 'Design System/Base/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'bordered', 'elevated', 'outlined', 'glass'],
      description: '卡片变体',
    },
    shadow: {
      control: 'select',
      options: ['always', 'hover', 'never'],
      description: '阴影模式',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: '内边距',
    },
    hoverable: {
      control: 'boolean',
      description: '悬停效果',
    },
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

// 默认故事
export const Default: Story = {
  args: {
    variant: 'default',
  },
  render: (args) => ({
    components: { Card },
    setup() {
      return { args }
    },
    template: `
      <Card v-bind="args">
        <p>这是一个默认样式的卡片组件。</p>
      </Card>
    `,
  }),
}

// 所有变体
export const AllVariants: Story = {
  render: () => ({
    components: { Card },
    template: `
      <div class="flex flex-wrap gap-4 p-8">
        <Card variant="default">
          <h3 class="text-lg font-semibold mb-2">Default</h3>
          <p class="text-slate-600">默认样式卡片</p>
        </Card>
        <Card variant="bordered">
          <h3 class="text-lg font-semibold mb-2">Bordered</h3>
          <p class="text-slate-600">带边框样式卡片</p>
        </Card>
        <Card variant="elevated">
          <h3 class="text-lg font-semibold mb-2">Elevated</h3>
          <p class="text-slate-600">带阴影样式卡片</p>
        </Card>
        <Card variant="outlined">
          <h3 class="text-lg font-semibold mb-2">Outlined</h3>
          <p class="text-slate-600">简洁边框样式卡片</p>
        </Card>
        <Card variant="glass">
          <h3 class="text-lg font-semibold mb-2">Glass</h3>
          <p class="text-slate-600">玻璃态样式卡片</p>
        </Card>
      </div>
    `,
  }),
}

// 阴影模式
export const ShadowModes: Story = {
  render: () => ({
    components: { Card },
    template: `
      <div class="flex flex-wrap gap-4 p-8">
        <Card shadow="always">
          <h3 class="text-lg font-semibold mb-2">Always</h3>
          <p class="text-slate-600">始终显示阴影</p>
        </Card>
        <Card shadow="hover">
          <h3 class="text-lg font-semibold mb-2">Hover</h3>
          <p class="text-slate-600">悬停时显示阴影</p>
        </Card>
        <Card shadow="never">
          <h3 class="text-lg font-semibold mb-2">Never</h3>
          <p class="text-slate-600">从不显示阴影</p>
        </Card>
      </div>
    `,
  }),
}

// 内边距
export const PaddingSizes: Story = {
  render: () => ({
    components: { Card },
    template: `
      <div class="flex flex-wrap gap-4 p-8">
        <Card padding="none">
          <h3 class="text-lg font-semibold mb-2">None</h3>
          <p class="text-slate-600">无内边距</p>
        </Card>
        <Card padding="sm">
          <h3 class="text-lg font-semibold mb-2">SM</h3>
          <p class="text-slate-600">小内边距</p>
        </Card>
        <Card padding="md">
          <h3 class="text-lg font-semibold mb-2">MD</h3>
          <p class="text-slate-600">中等内边距</p>
        </Card>
        <Card padding="lg">
          <h3 class="text-lg font-semibold mb-2">LG</h3>
          <p class="text-slate-600">大内边距</p>
        </Card>
      </div>
    `,
  }),
}

// 玻璃态卡片
export const GlassCard: Story = {
  render: () => ({
    components: { Card },
    template: `
      <div class="p-8 bg-gradient-to-br from-slate-100 to-slate-200">
        <Card variant="glass" shadow="always" class="max-w-sm">
          <template #header>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full"></div>
              <div>
                <h3 class="text-lg font-semibold">玻璃态卡片</h3>
                <p class="text-sm text-slate-500">Glassmorphism 风格</p>
              </div>
            </div>
          </template>
          <p class="text-slate-600">
            这是一个玻璃态风格的卡片，具有模糊背景和半透明效果。
          </p>
        </Card>
      </div>
    `,
  }),
}

// 带标题和底部的卡片
export const WithHeaderAndFooter: Story = {
  render: () => ({
    components: { Card },
    template: `
      <div class="max-w-md p-8">
        <Card variant="bordered">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">卡片标题</h3>
              <span class="text-sm text-slate-500">2024-01-23</span>
            </div>
          </template>
          <p class="text-slate-600">
            这是卡片的主体内容区域。你可以在这里放置任何内容。
            Card 组件支持 header 和 footer 插槽，方便你构建复杂的卡片布局。
          </p>
          <template #footer>
            <div class="flex justify-end gap-2">
              <button class="px-3 py-1 text-sm text-slate-600 hover:text-slate-900">取消</button>
              <button class="px-3 py-1 text-sm bg-primary-500 text-white rounded hover:bg-primary-600">确定</button>
            </div>
          </template>
        </Card>
      </div>
    `,
  }),
}

// 悬停效果
export const Hoverable: Story = {
  render: () => ({
    components: { Card },
    template: `
      <div class="flex flex-wrap gap-4 p-8">
        <Card variant="default" :hoverable="true">
          <h3 class="text-lg font-semibold mb-2">Default Hoverable</h3>
          <p class="text-slate-600">悬停查看效果</p>
        </Card>
        <Card variant="bordered" :hoverable="true">
          <h3 class="text-lg font-semibold mb-2">Bordered Hoverable</h3>
          <p class="text-slate-600">悬停查看效果</p>
        </Card>
        <Card variant="elevated" :hoverable="true">
          <h3 class="text-lg font-semibold mb-2">Elevated Hoverable</h3>
          <p class="text-slate-600">悬停查看效果</p>
        </Card>
      </div>
    `,
  }),
}

// 内容卡片
export const ContentCards: Story = {
  render: () => ({
    components: { Card },
    template: `
      <div class="grid grid-cols-3 gap-4 p-8 max-w-4xl">
        <Card variant="elevated" :hoverable="true">
          <template #header>
            <div class="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold">快速部署</h3>
          </template>
          <p class="text-slate-600 text-sm">一键部署你的应用到云端，省时省力。</p>
        </Card>

        <Card variant="elevated" :hoverable="true">
          <template #header>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold">稳定可靠</h3>
          </template>
          <p class="text-slate-600 text-sm">99.9% 的可用性保证，让你的应用永不掉线。</p>
        </Card>

        <Card variant="elevated" :hoverable="true">
          <template #header>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold">安全防护</h3>
          </template>
          <p class="text-slate-600 text-sm">多层安全防护，保障你的数据安全。</p>
        </Card>
      </div>
    `,
  }),
}

// 用户卡片
export const UserCard: Story = {
  render: () => ({
    components: { Card },
    template: `
      <div class="p-8">
        <Card variant="bordered" class="max-w-sm">
          <template #header>
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-gradient-to-br from-secondary-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                JD
              </div>
              <div>
                <h3 class="text-lg font-semibold">John Doe</h3>
                <p class="text-slate-500 text-sm">前端开发工程师</p>
              </div>
            </div>
          </template>
          <p class="text-slate-600">
            专注于 Vue.js 和现代前端技术栈，热爱开源社区。
          </p>
          <template #footer>
            <div class="flex gap-2">
              <button class="flex-1 px-3 py-2 text-sm border border-slate-200 rounded hover:bg-slate-50">关注</button>
              <button class="flex-1 px-3 py-2 text-sm bg-primary-500 text-white rounded hover:bg-primary-600">私信</button>
            </div>
          </template>
        </Card>
      </div>
    `,
  }),
}

// 文章卡片
export const ArticleCard: Story = {
  render: () => ({
    components: { Card },
    template: `
      <div class="p-8">
        <Card variant="elevated" :hoverable="true" class="max-w-md">
          <template #header>
            <div class="aspect-video bg-gradient-to-br from-secondary-100 to-secondary-50 rounded-lg mb-4"></div>
            <span class="inline-block px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded">技术</span>
          </template>
          <h3 class="text-xl font-semibold mb-2">Vue 3 Composition API 最佳实践</h3>
          <p class="text-slate-600 text-sm mb-4">
            探索 Vue 3 Composition API 的使用技巧和最佳实践，帮助你写出更优雅的代码。
          </p>
          <template #footer>
            <div class="flex items-center justify-between text-sm text-slate-500">
              <span>张三</span>
              <span>2024-01-23</span>
            </div>
          </template>
        </Card>
      </div>
    `,
  }),
}

// 交互测试
export const Interactive: Story = {
  args: {
    variant: 'elevated',
    hoverable: true,
  },
  render: (args) => ({
    components: { Card },
    setup() {
      const handleClick = () => {
        alert('Card clicked!')
      }
      return { args, handleClick }
    },
    template: `
      <Card v-bind="args" @click="handleClick" class="max-w-sm">
        <template #header>
          <h3 class="text-lg font-semibold">可点击的卡片</h3>
        </template>
        <p class="text-slate-600">点击这个卡片触发事件</p>
      </Card>
    `,
  }),
}
