/**
 * Row 组件 Storybook 故事
 *
 * 展示 Row 组件的各种用法和配置
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import Row from './Row.vue'
import Col from '../Col/Col.vue'

const meta = {
  title: 'Layout/Row',
  component: Row,
  tags: ['autodocs'],
} satisfies Meta<typeof Row>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 默认故事 - 基本 Row 组件
 */
export const Default: Story = {
  render: () => ({
    components: { Row, Col },
    template: `
      <Row>
        <Col :span="6">
          <div class="bg-secondary-100 dark:bg-secondary-900 p-4 rounded">列 1 (span=6)</div>
        </Col>
        <Col :span="6">
          <div class="bg-green-100 dark:bg-green-900 p-4 rounded">列 2 (span=6)</div>
        </Col>
        <Col :span="12">
          <div class="bg-purple-100 dark:bg-purple-900 p-4 rounded">列 3 (span=12)</div>
        </Col>
      </Row>
    `,
  }),
}

/**
 * 水平对齐 - 展示所有 justify 值
 */
export const JustifyAlignment = {
  render: () => ({
    components: { Row, Col },
    template: `
      <div class="space-y-8">
        <div>
          <h3 class="text-lg font-semibold mb-4">justify="start" (默认)</h3>
          <Row justify="start">
            <Col :span="6">
              <div class="bg-secondary-100 dark:bg-secondary-900 p-4 rounded">列 1</div>
            </Col>
            <Col :span="4">
              <div class="bg-green-100 dark:bg-green-900 p-4 rounded">列 2</div>
            </Col>
          </Row>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-4">justify="center"</h3>
          <Row justify="center">
            <Col :span="6">
              <div class="bg-secondary-100 dark:bg-secondary-900 p-4 rounded">列 1</div>
            </Col>
            <Col :span="4">
              <div class="bg-green-100 dark:bg-green-900 p-4 rounded">列 2</div>
            </Col>
          </Row>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-4">justify="end"</h3>
          <Row justify="end">
            <Col :span="6">
              <div class="bg-secondary-100 dark:bg-secondary-900 p-4 rounded">列 1</div>
            </Col>
            <Col :span="4">
              <div class="bg-green-100 dark:bg-green-900 p-4 rounded">列 2</div>
            </Col>
          </Row>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-4">justify="space-between"</h3>
          <Row justify="space-between">
            <Col :span="4">
              <div class="bg-secondary-100 dark:bg-secondary-900 p-4 rounded">列 1</div>
            </Col>
            <Col :span="4">
              <div class="bg-green-100 dark:bg-green-900 p-4 rounded">列 2</div>
            </Col>
          </Row>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-4">justify="space-around"</h3>
          <Row justify="space-around">
            <Col :span="4">
              <div class="bg-secondary-100 dark:bg-secondary-900 p-4 rounded">列 1</div>
            </Col>
            <Col :span="4">
              <div class="bg-green-100 dark:bg-green-900 p-4 rounded">列 2</div>
            </Col>
          </Row>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-4">justify="space-evenly"</h3>
          <Row justify="space-evenly">
            <Col :span="4">
              <div class="bg-secondary-100 dark:bg-secondary-900 p-4 rounded">列 1</div>
            </Col>
            <Col :span="4">
              <div class="bg-green-100 dark:bg-green-900 p-4 rounded">列 2</div>
            </Col>
          </Row>
        </div>
      </div>
    `,
  }),
}

/**
 * 垂直对齐 - 展示所有 align 值
 */
