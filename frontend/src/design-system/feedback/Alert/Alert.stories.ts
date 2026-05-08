import type { Meta, StoryObj } from '@storybook/vue3'
import Alert from './Alert.vue'

/**
 * Alert 组件 Storybook 故事
 *
 * 展示所有类型、变体和功能
 */

import { ref } from 'vue'

const meta = {
  title: 'Design System/Feedback/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['success', 'info', 'warning', 'error'],
      description: 'Alert 类型',
    },
    closable: {
      control: 'boolean',
      description: '是否可关闭',
    },
    showIcon: {
      control: 'boolean',
      description: '是否显示图标',
    },
    center: {
      control: 'boolean',
      description: '文字是否居中',
    },
    effect: {
      control: 'select',
      options: ['light', 'dark'],
      description: '主题',
    },
  },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

// 默认故事
export const Default: Story = {
  args: {
    type: 'info',
    description: '这是一条信息提示',
  },
  render: (args) => ({
    components: { Alert },
    setup() {
      return { args }
    },
    template: '<Alert v-bind="args" />',
  }),
}

// 四种类型
export const Types: Story = {
  render: () => ({
    components: { Alert },
    template: `
      <div class="space-y-4 p-8">
        <Alert type="success" description="成功提示的文案" />
        <Alert type="info" description="消息提示的文案" />
        <Alert type="warning" description="警告提示的文案" />
        <Alert type="error" description="错误提示的文案" />
      </div>
    `,
  }),
}

// 可关闭
export const Closable: Story = {
  render: () => ({
    components: { Alert },
    template: `
      <div class="space-y-4 p-8">
        <Alert type="success" :closable="true" description="成功提示的文案" />
        <Alert type="info" :closable="true" description="消息提示的文案" />
        <Alert type="warning" :closable="true" description="警告提示的文案" />
        <Alert type="error" :closable="true" description="错误提示的文案" />
      </div>
    `,
  }),
}

// 带图标
export const WithIcon: Story = {
  render: () => ({
    components: { Alert },
    template: `
      <div class="space-y-4 p-8">
        <Alert type="success" :show-icon="true" description="成功提示的文案" />
        <Alert type="info" :show-icon="true" description="消息提示的文案" />
        <Alert type="warning" :show-icon="true" description="警告提示的文案" />
        <Alert type="error" :show-icon="true" description="错误提示的文案" />
      </div>
    `,
  }),
}

// 隐藏图标
export const WithoutIcon: Story = {
  render: () => ({
    components: { Alert },
    template: `
      <div class="space-y-4 p-8">
        <Alert type="success" :show-icon="false" description="成功提示的文案（无图标）" />
        <Alert type="info" :show-icon="false" description="消息提示的文案（无图标）" />
        <Alert type="warning" :show-icon="false" description="警告提示的文案（无图标）" />
        <Alert type="error" :show-icon="false" description="错误提示的文案（无图标）" />
      </div>
    `,
  }),
}

// 带标题
export const WithTitle: Story = {
  render: () => ({
    components: { Alert },
    template: `
      <div class="space-y-4 p-8">
        <Alert
          type="success"
          title="成功提示标题"
          description="成功提示的辅助文字"
        />
        <Alert
          type="info"
          title="消息提示标题"
          description="消息提示的辅助文字"
        />
        <Alert
          type="warning"
          title="警告提示标题"
          description="警告提示的辅助文字"
        />
        <Alert
          type="error"
          title="错误提示标题"
          description="错误提示的辅助文字"
        />
      </div>
    `,
  }),
}

// 居中显示
export const Centered: Story = {
  render: () => ({
    components: { Alert },
    template: `
      <div class="space-y-4 p-8">
        <Alert
          type="success"
          title="成功提示标题"
          description="成功提示的辅助文字"
          :center="true"
        />
        <Alert
          type="warning"
          title="警告提示标题"
          description="警告提示的辅助文字"
          :center="true"
          :closable="true"
        />
      </div>
    `,
  }),
}

// 暗色主题
export const Dark: Story = {
  render: () => ({
    components: { Alert },
    template: `
      <div class="bg-slate-900 p-8 space-y-4">
        <h3 class="text-lg font-semibold text-white mb-4">暗色主题</h3>
        <Alert type="success" description="成功提示的文案" />
        <Alert type="info" description="消息提示的文案" />
        <Alert type="warning" description="警告提示的文案" />
        <Alert type="error" description="错误提示的文案" />
      </div>
    `,
  }),
}

