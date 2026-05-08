// @ts-nocheck - Storybook file with flexible type assertions
import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import Icon from './Icon.vue'

// 所有已注册的图标名称（与 iconSvgMap 保持同步）
const registeredIcons = [
  'home', 'user', 'document', 'folder', 'plus', 'minus', 'check',
  'x-mark', 'pencil', 'trash', 'arrow-down', 'arrow-up', 'arrow-left',
  'arrow-right', 'chevron-down', 'chevron-up', 'chevron-left', 'chevron-right',
  'magnifying-glass', 'cog-6-tooth', 'bell', 'heart', 'star',
  'lock-closed', 'information-circle', 'book-open', 'photo',
]

// 预览容器：tonal 背景卡片
const previewShell =
  'rounded-[30px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(191,219,254,0.34),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.97),rgba(248,250,252,0.95))] p-6 shadow-[0_28px_52px_-30px_rgba(15,23,42,0.28)] dark:border-slate-700/50 dark:bg-[radial-gradient(circle_at_top_left,rgba(30,58,95,0.4),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.97),rgba(15,23,42,0.95))]'

// 内联卡片行
const cardRow =
  'rounded-2xl border border-white/80 bg-white/84 px-4 py-3 dark:border-slate-700/40 dark:bg-slate-800/60'

const meta = {
  title: 'Base/Icon',
  component: Icon,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    name: {
      control: 'select',
      options: registeredIcons,
      description: '图标名称',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: '图标尺寸',
    },
    variant: {
      control: 'select',
      options: ['solid', 'outline'],
      description: '图标变体',
    },
    ariaLabel: {
      control: 'text',
      description: 'ARIA 标签',
    },
  },
  args: {
    name: 'home',
    size: 'md',
    variant: 'outline',
  },
} satisfies Meta<typeof Icon>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ────────────────────────────────────────────────────────────────
export const Default: Story = {
  render: (args) => ({
    components: { Icon },
    setup() {
      return { args, previewShell }
    },
    template: `
      <div :class="previewShell" class="min-w-[320px]">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100/80 dark:bg-slate-700/40">
            <Icon v-bind="args" />
          </div>
          <div>
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">Icon playground</p>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Use the controls below to explore icon variants, sizes and names.</p>
          </div>
        </div>
      </div>
    `,
  }),
}

