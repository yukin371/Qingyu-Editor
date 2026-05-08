/**
 * Tabs 组件 Storybook 故事
 */

import { ref } from 'vue'

import type { Meta, StoryObj } from '@storybook/vue3'
import Tabs from './Tabs.vue'
import TabPane from './TabPane.vue'

const meta = {
  title: 'Data/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'text',
      description: 'v-model 绑定值（当前激活的标签）',
    },
    type: {
      control: 'select',
      options: ['line', 'card', 'border-card'],
      description: '标签页类型',
    },
    tabPosition: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
      description: '标签页位置',
    },
    stretch: {
      control: 'boolean',
      description: '标签宽度是否自适应',
    },
    closable: {
      control: 'boolean',
      description: '标签是否可关闭',
    },
  },
  args: {
    modelValue: '1',
    type: 'line',
    tabPosition: 'top',
    stretch: false,
    closable: false,
  },
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 基本用法
 */
export const Default: Story = {
  args: {
    modelValue: '1',
    type: 'line',
  },
  render: (args) => ({
    components: { Tabs, TabPane },
    setup() {
      return { args }
    },
    template: `
      <Tabs v-bind="args" class="max-w-2xl">
        <TabPane name="1" label="用户管理">
          <div class="space-y-2">
            <p>用户管理模块，包括用户列表、用户详情、用户权限等功能。</p>
            <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded">
              这里是用户管理的内容区域
            </div>
          </div>
        </TabPane>
        <TabPane name="2" label="角色管理">
          <div class="space-y-2">
            <p>角色管理模块，包括角色列表、角色权限分配等功能。</p>
            <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded">
              这里是角色管理的内容区域
            </div>
          </div>
        </TabPane>
        <TabPane name="3" label="权限管理">
          <div class="space-y-2">
            <p>权限管理模块，包括权限列表、权限配置等功能。</p>
            <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded">
              这里是权限管理的内容区域
            </div>
          </div>
        </TabPane>
      </Tabs>
    `,
  }),
}

/**
 * 卡片类型
 */
export const CardType: Story = {
  args: {
    modelValue: '1',
    type: 'card',
  },
  render: (args) => ({
    components: { Tabs, TabPane },
    setup() {
      return { args }
    },
    template: `
      <div class="space-y-4">
        <div class="text-sm text-slate-600 dark:text-slate-400">
          卡片类型的标签页，标签以卡片形式展示
        </div>
        <Tabs v-bind="args" class="max-w-2xl">
          <TabPane name="1" label="首页">
            <div class="p-4">
              <h3 class="text-lg font-medium mb-2">欢迎来到首页</h3>
              <p class="text-slate-600 dark:text-slate-400">这是首页的内容区域。</p>
            </div>
          </TabPane>
          <TabPane name="2" label="产品">
            <div class="p-4">
              <h3 class="text-lg font-medium mb-2">产品中心</h3>
              <p class="text-slate-600 dark:text-slate-400">这是产品页的内容区域。</p>
            </div>
          </TabPane>
          <TabPane name="3" label="关于">
            <div class="p-4">
              <h3 class="text-lg font-medium mb-2">关于我们</h3>
              <p class="text-slate-600 dark:text-slate-400">这是关于页的内容区域。</p>
            </div>
          </TabPane>
        </Tabs>
      </div>
    `,
  }),
}

/**
 * 边框卡片类型
 */
export const BorderCardType: Story = {
  args: {
    modelValue: '1',
    type: 'border-card',
  },
  render: (args) => ({
    components: { Tabs, TabPane },
    setup() {
      return { args }
    },
    template: `
      <div class="space-y-4">
        <div class="text-sm text-slate-600 dark:text-slate-400">
          边框卡片类型的标签页，整体带有边框
        </div>
        <Tabs v-bind="args" class="max-w-2xl">
          <TabPane name="1" label="基础设置">
            <div class="space-y-3">
              <div>
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300">系统名称</label>
                <input type="text" class="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800" value="Qingyu 管理系统">
              </div>
            </div>
          </TabPane>
          <TabPane name="2" label="安全设置">
            <div class="space-y-3">
              <div>
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300">密码策略</label>
                <select class="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800">
                  <option>中等强度</option>
                  <option>高强度</option>
                </select>
              </div>
            </div>
          </TabPane>
          <TabPane name="3" label="通知设置">
            <div class="space-y-3">
              <label class="flex items-center gap-2">
                <input type="checkbox" class="rounded" checked>
                <span class="text-sm text-slate-700 dark:text-slate-300">启用邮件通知</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="checkbox" class="rounded">
                <span class="text-sm text-slate-700 dark:text-slate-300">启用短信通知</span>
              </label>
            </div>
          </TabPane>
        </Tabs>
      </div>
    `,
  }),
}

