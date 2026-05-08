import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import DatePicker from './DatePicker.vue'

/**
 * DatePicker 组件 Storybook 故事
 *
 * 展示所有类型、尺寸、状态和功能
 */

const meta = {
  title: 'Design System/Form/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['date', 'daterange', 'datetime', 'datetimerange'],
      description: '选择器类型',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '输入框尺寸',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
    readonly: {
      control: 'boolean',
      description: '是否只读',
    },
    error: {
      control: 'boolean',
      description: '是否为错误状态',
    },
    clearable: {
      control: 'boolean',
      description: '是否可清空',
    },
    placeholder: {
      control: 'text',
      description: '占位符文本',
    },
    prefix: {
      control: 'text',
      description: '前缀图标名称',
    },
    showPrefix: {
      control: 'boolean',
      description: '是否显示前缀图标',
    },
  },
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

// 默认故事 - 单日期选择
export const Default: Story = {
  args: {
    type: 'date',
    size: 'md',
    placeholder: '选择日期',
    prefix: 'calendar',
  },
  render: (args) => ({
    components: { DatePicker },
    setup() {
      const date = ref<Date | null>(null)
      return { args, date }
    },
    template: `
      <div class="p-8 max-w-md">
        <DatePicker v-bind="args" v-model="date" />
        <p class="mt-2 text-sm text-slate-500">当前值: {{ date ? date.toISOString() : '未选择' }}</p>
      </div>
    `,
  }),
}

// 所有尺寸
export const AllSizes: Story = {
  render: () => ({
    components: { DatePicker },
    setup() {
      const small = ref<Date | null>(null)
      const medium = ref<Date | null>(null)
      const large = ref<Date | null>(null)
      return { small, medium, large }
    },
    template: `
      <div class="p-8 space-y-4 max-w-md">
        <DatePicker type="date" size="sm" v-model="small" placeholder="小尺寸日期选择器" />
        <DatePicker type="date" size="md" v-model="medium" placeholder="中尺寸日期选择器（默认）" />
        <DatePicker type="date" size="lg" v-model="large" placeholder="大尺寸日期选择器" />
      </div>
    `,
  }),
}

// 所有类型
export const AllTypes: Story = {
  render: () => ({
    components: { DatePicker },
    setup() {
      const date = ref<Date | null>(null)
      const daterange = ref<[Date, Date] | null>(null)
      const datetime = ref<Date | null>(null)
      const datetimerange = ref<[Date, Date] | null>(null)
      return { date, daterange, datetime, datetimerange }
    },
    template: `
      <div class="p-8 space-y-6 max-w-2xl">
        <div>
          <label class="block text-sm font-medium mb-2">单日期选择</label>
          <DatePicker type="date" v-model="date" placeholder="选择日期" />
          <p class="mt-1 text-sm text-slate-500">值: {{ date }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">日期范围选择</label>
          <DatePicker type="daterange" v-model="daterange" placeholder="选择日期范围" />
          <p class="mt-1 text-sm text-slate-500">值: {{ daterange }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">日期时间选择</label>
          <DatePicker type="datetime" v-model="datetime" placeholder="选择日期时间" />
          <p class="mt-1 text-sm text-slate-500">值: {{ datetime }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">日期时间范围选择</label>
          <DatePicker type="datetimerange" v-model="datetimerange" placeholder="选择日期时间范围" />
          <p class="mt-1 text-sm text-slate-500">值: {{ datetimerange }}</p>
        </div>
      </div>
    `,
  }),
}

// 日期范围选择
export const DateRange: Story = {
  render: () => ({
    components: { DatePicker },
    setup() {
      const dateRange = ref<[Date, Date] | null>(null)
      return { dateRange }
    },
    template: `
      <div class="p-8 space-y-4 max-w-2xl">
        <h3 class="text-lg font-semibold">日期范围选择</h3>
        <DatePicker type="daterange" v-model="dateRange" placeholder="选择日期范围" prefix="calendar" />
        <p class="text-sm text-slate-500">
          开始: {{ dateRange?.[0]?.toLocaleDateString() || '未选择' }} |
          结束: {{ dateRange?.[1]?.toLocaleDateString() || '未选择' }}
        </p>
      </div>
    `,
  }),
}

