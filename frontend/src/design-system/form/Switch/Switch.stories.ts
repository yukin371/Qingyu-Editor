// @ts-nocheck - Storybook stories with flexible component types
import type { Meta, StoryObj } from '@storybook/vue3'
import Switch from './Switch.vue'

/**
 * Switch 组件 Storybook 故事
 *
 * 展示所有尺寸、颜色和功能
 */

import { ref } from 'vue'

const meta = {
  title: 'Design System/Form/Switch',
  component: Switch,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'boolean',
      description: 'v-model 绑定值',
    },
    disabled: {
      control: 'boolean',
      description: '禁用状态',
    },
    loading: {
      control: 'boolean',
      description: '加载状态',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Switch 尺寸',
    },
    color: {
      control: 'select',
      options: ['primary', 'success', 'warning', 'danger'],
      description: 'Switch 颜色',
    },
    label: {
      control: 'text',
      description: '标签文本',
    },
    activeText: {
      control: 'text',
      description: '选中时文本',
    },
    inactiveText: {
      control: 'text',
      description: '未选中时文本',
    },
  },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

// 默认故事
export const Default: Story = {
  args: {
    modelValue: false,
    size: 'md',
    color: 'primary',
  },
  render: (args) => ({
    components: { Switch },
    setup() {
      const value = ref(args.modelValue)
      return { args, value }
    },
    template: `
      <Switch v-bind="args" v-model="value" />
      <div class="mt-2 text-sm text-slate-600">Value: {{ value }}</div>
    `,
  }),
}

// 所有尺寸
export const AllSizes: Story = {
  render: () => ({
    components: { Switch },
    setup() {
      const sm = ref(false)
      const md = ref(false)
      const lg = ref(false)
      return { sm, md, lg }
    },
    template: `
      <div class="flex items-center gap-6 p-8">
        <div class="flex flex-col items-center gap-2">
          <Switch size="sm" v-model="sm" />
          <span class="text-xs text-slate-600">Small</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Switch size="md" v-model="md" />
          <span class="text-sm text-slate-600">Medium</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Switch size="lg" v-model="lg" />
          <span class="text-base text-slate-600">Large</span>
        </div>
      </div>
    `,
  }),
}

// 所有颜色
export const AllColors: Story = {
  render: () => ({
    components: { Switch },
    setup() {
      const primary = ref(true)
      const success = ref(true)
      const warning = ref(true)
      const danger = ref(true)
      return { primary, success, warning, danger }
    },
    template: `
      <div class="flex flex-col gap-4 p-8">
        <div class="flex items-center gap-3">
          <Switch color="primary" v-model="primary" />
          <span class="text-sm text-slate-700">Primary</span>
        </div>
        <div class="flex items-center gap-3">
          <Switch color="success" v-model="success" />
          <span class="text-sm text-slate-700">Success</span>
        </div>
        <div class="flex items-center gap-3">
          <Switch color="warning" v-model="warning" />
          <span class="text-sm text-slate-700">Warning</span>
        </div>
        <div class="flex items-center gap-3">
          <Switch color="danger" v-model="danger" />
          <span class="text-sm text-slate-700">Danger</span>
        </div>
      </div>
    `,
  }),
}

// 禁用状态
export const Disabled: Story = {
  render: () => ({
    components: { Switch },
    template: `
      <div class="flex flex-col gap-4 p-8">
        <div class="flex items-center gap-3">
          <Switch disabled :model-value="false" />
          <span class="text-sm text-slate-700">Disabled unchecked</span>
        </div>
        <div class="flex items-center gap-3">
          <Switch disabled :model-value="true" />
          <span class="text-sm text-slate-700">Disabled checked</span>
        </div>
      </div>
    `,
  }),
}

// 加载状态
export const Loading: Story = {
  render: () => ({
    components: { Switch },
    setup() {
      const value = ref(true)
      return { value }
    },
    template: `
      <div class="flex flex-col gap-4 p-8">
        <div class="flex items-center gap-3">
          <Switch loading v-model="value" />
          <span class="text-sm text-slate-700">Loading state</span>
        </div>
      </div>
    `,
  }),
}

// 带标签
export const WithLabel: Story = {
  render: () => ({
    components: { Switch },
    setup() {
      const notifications = ref(true)
      const autoSave = ref(false)
      const darkMode = ref(false)
      return { notifications, autoSave, darkMode }
    },
    template: `
      <div class="flex flex-col gap-4 p-8">
        <div class="flex items-center gap-3">
          <Switch v-model="notifications" label="Enable notifications" />
        </div>
        <div class="flex items-center gap-3">
          <Switch v-model="autoSave" label="Auto-save documents" />
        </div>
        <div class="flex items-center gap-3">
          <Switch v-model="darkMode" label="Dark mode" />
        </div>
      </div>
    `,
  }),
}

// 带文本
export const WithText: Story = {
  render: () => ({
    components: { Switch },
    setup() {
      const value1 = ref(true)
      const value2 = ref(false)
      return { value1, value2 }
    },
    template: `
      <div class="flex flex-col gap-4 p-8">
        <div class="flex items-center gap-3">
          <Switch
            v-model="value1"
            active-text="On"
            inactive-text="Off"
          />
          <span class="text-sm text-slate-700">With text labels</span>
        </div>
        <div class="flex items-center gap-3">
          <Switch
            v-model="value2"
            active-text="启用"
            inactive-text="禁用"
            color="success"
          />
          <span class="text-sm text-slate-700">中文文本</span>
        </div>
      </div>
    `,
  }),
}

