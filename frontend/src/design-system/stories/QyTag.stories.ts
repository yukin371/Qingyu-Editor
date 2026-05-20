/**
 * QyTag Stories - Demo展示
 */
import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import QyTag from '@/design-system/components/basic/QyTag/QyTag.vue'

/**
 * QyTag Meta配置
 */
const meta: Meta<typeof QyTag> = {
  title: 'Components/Basic/QyTag',
  component: QyTag,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['primary', 'success', 'warning', 'danger', 'info'],
      description: '标签类型/颜色',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '标签尺寸',
    },
    effect: {
      control: 'select',
      options: ['light', 'dark', 'plain'],
      description: '视觉效果',
    },
    round: {
      control: 'boolean',
      description: '是否为圆形',
    },
    hit: {
      control: 'boolean',
      description: '是否带边框效果',
    },
    closable: {
      control: 'boolean',
      description: '是否可关闭',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
  },
  args: {
    type: 'primary',
    size: 'md',
    effect: 'light',
    round: true,
    hit: false,
    closable: false,
    disabled: false,
  },
}

export default meta
type Story = StoryObj<typeof QyTag>

interface QyTagArgs {
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | null
  size?: 'sm' | 'md' | 'lg' | null
  effect?: 'light' | 'dark' | 'plain' | null
  round?: boolean
  hit?: boolean
  closable?: boolean
  disabled?: boolean
}

/**
 * 默认标签
 */
export const Default: Story = {
  render: (args: QyTagArgs) => ({
    components: { QyTag },
    setup() {
      return { args }
    },
    template: `
      <QyTag v-bind="args">默认标签</QyTag>
    `,
  }),
}

/**
 * 标签类型
 * 展示不同颜色的标签
 */
export const Types: Story = {
  render: () => ({
    components: { QyTag },
    template: `
      <div class="flex items-center gap-3 flex-wrap">
        <QyTag type="primary">Primary</QyTag>
        <QyTag type="success">Success</QyTag>
        <QyTag type="warning">Warning</QyTag>
        <QyTag type="danger">Danger</QyTag>
        <QyTag type="info">Info</QyTag>
      </div>
    `,
  }),
}

/**
 * 标签尺寸
 * 展示不同尺寸的标签
 */
export const Sizes: Story = {
  render: () => ({
    components: { QyTag },
    template: `
      <div class="flex items-center gap-3 flex-wrap">
        <QyTag size="sm">小标签</QyTag>
        <QyTag size="md">中标签</QyTag>
        <QyTag size="lg">大标签</QyTag>
      </div>
    `,
  }),
}

/**
 * 视觉效果
 * 展示不同视觉效果的标签
 */
export const Effects: Story = {
  render: () => ({
    components: { QyTag },
    template: `
      <div class="space-y-4">
        <div class="flex items-center gap-3 flex-wrap">
          <QyTag type="primary" effect="light">Primary Light</QyTag>
          <QyTag type="success" effect="light">Success Light</QyTag>
          <QyTag type="warning" effect="light">Warning Light</QyTag>
          <QyTag type="danger" effect="light">Danger Light</QyTag>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
          <QyTag type="primary" effect="dark">Primary Dark</QyTag>
          <QyTag type="success" effect="dark">Success Dark</QyTag>
          <QyTag type="warning" effect="dark">Warning Dark</QyTag>
          <QyTag type="danger" effect="dark">Danger Dark</QyTag>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
          <QyTag type="primary" effect="plain">Primary Plain</QyTag>
          <QyTag type="success" effect="plain">Success Plain</QyTag>
          <QyTag type="warning" effect="plain">Warning Plain</QyTag>
          <QyTag type="danger" effect="plain">Danger Plain</QyTag>
        </div>
      </div>
    `,
  }),
}

/**
 * 可关闭标签
 * 展示可关闭的标签
 */
export const Closable: Story = {
  render: () => ({
    components: { QyTag },
    template: `
      <div class="flex items-center gap-3 flex-wrap">
        <QyTag type="primary" closable>可关闭</QyTag>
        <QyTag type="success" closable>可关闭</QyTag>
        <QyTag type="warning" closable>可关闭</QyTag>
        <QyTag type="danger" closable>可关闭</QyTag>
        <QyTag type="info" closable>可关闭</QyTag>
      </div>
    `,
  }),
}

/**
 * 圆角样式
 * 展示圆角和方角标签
 */
export const Round: Story = {
  render: () => ({
    components: { QyTag },
    template: `
      <div class="flex items-center gap-3 flex-wrap">
        <QyTag type="primary" :round="true">圆形标签</QyTag>
        <QyTag type="success" :round="false">方形标签</QyTag>
        <QyTag type="warning" :round="true">圆形标签</QyTag>
        <QyTag type="danger" :round="false">方形标签</QyTag>
      </div>
    `,
  }),
}

/**
 * 带边框效果
 * 展示带边框的标签
 */
export const Hit: Story = {
  render: () => ({
    components: { QyTag },
    template: `
      <div class="flex items-center gap-3 flex-wrap">
        <QyTag type="primary" :hit="true">Primary</QyTag>
        <QyTag type="success" :hit="true">Success</QyTag>
        <QyTag type="warning" :hit="true">Warning</QyTag>
        <QyTag type="danger" :hit="true">Danger</QyTag>
        <QyTag type="info" :hit="true">Info</QyTag>
      </div>
    `,
  }),
}

/**
 * 禁用状态
 * 展示禁用的标签
 */
export const Disabled: Story = {
  render: () => ({
    components: { QyTag },
    template: `
      <div class="flex items-center gap-3 flex-wrap">
        <QyTag type="primary" disabled>禁用标签</QyTag>
        <QyTag type="success" disabled closable>禁用且可关闭</QyTag>
        <QyTag type="warning" disabled>禁用标签</QyTag>
      </div>
    `,
  }),
}

/**
 * 组合示例
 * 展示各种组合的标签
 */
export const Combination: Story = {
  render: () => ({
    components: { QyTag },
    template: `
      <div class="space-y-4">
        <div class="flex items-center gap-3 flex-wrap">
          <QyTag type="primary" size="sm" closable>小型可关闭</QyTag>
          <QyTag type="success" size="md" effect="dark">中型深色</QyTag>
          <QyTag type="warning" size="lg" :round="false" :hit="true">大型方形边框</QyTag>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
          <QyTag type="danger" effect="plain" closable>朴素可关闭</QyTag>
          <QyTag type="info" effect="dark" closable>深色可关闭</QyTag>
        </div>
      </div>
    `,
  }),
}

/**
 * 交互示例
 * 展示带交互的标签
 */
export const Interactive: Story = {
  render: () => ({
    components: { QyTag },
    setup() {
      const tags = ref([
        { id: 1, text: 'Vue 3', type: 'primary' },
        { id: 2, text: 'TypeScript', type: 'success' },
        { id: 3, text: 'Tailwind CSS', type: 'info' },
        { id: 4, text: 'Vite', type: 'warning' },
      ])

      const handleClose = (id: number) => {
        const index = tags.value.findIndex((tag) => tag.id === id)
        if (index > -1) {
          tags.value.splice(index, 1)
        }
      }

      return { tags, handleClose }
    },
    template: `
      <div class="flex items-center gap-3 flex-wrap">
        <QyTag
          v-for="tag in tags"
          :key="tag.id"
          :type="tag.type"
          closable
          @close="handleClose(tag.id)"
        >
          {{ tag.text }}
        </QyTag>
        <span v-if="tags.length === 0" class="text-slate-400">
          没有标签了
        </span>
      </div>
    `,
  }),
}