export const AlignItems = {
  render: () => ({
    components: { Row, Col },
    template: `
      <div class="space-y-8">
        <div>
          <h3 class="text-lg font-semibold mb-4">align="top" (默认)</h3>
          <Row align="top" class="bg-gray-100 dark:bg-gray-800 h-32">
            <Col :span="4">
              <div class="bg-secondary-100 dark:bg-secondary-900 p-4">短内容</div>
            </Col>
            <Col :span="4">
              <div class="bg-green-100 dark:bg-green-900 p-4">中等高度内容</div>
            </Col>
            <Col :span="4">
              <div class="bg-purple-100 dark:bg-purple-900 p-4">
                这是一段比较长的内容<br>用于展示垂直对齐效果
              </div>
            </Col>
          </Row>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-4">align="center"</h3>
          <Row align="center" class="bg-gray-100 dark:bg-gray-800 h-32">
            <Col :span="4">
              <div class="bg-secondary-100 dark:bg-secondary-900 p-4">短内容</div>
            </Col>
            <Col :span="4">
              <div class="bg-green-100 dark:bg-green-900 p-4">中等高度内容</div>
            </Col>
            <Col :span="4">
              <div class="bg-purple-100 dark:bg-purple-900 p-4">
                这是一段比较长的内容<br>用于展示垂直对齐效果
              </div>
            </Col>
          </Row>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-4">align="bottom"</h3>
          <Row align="bottom" class="bg-gray-100 dark:bg-gray-800 h-32">
            <Col :span="4">
              <div class="bg-secondary-100 dark:bg-secondary-900 p-4">短内容</div>
            </Col>
            <Col :span="4">
              <div class="bg-green-100 dark:bg-green-900 p-4">中等高度内容</div>
            </Col>
            <Col :span="4">
              <div class="bg-purple-100 dark:bg-purple-900 p-4">
                这是一段比较长的内容<br>用于展示垂直对齐效果
              </div>
            </Col>
          </Row>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-4">align="stretch"</h3>
          <Row align="stretch" class="bg-gray-100 dark:bg-gray-800 h-32">
            <Col :span="4">
              <div class="bg-secondary-100 dark:bg-secondary-900 p-4 h-full">拉伸内容 1</div>
            </Col>
            <Col :span="4">
              <div class="bg-green-100 dark:bg-green-900 p-4 h-full">拉伸内容 2</div>
            </Col>
            <Col :span="4">
              <div class="bg-purple-100 dark:bg-purple-900 p-4 h-full">拉伸内容 3</div>
            </Col>
          </Row>
        </div>
      </div>
    `,
  }),
}

/**
 * Gutter 间距 - 展示不同 gutter 值
 */
export const GutterSpacing = {
  render: () => ({
    components: { Row, Col },
    template: `
      <div class="space-y-8">
        <div>
          <h3 class="text-lg font-semibold mb-4">gutter={0} (默认)</h3>
          <Row :gutter="0">
            <Col :span="6">
              <div class="bg-secondary-100 dark:bg-secondary-900 p-4 rounded">列 1</div>
            </Col>
            <Col :span="6">
              <div class="bg-green-100 dark:bg-green-900 p-4 rounded">列 2</div>
            </Col>
            <Col :span="12">
              <div class="bg-purple-100 dark:bg-purple-900 p-4 rounded">列 3</div>
            </Col>
          </Row>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-4">gutter={8}</h3>
          <Row :gutter="8">
            <Col :span="6">
              <div class="bg-secondary-100 dark:bg-secondary-900 p-4 rounded">列 1</div>
            </Col>
            <Col :span="6">
              <div class="bg-green-100 dark:bg-green-900 p-4 rounded">列 2</div>
            </Col>
            <Col :span="12">
              <div class="bg-purple-100 dark:bg-purple-900 p-4 rounded">列 3</div>
            </Col>
          </Row>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-4">gutter={16}</h3>
          <Row :gutter="16">
            <Col :span="6">
              <div class="bg-secondary-100 dark:bg-secondary-900 p-4 rounded">列 1</div>
            </Col>
            <Col :span="6">
              <div class="bg-green-100 dark:bg-green-900 p-4 rounded">列 2</div>
            </Col>
            <Col :span="12">
              <div class="bg-purple-100 dark:bg-purple-900 p-4 rounded">列 3</div>
            </Col>
          </Row>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-4">gutter={24}</h3>
          <Row :gutter="24">
            <Col :span="6">
              <div class="bg-secondary-100 dark:bg-secondary-900 p-4 rounded">列 1</div>
            </Col>
            <Col :span="6">
              <div class="bg-green-100 dark:bg-green-900 p-4 rounded">列 2</div>
            </Col>
            <Col :span="12">
              <div class="bg-purple-100 dark:bg-purple-900 p-4 rounded">列 3</div>
            </Col>
          </Row>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-4">gutter={32}</h3>
          <Row :gutter="32">
            <Col :span="6">
              <div class="bg-secondary-100 dark:bg-secondary-900 p-4 rounded">列 1</div>
            </Col>
            <Col :span="6">
              <div class="bg-green-100 dark:bg-green-900 p-4 rounded">列 2</div>
            </Col>
            <Col :span="12">
              <div class="bg-purple-100 dark:bg-purple-900 p-4 rounded">列 3</div>
            </Col>
          </Row>
        </div>
      </div>
    `,
  }),
}

