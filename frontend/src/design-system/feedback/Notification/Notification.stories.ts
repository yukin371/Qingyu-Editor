/**
 * Notification 组件 Storybook 故事
 */

// @ts-nocheck - Storybook stories with flexible component types
import type { Meta, StoryObj } from '@storybook/vue3'
import { ref, h, onMounted, onUnmounted } from 'vue'
import Notification from './Notification.vue'
import useNotification from './useNotification'

const meta: Meta<typeof Notification> = {
  title: 'Feedback/Notification',
  component: Notification,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['success', 'info', 'warning', 'error'],
      description: '通知类型',
    },
    title: {
      control: 'text',
      description: '通知标题',
    },
    message: {
      control: 'text',
      description: '通知内容',
    },
    duration: {
      control: 'number',
      description: '显示时长（毫秒），0表示不自动关闭',
    },
    position: {
      control: 'select',
      options: ['top-right', 'top-left', 'bottom-right', 'bottom-left'],
      description: '显示位置',
    },
    showClose: {
      control: 'boolean',
      description: '是否显示关闭按钮',
    },
    dangerouslyUseHTMLString: {
      control: 'boolean',
      description: '是否将message作为HTML处理',
    },
  },
}

export default meta
type Story = StoryObj<typeof Notification>

// 1. Default - 基础通知
export const Default: Story = {
  args: {
    message: '这是一条普通的通知消息',
  },
}

// 2. Types - 四种类型
export const Types: Story = {
  render: () => ({
    components: { Notification },
    template: `
      <div class="flex flex-col gap-4">
        <Notification type="success" message="操作成功！" />
        <Notification type="info" message="这是一条信息提示" />
        <Notification type="warning" message="请注意，这是一条警告" />
        <Notification type="error" message="操作失败，请重试" />
      </div>
    `,
  }),
}

// 3. SuccessType - 成功类型
export const SuccessType: Story = {
  args: {
    type: 'success',
    message: '数据保存成功！',
  },
}

// 4. InfoType - 信息类型
export const InfoType: Story = {
  args: {
    type: 'info',
    message: '您有3条新消息',
  },
}

// 5. WarningType - 警告类型
export const WarningType: Story = {
  args: {
    type: 'warning',
    message: '您的账户即将过期',
  },
}

// 6. ErrorType - 错误类型
export const ErrorType: Story = {
  args: {
    type: 'error',
    message: '网络连接失败，请检查网络设置',
  },
}

// 7. WithTitle - 带标题
export const WithTitle: Story = {
  args: {
    type: 'success',
    title: '成功',
    message: '您的更改已成功保存',
  },
}

// 8. AutoClose - 自动关闭
export const AutoClose: Story = {
  args: {
    type: 'info',
    title: '自动关闭',
    message: '这条通知将在3秒后自动关闭',
    duration: 3000,
  },
}

// 9. NoAutoClose - 不自动关闭
export const NoAutoClose: Story = {
  args: {
    type: 'warning',
    title: '手动关闭',
    message: '这条通知不会自动关闭，需要手动点击关闭按钮',
    duration: 0,
  },
}

// 10. CustomIcon - 自定义图标
export const CustomIcon: Story = {
  args: {
    type: 'info',
    title: '自定义图标',
    message: '这条通知使用了自定义图标',
    customIcon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 flex-shrink-0 text-purple-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" /></svg>',
  },
}

// 11. HTMLMessage - HTML 内容
export const HTMLMessage: Story = {
  args: {
    type: 'info',
    title: 'HTML 内容',
    message: '<strong>重要提示：</strong>请仔细阅读 <a href="#" class="underline">服务条款</a>',
    dangerouslyUseHTMLString: true,
  },
}

// 12. WithoutCloseButton - 无关闭按钮
export const WithoutCloseButton: Story = {
  args: {
    type: 'success',
    message: '这条通知没有关闭按钮',
    showClose: false,
    duration: 2000,
  },
}

// 13. LongMessage - 长消息
export const LongMessage: Story = {
  args: {
    type: 'info',
    title: '系统公告',
    message: '这是一条很长的通知消息，用于测试组件在处理长文本时的表现。通知组件应该能够正确地显示长文本内容，并在需要时自动换行，确保所有内容都能够清晰地展示给用户。同时，组件的布局和样式也应该保持美观和一致。',
  },
}

// 14. Multiple - 多条通知演示
export const Multiple: Story = {
  render: () => ({
    components: { Notification },
    setup() {
      const showMultiple = () => {
        useNotification().success('第一条通知')
        setTimeout(() => {
          useNotification().info('第二条通知')
        }, 500)
        setTimeout(() => {
          useNotification().warning('第三条通知')
        }, 1000)
        setTimeout(() => {
          useNotification().error('第四条通知')
        }, 1500)
      }
      return { showMultiple }
    },
    template: `
      <div>
        <button
          @click="showMultiple"
          class="px-4 py-2 bg-info-500 text-white rounded hover:bg-info-600 transition-colors"
        >
          显示多条通知
        </button>
      </div>
    `,
  }),
}

