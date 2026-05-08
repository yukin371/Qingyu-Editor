import type { Meta, StoryObj } from '@storybook/vue3'
import { ref, computed } from 'vue'
import Checkbox from './Checkbox.vue'
import CheckboxGroup from './CheckboxGroup.vue'

/**
 * Checkbox 组件 Storybook 故事
 *
 * 展示所有尺寸、颜色和状态
 */

const meta = {
  title: 'Design System/Base/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'boolean',
      description: 'v-model 绑定值',
    },
    value: {
      control: 'text',
      description: '复选框的值',
    },
    label: {
      control: 'text',
      description: '标签文本',
    },
    disabled: {
      control: 'boolean',
      description: '禁用状态',
    },
    indeterminate: {
      control: 'boolean',
      description: '半选状态',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '复选框尺寸',
    },
    color: {
      control: 'select',
      options: ['primary', 'success', 'warning', 'danger'],
      description: '复选框颜色',
    },
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

// 默认故事
interface CheckboxArgs {
  modelValue?: boolean
  label?: string
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'success' | 'warning' | 'danger'
}

export const Default: Story = {
  args: {
    modelValue: false,
    label: '记住我',
    size: 'md',
    color: 'primary',
  },
  render: (args: CheckboxArgs) => ({
    components: { Checkbox },
    setup() {
      const checked = ref(args.modelValue ?? false)
      return { args, checked }
    },
    template: `
      <Checkbox v-model="checked" :label="args.label" :size="args.size" :color="args.color">
        {{ args.label }}
      </Checkbox>
      <div class="mt-2 text-sm text-slate-500">当前值: {{ checked }}</div>
    `,
  }),
}

// 所有尺寸
export const AllSizes: Story = {
  render: () => ({
    components: { Checkbox },
    setup() {
      const sizes = ref({ sm: false, md: false, lg: false })
      return { sizes }
    },
    template: `
      <div class="flex flex-col gap-4 p-8">
        <Checkbox v-model="sizes.sm" size="sm" label="小尺寸 (sm)" />
        <Checkbox v-model="sizes.md" size="md" label="中尺寸 (md)" />
        <Checkbox v-model="sizes.lg" size="lg" label="大尺寸 (lg)" />
      </div>
    `,
  }),
}

// 所有颜色
export const AllColors: Story = {
  render: () => ({
    components: { Checkbox },
    setup() {
      const colors = ref({ primary: false, success: false, warning: false, danger: false })
      return { colors }
    },
    template: `
      <div class="flex flex-col gap-4 p-8">
        <Checkbox v-model="colors.primary" color="primary" label="Primary" />
        <Checkbox v-model="colors.success" color="success" label="Success" />
        <Checkbox v-model="colors.warning" color="warning" label="Warning" />
        <Checkbox v-model="colors.danger" color="danger" label="Danger" />
      </div>
    `,
  }),
}

// 状态
export const States: Story = {
  render: () => ({
    components: { Checkbox },
    template: `
      <div class="flex flex-col gap-4 p-8">
        <Checkbox :model-value="true" label="选中状态" />
        <Checkbox :model-value="false" label="未选中状态" />
        <Checkbox :model-value="false" :indeterminate="true" label="半选状态" />
        <Checkbox :model-value="false" :disabled="true" label="禁用状态" />
        <Checkbox :model-value="true" :disabled="true" label="禁用选中状态" />
      </div>
    `,
  }),
}

// 带标签
export const WithLabel: Story = {
  render: () => ({
    components: { Checkbox },
    setup() {
      const terms = ref(false)
      const newsletter = ref(true)
      return { terms, newsletter }
    },
    template: `
      <div class="flex flex-col gap-4 p-8">
        <Checkbox v-model="terms" label="我同意服务条款和隐私政策" />
        <Checkbox v-model="newsletter" label="订阅我们的新闻通讯" />
      </div>
    `,
  }),
}

// 复选框组 - 水平
export const CheckboxGroupHorizontal: Story = {
  render: () => ({
    components: { CheckboxGroup, Checkbox },
    setup() {
      const fruits = ref(['apple'])
      return { fruits }
    },
    template: `
      <div class="p-8">
        <h3 class="text-lg font-semibold mb-4">选择你喜欢的水果（可多选）</h3>
        <CheckboxGroup v-model="fruits">
          <Checkbox value="apple" label="苹果" />
          <Checkbox value="banana" label="香蕉" />
          <Checkbox value="orange" label="橙子" />
          <Checkbox value="grape" label="葡萄" />
        </CheckboxGroup>
        <div class="mt-4 text-sm text-slate-500">已选择: {{ fruits.join(', ') }}</div>
      </div>
    `,
  }),
}