/**
 * Wrap 换行 - 展示 wrap 属性
 */
export const WrapBehavior = {
  render: () => ({
    components: { Row, Col },
    template: `
      <div class="space-y-8">
        <div>
          <h3 class="text-lg font-semibold mb-4">wrap={true} (默认)</h3>
          <Row :wrap="true">
            <Col :span="6">
              <div class="bg-secondary-100 dark:bg-secondary-900 p-4 rounded">列 1 (6)</div>
            </Col>
            <Col :span="6">
              <div class="bg-green-100 dark:bg-green-900 p-4 rounded">列 2 (6)</div>
            </Col>
            <Col :span="6">
              <div class="bg-purple-100 dark:bg-purple-900 p-4 rounded">列 3 (6)</div>
            </Col>
            <Col :span="6">
              <div class="bg-orange-100 dark:bg-orange-900 p-4 rounded">列 4 (6)</div>
            </Col>
            <Col :span="12">
              <div class="bg-pink-100 dark:bg-pink-900 p-4 rounded">列 5 (12)</div>
            </Col>
          </Row>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-4">wrap={false}</h3>
          <div class="overflow-x-auto">
            <Row :wrap="false">
              <Col :span="6">
                <div class="bg-secondary-100 dark:bg-secondary-900 p-4 rounded">列 1 (6)</div>
              </Col>
              <Col :span="6">
                <div class="bg-green-100 dark:bg-green-900 p-4 rounded">列 2 (6)</div>
              </Col>
              <Col :span="6">
                <div class="bg-purple-100 dark:bg-purple-900 p-4 rounded">列 3 (6)</div>
              </Col>
              <Col :span="6">
                <div class="bg-orange-100 dark:bg-orange-900 p-4 rounded">列 4 (6)</div>
              </Col>
              <Col :span="12">
                <div class="bg-pink-100 dark:bg-pink-900 p-4 rounded">列 5 (12)</div>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    `,
  }),
}

/**
 * 嵌套布局 - 展示嵌套的 Row 和 Col
 */
export const NestedLayout = {
  render: () => ({
    components: { Row, Col },
    template: `
      <div>
        <h3 class="text-lg font-semibold mb-4">嵌套 Row 和 Col</h3>
        <Row :gutter="16">
          <Col :span="12">
            <div class="bg-secondary-100 dark:bg-secondary-900 p-4 rounded h-full">
              <h4 class="font-semibold mb-2">左侧区域 (12)</h4>
              <Row :gutter="8">
                <Col :span="12">
                  <div class="bg-white dark:bg-gray-700 p-3 rounded">嵌套 1</div>
                </Col>
                <Col :span="12">
                  <div class="bg-white dark:bg-gray-700 p-3 rounded">嵌套 2</div>
                </Col>
              </Row>
            </div>
          </Col>
          <Col :span="12">
            <div class="bg-green-100 dark:bg-green-900 p-4 rounded h-full">
              <h4 class="font-semibold mb-2">右侧区域 (12)</h4>
              <Row :gutter="8">
                <Col :span="8">
                  <div class="bg-white dark:bg-gray-700 p-3 rounded">嵌套 3</div>
                </Col>
                <Col :span="16">
                  <div class="bg-white dark:bg-gray-700 p-3 rounded">嵌套 4</div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </div>
    `,
  }),
}

/**
 * 经典布局 - 展示实际应用场景
 */
