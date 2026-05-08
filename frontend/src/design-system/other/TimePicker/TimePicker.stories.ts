// @ts-nocheck - Storybook stories with flexible component types
import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import TimePicker from './TimePicker.vue'

/**
 * TimePicker 组件 Storybook 故事
 *
 * 展示所有尺寸、状态和功能
 */

const meta = {
  title: 'Design System/Other/TimePicker',
  component: TimePicker,
  tags: ['autodocs'],
  argTypes: {
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
    editable: {
      control: 'boolean',
      description: '是否可编辑',
    },
    clearable: {
      control: 'boolean',
      description: '是否可清空',
    },
    isRange: {
      control: 'boolean',
      description: '是否范围选择',
    },
    rangeSeparator: {
      control: 'text',
      description: '范围分隔符',
    },
    format: {
      control: 'select',
      options: ['HH:mm:ss', 'HH:mm', 'HHmmss', 'HHmm'],
      description: '时间格式',
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
} satisfies Meta<typeof TimePicker>

export default meta
type Story = StoryObj<typeof meta>

// 默认故事 - 基础时间选择
export const Default: Story = {
  args: {
    size: 'md',
    placeholder: '选择时间',
    prefix: 'clock',
  },
  render: (args) => ({
    components: { TimePicker },
    setup() {
      const time = ref<string | null>(null)
      return { args, time }
    },
    template: `
      <div class="p-8 max-w-md">
        <TimePicker v-bind="args" v-model="time" />
        <p class="mt-2 text-sm text-slate-500">当前值: {{ time || '未选择' }}</p>
      </div>
    `,
  }),
}

// 时间范围选择
export const Range: Story = {
  render: () => ({
    components: { TimePicker },
    setup() {
      const timeRange = ref<[string, string] | null>(null)
      return { timeRange }
    },
    template: `
      <div class="p-8 space-y-4 max-w-2xl">
        <h3 class="text-lg font-semibold">时间范围选择</h3>
        <TimePicker v-model="timeRange" is-range placeholder="选择时间范围" prefix="clock" />
        <p class="text-sm text-slate-500">
          开始: {{ timeRange?.[0] || '未选择' }} |
          结束: {{ timeRange?.[1] || '未选择' }}
        </p>
      </div>
    `,
  }),
}

// 禁用状态
export const Disabled: Story = {
  render: () => ({
    components: { TimePicker },
    setup() {
      const disabledTime = ref('09:30:00')
      return { disabledTime }
    },
    template: `
      <div class="p-8 space-y-4 max-w-md">
        <h3 class="text-lg font-semibold mb-2">禁用状态</h3>
        <TimePicker v-model="disabledTime" disabled placeholder="禁用的时间选择器" />
      </div>
    `,
  }),
}

// 只读状态
export const Readonly: Story = {
  render: () => ({
    components: { TimePicker },
    setup() {
      const readonlyTime = ref('14:30:00')
      return { readonlyTime }
    },
    template: `
      <div class="p-8 space-y-4 max-w-md">
        <h3 class="text-lg font-semibold mb-2">只读状态</h3>
        <TimePicker v-model="readonlyTime" readonly placeholder="只读的时间选择器" />
      </div>
    `,
  }),
}

// 所有尺寸
export const Sizes: Story = {
  render: () => ({
    components: { TimePicker },
    setup() {
      const small = ref<string | null>(null)
      const medium = ref<string | null>(null)
      const large = ref<string | null>(null)
      return { small, medium, large }
    },
    template: `
      <div class="p-8 space-y-4 max-w-md">
        <TimePicker size="sm" v-model="small" placeholder="小尺寸时间选择器" />
        <TimePicker size="md" v-model="medium" placeholder="中尺寸时间选择器（默认）" />
        <TimePicker size="lg" v-model="large" placeholder="大尺寸时间选择器" />
      </div>
    `,
  }),
}

// 时间间隔
export const Steps: Story = {
  render: () => ({
    components: { TimePicker },
    setup() {
      const step1 = ref<string | null>(null)
      const step2 = ref<string | null>(null)
      const step3 = ref<string | null>(null)
      return { step1, step2, step3 }
    },
    template: `
      <div class="p-8 space-y-4 max-w-md">
        <h3 class="text-lg font-semibold mb-2">时间间隔</h3>

        <div>
          <label class="block text-sm font-medium mb-2">小时间隔为2</label>
          <TimePicker v-model="step1" :step="{ hour: 2, minute: 1, second: 1 }" placeholder="选择时间" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">分钟间隔为15</label>
          <TimePicker v-model="step2" :step="{ hour: 1, minute: 15, second: 1 }" placeholder="选择时间" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">秒间隔为30</label>
          <TimePicker v-model="step3" :step="{ hour: 1, minute: 1, second: 30 }" placeholder="选择时间" />
        </div>
      </div>
    `,
  }),
}

// 自定义格式
export const Format: Story = {
  render: () => ({
    components: { TimePicker },
    setup() {
      const time1 = ref<string | null>(null)
      const time2 = ref<string | null>(null)
      const time3 = ref<string | null>(null)
      const time4 = ref<string | null>(null)
      return { time1, time2, time3, time4 }
    },
    template: `
      <div class="p-8 space-y-4 max-w-md">
        <h3 class="text-lg font-semibold mb-2">时间格式</h3>

        <div>
          <label class="block text-sm font-medium mb-2">HH:mm:ss (默认)</label>
          <TimePicker v-model="time1" format="HH:mm:ss" placeholder="14:30:00" />
          <p class="text-sm text-slate-500 mt-1">值: {{ time1 }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">HH:mm</label>
          <TimePicker v-model="time2" format="HH:mm" placeholder="14:30" />
          <p class="text-sm text-slate-500 mt-1">值: {{ time2 }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">HHmmss</label>
          <TimePicker v-model="time3" format="HHmmss" placeholder="143000" />
          <p class="text-sm text-slate-500 mt-1">值: {{ time3 }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">HHmm</label>
          <TimePicker v-model="time4" format="HHmm" placeholder="1430" />
          <p class="text-sm text-slate-500 mt-1">值: {{ time4 }}</p>
        </div>
      </div>
    `,
  }),
}

// 时间限制
export const WithLimits: Story = {
  render: () => ({
    components: { TimePicker },
    setup() {
      const time1 = ref<string | null>(null)
      const time2 = ref<string | null>(null)
      const time3 = ref<string | null>(null)
      return { time1, time2, time3 }
    },
    template: `
      <div class="p-8 space-y-4 max-w-md">
        <h3 class="text-lg font-semibold mb-2">时间限制</h3>

        <div>
          <label class="block text-sm font-medium mb-2">只能选择09:00之后的时间</label>
          <TimePicker v-model="time1" start="09:00:00" placeholder="选择时间" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">只能选择18:00之前的时间</label>
          <TimePicker v-model="time2" end="18:00:00" placeholder="选择时间" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">工作时间(09:00-18:00)</label>
          <TimePicker v-model="time3" start="09:00:00" end="18:00:00" placeholder="选择时间" />
        </div>
      </div>
    `,
  }),
}

// 可清空
export const Clearable: Story = {
  render: () => ({
    components: { TimePicker },
    setup() {
      const time = ref('09:30:00')
      const timeRange = ref(['09:00:00', '18:00:00'])
      return { time, timeRange }
    },
    template: `
      <div class="p-8 space-y-4 max-w-2xl">
        <h3 class="text-lg font-semibold">可清空的时间选择器</h3>
        <TimePicker v-model="time" clearable placeholder="选择时间" />
        <TimePicker v-model="timeRange" is-range clearable placeholder="选择时间范围" />
        <p class="text-sm text-slate-500">输入内容后会出现清空按钮</p>
      </div>
    `,
  }),
}

// 禁用时段
export const DisabledHours: Story = {
  render: () => ({
    components: { TimePicker },
    setup() {
      const time1 = ref<string | null>(null)
      const time2 = ref<string | null>(null)
      const time3 = ref<string | null>(null)

      // 禁用午休时间
      const disabledRanges = [
        { start: '12:00:00', end: '13:00:00' },
        { start: '18:00:00', end: '19:00:00' },
      ]

      // 禁用特定小时
      const disabledHoursArray = [0, 1, 2, 3, 4, 5, 6, 22, 23]

      // 禁用特定分钟的函数
      const disabledMinutesFn = (hour: number, minute: number) => {
        // 每15分钟的间隔
        return minute % 15 !== 0
      }

      return { time1, time2, time3, disabledRanges, disabledHoursArray, disabledMinutesFn }
    },
    template: `
      <div class="p-8 space-y-4 max-w-md">
        <h3 class="text-lg font-semibold mb-2">禁用时段</h3>

        <div>
          <label class="block text-sm font-medium mb-2">禁用午休和晚餐时间</label>
          <TimePicker v-model="time1" :disabled-time-ranges="disabledRanges" placeholder="选择时间" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">禁用特定小时(0-6, 22-23)</label>
          <TimePicker v-model="time2" :disabled-hours="disabledHoursArray" placeholder="选择时间" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">只能选择每15分钟的时间点</label>
          <TimePicker v-model="time3" :disabled-minutes="disabledMinutesFn" placeholder="选择时间" />
        </div>
      </div>
    `,
  }),
}

// 不可编辑
export const NotEditable: Story = {
  render: () => ({
    components: { TimePicker },
    setup() {
      const time = ref('14:30:00')
      return { time }
    },
    template: `
      <div class="p-8 space-y-4 max-w-md">
        <h3 class="text-lg font-semibold mb-2">不可编辑</h3>
        <TimePicker v-model="time" :editable="false" placeholder="不可编辑的时间选择器" />
        <p class="text-sm text-slate-500">只能通过点击选择，不能手动输入</p>
      </div>
    `,
  }),
}

// 自定义分隔符
export const CustomSeparator: Story = {
  render: () => ({
    components: { TimePicker },
    setup() {
      const range1 = ref<[string, string] | null>(null)
      const range2 = ref<[string, string] | null>(null)
      return { range1, range2 }
    },
    template: `
      <div class="p-8 space-y-4 max-w-2xl">
        <h3 class="text-lg font-semibold mb-2">自定义分隔符</h3>

        <div>
          <label class="block text-sm font-medium mb-2">使用 "至" 作为分隔符</label>
          <TimePicker v-model="range1" is-range range-separator="至" placeholder="选择时间范围" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">使用 "~" 作为分隔符</label>
          <TimePicker v-model="range2" is-range range-separator="~" placeholder="选择时间范围" />
        </div>
      </div>
    `,
  }),
}

// 会议安排示例
export const MeetingExample: Story = {
  render: () => ({
    components: { TimePicker },
    setup() {
      const meetingTime = ref<string | null>(null)
      const meetingRange = ref<[string, string] | null>(null)

      const workingHours = {
        start: '09:00:00',
        end: '18:00:00',
      }

      const lunchBreak = {
        start: '12:00:00',
        end: '13:00:00',
      }

      return { meetingTime, meetingRange, workingHours, lunchBreak }
    },
    template: `
      <div class="p-8 max-w-2xl">
        <h3 class="text-xl font-bold mb-6">会议安排</h3>

        <div class="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">会议开始时间</label>
            <TimePicker
              v-model="meetingTime"
              :start="workingHours.start"
              :end="workingHours.end"
              :disabled-time-ranges="[lunchBreak]"
              placeholder="选择会议开始时间"
              clearable
            />
            <p class="text-xs text-slate-500 mt-1">工作时间: 09:00-18:00 (午休: 12:00-13:00)</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">会议时间段</label>
            <TimePicker
              v-model="meetingRange"
              is-range
              :start="workingHours.start"
              :end="workingHours.end"
              :disabled-time-ranges="[lunchBreak]"
              placeholder="选择会议时间段"
              clearable
            />
            <p class="text-xs text-slate-500 mt-1">时间段不能跨越午休时间</p>
          </div>

          <div class="pt-4 border-t">
            <button class="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
              确认安排
            </button>
          </div>
        </div>
      </div>
    `,
  }),
}

// 营业时间设置示例
export const BusinessHoursExample: Story = {
  render: () => ({
    components: { TimePicker },
    setup() {
      const weekdays = ref({
        monday: { open: '09:00:00', close: '18:00:00' },
        tuesday: { open: '09:00:00', close: '18:00:00' },
        wednesday: { open: '09:00:00', close: '18:00:00' },
        thursday: { open: '09:00:00', close: '18:00:00' },
        friday: { open: '09:00:00', close: '21:00:00' },
        saturday: { open: '10:00:00', close: '22:00:00' },
        sunday: { open: '10:00:00', close: '20:00:00' },
      })

      return { weekdays }
    },
    template: `
      <div class="p-8 max-w-3xl">
        <h3 class="text-xl font-bold mb-6">营业时间设置</h3>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="space-y-4">
            <div v-for="(day, key) in weekdays" :key="key" class="flex items-center gap-4">
              <label class="w-24 text-sm font-medium text-slate-700 capitalize">{{ key }}</label>
              <div class="flex-1 flex items-center gap-2">
                <TimePicker v-model="day.open" size="sm" placeholder="开" />
                <span class="text-slate-400">至</span>
                <TimePicker v-model="day.close" size="sm" placeholder="关" />
              </div>
            </div>
          </div>

          <div class="pt-4 border-t mt-4">
            <button class="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
              保存设置
            </button>
          </div>
        </div>
      </div>
    `,
  }),
}

// 提醒时间设置示例
export const ReminderExample: Story = {
  render: () => ({
    components: { TimePicker },
    setup() {
      const reminderTime = ref('09:00:00')
      const reminderRange = ref<[string, string] | null>(null)

      return { reminderTime, reminderRange }
    },
    template: `
      <div class="p-8 max-w-2xl">
        <h3 class="text-xl font-bold mb-6">提醒设置</h3>

        <div class="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">每日提醒时间</label>
            <TimePicker v-model="reminderTime" format="HH:mm" placeholder="选择提醒时间" clearable />
            <p class="text-xs text-slate-500 mt-1">设置每天的固定提醒时间</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">免打扰时段</label>
            <TimePicker
              v-model="reminderRange"
              is-range
              placeholder="选择免打扰时段"
              clearable
            />
            <p class="text-xs text-slate-500 mt-1">在此时间段内不会收到提醒</p>
          </div>

          <div class="pt-4 border-t">
            <button class="w-full py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium">
              保存设置
            </button>
          </div>
        </div>
      </div>
    `,
  }),
}

// 深色模式
export const DarkMode: Story = {
  render: () => ({
    components: { TimePicker },
    setup() {
      const time = ref<string | null>(null)
      const timeRange = ref<[string, string] | null>(null)
      return { time, timeRange }
    },
    template: `
      <div class="bg-slate-900 p-8 space-y-4 max-w-2xl">
        <h3 class="text-lg font-semibold text-white">深色模式</h3>
        <TimePicker v-model="time" placeholder="选择时间" class="!bg-slate-800 !border-slate-600 !text-white !placeholder:text-slate-400" />
        <TimePicker v-model="timeRange" is-range placeholder="选择时间范围" class="!bg-slate-800 !border-slate-600 !text-white !placeholder:text-slate-400" />
      </div>
    `,
  }),
}
