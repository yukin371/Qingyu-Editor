// @ts-nocheck - Storybook stories with flexible component types
import type { Meta, StoryObj } from '@storybook/vue3'
import Slider from './Slider.vue'

/**
 * Slider 组件 Storybook 故事
 *
 * 展示所有尺寸、颜色和功能
 */

import { ref } from 'vue'

const meta = {
  title: 'Design System/Form/Slider',
  component: Slider,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'number',
      description: 'v-model 绑定值',
    },
    min: {
      control: 'number',
      description: '最小值',
    },
    max: {
      control: 'number',
      description: '最大值',
    },
    step: {
      control: 'number',
      description: '步长',
    },
    disabled: {
      control: 'boolean',
      description: '禁用状态',
    },
    range: {
      control: 'boolean',
      description: '双滑块模式',
    },
    vertical: {
      control: 'boolean',
      description: '垂直模式',
    },
    height: {
      control: 'text',
      description: '垂直模式高度',
    },
    showTooltip: {
      control: 'boolean',
      description: '显示提示',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Slider 尺寸',
    },
    color: {
      control: 'select',
      options: ['primary', 'success', 'warning', 'danger'],
      description: 'Slider 颜色',
    },
    label: {
      control: 'text',
      description: '标签文本',
    },
  },
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

// 默认故事
export const Default: Story = {
  args: {
    modelValue: 50,
    min: 0,
    max: 100,
    step: 1,
    size: 'md',
    color: 'primary',
    showTooltip: true,
  },
  render: (args) => ({
    components: { Slider },
    setup() {
      const value = ref(args.modelValue)
      return { args, value }
    },
    template: `
      <div class="p-8 w-80">
        <Slider v-bind="args" v-model="value" />
        <div class="mt-4 text-sm text-slate-600">Value: {{ value }}</div>
      </div>
    `,
  }),
}

// 所有尺寸
export const AllSizes: Story = {
  render: () => ({
    components: { Slider },
    setup() {
      const sm = ref(50)
      const md = ref(50)
      const lg = ref(50)
      return { sm, md, lg }
    },
    template: `
      <div class="flex flex-col gap-8 p-8 w-80">
        <div>
          <Slider size="sm" v-model="sm" label="Small" />
          <div class="mt-2 text-xs text-slate-600">Value: {{ sm }}</div>
        </div>
        <div>
          <Slider size="md" v-model="md" label="Medium" />
          <div class="mt-2 text-sm text-slate-600">Value: {{ md }}</div>
        </div>
        <div>
          <Slider size="lg" v-model="lg" label="Large" />
          <div class="mt-2 text-base text-slate-600">Value: {{ lg }}</div>
        </div>
      </div>
    `,
  }),
}

// 所有颜色
export const AllColors: Story = {
  render: () => ({
    components: { Slider },
    setup() {
      const primary = ref(50)
      const success = ref(50)
      const warning = ref(50)
      const danger = ref(50)
      return { primary, success, warning, danger }
    },
    template: `
      <div class="flex flex-col gap-6 p-8 w-80">
        <div>
          <Slider color="primary" v-model="primary" label="Primary" />
          <div class="mt-2 text-sm text-slate-600">Value: {{ primary }}</div>
        </div>
        <div>
          <Slider color="success" v-model="success" label="Success" />
          <div class="mt-2 text-sm text-slate-600">Value: {{ success }}</div>
        </div>
        <div>
          <Slider color="warning" v-model="warning" label="Warning" />
          <div class="mt-2 text-sm text-slate-600">Value: {{ warning }}</div>
        </div>
        <div>
          <Slider color="danger" v-model="danger" label="Danger" />
          <div class="mt-2 text-sm text-slate-600">Value: {{ danger }}</div>
        </div>
      </div>
    `,
  }),
}

// 禁用状态
export const Disabled: Story = {
  render: () => ({
    components: { Slider },
    template: `
      <div class="flex flex-col gap-6 p-8 w-80">
        <div>
          <Slider disabled :model-value="30" label="Disabled at 30" />
        </div>
        <div>
          <Slider disabled :model-value="70" label="Disabled at 70" />
        </div>
      </div>
    `,
  }),
}

