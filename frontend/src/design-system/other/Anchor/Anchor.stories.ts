// @ts-nocheck - Storybook stories with flexible component types
import type { Meta, StoryObj } from '@storybook/vue3'
import Anchor from './Anchor.vue'
import type { AnchorItem } from './types'

/**
 * Anchor 组件 Storybook 故事
 *
 * 展示锚点组件的各种用法和配置
 */

import { ref } from 'vue'

const meta = {
  title: 'Design System/Other/Anchor',
  component: Anchor,
  tags: ['autodocs'],
  argTypes: {
    items: {
      control: 'object',
      description: '锚点列表',
    },
    container: {
      control: 'text',
      description: '滚动容器选择器',
    },
    offset: {
      control: 'number',
      description: '滚动触发的偏移量',
    },
    bounds: {
      control: 'number',
      description: '锚点区域边界',
    },
    direction: {
      control: 'select',
      options: ['vertical', 'horizontal'],
      description: '锚点方向',
    },
    marker: {
      control: 'boolean',
      description: '是否显示小圆点标记',
    },
    showLine: {
      control: 'boolean',
      description: '是否显示线条连接',
    },
    affix: {
      control: 'boolean',
      description: '是否固定定位',
    },
    offsetTop: {
      control: 'number',
      description: '固定定位的偏移距离',
    },
    smooth: {
      control: 'boolean',
      description: '点击锚点是否平滑滚动',
    },
  },
} satisfies Meta<typeof Anchor>

export default meta
type Story = StoryObj<typeof meta>

// 示例锚点数据
const sampleAnchorItems: AnchorItem[] = [
  {
    key: '1',
    title: '基础用法',
    href: '#basic',
  },
  {
    key: '2',
    title: '静态位置',
    href: '#static',
  },
  {
    key: '3',
    title: '固定模式',
    href: '#affix',
  },
  {
    key: '4',
    title: '水平方向',
    href: '#horizontal',
  },
  {
    key: '5',
    title: '自定义内容',
    href: '#custom',
  },
  {
    key: '6',
    title: '事件监听',
    href: '#events',
  },
  {
    key: '7',
    title: '嵌套锚点',
    href: '#nested',
    children: [
      {
        key: '7-1',
        title: '子锚点 1',
        href: '#nested-1',
      },
      {
        key: '7-2',
        title: '子锚点 2',
        href: '#nested-2',
      },
      {
        key: '7-3',
        title: '子锚点 3',
        href: '#nested-3',
      },
    ],
  },
]

// 1. Default - 基础用法
export const Default: Story = {
  render: (args) => ({
    components: { Anchor },
    setup() {
      const anchorItems = sampleAnchorItems
      return { args, anchorItems }
    },
    template: `
      <div class="p-8" style="min-height: 2000px;">
        <div class="flex gap-12">
          <!-- 左侧锚点导航 -->
          <div class="w-64 shrink-0">
            <Anchor v-bind="args" :items="anchorItems" />
          </div>
          
          <!-- 右侧内容区域 -->
          <div class="flex-1 space-y-16">
            <section id="basic" class="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                基础用法
              </h2>
              <p class="text-neutral-600 dark:text-neutral-400">
                最简单的用法，点击左侧锚点导航，页面会平滑滚动到对应位置。
              </p>
            </section>
            
            <section id="static" class="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                静态位置
              </h2>
              <p class="text-neutral-600 dark:text-neutral-400">
                Anchor 默认为绝对定位，可以自定义滚动容器。
              </p>
            </section>
            
            <section id="affix" class="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                固定模式
              </h2>
              <p class="text-neutral-600 dark:text-neutral-400">
                通过 affix 属性开启固定模式，滚动时锚点导航会固定在指定位置。
              </p>
            </section>
            
            <section id="horizontal" class="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                水平方向
              </h2>
              <p class="text-neutral-600 dark:text-neutral-400">
                设置 direction 为 horizontal 可以显示水平方向的锚点导航。
              </p>
            </section>
            
            <section id="custom" class="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                自定义内容
              </h2>
              <p class="text-neutral-600 dark:text-neutral-400">
                可以通过插槽自定义锚点内容。
              </p>
            </section>
            
            <section id="events" class="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                事件监听
              </h2>
              <p class="text-neutral-600 dark:text-neutral-400">
                监听 click 和 change 事件来处理用户交互。
              </p>
            </section>
            
            <section id="nested" class="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                嵌套锚点
              </h2>
              <p class="text-neutral-600 dark:text-neutral-400 mb-4">
                支持多级嵌套的锚点导航。
              </p>
              <div id="nested-1" class="ml-6 p-4 bg-white dark:bg-neutral-900 rounded mb-4">
                <h3 class="text-lg font-semibold mb-2">子锚点 1</h3>
                <p class="text-neutral-600 dark:text-neutral-400">
                  这是第一个子锚点的内容。
                </p>
              </div>
              <div id="nested-2" class="ml-6 p-4 bg-white dark:bg-neutral-900 rounded mb-4">
                <h3 class="text-lg font-semibold mb-2">子锚点 2</h3>
                <p class="text-neutral-600 dark:text-neutral-400">
                  这是第二个子锚点的内容。
                </p>
              </div>
              <div id="nested-3" class="ml-6 p-4 bg-white dark:bg-neutral-900 rounded">
                <h3 class="text-lg font-semibold mb-2">子锚点 3</h3>
                <p class="text-neutral-600 dark:text-neutral-400">
                  这是第三个子锚点的内容。
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    `,
  }),
}

