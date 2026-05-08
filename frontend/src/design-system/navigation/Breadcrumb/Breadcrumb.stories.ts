/**
 * Breadcrumb 组件 Storybook 故事
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import Breadcrumb from './Breadcrumb.vue'
import BreadcrumbItem from './BreadcrumbItem.vue'
import BreadcrumbSeparator from './BreadcrumbSeparator.vue'

const meta: Meta<typeof Breadcrumb> = {
  title: 'Navigation/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  argTypes: {
    separator: {
      control: 'text',
      description: '分隔符',
    },
    separatorClass: {
      control: 'text',
      description: '分隔符类名',
    },
  },
}

export default meta
type Story = StoryObj<typeof Breadcrumb>

/**
 * 基础面包屑
 */
export const Default: Story = {
  render: (args) => ({
    components: { Breadcrumb, BreadcrumbItem },
    setup() {
      return { args }
    },
    template: `
      <Breadcrumb v-bind="args">
        <BreadcrumbItem to="/">首页</BreadcrumbItem>
        <BreadcrumbItem to="/products">产品</BreadcrumbItem>
        <BreadcrumbItem>详情</BreadcrumbItem>
      </Breadcrumb>
    `,
  }),
  args: {
    separator: '/',
  },
}

/**
 * 带图标的面包屑
 */
export const WithIcons: Story = {
  render: () => ({
    components: { Breadcrumb, BreadcrumbItem },
    template: `
      <Breadcrumb>
        <BreadcrumbItem to="/">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          首页
        </BreadcrumbItem>
        <BreadcrumbItem to="/users">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          用户
        </BreadcrumbItem>
        <BreadcrumbItem>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          个人资料
        </BreadcrumbItem>
      </Breadcrumb>
    `,
  }),
}

/**
 * 自定义分隔符
 */
export const CustomSeparator: Story = {
  render: () => ({
    components: { Breadcrumb, BreadcrumbItem, BreadcrumbSeparator },
    template: `
      <Breadcrumb separator="">
        <BreadcrumbItem to="/">首页</BreadcrumbItem>
        <BreadcrumbSeparator>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </BreadcrumbSeparator>
        <BreadcrumbItem to="/products">产品</BreadcrumbItem>
        <BreadcrumbSeparator>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </BreadcrumbSeparator>
        <BreadcrumbItem>详情</BreadcrumbItem>
      </Breadcrumb>
    `,
  }),
}

/**
 * 路由集成
 */
export const WithRouter: Story = {
  render: () => ({
    components: { Breadcrumb, BreadcrumbItem },
    template: `
      <Breadcrumb>
        <BreadcrumbItem to="/">首页</BreadcrumbItem>
        <BreadcrumbItem to="/dashboard">控制台</BreadcrumbItem>
        <BreadcrumbItem to="/dashboard/analytics">分析</BreadcrumbItem>
        <BreadcrumbItem to="/dashboard/analytics/overview">概览</BreadcrumbItem>
      </Breadcrumb>
    `,
  }),
}

/**
 * 可点击项
 */
export const Clickable: Story = {
  render: () => ({
    components: { Breadcrumb, BreadcrumbItem },
    template: `
      <div>
        <p class="mb-4 text-sm text-slate-600 dark:text-slate-400">点击面包屑项查看事件触发</p>
        <Breadcrumb>
          <BreadcrumbItem to="/" @click="() => console.log('点击首页')">
            首页
          </BreadcrumbItem>
          <BreadcrumbItem to="/settings" @click="() => console.log('点击设置')">
            设置
          </BreadcrumbItem>
          <BreadcrumbItem :clickable="false" @click="() => console.log('点击当前页面')">
            当前页面
          </BreadcrumbItem>
        </Breadcrumb>
      </div>
    `,
  }),
}

/**
 * 长路径
 */