// 双滑块模式
export const RangeMode: Story = {
  render: () => ({
    components: { Slider },
    setup() {
      const range = ref([30, 70])
      return { range }
    },
    template: `
      <div class="flex flex-col gap-6 p-8 w-80">
        <div>
          <Slider range v-model="range" label="Price Range" />
          <div class="mt-4 text-sm text-slate-600">
            Range: {{ range[0] }} - {{ range[1] }}
          </div>
        </div>
      </div>
    `,
  }),
}

// 垂直模式
export const VerticalMode: Story = {
  render: () => ({
    components: { Slider },
    setup() {
      const value1 = ref(50)
      const value2 = ref(50)
      const value3 = ref(50)
      const range = ref([30, 70])
      return { value1, value2, value3, range }
    },
    template: `
      <div class="flex gap-12 p-8">
        <div class="flex flex-col items-center gap-2">
          <Slider vertical height="200px" v-model="value1" />
          <span class="text-xs text-slate-600">{{ value1 }}</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Slider vertical height="200px" v-model="value2" color="success" />
          <span class="text-xs text-slate-600">{{ value2 }}</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Slider vertical height="200px" v-model="value3" color="warning" />
          <span class="text-xs text-slate-600">{{ value3 }}</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Slider vertical height="200px" v-model="range" range color="danger" />
          <span class="text-xs text-slate-600">{{ range[0] }} - {{ range[1] }}</span>
        </div>
      </div>
    `,
  }),
}

// 带刻度标记
export const WithMarks: Story = {
  render: () => ({
    components: { Slider },
    setup() {
      const value1 = ref(0)
      const value2 = ref(50)
      const range = ref([25, 75])

      const marks1 = {
        0: '0°C',
        25: '25°C',
        50: '50°C',
        75: '75°C',
        100: '100°C',
      }

      const marks2 = {
        0: '0',
        20: '20',
        40: '40',
        60: '60',
        80: '80',
        100: '100',
      }

      return { value1, value2, range, marks1, marks2 }
    },
    template: `
      <div class="flex flex-col gap-8 p-8 w-96">
        <div>
          <Slider v-model="value1" :marks="marks1" label="Temperature" />
          <div class="mt-4 text-sm text-slate-600">Value: {{ value1 }}°C</div>
        </div>
        <div>
          <Slider v-model="value2" :marks="marks2" color="success" label="Volume" />
          <div class="mt-4 text-sm text-slate-600">Value: {{ value2 }}</div>
        </div>
        <div>
          <Slider v-model="range" :marks="marks2" range color="primary" label="Price Range" />
          <div class="mt-4 text-sm text-slate-600">Range: {{ range[0] }} - {{ range[1] }}</div>
        </div>
      </div>
    `,
  }),
}

// 自定义格式化
export const CustomFormat: Story = {
  render: () => ({
    components: { Slider },
    setup() {
      const value1 = ref(50)
      const value2 = ref(50)
      const range = ref([20, 80])

      const formatCurrency = (value: number) => `$${value}`
      const formatPercent = (value: number) => `${value}%`
      const formatTemperature = (value: number) => `${value}°C`

      return { value1, value2, range, formatCurrency, formatPercent, formatTemperature }
    },
    template: `
      <div class="flex flex-col gap-6 p-8 w-80">
        <div>
          <Slider v-model="value1" :format-tooltip="formatCurrency" label="Price" color="success" />
          <div class="mt-4 text-sm text-slate-600">Value: {{ formatCurrency(value1) }}</div>
        </div>
        <div>
          <Slider v-model="value2" :format-tooltip="formatPercent" label="Discount" color="warning" />
          <div class="mt-4 text-sm text-slate-600">Value: {{ formatPercent(value2) }}</div>
        </div>
        <div>
          <Slider v-model="range" range :format-tooltip="formatTemperature" label="Temperature Range" color="danger" />
          <div class="mt-4 text-sm text-slate-600">
            Range: {{ formatTemperature(range[0]) }} - {{ formatTemperature(range[1]) }}
          </div>
        </div>
      </div>
    `,
  }),
}

