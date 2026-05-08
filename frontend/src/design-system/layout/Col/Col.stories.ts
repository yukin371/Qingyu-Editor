/**
 * Col 组件 Storybook 故事
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import Col from './Col.vue'

const meta = {
  title: 'Layout/Col',
  component: Col,
  tags: ['autodocs'],
  argTypes: {
    span: {
      control: 'number',
      description: '列宽度（1-12）',
    },
    offset: {
      control: 'number',
      description: '左侧偏移列数（0-11）',
    },
    order: {
      control: 'number',
      description: '排序顺序',
    },
    xs: {
      control: 'number',
      description: '断点 xs 下的 span',
    },
    sm: {
      control: 'number',
      description: '断点 sm 下的 span',
    },
    md: {
      control: 'number',
      description: '断点 md 下的 span',
    },
    lg: {
      control: 'number',
      description: '断点 lg 下的 span',
    },
    xl: {
      control: 'number',
      description: '断点 xl 下的 span',
    },
  },
  args: {
    span: 12,
    offset: 0,
  },
} satisfies Meta<typeof Col>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 默认列（占满整行）
 */
export const Default: Story = {
  args: {
    span: 12,
  },
  render: (args) => ({
    components: { Col },
    setup() {
      return { args }
    },
    template: `
      <div class="w-full">
        <Col v-bind="args">
          <div class="bg-secondary-500 text-white p-4 rounded-md text-center">
            占 12 列（整行）
          </div>
        </Col>
      </div>
    `,
  }),
}

/**
 * 所有 span 值展示
 */
export const AllSpans: Story = {
  render: () => ({
    components: { Col },
    template: `
      <div class="w-full space-y-4">
        <!-- span 1-12 -->
        <div class="flex gap-2">
          <Col :span="1">
            <div class="bg-secondary-500 text-white p-4 rounded-md text-center text-sm">1</div>
          </Col>
          <Col :span="11">
            <div class="bg-slate-200 dark:bg-slate-700 p-4 rounded-md text-center text-sm text-slate-600 dark:text-slate-300">11</div>
          </Col>
        </div>
        
        <div class="flex gap-2">
          <Col :span="2">
            <div class="bg-secondary-500 text-white p-4 rounded-md text-center text-sm">2</div>
          </Col>
          <Col :span="10">
            <div class="bg-slate-200 dark:bg-slate-700 p-4 rounded-md text-center text-sm text-slate-600 dark:text-slate-300">10</div>
          </Col>
        </div>
        
        <div class="flex gap-2">
          <Col :span="3">
            <div class="bg-secondary-500 text-white p-4 rounded-md text-center text-sm">3</div>
          </Col>
          <Col :span="9">
            <div class="bg-slate-200 dark:bg-slate-700 p-4 rounded-md text-center text-sm text-slate-600 dark:text-slate-300">9</div>
          </Col>
        </div>
        
        <div class="flex gap-2">
          <Col :span="4">
            <div class="bg-secondary-500 text-white p-4 rounded-md text-center text-sm">4</div>
          </Col>
          <Col :span="8">
            <div class="bg-slate-200 dark:bg-slate-700 p-4 rounded-md text-center text-sm text-slate-600 dark:text-slate-300">8</div>
          </Col>
        </div>
        
        <div class="flex gap-2">
          <Col :span="5">
            <div class="bg-secondary-500 text-white p-4 rounded-md text-center text-sm">5</div>
          </Col>
          <Col :span="7">
            <div class="bg-slate-200 dark:bg-slate-700 p-4 rounded-md text-center text-sm text-slate-600 dark:text-slate-300">7</div>
          </Col>
        </div>
        
        <div class="flex gap-2">
          <Col :span="6">
            <div class="bg-secondary-500 text-white p-4 rounded-md text-center text-sm">6</div>
          </Col>
          <Col :span="6">
            <div class="bg-secondary-500 text-white p-4 rounded-md text-center text-sm">6</div>
          </Col>
        </div>
        
        <div class="flex gap-2">
          <Col :span="7">
            <div class="bg-secondary-500 text-white p-4 rounded-md text-center text-sm">7</div>
          </Col>
          <Col :span="5">
            <div class="bg-slate-200 dark:bg-slate-700 p-4 rounded-md text-center text-sm text-slate-600 dark:text-slate-300">5</div>
          </Col>
        </div>
        
        <div class="flex gap-2">
          <Col :span="8">
            <div class="bg-secondary-500 text-white p-4 rounded-md text-center text-sm">8</div>
          </Col>
          <Col :span="4">
            <div class="bg-slate-200 dark:bg-slate-700 p-4 rounded-md text-center text-sm text-slate-600 dark:text-slate-300">4</div>
          </Col>
        </div>
        
        <div class="flex gap-2">
          <Col :span="9">
            <div class="bg-secondary-500 text-white p-4 rounded-md text-center text-sm">9</div>
          </Col>
          <Col :span="3">
            <div class="bg-slate-200 dark:bg-slate-700 p-4 rounded-md text-center text-sm text-slate-600 dark:text-slate-300">3</div>
          </Col>
        </div>
        
        <div class="flex gap-2">
          <Col :span="10">
            <div class="bg-secondary-500 text-white p-4 rounded-md text-center text-sm">10</div>
          </Col>
          <Col :span="2">
            <div class="bg-slate-200 dark:bg-slate-700 p-4 rounded-md text-center text-sm text-slate-600 dark:text-slate-300">2</div>
          </Col>
        </div>
        
        <div class="flex gap-2">
          <Col :span="11">
            <div class="bg-secondary-500 text-white p-4 rounded-md text-center text-sm">11</div>
          </Col>
          <Col :span="1">
            <div class="bg-slate-200 dark:bg-slate-700 p-4 rounded-md text-center text-sm text-slate-600 dark:text-slate-300">1</div>
          </Col>
        </div>
        
        <div class="flex gap-2">
          <Col :span="12">
            <div class="bg-secondary-500 text-white p-4 rounded-md text-center text-sm">12</div>
          </Col>
        </div>
      </div>
    `,
  }),
}

