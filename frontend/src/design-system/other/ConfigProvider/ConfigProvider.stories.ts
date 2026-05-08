import type { Meta, StoryObj } from '@storybook/vue3'
import ConfigProvider from './ConfigProvider.vue'
import Button from '../../base/Button/Button.vue'

/**
 * ConfigProvider 组件 Storybook 故事
 *
 * 展示全局配置组件的各种用法和配置
 */

const meta = {
  title: 'Design System/Other/ConfigProvider',
  component: ConfigProvider,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: '全局尺寸',
    },
    namespace: {
      control: 'text',
      description: '组件类名前缀',
    },
    direction: {
      control: 'select',
      options: ['ltr', 'rtl'],
      description: '文本方向',
    },
    button: {
      control: 'object',
      description: '按钮默认配置',
    },
    zIndex: {
      control: 'object',
      description: '全局 z-index 配置',
    },
  },
} satisfies Meta<typeof ConfigProvider>

export default meta
type Story = StoryObj<typeof meta>

// 1. Default - 基础用法
export const Default: Story = {
  args: {},
  render: (args) => ({
    components: { ConfigProvider, Button },
    setup() {
      return { args }
    },
    template: `
      <ConfigProvider v-bind="args">
        <div class="p-8 space-y-4">
          <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            基础用法
          </h1>
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">
            ConfigProvider 为所有子组件提供全局配置。
          </p>
          <div class="flex gap-4">
            <Button>默认按钮</Button>
            <Button variant="outline">轮廓按钮</Button>
            <Button variant="ghost">幽灵按钮</Button>
          </div>
        </div>
      </ConfigProvider>
    `,
  }),
}

// 2. GlobalSize - 全局尺寸
export const GlobalSize: Story = {
  render: () => ({
    components: { ConfigProvider, Button },
    setup() {
      return {}
    },
    template: `
      <div class="space-y-8">
        <ConfigProvider size="small">
          <div class="p-8 border border-neutral-200 dark:border-neutral-700 rounded-lg">
            <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Small 尺寸
            </h2>
            <div class="flex gap-4">
              <Button>Small 按钮</Button>
              <Button variant="outline">轮廓按钮</Button>
            </div>
          </div>
        </ConfigProvider>

        <ConfigProvider size="medium">
          <div class="p-8 border border-neutral-200 dark:border-neutral-700 rounded-lg">
            <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Medium 尺寸
            </h2>
            <div class="flex gap-4">
              <Button>Medium 按钮</Button>
              <Button variant="outline">轮廓按钮</Button>
            </div>
          </div>
        </ConfigProvider>

        <ConfigProvider size="large">
          <div class="p-8 border border-neutral-200 dark:border-neutral-700 rounded-lg">
            <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Large 尺寸
            </h2>
            <div class="flex gap-4">
              <Button>Large 按钮</Button>
              <Button variant="outline">轮廓按钮</Button>
            </div>
          </div>
        </ConfigProvider>
      </div>
    `,
  }),
}

// 3. RTL - RTL 模式
export const RTL: Story = {
  render: () => ({
    components: { ConfigProvider },
    setup() {
      return {}
    },
    template: `
      <div class="space-y-8">
        <ConfigProvider direction="ltr">
          <div class="p-8 border border-neutral-200 dark:border-neutral-700 rounded-lg">
            <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              LTR 模式（从左到右）
            </h2>
            <p class="text-neutral-600 dark:text-neutral-400">
              这是正常的从左到右文本方向。Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
        </ConfigProvider>

        <ConfigProvider direction="rtl">
          <div class="p-8 border border-neutral-200 dark:border-neutral-700 rounded-lg" dir="rtl">
            <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              RTL 模式（从右到左）
            </h2>
            <p class="text-neutral-600 dark:text-neutral-400">
              这是反向的从右到左文本方向。适合阿拉伯语、希伯来语等语言。
            </p>
          </div>
        </ConfigProvider>
      </div>
    `,
  }),
}

