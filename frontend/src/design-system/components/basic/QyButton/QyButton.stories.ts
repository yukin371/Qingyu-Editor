import type { Meta, StoryObj } from '@storybook/vue3'
import QyButton from './QyButton.vue'

const meta = {
  title: 'Qingyu Components/Basic/QyButton',
  component: QyButton,
  tags: ['autodocs'],
  args: {
    variant: 'primary',
    size: 'md',
    stateLayer: 'none',
    disabled: false,
    loading: false,
    block: false,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'outline', 'text', 'danger', 'gradient'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    stateLayer: {
      control: 'select',
      options: ['none', 'hover', 'focus'],
    },
  },
} satisfies Meta<typeof QyButton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { QyButton },
    setup() {
      return { args }
    },
    template: `
      <div class="page-aurora rounded-[2rem] p-8">
        <QyButton v-bind="args">Replace Element Button</QyButton>
      </div>
    `,
  }),
}

export const VariantMatrix: Story = {
  render: () => ({
    components: { QyButton },
    template: `
      <div class="page-aurora rounded-[2rem] p-8">
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <QyButton variant="primary">Primary</QyButton>
          <QyButton variant="secondary">Secondary</QyButton>
          <QyButton variant="gradient">Gradient</QyButton>
          <QyButton variant="danger">Danger</QyButton>
          <QyButton variant="ghost">Ghost</QyButton>
          <QyButton variant="outline">Outline</QyButton>
          <QyButton variant="text">Text</QyButton>
          <QyButton :loading="true">Saving</QyButton>
        </div>
      </div>
    `,
  }),
}

export const SizeAndBlock: Story = {
  render: () => ({
    components: { QyButton },
    template: `
      <div class="page-aurora rounded-[2rem] p-8">
        <div class="flex flex-wrap items-center gap-4">
          <QyButton size="xs">XS</QyButton>
          <QyButton size="sm">SM</QyButton>
          <QyButton size="md">MD</QyButton>
          <QyButton size="lg">LG</QyButton>
          <QyButton size="xl">XL</QyButton>
        </div>
        <div class="mt-6 max-w-md">
          <QyButton block variant="secondary">Block Button</QyButton>
        </div>
      </div>
    `,
  }),
}
