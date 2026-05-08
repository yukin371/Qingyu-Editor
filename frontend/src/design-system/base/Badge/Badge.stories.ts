/**
 * Badge 组件 Storybook 故事
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import Badge from './Badge.vue'

const previewShell =
  'rounded-[30px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(191,219,254,0.34),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.97),rgba(248,250,252,0.95))] p-6 shadow-[0_28px_52px_-30px_rgba(15,23,42,0.28)]'

const meta = {
  title: 'Base/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'danger'],
      description: 'Badge 变体',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Badge 尺寸',
    },
    content: {
      control: 'text',
      description: 'Badge 内容',
    },
    max: {
      control: 'number',
      description: '最大显示值',
    },
    dot: {
      control: 'boolean',
      description: '是否显示为点',
    },
    absolute: {
      control: 'boolean',
      description: '是否绝对定位到宿主元素',
    },
  },
  args: {
    variant: 'primary',
    size: 'md',
    content: 12,
    max: 99,
    dot: false,
    absolute: false,
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { Badge },
    setup() {
      return { args, previewShell }
    },
    template: `
      <div :class="previewShell" class="min-w-[320px]">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-semibold text-slate-900">Unread updates</p>
            <p class="mt-1 text-sm text-slate-500">A softer count badge that stays readable without shouting.</p>
          </div>
          <Badge v-bind="args" />
        </div>
      </div>
    `,
  }),
}

export const Variants: Story = {
  render: () => ({
    components: { Badge },
    setup() {
      return { previewShell }
    },
    template: `
      <div :class="previewShell" class="min-w-[520px]">
        <div class="flex flex-wrap gap-3">
          <Badge variant="default" content="Draft" />
          <Badge variant="primary" content="Review" />
          <Badge variant="success" content="Ready" />
          <Badge variant="warning" content="Pending" />
          <Badge variant="danger" content="Blocked" />
        </div>
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { Badge },
    setup() {
      return { previewShell }
    },
    template: `
      <div :class="previewShell" class="min-w-[460px]">
        <div class="space-y-4">
          <div class="flex items-center justify-between rounded-2xl border border-white/80 bg-white/84 px-4 py-3">
            <p class="text-sm text-slate-600">Compact toolbar count</p>
            <Badge size="sm" content="8" />
          </div>
          <div class="flex items-center justify-between rounded-2xl border border-white/80 bg-white/84 px-4 py-3">
            <p class="text-sm text-slate-600">Default list count</p>
            <Badge size="md" variant="primary" content="24" />
          </div>
          <div class="flex items-center justify-between rounded-2xl border border-white/80 bg-white/84 px-4 py-3">
            <p class="text-sm text-slate-600">Prominent inbox marker</p>
            <Badge size="lg" variant="danger" content="99+" />
          </div>
        </div>
      </div>
    `,
  }),
}

export const Dots: Story = {
  render: () => ({
    components: { Badge },
    setup() {
      return { previewShell }
    },
    template: `
      <div :class="previewShell" class="min-w-[500px]">
        <div class="space-y-3">
          <div class="flex items-center justify-between rounded-2xl border border-white/80 bg-white/84 px-4 py-3">
            <div>
              <p class="text-sm font-medium text-slate-900">Sync status</p>
              <p class="text-xs text-slate-500">Background worker is active.</p>
            </div>
            <Badge variant="success" :dot="true" />
          </div>
          <div class="flex items-center justify-between rounded-2xl border border-white/80 bg-white/84 px-4 py-3">
            <div>
              <p class="text-sm font-medium text-slate-900">Moderation queue</p>
              <p class="text-xs text-slate-500">Needs review before publishing.</p>
            </div>
            <Badge variant="warning" :dot="true" />
          </div>
          <div class="flex items-center justify-between rounded-2xl border border-white/80 bg-white/84 px-4 py-3">
            <div>
              <p class="text-sm font-medium text-slate-900">Deployment health</p>
              <p class="text-xs text-slate-500">One service is still degraded.</p>
            </div>
            <Badge variant="danger" :dot="true" />
          </div>
        </div>
      </div>
    `,
  }),
}

export const Attached: Story = {
  render: () => ({
    components: { Badge },
    setup() {
      return { previewShell }
    },
    template: `
      <div :class="previewShell" class="min-w-[520px]">
        <div class="flex gap-4">
          <div class="relative flex h-16 flex-1 items-center justify-center rounded-[22px] border border-white/80 bg-white/84 text-sm font-medium text-slate-700">
            Inbox
            <Badge variant="danger" :content="6" :absolute="true" />
          </div>
          <div class="relative flex h-16 flex-1 items-center justify-center rounded-[22px] border border-white/80 bg-white/84 text-sm font-medium text-slate-700">
            Comments
            <Badge variant="primary" :content="18" :absolute="true" />
          </div>
          <div class="relative flex h-16 flex-1 items-center justify-center rounded-[22px] border border-white/80 bg-white/84 text-sm font-medium text-slate-700">
            Health
            <Badge variant="success" :dot="true" :absolute="true" />
          </div>
        </div>
      </div>
    `,
  }),
}

export const Overflow: Story = {
  render: () => ({
    components: { Badge },
    setup() {
      return { previewShell }
    },
    template: `
      <div :class="previewShell" class="min-w-[520px]">
        <div class="grid grid-cols-3 gap-4">
          <div class="rounded-[22px] border border-white/80 bg-white/84 p-4 text-center">
            <p class="text-xs uppercase tracking-[0.12em] text-slate-400">9 max</p>
            <div class="mt-3 flex justify-center">
              <Badge variant="default" :content="56" :max="9" />
            </div>
          </div>
          <div class="rounded-[22px] border border-white/80 bg-white/84 p-4 text-center">
            <p class="text-xs uppercase tracking-[0.12em] text-slate-400">99 max</p>
            <div class="mt-3 flex justify-center">
              <Badge variant="primary" :content="146" :max="99" />
            </div>
          </div>
          <div class="rounded-[22px] border border-white/80 bg-white/84 p-4 text-center">
            <p class="text-xs uppercase tracking-[0.12em] text-slate-400">999 max</p>
            <div class="mt-3 flex justify-center">
              <Badge variant="success" :content="1280" :max="999" />
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

export const NotificationRail: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <div class="w-[640px] rounded-[32px] border border-slate-200/70 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] p-6 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.28)]">
        <div class="mb-5 flex items-center justify-between">
          <div>
            <p class="text-sm font-semibold text-slate-900">Notification rail</p>
            <p class="mt-1 text-sm text-slate-500">Badges used as counts, states and attached indicators within one surface.</p>
          </div>
          <Badge variant="default" content="Live" />
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between rounded-[24px] border border-white/80 bg-white/86 px-4 py-3">
            <div>
              <p class="text-sm font-medium text-slate-900">Reader feedback</p>
              <p class="text-xs text-slate-500">New comments arrived from three chapters.</p>
            </div>
            <Badge variant="primary" :content="12" />
          </div>
          <div class="flex items-center justify-between rounded-[24px] border border-white/80 bg-white/86 px-4 py-3">
            <div>
              <p class="text-sm font-medium text-slate-900">Moderation queue</p>
              <p class="text-xs text-slate-500">Two reports are still waiting for review.</p>
            </div>
            <Badge variant="warning" content="Pending" />
          </div>
          <div class="flex items-center justify-between rounded-[24px] border border-white/80 bg-white/86 px-4 py-3">
            <div>
              <p class="text-sm font-medium text-slate-900">Build health</p>
              <p class="text-xs text-slate-500">All checks passed after the latest UI pass.</p>
            </div>
            <Badge variant="success" :dot="true" />
          </div>
        </div>
      </div>
    `,
  }),
}
