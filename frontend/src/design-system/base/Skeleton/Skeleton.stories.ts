/**
 * Skeleton 组件 Storybook 故事
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import Skeleton from './Skeleton.vue'

const previewShell =
  'rounded-[30px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(191,219,254,0.34),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.97),rgba(248,250,252,0.95))] p-6 shadow-[0_28px_52px_-30px_rgba(15,23,42,0.28)] dark:border-slate-700/50 dark:bg-[radial-gradient(circle_at_top_left,rgba(30,58,95,0.4),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.97),rgba(15,23,42,0.95))]'

const cardRow =
  'rounded-2xl border border-white/80 bg-white/84 px-4 py-3 dark:border-slate-700/40 dark:bg-slate-800/60'

const meta = {
  title: 'Base/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'circle', 'rect', 'avatar', 'image'],
      description: 'Skeleton 类型',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Skeleton 尺寸',
    },
    width: {
      control: 'text',
      description: '自定义宽度',
    },
    height: {
      control: 'text',
      description: '自定义高度',
    },
    animated: {
      control: 'boolean',
      description: '是否显示动画',
    },
  },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

/** 默认骨架 - 可通过 Controls 面板调节所有属性 */
export const Default: Story = {
  args: {
    type: 'text',
    size: 'md',
    animated: true,
  },
  render: (args) => ({
    components: { Skeleton },
    setup() {
      return { args }
    },
    template: `
      <div :class="'${previewShell}'">
        <Skeleton v-bind="args" />
      </div>
    `,
  }),
}

/** 5 种类型并排展示 */
export const Types: Story = {
  render: () => ({
    components: { Skeleton },
    template: `
      <div :class="'${previewShell}'">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <div :class="'${cardRow} flex flex-col items-center gap-3'">
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Text</span>
            <Skeleton type="text" size="md" class="w-full" />
          </div>
          <div :class="'${cardRow} flex flex-col items-center gap-3'">
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Circle</span>
            <Skeleton type="circle" size="md" />
          </div>
          <div :class="'${cardRow} flex flex-col items-center gap-3'">
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Rect</span>
            <Skeleton type="rect" size="md" />
          </div>
          <div :class="'${cardRow} flex flex-col items-center gap-3'">
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Avatar</span>
            <Skeleton type="avatar" size="md" />
          </div>
          <div :class="'${cardRow} flex flex-col items-center gap-3'">
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Image</span>
            <Skeleton type="image" size="md" />
          </div>
        </div>
      </div>
    `,
  }),
}

/** 每种类型的 5 个尺寸 */
export const Sizes: Story = {
  render: () => ({
    components: { Skeleton },
    template: `
      <div :class="'${previewShell}'">
        <div class="space-y-8">
          <!-- Text -->
          <section>
            <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Text</h3>
            <div :class="'${cardRow} space-y-2'">
              <div class="flex items-center gap-3" v-for="s in ['xs','sm','md','lg','xl']" :key="'t-'+s">
                <Skeleton type="text" :size="s" class="flex-1" />
                <span class="w-8 text-right text-xs text-slate-400 dark:text-slate-500">{{ s }}</span>
              </div>
            </div>
          </section>
          <!-- Circle -->
          <section>
            <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Circle</h3>
            <div :class="'${cardRow} flex items-end gap-4'">
              <div v-for="s in ['xs','sm','md','lg','xl']" :key="'c-'+s" class="flex flex-col items-center gap-1">
                <Skeleton type="circle" :size="s" />
                <span class="text-xs text-slate-400 dark:text-slate-500">{{ s }}</span>
              </div>
            </div>
          </section>
          <!-- Rect -->
          <section>
            <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Rect</h3>
            <div :class="'${cardRow} flex items-end gap-4'">
              <div v-for="s in ['xs','sm','md','lg','xl']" :key="'r-'+s" class="flex flex-col items-center gap-1">
                <Skeleton type="rect" :size="s" />
                <span class="text-xs text-slate-400 dark:text-slate-500">{{ s }}</span>
              </div>
            </div>
          </section>
          <!-- Avatar -->
          <section>
            <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Avatar</h3>
            <div :class="'${cardRow} flex items-end gap-4'">
              <div v-for="s in ['xs','sm','md','lg','xl']" :key="'a-'+s" class="flex flex-col items-center gap-1">
                <Skeleton type="avatar" :size="s" />
                <span class="text-xs text-slate-400 dark:text-slate-500">{{ s }}</span>
              </div>
            </div>
          </section>
          <!-- Image -->
          <section>
            <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Image</h3>
            <div :class="'${cardRow} flex items-end gap-4'">
              <div v-for="s in ['xs','sm','md','lg','xl']" :key="'i-'+s" class="flex flex-col items-center gap-1">
                <Skeleton type="image" :size="s" />
                <span class="text-xs text-slate-400 dark:text-slate-500">{{ s }}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    `,
  }),
}

