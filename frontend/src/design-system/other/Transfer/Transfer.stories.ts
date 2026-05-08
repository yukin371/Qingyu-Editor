import type { Meta, StoryObj } from '@storybook/vue3'
import Transfer from './Transfer.vue'

/**
 * Transfer 组件 Storybook 故事
 *
 * 展示所有功能、变体和使用场景
 */

import { ref, h, onMounted } from 'vue'

const meta = {
  title: 'Design System/Other/Transfer',
  component: Transfer,
  tags: ['autodocs'],
  argTypes: {
    data: {
      control: 'object',
      description: '数据源',
    },
    modelValue: {
      control: 'object',
      description: '目标列表的键数组',
    },
    filterable: {
      control: 'boolean',
      description: '是否可搜索',
    },
    filterPlaceholder: {
      control: 'text',
      description: '搜索框占位文本',
    },
    titles: {
      control: 'object',
      description: '自定义标题列表',
    },
    buttonTexts: {
      control: 'object',
      description: '按钮文本列表',
    },
    format: {
      control: 'text',
      description: '列表项展示格式',
    },
    targetOrder: {
      control: 'select',
      options: ['original', 'push', 'unshift'],
      description: '目标列表排序方式',
    },
  },
} satisfies Meta<typeof Transfer>

export default meta
type Story = StoryObj<typeof meta>

// 生成测试数据
const generateData = () => {
  const data = []
  for (let i = 1; i <= 15; i++) {
    data.push({
      key: i,
      label: `选项 ${i}`,
      disabled: i % 4 === 0,
    })
  }
  return data
}

// 1. Default - 基础用法
export const Default: Story = {
  render: () => ({
    components: { Transfer },
    setup() {
      const data = generateData()
      const value = ref([1, 4])
      return { data, value }
    },
    template: `
      <div class="p-8 max-w-4xl mx-auto">
        <h3 class="text-lg font-semibold mb-4">基础用法</h3>
        <Transfer v-model="value" :data="data" />
        <div class="mt-4 p-4 bg-slate-100 rounded">
          <p class="text-sm text-slate-600">当前选中：{{ value.join(', ') }}</p>
        </div>
      </div>
    `,
  }),
}

// 2. Filterable - 可搜索
export const Filterable: Story = {
  render: () => ({
    components: { Transfer },
    setup() {
      const data = generateData()
      const value = ref<number[]>([])
      return { data, value }
    },
    template: `
      <div class="p-8 max-w-4xl mx-auto">
        <h3 class="text-lg font-semibold mb-4">可搜索</h3>
        <Transfer v-model="value" :data="data" :filterable="true" />
      </div>
    `,
  }),
}

// 3. CustomProps - 自定义字段名
export const CustomProps: Story = {
  render: () => ({
    components: { Transfer },
    setup() {
      const data = [
        { id: 1, name: '张三', disabled: false },
        { id: 2, name: '李四', disabled: false },
        { id: 3, name: '王五', disabled: true },
        { id: 4, name: '赵六', disabled: false },
        { id: 5, name: '钱七', disabled: false },
      ]
      const value = ref([1, 3])
      const customProps = {
        key: 'id',
        label: 'name',
        disabled: 'disabled',
      }
      return { data, value, customProps }
    },
    template: `
      <div class="p-8 max-w-4xl mx-auto">
        <h3 class="text-lg font-semibold mb-4">自定义字段名</h3>
        <Transfer v-model="value" :data="data" :props="customProps" />
      </div>
    `,
  }),
}

