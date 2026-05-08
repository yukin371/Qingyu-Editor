import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import Tag from './Tag.vue'

/**
 * Tag 组件 Storybook 故事
 *
 * 展示所有变体、尺寸和功能
 */

const meta = {
  title: 'Design System/Base/Tag',
  component: Tag,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'danger'],
      description: 'Tag 变体',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Tag 尺寸',
    },
    removable: {
      control: 'boolean',
      description: '是否可关闭',
    },
    icon: {
      control: 'text',
      description: '图标名称',
    },
  },
} satisfies Meta<typeof Tag>

export default meta
type Story = StoryObj<typeof meta>

// 默认故事
export const Default: Story = {
  args: {
    variant: 'default',
    size: 'md',
  },
  render: (args) => ({
    components: { Tag },
    setup() {
      return { args }
    },
    template: '<Tag v-bind="args">Default Tag</Tag>',
  }),
}

// 所有变体
export const AllVariants: Story = {
  render: () => ({
    components: { Tag },
    template: `
      <div class="flex flex-wrap gap-3 p-8">
        <Tag variant="default">Default</Tag>
        <Tag variant="primary">Primary</Tag>
        <Tag variant="success">Success</Tag>
        <Tag variant="warning">Warning</Tag>
        <Tag variant="danger">Danger</Tag>
      </div>
    `,
  }),
}

// 所有尺寸
export const AllSizes: Story = {
  render: () => ({
    components: { Tag },
    template: `
      <div class="flex items-center gap-4 p-8">
        <Tag size="sm">Small</Tag>
        <Tag size="md">Medium</Tag>
        <Tag size="lg">Large</Tag>
      </div>
    `,
  }),
}

// 可关闭标签
export const Removable: Story = {
  render: () => ({
    components: { Tag },
    template: `
      <div class="flex flex-wrap gap-3 p-8">
        <Tag variant="default" :removable="true">Default</Tag>
        <Tag variant="primary" :removable="true">Primary</Tag>
        <Tag variant="success" :removable="true">Success</Tag>
        <Tag variant="warning" :removable="true">Warning</Tag>
        <Tag variant="danger" :removable="true">Danger</Tag>
      </div>
    `,
  }),
}

// 带图标的标签
export const WithIcon: Story = {
  render: () => ({
    components: { Tag },
    template: `
      <div class="flex flex-wrap gap-3 p-8">
        <Tag variant="primary" icon="check">Completed</Tag>
        <Tag variant="success" icon="check">Verified</Tag>
        <Tag variant="warning" icon="bell">Pending</Tag>
        <Tag variant="danger" icon="x-mark">Failed</Tag>
        <Tag variant="default" icon="document">Draft</Tag>
      </div>
    `,
  }),
}

// 不同尺寸的可关闭标签
export const RemovableAllSizes: Story = {
  render: () => ({
    components: { Tag },
    template: `
      <div class="flex items-center gap-4 p-8">
        <Tag size="sm" :removable="true">Small</Tag>
        <Tag size="md" :removable="true">Medium</Tag>
        <Tag size="lg" :removable="true">Large</Tag>
      </div>
    `,
  }),
}

// 实际应用场景
export const RealWorldUsage: Story = {
  render: () => ({
    components: { Tag },
    template: `
      <div class="p-8 space-y-6">
        <!-- 文章标签 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">文章标签</h3>
          <div class="flex flex-wrap gap-2">
            <Tag variant="primary" :removable="true">Vue.js</Tag>
            <Tag variant="primary" :removable="true">TypeScript</Tag>
            <Tag variant="primary" :removable="true">Tailwind CSS</Tag>
            <Tag variant="default" :removable="true">前端开发</Tag>
          </div>
        </div>

        <!-- 状态标签 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">状态标签</h3>
          <div class="flex flex-wrap gap-2">
            <Tag variant="success" icon="check">已发布</Tag>
            <Tag variant="warning" icon="bell">审核中</Tag>
            <Tag variant="danger" icon="x-mark">已拒绝</Tag>
            <Tag variant="default" icon="document">草稿</Tag>
          </div>
        </div>

        <!-- 用户角色 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">用户角色</h3>
          <div class="flex flex-wrap gap-2">
            <Tag variant="primary" icon="user">管理员</Tag>
            <Tag variant="default" icon="user">编辑</Tag>
            <Tag variant="default" icon="user">作者</Tag>
            <Tag variant="default" icon="user">订阅者</Tag>
          </div>
        </div>

        <!-- 优先级 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">优先级</h3>
          <div class="flex flex-wrap gap-2">
            <Tag variant="danger" size="sm">高优先级</Tag>
            <Tag variant="warning" size="sm">中优先级</Tag>
            <Tag variant="success" size="sm">低优先级</Tag>
          </div>
        </div>
      </div>
    `,
  }),
}

// 交互测试
export const Interactive: Story = {
  render: () => ({
    components: { Tag },
    setup() {
      const tags = ['Vue.js', 'TypeScript', 'Tailwind CSS', 'Vite']
      const removedTags = ref<string[]>([])

      const handleClose = (tag: string) => {
        removedTags.value.push(tag)
      }

      return { tags, removedTags, handleClose }
    },
    template: `
      <div class="p-8 space-y-4">
        <h3 class="text-lg font-semibold">点击关闭标签查看效果</h3>
        <div class="flex flex-wrap gap-2">
          <Tag
            v-for="tag in tags.filter(t => !removedTags.includes(tag))"
            :key="tag"
            variant="primary"
            :removable="true"
            @close="handleClose(tag)"
          >
            {{ tag }}
          </Tag>
        </div>
        <div v-if="removedTags.length > 0" class="text-sm text-slate-500">
          已关闭: {{ removedTags.join(', ') }}
        </div>
      </div>
    `,
  }),
}

// 深色模式
export const DarkMode: Story = {
  render: () => ({
    components: { Tag },
    template: `
      <div class="bg-slate-900 p-8 space-y-4">
        <h3 class="text-lg font-semibold text-white">深色模式</h3>
        <div class="flex flex-wrap gap-3">
          <Tag variant="default" :removable="true">Default</Tag>
          <Tag variant="primary" :removable="true">Primary</Tag>
          <Tag variant="success" :removable="true">Success</Tag>
          <Tag variant="warning" :removable="true">Warning</Tag>
          <Tag variant="danger" :removable="true">Danger</Tag>
        </div>
      </div>
    `,
  }),
}

// 长文本内容
export const LongText: Story = {
  render: () => ({
    components: { Tag },
    template: `
      <div class="p-8 space-y-4">
        <h3 class="text-lg font-semibold mb-3">长文本内容</h3>
        <div class="flex flex-wrap gap-3">
          <Tag variant="primary" :removable="true">
            This is a very long tag content that should be truncated
          </Tag>
          <Tag variant="success" size="sm" :removable="true">
            Short
          </Tag>
          <Tag variant="warning" size="lg" :removable="true">
            Medium length tag content
          </Tag>
        </div>
      </div>
    `,
  }),
}