// 复选框组 - 垂直
export const CheckboxGroupVertical: Story = {
  render: () => ({
    components: { CheckboxGroup, Checkbox },
    setup() {
      const features = ref<string[]>([])
      return { features }
    },
    template: `
      <div class="p-8">
        <h3 class="text-lg font-semibold mb-4">选择你需要的功能（可多选）</h3>
        <CheckboxGroup v-model="features" vertical>
          <Checkbox value="dashboard" label="仪表盘" />
          <Checkbox value="analytics" label="数据分析" />
          <Checkbox value="reports" label="报表生成" />
          <Checkbox value="notifications" label="消息通知" />
          <Checkbox value="api" label="API 访问" />
        </CheckboxGroup>
        <div class="mt-4 text-sm text-slate-500">已选择: {{ features.join(', ') || '无' }}</div>
      </div>
    `,
  }),
}

// 复选框组 - 不同尺寸
export const CheckboxGroupSizes: Story = {
  render: () => ({
    components: { CheckboxGroup, Checkbox },
    setup() {
      const itemsSm = ref<string[]>([])
      const itemsMd = ref(['b'])
      const itemsLg = ref(['a', 'c'])
      return { itemsSm, itemsMd, itemsLg }
    },
    template: `
      <div class="p-8 space-y-8">
        <div>
          <h4 class="text-md font-semibold mb-2">小尺寸</h4>
          <CheckboxGroup v-model="itemsSm" size="sm">
            <Checkbox value="a" label="选项 A" />
            <Checkbox value="b" label="选项 B" />
            <Checkbox value="c" label="选项 C" />
          </CheckboxGroup>
        </div>
        <div>
          <h4 class="text-md font-semibold mb-2">中尺寸（默认）</h4>
          <CheckboxGroup v-model="itemsMd" size="md">
            <Checkbox value="a" label="选项 A" />
            <Checkbox value="b" label="选项 B" />
            <Checkbox value="c" label="选项 C" />
          </CheckboxGroup>
        </div>
        <div>
          <h4 class="text-md font-semibold mb-2">大尺寸</h4>
          <CheckboxGroup v-model="itemsLg" size="lg">
            <Checkbox value="a" label="选项 A" />
            <Checkbox value="b" label="选项 B" />
            <Checkbox value="c" label="选项 C" />
          </CheckboxGroup>
        </div>
      </div>
    `,
  }),
}

// 复选框组 - 禁用状态
export const CheckboxGroupDisabled: Story = {
  render: () => ({
    components: { CheckboxGroup, Checkbox },
    setup() {
      const items = ref(['a', 'c'])
      return { items }
    },
    template: `
      <div class="p-8">
        <h3 class="text-lg font-semibold mb-4">禁用的复选框组</h3>
        <CheckboxGroup v-model="items" :disabled="true">
          <Checkbox value="a" label="选项 A" />
          <Checkbox value="b" label="选项 B" />
          <Checkbox value="c" label="选项 C" />
        </CheckboxGroup>
      </div>
    `,
  }),
}

// 全选/取消全选示例
export const SelectAll: Story = {
  render: () => ({
    components: { CheckboxGroup, Checkbox },
    setup() {
      const options = ['apple', 'banana', 'orange', 'grape']
      const selected = ref<string[]>([])

      const allSelected = computed(
        () => selected.value.length === options.length && options.length > 0,
      )
      const indeterminate = computed(
        () => selected.value.length > 0 && selected.value.length < options.length,
      )

      const toggleAll = () => {
        if (allSelected.value) {
          selected.value = []
        } else {
          selected.value = [...options]
        }
      }

      return { options, selected, allSelected, indeterminate, toggleAll }
    },
    template: `
      <div class="p-8">
        <h3 class="text-lg font-semibold mb-4">全选/取消全选示例</h3>
        <div class="mb-4">
          <Checkbox
            :model-value="allSelected"
            :indeterminate="indeterminate"
            label="全选"
            @change="toggleAll"
          />
        </div>
        <CheckboxGroup v-model="selected">
          <Checkbox v-for="option in options" :key="option" :value="option" :label="option" />
        </CheckboxGroup>
        <div class="mt-4 text-sm text-slate-500">
          已选择 {{ selected.length }} / {{ options.length }} 项
        </div>
      </div>
    `,
  }),
}

// 交互示例
export const Interactive: Story = {
  render: () => ({
    components: { CheckboxGroup, Checkbox },
    setup() {
      const preferences = ref({
        darkMode: false,
        notifications: true,
        autoSave: true,
        analytics: false,
      })

      return { preferences }
    },
    template: `
      <div class="p-8">
        <h3 class="text-lg font-semibold mb-4">用户偏好设置</h3>
        <div class="space-y-3">
          <Checkbox v-model="preferences.darkMode" label="深色模式" />
          <Checkbox v-model="preferences.notifications" label="启用通知" />
          <Checkbox v-model="preferences.autoSave" label="自动保存" />
          <Checkbox v-model="preferences.analytics" label="匿名使用统计" />
        </div>
        <pre class="mt-4 p-4 bg-slate-100 rounded text-sm">{{ JSON.stringify(preferences.value, null, 2) }}</pre>
      </div>
    `,
  }),
}