// 自定义插槽
export const CustomSlots: Story = {
  render: () => ({
    components: { Switch },
    setup() {
      const value = ref(true)
      return { value }
    },
    template: `
      <div class="flex flex-col gap-4 p-8">
        <div class="flex items-center gap-3">
          <Switch v-model="value" color="success">
            <template #active>
              <svg class="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </template>
            <template #inactive>
              <svg class="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </template>
          </Switch>
          <span class="text-sm text-slate-700">Custom icons</span>
        </div>
      </div>
    `,
  }),
}

// beforeChange 回调
export const BeforeChange: Story = {
  render: () => ({
    components: { Switch },
    setup() {
      const value = ref(false)
      const message = ref('')

      const handleBeforeChange = () => {
        const confirmed = confirm('Are you sure you want to change this setting?')
        message.value = confirmed ? 'Change confirmed' : 'Change cancelled'
        return confirmed
      }

      return { value, handleBeforeChange, message }
    },
    template: `
      <div class="p-8 space-y-4">
        <div class="flex items-center gap-3">
          <Switch
            v-model="value"
            :before-change="handleBeforeChange"
            label="Confirm before change"
            color="warning"
          />
        </div>
        <div v-if="message" class="text-sm text-slate-600">
          {{ message }}
        </div>
        <div class="text-sm text-slate-500">
          Current value: {{ value }}
        </div>
      </div>
    `,
  }),
}

// 实际应用场景
export const RealWorldUsage: Story = {
  render: () => ({
    components: { Switch },
    setup() {
      const settings = ref({
        notifications: true,
        emailAlerts: false,
        darkMode: false,
        autoSave: true,
        publicProfile: false,
      })

      return { settings }
    },
    template: `
      <div class="p-8 max-w-md">
        <h2 class="text-xl font-semibold mb-6">Settings</h2>

        <div class="space-y-6">
          <!-- 通知设置 -->
          <div>
            <h3 class="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
              Notifications
            </h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-700 dark:text-slate-300">Push notifications</span>
                <Switch v-model="settings.notifications" size="sm" />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-700 dark:text-slate-300">Email alerts</span>
                <Switch v-model="settings.emailAlerts" size="sm" color="success" />
              </div>
            </div>
          </div>

          <!-- 外观设置 -->
          <div>
            <h3 class="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
              Appearance
            </h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-700 dark:text-slate-300">Dark mode</span>
                <Switch v-model="settings.darkMode" size="sm" color="primary" />
              </div>
            </div>
          </div>

          <!-- 隐私设置 -->
          <div>
            <h3 class="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
              Privacy
            </h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-700 dark:text-slate-300">Public profile</span>
                <Switch v-model="settings.publicProfile" size="sm" color="warning" />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-700 dark:text-slate-300">Auto-save</span>
                <Switch v-model="settings.autoSave" size="sm" color="success" />
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
    components: { Switch },
    setup() {
      const switches = ref([
        { id: 1, label: 'Feature A', value: true, color: 'primary' as const },
        { id: 2, label: 'Feature B', value: false, color: 'success' as const },
        { id: 3, label: 'Feature C', value: true, color: 'warning' as const },
        { id: 4, label: 'Feature D', value: false, color: 'danger' as const },
      ])

      const toggleAll = (value: boolean) => {
        switches.value.forEach(s => s.value = value)
      }

      const enabledCount = computed(() => switches.value.filter(s => s.value).length)

      return { switches, toggleAll, enabledCount }
    },
    template: `
      <div class="p-8 space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Feature Toggles</h3>
          <div class="flex gap-2">
            <button
              @click="toggleAll(true)"
              class="px-3 py-1 text-sm bg-primary-500 text-white rounded hover:bg-primary-600"
            >
              Enable All
            </button>
            <button
              @click="toggleAll(false)"
              class="px-3 py-1 text-sm bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
            >
              Disable All
            </button>
          </div>
        </div>

        <div class="space-y-3">
          <div
            v-for="item in switches"
            :key="item.id"
            class="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm"
          >
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">
              {{ item.label }}
            </span>
            <Switch :color="item.color" v-model="item.value" />
          </div>
        </div>

        <div class="text-sm text-slate-600 dark:text-slate-400">
          Enabled features: {{ enabledCount }} / {{ switches.length }}
        </div>
      </div>
    `,
  }),
}

// 深色模式
export const DarkMode: Story = {
  render: () => ({
    components: { Switch },
    setup() {
      const values = ref({
        primary: true,
        success: false,
        warning: true,
        danger: false,
      })
      return { values }
    },
    template: `
      <div class="bg-slate-900 p-8 space-y-4">
        <h3 class="text-lg font-semibold text-white">Dark Mode</h3>
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <Switch v-model="values.primary" color="primary" />
            <span class="text-sm text-slate-300">Primary</span>
          </div>
          <div class="flex items-center gap-3">
            <Switch v-model="values.success" color="success" />
            <span class="text-sm text-slate-300">Success</span>
          </div>
          <div class="flex items-center gap-3">
            <Switch v-model="values.warning" color="warning" />
            <span class="text-sm text-slate-300">Warning</span>
          </div>
          <div class="flex items-center gap-3">
            <Switch v-model="values.danger" color="danger" />
            <span class="text-sm text-slate-300">Danger</span>
          </div>
        </div>
      </div>
    `,
  }),
}
