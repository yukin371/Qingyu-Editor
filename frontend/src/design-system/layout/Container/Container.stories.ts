/**
 * Container 组件 Storybook 故事
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import Container from './Container.vue'
import { Col } from '../..'

const meta = {
  title: 'Layout/Container',
  component: Container,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'full'],
      description: '最大宽度尺寸',
    },
    fluid: {
      control: 'boolean',
      description: '是否流体宽度（100%）',
    },
    padding: {
      control: 'boolean',
      description: '是否添加内边距',
    },
    centered: {
      control: 'boolean',
      description: '是否水平居中',
    },
  },
  args: {
    size: 'full',
    fluid: false,
    padding: true,
    centered: true,
  },
} satisfies Meta<typeof Container>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 默认容器（全宽）
 */
export const Default: Story = {
  args: {
    size: 'full',
  },
  render: (args) => ({
    components: { Container },
    setup() {
      return { args }
    },
    template: `
      <Container v-bind="args">
        <div class="bg-secondary-500 text-white p-6 rounded-md">
          <h2 class="text-xl font-bold mb-2">默认容器</h2>
          <p class="text-sm opacity-90">全宽容器，带有默认内边距</p>
        </div>
      </Container>
    `,
  }),
}

/**
 * 所有尺寸展示
 */
export const AllSizes: Story = {
  render: () => ({
    components: { Container },
    template: `
      <div class="space-y-8">
        <div>
          <h3 class="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">XS - 320px</h3>
          <Container size="xs">
            <div class="bg-secondary-100 dark:bg-secondary-900/30 p-4 rounded-md border-2 border-secondary-300 dark:border-secondary-700">
              <p class="text-sm text-secondary-800 dark:text-secondary-300 text-center">max-w-xs (320px)</p>
            </div>
          </Container>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">SM - 384px</h3>
          <Container size="sm">
            <div class="bg-green-100 dark:bg-green-900/30 p-4 rounded-md border-2 border-green-300 dark:border-green-700">
              <p class="text-sm text-green-800 dark:text-green-300 text-center">max-w-sm (384px)</p>
            </div>
          </Container>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">MD - 448px</h3>
          <Container size="md">
            <div class="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-md border-2 border-purple-300 dark:border-purple-700">
              <p class="text-sm text-purple-800 dark:text-purple-300 text-center">max-w-md (448px)</p>
            </div>
          </Container>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">LG - 512px</h3>
          <Container size="lg">
            <div class="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-md border-2 border-orange-300 dark:border-orange-700">
              <p class="text-sm text-orange-800 dark:text-orange-300 text-center">max-w-lg (512px)</p>
            </div>
          </Container>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">XL - 576px</h3>
          <Container size="xl">
            <div class="bg-pink-100 dark:bg-pink-900/30 p-4 rounded-md border-2 border-pink-300 dark:border-pink-700">
              <p class="text-sm text-pink-800 dark:text-pink-300 text-center">max-w-xl (576px)</p>
            </div>
          </Container>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">FULL - 无限制</h3>
          <Container size="full">
            <div class="bg-primary-100 dark:bg-primary-900/30 p-4 rounded-md border-2 border-primary-300 dark:border-primary-700">
              <p class="text-sm text-primary-800 dark:text-primary-300 text-center">max-w-full (无限制)</p>
            </div>
          </Container>
        </div>
      </div>
    `,
  }),
}

/**
 * 流体宽度
 */
export const Fluid: Story = {
  render: () => ({
    components: { Container },
    template: `
      <div class="space-y-4">
        <div class="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-md">
          <p class="text-sm text-amber-800 dark:text-amber-300">
            <strong>提示：</strong>fluid 模式下容器宽度为 100%
          </p>
        </div>

        <Container :fluid="true">
          <div class="bg-gradient-to-r from-secondary-500 to-purple-500 text-white p-6 rounded-md">
            <h2 class="text-xl font-bold mb-2">流体容器</h2>
            <p class="text-sm opacity-90">宽度 100%，适合全宽背景或横幅</p>
          </div>
        </Container>

        <Container>
          <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-md">
            <h2 class="text-xl font-bold mb-2 text-slate-800 dark:text-slate-200">默认容器</h2>
            <p class="text-sm text-slate-600 dark:text-slate-400">带内边距和居中</p>
          </div>
        </Container>
      </div>
    `,
  }),
}

/**
 * 无内边距
 */