// ─── IconGrid ───────────────────────────────────────────────────────────────
export const IconGrid: Story = {
  render: () => ({
    components: { Icon },
    setup() {
      return { registeredIcons, previewShell }
    },
    template: `
      <div :class="previewShell" class="min-w-[680px] space-y-6">
        <div>
          <p class="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Outline</p>
          <div class="grid grid-cols-7 gap-2">
            <div v-for="name in registeredIcons" :key="'outline-' + name"
                 class="flex flex-col items-center gap-1.5 rounded-xl p-2.5 transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-700/30">
              <Icon :name="name" variant="outline" size="md" />
              <span class="text-[10px] leading-tight text-slate-400 dark:text-slate-500">{{ name }}</span>
            </div>
          </div>
        </div>
        <div>
          <p class="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Solid</p>
          <div class="grid grid-cols-7 gap-2">
            <div v-for="name in registeredIcons" :key="'solid-' + name"
                 class="flex flex-col items-center gap-1.5 rounded-xl p-2.5 transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-700/30">
              <Icon :name="name" variant="solid" size="md" />
              <span class="text-[10px] leading-tight text-slate-400 dark:text-slate-500">{{ name }}</span>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

// ─── Sizes ──────────────────────────────────────────────────────────────────
export const Sizes: Story = {
  render: () => ({
    components: { Icon },
    setup() {
      const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
      const sizeLabels: Record<string, string> = {
        xs: 'XS  16px',
        sm: 'SM  20px',
        md: 'MD  24px',
        lg: 'LG  32px',
        xl: 'XL  40px',
      }
      return { sizes, sizeLabels, previewShell }
    },
    template: `
      <div :class="previewShell" class="min-w-[560px]">
        <div class="space-y-3">
          <div v-for="s in sizes" :key="s"
               class="flex items-center justify-between rounded-2xl border border-white/80 bg-white/84 px-4 py-3 dark:border-slate-700/40 dark:bg-slate-800/60">
            <p class="text-sm text-slate-600 dark:text-slate-300">{{ sizeLabels[s] }}</p>
            <div class="flex items-center gap-3">
              <Icon name="star" variant="outline" :size="s" class="text-slate-500 dark:text-slate-400" />
              <Icon name="star" variant="solid" :size="s" class="text-amber-500 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

// ─── Variants ───────────────────────────────────────────────────────────────
export const Variants: Story = {
  render: () => ({
    components: { Icon },
    setup() {
      const pairs = [
        { name: 'heart', label: 'Heart' },
        { name: 'star', label: 'Star' },
        { name: 'bell', label: 'Bell' },
        { name: 'user', label: 'User' },
        { name: 'cog-6-tooth', label: 'Settings' },
      ] as const
      return { pairs, previewShell }
    },
    template: `
      <div :class="previewShell" class="min-w-[520px]">
        <p class="mb-4 text-sm text-slate-500 dark:text-slate-400">Outline vs Solid — same icon, different weight.</p>
        <div class="grid grid-cols-5 gap-4">
          <div v-for="p in pairs" :key="p.name" class="flex flex-col items-center gap-3">
            <div class="flex items-center gap-3 rounded-xl bg-slate-50/80 px-3 py-2 dark:bg-slate-800/40">
              <Icon :name="p.name" variant="outline" size="lg" class="text-slate-400 dark:text-slate-500" />
              <div class="h-5 w-px bg-slate-200 dark:bg-slate-600"></div>
              <Icon :name="p.name" variant="solid" size="lg" class="text-slate-700 dark:text-slate-200" />
            </div>
            <span class="text-xs text-slate-400 dark:text-slate-500">{{ p.label }}</span>
          </div>
        </div>
      </div>
    `,
  }),
}

// ─── Toolbar ────────────────────────────────────────────────────────────────
export const Toolbar: Story = {
  render: () => ({
    components: { Icon },
    setup() {
      const lastAction = ref('')
      const toolbarButtons = [
        { icon: 'magnifying-glass', label: 'Search', tone: 'slate' },
        { icon: 'plus', label: 'New', tone: 'sky' },
        { icon: 'pencil', label: 'Edit', tone: 'amber' },
        { icon: 'trash', label: 'Delete', tone: 'rose' },
        { icon: 'folder', label: 'Move', tone: 'slate' },
        { icon: 'cog-6-tooth', label: 'Settings', tone: 'slate' },
      ] as const

      const toneMap: Record<string, string> = {
        slate: 'hover:bg-slate-100 dark:hover:bg-slate-700/50',
        sky: 'hover:bg-sky-50 dark:hover:bg-sky-900/30',
        amber: 'hover:bg-amber-50 dark:hover:bg-amber-900/30',
        rose: 'hover:bg-rose-50 dark:hover:bg-rose-900/30',
      }

      function onAction(label: string) {
        lastAction.value = label
      }

      return { toolbarButtons, toneMap, lastAction, onAction, previewShell }
    },
    template: `
      <div :class="previewShell" class="min-w-[560px]">
        <div class="mb-3 flex items-center justify-between">
          <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">Document toolbar</p>
          <span v-if="lastAction" class="text-xs text-slate-400 dark:text-slate-500">Clicked: {{ lastAction }}</span>
        </div>
        <div class="flex items-center gap-1 rounded-xl bg-white/80 p-1.5 ring-1 ring-slate-200/60 backdrop-blur dark:bg-slate-800/60 dark:ring-slate-700/40">
          <button v-for="btn in toolbarButtons" :key="btn.icon"
                  class="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-slate-600 transition-colors dark:text-slate-300"
                  :class="toneMap[btn.tone]"
                  @click="onAction(btn.label)">
            <Icon :name="btn.icon" size="sm" />
            <span class="text-xs">{{ btn.label }}</span>
          </button>
        </div>
        <div class="mt-4 flex items-center gap-2 rounded-xl bg-slate-50/80 px-3 py-2 ring-1 ring-slate-200/40 dark:bg-slate-800/40 dark:ring-slate-700/30">
          <Icon name="magnifying-glass" size="sm" class="text-slate-400 dark:text-slate-500" />
          <span class="text-sm text-slate-400 dark:text-slate-500">Search documents...</span>
        </div>
      </div>
    `,
  }),
}

// ─── NavigationSidebar ──────────────────────────────────────────────────────
export const NavigationSidebar: Story = {
  render: () => ({
    components: { Icon },
    setup() {
      const activeItem = ref('home')
      const navItems = [
        { icon: 'home', label: 'Home', id: 'home' },
        { icon: 'document', label: 'Documents', id: 'docs' },
        { icon: 'book-open', label: 'Library', id: 'library' },
        { icon: 'bell', label: 'Notifications', id: 'notif', badge: '3' },
        { icon: 'cog-6-tooth', label: 'Settings', id: 'settings' },
      ] as const

      function selectItem(id: string) {
        activeItem.value = id
      }

      return { navItems, activeItem, selectItem }
    },
    template: `
      <div class="w-[260px] rounded-[30px] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(248,250,252,0.95))] p-4 shadow-[0_28px_52px_-30px_rgba(15,23,42,0.28)] dark:border-slate-700/50 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.97),rgba(15,23,42,0.95))]">
        <div class="mb-4 flex items-center gap-2.5 px-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-900/30">
            <Icon name="book-open" size="sm" class="text-sky-600 dark:text-sky-400" />
          </div>
          <span class="text-sm font-semibold text-slate-900 dark:text-slate-100">Qingyu</span>
        </div>
        <nav class="space-y-0.5">
          <button v-for="item in navItems" :key="item.id"
                  class="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors"
                  :class="activeItem === item.id
                    ? 'bg-sky-50/80 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
                    : 'text-slate-600 hover:bg-slate-50/80 dark:text-slate-400 dark:hover:bg-slate-800/40'"
                  @click="selectItem(item.id)">
            <Icon :name="item.icon" size="sm" />
            <span class="flex-1 text-sm">{{ item.label }}</span>
            <span v-if="item.badge"
                  class="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-medium leading-none text-rose-600 dark:bg-rose-900/40 dark:text-rose-400">
              {{ item.badge }}
            </span>
          </button>
        </nav>
      </div>
    `,
  }),
}

// ─── StatusIndicators ───────────────────────────────────────────────────────
export const StatusIndicators: Story = {
  render: () => ({
    components: { Icon },
    setup() {
      const statuses = [
        {
          icon: 'check',
          label: 'Published',
          desc: 'Content is live and accessible.',
          tone: 'bg-emerald-50 text-emerald-600 ring-emerald-200/70 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-800/30',
          iconClass: 'text-emerald-500 dark:text-emerald-400',
        },
        {
          icon: 'information-circle',
          label: 'In review',
          desc: 'Waiting for editor approval.',
          tone: 'bg-sky-50 text-sky-600 ring-sky-200/70 dark:bg-sky-900/20 dark:text-sky-400 dark:ring-sky-800/30',
          iconClass: 'text-sky-500 dark:text-sky-400',
        },
        {
          icon: 'star',
          label: 'Featured',
          desc: 'Highlighted in discovery feed.',
          tone: 'bg-amber-50 text-amber-600 ring-amber-200/70 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-800/30',
          iconClass: 'text-amber-500 dark:text-amber-400',
        },
        {
          icon: 'lock-closed',
          label: 'Restricted',
          desc: 'Access limited to collaborators.',
          tone: 'bg-slate-50 text-slate-600 ring-slate-200/70 dark:bg-slate-800/30 dark:text-slate-400 dark:ring-slate-700/40',
          iconClass: 'text-slate-400 dark:text-slate-500',
        },
        {
          icon: 'x-mark',
          label: 'Rejected',
          desc: 'Did not pass moderation.',
          tone: 'bg-rose-50 text-rose-600 ring-rose-200/70 dark:bg-rose-900/20 dark:text-rose-400 dark:ring-rose-800/30',
          iconClass: 'text-rose-500 dark:text-rose-400',
        },
      ] as const

      return { statuses, previewShell }
    },
    template: `
      <div :class="previewShell" class="min-w-[480px]">
        <p class="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Status indicators</p>
        <div class="space-y-2">
          <div v-for="s in statuses" :key="s.label"
               class="flex items-center gap-3 rounded-xl px-3 py-2.5 ring-1"
               :class="s.tone">
            <Icon :name="s.icon" size="sm" variant="solid" :class="s.iconClass" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium">{{ s.label }}</p>
              <p class="text-xs opacity-70">{{ s.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

// ─── InlineWithText ─────────────────────────────────────────────────────────
export const InlineWithText: Story = {
  render: () => ({
    components: { Icon },
    setup() {
      return { previewShell, cardRow }
    },
    template: `
      <div :class="previewShell" class="min-w-[520px]">
        <p class="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Inline icon usage</p>
        <div class="space-y-3">
          <div class="flex items-center justify-between rounded-2xl border border-white/80 bg-white/84 px-4 py-3 dark:border-slate-700/40 dark:bg-slate-800/60">
            <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Icon name="check" variant="solid" size="sm" class="text-emerald-500 dark:text-emerald-400" />
              Draft saved successfully
            </div>
            <span class="text-xs text-slate-400 dark:text-slate-500">just now</span>
          </div>
          <div class="flex items-center justify-between rounded-2xl border border-white/80 bg-white/84 px-4 py-3 dark:border-slate-700/40 dark:bg-slate-800/60">
            <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Icon name="bell" variant="outline" size="sm" />
              3 unread notifications
            </div>
            <span class="text-xs text-slate-400 dark:text-slate-500">5 min ago</span>
          </div>
          <div class="flex items-center justify-between rounded-2xl border border-white/80 bg-white/84 px-4 py-3 dark:border-slate-700/40 dark:bg-slate-800/60">
            <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Icon name="user" variant="outline" size="sm" />
              Shared with 2 collaborators
            </div>
            <span class="text-xs text-slate-400 dark:text-slate-500">today</span>
          </div>
          <div class="flex items-center justify-between rounded-2xl border border-white/80 bg-white/84 px-4 py-3 dark:border-slate-700/40 dark:bg-slate-800/60">
            <div class="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
              <Icon name="star" variant="solid" size="sm" />
              Added to favorites
            </div>
            <span class="text-xs text-slate-400 dark:text-slate-500">yesterday</span>
          </div>
        </div>
      </div>
    `,
  }),
}

// ─── FallbackDemo ───────────────────────────────────────────────────────────
export const FallbackDemo: Story = {
  render: () => ({
    components: { Icon },
    setup() {
      return { previewShell }
    },
    template: `
      <div :class="previewShell" class="min-w-[460px]">
        <p class="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">Fallback behavior</p>
        <p class="mb-4 text-sm text-slate-500 dark:text-slate-400">When an unregistered icon name is passed, a tonal placeholder is rendered instead of crashing.</p>
        <div class="grid grid-cols-3 gap-3">
          <div class="flex flex-col items-center gap-2 rounded-xl border border-white/80 bg-white/84 p-4 dark:border-slate-700/40 dark:bg-slate-800/60">
            <Icon name="home" size="lg" />
            <span class="text-xs text-emerald-500 dark:text-emerald-400">registered</span>
          </div>
          <div class="flex flex-col items-center gap-2 rounded-xl border border-white/80 bg-white/84 p-4 dark:border-slate-700/40 dark:bg-slate-800/60">
            <Icon name="nonexistent-icon" size="lg" />
            <span class="text-xs text-rose-500 dark:text-rose-400">missing</span>
          </div>
          <div class="flex flex-col items-center gap-2 rounded-xl border border-white/80 bg-white/84 p-4 dark:border-slate-700/40 dark:bg-slate-800/60">
            <Icon name="another-missing-one" size="lg" />
            <span class="text-xs text-rose-500 dark:text-rose-400">missing</span>
          </div>
        </div>
      </div>
    `,
  }),
}
