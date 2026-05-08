import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import QyInput from './QyInput.vue'

const meta = {
  title: 'Qingyu Components/Basic/QyInput',
  component: QyInput,
  tags: ['autodocs'],
  args: {
    size: 'md',
    state: 'default',
    disabled: false,
    clearable: false,
    placeholder: 'Enter a value',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    state: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error'],
    },
  },
} satisfies Meta<typeof QyInput>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { QyInput },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: `
      <div class="page-aurora rounded-[2rem] p-8">
        <div class="max-w-md">
          <QyInput v-bind="args" v-model="value" />
        </div>
      </div>
    `,
  }),
}

export const StateCollection: Story = {
  render: () => ({
    components: { QyInput },
    setup() {
      const search = ref('Foundation')
      const success = ref('Validated')
      const warning = ref('Needs review')
      const error = ref('Missing field')
      const password = ref('open-sesame')
      return { search, success, warning, error, password }
    },
    template: `
      <div class="page-aurora rounded-[2rem] p-8">
        <div class="grid gap-4 md:grid-cols-2">
          <QyInput v-model="search" placeholder="Search stories" clearable />
          <QyInput v-model="success" state="success" placeholder="Validated" />
          <QyInput v-model="warning" state="warning" placeholder="Needs review" />
          <QyInput v-model="error" state="error" placeholder="Missing field" />
          <QyInput v-model="password" type="password" placeholder="Password" />
          <QyInput model-value="Read only" disabled />
        </div>
      </div>
    `,
  }),
}

export const SizeScale: Story = {
  render: () => ({
    components: { QyInput },
    setup() {
      return {
        sm: ref('Small'),
        md: ref('Medium'),
        lg: ref('Large'),
      }
    },
    template: `
      <div class="page-aurora rounded-[2rem] p-8">
        <div class="max-w-xl space-y-4">
          <QyInput v-model="sm" size="sm" />
          <QyInput v-model="md" size="md" />
          <QyInput v-model="lg" size="lg" />
        </div>
      </div>
    `,
  }),
}
