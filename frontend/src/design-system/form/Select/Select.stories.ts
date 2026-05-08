import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { QySelect } from './index'

const meta = {
  title: 'Qingyu Components/Form/QySelect',
  component: QySelect,
  tags: ['autodocs'],
  args: {
    placeholder: 'Choose a priority',
    size: 'md',
    clearable: true,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof QySelect>

export default meta
type Story = StoryObj<typeof meta>

const options = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
]

export const Playground: Story = {
  render: (args) => ({
    components: { QySelect },
    setup() {
      const value = ref('')
      return { args, value, options }
    },
    template: `
      <div class="page-aurora rounded-[2rem] p-8">
        <div class="max-w-sm">
          <QySelect v-bind="args" :options="options" v-model="value" />
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: '聚焦 Apple 风格表面、Material 3 层级和键盘可访问性的基础选择器。',
      },
    },
  },
}

export const FoundationStates: Story = {
  render: () => ({
    components: { QySelect },
    setup() {
      const primary = ref('medium')
      const empty = ref('')
      const disabled = ref('high')
      return { options, primary, empty, disabled }
    },
    template: `
      <div class="page-aurora rounded-[2rem] p-8">
        <div class="grid max-w-3xl gap-4 md:grid-cols-3">
          <div class="space-y-2">
            <p class="text-sm font-medium text-slate-600">Selected</p>
            <QySelect :options="options" v-model="primary" clearable />
          </div>
          <div class="space-y-2">
            <p class="text-sm font-medium text-slate-600">Placeholder</p>
            <QySelect :options="options" v-model="empty" />
          </div>
          <div class="space-y-2">
            <p class="text-sm font-medium text-slate-600">Disabled</p>
            <QySelect :options="options" v-model="disabled" disabled />
          </div>
        </div>
      </div>
    `,
  }),
}

export const SizeScaleAndDisabledOption: Story = {
  render: () => ({
    components: { QySelect },
    setup() {
      const sm = ref('')
      const md = ref('feature')
      const lg = ref('')
      const mixedOptions = [
        { label: 'Feature', value: 'feature' },
        { label: 'Experiment', value: 'experiment' },
        { label: 'Deprecated', value: 'deprecated', disabled: true },
      ]
      return { sm, md, lg, mixedOptions }
    },
    template: `
      <div class="page-aurora rounded-[2rem] p-8">
        <div class="max-w-xl space-y-4">
          <QySelect size="sm" :options="mixedOptions" v-model="sm" placeholder="Small" />
          <QySelect size="md" :options="mixedOptions" v-model="md" placeholder="Medium" />
          <QySelect size="lg" :options="mixedOptions" v-model="lg" placeholder="Large" />
        </div>
      </div>
    `,
  }),
}