// 2. Horizontal - 水平方向
export const Horizontal: Story = {
  render: () => ({
    components: { Anchor },
    setup() {
      const anchorItems: AnchorItem[] = [
        { key: '1', title: '产品介绍', href: '#product' },
        { key: '2', title: '功能特性', href: '#features' },
        { key: '3', title: '使用案例', href: '#cases' },
        { key: '4', title: '价格方案', href: '#pricing' },
        { key: '5', title: '联系我们', href: '#contact' },
      ]
      return { anchorItems }
    },
    template: `
      <div class="p-8" style="min-height: 2000px;">
        <!-- 水平锚点导航 -->
        <div class="sticky top-0 z-10 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 mb-8">
          <Anchor direction="horizontal" :marker="false" :show-line="false" :items="anchorItems" />
        </div>
        
        <!-- 内容区域 -->
        <div class="space-y-16 max-w-4xl">
          <section id="product" class="p-8 bg-gradient-to-r from-secondary-50 to-indigo-50 dark:from-secondary-900 dark:to-indigo-900 rounded-lg">
            <h2 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              产品介绍
            </h2>
            <p class="text-lg text-neutral-700 dark:text-neutral-300">
              我们的产品是一款功能强大的设计系统组件库，提供丰富的 UI 组件和完善的开发工具链。
            </p>
          </section>
          
          <section id="features" class="p-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 rounded-lg">
            <h2 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              功能特性
            </h2>
            <ul class="space-y-2 text-neutral-700 dark:text-neutral-300">
              <li>• 基于 Vue 3 + TypeScript 开发</li>
              <li>• 使用 Tailwind CSS 构建样式</li>
              <li>• 完整的组件文档和 Storybook 示例</li>
              <li>• 支持主题定制和暗色模式</li>
            </ul>
          </section>
          
          <section id="cases" class="p-8 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900 dark:to-teal-900 rounded-lg">
            <h2 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              使用案例
            </h2>
            <p class="text-lg text-neutral-700 dark:text-neutral-300">
              已被众多企业级项目采用，帮助开发者快速构建现代化的 Web 应用。
            </p>
          </section>
          
          <section id="pricing" class="p-8 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900 rounded-lg">
            <h2 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              价格方案
            </h2>
            <p class="text-lg text-neutral-700 dark:text-neutral-300">
              提供灵活的定价方案，满足不同规模团队的需求。
            </p>
          </section>
          
          <section id="contact" class="p-8 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900 dark:to-rose-900 rounded-lg">
            <h2 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              联系我们
            </h2>
            <p class="text-lg text-neutral-700 dark:text-neutral-300">
              如有任何问题，欢迎随时联系我们的客服团队。
            </p>
          </section>
        </div>
      </div>
    `,
  }),
}