// 4. CustomRender - 自定义渲染
export const CustomRender: Story = {
  render: () => ({
    components: { Transfer },
    setup() {
      const data = [
        { key: 1, name: 'Vue.js', description: '渐进式 JavaScript 框架', icon: '🟢' },
        { key: 2, name: 'React', description: '用于构建用户界面的 JavaScript 库', icon: '⚛️' },
        { key: 3, name: 'Angular', description: '平台和框架', icon: '🅰️' },
        { key: 4, name: 'Svelte', description: '赛博朋克式的 Web 应用框架', icon: '🔥' },
        { key: 5, name: 'Nuxt', description: 'Vue.js 元框架', icon: '🟢' },
      ]
      const value = ref<number[]>([])
      const renderContent = (item: any) => {
        return h('div', { class: 'flex items-center' }, [
          h('span', { class: 'text-2xl mr-3' }, item.icon),
          h('div', [
            h('div', { class: 'font-semibold text-slate-800' }, item.name),
            h('div', { class: 'text-xs text-slate-500' }, item.description),
          ]),
        ])
      }
      return { data, value, renderContent, h }
    },
    template: `
      <div class="p-8 max-w-4xl mx-auto">
        <h3 class="text-lg font-semibold mb-4">自定义渲染</h3>
        <Transfer v-model="value" :data="data" :render-content="renderContent" />
      </div>
    `,
  }),
}

// 5. Pagination - 分页数据
export const Pagination: Story = {
  render: () => ({
    components: { Transfer },
    setup() {
      const data = ref<any[]>([])
      const value = ref<number[]>([])

      // 模拟分页数据加载
      onMounted(() => {
        const allData = []
        for (let i = 1; i <= 50; i++) {
          allData.push({
            key: i,
            label: `项目 ${i}`,
            disabled: false,
          })
        }
        data.value = allData
      })

      return { data, value }
    },
    template: `
      <div class="p-8 max-w-4xl mx-auto">
        <h3 class="text-lg font-semibold mb-4">分页数据（50条）</h3>
        <p class="text-sm text-slate-600 mb-4">支持大数据量的场景，配合可搜索功能使用效果更佳</p>
        <Transfer v-model="value" :data="data" :filterable="true" />
      </div>
    `,
  }),
}

// 6. Titles - 自定义标题
export const Titles: Story = {
  render: () => ({
    components: { Transfer },
    setup() {
      const data = generateData()
      const value = ref<number[]>([])
      const titles = ['所有用户', '已选中用户']
      return { data, value, titles }
    },
    template: `
      <div class="p-8 max-w-4xl mx-auto">
        <h3 class="text-lg font-semibold mb-4">自定义标题</h3>
        <Transfer v-model="value" :data="data" :titles="titles" />
      </div>
    `,
  }),
}

// 7. ButtonTexts - 自定义按钮文本
export const ButtonTexts: Story = {
  render: () => ({
    components: { Transfer },
    setup() {
      const data = generateData()
      const value = ref<number[]>([])
      const buttonTexts = ['添加', '移除']
      return { data, value, buttonTexts }
    },
    template: `
      <div class="p-8 max-w-4xl mx-auto">
        <h3 class="text-lg font-semibold mb-4">自定义按钮文本</h3>
        <Transfer v-model="value" :data="data" :button-texts="buttonTexts" />
      </div>
    `,
  }),
}

// 8. Aliased - 使用别名
export const Aliased: Story = {
  render: () => ({
    components: { Transfer },
    setup() {
      const data = [
        { key: 'beijing', label: '北京' },
        { key: 'shanghai', label: '上海' },
        { key: 'guangzhou', label: '广州' },
        { key: 'shenzhen', label: '深圳' },
        { key: 'hangzhou', label: '杭州' },
        { key: 'nanjing', label: '南京' },
        { key: 'chengdu', label: '成都' },
        { key: 'wuhan', label: '武汉' },
      ]
      const value = ref(['beijing', 'shanghai'])
      return { data, value }
    },
    template: `
      <div class="p-8 max-w-4xl mx-auto">
        <h3 class="text-lg font-semibold mb-4">使用字符串别名</h3>
        <Transfer v-model="value" :data="data" />
      </div>
    `,
  }),
}