// 4. ZIndex - 层级配置
export const ZIndex: Story = {
  render: () => ({
    components: { ConfigProvider, Button },
    setup() {
      return {}
    },
    template: `
      <ConfigProvider
        :z-index="{
          base: 2000,
          dropdown: 2050,
          popover: 2060,
          dialog: 2070,
          notification: 2080,
          message: 2090,
        }"
      >
        <div class="p-8 space-y-4">
          <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            Z-Index 配置
          </h1>
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">
            ConfigProvider 可以设置全局的 z-index 起始值。
          </p>
          <div class="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
            <p class="text-sm text-neutral-700 dark:text-neutral-300 mb-2">
              base: 2000
            </p>
            <p class="text-sm text-neutral-700 dark:text-neutral-300 mb-2">
              dropdown: 2050
            </p>
            <p class="text-sm text-neutral-700 dark:text-neutral-300 mb-2">
              popover: 2060
            </p>
            <p class="text-sm text-neutral-700 dark:text-neutral-300 mb-2">
              dialog: 2070
            </p>
            <p class="text-sm text-neutral-700 dark:text-neutral-300 mb-2">
              notification: 2080
            </p>
            <p class="text-sm text-neutral-700 dark:text-neutral-300">
              message: 2090
            </p>
          </div>
          <Button>测试按钮</Button>
        </div>
      </ConfigProvider>
    `,
  }),
}

// 5. CustomNamespace - 自定义命名空间
export const CustomNamespace: Story = {
  render: () => ({
    components: { ConfigProvider, Button },
    setup() {
      return {}
    },
    template: `
      <div class="space-y-8">
        <ConfigProvider namespace="qy">
          <div class="p-8 border border-neutral-200 dark:border-neutral-700 rounded-lg">
            <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              默认命名空间 (qy)
            </h2>
            <p class="text-neutral-600 dark:text-neutral-400 mb-4">
              组件类名会使用 "qy" 作为前缀
            </p>
            <Button>按钮</Button>
          </div>
        </ConfigProvider>

        <ConfigProvider namespace="custom">
          <div class="p-8 border border-neutral-200 dark:border-neutral-700 rounded-lg">
            <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              自定义命名空间 (custom)
            </h2>
            <p class="text-neutral-600 dark:text-neutral-400 mb-4">
              组件类名会使用 "custom" 作为前缀
            </p>
            <Button>按钮</Button>
          </div>
        </ConfigProvider>
      </div>
    `,
  }),
}

// 6. Locale - 语言配置
export const Locale: Story = {
  render: () => ({
    components: { ConfigProvider },
    setup() {
      const zhLocale = {
        confirm: '确认',
        cancel: '取消',
        submit: '提交',
        delete: '删除',
      }

      const enLocale = {
        confirm: 'Confirm',
        cancel: 'Cancel',
        submit: 'Submit',
        delete: 'Delete',
      }

      return { zhLocale, enLocale }
    },
    template: `
      <div class="space-y-8">
        <ConfigProvider :locale="zhLocale">
          <div class="p-8 border border-neutral-200 dark:border-neutral-700 rounded-lg">
            <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              中文语言包
            </h2>
            <div class="space-y-2 text-neutral-600 dark:text-neutral-400">
              <p>确认: {{ zhLocale.confirm }}</p>
              <p>取消: {{ zhLocale.cancel }}</p>
              <p>提交: {{ zhLocale.submit }}</p>
              <p>删除: {{ zhLocale.delete }}</p>
            </div>
          </div>
        </ConfigProvider>

        <ConfigProvider :locale="enLocale">
          <div class="p-8 border border-neutral-200 dark:border-neutral-700 rounded-lg">
            <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              English Language Pack
            </h2>
            <div class="space-y-2 text-neutral-600 dark:text-neutral-400">
              <p>Confirm: {{ enLocale.confirm }}</p>
              <p>Cancel: {{ enLocale.cancel }}</p>
              <p>Submit: {{ enLocale.submit }}</p>
              <p>Delete: {{ enLocale.delete }}</p>
            </div>
          </div>
        </ConfigProvider>
      </div>
    `,
  }),
}