// 3. WithoutLine - 无线条
export const WithoutLine: Story = {
  render: () => ({
    components: { Anchor },
    setup() {
      const anchorItems: AnchorItem[] = [
        { key: '1', title: 'React', href: '#react' },
        { key: '2', title: 'Vue', href: '#vue' },
        { key: '3', title: 'Angular', href: '#angular' },
        { key: '4', title: 'Svelte', href: '#svelte' },
      ]
      return { anchorItems }
    },
    template: `
      <div class="p-8" style="min-height: 2000px;">
        <div class="flex gap-12">
          <div class="w-64 shrink-0">
            <Anchor :show-line="false" :marker="false" :items="anchorItems" />
          </div>
          
          <div class="flex-1 space-y-16">
            <section id="react" class="p-6 bg-secondary-50 dark:bg-secondary-900 rounded-lg">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                React
              </h2>
              <p class="text-neutral-600 dark:text-neutral-400">
                React 是一个用于构建用户界面的 JavaScript 库。
              </p>
            </section>
            
            <section id="vue" class="p-6 bg-green-50 dark:bg-green-900 rounded-lg">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                Vue
              </h2>
              <p class="text-neutral-600 dark:text-neutral-400">
                Vue 是一个渐进式 JavaScript 框架，易于上手。
              </p>
            </section>
            
            <section id="angular" class="p-6 bg-red-50 dark:bg-red-900 rounded-lg">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                Angular
              </h2>
              <p class="text-neutral-600 dark:text-neutral-400">
                Angular 是一个由 Google 维护的开源 Web 应用框架。
              </p>
            </section>
            
            <section id="svelte" class="p-6 bg-orange-50 dark:bg-orange-900 rounded-lg">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                Svelte
              </h2>
              <p class="text-neutral-600 dark:text-neutral-400">
                Svelte 是一个新兴的前端框架，编译时优化。
              </p>
            </section>
          </div>
        </div>
      </div>
    `,
  }),
}

// 4. CustomMarker - 自定义标记
export const CustomMarker: Story = {
  render: () => ({
    components: { Anchor },
    setup() {
      const anchorItems: AnchorItem[] = [
        { key: '1', title: '步骤一', href: '#step1' },
        { key: '2', title: '步骤二', href: '#step2' },
        { key: '3', title: '步骤三', href: '#step3' },
        { key: '4', title: '步骤四', href: '#step4' },
      ]
      return { anchorItems }
    },
    template: `
      <div class="p-8" style="min-height: 2000px;">
        <div class="flex gap-12">
          <div class="w-64 shrink-0">
            <Anchor :marker="true" :items="anchorItems" />
          </div>
          
          <div class="flex-1 space-y-16">
            <section id="step1" class="p-6 border-l-4 border-secondary-500 bg-secondary-50 dark:bg-secondary-900 pl-6">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                步骤一：需求分析
              </h2>
              <p class="text-neutral-600 dark:text-neutral-400">
                收集并分析用户需求，确定产品功能和技术方案。
              </p>
            </section>
            
            <section id="step2" class="p-6 border-l-4 border-green-500 bg-green-50 dark:bg-green-900 pl-6">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                步骤二：设计阶段
              </h2>
              <p class="text-neutral-600 dark:text-neutral-400">
                进行 UI/UX 设计，创建原型和视觉稿。
              </p>
            </section>
            
            <section id="step3" class="p-6 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900 pl-6">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                步骤三：开发实现
              </h2>
              <p class="text-neutral-600 dark:text-neutral-400">
                根据设计稿进行前端和后端开发。
              </p>
            </section>
            
            <section id="step4" class="p-6 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900 pl-6">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                步骤四：测试部署
              </h2>
              <p class="text-neutral-600 dark:text-neutral-400">
                进行功能测试、性能测试，最终部署上线。
              </p>
            </section>
          </div>
        </div>
      </div>
    `,
  }),
}

// 5. ScrollTo - 滚动到指定位置
export const ScrollTo: Story = {
  render: () => ({
    components: { Anchor },
    setup() {
      const anchorItems: AnchorItem[] = [
        { key: '1', title: '顶部', href: '#top' },
        { key: '2', title: '中部', href: '#middle' },
        { key: '3', title: '底部', href: '#bottom' },
      ]
      const offset = 100
      return { anchorItems, offset }
    },
    template: `
      <div class="p-8" style="min-height: 2000px;">
        <div class="flex gap-12">
          <div class="w-64 shrink-0">
            <Anchor :offset="offset" :items="anchorItems" />
            <p class="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
              当前偏移量: {{ offset }}px
            </p>
          </div>
          
          <div class="flex-1 space-y-16">
            <section id="top" class="p-6 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900 dark:to-secondary-900 rounded-lg">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                顶部区域
              </h2>
              <p class="text-neutral-600 dark:text-neutral-400">
                设置了 100px 的偏移量，点击锚点会在目标位置上方保留 100px 的空间。
              </p>
            </section>
            
            <section id="middle" class="p-6 bg-gradient-to-r from-fuchsia-50 to-pink-50 dark:from-fuchsia-900 dark:to-pink-900 rounded-lg">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                中部区域
              </h2>
              <p class="text-neutral-600 dark:text-neutral-400">
                这是页面的中间部分，用于演示偏移量效果。
              </p>
            </section>
            
            <section id="bottom" class="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900 dark:to-teal-900 rounded-lg">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                底部区域
              </h2>
              <p class="text-neutral-600 dark:text-neutral-400">
                这是页面的底部部分，同样会受到偏移量的影响。
              </p>
            </section>
          </div>
        </div>
      </div>
    `,
  }),
}

