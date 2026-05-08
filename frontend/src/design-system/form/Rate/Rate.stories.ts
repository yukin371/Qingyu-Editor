// @ts-nocheck - Storybook stories with flexible component types
import type { Meta, StoryObj } from '@storybook/vue3'
import Rate from './Rate.vue'

/**
 * Rate 组件 Storybook 故事
 *
 * 展示所有尺寸、颜色和功能
 */

import { ref, computed } from 'vue'

const meta = {
  title: 'Design System/Form/Rate',
  component: Rate,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'number',
      description: 'v-model 绑定值',
    },
    max: {
      control: 'number',
      description: '最大分数',
    },
    disabled: {
      control: 'boolean',
      description: '禁用状态',
    },
    allowHalf: {
      control: 'boolean',
      description: '是否允许半星',
    },
    readonly: {
      control: 'boolean',
      description: '只读模式',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Rate 尺寸',
    },
    color: {
      control: 'text',
      description: '选中颜色',
    },
    voidColor: {
      control: 'text',
      description: '未选中颜色',
    },
    showScore: {
      control: 'boolean',
      description: '显示分数',
    },
    texts: {
      control: 'object',
      description: '分数对应的文字',
    },
  },
} satisfies Meta<typeof Rate>

export default meta
type Story = StoryObj<typeof meta>

// 默认故事
export const Default: Story = {
  args: {
    modelValue: 0,
    max: 5,
    size: 'md',
  },
  render: (args) => ({
    components: { Rate },
    setup() {
      const value = ref(args.modelValue)
      return { args, value }
    },
    template: `
      <div class="p-8 space-y-4">
        <Rate v-bind="args" v-model="value" />
        <div class="text-sm text-slate-600">当前评分: {{ value }}</div>
      </div>
    `,
  }),
}

// 所有尺寸
export const AllSizes: Story = {
  render: () => ({
    components: { Rate },
    setup() {
      const sm = ref(3)
      const md = ref(3)
      const lg = ref(3)
      return { sm, md, lg }
    },
    template: `
      <div class="flex flex-col gap-6 p-8">
        <div class="flex items-center gap-3">
          <Rate size="sm" v-model="sm" />
          <span class="text-xs text-slate-600">Small</span>
        </div>
        <div class="flex items-center gap-3">
          <Rate size="md" v-model="md" />
          <span class="text-sm text-slate-600">Medium</span>
        </div>
        <div class="flex items-center gap-3">
          <Rate size="lg" v-model="lg" />
          <span class="text-base text-slate-600">Large</span>
        </div>
      </div>
    `,
  }),
}

// 半星评分
export const HalfStar: Story = {
  render: () => ({
    components: { Rate },
    setup() {
      const value1 = ref(3.5)
      const value2 = ref(2.5)
      const value3 = ref(4.5)
      return { value1, value2, value3 }
    },
    template: `
      <div class="flex flex-col gap-4 p-8">
        <div class="flex items-center gap-3">
          <Rate allow-half v-model="value1" />
          <span class="text-sm text-slate-600">半星评分: {{ value1 }}</span>
        </div>
        <div class="flex items-center gap-3">
          <Rate allow-half size="sm" v-model="value2" />
          <span class="text-sm text-slate-600">小尺寸半星: {{ value2 }}</span>
        </div>
        <div class="flex items-center gap-3">
          <Rate allow-half size="lg" v-model="value3" />
          <span class="text-sm text-slate-600">大尺寸半星: {{ value3 }}</span>
        </div>
      </div>
    `,
  }),
}

// 显示分数
export const WithScore: Story = {
  render: () => ({
    components: { Rate },
    setup() {
      const value1 = ref(4)
      const value2 = ref(3.5)
      return { value1, value2 }
    },
    template: `
      <div class="flex flex-col gap-4 p-8">
        <div class="flex items-center gap-3">
          <Rate show-score v-model="value1" />
        </div>
        <div class="flex items-center gap-3">
          <Rate show-score allow-half v-model="value2" />
        </div>
      </div>
    `,
  }),
}

// 自定义文字
export const WithTexts: Story = {
  render: () => ({
    components: { Rate },
    setup() {
      const value1 = ref(1)
      const value2 = ref(3)
      const value3 = ref(5)

      const texts1 = ['极差', '失望', '一般', '满意', '惊喜']
      const texts2 = ['1星', '2星', '3星', '4星', '5星']
      const texts3 = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
      return { value1, value2, value3, texts1, texts2, texts3 }
    },
    template: `
      <div class="flex flex-col gap-4 p-8">
        <div class="flex items-center gap-3">
          <Rate :texts="texts1" v-model="value1" />
        </div>
        <div class="flex items-center gap-3">
          <Rate :texts="texts2" v-model="value2" />
        </div>
        <div class="flex items-center gap-3">
          <Rate :texts="texts3" v-model="value3" color="rose-400" />
        </div>
      </div>
    `,
  }),
}