// 日期时间选择
export const DateTime: Story = {
  render: () => ({
    components: { DatePicker },
    setup() {
      const dateTime = ref<Date | null>(null)
      const dateTimeRange = ref<[Date, Date] | null>(null)
      return { dateTime, dateTimeRange }
    },
    template: `
      <div class="p-8 space-y-6 max-w-2xl">
        <h3 class="text-lg font-semibold">日期时间选择</h3>

        <div>
          <label class="block text-sm font-medium mb-2">单日期时间</label>
          <DatePicker type="datetime" v-model="dateTime" placeholder="选择日期时间" prefix="calendar" />
          <p class="mt-1 text-sm text-slate-500">值: {{ dateTime }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">日期时间范围</label>
          <DatePicker type="datetimerange" v-model="dateTimeRange" placeholder="选择日期时间范围" prefix="calendar" />
          <p class="mt-1 text-sm text-slate-500">值: {{ dateTimeRange }}</p>
        </div>
      </div>
    `,
  }),
}

// 带快捷选项
export const WithShortcuts: Story = {
  render: () => ({
    components: { DatePicker },
    setup() {
      const date = ref<Date | null>(null)
      const dateRange = ref<[Date, Date] | null>(null)

      const shortcuts = [
        {
          text: '今天',
          value: new Date(),
        },
        {
          text: '昨天',
          value: () => {
            const date = new Date()
            date.setDate(date.getDate() - 1)
            return date
          },
        },
        {
          text: '一周前',
          value: () => {
            const date = new Date()
            date.setDate(date.getDate() - 7)
            return date
          },
        },
      ]

      const rangeShortcuts = [
        {
          text: '最近一周',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setDate(start.getDate() - 7)
            return [start, end]
          },
        },
        {
          text: '最近一个月',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setMonth(start.getMonth() - 1)
            return [start, end]
          },
        },
        {
          text: '最近三个月',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setMonth(start.getMonth() - 3)
            return [start, end]
          },
        },
      ]

      return { date, dateRange, shortcuts, rangeShortcuts }
    },
    template: `
      <div class="p-8 space-y-6 max-w-2xl">
        <div>
          <h3 class="text-lg font-semibold mb-4">带快捷选项 - 单日期</h3>
          <DatePicker type="date" v-model="date" placeholder="选择日期" :shortcuts="shortcuts" />
          <p class="mt-2 text-sm text-slate-500">值: {{ date }}</p>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-4">带快捷选项 - 日期范围</h3>
          <DatePicker type="daterange" v-model="dateRange" placeholder="选择日期范围" :shortcuts="rangeShortcuts" />
          <p class="mt-2 text-sm text-slate-500">值: {{ dateRange }}</p>
        </div>
      </div>
    `,
  }),
}

// 可清空
export const Clearable: Story = {
  render: () => ({
    components: { DatePicker },
    setup() {
      const date = ref(new Date())
      const dateRange = ref<[Date, Date]>([new Date(), new Date()])
      return { date, dateRange }
    },
    template: `
      <div class="p-8 space-y-4 max-w-2xl">
        <h3 class="text-lg font-semibold">可清空的日期选择器</h3>
        <DatePicker type="date" v-model="date" placeholder="选择日期" clearable />
        <DatePicker type="daterange" v-model="dateRange" placeholder="选择日期范围" clearable />
        <p class="text-sm text-slate-500">输入内容后会出现清空按钮</p>
      </div>
    `,
  }),
}

// 错误状态
export const ErrorState: Story = {
  render: () => ({
    components: { DatePicker },
    setup() {
      const date = ref<Date | null>(null)
      return { date }
    },
    template: `
      <div class="p-8 space-y-4 max-w-md">
        <DatePicker v-model="date" error placeholder="选择日期" />
        <p class="text-sm text-red-500">请选择有效的日期</p>
      </div>
    `,
  }),
}