export const LongPath: Story = {
  render: () => ({
    components: { Breadcrumb, BreadcrumbItem },
    template: `
      <Breadcrumb>
        <BreadcrumbItem to="/">首页</BreadcrumbItem>
        <BreadcrumbItem to="/products">产品</BreadcrumbItem>
        <BreadcrumbItem to="/products/electronics">电子产品</BreadcrumbItem>
        <BreadcrumbItem to="/products/electronics/computers">电脑</BreadcrumbItem>
        <BreadcrumbItem to="/products/electronics/computers/laptops">笔记本</BreadcrumbItem>
        <BreadcrumbItem to="/products/electronics/computers/laptops/gaming">游戏本</BreadcrumbItem>
        <BreadcrumbItem>产品详情</BreadcrumbItem>
      </Breadcrumb>
    `,
  }),
}

/**
 * 最后一项不可点击
 */
export const LastNotClickable: Story = {
  render: () => ({
    components: { Breadcrumb, BreadcrumbItem },
    template: `
      <Breadcrumb>
        <BreadcrumbItem to="/">首页</BreadcrumbItem>
        <BreadcrumbItem to="/blog">博客</BreadcrumbItem>
        <BreadcrumbItem to="/blog/tech">技术</BreadcrumbItem>
        <BreadcrumbItem :clickable="false">当前文章</BreadcrumbItem>
      </Breadcrumb>
    `,
  }),
}

/**
 * 自定义样式
 */
export const CustomStyle: Story = {
  render: () => ({
    components: { Breadcrumb, BreadcrumbItem },
    template: `
      <div class="space-y-6">
        <!-- 大号字体 -->
        <Breadcrumb class="text-lg">
          <BreadcrumbItem to="/" class="text-secondary-600 hover:text-secondary-700">
            首页
          </BreadcrumbItem>
          <BreadcrumbItem to="/docs" class="text-secondary-600 hover:text-secondary-700">
            文档
          </BreadcrumbItem>
          <BreadcrumbItem class="text-secondary-900 font-bold">
            快速开始
          </BreadcrumbItem>
        </Breadcrumb>

        <!-- 小号字体 -->
        <Breadcrumb class="text-xs">
          <BreadcrumbItem to="/">首页</BreadcrumbItem>
          <BreadcrumbItem to="/settings">设置</BreadcrumbItem>
          <BreadcrumbItem>账户</BreadcrumbItem>
        </Breadcrumb>

        <!-- 自定义颜色 -->
        <Breadcrumb separator=">" class="text-purple-600">
          <BreadcrumbItem to="/" class="hover:text-purple-800">
            首页
          </BreadcrumbItem>
          <BreadcrumbItem to="/products" class="hover:text-purple-800">
            产品
          </BreadcrumbItem>
          <BreadcrumbItem class="text-purple-900 font-semibold">
            详情
          </BreadcrumbItem>
        </Breadcrumb>
      </div>
    `,
  }),
}

/**
 * 使用箭头分隔符
 */
export const ArrowSeparator: Story = {
  render: () => ({
    components: { Breadcrumb, BreadcrumbItem },
    template: `
      <Breadcrumb separator="›">
        <BreadcrumbItem to="/">首页</BreadcrumbItem>
        <BreadcrumbItem to="/services">服务</BreadcrumbItem>
        <BreadcrumbItem>咨询</BreadcrumbItem>
      </Breadcrumb>
    `,
  }),
}

/**
 * 替换导航
 */
export const ReplaceNavigation: Story = {
  render: () => ({
    components: { Breadcrumb, BreadcrumbItem },
    template: `
      <div>
        <p class="mb-4 text-sm text-slate-600 dark:text-slate-400">使用 replace 模式导航</p>
        <Breadcrumb>
          <BreadcrumbItem to="/">首页</BreadcrumbItem>
          <BreadcrumbItem to="/search" :replace="true">搜索</BreadcrumbItem>
          <BreadcrumbItem>结果</BreadcrumbItem>
        </Breadcrumb>
      </div>
    `,
  }),
}