// 不同颜色
export const DifferentColors: Story = {
  render: () => ({
    components: { Rate },
    setup() {
      const amber = ref(4)
      const rose = ref(3)
      const emerald = ref(5)
      const blue = ref(4)
      const violet = ref(3)
      return { amber, rose, emerald, blue, violet }
    },
    template: `
      <div class="flex flex-col gap-4 p-8">
        <div class="flex items-center gap-3">
          <Rate v-model="amber" color="amber-400" />
          <span class="text-sm text-slate-700">Amber (默认)</span>
        </div>
        <div class="flex items-center gap-3">
          <Rate v-model="rose" color="rose-400" />
          <span class="text-sm text-slate-700">Rose</span>
        </div>
        <div class="flex items-center gap-3">
          <Rate v-model="emerald" color="emerald-400" />
          <span class="text-sm text-slate-700">Emerald</span>
        </div>
        <div class="flex items-center gap-3">
          <Rate v-model="blue" color="secondary-400" />
          <span class="text-sm text-slate-700">Blue</span>
        </div>
        <div class="flex items-center gap-3">
          <Rate v-model="violet" color="violet-400" />
          <span class="text-sm text-slate-700">Violet</span>
        </div>
      </div>
    `,
  }),
}

// 禁用状态
export const Disabled: Story = {
  render: () => ({
    components: { Rate },
    template: `
      <div class="flex flex-col gap-4 p-8">
        <div class="flex items-center gap-3">
          <Rate disabled :model-value="0" />
          <span class="text-sm text-slate-700">0 星 - 禁用</span>
        </div>
        <div class="flex items-center gap-3">
          <Rate disabled :model-value="2" />
          <span class="text-sm text-slate-700">2 星 - 禁用</span>
        </div>
        <div class="flex items-center gap-3">
          <Rate disabled :model-value="3.5" allow-half />
          <span class="text-sm text-slate-700">3.5 星（半星）- 禁用</span>
        </div>
        <div class="flex items-center gap-3">
          <Rate disabled :model-value="5" />
          <span class="text-sm text-slate-700">5 星 - 禁用</span>
        </div>
      </div>
    `,
  }),
}

// 只读模式
export const Readonly: Story = {
  render: () => ({
    components: { Rate },
    template: `
      <div class="flex flex-col gap-4 p-8">
        <div class="flex items-center gap-3">
          <Rate readonly :model-value="3" />
          <span class="text-sm text-slate-700">3 星 - 只读</span>
        </div>
        <div class="flex items-center gap-3">
          <Rate readonly :model-value="4.5" allow-half />
          <span class="text-sm text-slate-700">4.5 星（半星）- 只读</span>
        </div>
      </div>
    `,
  }),
}

// 不同最大分数
export const DifferentMax: Story = {
  render: () => ({
    components: { Rate },
    setup() {
      const three = ref(2)
      const five = ref(3)
      const ten = ref(7)
      return { three, five, ten }
    },
    template: `
      <div class="flex flex-col gap-4 p-8">
        <div class="flex items-center gap-3">
          <Rate :max="3" v-model="three" />
          <span class="text-sm text-slate-600">最大 3 星: {{ three }}</span>
        </div>
        <div class="flex items-center gap-3">
          <Rate :max="5" v-model="five" />
          <span class="text-sm text-slate-600">最大 5 星: {{ five }}</span>
        </div>
        <div class="flex items-center gap-3">
          <Rate :max="10" v-model="ten" size="sm" />
          <span class="text-sm text-slate-600">最大 10 星: {{ ten }}</span>
        </div>
      </div>
    `,
  }),
}

// 自定义图标插槽
export const CustomIcon: Story = {
  render: () => ({
    components: { Rate },
    setup() {
      const value = ref(3)
      return { value }
    },
    template: `
      <div class="p-8 space-y-4">
        <div class="flex items-center gap-3">
          <Rate v-model="value" color="emerald-400">
            <template #default="{ state }">
              <svg
                v-if="state === 'full'"
                class="w-5 h-5 text-emerald-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <svg
                v-else-if="state === 'half'"
                class="w-5 h-5 text-emerald-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <defs>
                  <linearGradient id="custom-half">
                    <stop offset="50%" stop-color="currentColor"/>
                    <stop offset="50%" stop-color="currentColor" stop-opacity="0.3"/>
                  </linearGradient>
                </defs>
                <path fill="url(#custom-half)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <svg
                v-else
                class="w-5 h-5 text-slate-300"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
              </svg>
            </template>
          </Rate>
          <span class="text-sm text-slate-700">自定义星星图标</span>
        </div>
      </div>
    `,
  }),
}