// 禁用状态
export const DisabledState: Story = {
  render: () => ({
    components: { DatePicker },
    setup() {
      const disabledDate = ref(new Date())
      return { disabledDate }
    },
    template: `
      <div class="p-8 space-y-4 max-w-md">
        <h3 class="text-lg font-semibold mb-2">禁用状态</h3>
        <DatePicker v-model="disabledDate" disabled placeholder="禁用的日期选择器" />
      </div>
    `,
  }),
}

// 只读状态
export const ReadonlyState: Story = {
  render: () => ({
    components: { DatePicker },
    setup() {
      const readonlyDate = ref(new Date())
      return { readonlyDate }
    },
    template: `
      <div class="p-8 space-y-4 max-w-md">
        <h3 class="text-lg font-semibold mb-2">只读状态</h3>
        <DatePicker v-model="readonlyDate" readonly placeholder="只读的日期选择器" />
      </div>
    `,
  }),
}

// 日期限制
export const DateConstraints: Story = {
  render: () => ({
    components: { DatePicker },
    setup() {
      const date1 = ref<Date | null>(null)
      const date2 = ref<Date | null>(null)
      const date3 = ref<Date | null>(null)

      const minDate = new Date()
      minDate.setDate(minDate.getDate() - 7)

      const maxDate = new Date()
      maxDate.setDate(maxDate.getDate() + 7)

      return { date1, date2, date3, minDate, maxDate }
    },
    template: `
      <div class="p-8 space-y-4 max-w-md">
        <h3 class="text-lg font-semibold mb-2">日期限制</h3>

        <div>
          <label class="block text-sm font-medium mb-2">只能选择未来日期</label>
          <DatePicker v-model="date1" type="date" :min-date="new Date()" placeholder="选择未来日期" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">限制在最近一周</label>
          <DatePicker v-model="date2" type="date" :min-date="minDate" :max-date="maxDate" placeholder="选择日期" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">只能选择过去的日期</label>
          <DatePicker v-model="date3" type="date" :max-date="new Date()" placeholder="选择过去日期" />
        </div>
      </div>
    `,
  }),
}

// 复杂组合示例
export const ComplexExample: Story = {
  render: () => ({
    components: { DatePicker },
    setup() {
      const birthDate = ref<Date | null>(null)
      const appointmentDate = ref<Date | null>(null)
      const leaveRange = ref<[Date, Date] | null>(null)
      const eventDateTime = ref<Date | null>(null)
      const meetingRange = ref<[Date, Date] | null>(null)

      const birthShortcuts = [
        { text: '18岁', value: () => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d; } },
        { text: '30岁', value: () => { const d = new Date(); d.setFullYear(d.getFullYear() - 30); return d; } },
      ]

      const rangeShortcuts = [
        { text: '本周', value: () => { const end = new Date(); const start = new Date(); start.setDate(start.getDate() - 7); return [start, end]; } },
        { text: '本月', value: () => { const end = new Date(); const start = new Date(); start.setMonth(start.getMonth() - 1); return [start, end]; } },
      ]

      return { birthDate, appointmentDate, leaveRange, eventDateTime, meetingRange, birthShortcuts, rangeShortcuts }
    },
    template: `
      <div class="p-8 max-w-3xl space-y-6">
        <h2 class="text-2xl font-bold">个人信息登记</h2>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700">出生日期</label>
          <DatePicker v-model="birthDate" type="date" placeholder="请选择出生日期" :max-date="new Date()" :shortcuts="birthShortcuts" />
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700">预约日期</label>
          <DatePicker v-model="appointmentDate" type="date" placeholder="请选择预约日期" :min-date="new Date()" clearable />
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700">请假时间范围</label>
          <DatePicker v-model="leaveRange" type="daterange" placeholder="选择请假时间" :shortcuts="rangeShortcuts" clearable />
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700">活动时间</label>
          <DatePicker v-model="eventDateTime" type="datetime" placeholder="选择活动时间" clearable />
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700">会议时间范围</label>
          <DatePicker v-model="meetingRange" type="datetimerange" placeholder="选择会议时间范围" clearable />
        </div>

        <div class="pt-4">
          <button class="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
            提交登记
          </button>
        </div>
      </div>
    `,
  }),
}