/**
 * Offset 偏移效果
 */
export const Offsets: Story = {
  render: () => ({
    components: { Col },
    template: `
      <div class="w-full space-y-4">
        <div class="flex gap-2">
          <Col :span="4" :offset="0">
            <div class="bg-secondary-500 text-white p-4 rounded-md text-center">偏移 0</div>
          </Col>
          <Col :span="8">
            <div class="bg-slate-200 dark:bg-slate-700 p-4 rounded-md text-center text-slate-600 dark:text-slate-300">剩余 8 列</div>
          </Col>
        </div>
        
        <div class="flex gap-2">
          <Col :span="4" :offset="2">
            <div class="bg-secondary-500 text-white p-4 rounded-md text-center">偏移 2</div>
          </Col>
          <Col :span="6">
            <div class="bg-slate-200 dark:bg-slate-700 p-4 rounded-md text-center text-slate-600 dark:text-slate-300">剩余 6 列</div>
          </Col>
        </div>
        
        <div class="flex gap-2">
          <Col :span="4" :offset="4">
            <div class="bg-secondary-500 text-white p-4 rounded-md text-center">偏移 4</div>
          </Col>
          <Col :span="4">
            <div class="bg-slate-200 dark:bg-slate-700 p-4 rounded-md text-center text-slate-600 dark:text-slate-300">剩余 4 列</div>
          </Col>
        </div>
        
        <div class="flex gap-2">
          <Col :span="4" :offset="6">
            <div class="bg-secondary-500 text-white p-4 rounded-md text-center">偏移 6</div>
          </Col>
          <Col :span="2">
            <div class="bg-slate-200 dark:bg-slate-700 p-4 rounded-md text-center text-slate-600 dark:text-slate-300">剩余 2 列</div>
          </Col>
        </div>
        
        <div class="flex gap-2">
          <Col :span="4" :offset="8">
            <div class="bg-secondary-500 text-white p-4 rounded-md text-center">偏移 8</div>
          </Col>
        </div>
      </div>
    `,
  }),
}

/**
 * 响应式断点
 */
