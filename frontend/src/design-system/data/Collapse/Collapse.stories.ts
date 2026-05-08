/**
 * Collapse 组件 Storybook 故事
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import Collapse from './Collapse.vue'
import CollapseItem from './CollapseItem.vue'

const meta = {
  title: 'Base/Collapse',
  component: Collapse,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'object',
      description: 'v-model 绑定值（激活的面板）',
    },
    accordion: {
      control: 'boolean',
      description: '手风琴模式（只能展开一个）',
    },
  },
  args: {
    modelValue: [],
    accordion: false,
  },
} satisfies Meta<typeof Collapse>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 基本用法
 */
export const Default: Story = {
  args: {
    modelValue: [],
    accordion: false,
  },
  render: (args) => ({
    components: { Collapse, CollapseItem },
    setup() {
      return { args }
    },
    template: `
      <Collapse v-bind="args" class="max-w-2xl">
        <CollapseItem name="1" title="面板 1">
          这是面板 1 的内容。可以包含任何内容，如文本、图片、表单等。
        </CollapseItem>
        <CollapseItem name="2" title="面板 2">
          这是面板 2 的内容。点击标题可以展开或收起面板。
        </CollapseItem>
        <CollapseItem name="3" title="面板 3">
          这是面板 3 的内容。支持多个面板同时展开。
        </CollapseItem>
      </Collapse>
    `,
  }),
}

/**
 * 手风琴模式
 */
export const Accordion: Story = {
  args: {
    modelValue: ['1'],
    accordion: true,
  },
  render: (args) => ({
    components: { Collapse, CollapseItem },
    setup() {
      return { args }
    },
    template: `
      <div class="space-y-4">
        <div class="text-sm text-slate-600 dark:text-slate-400">
          手风琴模式下，只能展开一个面板
        </div>
        <Collapse v-bind="args" class="max-w-2xl">
          <CollapseItem name="1" title="第一章：简介">
            <div class="space-y-2">
              <p>这是第一章的内容。</p>
              <p>在手风琴模式下，展开一个面板会自动收起其他面板。</p>
            </div>
          </CollapseItem>
          <CollapseItem name="2" title="第二章：基础概念">
            <div class="space-y-2">
              <p>这是第二章的内容。</p>
              <p>适用于需要逐步展示信息的场景。</p>
            </div>
          </CollapseItem>
          <CollapseItem name="3" title="第三章：高级用法">
            <div class="space-y-2">
              <p>这是第三章的内容。</p>
              <p>可以配合 v-model 实现双向绑定。</p>
            </div>
          </CollapseItem>
        </Collapse>
      </div>
    `,
  }),
}

/**
 * 禁用状态
 */
export const Disabled: Story = {
  render: () => ({
    components: { Collapse, CollapseItem },
    template: `
      <Collapse class="max-w-2xl">
        <CollapseItem name="1" title="可展开的面板">
          这个面板可以正常展开和收起。
        </CollapseItem>
        <CollapseItem name="2" title="禁用的面板" :disabled="true">
          这个面板被禁用了，无法点击展开。
        </CollapseItem>
        <CollapseItem name="3" title="另一个可展开的面板">
          这个面板也可以正常展开和收起。
        </CollapseItem>
      </Collapse>
    `,
  }),
}

/**
 * 自定义内容
 */
export const CustomContent: Story = {
  render: () => ({
    components: { Collapse, CollapseItem },
    template: `
      <Collapse class="max-w-2xl">
        <CollapseItem name="1">
          <template #title>
            <div class="flex items-center gap-2">
              <span class="text-lg">📝</span>
              <span>自定义标题</span>
            </div>
          </template>
          <div class="space-y-3">
            <p>这是面板的内容区域，可以放置任何内容。</p>
            <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded">
              代码块、图片、表格等都可以放在这里
            </div>
          </div>
        </CollapseItem>
        <CollapseItem name="2" title="自定义箭头">
          <template #arrow="{ isActive }">
            <span class="text-sm">{{ isActive ? '收起' : '展开' }}</span>
          </template>
          <div>这个面板使用了自定义的箭头插槽。</div>
        </CollapseItem>
      </Collapse>
    `,
  }),
}