// 9. FilterMethod - 自定义搜索
export const FilterMethod: Story = {
  render: () => ({
    components: { Transfer },
    setup() {
      const data = [
        { key: 1, label: 'Apple', price: 5.5 },
        { key: 2, label: 'Banana', price: 3.2 },
        { key: 3, label: 'Orange', price: 4.8 },
        { key: 4, label: 'Grape', price: 8.0 },
        { key: 5, label: 'Mango', price: 6.5 },
        { key: 6, label: 'Pineapple', price: 7.2 },
        { key: 7, label: 'Strawberry', price: 10.0 },
        { key: 8, label: 'Watermelon', price: 3.5 },
      ]
      const value = ref<number[]>([])

      // 自定义搜索方法：同时搜索名称和价格
      const filterMethod = (query: string, item: any) => {
        const q = query.toLowerCase()
        return (
          item.label.toLowerCase().includes(q) ||
          item.price.toString().includes(q)
        )
      }

      return { data, value, filterMethod }
    },
    template: `
      <div class="p-8 max-w-4xl mx-auto">
        <h3 class="text-lg font-semibold mb-4">自定义搜索方法</h3>
        <p class="text-sm text-slate-600 mb-4">可以搜索水果名称或价格</p>
        <Transfer v-model="value" :data="data" :filterable="true" :filter-method="filterMethod" />
      </div>
    `,
  }),
}

// 10. TargetOrder - 目标排序
export const TargetOrder: Story = {
  render: () => ({
    components: { Transfer },
    setup() {
      const data = generateData()
      const value1 = ref([1, 4, 7])
      const value2 = ref([1, 4, 7])
      const value3 = ref([1, 4, 7])
      return { data, value1, value2, value3 }
    },
    template: `
      <div class="p-8 space-y-8">
        <div>
          <h3 class="text-lg font-semibold mb-4">original - 原始顺序</h3>
          <Transfer v-model="value1" :data="data" target-order="original" />
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-4">push - 追加到末尾</h3>
          <Transfer v-model="value2" :data="data" target-order="push" />
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-4">unshift - 插入到开头</h3>
          <Transfer v-model="value3" :data="data" target-order="unshift" />
        </div>
      </div>
    `,
  }),
}

// 11. FullFeatured - 完整功能演示
export const FullFeatured: Story = {
  render: () => ({
    components: { Transfer },
    setup() {
      const users = [
        { id: 1, name: '张三', email: 'zhangsan@example.com', role: '开发者' },
        { id: 2, name: '李四', email: 'lisi@example.com', role: '设计师' },
        { id: 3, name: '王五', email: 'wangwu@example.com', role: '产品经理' },
        { id: 4, name: '赵六', email: 'zhaoliu@example.com', role: '开发者' },
        { id: 5, name: '钱七', email: 'qianqi@example.com', role: '测试工程师' },
        { id: 6, name: '孙八', email: 'sunba@example.com', role: '开发者' },
        { id: 7, name: '周九', email: 'zhoujiu@example.com', role: '运维工程师' },
        { id: 8, name: '吴十', email: 'wushi@example.com', role: '设计师' },
      ]
      const selectedUsers = ref<number[]>([1, 3, 5])

      const customProps = {
        key: 'id',
        label: 'name',
        disabled: 'disabled',
      }

      const titles = ['所有用户', '团队成员']

      const renderContent = (item: any) => {
        return h('div', { class: 'flex items-center justify-between w-full' }, [
          h('div', { class: 'flex items-center' }, [
            h('div', {
              class: 'w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-semibold mr-3'
            }, item.name[0]),
            h('div', [
              h('div', { class: 'text-sm font-medium text-slate-800' }, item.name),
              h('div', { class: 'text-xs text-slate-500' }, item.email),
            ]),
          ]),
          h('span', { class: 'px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded' }, item.role),
        ])
      }

      const handleLeftCheckChange = (checkedValues: number[], checkedItems: any[]) => {
        console.log('左侧选中变化:', checkedValues, checkedItems)
      }

      const handleRightCheckChange = (checkedValues: number[], checkedItems: any[]) => {
        console.log('右侧选中变化:', checkedValues, checkedItems)
      }

      const handleChange = (targetValue: number[], direction: string, movedKeys: number[]) => {
        console.log('列表变化:', targetValue, direction, movedKeys)
      }

      return {
        users,
        selectedUsers,
        customProps,
        titles,
        renderContent,
        handleLeftCheckChange,
        handleRightCheckChange,
        handleChange,
        h,
      }
    },
    template: `
      <div class="p-8 max-w-6xl mx-auto">
        <h3 class="text-xl font-bold mb-6">完整功能演示 - 团队成员管理</h3>
        <Transfer
          v-model="selectedUsers"
          :data="users"
          :props="customProps"
          :titles="titles"
          :filterable="true"
          filter-placeholder="搜索用户名或邮箱"
          :render-content="renderContent"
          target-order="push"
          @left-check-change="handleLeftCheckChange"
          @right-check-change="handleRightCheckChange"
          @change="handleChange"
        />
        <div class="mt-6 p-4 bg-slate-100 rounded-lg">
          <h4 class="text-sm font-semibold text-slate-700 mb-2">已选团队成员（{{ selectedUsers.length }}）</h4>
          <p class="text-xs text-slate-600">ID: {{ selectedUsers.join(', ') }}</p>
        </div>
      </div>
    `,
  }),
}