export const NoPadding: Story = {
  render: () => ({
    components: { Container },
    template: `
      <div class="space-y-4">
        <div class="mb-4 p-4 bg-secondary-50 dark:bg-secondary-900/20 rounded-md">
          <p class="text-sm text-secondary-800 dark:text-secondary-300">
            <strong>提示：</strong>:padding="false" 时容器没有内边距，适合嵌套使用
          </p>
        </div>

        <Container size="md" :padding="false">
          <div class="bg-red-100 dark:bg-red-900/30 p-6 rounded-md border-2 border-red-300 dark:border-red-700">
            <h2 class="text-lg font-bold mb-2 text-red-800 dark:text-red-300">无内边距容器</h2>
            <p class="text-sm text-red-700 dark:text-red-400">容器本身没有内边距，内容直接贴边</p>
          </div>
        </Container>

        <Container size="md">
          <div class="bg-green-100 dark:bg-green-900/30 p-6 rounded-md border-2 border-green-300 dark:border-green-700">
            <h2 class="text-lg font-bold mb-2 text-green-800 dark:text-green-300">有内边距容器</h2>
            <p class="text-sm text-green-700 dark:text-green-400">容器有默认内边距（px-4 sm:px-6 lg:px-8）</p>
          </div>
        </Container>
      </div>
    `,
  }),
}

/**
 * 不居中
 */
export const NotCentered: Story = {
  render: () => ({
    components: { Container },
    template: `
      <div class="space-y-4">
        <div class="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-md">
          <p class="text-sm text-purple-800 dark:text-purple-300">
            <strong>提示：</strong>:centered="false" 时容器不会水平居中
          </p>
        </div>

        <div class="bg-slate-100 dark:bg-slate-800 p-4 rounded-md overflow-hidden">
          <p class="text-sm text-slate-600 dark:text-slate-400 mb-2">容器左对齐：</p>
          <Container size="sm" :centered="false">
            <div class="bg-purple-500 text-white p-4 rounded-md">
              <p class="text-sm font-semibold">左对齐容器 (size="sm")</p>
            </div>
          </Container>
        </div>

        <div class="bg-slate-100 dark:bg-slate-800 p-4 rounded-md overflow-hidden">
          <p class="text-sm text-slate-600 dark:text-slate-400 mb-2">容器居中（默认）：</p>
          <Container size="sm">
            <div class="bg-secondary-500 text-white p-4 rounded-md">
              <p class="text-sm font-semibold text-center">居中容器 (size="sm")</p>
            </div>
          </Container>
        </div>
      </div>
    `,
  }),
}

/**
 * 配合 Col 使用
 */
export const WithCol: Story = {
  render: () => ({
    components: { Container, Col },
    template: `
      <div>
        <h2 class="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Container + Col 布局</h2>
        
        <Container size="lg">
          <div class="space-y-4">
            <div class="flex gap-2">
              <Col :span="12">
                <div class="bg-secondary-500 text-white p-4 rounded-md text-center">
                  <h3 class="font-bold">全宽标题</h3>
                </div>
              </Col>
            </div>

            <div class="flex gap-2">
              <Col :span="4">
                <div class="bg-purple-500 text-white p-4 rounded-md">
                  <h4 class="font-semibold mb-2">左侧栏</h4>
                  <p class="text-xs opacity-90">占 4 列</p>
                </div>
              </Col>
              <Col :span="8">
                <div class="bg-green-500 text-white p-4 rounded-md">
                  <h4 class="font-semibold mb-2">主内容</h4>
                  <p class="text-xs opacity-90">占 8 列</p>
                </div>
              </Col>
            </div>
          </div>
        </Container>
      </div>
    `,
  }),
}

/**
 * 嵌套布局
 */
export const Nested: Story = {
  render: () => ({
    components: { Container },
    template: `
      <div>
        <h2 class="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">嵌套 Container</h2>
        
        <Container size="xl">
          <div class="bg-gradient-to-br from-secondary-500 to-purple-600 text-white p-6 rounded-lg mb-4">
            <h3 class="text-xl font-bold mb-2">外层 Container (size="xl")</h3>
            <p class="text-sm opacity-90">最大宽度 576px</p>
          </div>

          <Container size="md" :padding="false">
            <div class="bg-gradient-to-br from-green-500 to-teal-600 text-white p-6 rounded-lg mb-4">
              <h3 class="text-lg font-bold mb-2">中层 Container (size="md", :padding="false")</h3>
              <p class="text-sm opacity-90">最大宽度 448px，无内边距</p>

              <Container size="sm" :padding="false">
                <div class="bg-gradient-to-br from-orange-500 to-red-600 text-white p-4 rounded-md mt-3">
                  <h4 class="text-md font-bold mb-1">内层 Container (size="sm")</h4>
                  <p class="text-xs opacity-90">最大宽度 384px</p>
                </div>
              </Container>
            </div>
          </Container>
        </Container>
      </div>
    `,
  }),
}

/**
 * 页面布局示例
 */
