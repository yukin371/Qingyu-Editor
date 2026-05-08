/**
 * Divider 组件 Storybook 故事
 *
 * 用更成体系的布局来展示它在页面容器中创建节奏和层次的能力。
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import Divider from './Divider.vue'

const previewShell =
  'rounded-[32px] border border-slate-100/80 bg-white/80 p-6 shadow-[0_32px_65px_-40px_rgba(15,23,42,0.7)] backdrop-blur-xl'

const meta: Meta<typeof Divider> = {
  title: 'Base/Divider',
  component: Divider,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    direction: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Divider 方向',
    },
    variant: {
      control: 'select',
      options: ['solid', 'dashed', 'dotted'],
      description: 'Divider 线型',
    },
    label: {
      control: 'text',
      description: '标签文字',
    },
  },
  args: {
    direction: 'horizontal',
    variant: 'solid',
    label: undefined,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { Divider },
    template: `
      <div class="min-h-[420px] flex items-center justify-center bg-slate-50/90 p-6">
        <div class="w-full max-w-3xl ${previewShell} space-y-4">
          <div class="text-xs font-semibold tracking-[0.45em] text-slate-500 uppercase">Workspace</div>
          <div class="text-3xl font-semibold text-slate-900">Editorial cadence</div>
          <p class="text-sm text-slate-600 leading-relaxed">
            Keep every decision and story in one place, separated by these calm, tactile dividers that keep content flowing.
          </p>
          <Divider />
          <div class="grid grid-cols-3 gap-3 text-xs text-slate-500">
            <div class="border border-slate-100 rounded-2xl p-3">Draft</div>
            <div class="border border-slate-100 rounded-2xl p-3">Review</div>
            <div class="border border-slate-100 rounded-2xl p-3">Published</div>
          </div>
        </div>
      </div>
    `,
  }),
}

export const SectionLabels: Story = {
  render: () => ({
    components: { Divider },
    template: `
      <div class="min-h-[420px] flex items-center justify-center bg-slate-100 p-6">
        <div class="w-full max-w-4xl rounded-[28px] border border-slate-100 bg-white/80 p-6 space-y-5 shadow-[0_32px_60px_-32px_rgba(15,23,42,0.7)]">
          <div class="text-sm font-semibold text-slate-500 uppercase tracking-[0.3em]">Session notes</div>
          <p class="text-lg font-semibold text-slate-900">Meeting recap</p>
          <Divider label="Highlights" />
          <p class="text-sm text-slate-600 leading-relaxed">
            Key actions and annotations are kept clearly separated without adding visual clutter.
          </p>
          <Divider label="Details" />
          <p class="text-sm text-slate-600 leading-relaxed">
            Lighter content sits below the divider, reinforcing the narrative rhythm.
          </p>
          <Divider label="Next" />
        </div>
      </div>
    `,
  }),
}

export const VerticalSplit: Story = {
  render: () => ({
    components: { Divider },
    template: `
      <div class="min-h-[420px] flex items-center justify-center bg-slate-950/5 p-6">
        <div class="w-full max-w-5xl grid grid-cols-[1fr_auto_1fr] gap-6">
          <div class="rounded-[26px] bg-white/90 border border-slate-100 p-6 shadow-[0_24px_56px_-32px_rgba(15,23,42,0.6)]">
            <p class="text-sm font-semibold text-slate-600">Left column</p>
            <p class="text-base text-slate-900 mt-3">Primary content stream with key actions.</p>
          </div>
          <div class="flex items-center justify-center">
            <Divider direction="vertical" />
          </div>
          <div class="rounded-[26px] bg-white/90 border border-slate-100 p-6 shadow-[0_24px_56px_-32px_rgba(15,23,42,0.6)]">
            <p class="text-sm font-semibold text-slate-600">Right column</p>
            <p class="text-base text-slate-900 mt-3">Secondary timeline, filters, or metadata.</p>
          </div>
        </div>
      </div>
    `,
  }),
}

export const Variants: Story = {
  render: () => ({
    components: { Divider },
    template: `
      <div class="min-h-[520px] flex items-center justify-center bg-slate-50/90 p-6">
        <div class="w-full max-w-4xl grid gap-6">
          <div class="rounded-[24px] border border-slate-100 bg-white/80 p-6 space-y-3">
            <div class="text-xs uppercase tracking-[0.4em] text-slate-500">Solid</div>
            <Divider variant="solid" />
          </div>
          <div class="rounded-[24px] border border-slate-100 bg-white/80 p-6 space-y-3">
            <div class="text-xs uppercase tracking-[0.4em] text-slate-500">Dashed</div>
            <Divider variant="dashed" />
          </div>
          <div class="rounded-[24px] border border-slate-100 bg-white/80 p-6 space-y-3">
            <div class="text-xs uppercase tracking-[0.4em] text-slate-500">Dotted</div>
            <Divider variant="dotted" />
          </div>
        </div>
      </div>
    `,
  }),
}
