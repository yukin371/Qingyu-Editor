import type { Meta, StoryObj } from '@storybook/vue3'
import BackTop from './BackTop.vue'

/**
 * BackTop 组件 Storybook 故事
 *
 * 展示返回顶部组件的各种用法和配置
 */

const meta = {
  title: 'Design System/Other/BackTop',
  component: BackTop,
  tags: ['autodocs'],
  argTypes: {
    visibilityHeight: {
      control: 'number',
      description: '滚动高度达到该值时显示返回顶部按钮',
    },
    backPosition: {
      control: 'number',
      description: '返回顶部的目标位置',
    },
    duration: {
      control: 'number',
      description: '滚动动画的持续时间（毫秒）',
    },
    easing: {
      control: 'select',
      options: ['linear', 'ease-in', 'ease-out', 'ease-in-out'],
      description: '滚动动画的缓动函数',
    },
    shape: {
      control: 'select',
      options: ['circle', 'square'],
      description: '按钮的形状',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: '按钮的大小',
    },
    position: {
      control: 'select',
      options: ['top-right', 'top-left', 'bottom-right', 'bottom-left'],
      description: '按钮的位置',
    },
    showProgress: {
      control: 'boolean',
      description: '是否显示滚动进度百分比',
    },
    smooth: {
      control: 'boolean',
      description: '是否启用平滑滚动',
    },
    autoHide: {
      control: 'boolean',
      description: '是否在返回顶部后自动隐藏',
    },
  },
} satisfies Meta<typeof BackTop>

export default meta
type Story = StoryObj<typeof meta>

// 1. Default - 基础用法
export const Default: Story = {
  args: {
    visibilityHeight: 200,
  },
  render: (args) => ({
    components: { BackTop },
    setup() {
      return { args }
    },
    template: `
      <div class="relative">
        <BackTop v-bind="args" />
        <div class="p-8 space-y-4" style="height: 2000px;">
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
            返回顶部组件示例
          </h1>
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">
            向下滚动页面以查看返回顶部按钮。
          </p>
          <p v-for="i in 20" :key="i" class="text-neutral-600 dark:text-neutral-400">
            这是第 {{ i }} 段内容，用于演示页面滚动效果。当滚动超过 {{ args.visibilityHeight }}px 时，
            返回顶部按钮将显示在页面右下角。
          </p>
        </div>
      </div>
    `,
  }),
}

// 2. CustomVisibility - 自定义显示高度
export const CustomVisibility: Story = {
  render: () => ({
    components: { BackTop },
    setup() {
      return {}
    },
    template: `
      <div class="relative">
        <BackTop :visibility-height="100" />
        <div class="p-8 space-y-4" style="height: 2000px;">
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
            自定义显示高度
          </h1>
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">
            这个示例中，返回顶部按钮在滚动 100px 后就会显示。
          </p>
          <p v-for="i in 20" :key="i" class="text-neutral-600 dark:text-neutral-400">
            这是第 {{ i }} 段内容。滚动 100px 后即可看到返回顶部按钮。
          </p>
        </div>
      </div>
    `,
  }),
}

// 3. CustomDuration - 自定义动画时长
export const CustomDuration: Story = {
  render: () => ({
    components: { BackTop },
    setup() {
      const durations = [100, 300, 500, 1000, 2000]
      return { durations }
    },
    template: `
      <div class="relative">
        <BackTop :duration="500" :visibility-height="200" />
        <div class="p-8 space-y-4" style="height: 2000px;">
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
            自定义动画时长
          </h1>
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">
            这个示例中，返回顶部的动画时长为 500ms。
          </p>
          <p v-for="i in 20" :key="i" class="text-neutral-600 dark:text-neutral-400">
            这是第 {{ i }} 段内容。点击返回顶部按钮时，滚动动画将持续 500ms。
          </p>
        </div>
      </div>
    `,
  }),
}

// 4. CustomContent - 自定义内容
export const CustomContent: Story = {
  render: () => ({
    components: { BackTop },
    setup() {
      return {}
    },
    template: `
      <div class="relative">
        <BackTop :visibility-height="200">
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          </template>
        </BackTop>
        <div class="p-8 space-y-4" style="height: 2000px;">
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
            自定义内容
          </h1>
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">
            这个示例使用了自定义的箭头图标。
          </p>
          <p v-for="i in 20" :key="i" class="text-neutral-600 dark:text-neutral-400">
            这是第 {{ i }} 段内容。返回顶部按钮使用了自定义图标。
          </p>
        </div>
      </div>
    `,
  }),
}

