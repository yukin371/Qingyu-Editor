import type { Meta, StoryObj } from '@storybook/vue3'
import Affix from './Affix.vue'

/**
 * Affix 组件 Storybook 故事
 *
 * 展示固钉组件的各种用法和配置
 */

import { ref } from 'vue'

const meta = {
  title: 'Design System/Other/Affix',
  component: Affix,
  tags: ['autodocs'],
  argTypes: {
    offset: {
      control: 'number',
      description: '距离窗口顶部或底部的偏移量',
    },
    position: {
      control: 'select',
      options: ['top', 'bottom'],
      description: '固定位置',
    },
    zIndex: {
      control: 'number',
      description: '元素的 z-index',
    },
    target: {
      control: 'text',
      description: '设置 Affix 需要监听滚动事件的容器',
    },
  },
} satisfies Meta<typeof Affix>

export default meta
type Story = StoryObj<typeof meta>

// 1. Default - 基础用法
export const Default: Story = {
  args: {
    offset: 0,
  },
  render: (args) => ({
    components: { Affix },
    setup() {
      return { args }
    },
    template: `
      <div class="relative">
        <div style="height: 2000px;">
          <Affix v-bind="args">
            <div class="px-6 py-3 bg-primary-500 text-white rounded-lg shadow-lg">
              <span class="font-medium">固定在顶部</span>
            </div>
          </Affix>
          <div class="p-8 space-y-4">
            <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
              Affix 固钉组件 - 基础用法
            </h1>
            <p class="text-neutral-600 dark:text-neutral-400 mb-4">
              向下滚动页面，顶部的按钮会固定在页面顶部。
            </p>
            <p v-for="i in 30" :key="i" class="text-neutral-600 dark:text-neutral-400">
              这是第 {{ i }} 段内容，用于演示页面滚动效果。当页面滚动时，
              上方的蓝色按钮会保持在可见区域的顶部。
            </p>
          </div>
        </div>
      </div>
    `,
  }),
}

// 2. Offset - 自定义偏移量
export const Offset: Story = {
  render: () => ({
    components: { Affix },
    setup() {
      return {}
    },
    template: `
      <div class="relative">
        <div style="height: 2000px;">
          <div class="space-y-4">
            <Affix :offset="0">
              <div class="mx-8 px-4 py-2 bg-secondary-500 text-white rounded shadow">
                偏移量: 0px
              </div>
            </Affix>
            <Affix :offset="50">
              <div class="mx-8 px-4 py-2 bg-green-500 text-white rounded shadow">
                偏移量: 50px
              </div>
            </Affix>
            <Affix :offset="100">
              <div class="mx-8 px-4 py-2 bg-purple-500 text-white rounded shadow">
                偏移量: 100px
              </div>
            </Affix>
            <Affix :offset="150">
              <div class="mx-8 px-4 py-2 bg-orange-500 text-white rounded shadow">
                偏移量: 150px
              </div>
            </Affix>
          </div>
          <div class="p-8 space-y-4">
            <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
              自定义偏移量
            </h1>
            <p class="text-neutral-600 dark:text-neutral-400 mb-4">
              这个示例展示了不同偏移量的效果。滚动页面查看效果。
            </p>
            <p v-for="i in 30" :key="i" class="text-neutral-600 dark:text-neutral-400">
              这是第 {{ i }} 段内容。上方有四个不同偏移量的固钉元素。
            </p>
          </div>
        </div>
      </div>
    `,
  }),
}

// 3. Bottom - 底部固定
export const Bottom: Story = {
  render: () => ({
    components: { Affix },
    setup() {
      return {}
    },
    template: `
      <div class="relative">
        <div style="height: 2000px;">
          <div class="p-8 space-y-4">
            <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
              底部固定
            </h1>
            <p class="text-neutral-600 dark:text-neutral-400 mb-4">
              向下滚动页面，底部的按钮会固定在页面底部。
            </p>
            <p v-for="i in 30" :key="i" class="text-neutral-600 dark:text-neutral-400">
              这是第 {{ i }} 段内容。滚动到页面底部附近时，下方的操作按钮会固定显示。
            </p>
          </div>
          <Affix position="bottom" :offset="20">
            <div class="mx-auto max-w-md px-6 py-3 bg-primary-500 text-white rounded-lg shadow-lg">
              <span class="font-medium">固定在底部</span>
            </div>
          </Affix>
        </div>
      </div>
    `,
  }),
}