/**
 * 标签页位置
 */
export const TabPositions: Story = {
  render: () => ({
    components: { Tabs, TabPane },
    template: `
      <div class="space-y-8">
        <div>
          <h3 class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">顶部位置</h3>
          <Tabs tab-position="top" class="max-w-2xl">
            <TabPane name="1" label="标签 1">内容 1</TabPane>
            <TabPane name="2" label="标签 2">内容 2</TabPane>
            <TabPane name="3" label="标签 3">内容 3</TabPane>
          </Tabs>
        </div>

        <div>
          <h3 class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">右侧位置</h3>
          <Tabs tab-position="right" class="max-w-2xl">
            <TabPane name="1" label="标签 1">内容 1</TabPane>
            <TabPane name="2" label="标签 2">内容 2</TabPane>
            <TabPane name="3" label="标签 3">内容 3</TabPane>
          </Tabs>
        </div>

        <div>
          <h3 class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">底部位置</h3>
          <Tabs tab-position="bottom" class="max-w-2xl">
            <TabPane name="1" label="标签 1">内容 1</TabPane>
            <TabPane name="2" label="标签 2">内容 2</TabPane>
            <TabPane name="3" label="标签 3">内容 3</TabPane>
          </Tabs>
        </div>

        <div>
          <h3 class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">左侧位置</h3>
          <Tabs tab-position="left" class="max-w-2xl">
            <TabPane name="1" label="标签 1">内容 1</TabPane>
            <TabPane name="2" label="标签 2">内容 2</TabPane>
            <TabPane name="3" label="标签 3">内容 3</TabPane>
          </Tabs>
        </div>
      </div>
    `,
  }),
}

/**
 * 自适应宽度
 */
export const Stretch: Story = {
  args: {
    modelValue: '1',
    type: 'line',
    stretch: true,
  },
  render: (args) => ({
    components: { Tabs, TabPane },
    setup() {
      return { args }
    },
    template: `
      <div class="space-y-4">
        <div class="text-sm text-slate-600 dark:text-slate-400">
          标签宽度会自动适应容器宽度
        </div>
        <Tabs v-bind="args" class="max-w-2xl">
          <TabPane name="1" label="短标签">内容 1</TabPane>
          <TabPane name="2" label="这是一个中等长度的标签">内容 2</TabPane>
          <TabPane name="3" label="标签 3">内容 3</TabPane>
          <TabPane name="4" label="4">内容 4</TabPane>
        </Tabs>
      </div>
    `,
  }),
}

/**
 * 可关闭标签
 */
export const Closable: Story = {
  args: {
    modelValue: '1',
    closable: true,
  },
  render: (args) => ({
    components: { Tabs, TabPane },
    setup() {
      return { args }
    },
    template: `
      <div class="space-y-4">
        <div class="text-sm text-slate-600 dark:text-slate-400">
          点击标签上的关闭按钮可以移除标签
        </div>
        <Tabs v-bind="args" class="max-w-2xl">
          <TabPane name="1" label="用户列表">
            用户列表的内容
          </TabPane>
          <TabPane name="2" label="角色列表">
            角色列表的内容
          </TabPane>
          <TabPane name="3" label="权限列表">
            权限列表的内容
          </TabPane>
          <TabPane name="4" label="系统设置" :closable="false">
            系统设置的内容（不可关闭）
          </TabPane>
        </Tabs>
      </div>
    `,
  }),
}

/**
 * 禁用状态
 */
export const Disabled: Story = {
  render: () => ({
    components: { Tabs, TabPane },
    template: `
      <Tabs class="max-w-2xl">
        <TabPane name="1" label="可点击的标签">
          这个标签可以正常点击。
        </TabPane>
        <TabPane name="2" label="禁用的标签" :disabled="true">
          这个标签被禁用了，无法点击。
        </TabPane>
        <TabPane name="3" label="另一个可点击的标签">
          这个标签也可以正常点击。
        </TabPane>
      </Tabs>
    `,
  }),
}

/**
 * 自定义标签
 */
export const CustomLabel: Story = {
  render: () => ({
    components: { Tabs, TabPane },
    template: `
      <Tabs class="max-w-2xl">
        <TabPane name="1">
          <template #label>
            <div class="flex items-center gap-2">
              <span class="text-lg">📝</span>
              <span>待办事项</span>
              <span class="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">3</span>
            </div>
          </template>
          <div class="space-y-2">
            <p>这是待办事项列表。</p>
            <ul class="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
              <li>完成组件开发</li>
              <li>编写单元测试</li>
              <li>更新文档</li>
            </ul>
          </div>
        </TabPane>
        <TabPane name="2">
          <template #label>
            <div class="flex items-center gap-2">
              <span class="text-lg">✅</span>
              <span>已完成</span>
            </div>
          </template>
          <div class="space-y-2">
            <p>这是已完成的任务列表。</p>
            <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded text-green-700 dark:text-green-400">
              所有任务都已完成！
            </div>
          </div>
        </TabPane>
      </Tabs>
    `,
  }),
}