// 5. DifferentStyles - 不同样式
export const DifferentStyles: Story = {
  render: () => ({
    components: { BackTop },
    setup() {
      return {}
    },
    template: `
      <div class="relative">
        <div class="space-x-4 flex">
          <BackTop 
            shape="circle" 
            size="small" 
            position="bottom-right"
            :visibility-height="200"
            class="!right-20"
          />
          <BackTop 
            shape="square" 
            size="medium" 
            position="bottom-right"
            :visibility-height="200"
            class="!right-36"
          />
          <BackTop 
            shape="circle" 
            size="large" 
            position="bottom-right"
            :visibility-height="200"
            class="!right-56"
          />
        </div>
        <div class="p-8 space-y-4" style="height: 2000px;">
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
            不同样式
          </h1>
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">
            这个示例展示了不同形状和大小的返回顶部按钮。
          </p>
          <p v-for="i in 20" :key="i" class="text-neutral-600 dark:text-neutral-400">
            这是第 {{ i }} 段内容。右侧显示了三种不同样式的返回顶部按钮：
            小圆形、中方形、大圆形。
          </p>
        </div>
      </div>
    `,
  }),
}

// 6. WithProgress - 显示滚动进度
export const WithProgress: Story = {
  render: () => ({
    components: { BackTop },
    setup() {
      return {}
    },
    template: `
      <div class="relative">
        <BackTop :show-progress="true" :visibility-height="200" />
        <div class="p-8 space-y-4" style="height: 2000px;">
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
            显示滚动进度
          </h1>
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">
            这个示例在返回顶部按钮上显示了当前滚动进度的百分比。
          </p>
          <p v-for="i in 20" :key="i" class="text-neutral-600 dark:text-neutral-400">
            这是第 {{ i }} 段内容。返回顶部按钮会显示当前滚动进度百分比。
          </p>
        </div>
      </div>
    `,
  }),
}

// 7. SmoothScroll - 平滑滚动
export const SmoothScroll: Story = {
  render: () => ({
    components: { BackTop },
    setup() {
      return {}
    },
    template: `
      <div class="relative">
        <BackTop :smooth="true" :duration="800" :visibility-height="200" />
        <div class="p-8 space-y-4" style="height: 2000px;">
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
            平滑滚动
          </h1>
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">
            这个示例使用了更长的动画时长（800ms），展示平滑的滚动效果。
          </p>
          <p v-for="i in 20" :key="i" class="text-neutral-600 dark:text-neutral-400">
            这是第 {{ i }} 段内容。点击返回顶部按钮可以体验平滑的滚动动画。
          </p>
        </div>
      </div>
    `,
  }),
}

// 8. TargetElement - 滚动到指定元素
export const TargetElement: Story = {
  render: () => ({
    components: { BackTop },
    setup() {
      return {}
    },
    template: `
      <div class="relative">
        <BackTop target-element="header-section" :visibility-height="200" />
        <div class="p-8 space-y-4" style="height: 2000px;">
          <div id="header-section" class="mb-8 p-6 bg-primary-50 dark:bg-primary-900 rounded-lg">
            <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              这是目标区域
            </h1>
            <p class="text-neutral-600 dark:text-neutral-400">
              点击返回顶部按钮会滚动到这个区域，而不是页面最顶部。
            </p>
          </div>
          <p v-for="i in 20" :key="i" class="text-neutral-600 dark:text-neutral-400">
            这是第 {{ i }} 段内容。点击返回顶部按钮会滚动到页面顶部的目标区域。
          </p>
        </div>
      </div>
    `,
  }),
}

// 9. DifferentEasing - 不同缓动函数
export const DifferentEasing: Story = {
  render: () => ({
    components: { BackTop },
    setup() {
      const easingOptions = [
        { name: 'Linear', value: 'linear' },
        { name: 'Ease In', value: 'ease-in' },
        { name: 'Ease Out', value: 'ease-out' },
        { name: 'Ease In Out', value: 'ease-in-out' },
      ]
      return { easingOptions }
    },
    template: `
      <div class="relative">
        <BackTop easing="ease-in-out" :duration="600" :visibility-height="200" />
        <div class="p-8 space-y-4" style="height: 2000px;">
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
            不同缓动函数
          </h1>
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">
            这个示例使用了 ease-in-out 缓动函数，滚动动画会先加速后减速。
          </p>
          <div class="grid grid-cols-2 gap-4 mb-8">
            <div v-for="easing in easingOptions" :key="easing.value" 
                 class="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                {{ easing.name }}
              </h3>
              <p class="text-sm text-neutral-600 dark:text-neutral-400">
                {{ easing.value }}
              </p>
            </div>
          </div>
          <p v-for="i in 15" :key="i" class="text-neutral-600 dark:text-neutral-400">
            这是第 {{ i }} 段内容。
          </p>
        </div>
      </div>
    `,
  }),
}

