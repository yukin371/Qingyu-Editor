import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import List from './List.vue'
import ListItem from './ListItem.vue'

/**
 * List 组件 Storybook 故事
 *
 * 展示所有变体、插槽和状态
 */

const meta = {
  title: 'Design System/Base/List',
  component: List,
  tags: ['autodocs'],
  argTypes: {
    border: {
      control: 'boolean',
      description: '是否显示边框',
    },
    split: {
      control: 'boolean',
      description: '是否显示分割线',
    },
    loading: {
      control: 'boolean',
      description: '加载状态',
    },
  },
} satisfies Meta<typeof List>

export default meta
type Story = StoryObj<typeof meta>

// 默认故事
export const Default: Story = {
  args: {
    data: ['项目 1', '项目 2', '项目 3'],
    border: false,
    split: true,
    loading: false,
  },
  render: (args) => ({
    components: { List },
    setup() {
      return { args }
    },
    template: `
      <List v-bind="args" />
    `,
  }),
}

// 带边框
export const Bordered: Story = {
  render: () => ({
    components: { List },
    template: `
      <div class="max-w-md p-8">
        <List :data="['项目 1', '项目 2', '项目 3']" :border="true" />
      </div>
    `,
  }),
}

// 无分割线
export const NoSplit: Story = {
  render: () => ({
    components: { List },
    template: `
      <div class="max-w-md p-8">
        <List :data="['项目 1', '项目 2', '项目 3']" :split="false" :border="true" />
      </div>
    `,
  }),
}

// 加载状态
export const Loading: Story = {
  render: () => ({
    components: { List },
    template: `
      <div class="max-w-md p-8">
        <List :loading="true" />
      </div>
    `,
  }),
}

// 自定义加载状态
export const CustomLoading: Story = {
  render: () => ({
    components: { List },
    template: `
      <div class="max-w-md p-8">
        <List :loading="true">
          <template #loading>
            <div class="p-8 text-center">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
              <p class="mt-2 text-slate-600">正在加载数据...</p>
            </div>
          </template>
        </List>
      </div>
    `,
  }),
}

// 空状态
export const Empty: Story = {
  render: () => ({
    components: { List },
    template: `
      <div class="max-w-md p-8">
        <List :data="[]" />
      </div>
    `,
  }),
}

// 自定义空状态
export const CustomEmpty: Story = {
  render: () => ({
    components: { List },
    template: `
      <div class="max-w-md p-8">
        <List :data="[]">
          <template #empty>
            <div class="p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p class="text-slate-600">暂无数据，请稍后再试</p>
            </div>
          </template>
        </List>
      </div>
    `,
  }),
}

// 使用 ListItem
export const WithListItem: Story = {
  render: () => ({
    components: { List, ListItem },
    template: `
      <div class="max-w-md p-8">
        <List>
          <ListItem>项目 1</ListItem>
          <ListItem>项目 2</ListItem>
          <ListItem>项目 3</ListItem>
        </List>
      </div>
    `,
  }),
}

// 带禁用项
export const WithDisabledItem: Story = {
  render: () => ({
    components: { List, ListItem },
    template: `
      <div class="max-w-md p-8">
        <List :border="true">
          <ListItem>可用项目 1</ListItem>
          <ListItem :disabled="true">禁用项目 2</ListItem>
          <ListItem>可用项目 3</ListItem>
        </List>
      </div>
    `,
  }),
}

// 复杂内容
export const ComplexContent: Story = {
  render: () => ({
    components: { List, ListItem },
    setup() {
      const users = [
        { name: '张三', email: 'zhangsan@example.com', role: '管理员' },
        { name: '李四', email: 'lisi@example.com', role: '用户' },
        { name: '王五', email: 'wangwu@example.com', role: '用户' },
      ]
      return { users }
    },
    template: `
      <div class="max-w-md p-8">
        <List :data="users" :border="true">
          <template #item="{ item }">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-slate-900">{{ item.name }}</p>
                <p class="text-sm text-slate-500">{{ item.email }}</p>
              </div>
              <span class="text-sm text-slate-600">{{ item.role }}</span>
            </div>
          </template>
        </List>
      </div>
    `,
  }),
}

// 可点击列表
export const Clickable: Story = {
  render: () => ({
    components: { List },
    setup() {
      const items = ['项目 1', '项目 2', '项目 3']
      const handleClick = (item: any, index: number) => {
        alert(`点击了: ${item} (索引: ${index})`)
      }
      return { items, handleClick }
    },
    template: `
      <div class="max-w-md p-8">
        <List :data="items" :border="true" @item-click="handleClick" />
      </div>
    `,
  }),
}

// 图标列表
export const WithIcons: Story = {
  render: () => ({
    components: { List, ListItem },
    template: `
      <div class="max-w-md p-8">
        <List :border="true">
          <ListItem>
            <div class="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>首页</span>
            </div>
          </ListItem>
          <ListItem>
            <div class="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>文档</span>
            </div>
          </ListItem>
          <ListItem>
            <div class="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>设置</span>
            </div>
          </ListItem>
        </List>
      </div>
    `,
  }),
}

// 交互测试
export const Interactive: Story = {
  render: () => ({
    components: { List, ListItem },
    setup() {
      const selectedItem = ref<string | null>(null)
      const items = ['选项 1', '选项 2', '选项 3']
      const handleClick = (item: any) => {
        selectedItem.value = item
      }
      return { items, selectedItem, handleClick }
    },
    template: `
      <div class="max-w-md p-8">
        <p class="mb-4 text-slate-600">已选择: {{ selectedItem || '无' }}</p>
        <List :data="items" :border="true" @item-click="handleClick" />
      </div>
    `,
  }),
}