// 自定义内容
export const CustomContent: Story = {
  render: () => ({
    components: { Alert },
    template: `
      <div class="space-y-4 p-8">
        <Alert type="info" :show-icon="false">
          <template #title>
            <span class="flex items-center gap-2">
              自定义标题
              <span class="text-xs bg-secondary-100 text-secondary-800 px-2 py-0.5 rounded">New</span>
            </span>
          </template>
          <template #default>
            <div class="space-y-2">
              <p>这是自定义的描述内容</p>
              <a href="#" class="text-secondary-600 hover:underline">了解更多</a>
            </div>
          </template>
        </Alert>

        <Alert type="success" title="带链接的成功提示">
          操作成功！<a href="#" class="underline font-semibold">查看详情</a>
        </Alert>

        <Alert type="warning" :closable="true">
          <template #default>
            <div class="flex items-center gap-3">
              <span>警告：此操作可能会影响其他用户</span>
              <button class="px-3 py-1 bg-amber-600 text-white rounded text-sm hover:bg-amber-700">
                确认
              </button>
            </div>
          </template>
        </Alert>
      </div>
    `,
  }),
}

// 交互式
export const Interactive: Story = {
  render: () => ({
    components: { Alert },
    setup() {
      const alerts = ref([
        { id: 1, type: 'success', title: '成功', description: '操作已完成' },
        { id: 2, type: 'info', title: '信息', description: '您有新消息' },
        { id: 3, type: 'warning', title: '警告', description: '请注意检查' },
        { id: 4, type: 'error', title: '错误', description: '操作失败' },
      ])

      const handleClose = (id: number) => {
        alerts.value = alerts.value.filter(a => a.id !== id)
      }

      const handleAfterClose = () => {
        console.log('Alert closed')
      }

      return { alerts, handleClose, handleAfterClose }
    },
    template: `
      <div class="p-8 space-y-4">
        <h3 class="text-lg font-semibold mb-4">点击关闭按钮体验交互效果</h3>
        <div class="space-y-4">
          <Alert
            v-for="alert in alerts"
            :key="alert.id"
            :type="alert.type"
            :title="alert.title"
            :description="alert.description"
            :closable="true"
            @close="handleClose(alert.id)"
            @after-close="handleAfterClose"
          />
        </div>
        <div v-if="alerts.length === 0" class="text-slate-500">
          所有提示都已关闭
        </div>
      </div>
    `,
  }),
}

// 实际应用场景
export const RealWorldUsage: Story = {
  render: () => ({
    components: { Alert },
    template: `
      <div class="p-8 space-y-6">
        <!-- 表单提交成功 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">表单提交</h3>
          <Alert type="success" :closable="true" :show-icon="true">
            您的更改已成功保存！
          </Alert>
        </div>

        <!-- 系统通知 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">系统通知</h3>
          <Alert type="info" title="系统维护通知" :closable="true">
            系统将于今晚 22:00 - 24:00 进行维护，请提前保存您的工作。
          </Alert>
        </div>

        <!-- 数据校验错误 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">表单校验</h3>
          <Alert type="error" title="提交失败" :closable="true">
            <ul class="list-disc list-inside space-y-1">
              <li>用户名不能为空</li>
              <li>邮箱格式不正确</li>
              <li>密码长度至少为 8 位</li>
            </ul>
          </Alert>
        </div>

        <!-- 操作确认 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">操作确认</h3>
          <Alert type="warning" title="删除确认" :closable="true">
            此操作不可恢复，请确认是否继续删除该文件？
          </Alert>
        </div>

        <!-- 重要提示 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">重要提示</h3>
          <Alert type="warning" :center="true" :closable="true">
            您的账户余额不足，请及时充值以避免服务中断。
          </Alert>
        </div>
      </div>
    `,
  }),
}

// 长文本内容
export const LongText: Story = {
  render: () => ({
    components: { Alert },
    template: `
      <div class="space-y-4 p-8">
        <Alert
          type="info"
          title="详细说明"
          description="这是一段很长的描述文本，用来测试 Alert 组件在处理长文本时的显示效果。Alert 组件应该能够正确地换行和展示这些内容，确保用户能够完整地阅读所有信息。"
        />
        <Alert
          type="warning"
          title="多行文本示例"
          :closable="true"
        >
          <div class="space-y-2">
            <p>第一行：这是第一段描述文字</p>
            <p>第二行：这是第二段描述文字</p>
            <p>第三行：这是第三段描述文字，可以包含更多的内容和说明。</p>
          </div>
        </Alert>
        <Alert
          type="success"
          title="带列表的成功提示"
          :show-icon="true"
        >
          <ul class="list-disc list-inside space-y-1">
            <li>任务 1 已完成</li>
            <li>任务 2 已完成</li>
            <li>任务 3 已完成</li>
            <li>所有任务都已成功处理</li>
          </ul>
        </Alert>
      </div>
    `,
  }),
}
