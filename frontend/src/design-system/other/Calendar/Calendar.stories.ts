/**
 * Calendar.stories.ts
 *
 * Calendar 组件的 Storybook 故事
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import Calendar from './Calendar.vue'
import type { CalendarProps } from './types'

// Meta 配置
const meta: Meta<typeof Calendar> = {
  title: 'Other/Calendar/日历',
  component: Calendar,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'object',
      description: '绑定的日期值',
    },
    range: {
      control: 'boolean',
      description: '是否为范围选择模式',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '组件尺寸',
    },
    firstDayOfWeek: {
      control: 'number',
      min: 0,
      max: 6,
      description: '每周的第一天（0-6, 0=周日）',
    },
    showWeekNumbers: {
      control: 'boolean',
      description: '是否显示周数',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
    showToday: {
      control: 'boolean',
      description: '是否显示今天按钮',
    },
    showMonthSwitcher: {
      control: 'boolean',
      description: '是否显示月份切换',
    },
    locale: {
      control: 'select',
      options: ['zh-CN', 'en-US'],
      description: '语言环境',
    },
  },
}

export default meta
type Story = StoryObj<typeof Calendar>

// 1. Default - 基础日历
export const Default: Story = {
  name: '基础日历',
  args: {
    range: false,
    size: 'md',
    firstDayOfWeek: 0,
    showWeekNumbers: false,
    disabled: false,
    showToday: true,
    showMonthSwitcher: true,
    locale: 'zh-CN',
  },
  render: (args: CalendarProps) => ({
    components: { Calendar },
    setup() {
      const date = ref(new Date())
      return { args, date }
    },
    template: `
      <div class="w-fit">
        <Calendar v-bind="args" v-model="date" />
        <div class="mt-4 text-sm text-slate-600">
          选中的日期: {{ date ? date.toLocaleDateString('zh-CN') : '未选择' }}
        </div>
      </div>
    `,
  }),
}

// 2. CustomDate - 自定义日期
export const CustomDate: Story = {
  name: '自定义日期',
  args: {
    range: false,
    size: 'md',
    firstDayOfWeek: 0,
    showWeekNumbers: false,
    disabled: false,
    showToday: true,
    showMonthSwitcher: true,
    locale: 'zh-CN',
  },
  render: (args: CalendarProps) => ({
    components: { Calendar },
    setup() {
      const date = ref(new Date('2024-12-25'))
      return { args, date }
    },
    template: `
      <div class="w-fit">
        <Calendar v-bind="args" v-model="date" />
        <div class="mt-4 text-sm text-slate-600">
          选中的日期: {{ date ? date.toLocaleDateString('zh-CN') : '未选择' }}
        </div>
      </div>
    `,
  }),
}

// 3. Range - 范围选择
export const Range: Story = {
  name: '范围选择',
  args: {
    range: true,
    size: 'md',
    firstDayOfWeek: 0,
    showWeekNumbers: false,
    disabled: false,
    showToday: true,
    showMonthSwitcher: true,
    locale: 'zh-CN',
  },
  render: (args: CalendarProps) => ({
    components: { Calendar },
    setup() {
      const range = ref<[Date, Date] | null>(null)
      return { args, range }
    },
    template: `
      <div class="w-fit">
        <Calendar v-bind="args" v-model="range" />
        <div class="mt-4 text-sm text-slate-600">
          选中的范围:
          <span v-if="range">
            {{ range[0].toLocaleDateString('zh-CN') }} - {{ range[1].toLocaleDateString('zh-CN') }}
          </span>
          <span v-else>未选择</span>
        </div>
      </div>
    `,
  }),
}

// 4. DisabledDate - 禁用日期
export const DisabledDate: Story = {
  name: '禁用日期',
  args: {
    range: false,
    size: 'md',
    firstDayOfWeek: 0,
    showWeekNumbers: false,
    disabled: false,
    showToday: true,
    showMonthSwitcher: true,
    locale: 'zh-CN',
    disabledDate: (date: Date) => {
      // 禁用周末
      const day = date.getDay()
      return day === 0 || day === 6
    },
  },
  render: (args: CalendarProps) => ({
    components: { Calendar },
    setup() {
      const date = ref(new Date())
      return { args, date }
    },
    template: `
      <div class="w-fit">
        <Calendar v-bind="args" v-model="date" />
        <div class="mt-4 text-sm text-slate-600">
          选中的日期: {{ date ? date.toLocaleDateString('zh-CN') : '未选择' }}
          <br />
          <span class="text-slate-500">周末日期已被禁用</span>
        </div>
      </div>
    `,
  }),
}

// 5. CustomFirstDay - 自定义起始日
export const CustomFirstDay: Story = {
  name: '自定义起始日',
  args: {
    range: false,
    size: 'md',
    firstDayOfWeek: 1,
    showWeekNumbers: false,
    disabled: false,
    showToday: true,
    showMonthSwitcher: true,
    locale: 'zh-CN',
  },
  render: (args: CalendarProps) => ({
    components: { Calendar },
    setup() {
      const date = ref(new Date())
      return { args, date }
    },
    template: `
      <div class="w-fit">
        <Calendar v-bind="args" v-model="date" />
        <div class="mt-4 text-sm text-slate-600">
          选中的日期: {{ date ? date.toLocaleDateString('zh-CN') : '未选择' }}
          <br />
          <span class="text-slate-500">每周从周一开始</span>
        </div>
      </div>
    `,
  }),
}

// 6. WithWeeks - 显示周数
export const WithWeeks: Story = {
  name: '显示周数',
  args: {
    range: false,
    size: 'md',
    firstDayOfWeek: 1,
    showWeekNumbers: true,
    disabled: false,
    showToday: true,
    showMonthSwitcher: true,
    locale: 'zh-CN',
  },
  render: (args: CalendarProps) => ({
    components: { Calendar },
    setup() {
      const date = ref(new Date())
      return { args, date }
    },
    template: `
      <div class="w-fit">
        <Calendar v-bind="args" v-model="date" />
        <div class="mt-4 text-sm text-slate-600">
          选中的日期: {{ date ? date.toLocaleDateString('zh-CN') : '未选择' }}
        </div>
      </div>
    `,
  }),
}

// 7. DifferentSizes - 不同尺寸
export const DifferentSizes: Story = {
  name: '不同尺寸',
  render: () => ({
    components: { Calendar },
    setup() {
      const smallDate = ref(new Date())
      const mediumDate = ref(new Date())
      const largeDate = ref(new Date())
      return { smallDate, mediumDate, largeDate }
    },
    template: `
      <div class="flex flex-col gap-8">
        <div>
          <h3 class="text-sm font-medium text-slate-700 mb-2">小尺寸 (sm)</h3>
          <Calendar v-model="smallDate" size="sm" />
        </div>
        <div>
          <h3 class="text-sm font-medium text-slate-700 mb-2">中尺寸 (md) - 默认</h3>
          <Calendar v-model="mediumDate" size="md" />
        </div>
        <div>
          <h3 class="text-sm font-medium text-slate-700 mb-2">大尺寸 (lg)</h3>
          <Calendar v-model="largeDate" size="lg" />
        </div>
      </div>
    `,
  }),
}

// 8. Internationalization - 国际化
export const Internationalization: Story = {
  name: '国际化',
  render: () => ({
    components: { Calendar },
    setup() {
      const zhDate = ref(new Date())
      const enDate = ref(new Date())
      return { zhDate, enDate }
    },
    template: `
      <div class="flex gap-8">
        <div>
          <h3 class="text-sm font-medium text-slate-700 mb-2">中文</h3>
          <Calendar v-model="zhDate" locale="zh-CN" first-day-of-week="0" />
          <div class="mt-2 text-sm text-slate-600">
            选中的日期: {{ zhDate ? zhDate.toLocaleDateString('zh-CN') : '未选择' }}
          </div>
        </div>
        <div>
          <h3 class="text-sm font-medium text-slate-700 mb-2">English</h3>
          <Calendar v-model="enDate" locale="en-US" first-day-of-week="0" />
          <div class="mt-2 text-sm text-slate-600">
            Selected date: {{ enDate ? enDate.toLocaleDateString('en-US') : 'Not selected' }}
          </div>
        </div>
      </div>
    `,
  }),
}

// 9. MinMaxDate - 日期范围限制
export const MinMaxDate: Story = {
  name: '日期范围限制',
  render: () => ({
    components: { Calendar },
    setup() {
      const date = ref(new Date())
      const minDate = new Date()
      const maxDate = new Date()
      maxDate.setDate(maxDate.getDate() + 30) // 未来30天
      return { date, minDate, maxDate }
    },
    template: `
      <div class="w-fit">
        <Calendar
          v-model="date"
          :min-date="minDate"
          :max-date="maxDate"
        />
        <div class="mt-4 text-sm text-slate-600">
          选中的日期: {{ date ? date.toLocaleDateString('zh-CN') : '未选择' }}
          <br />
          <span class="text-slate-500">只能选择今天到未来30天的日期</span>
        </div>
      </div>
    `,
  }),
}

// 10. RangeWithWeeks - 范围选择显示周数
export const RangeWithWeeks: Story = {
  name: '范围选择显示周数',
  args: {
    range: true,
    size: 'md',
    firstDayOfWeek: 1,
    showWeekNumbers: true,
    disabled: false,
    showToday: true,
    showMonthSwitcher: true,
    locale: 'zh-CN',
  },
  render: (args: CalendarProps) => ({
    components: { Calendar },
    setup() {
      const range = ref<[Date, Date] | null>(null)
      return { args, range }
    },
    template: `
      <div class="w-fit">
        <Calendar v-bind="args" v-model="range" />
        <div class="mt-4 text-sm text-slate-600">
          选中的范围:
          <span v-if="range">
            {{ range[0].toLocaleDateString('zh-CN') }} - {{ range[1].toLocaleDateString('zh-CN') }}
          </span>
          <span v-else>未选择</span>
        </div>
      </div>
    `,
  }),
}

// 11. DisabledState - 禁用状态
export const DisabledState: Story = {
  name: '禁用状态',
  render: () => ({
    components: { Calendar },
    setup() {
      const date = ref(new Date())
      return { date }
    },
    template: `
      <div class="w-fit">
        <Calendar v-model="date" :disabled="true" />
        <div class="mt-4 text-sm text-slate-600">
          选中的日期: {{ date ? date.toLocaleDateString('zh-CN') : '未选择' }}
          <br />
          <span class="text-slate-500">日历已禁用</span>
        </div>
      </div>
    `,
  }),
}

// 12. NoMonthSwitcher - 无月份切换
export const NoMonthSwitcher: Story = {
  name: '无月份切换',
  render: () => ({
    components: { Calendar },
    setup() {
      const date = ref(new Date('2024-12-25'))
      return { date }
    },
    template: `
      <div class="w-fit">
        <Calendar
          v-model="date"
          :show-month-switcher="false"
        />
        <div class="mt-4 text-sm text-slate-600">
          选中的日期: {{ date ? date.toLocaleDateString('zh-CN') : '未选择' }}
        </div>
      </div>
    `,
  }),
}