// 6. CustomContainer - 自定义容器
export const CustomContainer: Story = {
  render: () => ({
    components: { Anchor },
    setup() {
      const anchorItems: AnchorItem[] = [
        { key: '1', title: '第一章', href: '#chapter1' },
        { key: '2', title: '第二章', href: '#chapter2' },
        { key: '3', title: '第三章', href: '#chapter3' },
        { key: '4', title: '第四章', href: '#chapter4' },
      ]
      return { anchorItems }
    },
    template: `
      <div class="p-8 h-screen">
        <h1 class="text-3xl font-bold mb-8 text-neutral-900 dark:text-neutral-100">
          自定义滚动容器示例
        </h1>
        <p class="mb-4 text-neutral-600 dark:text-neutral-400">
          下面的容器有独立的滚动条，锚点导航只监听该容器的滚动。
        </p>
        
        <div
          id="custom-container"
          class="relative border-2 border-neutral-300 dark:border-neutral-700 rounded-lg overflow-auto"
          style="height: 600px;"
        >
          <div class="flex">
            <!-- 左侧锚点 -->
            <div class="w-56 shrink-0 p-4 border-r border-neutral-200 dark:border-neutral-700">
              <Anchor container="#custom-container" :items="anchorItems" :affix="true" />
            </div>
            
            <!-- 右侧内容 -->
            <div class="flex-1 p-8 space-y-12">
              <section id="chapter1" class="p-6 bg-red-50 dark:bg-red-900 rounded-lg">
                <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                  第一章：开始
                </h2>
                <p class="text-neutral-600 dark:text-neutral-400">
                  这是第一章的内容，讲述了故事的开始。
                </p>
                <p class="mt-2 text-neutral-600 dark:text-neutral-400">
                  在这个容器内滚动，左侧的锚点导航会自动高亮当前章节。
                </p>
              </section>
              
              <section id="chapter2" class="p-6 bg-secondary-50 dark:bg-secondary-900 rounded-lg">
                <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                  第二章：发展
                </h2>
                <p class="text-neutral-600 dark:text-neutral-400">
                  这是第二章的内容，故事继续发展。
                </p>
              </section>
              
              <section id="chapter3" class="p-6 bg-green-50 dark:bg-green-900 rounded-lg">
                <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                  第三章：高潮
                </h2>
                <p class="text-neutral-600 dark:text-neutral-400">
                  这是第三章的内容，故事达到高潮。
                </p>
              </section>
              
              <section id="chapter4" class="p-6 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                  第四章：结局
                </h2>
                <p class="text-neutral-600 dark:text-neutral-400">
                  这是第四章的内容，故事走向结局。
                </p>
              </section>
              
              <!-- 底部留白，方便滚动 -->
              <div class="h-64"></div>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

// 7. ChangeEvent - 变化事件
export const ChangeEvent: Story = {
  render: () => ({
    components: { Anchor },
    setup() {
      const anchorItems: AnchorItem[] = [
        { key: '1', title: '首页', href: '#home' },
        { key: '2', title: '产品', href: '#product' },
        { key: '3', title: '服务', href: '#service' },
        { key: '4', title: '关于', href: '#about' },
      ]
      const currentAnchor = ref('home')
      
      const handleChange = (link: string) => {
        currentAnchor.value = link
      }
      
      return { anchorItems, currentAnchor, handleChange }
    },
    template: `
      <div class="p-8" style="min-height: 2000px;">
        <div class="mb-8 p-4 bg-secondary-50 dark:bg-secondary-900 rounded-lg">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            当前激活锚点
          </h3>
          <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">
            #{{ currentAnchor }}
          </p>
        </div>
        
        <div class="flex gap-12">
          <div class="w-64 shrink-0">
            <Anchor :items="anchorItems" @change="handleChange" />
          </div>
          
          <div class="flex-1 space-y-16">
            <section id="home" class="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                首页
              </h2>
              <p class="text-neutral-600 dark:text-neutral-400">
                欢迎来到我们的网站，这是首页的内容。
              </p>
            </section>
            
            <section id="product" class="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                产品
              </h2>
              <p class="text-neutral-600 dark:text-neutral-400">
                了解我们的产品和服务。
              </p>
            </section>
            
            <section id="service" class="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                服务
              </h2>
              <p class="text-neutral-600 dark:text-neutral-400">
                我们提供专业的服务支持。
              </p>
            </section>
            
            <section id="about" class="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                关于
              </h2>
              <p class="text-neutral-600 dark:text-neutral-400">
                了解更多关于我们的信息。
              </p>
            </section>
          </div>
        </div>
      </div>
    `,
  }),
}

// 8. DynamicContent - 动态内容
export const DynamicContent: Story = {
  render: () => ({
    components: { Anchor },
    setup() {
      const sections = ref([
        { id: 'intro', title: '介绍', content: '这是介绍内容...' },
        { id: 'features', title: '特性', content: '这是特性内容...' },
        { id: 'install', title: '安装', content: '这是安装说明...' },
      ])
      
      const anchorItems = computed(() => 
        sections.value.map(s => ({
          key: s.id,
          title: s.title,
          href: `#${s.id}`,
        }))
      )
      
      const addSection = () => {
        const id = `section-${sections.value.length + 1}`
        sections.value.push({
          id,
          title: `新章节 ${sections.value.length + 1}`,
          content: '这是新添加的内容...',
        })
      }
      
      return { sections, anchorItems, addSection }
    },
    template: `
      <div class="p-8" style="min-height: 2000px;">
        <div class="mb-8">
          <button
            @click="addSection"
            class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            添加新章节
          </button>
          <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            点击按钮可以动态添加新的章节和锚点
          </p>
        </div>
        
        <div class="flex gap-12">
          <div class="w-64 shrink-0">
            <Anchor :items="anchorItems" />
          </div>
          
          <div class="flex-1 space-y-16">
            <section
              v-for="section in sections"
              :key="section.id"
              :id="section.id"
              class="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900 dark:to-purple-900 rounded-lg"
            >
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                {{ section.title }}
              </h2>
              <p class="text-neutral-600 dark:text-neutral-400">
                {{ section.content }}
              </p>
            </section>
          </div>
        </div>
      </div>
    `,
  }),
}

