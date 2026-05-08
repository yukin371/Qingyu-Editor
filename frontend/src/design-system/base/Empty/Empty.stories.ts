import type { Meta, StoryObj } from '@storybook/vue3'
import Empty from './Empty.vue'

const previewShell =
  'flex justify-center rounded-[2rem] border border-slate-200/60 bg-slate-50/70 p-8 shadow-[0_35px_70px_-40px_rgba(15,23,42,0.35)]'

const meta = {
  title: 'Base/Empty',
  component: Empty,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    description: {
      control: 'text',
      description: '空状态描述文字',
    },
    title: {
      control: 'text',
      description: '空状态标题',
    },
    icon: {
      control: 'text',
      description: '图标名称（使用 Icon 组件）',
    },
    iconSize: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: '图标尺寸（small→sm, medium→md, large→lg）',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Empty 尺寸',
    },
  },
  args: {
    icon: 'document',
    title: '暂无内容',
    description: '在这里会显示你的书单、消息或文档',
    size: 'md',
  },
} satisfies Meta<typeof Empty>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { Empty },
    setup() {
      return { args, previewShell }
    },
    template: `
      <div :class="previewShell">
        <Empty v-bind="args">
          <template #action>
            <button class="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
              新建书单
            </button>
            <button class="rounded-full border border-transparent bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              导入书单
            </button>
          </template>
        </Empty>
      </div>
    `,
  }),
}

export const SearchEmpty: Story = {
  render: () => ({
    components: { Empty },
    template: `
      <div class="grid auto-rows-min gap-6 lg:grid-cols-2">
        <div class="rounded-[1.5rem] border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.4)]">
          <p class="text-xs uppercase tracking-[0.4em] text-slate-400">搜索</p>
          <p class="mt-1 text-sm font-semibold text-slate-800">没有匹配的结果</p>
          <p class="text-sm text-slate-500">尝试更宽泛的关键词或清除筛选条件。</p>
          <Empty
            icon="magnifying-glass"
            title="无结果"
            description="当前关键词未命中任何项目"
            size="lg"
            class="mt-6"
          >
            <template #action>
              <button class="rounded-full border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                清除筛选
              </button>
              <button class="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                重新搜索
              </button>
            </template>
          </Empty>
        </div>
        <div class="rounded-[1.5rem] border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.4)]">
          <p class="text-sm text-slate-500">搜索历史</p>
          <Empty
            icon="document"
            title="等待新的查询"
            description="稍后会在这里显示最新的搜索结果"
            size="md"
          />
        </div>
      </div>
    `,
  }),
}

export const TeamEmpty: Story = {
  render: () => ({
    components: { Empty },
    template: `
      <div class="space-y-5 rounded-[1.5rem] border border-slate-200/60 bg-white/80 p-8 shadow-[0_25px_55px_-45px_rgba(15,23,42,0.45)]">
        <div class="space-y-1">
          <p class="text-sm font-semibold text-slate-900">协作空间</p>
          <p class="text-sm text-slate-500">团队成员未在这个故事上发布内容</p>
        </div>
        <Empty
          icon="user"
          title="没有成员贡献"
          description="邀请团队成员一同开始创作，或先保存草稿再分享"
          size="lg"
        >
          <template #action>
            <button class="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300">
              邀请成员
            </button>
            <button class="rounded-full border border-transparent bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-600">
              查看草稿
            </button>
          </template>
        </Empty>
      </div>
    `,
  }),
}

export const CompactPanel: Story = {
  render: () => ({
    components: { Empty },
    template: `
      <div class="grid grid-cols-2 gap-4">
        <div class="rounded-[1.25rem] border border-slate-200/70 bg-slate-900/5 p-4">
          <Empty
            icon="book-open"
            title="今日会议"
            description="尚未安排任何会议"
            size="sm"
          />
        </div>
        <div class="rounded-[1.25rem] border border-slate-200/70 bg-slate-900/5 p-4">
          <Empty
            icon="bell"
            title="提醒"
            description="没有未读提醒"
            size="sm"
          />
        </div>
      </div>
    `,
  }),
}
