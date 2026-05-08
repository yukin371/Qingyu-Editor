/**
 * Table 组件 Storybook 故事
 */

import { ref, h, computed } from 'vue'

import type { Meta, StoryObj } from '@storybook/vue3'
import Table from './Table.vue'
import type { Column, TableRowData } from './types'

const meta = {
  title: 'Data/Table',
  component: Table,
  tags: ['autodocs'],
  argTypes: {
    data: {
      control: 'object',
      description: '表格数据',
    },
    columns: {
      control: 'object',
      description: '列配置',
    },
    border: {
      control: 'boolean',
      description: '是否显示纵向边框',
    },
    stripe: {
      control: 'boolean',
      description: '是否显示斑马纹',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '表格尺寸',
    },
    fit: {
      control: 'boolean',
      description: '列宽度是否自撑开',
    },
    showHeader: {
      control: 'boolean',
      description: '是否显示表头',
    },
    highlightCurrentRow: {
      control: 'boolean',
      description: '是否高亮当前行',
    },
    emptyText: {
      control: 'text',
      description: '空数据时显示的文本内容',
    },
  },
  args: {
    data: [
      { id: 1, name: '张三', age: 25, email: 'zhangsan@example.com', status: '在职' },
      { id: 2, name: '李四', age: 30, email: 'lisi@example.com', status: '在职' },
      { id: 3, name: '王五', age: 28, email: 'wangwu@example.com', status: '离职' },
    ],
    columns: [
      { prop: 'id', label: 'ID', width: 80, align: 'center' },
      { prop: 'name', label: '姓名', width: 120 },
      { prop: 'age', label: '年龄', width: 80, align: 'center' },
      { prop: 'email', label: '邮箱' },
      { prop: 'status', label: '状态', width: 100, align: 'center' },
    ],
    border: false,
    stripe: false,
    size: 'md',
    fit: true,
    showHeader: true,
    highlightCurrentRow: false,
    emptyText: '暂无数据',
  },
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

// 示例数据
const sampleData: TableRowData[] = [
  { id: 1, name: '张三', age: 25, email: 'zhangsan@example.com', status: '在职', department: '技术部' },
  { id: 2, name: '李四', age: 30, email: 'lisi@example.com', status: '在职', department: '产品部' },
  { id: 3, name: '王五', age: 28, email: 'wangwu@example.com', status: '离职', department: '设计部' },
  { id: 4, name: '赵六', age: 32, email: 'zhaoliu@example.com', status: '在职', department: '技术部' },
  { id: 5, name: '孙七', age: 27, email: 'sunqi@example.com', status: '在职', department: '市场部' },
]

const sampleColumns: Column[] = [
  { prop: 'id', label: 'ID', width: 80, align: 'center' },
  { prop: 'name', label: '姓名', width: 120 },
  { prop: 'age', label: '年龄', width: 80, align: 'center', sortable: true },
  { prop: 'email', label: '邮箱' },
  { prop: 'department', label: '部门', width: 100 },
  { prop: 'status', label: '状态', width: 100, align: 'center' },
]

/**
 * 默认表格
 */
export const Default: Story = {
  args: {
    data: sampleData,
    columns: sampleColumns,
  },
  render: (args) => ({
    components: { Table },
    setup() {
      return { args }
    },
    template: `
      <div class="p-8">
        <Table v-bind="args" />
      </div>
    `,
  }),
}

/**
 * 带边框的表格
 */
export const WithBorder: Story = {
  args: {
    data: sampleData,
    columns: sampleColumns,
    border: true,
  },
  render: (args) => ({
    components: { Table },
    setup() {
      return { args }
    },
    template: `
      <div class="p-8">
        <Table v-bind="args" />
      </div>
    `,
  }),
}

/**
 * 斑马纹表格
 */
export const WithStripe: Story = {
  args: {
    data: sampleData,
    columns: sampleColumns,
    stripe: true,
  },
  render: (args) => ({
    components: { Table },
    setup() {
      return { args }
    },
    template: `
      <div class="p-8">
        <Table v-bind="args" />
      </div>
    `,
  }),
}

/**
 * 边框 + 斑马纹
 */
export const BorderAndStripe: Story = {
  args: {
    data: sampleData,
    columns: sampleColumns,
    border: true,
    stripe: true,
  },
  render: (args) => ({
    components: { Table },
    setup() {
      return { args }
    },
    template: `
      <div class="p-8">
        <Table v-bind="args" />
      </div>
    `,
  }),
}

/**
 * 小尺寸表格
 */
export const SmallSize: Story = {
  args: {
    data: sampleData,
    columns: sampleColumns,
    size: 'sm',
  },
  render: (args) => ({
    components: { Table },
    setup() {
      return { args }
    },
    template: `
      <div class="p-8">
        <Table v-bind="args" />
      </div>
    `,
  }),
}

/**
 * 大尺寸表格
 */
export const LargeSize: Story = {
  args: {
    data: sampleData,
    columns: sampleColumns,
    size: 'lg',
  },
  render: (args) => ({
    components: { Table },
    setup() {
      return { args }
    },
    template: `
      <div class="p-8">
        <Table v-bind="args" />
      </div>
    `,
  }),
}

/**
 * 高亮当前行
 */
export const HighlightCurrentRow: Story = {
  render: () => ({
    components: { Table },
    setup() {
      const data = ref(sampleData)
      const columns = ref(sampleColumns)

      const handleRowClick = (row: any) => {
        console.log('点击了行:', row)
      }

      return { data, columns, handleRowClick }
    },
    template: `
      <div class="p-8">
        <Table
          :data="data"
          :columns="columns"
          highlight-current-row
          @row-click="handleRowClick"
        />
      </div>
    `,
  }),
}

/**
 * 隐藏表头
 */
export const NoHeader: Story = {
  args: {
    data: sampleData,
    columns: sampleColumns,
    showHeader: false,
  },
  render: (args) => ({
    components: { Table },
    setup() {
      return { args }
    },
    template: `
      <div class="p-8">
        <Table v-bind="args" />
      </div>
    `,
  }),
}

/**
 * 空数据状态
 */
export const EmptyData: Story = {
  args: {
    data: [],
    columns: sampleColumns,
    emptyText: '暂无员工数据',
  },
  render: (args) => ({
    components: { Table },
    setup() {
      return { args }
    },
    template: `
      <div class="p-8">
        <Table v-bind="args" />
      </div>
    `,
  }),
}

/**
 * 自定义列渲染
 */
export const CustomRender: Story = {
  render: () => ({
    components: { Table },
    setup() {
      const data = ref(sampleData)
      const columns: Column[] = [
        { prop: 'id', label: 'ID', width: 80, align: 'center' },
        { prop: 'name', label: '姓名', width: 120 },
        { prop: 'age', label: '年龄', width: 80, align: 'center', sortable: true },
        {
          prop: 'status',
          label: '状态',
          width: 120,
          align: 'center',
          render: (row: any) => {
            return row.status === '在职'
              ? h('span', { class: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' }, '在职')
              : h('span', { class: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }, '离职')
          },
        },
        {
          prop: 'actions',
          label: '操作',
          width: 150,
          align: 'center',
          render: (row: any) => {
            return h('div', { class: 'flex items-center justify-center gap-2' }, [
              h('button', {
                class: 'text-primary-600 hover:text-primary-700 text-sm',
                onClick: () => console.log('编辑', row)
              }, '编辑'),
              h('button', {
                class: 'text-red-600 hover:text-red-700 text-sm',
                onClick: () => console.log('删除', row)
              }, '删除'),
            ])
          },
        },
      ]

      return { data, columns }
    },
    template: `
      <div class="p-8">
        <Table :data="data" :columns="columns" />
      </div>
    `,
  }),
}

/**
 * 可排序表格
 */
export const Sortable: Story = {
  render: () => ({
    components: { Table },
    setup() {
      const data = ref(sampleData)
      const columns = ref([
        { prop: 'id', label: 'ID', width: 80, align: 'center', sortable: true },
        { prop: 'name', label: '姓名', width: 120 },
        { prop: 'age', label: '年龄', width: 80, align: 'center', sortable: true },
        { prop: 'email', label: '邮箱' },
        { prop: 'department', label: '部门', width: 100, sortable: true },
        { prop: 'status', label: '状态', width: 100, align: 'center' },
      ])

      const handleSortChange = (sort: any) => {
        console.log('排序变化:', sort)
      }

      return { data, columns, handleSortChange }
    },
    template: `
      <div class="p-8">
        <Table
          :data="data"
          :columns="columns"
          @sort-change="handleSortChange"
        />
      </div>
    `,
  }),
}

/**
 * 列对齐
 */
export const ColumnAlign: Story = {
  render: () => ({
    components: { Table },
    setup() {
      const data = ref(sampleData)
      const columns: Column[] = [
        { prop: 'id', label: 'ID (居中)', width: 100, align: 'center' },
        { prop: 'name', label: '姓名 (左对齐)', width: 150 },
        { prop: 'age', label: '年龄 (居中)', width: 100, align: 'center' },
        { prop: 'salary', label: '薪资 (右对齐)', width: 120, align: 'right' },
        { prop: 'email', label: '邮箱 (左对齐)' },
      ]

      return { data, columns }
    },
    template: `
      <div class="p-8">
        <Table :data="data" :columns="columns" border />
      </div>
    `,
  }),
}

/**
 * 自定义行样式
 */
export const CustomRowStyle: Story = {
  render: () => ({
    components: { Table },
    setup() {
      const data = ref(sampleData)
      const columns = ref(sampleColumns)

      const rowClassName = (row: any) => {
        if (row.status === '离职') {
          return 'bg-red-50 dark:bg-red-900/10'
        }
        return ''
      }

      return { data, columns, rowClassName }
    },
    template: `
      <div class="p-8">
        <Table
          :data="data"
          :columns="columns"
          :row-class-name="rowClassName"
          stripe
        />
      </div>
    `,
  }),
}

/**
 * 所有尺寸对比
 */
export const AllSizes: Story = {
  render: () => ({
    components: { Table },
    setup() {
      const data = ref(sampleData)
      const columns = ref(sampleColumns)

      return { data, columns }
    },
    template: `
      <div class="space-y-8 p-8">
        <div>
          <div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">小尺寸 (sm)</div>
          <Table :data="data" :columns="columns" size="sm" border />
        </div>

        <div>
          <div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">默认尺寸 (md)</div>
          <Table :data="data" :columns="columns" size="md" border />
        </div>

        <div>
          <div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">大尺寸 (lg)</div>
          <Table :data="data" :columns="columns" size="lg" border />
        </div>
      </div>
    `,
  }),
}

/**
 * 样式组合
 */
export const StyleCombinations: Story = {
  render: () => ({
    components: { Table },
    setup() {
      const data = ref(sampleData)
      const columns = ref(sampleColumns)

      return { data, columns }
    },
    template: `
      <div class="space-y-8 p-8">
        <div>
          <div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">默认样式</div>
          <Table :data="data" :columns="columns" />
        </div>

        <div>
          <div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">带边框</div>
          <Table :data="data" :columns="columns" border />
        </div>

        <div>
          <div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">斑马纹</div>
          <Table :data="data" :columns="columns" stripe />
        </div>

        <div>
          <div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">边框 + 斑马纹</div>
          <Table :data="data" :columns="columns" border stripe />
        </div>

        <div>
          <div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">边框 + 斑马纹 + 高亮当前行</div>
          <Table :data="data" :columns="columns" border stripe highlight-current-row />
        </div>
      </div>
    `,
  }),
}

/**
 * 事件示例
 */
export const Events: Story = {
  render: () => ({
    components: { Table },
    setup() {
      const data = ref(sampleData)
      const columns = ref(sampleColumns)
      const lastEvent = ref('')

      const handleRowClick = (row: any) => {
        lastEvent.value = `点击了行: ${row.name}`
      }

      const handleRowDblclick = (row: any) => {
        lastEvent.value = `双击了行: ${row.name}`
      }

      const handleSortChange = (sort: any) => {
        lastEvent.value = `排序: ${sort.prop} - ${sort.order || '无'}`
      }

      return { data, columns, lastEvent, handleRowClick, handleRowDblclick, handleSortChange }
    },
    template: `
      <div class="space-y-4 p-8">
        <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-md">
          <div class="text-sm text-slate-600 dark:text-slate-400">最后事件: {{ lastEvent || '无' }}</div>
        </div>
        <Table
          :data="data"
          :columns="columns"
          border
          stripe
          @row-click="handleRowClick"
          @row-dblclick="handleRowDblclick"
          @sort-change="handleSortChange"
        />
      </div>
    `,
  }),
}

/**
 * 大数据量表格
 */
export const LargeData: Story = {
  render: () => ({
    components: { Table },
    setup() {
      const data = computed(() => {
        return Array.from({ length: 50 }, (_, i) => ({
          id: i + 1,
          name: `员工 ${i + 1}`,
          age: 20 + (i % 30),
          email: `employee${i + 1}@example.com`,
          department: ['技术部', '产品部', '设计部', '市场部'][i % 4],
          status: i % 5 === 0 ? '离职' : '在职',
        }))
      })
      const columns = ref(sampleColumns)

      return { data, columns }
    },
    template: `
      <div class="p-8">
        <div class="mb-4 text-sm text-slate-600 dark:text-slate-400">
          共 {{ data.length }} 条数据
        </div>
        <Table :data="data" :columns="columns" border stripe />
      </div>
    `,
  }),
}