// 实际应用场景 - 商品评分
export const ProductRating: Story = {
  render: () => ({
    components: { Rate },
    setup() {
      const products = ref([
        { id: 1, name: '无线耳机', rating: 4.5, reviews: 128 },
        { id: 2, name: '智能手表', rating: 4, reviews: 89 },
        { id: 3, name: '便携充电宝', rating: 5, reviews: 256 },
      ])
      return { products }
    },
    template: `
      <div class="p-8 max-w-md">
        <h2 class="text-xl font-semibold mb-6">商品评分</h2>
        <div class="space-y-4">
          <div
            v-for="product in products"
            :key="product.id"
            class="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm"
          >
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-medium text-slate-900 dark:text-slate-100">{{ product.name }}</h3>
              <span class="text-sm text-slate-600 dark:text-slate-400">{{ product.reviews }} 条评价</span>
            </div>
            <div class="flex items-center gap-2">
              <Rate readonly :model-value="product.rating" allow-half size="sm" />
              <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ product.rating }}</span>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

// 实际应用场景 - 评分表单
export const RatingForm: Story = {
  render: () => ({
    components: { Rate },
    setup() {
      const ratings = ref({
        quality: 0,
        service: 0,
        delivery: 0,
      })

      const texts = ['非常不满意', '不满意', '一般', '满意', '非常满意']

      const canSubmit = computed(() => {
        return Object.values(ratings.value).every(v => v > 0)
      })

      const submit = () => {
        alert(`评分提交：${JSON.stringify(ratings.value, null, 2)}`)
      }

      return { ratings, texts, canSubmit, submit }
    },
    template: `
      <div class="p-8 max-w-md">
        <h2 class="text-xl font-semibold mb-6">服务评价</h2>
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              商品质量
            </label>
            <Rate v-model="ratings.quality" :texts="texts" show-score />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              服务态度
            </label>
            <Rate v-model="ratings.service" :texts="texts" show-score />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              物流速度
            </label>
            <Rate v-model="ratings.delivery" :texts="texts" show-score />
          </div>
          <button
            @click="submit"
            :disabled="!canSubmit"
            class="w-full px-4 py-2 bg-primary-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600"
          >
            提交评价
          </button>
        </div>
      </div>
    `,
  }),
}

// 深色模式
export const DarkMode: Story = {
  render: () => ({
    components: { Rate },
    setup() {
      const value1 = ref(4)
      const value2 = ref(3.5)
      const value3 = ref(5)
      return { value1, value2, value3 }
    },
    template: `
      <div class="bg-slate-900 p-8 space-y-4">
        <h3 class="text-lg font-semibold text-white">深色模式</h3>
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-3">
            <Rate v-model="value1" />
            <span class="text-sm text-slate-300">整星评分</span>
          </div>
          <div class="flex items-center gap-3">
            <Rate v-model="value2" allow-half />
            <span class="text-sm text-slate-300">半星评分</span>
          </div>
          <div class="flex items-center gap-3">
            <Rate v-model="value3" color="rose-400" show-score />
          </div>
        </div>
      </div>
    `,
  }),
}

// 交互示例 - 动态更新
export const Interactive: Story = {
  render: () => ({
    components: { Rate },
    setup() {
      const value = ref(3)
      const history = ref([])

      const handleChange = (newValue: number) => {
        history.value.unshift({
          value: newValue,
          time: new Date().toLocaleTimeString()
        })
        if (history.value.length > 5) {
          history.value.pop()
        }
      }

      return { value, history, handleChange }
    },
    template: `
      <div class="p-8 space-y-6">
        <div>
          <h3 class="text-lg font-semibold mb-4">点击星星评分</h3>
          <Rate v-model="value" @change="handleChange" show-score />
        </div>
        <div v-if="history.length > 0" class="space-y-2">
          <h4 class="text-sm font-medium text-slate-700">评分历史</h4>
          <div class="space-y-1">
            <div
              v-for="(item, index) in history"
              :key="index"
              class="text-sm text-slate-600"
            >
              {{ item.time }} - 评分: {{ item.value }}
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}