// 12. DisabledItems - 禁用项
export const DisabledItems: Story = {
  render: () => ({
    components: { Transfer },
    setup() {
      const data = [
        { key: 1, label: '可选项 1', disabled: false },
        { key: 2, label: '禁用项 1', disabled: true },
        { key: 3, label: '可选项 2', disabled: false },
        { key: 4, label: '禁用项 2', disabled: true },
        { key: 5, label: '可选项 3', disabled: false },
        { key: 6, label: '禁用项 3', disabled: true },
        { key: 7, label: '可选项 4', disabled: false },
      ]
      const value = ref([2, 4])
      return { data, value }
    },
    template: `
      <div class="p-8 max-w-4xl mx-auto">
        <h3 class="text-lg font-semibold mb-4">禁用项</h3>
        <p class="text-sm text-slate-600 mb-4">禁用的项无法被选中或移动</p>
        <Transfer v-model="value" :data="data" />
      </div>
    `,
  }),
}

// 13. EmptyState - 空状态
export const EmptyState: Story = {
  render: () => ({
    components: { Transfer },
    setup() {
      const data = ref<any[]>([])
      const value = ref<number[]>([])

      // 模拟异步加载数据
      setTimeout(() => {
        data.value = [
          { key: 1, label: '延迟加载的数据 1' },
          { key: 2, label: '延迟加载的数据 2' },
          { key: 3, label: '延迟加载的数据 3' },
        ]
      }, 2000)

      return { data, value }
    },
    template: `
      <div class="p-8 max-w-4xl mx-auto">
        <h3 class="text-lg font-semibold mb-4">空状态</h3>
        <p class="text-sm text-slate-600 mb-4">数据将在 2 秒后加载</p>
        <Transfer v-model="value" :data="data" :filterable="true" />
      </div>
    `,
  }),
}

// 14. Responsive - 响应式布局
export const Responsive: Story = {
  render: () => ({
    components: { Transfer },
    setup() {
      const data = generateData()
      const value = ref<number[]>([])
      return { data, value }
    },
    template: `
      <div class="p-8">
        <h3 class="text-lg font-semibold mb-4">响应式布局</h3>
        <p class="text-sm text-slate-600 mb-4">尝试调整浏览器窗口大小</p>
        <Transfer v-model="value" :data="data" :filterable="true" />
      </div>
    `,
  }),
}

// 15. Validation - 表单验证
export const Validation: Story = {
  render: () => ({
    components: { Transfer },
    setup() {
      const data = generateData()
      const value = ref<number[]>([])
      const error = ref('')

      const validate = () => {
        if (value.value.length === 0) {
          error.value = '请至少选择一项'
          return false
        }
        if (value.value.length > 5) {
          error.value = '最多只能选择 5 项'
          return false
        }
        error.value = ''
        return true
      }

      const handleSubmit = () => {
        if (validate()) {
          alert('提交成功！选中项：' + value.value.join(', '))
        }
      }

      return { data, value, error, validate, handleSubmit }
    },
    template: `
      <div class="p-8 max-w-4xl mx-auto">
        <h3 class="text-lg font-semibold mb-4">表单验证</h3>
        <p class="text-sm text-slate-600 mb-4">请选择 1-5 项</p>
        <Transfer v-model="value" :data="data" @change="validate" />

        <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <button
          @click="handleSubmit"
          class="mt-4 px-6 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
        >
          提交
        </button>
      </div>
    `,
  }),
}