export const ClassicLayouts = {
  render: () => ({
    components: { Row, Col },
    template: `
      <div class="space-y-8">
        <div>
          <h3 class="text-lg font-semibold mb-4">三栏布局</h3>
          <Row :gutter="16">
            <Col :span="6">
              <div class="bg-secondary-100 dark:bg-secondary-900 p-4 rounded">侧边栏 (6)</div>
            </Col>
            <Col :span="12">
              <div class="bg-green-100 dark:bg-green-900 p-4 rounded">主内容 (12)</div>
            </Col>
            <Col :span="6">
              <div class="bg-purple-100 dark:bg-purple-900 p-4 rounded">侧边栏 (6)</div>
            </Col>
          </Row>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-4">两栏布局 (左窄右宽)</h3>
          <Row :gutter="16">
            <Col :span="8">
              <div class="bg-secondary-100 dark:bg-secondary-900 p-4 rounded">侧边栏 (8)</div>
            </Col>
            <Col :span="16">
              <div class="bg-green-100 dark:bg-green-900 p-4 rounded">主内容 (16)</div>
            </Col>
          </Row>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-4">两栏布局 (左宽右窄)</h3>
          <Row :gutter="16">
            <Col :span="16">
              <div class="bg-secondary-100 dark:bg-secondary-900 p-4 rounded">主内容 (16)</div>
            </Col>
            <Col :span="8">
              <div class="bg-green-100 dark:bg-green-900 p-4 rounded">侧边栏 (8)</div>
            </Col>
          </Row>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-4">四栏网格</h3>
          <Row :gutter="16">
            <Col :span="6">
              <div class="bg-secondary-100 dark:bg-secondary-900 p-4 rounded">项目 1</div>
            </Col>
            <Col :span="6">
              <div class="bg-green-100 dark:bg-green-900 p-4 rounded">项目 2</div>
            </Col>
            <Col :span="6">
              <div class="bg-purple-100 dark:bg-purple-900 p-4 rounded">项目 3</div>
            </Col>
            <Col :span="6">
              <div class="bg-orange-100 dark:bg-orange-900 p-4 rounded">项目 4</div>
            </Col>
          </Row>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-4">仪表盘布局</h3>
          <Row :gutter="16" class="mb-4">
            <Col :span="24">
              <div class="bg-gray-200 dark:bg-gray-700 p-4 rounded">顶部栏 (24)</div>
            </Col>
          </Row>
          <Row :gutter="16" class="mb-4">
            <Col :span="6">
              <div class="bg-secondary-100 dark:bg-secondary-900 p-4 rounded">卡片 1</div>
            </Col>
            <Col :span="6">
              <div class="bg-green-100 dark:bg-green-900 p-4 rounded">卡片 2</div>
            </Col>
            <Col :span="6">
              <div class="bg-purple-100 dark:bg-purple-900 p-4 rounded">卡片 3</div>
            </Col>
            <Col :span="6">
              <div class="bg-orange-100 dark:bg-orange-900 p-4 rounded">卡片 4</div>
            </Col>
          </Row>
          <Row :gutter="16">
            <Col :span="16">
              <div class="bg-pink-100 dark:bg-pink-900 p-4 rounded">主内容区</div>
            </Col>
            <Col :span="8">
              <div class="bg-yellow-100 dark:bg-yellow-900 p-4 rounded">侧边栏</div>
            </Col>
          </Row>
        </div>
      </div>
    `,
  }),
}

/**
 * 组合示例 - 展示多个属性组合
 */
export const CombinedExample = {
  render: () => ({
    components: { Row, Col },
    template: `
      <div>
        <h3 class="text-lg font-semibold mb-4">组合属性示例</h3>
        <Row justify="center" align="center" :gutter="24" :wrap="true">
          <Col :span="6">
            <div class="bg-secondary-100 dark:bg-secondary-900 p-4 rounded text-center">
              <div class="text-2xl mb-2">📦</div>
              <div class="font-semibold">功能 1</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">描述文本</div>
            </div>
          </Col>
          <Col :span="6">
            <div class="bg-green-100 dark:bg-green-900 p-4 rounded text-center">
              <div class="text-2xl mb-2">🚀</div>
              <div class="font-semibold">功能 2</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">描述文本</div>
            </div>
          </Col>
          <Col :span="6">
            <div class="bg-purple-100 dark:bg-purple-900 p-4 rounded text-center">
              <div class="text-2xl mb-2">⚡</div>
              <div class="font-semibold">功能 3</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">描述文本</div>
            </div>
          </Col>
          <Col :span="6">
            <div class="bg-orange-100 dark:bg-orange-900 p-4 rounded text-center">
              <div class="text-2xl mb-2">🎨</div>
              <div class="font-semibold">功能 4</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">描述文本</div>
            </div>
          </Col>
        </Row>
      </div>
    `,
  }),
}
