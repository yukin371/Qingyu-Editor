import type { Meta, StoryObj } from '@storybook/vue3'
import { QyDropdown } from './index'
import type { DropdownItem } from './types'

/**
 * QyDropdown Apple 风格下拉菜单 Storybook
 */

const meta = {
  title: 'Design System/Navigation/QyDropdown',
  component: QyDropdown,
  tags: ['autodocs'],
  args: {
    items: [],
  },
  argTypes: {
    trigger: {
      control: 'select',
      options: ['click', 'hover'],
      description: '触发方式',
    },
    placement: {
      control: 'select',
      options: ['bottom-start', 'bottom', 'bottom-end'],
      description: '弹出位置',
    },
    disabled: {
      control: 'boolean',
      description: '整体禁用',
    },
  },
} satisfies Meta<typeof QyDropdown>

export default meta
type Story = StoryObj<typeof meta>

const baseItems: DropdownItem[] = [
  { key: 'profile', label: '个人资料' },
  { key: 'settings', label: '设置' },
  { key: 'logout', label: '退出登录' },
]

/** 基础用法 */
export const Basic: Story = {
  render: () => ({
    components: { QyDropdown },
    setup() {
      const handleSelect = (key: string) => {
        console.log('Selected:', key)
      }
      return { baseItems, handleSelect }
    },
    template: `
      <div class="p-8">
        <QyDropdown :items="baseItems" @select="handleSelect">
          <button class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors">
            打开菜单
          </button>
        </QyDropdown>
      </div>
    `,
  }),
}

/** 带图标 */
export const WithIcons: Story = {
  render: () => ({
    components: { QyDropdown },
    setup() {
      const items: DropdownItem[] = [
        { key: 'user', label: '个人资料', icon: 'i-heroicons-user' },
        { key: 'cog', label: '偏好设置', icon: 'i-heroicons-cog' },
        { key: 'bell', label: '通知', icon: 'i-heroicons-bell', divider: true },
        { key: 'logout', label: '退出登录', icon: 'i-heroicons-arrow-right-on-rectangle', danger: true },
      ]
      const handleSelect = (key: string) => console.log('Selected:', key)
      return { items, handleSelect }
    },
    template: `
      <div class="p-8">
        <QyDropdown :items="items" @select="handleSelect">
          <button class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors">
            用户菜单
          </button>
        </QyDropdown>
      </div>
    `,
  }),
}

/** 带快捷键 */
export const WithShortcuts: Story = {
  render: () => ({
    components: { QyDropdown },
    setup() {
      const items: DropdownItem[] = [
        { key: 'new', label: '新建文件', shortcut: '\u2318N' },
        { key: 'open', label: '打开...', shortcut: '\u2318O', divider: true },
        { key: 'save', label: '保存', shortcut: '\u2318S' },
        { key: 'save-as', label: '另存为...', shortcut: '\u21E7\u2318S' },
      ]
      const handleSelect = (key: string) => console.log('Selected:', key)
      return { items, handleSelect }
    },
    template: `
      <div class="p-8">
        <QyDropdown :items="items" @select="handleSelect">
          <button class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors">
            文件操作
          </button>
        </QyDropdown>
      </div>
    `,
  }),
}

/** 带分隔线 */
export const WithDividers: Story = {
  render: () => ({
    components: { QyDropdown },
    setup() {
      const items: DropdownItem[] = [
        { key: 'edit', label: '编辑' },
        { key: 'duplicate', label: '复制', divider: true },
        { key: 'delete', label: '删除', danger: true, divider: true },
        { key: 'cancel', label: '取消' },
      ]
      const handleSelect = (key: string) => console.log('Selected:', key)
      return { items, handleSelect }
    },
    template: `
      <div class="p-8">
        <QyDropdown :items="items" @select="handleSelect">
          <button class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors">
            操作菜单
          </button>
        </QyDropdown>
      </div>
    `,
  }),
}

/** Danger 样式 */
export const Danger: Story = {
  render: () => ({
    components: { QyDropdown },
    setup() {
      const items: DropdownItem[] = [
        { key: 'archive', label: '归档' },
        { key: 'mute', label: '静音', divider: true },
        { key: 'delete', label: '删除项目', danger: true },
      ]
      const handleSelect = (key: string) => console.log('Selected:', key)
      return { items, handleSelect }
    },
    template: `
      <div class="p-8">
        <QyDropdown :items="items" @select="handleSelect">
          <button class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors">
            项目设置
          </button>
        </QyDropdown>
      </div>
    `,
  }),
}

/** 禁用状态 */
export const Disabled: Story = {
  render: () => ({
    components: { QyDropdown },
    setup() {
      const items: DropdownItem[] = [
        { key: 'edit', label: '编辑' },
        { key: 'paste', label: '粘贴', disabled: true },
        { key: 'copy', label: '复制', disabled: true, divider: true },
        { key: 'delete', label: '删除', danger: true },
      ]
      const handleSelect = (key: string) => console.log('Selected:', key)
      return { items, handleSelect }
    },
    template: `
      <div class="p-8 flex gap-8">
        <QyDropdown :items="items" @select="handleSelect">
          <button class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors">
            部分禁用
          </button>
        </QyDropdown>

        <QyDropdown :items="items" disabled>
          <button class="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg text-sm cursor-not-allowed">
            整体禁用
          </button>
        </QyDropdown>
      </div>
    `,
  }),
}

/** Hover 触发 */
export const HoverTrigger: Story = {
  render: () => ({
    components: { QyDropdown },
    setup() {
      const items: DropdownItem[] = [
        { key: 'docs', label: '文档' },
        { key: 'api', label: 'API 参考' },
        { key: 'examples', label: '示例', divider: true },
        { key: 'community', label: '社区' },
      ]
      const handleSelect = (key: string) => console.log('Selected:', key)
      return { items, handleSelect }
    },
    template: `
      <div class="p-8">
        <QyDropdown :items="items" trigger="hover" @select="handleSelect">
          <button class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors">
            悬停触发
          </button>
        </QyDropdown>
      </div>
    `,
  }),
}

/** 不同弹出位置 */
export const Placements: Story = {
  render: () => ({
    components: { QyDropdown },
    setup() {
      const items: DropdownItem[] = [
        { key: '1', label: '选项一' },
        { key: '2', label: '选项二' },
        { key: '3', label: '选项三' },
      ]
      const handleSelect = (key: string) => console.log('Selected:', key)
      return { items, handleSelect }
    },
    template: `
      <div class="p-8 flex gap-8">
        <QyDropdown :items="items" placement="bottom-start" @select="handleSelect">
          <button class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors">
            bottom-start
          </button>
        </QyDropdown>

        <QyDropdown :items="items" placement="bottom" @select="handleSelect">
          <button class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors">
            bottom
          </button>
        </QyDropdown>

        <QyDropdown :items="items" placement="bottom-end" @select="handleSelect">
          <button class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors">
            bottom-end
          </button>
        </QyDropdown>
      </div>
    `,
  }),
}