// 订单筛选示例
export const OrderFilterExample: Story = {
  render: () => ({
    components: { DatePicker },
    setup() {
      const orderDate = ref<[Date, Date] | null>(null)

      const shortcuts = [
        {
          text: '今天',
          value: () => [new Date(), new Date()],
        },
        {
          text: '最近7天',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setDate(start.getDate() - 7)
            return [start, end]
          },
        },
        {
          text: '最近30天',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setDate(start.getDate() - 30)
            return [start, end]
          },
        },
        {
          text: '本月',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setDate(1)
            return [start, end]
          },
        },
        {
          text: '上月',
          value: () => {
            const end = new Date()
            const start = new Date()
            end.setMonth(end.getMonth() - 1)
            end.setDate(0)
            start.setMonth(start.getMonth() - 1)
            start.setDate(1)
            return [start, end]
          },
        },
      ]

      return { orderDate, shortcuts }
    },
    template: `
      <div class="p-8 space-y-4 max-w-2xl">
        <h3 class="text-lg font-semibold mb-4">订单查询</h3>

        <div class="flex gap-4 items-end">
          <div class="flex-1">
            <label class="block text-sm font-medium text-slate-700 mb-2">下单时间</label>
            <DatePicker v-model="orderDate" type="daterange" placeholder="选择时间范围" :shortcuts="shortcuts" clearable />
          </div>

          <button class="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors h-10">
            查询
          </button>
        </div>

        <div class="mt-4 p-4 bg-slate-50 rounded-lg">
          <p class="text-sm text-slate-600">
            查询范围:
            <span v-if="orderDate">
              {{ orderDate[0].toLocaleDateString() }} 至 {{ orderDate[1].toLocaleDateString() }}
            </span>
            <span v-else>未选择</span>
          </p>
        </div>
      </div>
    `,
  }),
}

// 酒店预订示例
export const HotelBookingExample: Story = {
  render: () => ({
    components: { DatePicker },
    setup() {
      const checkIn = ref<Date | null>(null)
      const checkOut = ref<Date | null>(null)

      return { checkIn, checkOut }
    },
    template: `
      <div class="p-8 max-w-2xl">
        <h3 class="text-xl font-bold mb-6">酒店预订</h3>

        <div class="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">入住日期</label>
              <DatePicker v-model="checkIn" type="date" placeholder="选择入住日期" :min-date="new Date()" clearable />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">退房日期</label>
              <DatePicker v-model="checkOut" type="date" placeholder="选择退房日期" clearable />
            </div>
          </div>

          <div class="pt-4 border-t">
            <div class="flex justify-between items-center text-sm">
              <span class="text-slate-600">入住晚数:</span>
              <span class="font-semibold">
                {{ checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : 0 }} 晚
              </span>
            </div>
          </div>

          <button class="w-full py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium">
            立即预订
          </button>
        </div>
      </div>
    `,
  }),
}

// 深色模式
export const DarkMode: Story = {
  render: () => ({
    components: { DatePicker },
    setup() {
      const date = ref<Date | null>(null)
      const dateRange = ref<[Date, Date] | null>(null)
      return { date, dateRange }
    },
    template: `
      <div class="bg-slate-900 p-8 space-y-4 max-w-2xl">
        <h3 class="text-lg font-semibold text-white">深色模式</h3>
        <DatePicker v-model="date" type="date" placeholder="选择日期" class="!bg-slate-800 !border-slate-600 !text-white !placeholder:text-slate-400" />
        <DatePicker v-model="dateRange" type="daterange" placeholder="选择日期范围" class="!bg-slate-800 !border-slate-600 !text-white !placeholder:text-slate-400" />
      </div>
    `,
  }),
}