// 15. GlobalCall - 全局调用
export const GlobalCall: Story = {
  render: () => ({
    setup() {
      const notification = useNotification()

      const showSuccess = () => {
        notification.success('操作成功！')
      }

      const showInfo = () => {
        notification.info('这是一条信息提示')
      }

      const showWarning = () => {
        notification.warning('请注意，这是一条警告')
      }

      const showError = () => {
        notification.error('操作失败，请重试')
      }

      const showWithTitle = () => {
        notification({
          type: 'success',
          title: '成功',
          message: '您的更改已成功保存',
          duration: 3000,
        })
      }

      const showWithClose = () => {
        const instance = notification.info('点击下方按钮关闭我')
        setTimeout(() => {
          instance.close()
        }, 2000)
      }

      return {
        showSuccess,
        showInfo,
        showWarning,
        showError,
        showWithTitle,
        showWithClose,
      }
    },
    template: `
      <div class="flex flex-wrap gap-2">
        <button
          @click="showSuccess"
          class="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
        >
          成功通知
        </button>
        <button
          @click="showInfo"
          class="px-4 py-2 bg-info-500 text-white rounded hover:bg-info-600 transition-colors"
        >
          信息通知
        </button>
        <button
          @click="showWarning"
          class="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
        >
          警告通知
        </button>
        <button
          @click="showError"
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          错误通知
        </button>
        <button
          @click="showWithTitle"
          class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          带标题通知
        </button>
        <button
          @click="showWithClose"
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          自动关闭演示
        </button>
      </div>
    `,
  }),
}

// 16. ClickEvent - 点击事件
export const ClickEvent: Story = {
  render: () => ({
    setup() {
      const notification = useNotification()

      const showClickable = () => {
        notification({
          type: 'info',
          title: '可点击的通知',
          message: '点击我触发回调',
          onClick: () => {
            alert('通知被点击了！')
          },
        })
      }

      return { showClickable }
    },
    template: `
      <div>
        <button
          @click="showClickable"
          class="px-4 py-2 bg-info-500 text-white rounded hover:bg-info-600 transition-colors"
        >
          显示可点击通知
        </button>
      </div>
    `,
  }),
}

// 17. CloseEvent - 关闭事件
export const CloseEvent: Story = {
  render: () => ({
    setup() {
      const notification = useNotification()

      const showWithCloseEvent = () => {
        notification({
          type: 'warning',
          message: '关闭我时会在控制台输出日志',
          onClose: () => {
            console.log('通知已关闭')
          },
        })
      }

      return { showWithCloseEvent }
    },
    template: `
      <div>
        <button
          @click="showWithCloseEvent"
          class="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
        >
          显示带关闭回调的通知
        </button>
      </div>
    `,
  }),
}

// 18. Config - 全局配置
export const Config: Story = {
  render: () => ({
    setup() {
      const notification = useNotification()

      const configureAndShow = () => {
        notification.config({
          position: 'top-left',
          duration: 2000,
          maxCount: 3,
        })
        notification.success('全局配置已更新')
        notification.info('位置：左上角，时长：2秒，最大数量：3')
      }

      const resetConfig = () => {
        notification.config({
          position: 'top-right',
          duration: 4500,
          maxCount: 0,
        })
        notification.info('配置已重置为默认值')
      }

      return { configureAndShow, resetConfig }
    },
    template: `
      <div class="flex gap-2">
        <button
          @click="configureAndShow"
          class="px-4 py-2 bg-info-500 text-white rounded hover:bg-info-600 transition-colors"
        >
          应用自定义配置
        </button>
        <button
          @click="resetConfig"
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          重置配置
        </button>
      </div>
    `,
  }),
}

// 19. CloseAll - 关闭所有
export const CloseAll: Story = {
  render: () => ({
    setup() {
      const notification = useNotification()

      const showMultiple = () => {
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            notification.info(`通知 ${i + 1}`)
          }, i * 200)
        }
      }

      const closeAll = () => {
        notification.closeAll()
      }

      return { showMultiple, closeAll }
    },
    template: `
      <div class="flex gap-2">
        <button
          @click="showMultiple"
          class="px-4 py-2 bg-info-500 text-white rounded hover:bg-info-600 transition-colors"
        >
          显示5条通知
        </button>
        <button
          @click="closeAll"
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          关闭所有通知
        </button>
      </div>
    `,
  }),
}

// 20. DarkMode - 深色模式
export const DarkMode: Story = {
  render: () => ({
    components: { Notification },
    template: `
      <div class="dark bg-gray-900 p-8">
        <div class="flex flex-col gap-4">
          <Notification type="success" title="成功" message="深色模式下的成功通知" />
          <Notification type="info" title="信息" message="深色模式下的信息通知" />
          <Notification type="warning" title="警告" message="深色模式下的警告通知" />
          <Notification type="error" title="错误" message="深色模式下的错误通知" />
        </div>
      </div>
    `,
  }),
}