export const PageLayout: Story = {
  render: () => ({
    components: { Container, Col },
    template: `
      <div class="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
        <Container>
          <!-- 页面头部 -->
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">页面标题</h1>
            <p class="text-slate-600 dark:text-slate-400">这是一个使用 Container 组件的完整页面布局示例</p>
          </div>

          <!-- 内容区域 -->
          <div class="flex gap-2 mb-8">
            <Col :span="8">
              <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 class="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">主要内容</h2>
                <p class="text-slate-600 dark:text-slate-400 mb-4">
                  这里是页面的主要内容区域。Container 组件提供了响应式的最大宽度和内边距，
                  确保内容在各种屏幕尺寸下都有良好的阅读体验。
                </p>
                <p class="text-slate-600 dark:text-slate-400">
                  默认情况下，Container 会居中显示并添加响应式内边距（px-4 sm:px-6 lg:px-8）。
                </p>
              </div>
            </Col>
            <Col :span="4">
              <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 class="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">侧边栏</h3>
                <ul class="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li class="flex items-center gap-2">
                    <span class="w-2 h-2 bg-secondary-500 rounded-full"></span>
                    导航链接 1
                  </li>
                  <li class="flex items-center gap-2">
                    <span class="w-2 h-2 bg-secondary-500 rounded-full"></span>
                    导航链接 2
                  </li>
                  <li class="flex items-center gap-2">
                    <span class="w-2 h-2 bg-secondary-500 rounded-full"></span>
                    导航链接 3
                  </li>
                </ul>
              </div>
            </Col>
          </div>

          <!-- 底部 -->
          <div class="flex gap-2">
            <Col :span="12">
              <div class="bg-slate-700 text-white p-6 rounded-lg text-center">
                <p class="text-sm">© 2024 页面底部</p>
              </div>
            </Col>
          </div>
        </Container>
      </div>
    `,
  }),
}

/**
 * 不同尺寸对比
 */
export const SizeComparison: Story = {
  render: () => ({
    components: { Container },
    template: `
      <div>
        <h2 class="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">尺寸对比</h2>
        
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <div class="w-24 text-sm font-medium text-slate-600 dark:text-slate-400">XS (320px)</div>
            <Container size="xs" class="flex-1">
              <div class="h-12 bg-secondary-500 rounded-md"></div>
            </Container>
          </div>

          <div class="flex items-center gap-4">
            <div class="w-24 text-sm font-medium text-slate-600 dark:text-slate-400">SM (384px)</div>
            <Container size="sm" class="flex-1">
              <div class="h-12 bg-green-500 rounded-md"></div>
            </Container>
          </div>

          <div class="flex items-center gap-4">
            <div class="w-24 text-sm font-medium text-slate-600 dark:text-slate-400">MD (448px)</div>
            <Container size="md" class="flex-1">
              <div class="h-12 bg-purple-500 rounded-md"></div>
            </Container>
          </div>

          <div class="flex items-center gap-4">
            <div class="w-24 text-sm font-medium text-slate-600 dark:text-slate-400">LG (512px)</div>
            <Container size="lg" class="flex-1">
              <div class="h-12 bg-orange-500 rounded-md"></div>
            </Container>
          </div>

          <div class="flex items-center gap-4">
            <div class="w-24 text-sm font-medium text-slate-600 dark:text-slate-400">XL (576px)</div>
            <Container size="xl" class="flex-1">
              <div class="h-12 bg-pink-500 rounded-md"></div>
            </Container>
          </div>

          <div class="flex items-center gap-4">
            <div class="w-24 text-sm font-medium text-slate-600 dark:text-slate-400">FULL (100%)</div>
            <Container size="full" class="flex-1">
              <div class="h-12 bg-primary-500 rounded-md"></div>
            </Container>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * 响应式内边距
 */
export const ResponsivePadding: Story = {
  render: () => ({
    components: { Container },
    template: `
      <div>
        <h2 class="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">响应式内边距</h2>
        
        <div class="mb-4 p-4 bg-secondary-50 dark:bg-secondary-900/20 rounded-md">
          <p class="text-sm text-secondary-800 dark:text-secondary-300">
            <strong>内边距规则：</strong>px-4（移动端）→ sm:px-6（平板）→ lg:px-8（桌面）
          </p>
        </div>

        <Container size="lg">
          <div class="bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 p-4 rounded-md">
            <p class="text-sm text-slate-600 dark:text-slate-400 mb-2">
              调整浏览器窗口大小，观察容器内边距的变化：
            </p>
            <ul class="text-xs text-slate-500 dark:text-slate-500 space-y-1">
              <li>• 小于 640px：左右各 16px (px-4)</li>
              <li>• 640px - 1024px：左右各 24px (px-6)</li>
              <li>• 大于 1024px：左右各 32px (px-8)</li>
            </ul>
          </div>
        </Container>
      </div>
    `,
  }),
}