/** 自定义宽高 */
export const CustomSize: Story = {
  render: () => ({
    components: { Skeleton },
    template: `
      <div :class="'${previewShell}'">
        <div :class="'${cardRow} space-y-4'">
          <div>
            <Skeleton type="text" width="200px" height="20px" />
            <p class="mt-1 text-xs text-slate-400 dark:text-slate-500">200px x 20px</p>
          </div>
          <div class="flex items-center gap-3">
            <Skeleton type="circle" width="48px" height="48px" />
            <div class="flex-1">
              <Skeleton type="text" width="60%" height="14px" />
              <Skeleton type="text" width="40%" height="12px" class="mt-2" />
            </div>
            <span class="text-xs text-slate-400 dark:text-slate-500 shrink-0">Circle 48px + Text</span>
          </div>
          <div>
            <Skeleton type="rect" width="100%" height="100px" />
            <p class="mt-1 text-xs text-slate-400 dark:text-slate-500">100% x 100px</p>
          </div>
        </div>
      </div>
    `,
  }),
}

/** 无动画版本 */
export const Static: Story = {
  render: () => ({
    components: { Skeleton },
    template: `
      <div :class="'${previewShell}'">
        <div :class="'${cardRow} space-y-3'">
          <div class="flex items-center gap-3">
            <Skeleton type="avatar" size="md" :animated="false" />
            <div class="flex-1 space-y-2">
              <Skeleton type="text" size="md" :animated="false" />
              <Skeleton type="text" size="sm" width="60%" :animated="false" />
            </div>
          </div>
          <Skeleton type="text" size="md" :animated="false" />
          <Skeleton type="text" size="md" :animated="false" />
          <Skeleton type="text" size="md" width="45%" :animated="false" />
        </div>
      </div>
    `,
  }),
}

/** 真实场景：用户卡片骨架 */
export const UserCardSkeleton: Story = {
  render: () => ({
    components: { Skeleton },
    template: `
      <div :class="'${previewShell} max-w-sm'">
        <div :class="'${cardRow}'">
          <div class="flex items-center gap-4">
            <Skeleton type="avatar" size="xl" />
            <div class="flex-1 space-y-2">
              <Skeleton type="text" size="lg" />
              <Skeleton type="text" size="sm" width="60%" />
            </div>
          </div>
          <div class="mt-4 space-y-2">
            <Skeleton type="text" size="md" />
            <Skeleton type="text" size="md" />
            <Skeleton type="text" size="md" width="45%" />
          </div>
        </div>
      </div>
    `,
  }),
}

/** 真实场景：文章卡片骨架 */
export const ArticleCardSkeleton: Story = {
  render: () => ({
    components: { Skeleton },
    template: `
      <div :class="'${previewShell} max-w-md'">
        <div :class="'${cardRow} !p-0 overflow-hidden'">
          <Skeleton type="image" height="180px" />
          <div class="space-y-3 p-4">
            <Skeleton type="text" size="xl" />
            <div class="space-y-2">
              <Skeleton type="text" size="md" />
              <Skeleton type="text" size="md" />
              <Skeleton type="text" size="md" width="65%" />
            </div>
            <div class="flex items-center gap-3 pt-1">
              <Skeleton type="avatar" size="xs" />
              <Skeleton type="text" size="sm" width="90px" />
              <Skeleton type="text" size="xs" width="60px" class="ml-auto" />
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

/** 真实场景：列表骨架 */
export const ListSkeleton: Story = {
  render: () => ({
    components: { Skeleton },
    template: `
      <div :class="'${previewShell} max-w-md'">
        <div :class="'${cardRow} space-y-3'">
          <div v-for="i in 5" :key="i" class="flex items-center gap-3">
            <Skeleton type="avatar" size="md" />
            <div class="flex-1 space-y-1.5">
              <Skeleton type="text" size="md" />
              <Skeleton type="text" size="sm" width="55%" />
            </div>
            <Skeleton type="text" size="xs" width="48px" />
          </div>
        </div>
      </div>
    `,
  }),
}

/** 真实场景：仪表盘骨架 */
export const DashboardSkeleton: Story = {
  render: () => ({
    components: { Skeleton },
    template: `
      <div :class="'${previewShell}'">
        <!-- 统计卡片行 -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div v-for="i in 3" :key="'stat-'+i" :class="'${cardRow}'">
            <div class="flex items-center justify-between">
              <div class="space-y-2 flex-1">
                <Skeleton type="text" size="sm" width="50%" />
                <Skeleton type="text" size="xl" width="70%" />
              </div>
              <Skeleton type="circle" size="sm" />
            </div>
          </div>
        </div>

        <!-- 图表占位 -->
        <div :class="'${cardRow} mt-4'">
          <div class="mb-4 flex items-center justify-between">
            <Skeleton type="text" size="lg" width="120px" />
            <div class="flex gap-2">
              <Skeleton type="text" size="xs" width="48px" />
              <Skeleton type="text" size="xs" width="48px" />
              <Skeleton type="text" size="xs" width="48px" />
            </div>
          </div>
          <Skeleton type="rect" height="200px" class="w-full" />
        </div>

        <!-- 列表行 -->
        <div :class="'${cardRow} mt-4 space-y-3'">
          <div class="mb-2 flex items-center justify-between">
            <Skeleton type="text" size="lg" width="100px" />
            <Skeleton type="text" size="xs" width="64px" />
          </div>
          <div v-for="i in 3" :key="'row-'+i" class="flex items-center gap-3">
            <Skeleton type="circle" size="sm" />
            <div class="flex-1 space-y-1.5">
              <Skeleton type="text" size="md" />
              <Skeleton type="text" size="xs" width="50%" />
            </div>
            <Skeleton type="text" size="sm" width="64px" />
          </div>
        </div>
      </div>
    `,
  }),
}