export const Responsive: Story = {
  render: () => ({
    components: { Col },
    template: `
      <div class="w-full space-y-4">
        <div class="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-md">
          <p class="text-sm text-amber-800 dark:text-amber-300">
            <strong>提示：</strong>调整浏览器窗口大小查看响应式效果
          </p>
        </div>
        
        <div class="flex gap-2">
          <Col :xs="12" :sm="6" :md="4" :lg="3" :xl="2">
            <div class="bg-purple-500 text-white p-4 rounded-md text-center">
              xs:12 sm:6 md:4 lg:3 xl:2
            </div>
          </Col>
          <Col :xs="12" :sm="6" :md="4" :lg="3" :xl="2">
            <div class="bg-purple-500 text-white p-4 rounded-md text-center">
              xs:12 sm:6 md:4 lg:3 xl:2
            </div>
          </Col>
          <Col :xs="12" :sm="6" :md="4" :lg="3" :xl="2">
            <div class="bg-purple-500 text-white p-4 rounded-md text-center">
              xs:12 sm:6 md:4 lg:3 xl:2
            </div>
          </Col>
          <Col :xs="12" :sm="6" :md="4" :lg="3" :xl="2">
            <div class="bg-purple-500 text-white p-4 rounded-md text-center">
              xs:12 sm:6 md:4 lg:3 xl:2
            </div>
          </Col>
          <Col :xs="12" :sm="6" :md="4" :lg="3" :xl="2">
            <div class="bg-purple-500 text-white p-4 rounded-md text-center">
              xs:12 sm:6 md:4 lg:3 xl:2
            </div>
          </Col>
          <Col :xs="12" :sm="6" :md="4" :lg="3" :xl="2">
            <div class="bg-purple-500 text-white p-4 rounded-md text-center">
              xs:12 sm:6 md:4 lg:3 xl:2
            </div>
          </Col>
        </div>
        
        <div class="flex gap-2 mt-8">
          <Col :xs="12" :md="6">
            <div class="bg-green-500 text-white p-4 rounded-md text-center">
              xs:12 md:6（平板及以上占一半）
            </div>
          </Col>
          <Col :xs="12" :md="6">
            <div class="bg-green-500 text-white p-4 rounded-md text-center">
              xs:12 md:6（平板及以上占一半）
            </div>
          </Col>
        </div>
        
        <div class="flex gap-2">
          <Col :xs="12" :sm="8" :lg="4">
            <div class="bg-orange-500 text-white p-4 rounded-md text-center">
              xs:12 sm:8 lg:4
            </div>
          </Col>
          <Col :xs="12" :sm="4" :lg="8">
            <div class="bg-orange-500 text-white p-4 rounded-md text-center">
              xs:12 sm:4 lg:8
            </div>
          </Col>
        </div>
      </div>
    `,
  }),
}

/**
 * 排序示例
 */
export const Ordering: Story = {
  render: () => ({
    components: { Col },
    template: `
      <div class="w-full">
        <div class="mb-4 p-4 bg-secondary-50 dark:bg-secondary-900/20 rounded-md">
          <p class="text-sm text-secondary-800 dark:text-secondary-300">
            <strong>order 属性：</strong>可以改变列的视觉顺序，不影响 DOM 顺序
          </p>
        </div>
        
        <div class="flex gap-2">
          <Col :span="4" :order="3">
            <div class="bg-red-500 text-white p-4 rounded-md text-center">
              第一列（order:3）
            </div>
          </Col>
          <Col :span="4" :order="2">
            <div class="bg-green-500 text-white p-4 rounded-md text-center">
              第二列（order:2）
            </div>
          </Col>
          <Col :span="4" :order="1">
            <div class="bg-secondary-500 text-white p-4 rounded-md text-center">
              第三列（order:1）
            </div>
          </Col>
        </div>
        
        <p class="mt-4 text-sm text-slate-600 dark:text-slate-400">
          DOM 顺序：第一列 → 第二列 → 第三列<br>
          视觉顺序：第三列 → 第二列 → 第一列
        </p>
      </div>
    `,
  }),
}

/**
 * 三列布局
 */
export const ThreeColumns: Story = {
  render: () => ({
    components: { Col },
    template: `
      <div class="w-full">
        <div class="flex gap-4">
          <Col :span="4">
            <div class="bg-secondary-500 text-white p-6 rounded-md">
              <h3 class="text-lg font-semibold mb-2">左侧栏</h3>
              <p class="text-sm opacity-90">占 4/12 宽度</p>
            </div>
          </Col>
          <Col :span="4">
            <div class="bg-purple-500 text-white p-6 rounded-md">
              <h3 class="text-lg font-semibold mb-2">中间栏</h3>
              <p class="text-sm opacity-90">占 4/12 宽度</p>
            </div>
          </Col>
          <Col :span="4">
            <div class="bg-pink-500 text-white p-6 rounded-md">
              <h3 class="text-lg font-semibold mb-2">右侧栏</h3>
              <p class="text-sm opacity-90">占 4/12 宽度</p>
            </div>
          </Col>
        </div>
      </div>
    `,
  }),
}

/**
 * 经典圣杯布局
 */
