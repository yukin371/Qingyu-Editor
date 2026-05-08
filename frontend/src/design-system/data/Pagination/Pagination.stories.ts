/**
 * Pagination 组件 Storybook 故事
 */

// @ts-nocheck - Storybook file with flexible type assertions
import { computed, ref } from 'vue'

import type { Meta, StoryObj } from '@storybook/vue3'
import Pagination from './Pagination.vue'

const meta = {
  title: 'Data/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  argTypes: {
    currentPage: {
      control: 'number',
      description: '当前页数',
    },
    pageSize: {
      control: 'number',
      description: '每页显示条目个数',
    },
    total: {
      control: 'number',
      description: '总条目数',
    },
    pageSizes: {
      control: 'object',
      description: '每页显示个数选择器的选项设置',
    },
    layout: {
      control: 'text',
      description: '组件布局 (prev, pager, next, jumper, sizes, total)',
    },
    background: {
      control: 'boolean',
      description: '是否为分页按钮添加背景色',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
    hideOnSinglePage: {
      control: 'boolean',
      description: '只有一页时是否隐藏',
    },
  },
  args: {
    currentPage: 1,
    pageSize: 10,
    total: 100,
    pageSizes: [10, 20, 30, 40, 50],
    layout: 'prev, pager, next',
    background: false,
    disabled: false,
    hideOnSinglePage: false,
  },
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 默认分页器
 */
export const Default: Story = {
  args: {
    total: 100,
    pageSize: 10,
    currentPage: 1,
  },
  render: (args) => ({
    components: { Pagination },
    setup() {
      return { args }
    },
    template: `
      <div class="flex items-center justify-center p-8">
        <Pagination v-bind="args" />
      </div>
    `,
  }),
}

/**
 * 完整功能分页器
 * 包含总数、每页数量选择、页码、跳转等功能
 */
export const FullFeatured: Story = {
  args: {
    total: 1000,
    pageSize: 20,
    currentPage: 5,
    layout: 'total, sizes, prev, pager, next, jumper',
    pageSizes: [10, 20, 50, 100],
  },
  render: (args) => ({
    components: { Pagination },
    setup() {
      return { args }
    },
    template: `
      <div class="flex items-center justify-center p-8">
        <Pagination v-bind="args" />
      </div>
    `,
  }),
}

/**
 * 带背景色的分页器
 */
export const WithBackground: Story = {
  args: {
    total: 100,
    pageSize: 10,
    currentPage: 3,
    background: true,
  },
  render: (args) => ({
    components: { Pagination },
    setup() {
      return { args }
    },
    template: `
      <div class="flex items-center justify-center p-8">
        <Pagination v-bind="args" />
      </div>
    `,
  }),
}

/**
 * 小数据量分页器
 * 总页数较少时显示所有页码
 */
export const SmallTotal: Story = {
  args: {
    total: 50,
    pageSize: 10,
    currentPage: 2,
  },
  render: (args) => ({
    components: { Pagination },
    setup() {
      return { args }
    },
    template: `
      <div class="flex items-center justify-center p-8">
        <Pagination v-bind="args" />
      </div>
    `,
  }),
}

/**
 * 大数据量分页器
 * 总页数较多时使用省略号
 */
export const LargeTotal: Story = {
  args: {
    total: 1000,
    pageSize: 10,
    currentPage: 50,
  },
  render: (args) => ({
    components: { Pagination },
    setup() {
      return { args }
    },
    template: `
      <div class="flex items-center justify-center p-8">
        <Pagination v-bind="args" />
      </div>
    `,
  }),
}

/**
 * 第一页
 */
export const FirstPage: Story = {
  args: {
    total: 100,
    pageSize: 10,
    currentPage: 1,
  },
  render: (args) => ({
    components: { Pagination },
    setup() {
      return { args }
    },
    template: `
      <div class="flex items-center justify-center p-8">
        <Pagination v-bind="args" />
      </div>
    `,
  }),
}

/**
 * 最后一页
 */
export const LastPage: Story = {
  args: {
    total: 100,
    pageSize: 10,
    currentPage: 10,
  },
  render: (args) => ({
    components: { Pagination },
    setup() {
      return { args }
    },
    template: `
      <div class="flex items-center justify-center p-8">
        <Pagination v-bind="args" />
      </div>
    `,
  }),
}

/**
 * 禁用状态
 */
export const Disabled: Story = {
  args: {
    total: 100,
    pageSize: 10,
    currentPage: 5,
    disabled: true,
  },
  render: (args) => ({
    components: { Pagination },
    setup() {
      return { args }
    },
    template: `
      <div class="flex items-center justify-center p-8">
        <Pagination v-bind="args" />
      </div>
    `,
  }),
}

/**
 * 只有一页时隐藏
 */
export const HideOnSinglePage: Story = {
  render: () => ({
    components: { Pagination },
    setup() {
      const visible = ref(true)
      const total = ref(100)
      const toggle = () => {
        total.value = total.value === 100 ? 5 : 100
      }
      return { visible, total, toggle }
    },
    template: `
      <div class="space-y-4">
        <div class="flex items-center justify-center p-8 border border-slate-200 dark:border-slate-700 rounded-md">
          <div v-if="total === 100" class="text-slate-600 dark:text-slate-400">
            总数 100 条，显示分页
          </div>
          <div v-else class="text-slate-600 dark:text-slate-400">
            总数 5 条，分页隐藏
          </div>
        </div>
        <div class="flex items-center justify-center p-8">
          <Pagination :total="total" :page-size="10" hide-on-single-page />
        </div>
        <div class="flex justify-center">
          <button
            @click="toggle"
            class="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
          >
            切换总数 (100/5)
          </button>
        </div>
      </div>
    `,
  }),
}

/**
 * 不同布局组合
 */
export const LayoutCombinations: Story = {
  render: () => ({
    components: { Pagination },
    template: `
      <div class="space-y-8">
        <div>
          <div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">prev, pager, next</div>
          <div class="flex items-center justify-center p-8 border border-slate-200 dark:border-slate-700 rounded-md">
            <Pagination :total="100" :page-size="10" layout="prev, pager, next" />
          </div>
        </div>

        <div>
          <div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">total, sizes, prev, pager, next, jumper</div>
          <div class="flex items-center justify-center p-8 border border-slate-200 dark:border-slate-700 rounded-md">
            <Pagination :total="1000" :page-size="20" layout="total, sizes, prev, pager, next, jumper" />
          </div>
        </div>

        <div>
          <div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">sizes, pager</div>
          <div class="flex items-center justify-center p-8 border border-slate-200 dark:border-slate-700 rounded-md">
            <Pagination :total="100" :page-size="10" layout="sizes, pager" />
          </div>
        </div>

        <div>
          <div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">prev, next</div>
          <div class="flex items-center justify-center p-8 border border-slate-200 dark:border-slate-700 rounded-md">
            <Pagination :total="100" :page-size="10" layout="prev, next" />
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * 实际应用示例
 * 展示在表格中的使用
 */
export const TableExample: Story = {
  render: () => ({
    components: { Pagination },
    setup() {
      const currentPage = ref(1)
      const pageSize = ref(10)
      const total = ref(100)

      const data = computed(() => {
        const start = (currentPage.value - 1) * pageSize.value
        const end = start + pageSize.value
        return Array.from({ length: Math.min(pageSize.value, total.value - start) }, (_, i) => ({
          id: start + i + 1,
          name: `项目 ${start + i + 1}`,
          status: ['进行中', '已完成', '待开始'][Math.floor(Math.random() * 3)],
        }))
      })

      return { currentPage, pageSize, total, data }
    },
    template: `
      <div class="space-y-4">
        <div class="border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden">
          <table class="w-full">
            <thead class="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">ID</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">名称</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">状态</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
              <tr v-for="item in data" :key="item.id" class="bg-white dark:bg-slate-900">
                <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{{ item.id }}</td>
                <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{{ item.name }}</td>
                <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{{ item.status }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex justify-center p-4">
          <Pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
          />
        </div>
      </div>
    `,
  }),
}

/**
 * 所有变体
 */
export const AllVariants: Story = {
  render: () => ({
    components: { Pagination },
    template: `
      <div class="space-y-8">
        <div>
          <div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">默认样式</div>
          <div class="flex items-center justify-center p-8 border border-slate-200 dark:border-slate-700 rounded-md">
            <Pagination :total="100" :page-size="10" :current-page="5" />
          </div>
        </div>

        <div>
          <div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">带背景色</div>
          <div class="flex items-center justify-center p-8 border border-slate-200 dark:border-slate-700 rounded-md">
            <Pagination :total="100" :page-size="10" :current-page="5" background />
          </div>
        </div>

        <div>
          <div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">小数据量</div>
          <div class="flex items-center justify-center p-8 border border-slate-200 dark:border-slate-700 rounded-md">
            <Pagination :total="30" :page-size="10" :current-page="2" />
          </div>
        </div>

        <div>
          <div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">大数据量</div>
          <div class="flex items-center justify-center p-8 border border-slate-200 dark:border-slate-700 rounded-md">
            <Pagination :total="1000" :page-size="10" :current-page="50" />
          </div>
        </div>
      </div>
    `,
  }),
}