// 4. TargetContainer - 目标容器
export const TargetContainer: Story = {
  render: () => ({
    components: { Affix },
    setup() {
      return {}
    },
    template: `
      <div class="relative">
        <div class="p-8 space-y-4" style="height: 800px;">
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
            目标容器
          </h1>
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">
            下面的容器有自己的滚动条，固钉元素只监听该容器的滚动。
          </p>
          <div
            id="affix-container"
            class="relative border-2 border-neutral-300 dark:border-neutral-700 rounded-lg overflow-auto"
            style="height: 400px;"
          >
            <Affix target="#affix-container" :offset="10">
              <div class="px-4 py-2 bg-primary-500 text-white rounded shadow">
                在容器内固定
              </div>
            </Affix>
            <div class="p-8 space-y-4" style="height: 2000px;">
              <p class="text-neutral-600 dark:text-neutral-400 mb-4">
                在这个容器内滚动，顶部的蓝色按钮会固定在容器顶部。
              </p>
              <p v-for="i in 30" :key="i" class="text-neutral-600 dark:text-neutral-400">
                这是容器内的第 {{ i }} 段内容。滚动此容器时，上方的按钮会保持在容器顶部。
              </p>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

// 5. ChangeEvent - 变化事件
export const ChangeEvent: Story = {
  render: () => ({
    components: { Affix },
    setup() {
      const fixed = ref(false)
      const handleChange = (isFixed: boolean) => {
        fixed.value = isFixed
      }
      return { fixed, handleChange }
    },
    template: `
      <div class="relative">
        <div style="height: 2000px;">
          <div class="p-8 space-y-4">
            <div class="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg mb-6">
              <p class="text-lg font-semibold mb-2">固定状态: {{ fixed ? '已固定' : '未固定' }}</p>
              <p class="text-sm text-neutral-600 dark:text-neutral-400">
                当前状态: {{ fixed ? '固钉元素已固定在页面顶部' : '固钉元素在正常文档流中' }}
              </p>
            </div>
            <Affix :offset="20" @change="handleChange">
              <div class="px-6 py-3 bg-primary-500 text-white rounded-lg shadow-lg">
                <span class="font-medium">滚动触发 change 事件</span>
              </div>
            </Affix>
            <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
              变化事件
            </h1>
            <p class="text-neutral-600 dark:text-neutral-400 mb-4">
              向下滚动页面，观察上方状态的变化。
            </p>
            <p v-for="i in 30" :key="i" class="text-neutral-600 dark:text-neutral-400">
              这是第 {{ i }} 段内容。上方的状态面板会显示固钉元素的当前状态。
            </p>
          </div>
        </div>
      </div>
    `,
  }),
}

// 6. ScrollEvent - 滚动事件
export const ScrollEvent: Story = {
  render: () => ({
    components: { Affix },
    setup() {
      const scrollCount = ref(0)
      const handleScroll = () => {
        scrollCount.value++
      }
      return { scrollCount, handleScroll }
    },
    template: `
      <div class="relative">
        <div style="height: 2000px;">
          <div class="p-8 space-y-4">
            <div class="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg mb-6">
              <p class="text-lg font-semibold mb-2">滚动次数: {{ scrollCount }}</p>
              <p class="text-sm text-neutral-600 dark:text-neutral-400">
                每次滚动都会触发 scroll 事件
              </p>
            </div>
            <Affix :offset="20" @scroll="handleScroll">
              <div class="px-6 py-3 bg-primary-500 text-white rounded-lg shadow-lg">
                <span class="font-medium">滚动触发 scroll 事件</span>
              </div>
            </Affix>
            <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
              滚动事件
            </h1>
            <p class="text-neutral-600 dark:text-neutral-400 mb-4">
              向下滚动页面，观察滚动次数的变化。
            </p>
            <p v-for="i in 30" :key="i" class="text-neutral-600 dark:text-neutral-400">
              这是第 {{ i }} 段内容。上方的计数器会记录滚动事件触发的次数。
            </p>
          </div>
        </div>
      </div>
    `,
  }),
}

// 7. ZIndex - 自定义层级
export const ZIndex: Story = {
  render: () => ({
    components: { Affix },
    setup() {
      return {}
    },
    template: `
      <div class="relative">
        <div style="height: 2000px;">
          <div class="space-y-4">
            <Affix :offset="0" :z-index="1">
              <div class="mx-8 px-4 py-2 bg-red-500 text-white rounded shadow">
                z-index: 1
              </div>
            </Affix>
            <Affix :offset="40" :z-index="10">
              <div class="mx-8 px-4 py-2 bg-secondary-500 text-white rounded shadow">
                z-index: 10
              </div>
            </Affix>
            <Affix :offset="80" :z-index="100">
              <div class="mx-8 px-4 py-2 bg-green-500 text-white rounded shadow">
                z-index: 100
              </div>
            </Affix>
            <Affix :offset="120" :z-index="1000">
              <div class="mx-8 px-4 py-2 bg-purple-500 text-white rounded shadow">
                z-index: 1000
              </div>
            </Affix>
          </div>
          <div class="p-8 space-y-4">
            <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
              自定义层级
            </h1>
            <p class="text-neutral-600 dark:text-neutral-400 mb-4">
              这个示例展示了不同 z-index 的效果。z-index 越大，层级越高。
            </p>
            <p v-for="i in 30" :key="i" class="text-neutral-600 dark:text-neutral-400">
              这是第 {{ i }} 段内容。上方有四个不同层级的固钉元素，它们可能会相互遮挡。
            </p>
          </div>
        </div>
      </div>
    `,
  }),
}

// 8. LongContent - 长内容场景
export const LongContent: Story = {
  render: () => ({
    components: { Affix },
    setup() {
      return {}
    },
    template: `
      <div class="relative">
        <div style="height: 2000px;">
          <Affix :offset="20">
            <div class="px-6 py-4 bg-primary-500 text-white rounded-lg shadow-lg max-w-xs">
              <h3 class="font-bold text-lg mb-2">快速导航</h3>
              <ul class="space-y-1 text-sm">
                <li>• 第一部分</li>
                <li>• 第二部分</li>
                <li>• 第三部分</li>
                <li>• 第四部分</li>
                <li>• 第五部分</li>
              </ul>
            </div>
          </Affix>
          <div class="p-8 space-y-4">
            <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
              长内容场景 - 实际应用示例
            </h1>
            <p class="text-neutral-600 dark:text-neutral-400 mb-4">
              这个示例模拟了一个长文档页面，左侧有一个固定的导航菜单。
            </p>

            <section class="mb-16">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">第一部分</h2>
              <p v-for="i in 10" :key="'1-'+i" class="text-neutral-600 dark:text-neutral-400 mb-2">
                这是第一部分的内容，用于演示长页面的效果。固定导航可以帮助用户快速定位到不同部分。
              </p>
            </section>

            <section class="mb-16">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">第二部分</h2>
              <p v-for="i in 10" :key="'2-'+i" class="text-neutral-600 dark:text-neutral-400 mb-2">
                这是第二部分的内容。在长文档中，固定导航是非常实用的功能。
              </p>
            </section>

            <section class="mb-16">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">第三部分</h2>
              <p v-for="i in 10" :key="'3-'+i" class="text-neutral-600 dark:text-neutral-400 mb-2">
                这是第三部分的内容。无论滚动到哪里，导航菜单都会保持可见。
              </p>
            </section>

            <section class="mb-16">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">第四部分</h2>
              <p v-for="i in 10" :key="'4-'+i" class="text-neutral-600 dark:text-neutral-400 mb-2">
                这是第四部分的内容。这种设计模式在文档网站和技术博客中很常见。
              </p>
            </section>

            <section class="mb-16">
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">第五部分</h2>
              <p v-for="i in 10" :key="'5-'+i" class="text-neutral-600 dark:text-neutral-400 mb-2">
                这是第五部分的内容。使用 Affix 组件可以轻松实现这种效果。
              </p>
            </section>
          </div>
        </div>
      </div>
    `,
  }),
}

// 9. BothPositions - 顶部和底部同时固定
export const BothPositions: Story = {
  render: () => ({
    components: { Affix },
    setup() {
      return {}
    },
    template: `
      <div class="relative">
        <div style="height: 2000px;">
          <Affix :offset="0">
            <div class="px-6 py-3 bg-secondary-500 text-white rounded-b-lg shadow-lg">
              <span class="font-medium">固定在顶部 - 头部导航</span>
            </div>
          </Affix>
          <div class="p-8 space-y-4">
            <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
              顶部和底部同时固定
            </h1>
            <p class="text-neutral-600 dark:text-neutral-400 mb-4">
              这个示例展示了同时在页面顶部和底部固定元素的效果。
            </p>
            <p v-for="i in 30" :key="i" class="text-neutral-600 dark:text-neutral-400">
              这是第 {{ i }} 段内容。页面顶部和底部都有固定的元素。
            </p>
          </div>
          <Affix position="bottom" :offset="0">
            <div class="px-6 py-3 bg-green-500 text-white rounded-t-lg shadow-lg">
              <span class="font-medium">固定在底部 - 操作栏</span>
            </div>
          </Affix>
        </div>
      </div>
    `,
  }),
}

// 10. MultipleAffix - 多个固钉元素
export const MultipleAffix: Story = {
  render: () => ({
    components: { Affix },
    setup() {
      return {}
    },
    template: `
      <div class="relative">
        <div style="height: 2000px;">
          <div class="grid grid-cols-3 gap-4 px-8">
            <Affix :offset="10">
              <div class="px-4 py-3 bg-secondary-500 text-white rounded-lg shadow-lg text-center">
                <div class="font-bold">工具栏 1</div>
              </div>
            </Affix>
            <Affix :offset="10">
              <div class="px-4 py-3 bg-green-500 text-white rounded-lg shadow-lg text-center">
                <div class="font-bold">工具栏 2</div>
              </div>
            </Affix>
            <Affix :offset="10">
              <div class="px-4 py-3 bg-purple-500 text-white rounded-lg shadow-lg text-center">
                <div class="font-bold">工具栏 3</div>
              </div>
            </Affix>
          </div>
          <div class="p-8 space-y-4">
            <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
              多个固钉元素
            </h1>
            <p class="text-neutral-600 dark:text-neutral-400 mb-4">
              这个示例展示了在页面中同时使用多个固钉元素的效果。
            </p>
            <p v-for="i in 30" :key="i" class="text-neutral-600 dark:text-neutral-400">
              这是第 {{ i }} 段内容。页面顶部有三个固定的工具栏按钮。
            </p>
          </div>
        </div>
      </div>
    `,
  }),
}