// 不同步长
export const DifferentSteps: Story = {
  render: () => ({
    components: { Slider },
    setup() {
      const step1 = ref(50)
      const step5 = ref(50)
      const step10 = ref(25)
      return { step1, step5, step10 }
    },
    template: `
      <div class="flex flex-col gap-6 p-8 w-80">
        <div>
          <Slider v-model="step1" :step="1" label="Step: 1" />
          <div class="mt-4 text-sm text-slate-600">Value: {{ step1 }}</div>
        </div>
        <div>
          <Slider v-model="step5" :step="5" label="Step: 5" color="success" />
          <div class="mt-4 text-sm text-slate-600">Value: {{ step5 }}</div>
        </div>
        <div>
          <Slider v-model="step10" :step="10" :max="100" label="Step: 10" color="warning" />
          <div class="mt-4 text-sm text-slate-600">Value: {{ step10 }}</div>
        </div>
      </div>
    `,
  }),
}

// 隐藏 Tooltip
export const WithoutTooltip: Story = {
  render: () => ({
    components: { Slider },
    setup() {
      const value = ref(50)
      const range = ref([30, 70])
      return { value, range }
    },
    template: `
      <div class="flex flex-col gap-6 p-8 w-80">
        <div>
          <Slider v-model="value" :show-tooltip="false" label="Volume" />
        </div>
        <div>
          <Slider v-model="range" range :show-tooltip="false" label="Price Range" color="success" />
        </div>
      </div>
    `,
  }),
}

// 实际应用场景
export const RealWorldUsage: Story = {
  render: () => ({
    components: { Slider },
    setup() {
      const settings = ref({
        volume: 75,
        brightness: 60,
        temperature: 22,
        priceRange: [100, 500],
        discount: 15,
      })

      const formatCurrency = (value: number) => `$${value}`
      const formatTemperature = (value: number) => `${value}°C`

      return { settings, formatCurrency, formatTemperature }
    },
    template: `
      <div class="p-8 max-w-md">
        <h2 class="text-xl font-semibold mb-6">Settings</h2>

        <div class="space-y-6">
          <!-- 音量设置 -->
          <div>
            <h3 class="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
              Audio
            </h3>
            <div class="space-y-4">
              <div>
                <Slider v-model="settings.volume" :min="0" :max="100" color="primary" label="Volume" />
              </div>
            </div>
          </div>

          <!-- 显示设置 -->
          <div>
            <h3 class="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
              Display
            </h3>
            <div class="space-y-4">
              <div>
                <Slider v-model="settings.brightness" :min="0" :max="100" color="warning" label="Brightness" />
              </div>
            </div>
          </div>

          <!-- 温度设置 -->
          <div>
            <h3 class="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
              Climate
            </h3>
            <div class="space-y-4">
              <div>
                <Slider
                  v-model="settings.temperature"
                  :min="16"
                  :max="30"
                  :step="0.5"
                  :format-tooltip="formatTemperature"
                  :marks="{ 16: '16°C', 20: '20°C', 24: '24°C', 28: '28°C', 30: '30°C' }"
                  color="success"
                  label="Temperature"
                />
              </div>
            </div>
          </div>

          <!-- 价格范围 -->
          <div>
            <h3 class="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
              Price Filter
            </h3>
            <div class="space-y-4">
              <div>
                <Slider
                  v-model="settings.priceRange"
                  range
                  :min="0"
                  :max="1000"
                  :step="50"
                  :format-tooltip="formatCurrency"
                  color="danger"
                  label="Price Range"
                />
              </div>
            </div>
          </div>

          <!-- 折扣 -->
          <div>
            <h3 class="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
              Promotion
            </h3>
            <div class="space-y-4">
              <div>
                <Slider
                  v-model="settings.discount"
                  :min="0"
                  :max="50"
                  :format-tooltip="(v) => v + '%'"
                  color="primary"
                  label="Discount"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 当前设置预览 -->
        <div class="mt-8 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <h4 class="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
            Current Settings
          </h4>
          <pre class="text-xs text-slate-600 dark:text-slate-400">{{ JSON.stringify(settings, null, 2) }}</pre>
        </div>
      </div>
    `,
  }),
}

