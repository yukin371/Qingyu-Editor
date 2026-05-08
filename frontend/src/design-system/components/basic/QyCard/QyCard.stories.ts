import type { Meta, StoryObj } from '@storybook/vue3'
import QyCard from './QyCard.vue'
import QyButton from '../QyButton/QyButton.vue'
import QyBadge from '../QyBadge/QyBadge.vue'

const meta = {
  title: 'Qingyu Components/Basic/QyCard',
  component: QyCard,
  tags: ['autodocs'],
  args: {
    variant: 'default',
    shadow: 'hover',
    padding: 'md',
    hoverable: false,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'glass', 'outlined', 'elevated'],
    },
    shadow: {
      control: 'select',
      options: ['always', 'hover', 'never'],
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof QyCard>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => ({
    components: { QyCard },
    setup() {
      return { args }
    },
    template: `
      <div class="page-aurora rounded-[2rem] p-8">
        <div class="max-w-lg">
          <QyCard v-bind="args">
            <p class="text-slate-600">Surface tokens now align with Button / Input / Select.</p>
          </QyCard>
        </div>
      </div>
    `,
  }),
}

export const SurfaceShowcase: Story = {
  render: () => ({
    components: { QyCard, QyButton, QyBadge },
    template: `
      <div class="page-aurora rounded-[2rem] p-8">
        <div class="grid gap-5 xl:grid-cols-3">
          <QyCard variant="default" shadow="always">
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-slate-950">Default</h3>
                <QyBadge type="text" text="Base" color="primary" />
              </div>
            </template>
            <p class="text-slate-600">Use for settings, forms and dashboard summaries.</p>
          </QyCard>

          <QyCard variant="glass" shadow="always">
            <template #header>
              <h3 class="text-lg font-semibold text-slate-950">Glass</h3>
            </template>
            <p class="text-slate-600">For hero surfaces and premium overlays.</p>
          </QyCard>

          <QyCard variant="outlined" hoverable>
            <template #header>
              <h3 class="text-lg font-semibold text-slate-950">Outlined</h3>
            </template>
            <p class="text-slate-600">For low-elevation content containers and filter panels.</p>
            <template #footer>
              <QyButton size="sm" variant="outline">Open</QyButton>
            </template>
          </QyCard>
        </div>
      </div>
    `,
  }),
}

export const DashboardComposition: Story = {
  render: () => ({
    components: { QyCard, QyButton, QyBadge },
    template: `
      <div class="page-aurora rounded-[2rem] p-8">
        <div class="max-w-3xl">
          <QyCard variant="elevated" shadow="always">
            <template #header>
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p class="text-xs uppercase tracking-[0.28em] text-slate-400">Foundation KPI</p>
                  <h3 class="mt-2 text-2xl font-semibold text-slate-950">Token adoption</h3>
                </div>
                <QyBadge type="text" text="Ready" color="success" />
              </div>
            </template>
            <div class="grid gap-4 md:grid-cols-3">
              <div class="rounded-3xl bg-white/72 p-4">
                <p class="text-sm text-slate-500">Buttons</p>
                <strong class="text-3xl text-slate-950">88</strong>
              </div>
              <div class="rounded-3xl bg-white/72 p-4">
                <p class="text-sm text-slate-500">Inputs</p>
                <strong class="text-3xl text-slate-950">40</strong>
              </div>
              <div class="rounded-3xl bg-white/72 p-4">
                <p class="text-sm text-slate-500">Dialogs</p>
                <strong class="text-3xl text-slate-950">14</strong>
              </div>
            </div>
            <template #footer>
              <div class="flex justify-end gap-3">
                <QyButton size="sm" variant="ghost">Dismiss</QyButton>
                <QyButton size="sm">Promote to DemoHub</QyButton>
              </div>
            </template>
          </QyCard>
        </div>
      </div>
    `,
  }),
}