// 9. NestedAnchors - 嵌套锚点
export const NestedAnchors: Story = {
  render: () => ({
    components: { Anchor },
    setup() {
      const anchorItems: AnchorItem[] = [
        {
          key: '1',
          title: '快速开始',
          href: '#getting-started',
          children: [
            { key: '1-1', title: '安装', href: '#install' },
            { key: '1-2', title: '引入', href: '#import' },
            { key: '1-3', title: '使用', href: '#usage' },
          ],
        },
        {
          key: '2',
          title: '组件',
          href: '#components',
          children: [
            { key: '2-1', title: '基础组件', href: '#basic' },
            { key: '2-2', title: '表单组件', href: '#form' },
            { key: '2-3', title: '数据展示', href: '#data' },
          ],
        },
        {
          key: '3',
          title: '主题',
          href: '#theme',
          children: [
            { key: '3-1', title: '颜色定制', href: '#color' },
            { key: '3-2', title: '暗色模式', href: '#dark' },
          ],
        },
      ]
      return { anchorItems }
    },
    template: `
      <div class="p-8" style="min-height: 2000px;">
        <div class="flex gap-12">
          <div class="w-72 shrink-0">
            <Anchor :items="anchorItems" />
          </div>
          
          <div class="flex-1 space-y-16">
            <section id="getting-started" class="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                快速开始
              </h2>
              <p class="text-neutral-600 dark:text-neutral-400">
                快速上手使用我们的组件库。
              </p>
            </section>
            
            <div id="install" class="ml-6 p-4 bg-white dark:bg-neutral-900 rounded mb-4">
              <h3 class="text-lg font-semibold mb-2">安装</h3>
              <p class="text-neutral-600 dark:text-neutral-400">
                使用 npm 或 yarn 安装组件库。
              </p>
            </div>
            
            <div id="import" class="ml-6 p-4 bg-white dark:bg-neutral-900 rounded mb-4">
              <h3 class="text-lg font-semibold mb-2">引入</h3>
              <p class="text-neutral-600 dark:text-neutral-400">
                在项目中引入组件。
              </p>
            </div>
            
            <div id="usage" class="ml-6 p-4 bg-white dark:bg-neutral-900 rounded">
              <h3 class="text-lg font-semibold mb-2">使用</h3>
              <p class="text-neutral-600 dark:text-neutral-400">
                在代码中使用组件。
              </p>
            </div>
            
            <section id="components" class="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                组件
              </h2>
              <p class="text-neutral-600 dark:text-neutral-400">
                浏览我们提供的所有组件。
              </p>
            </section>
            
            <div id="basic" class="ml-6 p-4 bg-white dark:bg-neutral-900 rounded mb-4">
              <h3 class="text-lg font-semibold mb-2">基础组件</h3>
              <p class="text-neutral-600 dark:text-neutral-400">
                Button、Icon、Tag 等基础组件。
              </p>
            </div>
            
            <div id="form" class="ml-6 p-4 bg-white dark:bg-neutral-900 rounded mb-4">
              <h3 class="text-lg font-semibold mb-2">表单组件</h3>
              <p class="text-neutral-600 dark:text-neutral-400">
                Input、Select、Checkbox 等表单组件。
              </p>
            </div>
            
            <div id="data" class="ml-6 p-4 bg-white dark:bg-neutral-900 rounded">
              <h3 class="text-lg font-semibold mb-2">数据展示</h3>
              <p class="text-neutral-600 dark:text-neutral-400">
                Table、List、Card 等数据展示组件。
              </p>
            </div>
            
            <section id="theme" class="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                主题
              </h2>
              <p class="text-neutral-600 dark:text-neutral-400">
                自定义组件的主题样式。
              </p>
            </section>
            
            <div id="color" class="ml-6 p-4 bg-white dark:bg-neutral-900 rounded mb-4">
              <h3 class="text-lg font-semibold mb-2">颜色定制</h3>
              <p class="text-neutral-600 dark:text-neutral-400">
                修改主题颜色和样式。
              </p>
            </div>
            
            <div id="dark" class="ml-6 p-4 bg-white dark:bg-neutral-900 rounded">
              <h3 class="text-lg font-semibold mb-2">暗色模式</h3>
              <p class="text-neutral-600 dark:text-neutral-400">
                启用和配置暗色模式。
              </p>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

// 10. AffixMode - 固定模式
export const AffixMode: Story = {
  render: () => ({
    components: { Anchor },
    setup() {
      const anchorItems: AnchorItem[] = [
        { key: '1', title: '简介', href: '#intro' },
        { key: '2', title: 'API', href: '#api' },
        { key: '3', title: '示例', href: '#examples' },
        { key: '4', title: 'FAQ', href: '#faq' },
      ]
      return { anchorItems }
    },
    template: `
      <div class="p-8" style="min-height: 2500px;">
        <div class="flex gap-12">
          <div class="w-64 shrink-0">
            <Anchor :affix="true" :offset-top="20" :items="anchorItems" />
          </div>
          
          <div class="flex-1 space-y-16">
            <section id="intro" class="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                简介
              </h2>
              <p class="text-neutral-600 dark:text-neutral-400 mb-4">
                开启固定模式后，锚点导航会在滚动时固定在指定位置。
              </p>
              <p class="text-neutral-600 dark:text-neutral-400">
                向下滚动查看效果，左侧的锚点导航会一直固定在距离顶部 20px 的位置。
              </p>
            </section>
            
            <section id="api" class="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                API 文档
              </h2>
              <p class="text-neutral-600 dark:text-neutral-400">
                查看完整的 API 文档和属性说明。
              </p>
            </section>
            
            <section id="examples" class="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                使用示例
              </h2>
              <p class="text-neutral-600 dark:text-neutral-400">
                浏览各种使用场景的示例代码。
              </p>
            </section>
            
            <section id="faq" class="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                常见问题
              </h2>
              <p class="text-neutral-600 dark:text-neutral-400">
                查看常见问题的解答。
              </p>
            </section>
          </div>
        </div>
      </div>
    `,
  }),
}
