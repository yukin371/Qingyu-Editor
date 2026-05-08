/**
 * Avatar 组件 Storybook 故事
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import Avatar from './Avatar.vue'

const previewShell =
  'rounded-[28px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(186,230,253,0.38),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.94))] p-6 shadow-[0_24px_48px_-28px_rgba(15,23,42,0.32)]'

const meta = {
  title: 'Base/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    src: {
      control: 'text',
      description: '头像图片 URL',
    },
    alt: {
      control: 'text',
      description: 'Fallback 文字或图片 alt 文本',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Avatar 尺寸',
    },
    variant: {
      control: 'select',
      options: ['circle', 'square', 'rounded'],
      description: 'Avatar 形状',
    },
    status: {
      control: 'select',
      options: ['online', 'offline', 'away', 'busy'],
      description: '在线状态指示器',
    },
    disableStatus: {
      control: 'boolean',
      description: '是否禁用状态指示器',
    },
  },
  args: {
    alt: 'John Doe',
    size: 'md',
    variant: 'circle',
    disableStatus: false,
  },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { Avatar },
    setup() {
      return { args, previewShell }
    },
    template: `
      <div :class="previewShell" class="min-w-[260px]">
        <div class="flex items-center gap-4">
          <Avatar v-bind="args" size="lg" />
          <div class="space-y-1">
            <p class="text-sm font-semibold text-slate-900">Default identity</p>
            <p class="text-sm text-slate-500">A calm, glossy avatar surface for navigation and cards.</p>
          </div>
        </div>
      </div>
    `,
  }),
}

export const WithImage: Story = {
  render: (args) => ({
    components: { Avatar },
    setup() {
      return { args, previewShell }
    },
    template: `
      <div :class="previewShell" class="min-w-[300px]">
        <div class="flex items-center gap-4">
          <Avatar v-bind="args" size="xl" status="online" />
          <div class="space-y-1">
            <p class="text-sm font-semibold text-slate-900">Editorial profile</p>
            <p class="text-sm text-slate-500">Use the avatar as a polished lead-in for profile cards and review surfaces.</p>
          </div>
        </div>
      </div>
    `,
  }),
  args: {
    src: 'https://api.dicebear.com/7.x/lorelei/svg?seed=editorial',
    alt: 'Jane Smith',
  },
}

export const Sizes: Story = {
  render: (args) => ({
    components: { Avatar },
    setup() {
      return { args, previewShell }
    },
    template: `
      <div :class="previewShell">
        <div class="flex items-end gap-4">
          <Avatar v-bind="args" size="xs" alt="XS" />
          <Avatar v-bind="args" size="sm" alt="SM" />
          <Avatar v-bind="args" size="md" alt="MD" />
          <Avatar v-bind="args" size="lg" alt="LG" />
          <Avatar v-bind="args" size="xl" alt="XL" />
          <Avatar v-bind="args" size="2xl" alt="2XL" />
        </div>
      </div>
    `,
  }),
  args: {
    src: 'https://api.dicebear.com/7.x/lorelei/svg?seed=sizing',
  },
}

export const Variants: Story = {
  render: (args) => ({
    components: { Avatar },
    setup() {
      return { args, previewShell }
    },
    template: `
      <div :class="previewShell">
        <div class="grid grid-cols-3 gap-5">
          <div class="space-y-3 text-center">
            <Avatar v-bind="args" variant="circle" size="xl" />
            <p class="text-sm font-medium text-slate-600">Circle</p>
          </div>
          <div class="space-y-3 text-center">
            <Avatar v-bind="args" variant="square" size="xl" />
            <p class="text-sm font-medium text-slate-600">Square</p>
          </div>
          <div class="space-y-3 text-center">
            <Avatar v-bind="args" variant="rounded" size="xl" />
            <p class="text-sm font-medium text-slate-600">Rounded</p>
          </div>
        </div>
      </div>
    `,
  }),
  args: {
    src: 'https://api.dicebear.com/7.x/lorelei/svg?seed=variants',
    alt: 'Variant Demo',
  },
}

export const Fallback: Story = {
  render: () => ({
    components: { Avatar },
    setup() {
      return { previewShell }
    },
    template: `
      <div :class="previewShell">
        <div class="grid grid-cols-5 gap-4">
          <div class="space-y-2 text-center">
            <Avatar alt="John Doe" size="lg" />
            <p class="text-xs text-slate-500">JD</p>
          </div>
          <div class="space-y-2 text-center">
            <Avatar alt="Jane Smith" size="lg" />
            <p class="text-xs text-slate-500">JS</p>
          </div>
          <div class="space-y-2 text-center">
            <Avatar alt="张三" size="lg" />
            <p class="text-xs text-slate-500">张</p>
          </div>
          <div class="space-y-2 text-center">
            <Avatar alt="UI" size="lg" />
            <p class="text-xs text-slate-500">UI</p>
          </div>
          <div class="space-y-2 text-center">
            <Avatar alt="+5" size="lg" />
            <p class="text-xs text-slate-500">+5</p>
          </div>
        </div>
      </div>
    `,
  }),
}

export const Status: Story = {
  render: (args) => ({
    components: { Avatar },
    setup() {
      return { args, previewShell }
    },
    template: `
      <div :class="previewShell" class="min-w-[360px]">
        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/80 p-3">
            <Avatar v-bind="args" status="online" />
            <div>
              <p class="text-sm font-medium text-slate-900">Online</p>
              <p class="text-xs text-slate-500">Ready for review</p>
            </div>
          </div>
          <div class="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/80 p-3">
            <Avatar v-bind="args" status="away" />
            <div>
              <p class="text-sm font-medium text-slate-900">Away</p>
              <p class="text-xs text-slate-500">Out for edits</p>
            </div>
          </div>
          <div class="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/80 p-3">
            <Avatar v-bind="args" status="busy" />
            <div>
              <p class="text-sm font-medium text-slate-900">Busy</p>
              <p class="text-xs text-slate-500">Sync in progress</p>
            </div>
          </div>
          <div class="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/80 p-3">
            <Avatar v-bind="args" status="offline" />
            <div>
              <p class="text-sm font-medium text-slate-900">Offline</p>
              <p class="text-xs text-slate-500">Saved for later</p>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
  args: {
    src: 'https://api.dicebear.com/7.x/lorelei/svg?seed=presence',
    alt: 'Presence Avatar',
    size: 'lg',
  },
}

export const UserList: Story = {
  render: (args) => ({
    components: { Avatar },
    setup() {
      const users = [
        {
          name: 'Alice Johnson',
          avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=alice',
          status: 'online' as const,
          role: 'Lead editor',
        },
        {
          name: 'Bob Smith',
          avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=bob',
          status: 'offline' as const,
          role: 'Archive owner',
        },
        {
          name: 'Charlie Brown',
          avatar: undefined,
          status: 'away' as const,
          role: 'Systems reviewer',
        },
      ]
      return { args, users, previewShell }
    },
    template: `
      <div :class="previewShell" class="min-w-[360px]">
        <div class="space-y-3">
          <div
            v-for="user in users"
            :key="user.name"
            class="flex items-center justify-between rounded-2xl border border-white/80 bg-white/84 px-4 py-3"
          >
            <div class="flex items-center gap-3">
              <Avatar :src="user.avatar" :alt="user.name" :status="user.status" v-bind="args" />
              <div>
                <p class="text-sm font-medium text-slate-900">{{ user.name }}</p>
                <p class="text-xs text-slate-500">{{ user.role }}</p>
              </div>
            </div>
            <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
              {{ user.status }}
            </span>
          </div>
        </div>
      </div>
    `,
  }),
  args: {
    size: 'md',
  },
}

export const AvatarGroup: Story = {
  render: (args) => ({
    components: { Avatar },
    setup() {
      return { args, previewShell }
    },
    template: `
      <div :class="previewShell" class="min-w-[320px]">
        <div class="flex items-center justify-between gap-4">
          <div class="flex -space-x-3">
            <Avatar src="https://api.dicebear.com/7.x/lorelei/svg?seed=group-1" alt="User 1" v-bind="args" />
            <Avatar src="https://api.dicebear.com/7.x/lorelei/svg?seed=group-2" alt="User 2" v-bind="args" />
            <Avatar src="https://api.dicebear.com/7.x/lorelei/svg?seed=group-3" alt="User 3" v-bind="args" />
            <Avatar src="https://api.dicebear.com/7.x/lorelei/svg?seed=group-4" alt="User 4" v-bind="args" />
            <Avatar alt="+5" v-bind="args" />
          </div>
          <div class="text-right">
            <p class="text-sm font-medium text-slate-900">Creative cluster</p>
            <p class="text-xs text-slate-500">9 people active across two stories</p>
          </div>
        </div>
      </div>
    `,
  }),
  args: {
    size: 'md',
  },
}

export const ProfileRail: Story = {
  render: () => ({
    components: { Avatar },
    setup() {
      return { previewShell }
    },
    template: `
      <div :class="previewShell" class="min-w-[420px]">
        <div class="grid grid-cols-3 gap-4">
          <div class="rounded-[24px] border border-white/80 bg-white/84 p-4 text-center">
            <Avatar
              class="mx-auto"
              src="https://api.dicebear.com/7.x/lorelei/svg?seed=rail-1"
              alt="Mina"
              size="xl"
              status="online"
            />
            <p class="mt-3 text-sm font-medium text-slate-900">Mina</p>
            <p class="text-xs text-slate-500">Motion</p>
          </div>
          <div class="rounded-[24px] border border-white/80 bg-white/84 p-4 text-center">
            <Avatar class="mx-auto" alt="TY" size="xl" variant="rounded" />
            <p class="mt-3 text-sm font-medium text-slate-900">Tian Yu</p>
            <p class="text-xs text-slate-500">Systems</p>
          </div>
          <div class="rounded-[24px] border border-white/80 bg-white/84 p-4 text-center">
            <Avatar
              class="mx-auto"
              src="https://api.dicebear.com/7.x/lorelei/svg?seed=rail-3"
              alt="Rin"
              size="xl"
              variant="square"
              status="busy"
            />
            <p class="mt-3 text-sm font-medium text-slate-900">Rin</p>
            <p class="text-xs text-slate-500">Review</p>
          </div>
        </div>
      </div>
    `,
  }),
}

export const Clickable: Story = {
  render: (args) => ({
    components: { Avatar },
    setup() {
      const handleClick = () => {
        window.alert('Avatar clicked!')
      }
      return { args, handleClick, previewShell }
    },
    template: `
      <div :class="previewShell">
        <div class="flex items-center gap-4">
          <Avatar v-bind="args" size="xl" @click="handleClick" />
          <div class="space-y-1">
            <p class="text-sm font-semibold text-slate-900">Interactive surface</p>
            <p class="text-sm text-slate-500">Keyboard and pointer interactions both trigger the callback.</p>
          </div>
        </div>
      </div>
    `,
  }),
  args: {
    src: 'https://api.dicebear.com/7.x/lorelei/svg?seed=clickable',
    alt: 'Clickable Avatar',
  },
}