export const HolyGrail: Story = {
  render: () => ({
    components: { Col },
    template: `
      <div class="w-full space-y-4">
        <!-- 头部 -->
        <div class="flex gap-2">
          <Col :span="12">
            <div class="bg-red-500 text-white p-6 rounded-md text-center">
              <h2 class="text-xl font-bold">头部（Header）</h2>
            </div>
          </Col>
        </div>
        
        <!-- 主体三列 -->
        <div class="flex gap-2">
          <Col :span="3">
            <div class="bg-secondary-500 text-white p-4 rounded-md min-h-48">
              <h3 class="font-semibold mb-2">左侧导航</h3>
              <p class="text-sm opacity-90">占 3/12</p>
            </div>
          </Col>
          <Col :span="6">
            <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-md min-h-48">
              <h3 class="font-semibold mb-2 text-slate-800 dark:text-slate-200">主内容区</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400">占 6/12</p>
            </div>
          </Col>
          <Col :span="3">
            <div class="bg-green-500 text-white p-4 rounded-md min-h-48">
              <h3 class="font-semibold mb-2">右侧边栏</h3>
              <p class="text-sm opacity-90">占 3/12</p>
            </div>
          </Col>
        </div>
        
        <!-- 底部 -->
        <div class="flex gap-2">
          <Col :span="12">
            <div class="bg-slate-700 text-white p-4 rounded-md text-center">
              <p class="text-sm">底部（Footer）</p>
            </div>
          </Col>
        </div>
      </div>
    `,
  }),
}

/**
 * 卡片网格布局
 */
export const CardGrid: Story = {
  render: () => ({
    components: { Col },
    template: `
      <div class="w-full">
        <h2 class="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">卡片网格</h2>
        
        <div class="flex gap-4 flex-wrap">
          <Col :xs="12" :sm="6" :md="4" :lg="3">
            <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
              <div class="w-full h-24 bg-secondary-100 dark:bg-secondary-900/30 rounded-md mb-3"></div>
              <h3 class="font-semibold text-slate-800 dark:text-slate-200 mb-1">卡片 1</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400">描述文字</p>
            </div>
          </Col>
          
          <Col :xs="12" :sm="6" :md="4" :lg="3">
            <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
              <div class="w-full h-24 bg-purple-100 dark:bg-purple-900/30 rounded-md mb-3"></div>
              <h3 class="font-semibold text-slate-800 dark:text-slate-200 mb-1">卡片 2</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400">描述文字</p>
            </div>
          </Col>
          
          <Col :xs="12" :sm="6" :md="4" :lg="3">
            <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
              <div class="w-full h-24 bg-green-100 dark:bg-green-900/30 rounded-md mb-3"></div>
              <h3 class="font-semibold text-slate-800 dark:text-slate-200 mb-1">卡片 3</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400">描述文字</p>
            </div>
          </Col>
          
          <Col :xs="12" :sm="6" :md="4" :lg="3">
            <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
              <div class="w-full h-24 bg-orange-100 dark:bg-orange-900/30 rounded-md mb-3"></div>
              <h3 class="font-semibold text-slate-800 dark:text-slate-200 mb-1">卡片 4</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400">描述文字</p>
            </div>
          </Col>
          
          <Col :xs="12" :sm="6" :md="4" :lg="3">
            <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
              <div class="w-full h-24 bg-pink-100 dark:bg-pink-900/30 rounded-md mb-3"></div>
              <h3 class="font-semibold text-slate-800 dark:text-slate-200 mb-1">卡片 5</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400">描述文字</p>
            </div>
          </Col>
          
          <Col :xs="12" :sm="6" :md="4" :lg="3">
            <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
              <div class="w-full h-24 bg-primary-100 dark:bg-primary-900/30 rounded-md mb-3"></div>
              <h3 class="font-semibold text-slate-800 dark:text-slate-200 mb-1">卡片 6</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400">描述文字</p>
            </div>
          </Col>
        </div>
      </div>
    `,
  }),
}

/**
 * 嵌套列
 */
export const NestedCols: Story = {
  render: () => ({
    components: { Col },
    template: `
      <div class="w-full">
        <h2 class="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">嵌套列布局</h2>
        
        <div class="flex gap-2">
          <Col :span="8">
            <div class="bg-secondary-500 p-4 rounded-md">
              <p class="text-white font-semibold mb-3">外层列（8 列）</p>
              
              <div class="flex gap-2">
                <Col :span="6">
                  <div class="bg-secondary-400 text-white p-3 rounded-md text-center text-sm">
                    内层 1（6/12）
                  </div>
                </Col>
                <Col :span="6">
                  <div class="bg-secondary-400 text-white p-3 rounded-md text-center text-sm">
                    内层 2（6/12）
                  </div>
                </Col>
              </div>
            </div>
          </Col>
          
          <Col :span="4">
            <div class="bg-green-500 text-white p-4 rounded-md">
              <p class="font-semibold mb-2">外层列（4 列）</p>
              <p class="text-sm opacity-90">右侧栏</p>
            </div>
          </Col>
        </div>
      </div>
    `,
  }),
}