// 10. AutoHide - 自动隐藏
export const AutoHide: Story = {
  render: () => ({
    components: { BackTop },
    setup() {
      return {}
    },
    template: `
      <div class="relative">
        <BackTop :auto-hide="true" :visibility-height="200" />
        <div class="p-8 space-y-4" style="height: 2000px;">
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
            自动隐藏
          </h1>
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">
            这个示例中，返回顶部按钮在点击后会自动隐藏。
          </p>
          <p v-for="i in 20" :key="i" class="text-neutral-600 dark:text-neutral-400">
            这是第 {{ i }} 段内容。点击返回顶部按钮后，按钮会自动消失。
          </p>
        </div>
      </div>
    `,
  }),
}

// 11. CustomPosition - 自定义位置
export const CustomPosition: Story = {
  render: () => ({
    components: { BackTop },
    setup() {
      return {}
    },
    template: `
      <div class="relative">
        <div class="space-x-4 flex">
          <BackTop 
            position="top-left" 
            :visibility-height="200"
            class="!left-20"
          />
          <BackTop 
            position="top-right" 
            :visibility-height="200"
            class="!right-20"
          />
          <BackTop 
            position="bottom-left" 
            :visibility-height="200"
            class="!left-20"
          />
          <BackTop 
            position="bottom-right" 
            :visibility-height="200"
            class="!right-20"
          />
        </div>
        <div class="p-8 space-y-4" style="height: 2000px;">
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
            自定义位置
          </h1>
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">
            这个示例展示了四个不同位置的返回顶部按钮。
          </p>
          <p v-for="i in 20" :key="i" class="text-neutral-600 dark:text-neutral-400">
            这是第 {{ i }} 段内容。四个角落都有一个返回顶部按钮。
          </p>
        </div>
      </div>
    `,
  }),
}

// 12. CustomTarget - 自定义滚动容器
export const CustomTarget: Story = {
  render: () => ({
    components: { BackTop },
    setup() {
      return {}
    },
    template: `
      <div class="relative">
        <div class="p-8 space-y-4" style="height: 800px;">
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
            自定义滚动容器
          </h1>
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">
            下面的容器有自己的滚动条，返回顶部按钮只监听该容器的滚动。
          </p>
          <div 
            id="scroll-container"
            class="relative border-2 border-neutral-300 dark:border-neutral-700 rounded-lg overflow-auto"
            style="height: 400px;"
          >
            <BackTop target="#scroll-container" :visibility-height="100" />
            <div class="p-8 space-y-4" style="height: 2000px;">
              <p v-for="i in 30" :key="i" class="text-neutral-600 dark:text-neutral-400">
                这是容器内的第 {{ i }} 段内容。在这个容器内滚动超过 100px 后，
                会显示返回顶部按钮。
              </p>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

// 13. CustomStyling - 自定义样式
export const CustomStyling: Story = {
  render: () => ({
    components: { BackTop },
    setup() {
      return {}
    },
    template: `
      <div class="relative">
        <BackTop 
          :visibility-height="200"
          class="!bg-gradient-to-r !from-purple-500 !to-pink-500"
          size="large"
        />
        <div class="p-8 space-y-4" style="height: 2000px;">
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
            自定义样式
          </h1>
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">
            这个示例使用了渐变背景色的返回顶部按钮。
          </p>
          <p v-for="i in 20" :key="i" class="text-neutral-600 dark:text-neutral-400">
            这是第 {{ i }} 段内容。返回顶部按钮使用了自定义的渐变背景色。
          </p>
        </div>
      </div>
    `,
  }),
}

// 14. WithoutSmooth - 无平滑滚动
export const WithoutSmooth: Story = {
  render: () => ({
    components: { BackTop },
    setup() {
      return {}
    },
    template: `
      <div class="relative">
        <BackTop :smooth="false" :visibility-height="200" />
        <div class="p-8 space-y-4" style="height: 2000px;">
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
            无平滑滚动
          </h1>
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">
            这个示例禁用了平滑滚动，点击后直接跳转到顶部。
          </p>
          <p v-for="i in 20" :key="i" class="text-neutral-600 dark:text-neutral-400">
            这是第 {{ i }} 段内容。点击返回顶部按钮会直接跳转，没有动画效果。
          </p>
        </div>
      </div>
    `,
  }),
}

// 15. WithTextContent - 带文本内容
export const WithTextContent: Story = {
  render: () => ({
    components: { BackTop },
    setup() {
      return {}
    },
    template: `
      <div class="relative">
        <BackTop :visibility-height="200" shape="square" size="large">
          <span class="text-sm font-medium">TOP</span>
        </BackTop>
        <div class="p-8 space-y-4" style="height: 2000px;">
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
            带文本内容
          </h1>
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">
            这个示例使用了文本内容而不是图标。
          </p>
          <p v-for="i in 20" :key="i" class="text-neutral-600 dark:text-neutral-400">
            这是第 {{ i }} 段内容。返回顶部按钮显示文本内容。
          </p>
        </div>
      </div>
    `,
  }),
}