// 交互示例
export const Interactive: Story = {
  render: () => ({
    components: { Slider },
    setup() {
      const sliders = ref([
        { id: 1, label: 'Bass', value: 50, color: 'primary' as const },
        { id: 2, label: 'Mid', value: 50, color: 'success' as const },
        { id: 3, label: 'Treble', value: 50, color: 'warning' as const },
        { id: 4, label: 'Gain', value: 50, color: 'danger' as const },
      ])

      const resetAll = () => {
        sliders.value.forEach(s => s.value = 50)
      }

      const randomize = () => {
        sliders.value.forEach(s => s.value = Math.floor(Math.random() * 100))
      }

      const average = computed(() => {
        const sum = sliders.value.reduce((acc, s) => acc + s.value, 0)
        return Math.round(sum / sliders.value.length)
      })

      return { sliders, resetAll, randomize, average }
    },
    template: `
      <div class="p-8 space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Equalizer</h3>
          <div class="flex gap-2">
            <button
              @click="resetAll"
              class="px-3 py-1 text-sm bg-primary-500 text-white rounded hover:bg-primary-600"
            >
              Reset
            </button>
            <button
              @click="randomize"
              class="px-3 py-1 text-sm bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
            >
              Randomize
            </button>
          </div>
        </div>

        <div class="space-y-4">
          <div
            v-for="item in sliders"
            :key="item.id"
            class="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-slate-700 dark:text-slate-300">
                {{ item.label }}
              </span>
              <span class="text-sm text-slate-600 dark:text-slate-400">
                {{ item.value }}
              </span>
            </div>
            <Slider :color="item.color" v-model="item.value" :show-tooltip="false" />
          </div>
        </div>

        <div class="text-sm text-slate-600 dark:text-slate-400">
          Average level: {{ average }}
        </div>
      </div>
    `,
  }),
}

// 深色模式
export const DarkMode: Story = {
  render: () => ({
    components: { Slider },
    setup() {
      const values = ref({
        primary: 50,
        success: 50,
        warning: 50,
        danger: 50,
      })
      const range = ref([30, 70])
      return { values, range }
    },
    template: `
      <div class="bg-slate-900 p-8 space-y-6">
        <h3 class="text-lg font-semibold text-white">Dark Mode</h3>
        <div class="space-y-4 w-80">
          <div>
            <Slider v-model="values.primary" color="primary" label="Primary" />
            <div class="mt-2 text-sm text-slate-300">Value: {{ values.primary }}</div>
          </div>
          <div>
            <Slider v-model="values.success" color="success" label="Success" />
            <div class="mt-2 text-sm text-slate-300">Value: {{ values.success }}</div>
          </div>
          <div>
            <Slider v-model="values.warning" color="warning" label="Warning" />
            <div class="mt-2 text-sm text-slate-300">Value: {{ values.warning }}</div>
          </div>
          <div>
            <Slider v-model="values.danger" color="danger" label="Danger" />
            <div class="mt-2 text-sm text-slate-300">Value: {{ values.danger }}</div>
          </div>
          <div>
            <Slider v-model="range" range color="primary" label="Range" />
            <div class="mt-2 text-sm text-slate-300">Range: {{ range[0] }} - {{ range[1] }}</div>
          </div>
        </div>
      </div>
    `,
  }),
}

// 限制范围
export const LimitedRange: Story = {
  render: () => ({
    components: { Slider },
    setup() {
      const value1 = ref(5)
      const value2 = ref(50)
      const range = ref([25, 40])

      return { value1, value2, range }
    },
    template: `
      <div class="flex flex-col gap-6 p-8 w-80">
        <div>
          <Slider v-model="value1" :min="0" :max="10" label="Rating (0-10)" color="warning" />
          <div class="mt-4 text-sm text-slate-600">Rating: {{ value1 }}/10</div>
        </div>
        <div>
          <Slider v-model="value2" :min="-100" :max="100" label="Balance (-100 to 100)" color="success" />
          <div class="mt-4 text-sm text-slate-600">Balance: {{ value2 }}</div>
        </div>
        <div>
          <Slider v-model="range" range :min="0" :max="50" label="Range (0-50)" color="danger" />
          <div class="mt-4 text-sm text-slate-600">Range: {{ range[0] }} - {{ range[1] }}</div>
        </div>
      </div>
    `,
  }),
}
