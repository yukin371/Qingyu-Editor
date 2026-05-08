import type { Meta, StoryObj } from '@storybook/vue3'
import Radio from './Radio.vue'
import RadioGroup from './RadioGroup.vue'

/**
 * Radio 组件 Storybook 故事
 *
 * 展示所有尺寸、状态和模式
 */

import { ref } from 'vue'

const meta = {
  title: 'Design System/Form/Radio',
  component: Radio,
  subcomponents: { RadioGroup },
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'text',
      description: 'v-model 绑定值',
    },
    value: {
      control: 'text',
      description: '单选框的值',
    },
    label: {
      control: 'text',
      description: '标签文本',
    },
    disabled: {
      control: 'boolean',
      description: '禁用状态',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '单选框尺寸',
    },
    button: {
      control: 'boolean',
      description: '按钮模式',
    },
  },
} satisfies Meta<typeof Radio>

export default meta
type Story = StoryObj<typeof meta>

// 默认故事
export const Default: Story = {
  render: (args) => ({
    components: { Radio, RadioGroup },
    setup() {
      const selected = ref('option1')
      return { args, selected }
    },
    template: `
      <RadioGroup v-model="selected">
        <Radio v-bind="args" value="option1" label="选项 1" />
        <Radio v-bind="args" value="option2" label="选项 2" />
        <Radio v-bind="args" value="option3" label="选项 3" />
      </RadioGroup>
    `,
  }),
}

// 所有尺寸
export const AllSizes: Story = {
  render: () => ({
    components: { Radio, RadioGroup },
    setup() {
      const sizeSmall = ref('small1')
      const sizeMedium = ref('medium1')
      const sizeLarge = ref('large1')
      return { sizeSmall, sizeMedium, sizeLarge }
    },
    template: `
      <div class="space-y-8 p-8">
        <div>
          <h3 class="text-lg font-semibold mb-3">Small</h3>
          <RadioGroup v-model="sizeSmall" size="sm">
            <Radio value="small1" label="小尺寸选项 1" />
            <Radio value="small2" label="小尺寸选项 2" />
            <Radio value="small3" label="小尺寸选项 3" />
          </RadioGroup>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-3">Medium</h3>
          <RadioGroup v-model="sizeMedium" size="md">
            <Radio value="medium1" label="中尺寸选项 1" />
            <Radio value="medium2" label="中尺寸选项 2" />
            <Radio value="medium3" label="中尺寸选项 3" />
          </RadioGroup>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-3">Large</h3>
          <RadioGroup v-model="sizeLarge" size="lg">
            <Radio value="large1" label="大尺寸选项 1" />
            <Radio value="large2" label="大尺寸选项 2" />
            <Radio value="large3" label="大尺寸选项 3" />
          </RadioGroup>
        </div>
      </div>
    `,
  }),
}

// 标准模式
export const StandardMode: Story = {
  render: () => ({
    components: { Radio, RadioGroup },
    setup() {
      const standard = ref('standard1')
      return { standard }
    },
    template: `
      <div class="p-8">
        <RadioGroup v-model="standard">
          <Radio value="standard1" label="标准选项 1" />
          <Radio value="standard2" label="标准选项 2" />
          <Radio value="standard3" label="标准选项 3" />
        </RadioGroup>
        <p class="mt-4 text-sm text-slate-600 dark:text-slate-400">
          当前选择: {{ standard }}
        </p>
      </div>
    `,
  }),
}

// 按钮模式
export const ButtonMode: Story = {
  render: () => ({
    components: { Radio, RadioGroup },
    setup() {
      const button = ref('button1')
      return { button }
    },
    template: `
      <div class="p-8">
        <RadioGroup v-model="button" :button="true">
          <Radio value="button1" label="按钮选项 1" />
          <Radio value="button2" label="按钮选项 2" />
          <Radio value="button3" label="按钮选项 3" />
        </RadioGroup>
        <p class="mt-4 text-sm text-slate-600 dark:text-slate-400">
          当前选择: {{ button }}
        </p>
      </div>
    `,
  }),
}

// 按钮模式 - 不同尺寸
export const ButtonModeSizes: Story = {
  render: () => ({
    components: { Radio, RadioGroup },
    setup() {
      const small = ref('s1')
      const medium = ref('m1')
      const large = ref('l1')
      return { small, medium, large }
    },
    template: `
      <div class="space-y-8 p-8">
        <div>
          <h3 class="text-lg font-semibold mb-3">Small Button Mode</h3>
          <RadioGroup v-model="small" size="sm" :button="true">
            <Radio value="s1" label="小" />
            <Radio value="s2" label="中" />
            <Radio value="s3" label="大" />
          </RadioGroup>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-3">Medium Button Mode</h3>
          <RadioGroup v-model="medium" size="md" :button="true">
            <Radio value="m1" label="小" />
            <Radio value="m2" label="中" />
            <Radio value="m3" label="大" />
          </RadioGroup>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-3">Large Button Mode</h3>
          <RadioGroup v-model="large" size="lg" :button="true">
            <Radio value="l1" label="小" />
            <Radio value="l2" label="中" />
            <Radio value="l3" label="大" />
          </RadioGroup>
        </div>
      </div>
    `,
  }),
}