// 7. ButtonConfig - 按钮配置
export const ButtonConfig: Story = {
  render: () => ({
    components: { ConfigProvider, Button },
    setup() {
      return {}
    },
    template: `
      <div class="space-y-8">
        <ConfigProvider
          :button="{
            size: 'small',
            variant: 'outline'
          }"
        >
          <div class="p-8 border border-neutral-200 dark:border-neutral-700 rounded-lg">
            <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              小型轮廓按钮配置
            </h2>
            <p class="text-neutral-600 dark:text-neutral-400 mb-4">
              所有按钮默认为小型轮廓样式
            </p>
            <div class="flex gap-4">
              <Button>按钮 1</Button>
              <Button>按钮 2</Button>
              <Button variant="solid">覆盖为实心</Button>
            </div>
          </div>
        </ConfigProvider>

        <ConfigProvider
          :button="{
            size: 'large',
            variant: 'ghost'
          }"
        >
          <div class="p-8 border border-neutral-200 dark:border-neutral-700 rounded-lg">
            <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              大型幽灵按钮配置
            </h2>
            <p class="text-neutral-600 dark:text-neutral-400 mb-4">
              所有按钮默认为大型幽灵样式
            </p>
            <div class="flex gap-4">
              <Button>按钮 1</Button>
              <Button>按钮 2</Button>
              <Button variant="solid">覆盖为实心</Button>
            </div>
          </div>
        </ConfigProvider>
      </div>
    `,
  }),
}

// 8. NestedConfig - 嵌套配置
export const NestedConfig: Story = {
  render: () => ({
    components: { ConfigProvider, Button },
    setup() {
      return {}
    },
    template: `
      <ConfigProvider size="small">
        <div class="p-8 space-y-8 border border-neutral-200 dark:border-neutral-700 rounded-lg">
          <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            外层 ConfigProvider (Small)
          </h2>
          <div class="flex gap-4">
            <Button>外层按钮</Button>
          </div>

          <ConfigProvider size="large">
            <div class="p-4 border border-neutral-300 dark:border-neutral-600 rounded">
              <h3 class="text-md font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                内层 ConfigProvider (Large)
              </h3>
              <div class="flex gap-4">
                <Button>内层按钮</Button>
              </div>
            </div>
          </ConfigProvider>

          <div class="flex gap-4">
            <Button>外层按钮（不受内层影响）</Button>
          </div>
        </div>
      </ConfigProvider>
    `,
  }),
}

// 9. ComponentPropsPriority - 组件属性优先级
export const ComponentPropsPriority: Story = {
  render: () => ({
    components: { ConfigProvider, Button },
    setup() {
      return {}
    },
    template: `
      <ConfigProvider size="small">
        <div class="p-8 space-y-4">
          <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            组件属性优先级
          </h1>
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">
            ConfigProvider 设置为 small，但组件自身的 size 属性会覆盖全局配置
          </p>
          <div class="flex gap-4">
            <Button>继承全局 small</Button>
            <Button size="medium">组件指定 medium</Button>
            <Button size="large">组件指定 large</Button>
          </div>
        </div>
      </ConfigProvider>
    `,
  }),
}

// 10. ComprehensiveConfig - 综合配置
export const ComprehensiveConfig: Story = {
  render: () => ({
    components: { ConfigProvider, Button },
    setup() {
      const comprehensiveLocale = {
        confirm: '确认',
        cancel: '取消',
        submit: '提交',
      }

      return { comprehensiveLocale }
    },
    template: `
      <ConfigProvider
        size="large"
        namespace="myapp"
        direction="ltr"
        :locale="comprehensiveLocale"
        :button="{
          size: 'medium',
          variant: 'solid'
        }"
        :z-index="{
          base: 2000,
          dropdown: 2050,
          popover: 2060,
          dialog: 2070,
          notification: 2080,
          message: 2090,
        }"
      >
        <div class="p-8 space-y-4">
          <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            综合配置示例
          </h1>
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">
            同时配置多个全局属性
          </p>
          <div class="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg mb-4">
            <p class="text-sm text-neutral-700 dark:text-neutral-300">size: large</p>
            <p class="text-sm text-neutral-700 dark:text-neutral-300">namespace: myapp</p>
            <p class="text-sm text-neutral-700 dark:text-neutral-300">direction: ltr</p>
            <p class="text-sm text-neutral-700 dark:text-neutral-300">button: { size: medium, variant: solid }</p>
          </div>
          <div class="flex gap-4">
            <Button>按钮 1</Button>
            <Button variant="outline">按钮 2</Button>
            <Button variant="ghost">按钮 3</Button>
          </div>
        </div>
      </ConfigProvider>
    `,
  }),
}
