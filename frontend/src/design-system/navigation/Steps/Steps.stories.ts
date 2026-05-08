import type { Meta, StoryObj } from '@storybook/vue3'
import { Steps, Step } from './index'

/**
 * Steps 组件 Storybook 故事
 *
 * 展示步骤条的各种模式和状态
 */

const meta = {
  title: 'Design System/Navigation/Steps',
  component: Steps,
  tags: ['autodocs'],
  argTypes: {
    current: {
      control: 'number',
      description: '当前激活步骤（从 0 开始）',
    },
    direction: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: '步骤条方向',
    },
    alignCenter: {
      control: 'boolean',
      description: '标题居中（仅水平方向）',
    },
    simple: {
      control: 'boolean',
      description: '简洁模式',
    },
    finishStatus: {
      control: 'select',
      options: ['wait', 'process', 'finish', 'error', 'success'],
      description: '完成步骤的状态',
    },
    processStatus: {
      control: 'select',
      options: ['wait', 'process', 'finish', 'error', 'success'],
      description: '当前步骤的状态',
    },
  },
} satisfies Meta<typeof Steps>

export default meta
type Story = StoryObj<typeof meta>

// 图标组件
const CheckIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
    </svg>
  `,
}

const UserIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  `,
}

const DocumentIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  `,
}

const CheckCircleIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  `,
}

const ErrorIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  `,
}

// 1. Default - 基础步骤条
export const Default: Story = {
  render: () => ({
    components: { Steps, Step },
    template: `
      <div class="p-8">
        <Steps :current="1">
          <Step title="步骤1" description="这是第一步的描述" />
          <Step title="步骤2" description="这是第二步的描述" />
          <Step title="步骤3" description="这是第三步的描述" />
        </Steps>
      </div>
    `,
  }),
}

// 2. WithIcon - 带图标
export const WithIcon: Story = {
  render: () => ({
    components: { Steps, Step, UserIcon, DocumentIcon, CheckCircleIcon },
    template: `
      <div class="p-8">
        <Steps :current="1">
          <Step title="注册账号">
            <template #icon>
              <UserIcon />
            </template>
            <template #description>创建您的账号</template>
          </Step>
          <Step title="填写信息">
            <template #icon>
              <DocumentIcon />
            </template>
            <template #description>完善个人信息</template>
          </Step>
          <Step title="完成注册">
            <template #icon>
              <CheckCircleIcon />
            </template>
            <template #description>注册成功</template>
          </Step>
        </Steps>
      </div>
    `,
  }),
}

// 3. WithDescription - 带描述
export const WithDescription: Story = {
  render: () => ({
    components: { Steps, Step },
    template: `
      <div class="p-8">
        <Steps :current="2">
          <Step
            title="账户设置"
            description="设置您的账户名称和密码"
          />
          <Step
            title="个人信息"
            description="填写您的基本信息和联系方式"
          />
          <Step
            title="验证邮箱"
            description="验证您的邮箱地址以激活账户"
          />
          <Step
            title="完成注册"
            description="恭喜您，注册完成！"
          />
        </Steps>
      </div>
    `,
  }),
}

// 4. Vertical - 垂直方向
export const Vertical: Story = {
  render: () => ({
    components: { Steps, Step },
    template: `
      <div class="p-8 w-80">
        <Steps direction="vertical" :current="1">
          <Step title="上传文件" description="选择要上传的文件" />
          <Step title="处理中" description="正在处理您的文件" />
          <Step title="完成" description="文件处理完成" />
        </Steps>
      </div>
    `,
  }),
}

// 5. Simple - 简洁模式
export const Simple: Story = {
  render: () => ({
    components: { Steps, Step },
    template: `
      <div class="p-8">
        <Steps simple :current="1">
          <Step title="开始" />
          <Step title="进行中" />
          <Step title="完成" />
        </Steps>
      </div>
    `,
  }),
}

// 6. ErrorStatus - 错误状态
export const ErrorStatus: Story = {
  render: () => ({
    components: { Steps, Step, ErrorIcon },
    template: `
      <div class="p-8">
        <Steps :current="2">
          <Step title="步骤1" status="finish" />
          <Step title="步骤2" status="error">
            <template #icon>
              <ErrorIcon />
            </template>
            <template #description>出错了，请重试</template>
          </Step>
          <Step title="步骤3" />
        </Steps>
      </div>
    `,
  }),
}

// 7. CustomStyle - 自定义样式
export const CustomStyle: Story = {
  render: () => ({
    components: { Steps, Step },
    template: `
      <div class="p-8 bg-slate-50 dark:bg-slate-900">
        <Steps :current="1" class="custom-steps">
          <Step title="第一步" description="自定义样式的第一步" />
          <Step title="第二步" description="自定义样式的第二步" />
          <Step title="第三步" description="自定义样式的第三步" />
        </Steps>
      </div>
    `,
  }),
}

// 8. Clickable - 可点击步骤
export const Clickable: Story = {
  render: () => ({
    components: { Steps, Step },
    setup() {
      const currentStep = 1
      const handleChange = (current: number) => {
        console.log('Step changed to:', current)
      }
      return { currentStep, handleChange }
    },
    template: `
      <div class="p-8">
        <Steps :current="currentStep" @change="handleChange">
          <Step title="账号信息" description="填写您的账号信息" />
          <Step title="基本信息" description="填写您的基本信息" />
          <Step title="完成注册" description="完成注册流程" />
        </Steps>
        <p class="mt-4 text-sm text-slate-500">点击任意步骤进行跳转</p>
      </div>
    `,
  }),
}

// 9. ProgressDot - 进度点模式
export const ProgressDot: Story = {
  render: () => ({
    components: { Steps, Step },
    template: `
      <div class="p-8">
        <Steps simple :current="2">
          <Step title="开始" />
          <Step title="上传" />
          <Step title="处理" />
          <Step title="完成" />
          <Step title="结束" />
        </Steps>
      </div>
    `,
  }),
}

// 10. Dynamic - 动态变化
export const Dynamic: Story = {
  render: () => ({
    components: { Steps, Step },
    setup() {
      const currentStep = 0
      return { currentStep }
    },
    template: `
      <div class="p-8">
        <Steps :current="currentStep">
          <Step title="第一步" description="这是第一步" />
          <Step title="第二步" description="这是第二步" />
          <Step title="第三步" description="这是第三步" />
          <Step title="第四步" description="这是第四步" />
        </Steps>
        <div class="mt-8 space-x-2">
          <button @click="currentStep = 0" class="px-4 py-2 bg-slate-200 rounded">步骤 1</button>
          <button @click="currentStep = 1" class="px-4 py-2 bg-slate-200 rounded">步骤 2</button>
          <button @click="currentStep = 2" class="px-4 py-2 bg-slate-200 rounded">步骤 3</button>
          <button @click="currentStep = 3" class="px-4 py-2 bg-slate-200 rounded">步骤 4</button>
        </div>
      </div>
    `,
  }),
}

// 11. AlignCenter - 居中对齐
export const AlignCenter: Story = {
  render: () => ({
    components: { Steps, Step },
    template: `
      <div class="p-8">
        <Steps align-center :current="1">
          <Step title="开始" description="开始流程" />
          <Step title="进行中" description="正在处理" />
          <Step title="完成" description="流程结束" />
        </Steps>
      </div>
    `,
  }),
}

// 12. VerticalWithIcon - 垂直带图标
export const VerticalWithIcon: Story = {
  render: () => ({
    components: { Steps, Step, UserIcon, DocumentIcon, CheckIcon },
    template: `
      <div class="p-8 w-80">
        <Steps direction="vertical" :current="1">
          <Step title="账号注册">
            <template #icon><UserIcon /></template>
            <template #description>注册新账号</template>
          </Step>
          <Step title="填写资料">
            <template #icon><DocumentIcon /></template>
            <template #description>完善个人信息</template>
          </Step>
          <Step title="完成">
            <template #icon><CheckIcon /></template>
            <template #description>注册成功</template>
          </Step>
        </Steps>
      </div>
    `,
  }),
}

// 13. SuccessStatus - 成功状态
export const SuccessStatus: Story = {
  render: () => ({
    components: { Steps, Step, CheckCircleIcon },
    template: `
      <div class="p-8">
        <Steps :current="3">
          <Step title="步骤1" status="finish" />
          <Step title="步骤2" status="finish" />
          <Step title="步骤3" status="finish" />
          <Step title="完成" status="success">
            <template #icon>
              <CheckCircleIcon />
            </template>
          </Step>
        </Steps>
      </div>
    `,
  }),
}

// 14. LongSteps - 长步骤条
export const LongSteps: Story = {
  render: () => ({
    components: { Steps, Step },
    template: `
      <div class="p-8">
        <Steps simple :current="2">
          <Step title="开始" />
          <Step title="步骤1" />
          <Step title="步骤2" />
          <Step title="步骤3" />
          <Step title="步骤4" />
          <Step title="步骤5" />
          <Step title="完成" />
        </Steps>
      </div>
    `,
  }),
}

// 15. VerticalSimple - 垂直简洁模式
export const VerticalSimple: Story = {
  render: () => ({
    components: { Steps, Step },
    template: `
      <div class="p-8 w-64">
        <Steps direction="vertical" simple :current="1">
          <Step title="开始" />
          <Step title="处理中" />
          <Step title="完成" />
        </Steps>
      </div>
    `,
  }),
}