// 状态
export const States: Story = {
  render: () => ({
    components: { Radio, RadioGroup },
    setup() {
      const normal = ref('n1')
      const withDisabled = ref('wd1')
      return { normal, withDisabled }
    },
    template: `
      <div class="space-y-8 p-8">
        <div>
          <h3 class="text-lg font-semibold mb-3">Normal State</h3>
          <RadioGroup v-model="normal">
            <Radio value="n1" label="正常选项 1" />
            <Radio value="n2" label="正常选项 2" />
            <Radio value="n3" label="正常选项 3" />
          </RadioGroup>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-3">With Disabled Items</h3>
          <RadioGroup v-model="withDisabled">
            <Radio value="wd1" label="可用选项 1" />
            <Radio value="wd2" label="禁用选项 2" :disabled="true" />
            <Radio value="wd3" label="可用选项 3" />
          </RadioGroup>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-3">All Disabled</h3>
          <RadioGroup v-model="normal" :disabled="true">
            <Radio value="d1" label="全部禁用 1" />
            <Radio value="d2" label="全部禁用 2" />
            <Radio value="d3" label="全部禁用 3" />
          </RadioGroup>
        </div>
      </div>
    `,
  }),
}

// 垂直排列
export const Vertical: Story = {
  render: () => ({
    components: { Radio, RadioGroup },
    setup() {
      const vertical = ref('v1')
      return { vertical }
    },
    template: `
      <div class="p-8">
        <RadioGroup v-model="vertical" :vertical="true">
          <Radio value="v1" label="垂直选项 1" />
          <Radio value="v2" label="垂直选项 2" />
          <Radio value="v3" label="垂直选项 3" />
        </RadioGroup>
      </div>
    `,
  }),
}

// 无标签（使用插槽）
export const WithSlot: Story = {
  render: () => ({
    components: { Radio, RadioGroup },
    setup() {
      const withSlot = ref('slot1')
      return { withSlot }
    },
    template: `
      <div class="p-8">
        <RadioGroup v-model="withSlot">
          <Radio value="slot1">
            <span class="font-semibold">自定义内容 1</span>
          </Radio>
          <Radio value="slot2">
            <span class="font-semibold">自定义内容 2</span>
          </Radio>
          <Radio value="slot3">
            <span class="font-semibold">自定义内容 3</span>
          </Radio>
        </RadioGroup>
      </div>
    `,
  }),
}

// 交互测试
export const Interactive: Story = {
  render: () => ({
    components: { Radio, RadioGroup },
    setup() {
      const selected = ref('opt1')
      return { selected }
    },
    template: `
      <div class="p-8">
        <RadioGroup v-model="selected">
          <Radio value="opt1" label="选项 1" />
          <Radio value="opt2" label="选项 2" />
          <Radio value="opt3" label="选项 3" />
        </RadioGroup>
        <div class="mt-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <p class="text-sm font-medium">当前选择: <span class="text-primary-500">{{ selected }}</span></p>
        </div>
      </div>
    `,
  }),
}

// 实际应用场景
export const RealWorldExample: Story = {
  render: () => ({
    components: { Radio, RadioGroup },
    setup() {
      const shipping = ref('standard')
      const notification = ref('email')
      const size = ref('m')
      return { shipping, notification, size }
    },
    template: `
      <div class="max-w-md space-y-8 p-8">
        <!-- 配送方式选择 -->
        <div>
          <h3 class="text-lg font-semibold mb-4">配送方式</h3>
          <RadioGroup v-model="shipping" :vertical="true">
            <Radio value="standard" label="标准配送 (3-5 个工作日)" />
            <Radio value="express" label="加急配送 (1-2 个工作日)" />
            <Radio value="overnight" label="次日达" />
          </RadioGroup>
        </div>

        <!-- 通知方式 -->
        <div>
          <h3 class="text-lg font-semibold mb-4">通知方式</h3>
          <RadioGroup v-model="notification" :button="true">
            <Radio value="email" label="邮件" />
            <Radio value="sms" label="短信" />
            <Radio value="push" label="推送" />
          </RadioGroup>
        </div>

        <!-- 尺寸选择 -->
        <div>
          <h3 class="text-lg font-semibold mb-4">尺寸</h3>
          <RadioGroup v-model="size" size="sm" :button="true">
            <Radio value="s" label="S" />
            <Radio value="m" label="M" />
            <Radio value="l" label="L" />
            <Radio value="xl" label="XL" />
          </RadioGroup>
        </div>
      </div>
    `,
  }),
}