/**
 * 多个面板同时展开
 */
export const Multiple: Story = {
  args: {
    modelValue: ['1', '3'],
  },
  render: (args) => ({
    components: { Collapse, CollapseItem },
    setup() {
      return { args }
    },
    template: `
      <div class="space-y-4">
        <div class="text-sm text-slate-600 dark:text-slate-400">
          可以通过 v-model 控制默认展开的面板
        </div>
        <Collapse v-bind="args" class="max-w-2xl">
          <CollapseItem name="1" title="默认展开的面板 1">
            这个面板默认是展开的。
          </CollapseItem>
          <CollapseItem name="2" title="默认收起的面板 2">
            点击标题可以展开这个面板。
          </CollapseItem>
          <CollapseItem name="3" title="默认展开的面板 3">
            这个面板也是默认展开的。
          </CollapseItem>
          <CollapseItem name="4" title="另一个默认收起的面板">
            非手风琴模式下，可以有多个面板同时展开。
          </CollapseItem>
        </Collapse>
      </div>
    `,
  }),
}

/**
 * 富文本内容
 */
export const RichContent: Story = {
  render: () => ({
    components: { Collapse, CollapseItem },
    template: `
      <Collapse class="max-w-2xl">
        <CollapseItem name="1" title="使用场景">
          <div class="space-y-3">
            <h4 class="font-medium text-slate-800 dark:text-slate-200">常见应用场景：</h4>
            <ul class="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
              <li>FAQ 问答列表</li>
              <li>文档章节导航</li>
              <li>设置面板分组</li>
              <li>产品特性展示</li>
            </ul>
          </div>
        </CollapseItem>
        <CollapseItem name="2" title="API 说明">
          <div class="space-y-2">
            <div class="font-mono text-sm bg-slate-100 dark:bg-slate-900 p-2 rounded">
              <div>&lt;Collapse v-model="activeNames" accordion&gt;</div>
              <div class="pl-4">&lt;CollapseItem name="1" title="标题"&gt;</div>
              <div class="pl-8">内容区域</div>
              <div class="pl-4">&lt;/CollapseItem&gt;</div>
              <div>&lt;/Collapse&gt;</div>
            </div>
          </div>
        </CollapseItem>
        <CollapseItem name="3" title="注意事项">
          <div class="space-y-2">
            <p class="text-slate-600 dark:text-slate-400">
              • 确保每个 CollapseItem 有唯一的 name 属性
            </p>
            <p class="text-slate-600 dark:text-slate-400">
              • 手风琴模式下同时只能展开一个面板
            </p>
            <p class="text-slate-600 dark:text-slate-400">
              • 禁用的面板不会响应点击事件
            </p>
          </div>
        </CollapseItem>
      </Collapse>
    `,
  }),
}

/**
 * 所有变体
 */
export const AllVariants: Story = {
  render: () => ({
    components: { Collapse, CollapseItem },
    template: `
      <div class="space-y-8">
        <div>
          <h3 class="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3">基本用法</h3>
          <Collapse class="max-w-2xl">
            <CollapseItem name="1" title="面板 1">内容 1</CollapseItem>
            <CollapseItem name="2" title="面板 2">内容 2</CollapseItem>
            <CollapseItem name="3" title="面板 3">内容 3</CollapseItem>
          </Collapse>
        </div>

        <div>
          <h3 class="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3">手风琴模式</h3>
          <Collapse accordion class="max-w-2xl">
            <CollapseItem name="1" title="第一章">第一章内容</CollapseItem>
            <CollapseItem name="2" title="第二章">第二章内容</CollapseItem>
            <CollapseItem name="3" title="第三章">第三章内容</CollapseItem>
          </Collapse>
        </div>

        <div>
          <h3 class="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3">禁用面板</h3>
          <Collapse class="max-w-2xl">
            <CollapseItem name="1" title="正常面板">正常内容</CollapseItem>
            <CollapseItem name="2" title="禁用面板" :disabled="true">禁用内容</CollapseItem>
            <CollapseItem name="3" title="另一个正常面板">另一个正常内容</CollapseItem>
          </Collapse>
        </div>
      </div>
    `,
  }),
}