/**
 * 动态标签
 */
export const DynamicTabs: Story = {
  render: () => ({
    components: { Tabs, TabPane },
    setup() {
      const activeTab = ref('1')
      const tabs = ref([
        { name: '1', label: 'Tab 1', content: 'Content 1' },
        { name: '2', label: 'Tab 2', content: 'Content 2' },
        { name: '3', label: 'Tab 3', content: 'Content 3' },
      ])
      let tabIndex = 4

      const addTab = () => {
        const newTab = {
          name: String(tabIndex),
          label: `Tab ${tabIndex}`,
          content: `Content ${tabIndex}`,
        }
        tabs.value.push(newTab)
        activeTab.value = newTab.name
        tabIndex++
      }

      const removeTab = (targetName: string) => {
        const tabsList = tabs.value
        let activeName = activeTab.value
        if (activeName === targetName) {
          tabsList.forEach((tab, index) => {
            if (tab.name === targetName) {
              const nextTab = tabsList[index + 1] || tabsList[index - 1]
              if (nextTab) {
                activeName = nextTab.name
              }
            }
          })
        }
        activeTab.value = activeName
        tabs.value = tabsList.filter((tab) => tab.name !== targetName)
      }

      return { activeTab, tabs, addTab, removeTab }
    },
    template: `
      <div class="space-y-4">
        <div class="flex gap-2">
          <button @click="addTab" class="px-4 py-2 bg-secondary-500 text-white rounded hover:bg-secondary-600">
            添加标签
          </button>
        </div>
        <Tabs v-model="activeTab" closable class="max-w-2xl">
          <TabPane
            v-for="tab in tabs"
            :key="tab.name"
            :name="tab.name"
            :label="tab.label"
          >
            {{ tab.content }}
          </TabPane>
        </Tabs>
        <div class="text-sm text-slate-600 dark:text-slate-400">
          当前激活的标签: {{ activeTab }}
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
    components: { Tabs, TabPane },
    template: `
      <div class="space-y-8">
        <div>
          <h3 class="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3">基本用法（Line 类型）</h3>
          <Tabs class="max-w-2xl">
            <TabPane name="1" label="标签 1">内容 1</TabPane>
            <TabPane name="2" label="标签 2">内容 2</TabPane>
            <TabPane name="3" label="标签 3">内容 3</TabPane>
          </Tabs>
        </div>

        <div>
          <h3 class="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3">卡片类型</h3>
          <Tabs type="card" class="max-w-2xl">
            <TabPane name="1" label="首页">首页内容</TabPane>
            <TabPane name="2" label="产品">产品内容</TabPane>
            <TabPane name="3" label="关于">关于内容</TabPane>
          </Tabs>
        </div>

        <div>
          <h3 class="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3">边框卡片类型</h3>
          <Tabs type="border-card" class="max-w-2xl">
            <TabPane name="1" label="基础设置">基础设置内容</TabPane>
            <TabPane name="2" label="安全设置">安全设置内容</TabPane>
            <TabPane name="3" label="通知设置">通知设置内容</TabPane>
          </Tabs>
        </div>

        <div>
          <h3 class="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3">可关闭标签</h3>
          <Tabs closable class="max-w-2xl">
            <TabPane name="1" label="标签 1">内容 1</TabPane>
            <TabPane name="2" label="标签 2">内容 2</TabPane>
            <TabPane name="3" label="标签 3">内容 3</TabPane>
          </Tabs>
        </div>

        <div>
          <h3 class="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3">禁用标签</h3>
          <Tabs class="max-w-2xl">
            <TabPane name="1" label="正常标签">正常内容</TabPane>
            <TabPane name="2" label="禁用标签" :disabled="true">禁用内容</TabPane>
            <TabPane name="3" label="另一个正常标签">另一个正常内容</TabPane>
          </Tabs>
        </div>

        <div>
          <h3 class="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3">自适应宽度</h3>
          <Tabs stretch class="max-w-2xl">
            <TabPane name="1" label="短">内容 1</TabPane>
            <TabPane name="2" label="中等长度">内容 2</TabPane>
            <TabPane name="3" label="标签 3">内容 3</TabPane>
            <TabPane name="4" label="4">内容 4</TabPane>
          </Tabs>
        </div>
      </div>
    `,
  }),
}
