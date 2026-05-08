/**
 * Tree 组件 Storybook 故事
 */

import { ref } from 'vue'

import type { Meta, StoryObj } from '@storybook/vue3'
import Tree from './Tree.vue'
import type { TreeNode } from './types'

// 基础数据
const baseData: TreeNode[] = [
  {
    id: '1',
    label: '一级 1',
    children: [
      {
        id: '1-1',
        label: '二级 1-1',
        children: [
          {
            id: '1-1-1',
            label: '三级 1-1-1',
          },
        ],
      },
      {
        id: '1-2',
        label: '二级 1-2',
      },
    ],
  },
  {
    id: '2',
    label: '一级 2',
    children: [
      {
        id: '2-1',
        label: '二级 2-1',
      },
      {
        id: '2-2',
        label: '二级 2-2',
      },
    ],
  },
  {
    id: '3',
    label: '一级 3',
    children: [
      {
        id: '3-1',
        label: '二级 3-1',
        children: [
          {
            id: '3-1-1',
            label: '三级 3-1-1',
          },
          {
            id: '3-1-2',
            label: '三级 3-1-2',
          },
        ],
      },
    ],
  },
]

// 元数据
const meta: Meta<typeof Tree> = {
  title: 'Data/Tree',
  component: Tree,
  tags: ['autodocs'],
  argTypes: {
    data: {
      description: '树形数据',
      control: 'object',
    },
    checkable: {
      description: '是否可勾选',
      control: 'boolean',
    },
    defaultExpandAll: {
      description: '是否默认展开所有节点',
      control: 'boolean',
    },
    highlightCurrent: {
      description: '是否高亮当前节点',
      control: 'boolean',
    },
    expandOnClickNode: {
      description: '是否点击节点展开',
      control: 'boolean',
    },
    size: {
      description: '树形控件尺寸',
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
  args: {
    data: baseData,
    checkable: false,
    defaultExpandAll: false,
    highlightCurrent: false,
    expandOnClickNode: false,
    size: 'md',
  },
}

export default meta
type Story = StoryObj<typeof Tree>

// 基础示例
export const Default: Story = {
  name: '基础用法',
  render: (args) => ({
    components: { Tree },
    setup() {
      return { args }
    },
    template: `
      <Tree v-bind="args" />
    `,
  }),
}

// 可勾选
export const Checkable: Story = {
  name: '可勾选',
  args: {
    checkable: true,
  },
  render: (args) => ({
    components: { Tree },
    setup() {
      return { args }
    },
    template: `
      <Tree v-bind="args" />
    `,
  }),
}

// 默认展开所有
export const DefaultExpandAll: Story = {
  name: '默认展开所有',
  args: {
    defaultExpandAll: true,
  },
  render: (args) => ({
    components: { Tree },
    setup() {
      return { args }
    },
    template: `
      <Tree v-bind="args" />
    `,
  }),
}

// 高亮当前节点
export const HighlightCurrent: Story = {
  name: '高亮当前节点',
  args: {
    highlightCurrent: true,
  },
  render: (args) => ({
    components: { Tree },
    setup() {
      return { args }
    },
    template: `
      <Tree v-bind="args" />
    `,
  }),
}

// 点击节点展开
export const ExpandOnClickNode: Story = {
  name: '点击节点展开',
  args: {
    expandOnClickNode: true,
  },
  render: (args) => ({
    components: { Tree },
    setup() {
      return { args }
    },
    template: `
      <Tree v-bind="args" />
    `,
  }),
}

// 不同尺寸
export const Sizes: Story = {
  name: '不同尺寸',
  render: () => ({
    components: { Tree },
    setup() {
      const data: TreeNode[] = [
        {
          id: '1',
          label: '一级 1',
          children: [
            { id: '1-1', label: '二级 1-1' },
            { id: '1-2', label: '二级 1-2' },
          ],
        },
      ]
      return { data }
    },
    template: `
      <div class="space-y-8">
        <div>
          <div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">小尺寸 (sm)</div>
          <Tree :data="data" size="sm" />
        </div>
        <div>
          <div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">中尺寸 (md)</div>
          <Tree :data="data" size="md" />
        </div>
        <div>
          <div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">大尺寸 (lg)</div>
          <Tree :data="data" size="lg" />
        </div>
      </div>
    `,
  }),
}

// 可勾选 + 默认展开所有
export const CheckableAndExpandAll: Story = {
  name: '可勾选 + 默认展开所有',
  args: {
    checkable: true,
    defaultExpandAll: true,
  },
  render: (args) => ({
    components: { Tree },
    setup() {
      return { args }
    },
    template: `
      <Tree v-bind="args" />
    `,
  }),
}

// 禁用节点
export const DisabledNodes: Story = {
  name: '禁用节点',
  render: () => ({
    components: { Tree },
    setup() {
      const data: TreeNode[] = [
        {
          id: '1',
          label: '一级 1',
          children: [
            { id: '1-1', label: '二级 1-1（禁用）', disabled: true },
            { id: '1-2', label: '二级 1-2' },
          ],
        },
        {
          id: '2',
          label: '一级 2（禁用）',
          disabled: true,
          children: [
            { id: '2-1', label: '二级 2-1' },
            { id: '2-2', label: '二级 2-2' },
          ],
        },
        {
          id: '3',
          label: '一级 3',
          children: [
            { id: '3-1', label: '二级 3-1' },
          ],
        },
      ]
      return { data }
    },
    template: `
      <Tree :data="data" :checkable="true" />
    `,
  }),
}

// 默认选中
export const DefaultChecked: Story = {
  name: '默认选中',
  args: {
    checkable: true,
    defaultCheckedKeys: ['1-1', '2'],
  },
  render: (args) => ({
    components: { Tree },
    setup() {
      return { args }
    },
    template: `
      <Tree v-bind="args" />
    `,
  }),
}

// 默认展开指定节点
export const DefaultExpanded: Story = {
  name: '默认展开指定节点',
  args: {
    defaultExpandedKeys: ['1', '2'],
  },
  render: (args) => ({
    components: { Tree },
    setup() {
      return { args }
    },
    template: `
      <Tree v-bind="args" />
    `,
  }),
}

// 自定义节点内容
export const CustomContent: Story = {
  name: '自定义节点内容',
  render: () => ({
    components: { Tree },
    setup() {
      const data: TreeNode[] = [
        {
          id: '1',
          label: '前端开发',
          children: [
            { id: '1-1', label: 'Vue.js' },
            { id: '1-2', label: 'React' },
            { id: '1-3', label: 'Angular' },
          ],
        },
        {
          id: '2',
          label: '后端开发',
          children: [
            { id: '2-1', label: 'Java' },
            { id: '2-2', label: 'Python' },
            { id: '2-3', label: 'Go' },
          ],
        },
      ]
      return { data }
    },
    template: `
      <Tree :data="data">
        <template #default="{ node, data }">
          <div class="flex items-center gap-2">
            <span class="node-label">{{ node.label }}</span>
            <span class="text-xs text-slate-400">
              {{ data.children?.length || 0 }} 个子项
            </span>
          </div>
        </template>
      </Tree>
    `,
  }),
}

// 文件系统示例
export const FileSystem: Story = {
  name: '文件系统示例',
  render: () => ({
    components: { Tree },
    setup() {
      const fileSystemData: TreeNode[] = [
        {
          id: 'src',
          label: 'src',
          children: [
            {
              id: 'components',
              label: 'components',
              children: [
                { id: 'Header.vue', label: 'Header.vue' },
                { id: 'Footer.vue', label: 'Footer.vue' },
                { id: 'Sidebar.vue', label: 'Sidebar.vue' },
              ],
            },
            {
              id: 'views',
              label: 'views',
              children: [
                { id: 'Home.vue', label: 'Home.vue' },
                { id: 'About.vue', label: 'About.vue' },
                { id: 'Contact.vue', label: 'Contact.vue' },
              ],
            },
            {
              id: 'utils',
              label: 'utils',
              children: [
                { id: 'helpers.ts', label: 'helpers.ts' },
                { id: 'constants.ts', label: 'constants.ts' },
              ],
            },
          ],
        },
        {
          id: 'public',
          label: 'public',
          children: [
            { id: 'favicon.ico', label: 'favicon.ico' },
            { id: 'index.html', label: 'index.html' },
          ],
        },
        {
          id: 'package.json',
          label: 'package.json',
        },
        {
          id: 'vite.config.ts',
          label: 'vite.config.ts',
        },
      ]
      return { fileSystemData }
    },
    template: `
      <div class="w-80">
        <Tree :data="fileSystemData" />
      </div>
    `,
  }),
}

// 事件示例
export const Events: Story = {
  name: '事件示例',
  render: () => ({
    components: { Tree },
    setup() {
      const data: TreeNode[] = [
        {
          id: '1',
          label: '一级 1',
          children: [
            { id: '1-1', label: '二级 1-1' },
            { id: '1-2', label: '二级 1-2' },
          ],
        },
        {
          id: '2',
          label: '一级 2',
          children: [
            { id: '2-1', label: '二级 2-1' },
          ],
        },
      ]
      
      const handleNodeClick = (node: TreeNode) => {
        console.log('节点点击:', node)
      }
      
      const handleNodeExpand = (node: TreeNode, expanded: boolean) => {
        console.log('节点展开/收起:', node.label, expanded)
      }
      
      const handleCheckChange = (node: TreeNode, checked: boolean) => {
        console.log('勾选状态改变:', node.label, checked)
      }
      
      return { data, handleNodeClick, handleNodeExpand, handleCheckChange }
    },
    template: `
      <div>
        <Tree 
          :data="data" 
          :checkable="true"
          @node-click="handleNodeClick"
          @node-expand="handleNodeExpand"
          @check-change="handleCheckChange"
        />
        <div class="mt-4 text-sm text-slate-500">
          打开浏览器控制台查看事件输出
        </div>
      </div>
    `,
  }),
}

// 受控模式
export const Controlled: Story = {
  name: '受控模式',
  render: () => ({
    components: { Tree },
    setup() {
      const data: TreeNode[] = [
        {
          id: '1',
          label: '一级 1',
          children: [
            { id: '1-1', label: '二级 1-1' },
            { id: '1-2', label: '二级 1-2' },
          ],
        },
        {
          id: '2',
          label: '一级 2',
          children: [
            { id: '2-1', label: '二级 2-1' },
          ],
        },
      ]
      
      const expandedKeys = ref(['1'])
      const checkedKeys = ref(['1-1'])
      
      return { data, expandedKeys, checkedKeys }
    },
    template: `
      <div class="space-y-4">
        <div>
          <div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            展开的节点: {{ expandedKeys.join(', ') || '无' }}
          </div>
          <div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            选中的节点: {{ checkedKeys.join(', ') || '无' }}
          </div>
        </div>
        <Tree 
          :data="data" 
          :checkable="true"
          v-model:expanded-keys="expandedKeys"
          v-model:checked-keys="checkedKeys"
        />
      </div>
    `,
  }),
}
